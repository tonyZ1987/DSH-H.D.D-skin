// fairy-dsh-skin · host half
// ---------------------------------------------------------------
// 只做两件事：
//   1. 从 DSH 的会话事件流里算出一个「它现在在干嘛」的状态
//      （idle / thinking / working / done / error）；
//   2. 把这个状态用 /fairy-skin/state.json 暴露给客户端半边。
//
// 设计约束（和 dsh-bridge 一致）：
//   · 不 import 任何 @deepseek-ai/* 包 —— DSH 升级换版本，这个文件照常能加载；
//   · 任何异常都吞掉 —— 皮肤坏了可以，绝不能影响 DSH 本体；
//   · 只读，不写任何文件，不碰凭据，不发起对外请求。
// ---------------------------------------------------------------
export const name = 'fairy-skin'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROUTE_STATE = '/fairy-skin/state.json'
const ROUTE_HEALTH = '/fairy-skin/health'
const ROUTE_DEBUG = '/fairy-skin/debug'
const DEBUG_FILE = path.join(os.homedir(), '.dsh', 'fairy-skin-debug.log')

const DONE_HOLD_MS = 5000 // 一轮做完，眼睛「收一下」显示多久
const ERROR_HOLD_MS = 6500 // 出错后故障态保留多久
const IDLE_AFTER_MS = 120000 // 事件断了这么久还没收尾 ⇒ 当作没在干活

const s = {
  turnActive: false,
  toolPending: 0,
  toolName: '',
  errorUntil: 0,
  doneUntil: 0,
  lastEventAt: 0,
  lastReason: '',
  wk: '',
  cwd: '',
  wkKeys: '',
  turns: 0,
}

function now() {
  return Date.now()
}

function moodNow() {
  const t = now()
  if (t < s.errorUntil) return 'error'
  if (s.toolPending > 0) return 'working'
  if (s.turnActive) {
    if (s.lastEventAt > 0 && t - s.lastEventAt > IDLE_AFTER_MS) {
      s.turnActive = false
      return 'idle'
    }
    return 'thinking'
  }
  if (t < s.doneUntil) return 'done'
  return 'idle'
}

function isFailureReason(reason) {
  if (!reason) return false
  const kind = String(reason.kind || reason.type || reason || '').toLowerCase()
  return kind.indexOf('error') >= 0 || kind.indexOf('fail') >= 0 || kind.indexOf('abort') >= 0
}

function onSessionEvent(event) {
  try {
    if (!event || typeof event.type !== 'string') return
    const type = event.type
    const data = event.data || {}
    s.lastEventAt = now()

    if (type === 'turn/start') {
      s.turnActive = true
      s.toolPending = 0
      s.doneUntil = 0
      s.turns += 1
      return
    }
    if (type === 'tool/call') {
      s.turnActive = true
      s.toolPending = Math.min(s.toolPending + 1, 8)
      s.toolName = typeof data.name === 'string' ? data.name : ''
      return
    }
    if (type === 'tool/result') {
      s.toolPending = Math.max(0, s.toolPending - 1)
      const failed =
        data.error !== undefined ||
        (data.message && typeof data.message === 'object' && data.message.isError === true)
      if (failed) s.errorUntil = now() + ERROR_HOLD_MS
      return
    }
    if (type === 'assistant/message') {
      s.turnActive = true
      return
    }
    if (type === 'turn/end') {
      s.turnActive = false
      s.toolPending = 0
      const reason = data.reason
      s.lastReason = reason
        ? String((reason && typeof reason === 'object' ? reason.kind || reason.type : reason) || '')
        : ''
      if (isFailureReason(data.reason)) s.errorUntil = now() + ERROR_HOLD_MS
      else s.doneUntil = now() + DONE_HOLD_MS
      return
    }
  } catch {
    // 单条事件解析失败：丢
  }
}

function subscribe(ctx, event, handler) {
  try {
    ctx.on(event, handler)
  } catch {
    // 这个 DSH 版本没有该事件：跳过
  }
}

// 当前会话属于哪个工作区：拿会话对象上的现成字段，拿不到就留空（客户端会自己找）
function noteSessionWorkspace(session) {
  try {
    if (!session || typeof session !== 'object') return
    const str = (v) => (typeof v === 'string' ? v : v && typeof v === 'object' && typeof v.id === 'string' ? v.id : v && typeof v === 'object' && typeof v.path === 'string' ? v.path : '')
    const wk = str(session.workspaceId) || str(session.workspace) || str(session.workspaceKey) || ''
    const cwd = str(session.cwd) || str(session.rootDir) || str(session.dir) || str(session.meta && session.meta.cwd) || str(session.meta && session.meta.workspace) || ''
    if (wk) s.wk = wk
    if (cwd) s.cwd = cwd
    if (!s.wkKeys) {
      try {
        s.wkKeys = Object.keys(session).slice(0, 28).join(',')
      } catch {}
    }
  } catch {}
}

function statePayload() {
  return {
    mood: moodNow(),
    wk: s.wk || '',
    cwd: s.cwd || '',
    wkKeys: s.wkKeys || '',
    turnActive: s.turnActive,
    tool: s.toolName,
    reason: s.lastReason,
    turns: s.turns,
    ts: now(),
    v: 1,
  }
}

function json(res, status, body) {
  try {
    const text = JSON.stringify(body)
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': Buffer.byteLength(text),
    })
    res.end(text)
  } catch {
    try {
      res.destroy()
    } catch {}
  }
}

function registerRoutes(ctx) {
  const webServer = ctx.webServer || (typeof ctx.get === 'function' ? ctx.get('webServer') : null)
  if (!webServer || typeof webServer.register !== 'function') return
  const routes = [
    {
      kind: 'exact',
      path: ROUTE_STATE,
      handler: (req, res) => {
        try {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, { Allow: 'GET, HEAD' })
            res.end()
            return
          }
          json(res, 200, statePayload())
        } catch {
          try {
            res.writeHead(500)
            res.end()
          } catch {}
        }
      },
    },
    {
      kind: 'exact',
      path: ROUTE_HEALTH,
      handler: (req, res) => {
        json(res, 200, { ok: true, name, ...statePayload() })
      },
    },
    {
      // 客户端把 DOM 探针结果发过来，落盘给开发侧读（只本机、只追加）
      kind: 'exact',
      path: ROUTE_DEBUG,
      handler: (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://127.0.0.1')
          const data = url.searchParams.get('d') || ''
          if (data.length > 0 && data.length < 200000) {
            try {
              fs.mkdirSync(path.dirname(DEBUG_FILE), { recursive: true })
              fs.appendFileSync(DEBUG_FILE, new Date().toISOString() + ' ' + data + '\n')
            } catch {}
          }
          json(res, 200, { ok: true })
        } catch {
          try {
            res.writeHead(500)
            res.end()
          } catch {}
        }
      },
    },
  ]
  for (const route of routes) {
    try {
      const dispose = webServer.register(route)
      if (typeof dispose === 'function') {
        try {
          ctx.effect(() => () => dispose())
        } catch {}
      }
    } catch (error) {
      try {
        console.warn('[fairy-skin] route ' + route.path + ' 注册失败：' + String((error && error.message) || error))
      } catch {}
    }
  }
}

export function apply(ctx) {
  try {
    subscribe(ctx, 'session/event', (session, event) => {
      noteSessionWorkspace(session)
      onSessionEvent(event)
    })
    subscribe(ctx, 'session/disposed', () => {
      s.turnActive = false
      s.toolPending = 0
    })
  } catch {
    // 事件订阅失败也继续：至少 health 路由能看见插件活着
  }
  try {
    ctx.inject(['webServer'], (wctx) => registerRoutes(wctx))
  } catch {
    try {
      registerRoutes(ctx)
    } catch {}
  }
}
