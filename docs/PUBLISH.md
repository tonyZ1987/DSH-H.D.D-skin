# 发布清单 · v1.0.0-beta.0

> 状态：本地已就绪，剩「推 GitHub」和「发 npm」两跳。

## 已经做完的

| 项 | 位置 | 说明 |
| --- | --- | --- |
| 仓库初始化 | 本目录 | `git init -b main`，首提交 `feat: Fairy H.D.D skin v1.0.0-beta.0`，tag `v1.0.0-beta.0` |
| npm 元数据 | `package.json` | name / version / keywords / license / engines / `dsh.bundle` + `dsh.client` / publishConfig 齐了 |
| 打包校验 | `npm pack` | 11 个文件、503 KB，无备份、无 `_work`、无 `design` |
| 文档 | `README.md` `CHANGELOG.md` `DESIGN.md` `LICENSE` | README 里的截图走 GitHub raw，图床要求满足 |
| 远端仓库 | github.com/tonyZ1987/DSH-H.D.D-skin | 已用 API 建好（public，main） |

## 还剩两跳

### 1. 推 GitHub

网络能通时执行（**注意**：全局 git 配了 `http.proxy=127.0.0.1:10808`，代理没开会直接失败）：

```powershell
cd E:\AI成图实践\Fairy\dsh-skin
git -c http.proxy= -c https.proxy= push -u origin main --tags
```

通了以后建 release，附上打好的包，多一条「不依赖 npm」的安装路径：

```
资产：fairy-dsh-skin-1.0.0-beta.0.tgz
标题：v1.0.0-beta.0 — Fairy H.D.D skin 首个 beta
说明：docs/RELEASE-v1.0.0-beta.0.md
```

### 2. 发 npm（市场收录的唯一通道）

插件市场的目录 `dsh-plugin-catalog` 目前 **3823 条全是 `source.type: "npm"`**，没有 GitHub 直装通道。所以：

```powershell
npm login
cd E:\AI成图实践\Fairy\dsh-skin
npm publish --tag latest      # 想让用户在「最新」看到就得进 latest
# 只想内测：npm publish --tag beta，但市场卡片默认取 latest，可能不显示
```

发完验证：

```powershell
npm view fairy-dsh-skin version dist.tarball
dsh plugin --profile <profile> add fairy-dsh-skin@1.0.0-beta.0
```

### 3. 目录条目

市场的索引是自动生成的（`dsh-plugin-catalog` 每天出时间戳版本）。如果几小时后没自动出现，按 `docs/catalog-entry.json` 的形状提 PR / issue 到 dsh-market 的目录仓。

## 名字冲突检查

发布前跑一次，确认 `fairy-dsh-skin` 没被别人占：

```powershell
npm view fairy-dsh-skin name    # 报 404 就是没占，可以发
```
