"""本机游戏资源读取与确定性输出。"""

import hashlib
import json
import math
from pathlib import Path
lazy from typing import Any

import lz4inv
import UnityPy
from ark_fbs import Schema
from UnityPy.enums.BundleFile import CompressionFlags
from UnityPy.helpers.CompressionHelper import DECOMPRESSION_MAP


def json_safe(value: Any) -> Any:
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if isinstance(value, dict):
        return {
            key: str(item) if key == "m_PathID" else json_safe(item)
            for key, item in value.items()
        }
    if isinstance(value, (list, tuple)):
        return [json_safe(item) for item in value]
    return value


class GameSource:
    def __init__(self, base: Path, output: Path) -> None:
        self.base = base.resolve()
        self.output = output
        self.bundle_dir = self.base / "Arknights_Data/StreamingAssets/AB/Windows"
        indices = sorted(self.bundle_dir.glob("*.idx"))
        if len(indices) != 1:
            raise ValueError(
                f"需要唯一的游戏资源清单，找到 {len(indices)} 个：{self.bundle_dir}"
            )
        self.sources: dict[str, str] = {}
        self.record(indices[0])
        schema = Schema.from_fbs_text(
            (Path(__file__).parent / "schemas/ResourceManifest.fbs").read_text(
                encoding="utf-8"
            )
        )
        self.manifest = json.loads(schema.binary_to_json(indices[0].read_bytes()[128:]))
        DECOMPRESSION_MAP[CompressionFlags.LZHAM] = lz4inv.decompress_buffer
        (output / "blueprint").mkdir(parents=True, exist_ok=True)

    def record(self, path: Path) -> None:
        with path.open("rb") as stream:
            self.sources[path.relative_to(self.base).as_posix()] = hashlib.file_digest(
                stream, "sha256"
            ).hexdigest()

    def find_asset(self, prefix: str) -> str:
        matches = [
            asset["path"]
            for asset in self.manifest["assetToBundleList"]
            if (asset.get("path") or "").startswith(prefix)
        ]
        if len(matches) != 1:
            raise ValueError(f"资源前缀必须唯一：{prefix}，实际 {matches}")
        return matches[0]

    def load_assets(self, paths: list[str]) -> Any:
        assets = {
            asset.get("path"): asset for asset in self.manifest["assetToBundleList"]
        }
        pending = [assets[path]["bundleIndex"] for path in paths]
        indices: set[int] = set()
        while pending:
            index = pending.pop()
            if index in indices:
                continue
            indices.add(index)
            pending.extend(
                self.manifest["bundles"][index].get("directDependencies", [])
            )
        bundles = [
            self.bundle_dir / self.manifest["bundles"][index]["name"]
            for index in sorted(indices)
        ]
        for path in bundles:
            self.record(path)
        return UnityPy.load(*(str(path) for path in bundles))

    def load_file(self, relative: str) -> Any:
        path = self.base / relative
        self.record(path)
        resource = path.with_name(path.name + ".resS")
        if resource.is_file():
            self.record(resource)
        return UnityPy.load(str(path))

    def write_json(self, name: str, data: Any) -> None:
        (self.output / "blueprint" / name).write_text(
            json.dumps(json_safe(data), ensure_ascii=False, indent=2, allow_nan=False)
            + "\n",
            encoding="utf-8",
        )

    def finish(self) -> None:
        self.write_json(
            "sources.json",
            [
                {"path": path, "sha256": digest}
                for path, digest in sorted(self.sources.items())
            ],
        )
