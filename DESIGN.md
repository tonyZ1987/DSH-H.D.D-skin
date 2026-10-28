# DSH 皮肤 · 设计与框架（v2）

> 2026-10-26 · 依据 `E:\ds-harness\主题皮肤\` 的 13 张 ZZZ 截图。
> **当前状态：框架已装进 profile，等重启验收；细节逐项加。**

## 一、这是什么

一个 **DSH 客户端插件**（`dsh.client`），不改宿主任何文件：

```
dsh-skin/
  lib/client.js       客户端：黑白两套 token + 切换按钮 + 小控件兜底
  lib/index.js        宿主：/fairy-skin/health|state.json（给后续状态眼用）
  install.ps1         装：复制 + 两个 profile 文件各留一份字节级原件
  uninstall.ps1       卸：按原件还原（连换行都不改）
  design/             设计稿 + 组件矩阵
```

## 二、黑白两套怎么实现

DSH 的主题 token 全部定义在 `body` 与 `body[data-ds-dark-theme]` 上，共 **101 个 alias**
（外加 `--dsw-specific-*`）。主题服务把值写进 `body.style`（**行内样式**）。

⇒ 皮肤用一张后插入的 `<style>`，以 `!important` 覆盖两套：

```css
body[data-ds-dark-theme]{ --dsw-alias-bg-base:#0a0a0c !important; … }   /* 黑 */
body:not([data-ds-dark-theme]){ --dsw-alias-bg-base:#f3f1ea !important; … } /* 白 */
```

- **不写 JS 判断**，跟着 DSH 自己的深色开关走；切换按钮只是调 `theme.setTheme('light'|'dark')`。
- **不先铺深色底**：早先只改了 14 个 token，结果侧栏暗、正文亮 —— 这次是全量覆盖。

## 三、色板

| 角色 | 黑底 | 白底 | 用在哪 |
|---|---|---|---|
| 底 | `#0A0A0C` | `#FFFFFF`（DSH 原厂白） | 整窗 |
| 面板 | `#101013` | `#FFFFFF` / 侧栏 `#F9FAFB` | 卡片、侧栏 |
| 主色 | `#F5DE4A` 酸黄 | `#111112` 黑 | 主按钮、页签、焦点 |
| 次色 | `#B7E43C` 青柠 | `#A9D62F` | 进行中 / 完成 |
| 主文字 | `#F4F4F5` | `#111112` | |
| 次文字 | `#8C8C94` | `#6E6E75` | |
| 危险 | `#FF6A5C` | `#C4331F` | 失败 / 删除 |
| 我的气泡 | `#3753E0`（照参考图取样 55,83,224） | 同左 | 我的消息；文字恒白，右上挑尾巴 |
| 系统气泡 | `#E6E6E6`（=10% 黑）底 / `#333333`（=80% 黑）字 | 同左 | 助手文本消息；代码块另给深底 `#15151A` |
| 代码块 | `#0C0C0F` | `#EFECE3` | 跟随主题 |

> 白底走 DSH 原厂中性色（不是奶白），只把**主按钮**换成酸黄；黑底的酸黄则用于主按钮 + 选中。
> 眼徽＝品牌位按钮（HDD 旁边），点一下切黑/白；完整三档在 设置 → Fairy。

## 四、小控件覆盖清单（不许漏）

| 控件 | 归属 | 做法 |
|---|---|---|
| 下拉箭头（原生 select） | CSS | `appearance:none` + 自绘 SVG 细勾（黑白两套色） |
| 权限 chip 的盾牌+叹号 | DSH 组件 | 图标吃 `currentColor` → 由 `label-*` token 控制；底色走 `button-*` |
| 模型 chip 的数字徽章 1017 | DSH 组件 | 走 `state-business-*` / `bg-layer-3` |
| 圆形图标按钮 | DSH 组件 | 走 `button-floating-*`、`interactive-bg-*` |
| 开关 | DSH 组件 | `switch-thumb` + `state-success-*` |
| 复选框 / 单选 / 滑块 | 原生 | `accent-color` 统一成主色 |
| 页签 / 分段 | DSH 组件 | `brand-primary`（选中）+ `label-primary-foreground`（字） |
| 菜单 / 浮层 | DSH 组件 | `specific-menu`、`bg-overlay`、`menu-group-header-fill` |
| 提示 / 键盘键 | DSH 组件 | `tooltip-bg`、`tooltip-key-bg` |
| Toast | DSH 组件 | `toast-bg` / `toast-label` |
| 代码块 / 行内码 | DSH 组件 | `markdown-code-block*`，等宽字体单独钉 |
| 表格 / 引用 / 分割线 | DSH 组件 | `border-l*`、`label-secondary` |
| 滚动条 | CSS | `scrollbar-bg/hover-l1/l2` |
| 选中文字 | CSS | `::selection` = 主色 32% |
| 焦点环 | CSS | `:focus-visible` 2px 主色（含键盘可达） |
| 禁用态 | DSH 组件 | `label-dimmed` / `button-primary-dimmed` |
| 差异块（增/删） | DSH 组件 | `code-diff-*`、`file-diff-*` |
| 骨架屏 | DSH 组件 | `bg-skeleton` |
| 状态点 | DSH 组件 | `state-success / warn / error / idle` |

## 五、设计稿

| 文件 | 内容 |
|---|---|
| `design/design-01-main.png` | 黑底整窗 |
| `design/design-02-kit.png` | 黑底色板 / 组件 / 状态眼 |
| `design/design-03-light.png` | 白底整窗 |
| `design/design-04-controls.png` | 小控件矩阵（黑白并排） |

## 六、进度（2026-10-26 19:4x）

- ✅ 文字对比：实测发现「完全权限 / 模型名 / High 太暗」⇒ dark 的
  secondary/tertiary/caption/dimmed/state-business 全部提亮一档。
- ✅ 我的气泡：蓝泡白字（`.LOmM4q_bubble`；宿主升级后哈希变了会退回原厂配色）。
- ✅ 状态眼：左下角 34px，idle/thinking/working/done/error，1.2 s 轮询 `/fairy-skin/state.json`。
- ✅ **侧栏行内操作按钮**（`⋯ / 归档 / 固定`）：默认 `label-primary`（原厂是 `label-tertiary`，暗得像禁用），
  悬停酸黄 + 黄框；选中行（黄底）里按钮压成 `#141414`，别糊成一片。
- ✅ **「空闲」状态点改青柠**：`--dsw-alias-state-idle-primary`
  dark `#b7e43c` / light `#5f9e14`。**这就是那个点的唯一开关**，别去给 `._dot_1i3xo_2` 单独写色。
- ✅ **生成中指示条换成 Fairy**：鲸鱼尾巴图标 → **Fairy 眼徽**（内联 SVG，18px，
  `[class*="V4vHZW_runningIcon"]` 贴图 + 把 `runningWhale*` 两个节点 `display:none`）；
  文字「深度求索中」→ **「Fairy工作中」**（`span.V4vHZW_runningText` 内文本替换）。
- ✅ **浮层卡状态色**（同上）：
  | 状态 | 圆 | 文字 |
  |---|---|---|
  | 空闲 | 青柠 `#b7e43c`（是 `span._dot_*`） | 亮绿 `#b7e43c` |
  | 进行中 | **中性环 + 状态弧**（见下条） | 亮黄 `#f8de2b` |
- ✅ **折叠工作区 = 左眼徽 + 右「委托」胶囊**：
  | 位置 | 造型 |
  |---|---|
  | 行左角标 | **眼徽 30px**（`[data-fairy-ws-run="1"]::before` 换图；**必须补 `border-radius:50%`**，否则 1px 外圈画成方框） |
  | 行右上浮层 | 胶囊「委托进行中」高 18（`box-sizing:border-box` + `border-radius:999px` 才是真半圆）、`padding:0 14px 0 9px` 给右端眼徽让位；眼徽 **22px**，圆心压胶囊右端、垂直居中 |
  | 竖直位置 | 胶囊顶面 = 行外框顶 `-3px` `- 行间距/3`（间距 21px ⇒ 实测量出来的，不是常数） |
  | 完成后 | 先 `data-state="in"` 把胶囊**缩进眼徽**（.22s，origin 右端）→ 240ms 后换「委托完成」→ `pop` 动画（放大到 1.07 再回 1）**弹出来**，然后一直挂着 |
  | 何时不显示 | 该组**展开**了 / 该组不再是「在跑的那个」 |
  | 超 7 天没任务 | 角标转**灰白**（`data-fairy-ws-stale="1"`，正在跑的眼徽优先）：`localStorage['fairy-skin:wsLast']` 记每个工作区最近活跃时间，展开态还会从会话行的「X分钟/小时/天」反推补账 |
  ★★ 浮层是 `position:fixed` 挂 `body`、`pointer-events:none`，只按折叠行 `getBoundingClientRect()` 摆位
  —— **不塞进行内**，跟行内悬停按钮（⋯ / 归档 / 置顶）完全无关，也不会被它们挤走。
  ★ 逻辑挂在 `guard('mood', …)` 里（那条每 2s 一定在跑），自己再挂 600ms `setInterval` 追位置。
  ★ key 四级回退：渲染出来的选中行 → 宿主 `folderActive` → `state.json` 的 `wk/cwd` → localStorage 里上次的 key
  （冷启动全折叠时也能亮）。
  ★★ 早先的卡点留档：**折叠时宿主不渲染会话行**（实测 `wingFoaW_selected` = 0、`folderActive` 也不在），
  所以 key 必须自己记住；宿主半边已顺手多发 `wk`/`cwd`/`wkKeys` 备查。
- ✅ **「进行中」转圈配色**：第二轮遇到的问题：白圈 + 蓝弧在**亮黄绿药丸**上蓝弧显得又粗又脏；加粗到 3.5 + 暗影更糟。
  最终方案 —— **环用中性色、弧用状态色，按底色切换**：
  | 场景 | 底环 | 弧 |
  |---|---|---|
  | 深底（未选中行 / 浮层卡 / 后台任务 chip） | `rgba(255,255,255,.42)` | 酸黄 `#f8de2b`（=「进行中」文字色） |
  | 选中行（亮黄绿药丸） | `rgba(20,20,20,.30)` | 墨黑 `#141414` |
  ★ `svg` 是 `viewBox 24` 缩到 14px，2 用户单位只剩 ~1.2px ⇒ 统一钉 `stroke-width:3`（≈1.75px）。
  ★ 类名：`circle._spinnerTrack_*`（底环）/ `circle._spinnerArc_*`（弧）；**`_spinnerTrack_` 不含 `_spinner_` 子串**，
  所以选择器写 `[class*="_spinner_"] circle`（认父 svg）或 `circle[class*="Track"]`，别写 `circle[class*="_spinner_"]`。
- ✅ **对话页签 = 胶囊容器 + 选中实底**：
  **框画在外层 `div.an3WzG_tabs` 的 `::before` 上**（2px，跟工作区分组框同粗），
  这样右边的 **`⋯`（`span.an3WzG_viewsMoreAnchor`）也被圈进同一个框**。
  选中项 `button.an3WzG_tabActive` 填 `#98bb1d`（**照参考图取样**：内部均值 151,187,29）、
  深色粗体、原厂下划线（伪元素）`content:none` 藏掉；未选中 `label-secondary`。
- ✅ **标题行右侧**：
  · `标准模式`（`span.dscfja_label`）**按模式四档上色**——
    PTC `#8b7bff`（紫）/ 标准 `#ffab1f`（橙黄）/ 创造 `#ff5a3c`（红橙）/ 极简 `#7bd85a`（绿），
    判据只有**文字**，所以下拉里那四项标题也会一起变色。
  · `1 个后台任务运行中`（`button.Ag-ohG_trigger`）文字亮黄 `#f8de2b`、转圈橙红 `#ff5a3c`，
    跟「工作区的进行中」同一套。
  · **页签胶囊与会话区分隔线之间留 4px**（`margin-bottom`），原来那条线正压在胶囊底边上。
- ✅ **输入区两个 chip 加对比度**：`+` 与权限 chip 的底色**不再用「透明对应色」**，
  统一改深灰 `#24242b`；`+` 用亮青柠 `#c8f04a`、权限用 `#ff6a4d/#9d8fff/#d4ef68`，
  边框 1.5px。权限 chip 右侧那个箭头是 **`svg[width="14"]`**，单独改白。
- ✅ **权限下拉**：三项文字统一白；选中的勾（`svg._check_*`）→ **绿色带圈**
  （`#3ae06e` 描边 + 同色环 + 淡绿底）。带圈勾是**全局**的，别的菜单勾到也一起变。
- ✅ 红标 1.5 倍偏大 ⇒ 收到 **1.25 倍**（24×28，`top:-14px`）。
- ✅ **左下角账号 → 角色卡胶囊**：
  `button._5Qcc8a_trigger` 重排成 **66px 胶囊**（深灰底 + 1px 边），头像 **42px**（蓝环，左内缩 6px）、
  名字 13px/700（`left:21.7%; top:13px`）、**MAX/MAX 经验条**（`::before`，`left:20.9%; right:26.2%;
  bottom:14px; height:12px`，字 11px）、右侧 **60**（`::after`，24px，`right:11.6%; top:16px`）+
  **LEVEL**（头像 `::after`，8.5px，`bottom:14px`）。宽度由 JS 实测分组框写进 `--fairy-card-w`。
  ★ 参考图是 869×222，所有百分比/px 都是**按它量出来再按 66px 高换算**的，不是估的。
  ★ 又调过一轮：**用户名 20px**（上沿对齐头像圆顶、下沿不碰条、`z-index:4` 防止被条压住）、
  **经验条高 10px**、**60 用 30px**（宽度 ≈ LEVEL 宽度）、
  **组（名字+条）左右间距等距**：`left:24.0% / right:23.3%`。
  ★ 结构没改（还是那颗 button），点它照样弹账号菜单。
- ✅ **菜单勾 → 贴图「绿圈 + √」**：`svg._check_*` 藏掉，换 SVG 贴图（`#3ae06e`）；
  **安全降级**：只有打了 `data-fairy-checked` 的项才隐藏原勾。
- ✅ 权限 chip 边框 **1.5px → 3px**。
- ✅ **芯片上的绿勾是调试残留**：`data-fairy-checked` 在热重载里留在了 chip 上 ⇒
  现在每轮都会清掉「不在菜单项里」的残留标记。
- ✅ **角色卡开/关 + UID 位**：设置 → Fairy 里加「角色卡（左下角）」三态开关 + 米游社 UID 输入框。
  - **开**（默认）：60 级、经验槽 MAX/MAX 满条。证据图 `design\verify-card-on.png`
  - **关**：**0 级**、经验槽**只留轮廓内部为空**、头像环变中性灰、名字仍是真实登录用户。
    证据图 `design\verify-card-off.png`
  - 实现：`<html data-fairy-card="on|off">`，纯 CSS 三处切换（`::after` 的数字、`::before` 的底、头像环）。
  - ⚠ 米游社 UID 只做到**存起来**：真实等级/进度要读角色数据，需要登录态 + 接口授权，
    本机没有可用通道（没有 token、也没找到公开接口）⇒ 接口位已留，等接入凭据或换方案。
- ✅ **MAX/MAX 文字顶牢进度条**：文字从进度条里拆出来，挂到头像的 `::before` 单独立一个层，
  `font 11.5px + line-height 12px + transform:scaleY(1.32)` ⇒ 字形几乎顶满 12px 的条高（原来是缩在中间的）。
- ✅ **自定义头像**：
  - 头像**左下角**一个 20px 圆钮（SVG 换图图标），**fixed 定位、按量出来的头像坐标贴上去**
    —— 不塞进 React 管的 DOM（塞进去会被重渲染冲掉）。
  - 设置 → Fairy 里也有「上传头像 / 恢复默认」。
  - 选图后压成 **96×96 JPEG dataURL**（约几 KB）存 localStorage；
    显示时写进 CSS 变量 `--fairy-avatar`，铺在头像框的背景上 + 把原 `<img>` 设成透明
    —— **不改 `<img>.src`**，所以宿主重渲染也冲不掉。
  - 已实测：塞假图 → 头像换掉、蓝环仍在外层；清空 → 恢复真实头像。
- ✅ **内置头像 44 张**：
  从 `E:\ds-harness\主题皮肤\绳网头像` 取 44 张，统一裁方 + 压成 **80×80 WebP（q78）**，
  base64 内联进 `client.js` 的 `PRESET_AVATARS`（**共 98.7 KB，44 张**）。
  ★ 内联而不是走路由：加静态路由要改宿主半边 `lib/index.js` ⇒ **必须重启 DSH**，内联不用。
  - 点左下角圆钮 → **一行 4 个的大九宫格**（面板宽 262、跟角色卡同宽，可滚动），**点一张即选**；
    另有「上传自定义 / 恢复默认」。
  - 换头像圆钮：**外框 15px / 符号 10px**，贴在头像**右下角**、中心压在头像右缘
    （`left: r.right-7, top: r.bottom-14`）；与经验条间距约 7px（原来的 2/3）。
    图标用 **Feather refresh-cw**（两段对称弧）—— 之前那个自绘的 `C + 箭头` 视觉重心偏上偏右，
    显着不居中。
  - **经验条文字水平居中**（`justify-content:center`）—— 满级 `MAX/MAX` 与未满级的长数字
    （如 `153195 / 181580`）都居中，换成真实数据时不用再调排版。
  - **鼠标悬停头像 → 头顶浮出角色名**（`position:fixed` + 视口坐标，跟着滚动/换行都不会错位）。
  - 存储只写 `avatarPreset: 'p03'`，渲染时再解析成 dataURL（比存整串 base64 省）。
- ✅ **聊天窗气泡**：照 ZZZ 信使图，两侧都成了聊天窗口样式。
  | 位置 | 造型 |
  |---|---|
  | 系统回复 | `[眼徽 38px]` + `[浅灰气泡]` **并排**；气泡浅灰底 `#e6e6e6`（=10% 黑）、字 `#333`（=80% 黑）、**四角统一 16** |
  | 系统尾巴 | 气泡 `::before` 贴内联 SVG **18×16**（根部 12px、挑出 6px，`left:-6px; top:14px`），从导角弧线尽头起笔 |
  | 我的消息 | 蓝泡 `#3753e0`（照参考图取样 55,83,224）、字白、**四角统一 16**、右上同款尾部 SVG（`right:-6px; top:14px`） |
  | 我的头像 | `userStack::before` **50px** 圆环，**顶边与气泡顶边对齐**；图跟左下角角色卡同一张（`--fairy-me-avatar` 优先取 `--fairy-avatar`），没设过才退回登录头像 |
  ★★ 坑：思考行/工具行与文本行**共用 `xMeOpW_root`**，不能一刀切上气泡 ⇒
  只给「含 `._markdown_1ypvv_5`」的 root 打 `data-fairy-msg="1"`，CSS 只认这个标记。
  ★ 宿主把 `xMeOpW_root` 写成 **flex-direction:column** ⇒ 不显式写 `row`，眼徽永远在上面（老版本就是这么错的）。
  ★ 气泡里的字要**逐个压深灰**（`*` 规则），再单独给 `pre` / `code` 放行，否则代码块会糊在浅底上看不见。
  ★★ 尾部这三版是踩出来的：菱形贴图 → 10×20 SVG（太薄，像个小方片）→ 照参考图**逐像素量**轮廓
  （上边沿 13px 处 → 尖端 (-4,7) → 回边 (0,11)）→ 定为「2 倍 + 挑出 1.5 倍」⇒ 最终 18×16 / 根部 12 / 挑出 6。
- ✅ **行内操作按钮还原原厂**
  ⇒ `wnFoaW_iconButton` 上**一条样式都不留**（连选中行的深色也交给已有的
  `[class~="wnFoaW_selected"] *` 通配管）。别再加回来。
- ✅ **悬停浮层卡里的「空闲」两个字也亮绿**：`div.wnFoaW_hoverStatus` 由 JS 打
  `data-fairy-status="idle"`（按文字判 空闲/工作中），CSS 只染 idle；白底用 `#4e8c0d`。
- ✅ **工作区角标 = 贴图**：
  行首 `::before` 26px，`background` 一张内联 SVG（蓝紫圆环+三点 / 当前工作区橙红圈+星），
  `border:0; border-radius:0` —— **完全不依赖 border-radius**，绕开上一条那个坑。
- ✅ **激活行底色 = 橙黄 → 黄绿 横向渐变**：
  `linear-gradient(90deg,#f89a24 0%,#fadf28 56%,#c8e64a 100%)`。
  ★ 左端不是拍脑袋：照参考图那格 pill 在 y=124 采样，左端实测 `rgb(248,154,36)`。
- ✅ **激活行右上角红色定位标**（贴图，同为内联 SVG）：`::after` **28×33**（19×22 的 1.5 倍）、
  `right:1px; top:-18px`，骑在行上边缘、tip 落在行内约 15px。
  **由状态驱动**：`/fairy-skin/state.json` 的 mood 轮询写进 `html[data-fairy-mood]`，
  `thinking` / `working` 时淡出 ⇒ **任务完成后才出现，下次开工消失**。
- ✅ **工作区分组框加粗**（同一次要求）：`1px/.10` → **`2px/.17`**，圆角 14→17，内边距 3/4/5 → 4/5/6。
- ✅ **推理等级三处上色**：
  | 位置 | 真实落点 | 做法 |
  |---|---|---|
  | 输入区 chip 里那个词 | `span._9r0rkG_triggerEffort` | 原厂吃 `label-caption`（又小又暗）→ 档位色 + 600 加粗 |
  | 菜单根两行 | `button._9r0rkG_cell` > `_9r0rkG_cellLabel` + `_9r0rkG_cellValue` | 只染**值**，标签不动；值提亮到 `label-primary` |
  | 下钻四项 | `button._9r0rkG_option[role=menuitemradio]` | Off/Low/High/Max 各一色 |
  色板（dark）：Max `#ff5a3c` / High `#8b7bff` / Low `#7bd85a` / Off `#b9b9c2`；
  白底换深一档：`#c4331f` / `#5a47d6` / `#3f8f1f` / `#6e6e75`。
- ✅ **助手气泡白底黑字**：曾一度叫停（当时怕连代码块一起改），19:2x 重开并落地 ——
  做的是 **10% 黑 = `#e6e6e6` + 80% 黑字 `#333`**，不是纯白；代码块仍是深底 `#15151a`（浅底上深块反而清爽）。
- ✅ **动态壁纸 / 液态玻璃 / 新会话页 2.0**（2026-10-27 晚，详见 `HANDOFF-SKIN.md` §9.4）：
  MP4 走本地 `9335` 只读服务；斜纹 2.7px/5.4px、55% 透明；HDD 图宽=输入框宽、底部灰框对齐输入框；
  中英标题移到输入框下方（中文 62px / 英文 36px，Inpin Hongmeng Heavy + 合成斜体）；
  对话文字列一块 fixed 玻璃面板（746×780，backdrop-filter blur 24px）。
- ⬜ 开机闪屏、Fairy 模式按钮

## 七、坑（写死在这）

1. 主题 token 是**行内样式**，必须 `!important` 才能覆盖。
2. 别只覆盖 14 个「可 inspect」的 token —— 那是给设置面板看的白名单，不是全集。
3. 桌面端注入表在宿主启动时收集一次 ⇒ **新增插件必须重启 DSH**，刷新页面不够。
4. 插件目录、`package.json`、`cordis.patch.yml` 三处都要动；卸载要么用原件还原，要么别动（被 JSON 重新序列化会改换行）。
5. ★ **热重载是「同一个文档里重跑模块」**，不是整页刷新 ⇒ 上一轮插的 `<style>` 不会自己消失。
   原来的写法「已存在同名 style 就 return」会让**新 CSS 永远不生效**（一度堆到 194 个标签）。
   现在改成「先删同名旧标签再插」。同理，临时写在 `<html>` 上的调试属性要在 apply 里主动清。
6. ★ **探针别塞进 query string 太大**：payload 一过 ~8 KB，请求会被服务端丢掉，日志里就「没有新行」，
   看起来像热重载没生效。现在主探针 + `diag` 拆成两条小请求。
7. ★ `.wnFoaW_rowActions` 原厂是 `display:none`，靠 `.wnFoaW_sessionRow:hover` 才 `inline-flex`
   ⇒ **静止截图永远拍不到那三个按钮**。要验只能临时加一条强制显示的调试规则（截完就撤）。
8. ★ 合成悬停（`dispatchEvent(new PointerEvent('pointerover'))`）**能**让浮层卡弹出来，
   但 HMR 不会把它关掉、鼠标不动就一直挂着 ⇒ 代码里用 `DEBUG_HOVER` 常量兜着，默认 `false`。
9. **真悬停靠 `SetCursorPos` 在本机不触发**（窗口在副屏、还被别的窗口压着）—— 别在这上面浪费时间。
10. ★ **伪元素的圆角别只信 `border-radius`**：行首角标那条 `::before` 上，computed 给的是 `999px`，
    渲染却是圆角方块；加 `clip-path:circle(50% at 50% 50%)` 才真的圆。
    **最后是换成内联 SVG 贴图**才彻底干净（`border:0;border-radius:0`，形状由图决定）。
    （认伪元素的办法：临时把 `content` 改成 `"F"`，屏幕上哪个字变了就是它。）
11. ★★ **别写裸的 `[data-fairy-level="high"]{color:…}`** —— 同一属性同权重时后写的赢，
    会把整条模型 chip 一起染成紫色。必须收窄到 `_9r0rkG_triggerEffort` / `_9r0rkG_cellValue` /
    `[role="menuitemradio"]` 这三种落点。
12. **打开菜单要发 `pointerdown`**（Radix 监听 pointerdown），单发 `.click()` 没反应；
    再点一次是「关」，所以探测前先发一次 `Escape` 归零。
13. ★ **设置页里没有「推理等级」这一行**：在 `app.asar` 里搜了 8 处「推理等级」，
    全是 composer 菜单 / 文档文案，没有设置面板的落点 ⇒ STEP49 那条待办可以划掉。
14. ★★ **这个文件是 CRLF**。用 node 做字符串替换时正则必须写 `/\r?\n/`，
    只写 `\n` 会**静默不匹配**（这次「撤掉 DEMO 规则」第一次就跑空了，白等一轮热重载）。
15. **状态驱动的小件走 `/fairy-skin/state.json`**：客户端每 2 s 轮询一次，把 mood 写到
    `html[data-fairy-mood]`，CSS 里按属性显隐（红标就是这么做的）。宿主半边的 mood 是全局的，
    只挂在「当前选中行」上够用；真要按会话区分，得在 `lib/index.js` 里按 sessionId 分桶。
16. ★★ **CSS 是写在模板字符串里的 —— 注释里也不能出现反引号**。
    这次在注释里写了 `` `[class~="…"] *` ``，直接把模板字符串截断，整个 client 模块解析失败
    （`node --check` 报 `Unexpected token '~'`）。改完**必须先 `node --check` 再 install**，
    否则会把坏文件拷进 profile，界面直接掉皮肤。
17. 悬停浮层卡是**瞬时挂载**的：只靠 1.2 s 轮询会晚一拍 ⇒ 现在另挂了一个 120 ms 去抖的
    `MutationObserver` 专门补这种后出现的节点。
18. ★★ **「深度求索中，用时 N 秒」是同一个文本节点** ⇒ 只能在这个节点里换词，
    **不能 hide 整个节点**（会把计时一起藏掉，也不能用 `::before` 顶替）。
    它每秒跟计时器重渲染 ⇒ 用 `MutationObserver` 在回调里**同步**改写：
    回调在绘制之前跑，不闪；改完再匹配不到关键词，不会死循环。
19. ★ **「进行中」前面那个圈不是 `_dot_*`**，是带 `data-state` 的 `svg._spinner_*`
    （里面 Track 底圈 + 运动弧两个 circle）⇒ 要分开给 `stroke`，
    底圈给 35% 透明度的同色、弧给实色，不然会糊成一坨。
20. ★★ **「深层有旧文字闪过」的根因：扫光层是 `content:attr(data-shimmer-text)` 画的**。
    只改文本节点，`data-shimmer-text` 这个属性还留着旧串 ⇒ 高亮层一直印「深度求索中」。
    ⇒ **文本节点 + 属性都要改，observer 必须带 `attributes: true, attributeFilter:['data-shimmer-text']`**。
21. ★★ **HMR 里千万别用「布尔标记」做「只装一次」的判断**：模块会重跑，但 DOM 还在，
    `el.__watched = true` 会**留到下一轮**，结果新配置的 observer 永远装不上（这次就卡在这，
    改了半天没效果）。正确做法是记**版本号**（`__fairyWatchV`），配置一改就 `disconnect()` 旧的再装新的。
22. ★★ **别给 `.an3WzG_tabs` 收窄宽度**：宿主按容器宽度做**响应式折叠**，
    一设 `width:max-content` 就把「轨迹/上下文/编队」塞进「⋯」（页签直接看不见了）。
    ⇒ 外框要用**不参与布局的 `::before` 浮层**（`position:absolute`），宽度由 JS 实测后
    写进 `--fairy-tabs-x/w`，每 1.2 s 随 tint 循环更新。
23. **`[class*="headerActions"]` 会同时命中侧栏的 `GAkraW_headerActions`** ——
    认元素时用 `[class~="an3WzG_headerActions"]` 这种**精确类名**，别用 `*=`。
24. ★ **「自己的两条规则打架」比宿主更难查**：`[class~="an3WzG_headerActions"] [class~="dscfja_label"]`
    和 `[class~="dscfja_label"][data-fairy-mode]` **权重都是 0,2,0**，谁写在后面谁赢 ——
    结果模式色被上一条吃掉，看起来像「JS 没打上属性」。给后者加一个 `body ` 前缀（0,2,1）才稳。
25. **宿主的面板（模式下拉、模型菜单）多半用 Radix**：`click()` / 合成 pointerdown 不一定能打开，
    别在这上面反复试；能靠文字判定的样式，先在 chip 上验，面板里自然同样生效。
25b. ★★ **但这批下拉是「真 `<button>` + onClick」**：对它发 **`.click()`** 就能打开
    （`pointerdown` / `pointerdown+pointerup` 都不行）。打开后记得先发一次 `Escape` 归零，
    否则下一次 `.click()` 是「关」，会误判成「打不开」。
25c. ★★ **权限下拉的真实结构**：`role="menuitem"`（**不是** menuitemradio）+ 类
    `_item_4ub78_90`，选中态是 `_selected_4ub78_216` 类（**没有 aria-checked**），
    勾是 `svg._check_4ub78_179`。按 `aria-checked` 写规则会**全部落空**。
25d. ★ 再次踩到坑 16：**CSS 注释里写反引号会截断模板字符串**。`node --check` 一次就抓到 ——
    这条流程（改完先 check、通过再 install）已经救过两次。
25e. ★ **想单看某个 `::after` 贴图长什么样时，别借带 `::after` 规则的既有元素**：
    我先借了选中的页签（它正好有 `::after{content:none}` 用来藏下划线），贴图被那条规则干掉，
    白验一轮。借一个**没有 `::after` 规则**的元素（这次改用权限 chip）。
25f. ★ **换贴图前先给原勾留活路**：`svg._check_*{display:none}` 这种全局隐藏一旦标记没打上，
    勾就凭空消失了。改成 `[data-fairy-checked="1"] svg._check_*{display:none}`，失败也只是「还是原样」。

26. ★★ **宿主把 `xMeOpW_root` 设成 `flex-direction:column`** —— 只加 gap 不显式写 `row`，
    眼徽永远挂在气泡**上面**（18:5x 那版就是这么错的）。改布局前先读 computed，别照截图猜。
27. ★★ **重建 `background:url(...)` 时别只抓 url 那一段** —— 我用正则抓 `background:url("…")`，
    把后面的 `center/contain no-repeat;` 连同**分号**一起丢了；于是下一条 `box-shadow` 被吞进
    同一条声明，两条全废（computed 里 `backgroundImage` / `boxShadow` 双双 `none`，
    而源码看上去「好像是对的」）。⇒ **改完必须看 computed，不能只读源码。**
28. ★★ **伪元素的 `border-radius:50%` 在这版 Chromium 上不一定真圆**（头像先渲染成了圆角方块，
    computed 明明写着 `50%`）。补 `clip-path:circle(50% at 50% 50%)` 才真圆 —— 老坑 10 的翻版，这次落在头像上。
29. ★ **用户气泡的右对齐是 `userStack` 撑出来的，行（`userRow`）本身是 block。**
    加头像别去改行的 display（会顶掉宿主那套右对齐和悬停条）：给 `userStack` 加 `padding-right:50px`
    ＋ `::after` 绝对定位钉右下。**是 50 不是 43** —— 尾巴往外挑 10px，43 会跟头像贴在一起。
30. ★ **验气泡别用「滚到底」**：底部永远是最新的工具行，气泡早被顶走了。
    探针里用 `el.scrollIntoView({block:'center'})` 把目标气泡滚到屏幕中间再截图。
31. ★ **这个文件现在混行结尾**（老段 CRLF，后加的段 LF）：node 替换一律 `\r?\n`，
    或者先从锚点里探测出 `eol` 再拼 —— 硬写 `\r\n` 会静默不匹配（这次就白跑过一轮）。

32. ★★ **`LOmM4q_bubble` 的 `::before` 在这版根本不画** —— 不管怎么加 `content:""!important` /
    `display:block!important`，屏幕上一点痕迹都没有（拿洋红实心去试，全屏扫不到一个像素）；
    同一颗气泡的 `::after` 却画得好好的。⇒ 用户气泡只能**用一个伪元素**：
    **尾巴挂 `::after`、头像搬到 `userStack::before`**。别再往气泡 `::before` 上挂东西。
33. ★ **伪元素写没写对，不能看「源码像不像」，要拿实心色去验**：把背景刷成洋红 + `content` 强制，
    截一张全屏扫像素 —— 一扫就知道它到底画没画、画在哪。这一招这次救了两次（头像剪圆、尾巴不画）。
34. ★ **`top` 是相对「包含块」量的，气泡内的伪元素包含块是气泡的 padding box**：想做「离气泡顶 14px」
    就写 `top:14px`，别去凑 row 的 padding（这次一度怀疑偏了 10px，其实是 ::before 压根没画）。

35. ★★★ **绝对不要用 PowerShell 的 `Get-Content -Raw | Set-Content` 改 client.js**：
    这次想改一行 `DEBUG_HOVER`，`-replace` 管道把 UTF-8 里的中文全变成 `?`，字符串当场断掉，
    `node --check` 报 `Unexpected identifier`，而 `;` 连着 install 又把坏文件装进了 profile
    ⇒ 皮肤瞬间消失。**改这个文件只用 node 的 `readFileSync(p,'utf8')` / `writeFileSync(p,s,'utf8')`。**
    ★ 恢复路径（已验证）：`%USERPROFILE%\.dsh\profiles\desktop\node_modules\fairy-dsh-skin.bak_<stamp>\`
    是**上一次装进去的整包**，挑最新那个把 `lib\client.js` 拷回来即可，`node --check` 过了再 install。
36. ★★ **「转圈加粗」不是把 stroke 调大就完事**：14px 的 svg 带 `viewBox 24`，CSS 里的 `stroke-width`
    是**用户单位**，要乘 0.58。要 ~1.75px 实显就得写 3。
37. ★ **同一个转圈要活在两种底色上**（深灰面板 / 亮黄绿药丸）：**环走中性色、弧走状态色，按底色切换**，
    别指望一个颜色通吃 —— 白+蓝在深底好看，落在亮绿上就是「又粗又脏」。

## 八、调试开关（`lib/client.js` 顶部）

| 常量 | 默认 | 作用 |
|---|---|---|
| `DEBUG_PROBE` | `true` | 载入 3.5 s 后把 tabs / 输入区 / 侧栏 / 短横 / 品牌位 + `diag` 写进 `~/.dsh/fairy-skin-debug.log`（只写日志，不动界面） |
| `DEBUG_HOVER` | `false` | 合成一次悬停 → 抓「空闲/工作中」圆点和浮层卡的类名。**会真的弹卡**，只在要认元素时临时开 |

