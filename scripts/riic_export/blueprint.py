"""导出蓝图层级、Sprite、字体与训练动画。"""

import struct
import zlib
lazy from typing import Any

from UnityPy.classes import PPtr

from .source import json_safe
lazy from .source import GameSource


class BlueprintExporter:
    def __init__(self, source: GameSource, language: dict[str, str]) -> None:
        self.source = source
        self.language = language
        self.sprites: dict[str, Any] = {}
        self.level_prefabs: dict[str, Any] = {}

    def sprite(self, pointer: Any) -> str:
        sprite = pointer.read()
        name = sprite.m_Name
        identity = (pointer.deref().assets_file.name, str(pointer.path_id))
        if name in self.sprites:
            if self.sprites[name]["identity"] != identity:
                raise ValueError(f"蓝图引用了同名但不同的 Sprite：{name}")
            return name
        rd = sprite.m_RD
        if sprite.m_SpriteAtlas:
            atlas = sprite.m_SpriteAtlas.read()
            rd = next(
                value
                for key, value in atlas.m_RenderDataMap
                if key == sprite.m_RenderDataKey
            )
        self.sprites[name] = {
            "identity": identity,
            "data": {
                "width": sprite.m_Rect.width,
                "height": sprite.m_Rect.height,
                "border": {
                    key: getattr(sprite.m_Border, key) for key in ("x", "y", "z", "w")
                },
                "ppu": sprite.m_PixelsToUnits,
                "sourcePathId": str(pointer.path_id),
                "textureRect": {
                    "x": rd.textureRectOffset.x,
                    "y": sprite.m_Rect.height
                    - rd.textureRectOffset.y
                    - rd.textureRect.height,
                    "width": rd.textureRect.width,
                    "height": rd.textureRect.height,
                },
            },
        }
        sprite.image.save(self.source.output / "blueprint" / f"{name}.png")
        return name

    def tree(self, pointer: Any) -> dict[str, Any]:
        go = pointer.read()
        result: dict[str, Any] = {
            "name": go.m_Name,
            "id": str(pointer.path_id),
            "active": go.m_IsActive,
            "componentIds": [],
            "scripts": {},
            "children": [],
        }
        for pair in go.m_Component:
            reader = pair.component.deref()
            data = reader.read_typetree()
            result["componentIds"].append(str(reader.path_id))
            if reader.type.name == "RectTransform":
                keys = (
                    "m_AnchorMin",
                    "m_AnchorMax",
                    "m_AnchoredPosition",
                    "m_SizeDelta",
                    "m_Pivot",
                    "m_LocalScale",
                    "m_LocalRotation",
                )
                result["rect"] = {
                    key[2:]: value for key, value in data.items() if key in keys
                }
                result["children"] = [
                    self.tree(child.read().m_GameObject)
                    for child in reader.read().m_Children
                ]
            elif reader.type.name == "CanvasGroup":
                result["canvasGroup"] = data
            elif reader.type.name == "MonoBehaviour":
                script = reader.read().m_Script.read().m_ClassName
                if script == "Image":
                    ref = PPtr(**data["m_Sprite"], assetsfile=reader.assets_file)
                    name = self.sprite(ref) if ref.path_id else ""
                    result["image"] = {
                        "sprite": name,
                        "type": data["m_Type"],
                        "preserveAspect": bool(data["m_PreserveAspect"]),
                        "color": data["m_Color"],
                        "ppuMultiplier": data["m_PixelsPerUnitMultiplier"],
                        "fillCenter": bool(data["m_FillCenter"]),
                        "fillMethod": data["m_FillMethod"],
                        "fillAmount": data["m_FillAmount"],
                        "fillOrigin": data["m_FillOrigin"],
                        "fillClockwise": bool(data["m_FillClockwise"]),
                    }
                elif script == "Text":
                    text_id = data.get("m_TextId", "")
                    if text_id and not data["m_Text"] and text_id not in self.language:
                        raise ValueError(f"缺少本地化：{text_id}")
                    result["text"] = {
                        "value": data["m_Text"] or self.language.get(text_id, ""),
                        "textId": text_id,
                        "color": data["m_Color"],
                        "size": data["m_FontData"]["m_FontSize"],
                        "alignment": data["m_FontData"]["m_Alignment"],
                        "fontData": data["m_FontData"],
                    }
                elif script == "DynFontLoader":
                    result["font"] = data["_fontName"]
                else:
                    result["scripts"][script] = json_safe(
                        {
                            key: value
                            for key, value in data.items()
                            if key not in ("m_GameObject", "m_Script", "m_Name")
                        }
                    )
                    if script == "SimpleLayoutContent" and data.get(
                        "_viewPrefab", {}
                    ).get("m_PathID"):
                        ref = PPtr(**data["_viewPrefab"], assetsfile=reader.assets_file)
                        self.level_prefabs[str(ref.path_id)] = ref
        order = (
            "name",
            "id",
            "active",
            "rect",
            "componentIds",
            "scripts",
            "image",
            "text",
            "font",
            "canvasGroup",
            "children",
        )
        return {key: result[key] for key in order if key in result}

    def run(self) -> None:
        paths = [
            a["path"]
            for a in self.source.manifest["assetToBundleList"]
            if (a.get("path") or "").startswith("dyn/building/blueprint/[uc]rooms/")
            and a["path"].endswith(".prefab")
        ]
        if not paths:
            raise ValueError("没有找到蓝图房间 Prefab")
        env = self.source.load_assets(paths)
        prefabs = {}
        for path in sorted(paths):
            node = self.tree(env.container[path])
            if node["name"] in prefabs:
                raise ValueError(f"重复 Prefab 名称：{node['name']}")
            prefabs[node["name"]] = node
        if len(self.level_prefabs) != 1:
            raise ValueError("等级单元 Prefab 引用不唯一")
        prefabs["level_item"] = self.tree(next(iter(self.level_prefabs.values())))
        prefabs["frame"] = next(
            child
            for child in prefabs["room_slot"]["children"]
            if child["name"] == "bkg_frame"
        )
        clips = [
            obj
            for obj in env.objects
            if obj.type.name == "AnimationClip" and obj.peek_name() == "shining"
        ]
        if len(clips) != 1:
            raise ValueError("训练动画 shining 不唯一")
        export_animation(self.source, clips[0])
        special_path = self.source.find_asset("dyn/arts/specialized_hub.prefab")
        specialized = self.source.load_assets([special_path])
        found: set[str] = set()
        for obj in specialized.objects:
            if obj.type.name == "Sprite" and (obj.peek_name() or "").startswith(
                "specialized_tiny_"
            ):
                found.add(
                    self.sprite(
                        PPtr(
                            m_FileID=0, m_PathID=obj.path_id, assetsfile=obj.assets_file
                        )
                    )
                )
        if found != {f"specialized_tiny_{i}" for i in range(4)}:
            raise ValueError(f"专精图标不完整：{found}")
        self.source.write_json(
            "blueprint-prefabs.json",
            {
                "sprites": {name: item["data"] for name, item in self.sprites.items()},
                "prefabs": prefabs,
            },
        )


def export_animation(source: GameSource, reader: Any) -> None:
    clip = reader.read_typetree()
    bindings = clip["m_ClipBindingConstant"]["genericBindings"]
    indices = {}
    for name in ("start_icon", "end_icon"):
        matches = [
            i
            for i, binding in enumerate(bindings)
            if binding["path"] == zlib.crc32(name.encode())
            and binding["attribute"] == zlib.crc32(b"m_Color.a")
        ]
        if len(matches) != 1:
            raise ValueError(f"无法确定训练动画绑定：{name}")
        indices[name] = matches[0]
    streamed = clip["m_MuscleClip"]["m_Clip"]["data"]["m_StreamedClip"]["data"]
    binary = struct.pack(f"<{len(streamed)}I", *streamed)
    position = 0
    frames = []
    duration = clip["m_MuscleClip"]["m_StopTime"]
    while position < len(binary):
        time, count = struct.unpack_from("<fI", binary, position)
        position += 8
        curves = {}
        for _ in range(count):
            curve, *coefficients = struct.unpack_from("<I4f", binary, position)
            position += 20
            curves[str(curve)] = coefficients
        if 0 <= time <= duration:
            frames.append({"time": time, "curves": curves})
    source.write_json(
        "training-animation.json",
        {
            "source": clip["m_Name"],
            "pathId": str(reader.path_id),
            "duration": duration,
            "bindings": indices,
            "frames": frames,
        },
    )


def export_fonts_and_background(source: GameSource) -> None:
    names = {
        "NotoSansHans-Medium",
        "JovannyLemonad-Bender",
        "JovannyLemonad-Bender-Light",
    }
    metrics = {}
    for obj in source.load_file("Arknights_Data/sharedassets1.assets").objects:
        if obj.type.name != "Font" or obj.peek_name() not in names:
            continue
        font = obj.read()
        if font.m_Name in metrics:
            raise ValueError(f"重复字体：{font.m_Name}")
        (source.output / "blueprint" / f"{font.m_Name}.otf").write_bytes(
            bytes(font.m_FontData)
        )
        data = obj.read_typetree()
        if data["m_UseLegacyBoundsCalculation"]:
            raise ValueError("当前字体使用旧版边界计算，需要重新核验基线")
        metrics[font.m_Name] = {
            "fontSize": data["m_FontSize"],
            "ascent": data["m_Ascent"],
            "descent": data["m_Descent"],
            "lineSpacing": data["m_LineSpacing"],
        }
    if set(metrics) != names:
        raise ValueError("游戏字体不完整")
    source.write_json("font-metrics.json", metrics)
    backgrounds = {
        "blueprint_bkg_fill",
        "blueprint_bkg_grid",
        "blueprint_bkg_rect",
        "blueprint_dark_slide",
        "blueprint_ftg",
    }
    found = set()
    for obj in source.load_file("Arknights_Data/sharedassets9.assets").objects:
        if obj.type.name == "Sprite" and obj.peek_name() in backgrounds:
            sprite = obj.read()
            if sprite.m_Name in found:
                raise ValueError(f"重复背景图：{sprite.m_Name}")
            # 背景以完整逻辑矩形平铺，不能使用去掉透明边距的 Sprite PNG。
            texture = sprite.m_RD.texture.read().image
            rect = sprite.m_Rect
            texture.crop(
                (
                    rect.x,
                    texture.height - rect.y - rect.height,
                    rect.x + rect.width,
                    texture.height - rect.y,
                )
            ).save(source.output / f"{sprite.m_Name}.png")
            found.add(sprite.m_Name)
    if found != backgrounds:
        raise ValueError(f"缺少背景图：{backgrounds - found}")

