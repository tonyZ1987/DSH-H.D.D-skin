// fairy-dsh-skin · wallpaper helper
// Serves the local ZZZ hollow wallpaper MP4 over 127.0.0.1 so the renderer
// can use it as a <video> source (file:// media is blocked by Electron).
// Read-only; no credentials; binds loopback only.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const FILE = 'E:\\ds-harness\\主题皮肤\\仿绝区零空洞壁纸 ZZZ Hollows-修鸷Xita\\仿绝区零空洞壁纸 ZZZ Hollows-修鸷Xita.mp4'
const PORT = Number(process.env.FAIRY_WALLPAPER_PORT || 9335)
const HOST = '127.0.0.1'

let stat
try {
  stat = fs.statSync(FILE)
} catch (error) {
  console.error('[fairy-wallpaper] missing file:', FILE)
  process.exit(1)
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Range')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')
}

function health(res) {
  cors(res)
  const body = JSON.stringify({ ok: true, file: path.basename(FILE), size: stat.size, ts: Date.now() })
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function serve(req, res) {
  cors(res)
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Type', 'video/mp4')
  res.setHeader('Cache-Control', 'public, max-age=86400')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, OPTIONS' })
    res.end()
    return
  }

  const range = req.headers.range
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim())
    if (!match) {
      res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size })
      res.end()
      return
    }
    let start = match[1] === '' ? null : Number(match[1])
    let end = match[2] === '' ? null : Number(match[2])
    if (start === null && end === null) {
      res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size })
      res.end()
      return
    }
    if (start === null) {
      start = Math.max(0, stat.size - end)
      end = stat.size - 1
    } else if (end === null || end >= stat.size) {
      end = stat.size - 1
    }
    if (start > end || start >= stat.size) {
      res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size })
      res.end()
      return
    }
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
      'Content-Length': end - start + 1,
    })
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    fs.createReadStream(FILE, { start, end }).pipe(res)
    return
  }

  res.writeHead(200, { 'Content-Length': stat.size })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  fs.createReadStream(FILE).pipe(res)
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://' + HOST)
    if (url.pathname === '/health') {
      health(res)
      return
    }
    if (url.pathname === '/wallpaper.mp4') {
      serve(req, res)
      return
    }
    cors(res)
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('not found')
  } catch (error) {
    try {
      res.writeHead(500)
      res.end()
    } catch {}
  }
})

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.log('[fairy-wallpaper] already listening on ' + HOST + ':' + PORT)
    process.exit(0)
  }
  console.error('[fairy-wallpaper] ' + String((error && error.message) || error))
  process.exit(1)
})

server.listen(PORT, HOST, () => {
  console.log('[fairy-wallpaper] http://' + HOST + ':' + PORT + '/wallpaper.mp4')
  console.log('[fairy-wallpaper] size=' + stat.size)
})
