# 基建蓝图相机核对记录

核对日期：2026-10-22。以下结论来自本机 Windows 游戏的场景、IL2CPP 元数据与原生指令，覆盖蓝图总览相机的默认复位、距离计算和边界约束。

## 文件身份

| 文件                                                      | SHA-256                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `GameAssembly.dll`                                        | `583b04ff4d1b1a4b35eaf09d77d936408c25447c9e345ef0463d814b6a123fc5` |
| `Arknights_Data/level9`                                   | `49b9ea242c2acb790d09f8e7687b790e242f7782b98559b0c0a795559a57f0f9` |
| `Arknights_Data/il2cpp_data/Metadata/global-metadata.dat` | `d3fede171f92740a6f5dc053c58c7013d3c962db764ad1f05cbe977c074fcd1f` |

## 场景字段

偏移均为 Unity 对象原始序列化数据中的字节偏移，不是 IL2CPP 运行时对象偏移。元数据确认 `BCameraController` 的字段顺序为 `_touchCamera`、`_zoomXRatioFitC`、`_defaultPositionX`、`m_tanFOV`、`m_defaultPosition`、`m_handler`。

| 对象 PathID | 字段                | 偏移 | 值                    |
| ----------- | ------------------- | ---- | --------------------- |
| `412`       | `_zoomXRatioFitC`   | `44` | `0.7200000286102295`  |
| `412`       | `_defaultPositionX` | `48` | `-3.6700000762939453` |
| `214`       | 垂直视场角          | `88` | `30` 度               |
| `440`       | `camOverdragMargin` | `52` | `0`                   |

控制器的 `_touchCamera` 引用对象 `440`；触控相机与 Camera `214` 引用同一 GameObject，`cameraAxes = 0`，使用 XY 平面。生成器校验场景哈希后提取这些字段，产物为 `scene-rules.json`。

## 原生控制流

- `BCameraController.ResetPosition`，VA `0x183dd0ef0`：先检查热更新委托；未走委托时，检查 `m_defaultPosition.HasValue`。有值则恢复保存的完整三维位置；无值则写入 `(_defaultPositionX, 0, 当前 Z)`。因此默认分支读取 `-3.67` 的说法正确，但不能推导出所有复位都固定写入该值。
- `BCameraController.ZoomTo`，VA `0x183dd1280`：在 `0x183dd14ee` 至 `0x183dd1554` 构造并保存可空位置，根据参数选择默认横坐标或目标位置。保存位置分支确实存在；网页当前房间编辑器没有对应的三维聚焦流程，不能宣称覆盖了该流程。
- `BCameraController.CalcCamZoom`，VA `0x183dd0ac0`：宽度距离为 `宽度 / (2 × 屏幕宽高比 × tan(垂直视场角 / 2))`，高度距离为 `高度 / (2 × tan(垂直视场角 / 2))`。模式 `0` 返回 `max(宽度距离 × _zoomXRatioFitC, 高度距离)`，模式 `2` 返回高度距离。
- `BLayoutManager._ResetLayout`，VA `0x183dd5110`：由布局的世界 Bounds 设置边界，将远端距离设为上述模式 `0` 与模式 `2` 结果的最大值，近端距离设为模式 `2` 结果的 `0.75` 倍，并将当前距离设为远端。
- `MobileTouchCamera.ComputeCamBoundaries`，VA `0x18187e740`：按视口投影求可移动范围；若某轴范围小于两倍 `camOverdragMargin`，在该范围中心重新设置为中心 ± 余量。当前场景余量为 `0`，视口大于布局时该轴锁定中心。
- `MobileTouchCamera.LateUpdate`，VA `0x181881900`，调用 `UpdatePosition`，VA `0x181883c10`。后者在 `0x181884243` 起将最终 XY 坐标限制到有效边界。因此复位写入值仍会受到后续边界约束。

## 网页处理

视场角、适配系数、默认横坐标和边界余量从场景产物读取。总览复位先使用场景默认位置，再立即应用当前视口的边界约束，避免复位按钮留下越界位置，直到下一次拖动或尺寸变化才突然跳回。组件尺寸变化和缩放继续应用同一约束。

对中心在原点、宽高为 `W`、`H` 的当前蓝图，投影视口宽高为 `Vw`、`Vh` 时，横向限制为 `±max(0, (W - Vw) / 2)`，纵向同理。`-3.67` 可能被限制为边界值，甚至为 `0`；看到最终坐标为 `0` 本身不能证明复刻错误。必须结合距离、视口和边界判断。

## 证据范围

这些结果确认了指定文件版本的序列化值及原生默认控制流，没有确认运行时热更新委托是否替换这些方法，也没有完成相同状态、相同视口下游戏与网页的逐像素验收。该记录不代表全部基建 UI、动画、交互或游戏状态已经完全复刻。
