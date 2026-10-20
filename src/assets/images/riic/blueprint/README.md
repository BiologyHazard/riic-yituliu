# 基建蓝图房间资源

这些文件从本机 Windows 游戏资源读取，使用 UnityPy 1.25.3 解码；`blueprint-prefabs.json` 保存实际 RectTransform、Image、Text 和 DynFontLoader 参数。对应渲染器为 `src/components/riic/BlueprintRoom.vue`。运行时不依赖解包目录。

## 图像来源

源 Bundle：`Arknights_Data/StreamingAssets/AB/Windows/building/blueprint/[uc]rooms.ab`，SHA-256：`3781c6959d091cc8a3a71e79ba58f7be506f541a8e10062736d8febb66ac3c42`。依赖文件及校验值记录在 `sources.json`。

| Sprite           | PathID                 | 逻辑尺寸  | 九宫格边距（左、下、右、上） |
| ---------------- | ---------------------- | --------- | ---------------------------- |
| `img_room_frame` | `1426665666224967277`  | 49 × 96   | 12、14、12、13               |
| `room_bg_ruin`   | `9116621073935627623`  | 193 × 99  | 17、27、18、10               |
| `ruin`           | `-100299447639281908`  | 35 × 16   | 0、0、0、0                   |
| `img_center_bkg` | `-3397192824220087692` | 386 × 195 | 0、0、0、0                   |

以上 Sprite 的 PPU 为 100，所用 Image 的材质引用为零，RGB 均为白色，倍率为 1。边框与灰色房间使用 Sliced，标识和控制中枢使用 Simple。纹理中的透明留白、阴影、切角和控制中枢装饰均保留，不另画 CSS 替代品。

## 字体来源

字体数据直接来自 `Arknights_Data/sharedassets1.assets`：`JovannyLemonad-Bender-Light`（PathID 394）、`NotoSansHans-Medium`（395）、`JovannyLemonad-Bender`（397）。字号、颜色及双层等级文字的偏移来自控制中枢 Prefab。中文房间名使用传入的游戏房间数据，等级可通过 `controlLevel` 传入；未传入时显示 Prefab 的默认 `5.0`，不表示玩家当前等级。

## 布局证据

以下地址仅适用于本次核验的本机 `GameAssembly.dll` 原生代码路径；存在热更新分支，不能据此证明运行中始终执行原生路径。

- `BRoomSlot.OnInit`：`0x183dd6720`。槽位尺寸为 `(50 × col, 50 × row)`，位置为 `(50 × offset.col + 50, 50 × offset.row + 40)`。
- `BuildingFactory.CreateBRoom`：`0x183ca3b30`，实例化辅助方法 `0x18451b6e0` 在 `0x18451b76c–0x18451b778` 调用 `SetParent(parent, false)`，没有重置房间 Prefab 的 localScale 或 anchoredPosition。
- `BRoom.Init`：`0x183dd7940`，绑定槽位及数据、更新名称和角标，没有重设变换。

因此保留房间根节点的 `1.0499999523162842` 缩放和原始偏移；子节点按锚点、轴心、sizeDelta 和 anchoredPosition 逐级计算。外框使用槽位尺寸，未清理房间使用各自的 `unclean_1x2`、`unclean_2x2`、`unclean_4x2`、`unclean_6x2`、`unclean_8x2` Prefab，控制中枢使用 `room_control_8x4`。

## 范围与验证边界

当前页面是无玩家存档的布局预览：普通槽位展示未清理状态，控制中枢展示其 Prefab。没有根据槽位类别臆造生产房间种类、干员数量或生产状态；升级、信赖满值和建造模式信息面板未启用。网页的“槽位信息”是独立辅助叠层。

图像与几何参数有游戏文件来源；浏览器 SVG 的字体基线、纹理采样、抗锯齿和色彩管线尚未与 Unity 进行逐像素同环境校准。背景和相机沿用现有分层实现，其绝对相位与运行时边界仍不属于本次房间资源核验的结论。不要把当前成果描述为整幅游戏画面已逐像素一致。
