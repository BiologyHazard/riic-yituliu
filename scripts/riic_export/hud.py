"""从内置界面和动态 Prefab 导出基建总览的屏幕 UI。"""

import hashlib
import struct
import zlib
lazy from typing import Any

from PIL import Image
from UnityPy.classes import PPtr

from .rules import NATIVE_PROFILES, read_language, text_bytes
lazy from .source import GameSource


def canvas_fit(source: GameSource) -> dict[str, Any]:
    """读取 `UICanvasScalerHelper.UpdateScalerFitMode` 调用的屏幕宽高比分支常量。"""
    path = source.base / "GameAssembly.dll"
    binary = path.read_bytes()
    if hashlib.sha256(binary).hexdigest() not in NATIVE_PROFILES:
        raise ValueError("当前游戏的屏幕 UI 缩放规则未经核验")
    pe = struct.unpack_from("<I", binary, 60)[0]
    section_count = struct.unpack_from("<H", binary, pe + 6)[0]
    optional_size = struct.unpack_from("<H", binary, pe + 20)[0]
    for index in range(section_count):
        position = pe + 24 + optional_size + index * 40
        _, rva, size, raw = struct.unpack_from("<4I", binary, position + 8)
        constant = 0x6E45C54
        if rva <= constant < rva + size:
            return {
                "aspectThreshold": struct.unpack_from(
                    "<f", binary, raw + constant - rva
                )[0],
                "wideMatch": 1,
                "narrowMatch": 0,
                "methodAddress": "0x18671f4c0",
                "constantRva": hex(constant),
            }
    raise ValueError("无法读取屏幕 UI 宽高比常量")


class HudExporter:
    def __init__(self, source: GameSource, language: dict[str, str]) -> None:
        self.source = source
        self.language = language
        self.templates: dict[str, Any] = {}
        self.sprites: dict[str, Any] = {}
        self.image_dir = source.output / "blueprint/hud"
        self.image_dir.mkdir(parents=True, exist_ok=True)

    def data(self, reader: Any, name: str) -> dict[str, Any]:
        template = reader.serialized_type.node or self.templates.get(name)
        if template is None:
            raise ValueError(f"屏幕 UI 缺少组件类型树：{name}")
        # 严格校验读取长度，禁止将裁剪后的组件头当作完整数据。
        return reader.read_typetree(nodes=template)

    def sprite(self, pointer: Any) -> str:
        key = hashlib.sha256(pointer.deref().assets_file.name.encode()).hexdigest()[:8]
        key += f"_{pointer.path_id}"
        if key in self.sprites:
            return key
        sprite = pointer.read()
        rd = sprite.m_RD
        if sprite.m_SpriteAtlas:
            atlas = sprite.m_SpriteAtlas.read()
            rd = next(
                value
                for k, value in atlas.m_RenderDataMap
                if k == sprite.m_RenderDataKey
            )
        image = Image.new(
            "RGBA", (round(sprite.m_Rect.width), round(sprite.m_Rect.height))
        )
        image.paste(
            sprite.image,
            (
                round(rd.textureRectOffset.x),
                round(
                    sprite.m_Rect.height
                    - rd.textureRectOffset.y
                    - rd.textureRect.height
                ),
            ),
        )
        image.save(self.image_dir / f"{key}.png")
        self.sprites[key] = {
            "name": sprite.m_Name,
            "sourceFile": pointer.deref().assets_file.name,
            "sourcePathId": str(pointer.path_id),
            "width": sprite.m_Rect.width,
            "height": sprite.m_Rect.height,
            "border": {k: getattr(sprite.m_Border, k) for k in ("x", "y", "z", "w")},
            "ppu": sprite.m_PixelsToUnits,
            "textureRect": {
                "x": rd.textureRectOffset.x,
                "y": sprite.m_Rect.height
                - rd.textureRectOffset.y
                - rd.textureRect.height,
                "width": rd.textureRect.width,
                "height": rd.textureRect.height,
            },
            "file": f"hud/{key}.png",
        }
        return key

    def atlas_sprite(self, reader: Any, data: dict[str, Any]) -> str:
        atlas = PPtr(**data["_initAtlas"], assetsfile=reader.assets_file).deref()
        atlas_data = self.data(atlas, "UIAtlasObject")
        entry = next(
            item
            for item in atlas_data["_sprites"]
            if item["guid"] == data["_initSpriteId"]
        )
        packed = next(
            item for item in atlas_data["_atlases"] if item["index"] == entry["atlas"]
        )
        texture = (
            PPtr(**packed["texture"], assetsfile=atlas.assets_file)
            .read()
            .image.convert("RGBA")
        )
        if packed["alpha"]["m_PathID"]:
            alpha = (
                PPtr(**packed["alpha"], assetsfile=atlas.assets_file)
                .read()
                .image.getchannel("R")
            )
            texture.putalpha(alpha)
        rect = entry["rect"]
        image = texture.crop(
            (
                rect["x"],
                texture.height - rect["y"] - rect["h"],
                rect["x"] + rect["w"],
                texture.height - rect["y"],
            )
        )
        if entry["rotate"]:
            image = image.transpose(Image.Transpose.ROTATE_90)
        key = f"atlas_{entry['guid']}"
        if key not in self.sprites:
            image.save(self.image_dir / f"{key}.png")
            self.sprites[key] = {
                "name": entry["name"],
                "sourceFile": atlas.assets_file.name,
                "sourcePathId": str(atlas.path_id),
                "width": image.width,
                "height": image.height,
                "border": {"x": 0, "y": 0, "z": 0, "w": 0},
                "ppu": 100,
                "file": f"hud/{key}.png",
            }
        return key

    def tree(self, pointer: Any, children: set[str] | None = None) -> dict[str, Any]:
        go = pointer.read()
        node: dict[str, Any] = {
            "name": go.m_Name,
            "id": str(pointer.path_id),
            "active": go.m_IsActive,
            "componentIds": [],
            "scripts": {},
            "children": [],
        }
        visual_scripts = {
            "HorizontalLayoutGroup",
            "VerticalLayoutGroup",
            "GridLayoutGroup",
            "ContentSizeFitter",
            "LayoutElement",
            "UIColorGraphic",
            "UIButton",
            "Button",
        }
        for pair in go.m_Component:
            reader = pair.component.deref()
            kind = reader.type.name
            node["componentIds"].append(str(reader.path_id))
            if kind == "RectTransform":
                data = reader.read_typetree()
                node["rect"] = {
                    k[2:]: data[k]
                    for k in (
                        "m_AnchorMin",
                        "m_AnchorMax",
                        "m_AnchoredPosition",
                        "m_SizeDelta",
                        "m_Pivot",
                        "m_LocalScale",
                        "m_LocalRotation",
                    )
                }
                node["children"] = [
                    self.tree(child.read().m_GameObject)
                    for child in reader.read().m_Children
                    if children is None
                    or child.read().m_GameObject.read().m_Name in children
                ]
            elif kind == "CanvasGroup":
                node["canvasGroup"] = reader.read_typetree()
            elif kind == "MonoBehaviour":
                name = reader.read(check_read=False).m_Script.read().m_ClassName
                if name not in visual_scripts | {
                    "Image",
                    "UIAtlasImage",
                    "Text",
                    "DynFontLoader",
                    "RectMask2D",
                    "BuildingSMRoomItemView",
                    "BuildingSMRoomGroupListView",
                    "UIRecycleVerticalLayoutGroup",
                    "SimpleLayoutContent",
                }:
                    continue
                data = self.data(reader, name)
                if name == "UIAtlasImage":
                    node["image"] = {
                        "sprite": self.atlas_sprite(reader, data),
                        "type": 0,
                        "preserveAspect": False,
                        "color": data["m_Color"],
                        "ppuMultiplier": 1,
                        "fillCenter": True,
                        "atlasSlice": data["_sliceVec"]
                        if data["_meshType"] == 1
                        else None,
                    }
                elif name == "Image":
                    ref = PPtr(**data["m_Sprite"], assetsfile=reader.assets_file)
                    node["image"] = {
                        "sprite": self.sprite(ref) if ref.path_id else "",
                        "type": data["m_Type"],
                        "preserveAspect": bool(data["m_PreserveAspect"]),
                        "color": data["m_Color"],
                        "ppuMultiplier": data["m_PixelsPerUnitMultiplier"],
                        "fillCenter": bool(data["m_FillCenter"]),
                    }
                elif name == "Text":
                    text_id = data.get("m_TextId", "")
                    value = data["m_Text"] or self.language.get(text_id, "")
                    if text_id and not value:
                        raise ValueError(f"屏幕 UI 缺少本地化：{text_id}")
                    font = PPtr(
                        **data["m_FontData"]["m_Font"], assetsfile=reader.assets_file
                    )
                    node["text"] = {
                        "value": value,
                        "textId": text_id,
                        "color": data["m_Color"],
                        "size": data["m_FontData"]["m_FontSize"],
                        "alignment": data["m_FontData"]["m_Alignment"],
                    }
                    if font.path_id:
                        node["font"] = font.read().m_Name
                elif name == "DynFontLoader":
                    node["font"] = data["_fontName"]
                else:
                    node["scripts"][name] = {
                        k: v
                        for k, v in data.items()
                        if k not in ("m_GameObject", "m_Script", "m_Name")
                    }
                    if name == "BuildingSMRoomItemView":
                        for style in data["_roomStyles"]:
                            style["sprite"] = self.sprite(
                                PPtr(**style["bkgImg"], assetsfile=reader.assets_file)
                            )
        return node

    def run(self) -> None:
        # 内置界面使用启动语言表，动态房间使用主语言表，两者缺一不可。
        init_path = self.source.find_asset("dyn/gamedata/excel/init_text")
        init_env = self.source.load_assets([init_path])
        self.language = {
            **read_language(text_bytes(init_env.container[init_path].read())),
            **self.language,
        }
        paths = [
            self.source.find_asset("dyn/building/blueprint/[uc]rooms/room_control"),
            "dyn/ui/pages/building_station_manage_page.prefab",
            "dyn/building/ui/common/panel_building_res_menu.prefab",
        ]
        env = self.source.load_assets(paths)
        for reader in env.objects:
            if reader.type.name == "MonoBehaviour" and reader.serialized_type.node:
                name = reader.read().m_Script.read().m_ClassName
                self.templates.setdefault(name, reader.serialized_type.node)
        builtin = self.source.load_file("Arknights_Data/sharedassets9.assets")
        roots = [
            o
            for o in builtin.objects
            if o.assets_file.name == "sharedassets9.assets"
            and o.type.name == "GameObject"
            and o.peek_name() == "building_float_page"
        ]
        if len(roots) != 1:
            raise ValueError("基建浮动界面根对象不唯一")
        root = roots[0]
        pointer = PPtr(m_FileID=0, m_PathID=root.path_id, assetsfile=root.assets_file)
        float_page = self.tree(
            pointer, {"panel_architecture_switch", "panel_common_topmenu"}
        )
        scaler = next(
            pair.component.deref()
            for pair in root.read().m_Component
            if pair.component.deref().type.name == "MonoBehaviour"
            and pair.component.deref()
            .read(check_read=False)
            .m_Script.read()
            .m_ClassName
            == "CanvasScaler"
        )
        scale_data = self.data(scaler, "CanvasScaler")
        top_holder = next(
            n
            for n in root.read().m_Component
            if n.component.deref().type.name == "RectTransform"
        ).component.read()
        top_go = next(
            c.read().m_GameObject.read()
            for c in top_holder.m_Children
            if c.read().m_GameObject.read().m_Name == "panel_common_topmenu"
        )
        inst = next(
            pair.component.deref()
            for pair in top_go.m_Component
            if pair.component.deref().type.name == "MonoBehaviour"
        )
        inst_data = self.data(inst, "PrefabInstHolder")
        top_menu = self.tree(PPtr(**inst_data["_prefab"], assetsfile=inst.assets_file))
        prefabs = {
            "float": float_page,
            "topMenu": top_menu,
            "resources": self.tree(env.container[paths[2]]),
            "overview": self.tree(env.container[paths[1]]),
            "overviewRoom": self.tree(
                env.container["dyn/building/ui/stationmanage/panel_room_item.prefab"]
            ),
            "overviewTitle": self.tree(
                env.container["dyn/building/ui/stationmanage/panel_storey_title.prefab"]
            ),
        }
        for name in ("panel_bp_or_vault", "panel_blueprint", "panel_architecture"):
            prefabs[name] = self.tree(
                env.container[f"dyn/building/[pack]room/state/{name}.prefab"]
            )
        switch_positions = {}
        for reader in builtin.objects:
            if reader.type.name != "AnimationClip" or reader.peek_name() not in (
                "architecture_switch_on",
                "architecture_switch_off",
            ):
                continue
            clip = reader.read_typetree()
            bindings = clip["m_ClipBindingConstant"]["genericBindings"]
            curves = clip["m_MuscleClip"]["m_Clip"]["data"]
            if (
                clip["m_MuscleClip"]["m_StopTime"] != 0
                or curves["m_DenseClip"]["m_CurveCount"] != 0
            ):
                raise ValueError("建造开关不再使用静态动画，需要重新核验曲线")
            index = next(
                i
                for i, binding in enumerate(bindings)
                if binding["path"] == zlib.crc32(b"button")
                and binding["attribute"] == zlib.crc32(b"m_AnchoredPosition.x")
            )
            switch_positions[clip["m_Name"].rsplit("_", 1)[-1]] = curves[
                "m_ConstantClip"
            ]["data"][index]
        if set(switch_positions) != {"on", "off"}:
            raise ValueError("建造开关动画不完整")
        self.source.write_json(
            "hud.json",
            {
                "canvas": {
                    "referenceResolution": scale_data["m_ReferenceResolution"],
                    "matchWidthOrHeight": scale_data["m_MatchWidthOrHeight"],
                    "screenMatchMode": scale_data["m_ScreenMatchMode"],
                },
                "sprites": self.sprites,
                "prefabs": prefabs,
                "switchPositions": switch_positions,
                "canvasFit": canvas_fit(self.source),
            },
        )
