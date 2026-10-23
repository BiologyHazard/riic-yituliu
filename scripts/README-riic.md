# 基建地图资源生成

入口为 `scripts/generate_riic.py`，需要 Python 3.15 及以上版本和 uv。Python 依赖在脚本的 PEP 723 元数据中固定版本，由 uv 自动创建隔离环境安装。脚本只读取本机游戏文件，不访问游戏账号或网络接口。

在项目根目录运行（PowerShell）：

```powershell
$env:ARKNIGHTS_BASE_DIR = 'D:\Program Files\Hypergryph Launcher\games\Arknights'
npm run generate:riic
```

`ARKNIGHTS_BASE_DIR` 必须指向包含 `Arknights_Data` 和 `GameAssembly.dll` 的 Windows 游戏安装目录。安装路径不会写入生成的数据。脚本从当前游戏的资源清单解析 Bundle 依赖，而非使用固定的匿名包文件名。

## 输出

默认输出到 `src/assets/images/riic`：

- `blueprint/blueprint-prefabs.json`：全部蓝图房间、状态、布局与 Sprite 元数据。
- `blueprint/room-rules.json`：设施、等级、容量、布局与配方规则。
- `blueprint/runtime-rules.json`：游戏状态文案与原生动画常量。
- `blueprint/scene-rules.json`：蓝图场景的视场角、宽度适配系数、默认横坐标与越界余量，以及对象身份和字段偏移。
- `blueprint/hud.json`：总览屏幕 UI、通用导航、进驻总览页面与列表项的原始层级、Sprite 身份、建造开关静态动画值及屏幕缩放分支常量。
- `blueprint/hud/*.png`：103 张屏幕 UI 图像，包含普通 Sprite 和拆分透明通道后的 UIAtlas 图块；图片在本机生成并由 Git 忽略。
- `blueprint/training-animation.json`：训练动画的绑定和原始曲线。
- `blueprint/font-metrics.json`：游戏字体的字号、ascent、descent 与行距。
- `blueprint/sources.json`：输入文件的游戏根目录相对路径及 SHA-256。
- `blueprint/*.png`、`blueprint/*.otf`：60 张 Sprite 和 3 个字体。
- `blueprint_*.png`：5 张地图背景，按完整逻辑矩形保留透明边距。

当前版本共生成 179 个文件。用户指定的默认布局状态仍由页面配置管理，不属于游戏安装包提取结果；角色头像等页面原有动态数据源也不在本生成器范围内。

## 校验与其他输出目录

```powershell
npm run generate:riic:check
uv run scripts/generate_riic.py --output ./generated-riic
```

`--check` 重新提取并检查所有产物，JSON 按结构比较，图片与字体按字节比较；发现缺失或不一致时返回非零退出码，不写入现有文件。正常生成先在系统临时目录完成全部提取和验证，再发布发生变化的文件；不会删除输出目录内的其他文件。不依赖预先生成的数据、调查目录或其他项目的 Python 包。

## 数据身份与版本约束

Sprite 通过 Prefab 的实际对象引用解析。同名但不同的被引用资源会报错，不能跨 Bundle 仅凭名称覆盖裁剪数据。图像保留 `m_PreserveAspect`、逻辑矩形、纹理裁剪偏移和 `sourcePathId`。非有限布局数值输出为 `null`，所有 `m_PathID` 输出为字符串。

`riic_export/schemas` 保存解码本机 FlatBuffers 所需的结构描述。`riic_export/rules.py` 的原生常量地址按 `GameAssembly.dll` 的 SHA-256 绑定，只读取已核验版本；未知版本会在发布前报错，必须重新定位常量并更新配置，不能绕过校验继续套用旧地址。字体若切换到旧版边界算法，同样会停止生成以便重新核验排版。

`riic_export/scene.py` 同样绑定 `level9` 的 SHA-256，校验对象长度、相机引用和 XY 平面配置后读取序列化字段。相机默认坐标与最终边界约束的区别见 [相机核对记录](README-riic-camera.md)。

屏幕 UI 的源对象、渲染规则及当前交互范围见 [屏幕 UI 核验记录](README-riic-hud.md)。
