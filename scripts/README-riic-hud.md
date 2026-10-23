# 基建屏幕 UI

`riic_export/hud.py` 只读取本机游戏安装文件。资源位置、对象身份和输入文件 SHA-256 随生成结果保存，页面不依赖截图、外部设计稿或调查文件。执行 `npm run generate:riic` 可以重新生成所有布局和图像；图像与字体只在本机生成，版本库保存生成器及 JSON 元数据。

## 数据来源

| 界面 | 游戏资源 |
| --- | --- |
| 建造模式开关、导航栏容器、屏幕 Canvas | `Arknights_Data/sharedassets9.assets` 的 `building_float_page`，GameObject `329` |
| 返回、菜单及展开的导航面板 | `building_float_page` 的 `panel_common_topmenu` 通过 `PrefabInstHolder._prefab` 引用的 `sharedassets1.assets` 对象 `1331` |
| 进驻总览按钮 | `dyn/building/[pack]room/state/panel_bp_or_vault.prefab` |
| 帮助图标 | `dyn/building/[pack]room/state/panel_blueprint.prefab` |
| 建造模式上下装饰及提示 | `dyn/building/[pack]room/state/panel_architecture.prefab` |
| 无人机、电力、龙门币 | `dyn/building/ui/common/panel_building_res_menu.prefab` |
| 进驻总览页面、房间项及设施分组标题 | `dyn/ui/pages/building_station_manage_page.prefab` 与其实际 Bundle 依赖 |
| 总览干员卡片与等级标记 | `dyn/building/ui/stationmanage/panel_char_item.prefab` 与 `widget_progress_level_item` |
| 干员名称与默认头像 | `character_table`、`building_data.chars` 与 `dyn/arts/charavatars/` 的交集 |
| 固定文字 | `dyn/gamedata/excel/init_text*.bytes` 和 `main_text*.bytes` |
| 字体 | `sharedassets1.assets` 中的 `NotoSansHans-Medium`、`JovannyLemonad-Bender`、`JovannyLemonad-Bender-Light` |

普通 Sprite 按实际对象引用导出，并保留逻辑矩形、裁剪边距、九宫格边距及 PPU。UIAtlas 按 `_initAtlas`、`_initSpriteId` 定位图块，恢复旋转与独立透明通道；布局保留其 `_sliceVec`。禁止仅凭同名资源互相替代。

内置资源裁剪了部分组件类型树；生成器从同一游戏版本的 Bundle 读取同名组件类型树，并严格校验序列化读取长度。没有完整类型树的业务脚本不作为已恢复的字段输出。所有对象引用编号以字符串保存，避免 JavaScript 整数精度损失。

## 变换与缩放

屏幕 UI 与蓝图房间相机分别计算。`CanvasScaler` 的参考分辨率是 `1280 × 720`。`UICanvasScalerHelper.UpdateScalerFitMode` 在 `0x1814d1041` 调用 `0x18671f4c0`，该函数将屏幕宽高比与 RVA `0x6e45c54` 的 `1.7777777910232544` 比较：较宽时使用高度适配，否则使用宽度适配。生成器按已核验的 `GameAssembly.dll` SHA-256 校验并读取阈值，未知版本停止生成。

`architecture_switch_on` 和 `architecture_switch_off` 是时长为零的静态动画；`button` 的 `m_AnchoredPosition.x` 分别为 `24.799999237060547` 和 `-25.299999237060547`，同时切换 `panel_on` 与 `panel_off` 的 CanvasGroup 透明度。生成器根据动画绑定的路径 CRC32 与属性 CRC32 获取值，不在前端手写开关位移。

网页渲染器使用原始锚点、轴心、缩放、旋转、CanvasGroup、布局组和文字对齐。透明 HTML 按钮只负责键盘、读屏和点击热区，按钮外观由游戏图像与文字绘制。屏幕 UI 阻止按键热区的指针事件进入地图拖动逻辑；进驻总览打开时，底层房间不能获得键盘焦点。

展开菜单遵循 `CommonTopMenu._ResetDetailContentRect` 的屏幕边界转换，将 `panel_content` 扩展到视口边缘。按压通过 `Button`／`UIButton.m_Colors.m_PressedColor` 和 `m_TargetGraphic` 着色，`UIColorGraphic._colorElements` 继续解析到实际图形；同一 Prefab 多实例的引用在实例范围内解析。热区自身不绘制按压背景。

渲染器支持无 Sprite 的纯色 Image、嵌套 `RectMask2D` 的交集，以及 UIAtlas 中零宽中心采样线的九宫格拉伸，避免统计标签背景缺失和切换按钮中部断裂。

## 页面状态与交互范围

`/riic-map` 默认使用 16:9 内嵌游戏视口。网页全屏以固定定位占满网页；全屏通过 Fullscreen API 请求整个文档进入浏览器全屏，以保留编辑器 Portal。主界面的返回按钮退出当前全屏状态，普通状态不跳转。菜单与进驻总览保留各自的返回层级。Esc 关闭网页全屏时尊重编辑器和下拉框的事件处理。普通状态显示进驻人数和生产信息；切换建造模式后使用房间 Prefab 的建造信息分组，并显示游戏的上下装饰和建造模式提示。

无人机和龙门币由 `BaseMapDiagram.resources` 提供，未提供时为零；无人机上限由已建成槽位的 `provideLabor` 相加。电力消耗与供给分别汇总当前设施等级 `phases[].electricity` 的负值和正值。资源栏中的 Prefab 示例数字不能当作玩家存档。

进驻总览按 `slotPrequeDatas` 的 `typeSortId` 分组；非工作区使用 `dormitoryPrequeDatas`，只包含宿舍。标题和房间行高度分别来自组件的 `_preferHeight`，当前为 40 和 159。原始模板提供设施色、等级标记、五个头像槽、统计标签、工作／休息切换及底部按钮。房间数量文案来自游戏字符串表。列表支持滚轮、拖动滚动条和键盘翻页。

本地房间编辑器可选择干员，名称和头像均从游戏安装文件导出，当前包含 429 名基建干员。总览使用原始干员卡片、心情图标、疲劳遮罩与空槽分支。人数预览与具体身份分别保存；只设置人数时不虚构头像。当前心情仍使用房间级疲劳状态，没有独立心情数值或未进驻干员名册，批量休整候选人数为零。

队列编辑与轮换、批量进驻／休整、宿舍锁定、全局页面导航、帮助页面及资源购买业务尚未实现；对应原始图形不表示已接通业务。点击房间仍打开网页状态编辑器，尚未还原游戏的房间详情和干员筛选页面。

此实现核验了静态游戏资源及部分原生显示分支，并通过浏览器检查所列界面的显示与跳转。它不证明运行中热更新委托、服务端结算或 Unity 与浏览器的字体栅格化逐像素相同，也不代表整套基建游戏业务已经完成。

## 房间名称、编号与等级的排列

`panel_room_item.prefab` 的 `info.HorizontalLayoutGroup` 使用左内边距 `12`、子项间距 `12`、`m_ChildControlWidth = 1`，未启用宽度强制扩展。`text_name` 按原字体和字号计算文本宽度；`text_index_holder` 只有 RectTransform 和 CanvasRenderer，宽度为 `0`，不从子文字获取固有宽度。其子节点 `text_index` 的横向偏移是 `-10.100000381469727`，自身矩形宽度 `12.918418884277344` 不能转移到父容器上。

`BuildingSMRoomItemView.Render`（当前游戏地址 `0x183ea0470`）的编号分支更新容器显隐和数字文本，没有把子文字宽度写入容器。网页因此保留原始零宽容器，名称、编号和等级按布局组的两个间隔排列。等级条使用原始 `GridLayoutGroup` 的 `9 × 26` 单元格与横向间距 `2`。此前将子文字宽度赋给编号容器的实现会额外推开等级标记，已移除。

## UIAtlas 旋转图块

图集中的 `rotate = 1` 通过 `UIAtlasImage._AddQuadRotate`（当前游戏地址 `0x181388320`）绘制。原生四角映射为：屏幕左下采样图块右下、屏幕左上采样图块左下、屏幕右上采样图块左上、屏幕右下采样图块右上。将纹理裁剪为左上原点的图片后，应使用 Pillow `ROTATE_270`，即顺时针 90° 还原；`ROTATE_90` 会使结果额外颠倒 180°。

`btn_batch_rest` 图块在图集中为 `73 × 82` 且带旋转标记。其阴影和透明边距必须随图像一起正确还原，然后按 Prefab 的原始矩形、九宫格和文字坐标绘制。导出器统一修正带旋转标记的图块，按钮的文字坐标不添加补偿偏移。`icon_rest` 未带旋转标记，保持原始方向。
