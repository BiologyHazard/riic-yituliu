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
| 进驻总览页面、房间项及楼层标题 | `dyn/ui/pages/building_station_manage_page.prefab` 与其实际 Bundle 依赖 |
| 固定文字 | `dyn/gamedata/excel/init_text*.bytes` 和 `main_text*.bytes` |
| 字体 | `sharedassets1.assets` 中的 `NotoSansHans-Medium`、`JovannyLemonad-Bender`、`JovannyLemonad-Bender-Light` |

普通 Sprite 按实际对象引用导出，并保留逻辑矩形、裁剪边距、九宫格边距及 PPU。UIAtlas 按 `_initAtlas`、`_initSpriteId` 定位图块，恢复旋转与独立透明通道；布局保留其 `_sliceVec`。禁止仅凭同名资源互相替代。

内置资源裁剪了部分组件类型树；生成器从同一游戏版本的 Bundle 读取同名组件类型树，并严格校验序列化读取长度。没有完整类型树的业务脚本不作为已恢复的字段输出。所有对象引用编号以字符串保存，避免 JavaScript 整数精度损失。

## 变换与缩放

屏幕 UI 与蓝图房间相机分别计算。`CanvasScaler` 的参考分辨率是 `1280 × 720`。`UICanvasScalerHelper.UpdateScalerFitMode` 在 `0x1814d1041` 调用 `0x18671f4c0`，该函数将屏幕宽高比与 RVA `0x6e45c54` 的 `1.7777777910232544` 比较：较宽时使用高度适配，否则使用宽度适配。生成器按已核验的 `GameAssembly.dll` SHA-256 校验并读取阈值，未知版本停止生成。

`architecture_switch_on` 和 `architecture_switch_off` 是时长为零的静态动画；`button` 的 `m_AnchoredPosition.x` 分别为 `24.799999237060547` 和 `-25.299999237060547`，同时切换 `panel_on` 与 `panel_off` 的 CanvasGroup 透明度。生成器根据动画绑定的路径 CRC32 与属性 CRC32 获取值，不在前端手写开关位移。

网页渲染器使用原始锚点、轴心、缩放、旋转、CanvasGroup、布局组和文字对齐。透明 HTML 按钮只负责键盘、读屏和点击热区，按钮外观由游戏图像与文字绘制。屏幕 UI 阻止按键热区的指针事件进入地图拖动逻辑；进驻总览打开时，底层房间不能获得键盘焦点。

## 页面状态与交互范围

`/riic-map` 使用独立游戏视口。普通状态显示进驻人数和生产信息；切换建造模式后使用房间 Prefab 的建造信息分组，并显示游戏的上下装饰和建造模式提示。菜单支持展开、收起及回到基建；返回优先关闭菜单或退出建造模式，再返回网站首页。

无人机和龙门币由 `BaseMapDiagram.resources` 提供，未提供时为零；无人机上限由已建成槽位的 `provideLabor` 相加。电力消耗与供给分别汇总当前设施等级 `phases[].electricity` 的负值和正值。资源栏中的 Prefab 示例数字不能当作玩家存档。

进驻总览接入游戏页面、工作区与非工作区切换、楼层和房间列表，并显示本地布局的进驻总数与容量。房间项可以打开现有本地状态编辑器。当前房间状态只有人数，没有完整进驻干员身份，因此不生成虚构的干员卡片；队列轮换、干员选择、全局页面导航、帮助页面及资源购买业务尚未实现。原有本地状态编辑器仍使用网页组件，尚未还原游戏的房间详情页面。

此实现核验了静态游戏资源及部分原生显示分支，并通过浏览器检查所列界面的显示与跳转。它不证明运行中热更新委托、服务端结算或 Unity 与浏览器的字体栅格化逐像素相同，也不代表整套基建游戏业务已经完成。
