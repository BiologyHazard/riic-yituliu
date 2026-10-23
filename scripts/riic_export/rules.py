"""从游戏资源表和已核验的原生常量生成基建规则。"""

import hashlib
import json
import re
import struct
from pathlib import Path
lazy from typing import Any

from ark_fbs import Options, Schema

lazy from .source import GameSource

ROOM_KEYS = (
    "rooms",
    "layouts",
    "roomUnlockConds",
    "controlData",
    "manufactData",
    "tradingData",
    "hireData",
    "meetingData",
    "trainingData",
    "workshopData",
    "powerData",
    "dormData",
    "privateRoomData",
    "recycleData",
    "manufactFormulas",
    "tradingStrategyUnlockLevel",
    "humanResourceLimit",
    "socialResourceLimit",
    "socialSlotNum",
    "tiredApThreshold",
    "manpowerDisplayFactor",
    "recycleRoomConsts",
    "slotPrequeDatas",
    "dormitoryPrequeDatas",
    "stationManageConstData",
)

# 原生地址只适用于已核验的二进制，更新游戏后必须重新定位，不能继续读取旧偏移。
NATIVE_PROFILES = {
    "583b04ff4d1b1a4b35eaf09d77d936408c25447c9e345ef0463d814b6a123fc5": {
        "workingDuration": 0x6E404D0,
        "workingTarget": 0x6E48890,
        "progressEpsilon": 0x6E3FD88,
    }
}


def text_bytes(asset: Any) -> bytes:
    """对称还原 UnityPy 的二进制 TextAsset 字符串。"""
    value = asset.m_Script
    return (
        value if isinstance(value, bytes) else value.encode("utf-8", "surrogateescape")
    )


def read_language(raw: bytes) -> dict[str, str]:
    """读取语言表的原始字典，包括 `&&` 开头的本地化标识。"""
    payload = raw[128:]

    def uint32(offset: int) -> int:
        return struct.unpack_from("<I", payload, offset)[0]

    def uint16(offset: int) -> int:
        return struct.unpack_from("<H", payload, offset)[0]

    def string(offset: int) -> str:
        start = offset + uint32(offset)
        length = uint32(start)
        return payload[start + 4 : start + 4 + length].decode("utf-8")

    root = uint32(0)
    vtable = root - struct.unpack_from("<i", payload, root)[0]
    field = root + uint16(vtable + 4)
    vector = field + uint32(field)
    result: dict[str, str] = {}
    for index in range(uint32(vector)):
        pointer = vector + 4 + index * 4
        entry = pointer + uint32(pointer)
        entry_vtable = entry - struct.unpack_from("<i", payload, entry)[0]
        key = string(entry + uint16(entry_vtable + 4))
        result[key] = string(entry + uint16(entry_vtable + 6))
    return result


def native_animation(source: GameSource) -> dict[str, float]:
    path = source.base / "GameAssembly.dll"
    binary = path.read_bytes()
    digest = hashlib.sha256(binary).hexdigest()
    if digest not in NATIVE_PROFILES:
        raise ValueError(
            "尚未核验此 GameAssembly.dll 的动画常量位置："
            f"{digest}。请先核对原生方法并添加对应版本配置。"
        )
    pe = struct.unpack_from("<I", binary, 60)[0]
    section_count = struct.unpack_from("<H", binary, pe + 6)[0]
    optional_size = struct.unpack_from("<H", binary, pe + 20)[0]
    sections: list[tuple[int, int, int]] = []
    for index in range(section_count):
        position = pe + 24 + optional_size + index * 40
        _, rva, size, raw = struct.unpack_from("<4I", binary, position + 8)
        sections.append((rva, size, raw))

    def read_float(rva: int) -> float:
        for start, size, raw in sections:
            if start <= rva and rva + 4 <= start + size:
                return struct.unpack_from("<f", binary, raw + rva - start)[0]
        raise ValueError(f"动画常量不在 PE 文件范围内：{rva:#x}")

    source.record(path)
    return {key: read_float(rva) for key, rva in NATIVE_PROFILES[digest].items()}


def working_slot_count(source: GameSource) -> int:
    path = source.find_asset("dyn/building/blueprint/[uc]rooms/room_power_4x2.prefab")
    env = source.load_assets([path])
    root = env.container[path]
    counts: list[int] = []

    def visit(pointer: Any) -> None:
        node = pointer.read()
        for pair in node.m_Component:
            component = pair.component.deref()
            if component.type.name == "RectTransform":
                for child in component.read().m_Children:
                    visit(child.read().m_GameObject)
            elif (
                component.type.name == "MonoBehaviour"
                and node.m_Name == "panel_working_effect"
            ):
                data = component.read_typetree()
                if "_progressSlots" in data:
                    counts.append(len(data["_progressSlots"]))

    visit(root)
    if len(counts) != 1 or counts[0] <= 0:
        raise ValueError(f"无法唯一确定发电站工作三角槽：{counts}")
    return counts[0]


def building_sources(source: GameSource, asset_path: str) -> list[dict[str, str]]:
    manifest = source.manifest
    asset = next(
        item for item in manifest["assetToBundleList"] if item["path"] == asset_path
    )
    pending = [asset["bundleIndex"]]
    visited: set[int] = set()
    while pending:
        index = pending.pop()
        if index in visited:
            continue
        visited.add(index)
        pending.extend(manifest["bundles"][index]["directDependencies"])
    rows: list[dict[str, str]] = []
    for index in sorted(visited):
        relative = manifest["bundles"][index]["name"]
        path = source.base / "Arknights_Data/StreamingAssets/AB/Windows" / relative
        source.record(path)
        rows.append(
            {"path": relative, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        )
    return rows


def export_rules(source: GameSource) -> dict[str, str]:
    """生成设施和动画规则，并返回 Prefab 固定文字所需的完整本地化表。"""
    building_path = source.find_asset("dyn/gamedata/excel/building_data")
    language_path = source.find_asset("dyn/gamedata/excel/main_text")
    strings_path = source.find_asset("dyn/i18n/string_map.txt")
    env = source.load_assets([building_path, language_path, strings_path])
    schema_path = Path(__file__).parent / "schemas/building_data.fbs"
    schema = Schema.from_fbs_text(
        schema_path.read_text(encoding="utf-8"), options=Options()
    )
    raw_building = text_bytes(env.container[building_path].read())
    building = json.loads(schema.binary_to_json(raw_building[128:]))
    room_rules = {key: building[key] for key in ROOM_KEYS}
    room_rules["sources"] = building_sources(source, building_path)
    language = read_language(text_bytes(env.container[language_path].read()))
    string_map = text_bytes(env.container[strings_path].read()).decode("utf-8")
    # 以每个行首的资源键为边界，保留含换行的文字。
    matches = list(re.finditer(r"^\[([^\]\r\n]+)\]", string_map, re.MULTILINE))
    all_strings: dict[str, str] = {}
    for index, match in enumerate(matches):
        end = (
            matches[index + 1].start() if index + 1 < len(matches) else len(string_map)
        )
        all_strings[match.group(1)] = string_map[match.end() : end].rstrip("\r\n")
    all_strings.update(language)
    strings = {
        key: value
        for key, value in all_strings.items()
        if key.startswith(("BUILDING_BROOM_", "BUILDING_BLUEPRINT_RECYCLE_STATE_"))
    }
    animation = {"workingSlots": working_slot_count(source), **native_animation(source)}
    source.write_json("room-rules.json", room_rules)
    source.write_json(
        "runtime-rules.json",
        {
            "strings": strings,
            "animation": animation,
            "sources": [strings_path, language_path, "GameAssembly.dll"],
        },
    )
    return all_strings
