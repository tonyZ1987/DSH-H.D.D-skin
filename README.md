# DSH-H.D.D-skin

> Fairy · H.D.D skin for DeepSeek Harness —— 一个把 DSH 换成《绝区零》H.D.D 玻璃面板的皮肤插件。

把 DeepSeek Harness 换成《绝区零》H.D.D 的那套玻璃面板：HDD 线框球、镜面倒影、状态眼、侧栏与输入框全套换皮。纯客户端插件，不改 DSH 本体。

> ⚠️ **二创作品，不允许商用。** 画面与设定版权归 **米哈游（miHoYo）** 所有；灵感与素材出处见 [CREDITS.md](CREDITS.md)。

![空态](https://raw.githubusercontent.com/tonyZ1987/DSH-H.D.D-skin/main/docs/hero.jpg)

![对话页](https://raw.githubusercontent.com/tonyZ1987/DSH-H.D.D-skin/main/docs/chat.jpg)

## 特性

- **空态 HDD 球**：线框统一灰蓝、周边自消隐，底下带一层镜面倒影（上下位置、浓淡可调）。
- **标题带**：大号英文影子压在中文主标题后面，下面是「● 在线 · {时段}，传奇绳匠【法厄同】」，按系统时间切早上/中午/下午/晚上。
- **状态眼**：`idle / thinking / working / done / error` 五态，跟着 DSH 的会话事件流走，不额外发请求。
- **侧栏**：品牌位换成 Fairy H.D.D 眼徽；工作区角标分三态 —— 当前激活红星、有任务在跑黄圈、7 天没动灰圈。
- **输入框与页签**：2px 灰描边胶囊、模式四档配色（PTC 紫 / 标准 橙黄 / 创造 红橙 / 极简 绿）。
- **可选背景层**：本地 9335 媒体服务提供壁纸视频 + 斜纹质层，没有服务也不影响其它部分。

![侧栏角标](https://raw.githubusercontent.com/tonyZ1987/DSH-H.D.D-skin/main/docs/sidebar.jpg)

## 安装

**插件市场**（推荐）：DSH 里打开「插件 → 插件市场」，搜索 `fairy-dsh-skin`，点安装。

**命令行**：

```sh
dsh plugin --profile <你的 profile> add fairy-dsh-skin
```

**本地开发**（Windows）：仓库根目录执行

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
```

装完要重启 DSH（或等客户端 HMR），仅刷新页面不够。

## 设置

装好后在 **设置 → Fairy** 里，三张卡：

| 设置 | 作用 | 默认 |
| --- | --- | --- |
| **颜色** | 黑底可用；白底 / 跟随系统 —— 正式版上线，敬请期待 | 黑底 |
| **H.D.D 一键开关** | 整套皮肤的总开关，跟右上角那颗胶囊开关联动。关掉＝回到 DSH 原生白底；设置面板会一起收起，用胶囊再打开 | 开 |
| **角色卡（左下角）** | 开：ZZZ 风格角色卡；关：显示真实登录用户 | 开 |

角色卡里还能：**换头像**（内置 44 个头像，也可上传自定义）、填 **米游社 UID**（获取米游社账号等级状态，正式版上线）。

想改更底层的数值（倒影高度、球体宽度等），看 [DESIGN.md](DESIGN.md)，那里记着变量名。

## 兼容性

- DSH 桌面端 / `dsh web` ≥ `0.1.7-rc.1`；实际开发与验证在 `0.2.x`。
- 宿主改版会改类名（`wnFoaW_*` / `WOwLGG_*` / `GRgSLq_*` 等）。皮肤的所有选择器都做了容错：命中不到就自然失效，不会白屏。
- 工作区「有任务在跑」是按会话行文字判的（`进行中` / `运行中`），宿主改文案会漏判。

## 已知限制

- 右侧边栏是独立的 BrowserView，主页面 CSS 够不到，壁纸穿透在那里不生效。
- 壁纸与斜纹层依赖本地 9335 服务（`lib/wallpaper-server.mjs`），没起就只有纯色背景。
- host 半边只读：只读取会话事件流、只注册 `/fairy-skin/*` 两个只读路由，不写文件、不碰凭据、不发外部请求。

## 卸载

市场里卸载，或：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\uninstall.ps1
```

## 版权与许可

- **二次创作，不允许商用。** 与 miHoYo / HoYoverse 无隶属关系。
- 游戏名称、标识、美术与「H.D.D / Hollow Deep Dive System」等设定版权归 **米哈游（miHoYo）** 所有。
- 皮肤代码按 **CC BY-NC 4.0** 发布：可署名转载、可自行修改，不得商用；二次分发请保留 [CREDITS.md](CREDITS.md)。
- 素材与灵感出处（B站 up、米游社作者）也在这个文件里。
