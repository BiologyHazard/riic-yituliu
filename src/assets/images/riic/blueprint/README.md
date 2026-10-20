# 基建蓝图房间资源

本目录保存从本机游戏文件读取的蓝图 Prefab、原始 Sprite、字体、本地化文字和运行参数。正式页面不依赖解包或调查目录。

## 资源与来源

`blueprint-prefabs.json` 包含 33 组节点树（包括 `frame` 别名和外部 `level_item`）、60 个 Sprite 定义，覆盖控制中枢、贸易站、制造站、发电站、宿舍、会客室、加工站、办公室、训练室、回收站、活动室、走廊、电梯及未清理、未建造、建造完成状态。保留原始锚点、轴心、缩放、九宫格边距、图层顺序、颜色、字体、布局组件和运行时绑定，不从截图测量。

主要源 Bundle 是 `Arknights_Data/StreamingAssets/AB/Windows/building/blueprint/[uc]rooms.ab`，SHA-256 为 `3781c6959d091cc8a3a71e79ba58f7be506f541a8e10062736d8febb66ac3c42`。依赖 Bundle 与专精图标 Bundle 的校验记录见 `sources.json`。`level_item` 是 `widget_progress_level_item`（PathID `-3759190961629294669`），使用 `img_level_item` 原图，其实际尺寸由父布局组决定。

所有对象编号和引用中的 `m_PathID` 使用十进制字符串，避免 JavaScript 丢失 64 位整数精度。源文件包含 10 处未初始化的 `NaN` 布局字段，正式 JSON 用 `null` 表示，由对应布局组重新计算，不将其解释为测量得到的零偏移。

字体直接来自本机 `Arknights_Data/sharedassets1.assets`：`JovannyLemonad-Bender-Light`（PathID 394）、`NotoSansHans-Medium`（395）、`JovannyLemonad-Bender`（397）。字号、颜色、等级文字偏移、动态文字宽度均使用字体与 Prefab 参数。

Prefab 的固定本地化文字由 `m_TextId` 查询本机 `main_text` 数据取得，生成结果保留 `textId` 便于核验；例如会客室固定状态为 `&&5h3g2cajul0affoz`。动态状态文字在 `runtime-rules.json` 中按游戏 StringRes 键保存，设施定义与阶段容量在 `room-rules.json` 中保存。

## 渲染规则

`BlueprintRoom.vue` 和 `blueprintRenderer.ts` 按游戏树顺序输出图像和文字，执行横向布局、网格布局与内容尺寸计算；颜色传播只从房间控制器的 `_mainColorComponents` 绑定触发，其他图像保留序列化颜色。游戏下方的进度格数取自 `PiecewiseProgressBar._progressSlots`，可见格数取 `floor((clamp01(progress) + 9.999999747378752e-6) × slotCount)`。

`BRoomSlot.OnInit` 原生地址 `0x183dd6720` 将槽位尺寸设为 `(50 × col, 50 × row)`。实例化辅助方法 `0x18451b6e0` 使用 `SetParent(parent, false)`，因此保留房间根的原始缩放与偏移。`BControlRoom._DoUpdateControlRoomContent` 用 `{0:0.0}` 格式显示等级。上述地址仅适用于本次本机文件，不代表已观测运行中的热更新路径。

进驻普通人数与疲劳人数使用两套互斥文本，人数均为当前进驻数。产物、发光边框、升级、信赖、线索、留言、电梯方向等由对应显示状态控制。活动室的 `_panelChar` 实际绑定 `img_char` 子节点，无入驻者时仅隐藏头像，仍显示 Prefab 的默认边框；有入驻者时通过项目已有游戏头像数据源加载头像。

## 训练图标与动画

`specialized_tiny_0.png` 至 `specialized_tiny_3.png` 由本机 `arts/specialized_hub.ab` 的 SpriteHub 提取。`training-animation.json` 保存训练室 `shining` AnimationClip（PathID `-8862813433534912974`）的原始流式三次多项式系数，周期为 `1.8166667222976685` 秒；两个绑定路径分别为 `start_icon` 和 `end_icon`，属性为 `m_Color.a`。训练状态按曲线切换当前与目标专精图标，完成状态显示目标图标。

收获波纹按 `icon_product_ripple` 的 `UITweenSize`、`UITweenFade` 参数执行：尺寸从 `59 × 59` 变为 `100 × 100`，透明度从 `1` 变为 `0`，持续 `1` 秒，初始延迟 `0.4000000059604645` 秒，无限重启循环。序列化 `_easeType=0` 直接传入 `SetEase`（`0x1845f09d0`），`EaseManager.Evaluate` 的默认分支（`0x1842863af`）对应 `t × (2 − t)`，因此使用 `OutQuad` 曲线，不将枚举 `0` 错当线性。

## 验证边界

本实现是游戏蓝图的可编辑显示状态预览。截图仅指定初始房间配置并用于视觉验证；不会读写游戏存档，也不模拟服务器生产结算。默认关闭动画，三角个数作为预览帧选择，不表示生产速度档位；开启全局工作动画后，三角按游戏原生 `2` 秒线性推进至 `1.3300000429153442`、无限循环的规则变化。训练与收获动画通过同一开关启停，只有实际存在动画的房间才启用帧回调。网页弹层仍使用网页交互；未验证运行中热更新分支。浏览器与 Unity 的字体基线、纹理采样、抗锯齿尚未进行同环境逐像素校准。

## Sprite 矩形与裁剪区域

图像节点保留 `m_PreserveAspect`。`Simple` 图像先按 Sprite 逻辑矩形及 RectTransform 的 pivot 保持宽高比，再映射裁剪区域；不能直接把图像拉满 RectTransform。发电站背景逻辑尺寸为 `195 × 99`，节点为 `195 × 103.00003`，保留原始约 `1.05` 缩放后，实际背景为约 `204.75 × 103.95`，不是 `204.75 × 108.15`。制造、贸易、会客室及建造完成背景按同一规则处理。

Sprite 数据的 `width/height` 表示逻辑矩形；`textureRect` 表示已导出 PNG 的内容区域在逻辑矩形中的位置和尺寸（左上角坐标），来自原始 `textureRect` 与 `textureRectOffset`。升级、清理、产物、线索等 8 种图标存在非零裁剪边距，必须保留该偏移，不能将裁剪结果放大至逻辑矩形。有边框的 `Sliced` 图像仍使用九宫格，本批 5 种九宫格 Sprite 均无裁剪偏移。

Sprite 元数据按 Prefab 引用的对象编号匹配，并记录为 `sourcePathId`，不按名称跨 Bundle 合并。`icon_manuf_product` 的蓝图资源为 `118 × 118`（对象编号 `6174729782678007643`），不能被同名 `32 × 32` 资源覆盖；`icon_favor_max` 使用蓝图的 `59 × 59` 无裁剪资源，不能混入同名 `70 × 60` 资源的边距。

## 文字字号与顶端基线

名称字号保留 Prefab 的 `m_FontSize`：制造、贸易、发电为 `21`；加工站、办公室、训练室、回收站为 `20`，其文字节点另有约 `1.05` 的局部缩放；两组再乘房间根缩放后，实际字号均约为 `22.05` 个地图单位。宿舍、活动室为 `20`，会客室为 `22`，控制中枢为 `24`，不得为视觉统一改写这些值。

`font-metrics.json` 来自 `Arknights_Data/sharedassets1.assets` 中实际使用字体的序列化指标。顶端对齐的首行使用 `ascent / fontSize × 当前字号` 定位 alphabetic 基线；例如 `NotoSansHans-Medium` 的基准字号为 `16`、ascent 为 `14.080000877380371`。不能用 SVG `hanging` 直接替代 Unity `UpperLeft`。游戏字体 `m_UseLegacyBoundsCalculation=false`，原生首行边界不额外计入 leading。本次只修正顶端基线，未改动原始字号、锚点和缩放；居中及底端基线仍需单独核验。
