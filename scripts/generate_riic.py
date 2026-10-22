# /// script
# requires-python = ">=3.15"
# dependencies = ["UnityPy==1.25.3", "ark-fbs==0.2.1", "lz4inv==0.2.2", "Pillow==12.3.0"]
# ///
"""从 `ARKNIGHTS_BASE_DIR` 指定的本机游戏安装目录生成基建地图资源。"""

import argparse
import json
import os
import shutil
import tempfile
from pathlib import Path

from riic_export.blueprint import BlueprintExporter, export_fonts_and_background
from riic_export.rules import export_rules
from riic_export.scene import export_scene_rules
from riic_export.source import GameSource


def equivalent(left: Path, right: Path) -> bool:
    if not right.is_file():
        return False
    if left.suffix == ".json":
        return json.loads(left.read_text(encoding="utf-8")) == json.loads(
            right.read_text(encoding="utf-8")
        )
    return left.read_bytes() == right.read_bytes()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="仅检查现有产物是否与游戏生成结果一致，不写入",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src/assets/images/riic",
        help="资源输出根目录",
    )
    args = parser.parse_args()
    base = os.environ.get("ARKNIGHTS_BASE_DIR")
    if not base:
        parser.error(
            "请设置环境变量 ARKNIGHTS_BASE_DIR，指向包含 Arknights_Data 的游戏目录"
        )
    if not (Path(base) / "Arknights_Data").is_dir():
        parser.error("ARKNIGHTS_BASE_DIR 下未找到 Arknights_Data")
    # 全部提取成功后才发布，版本或资源异常不会留下半套生成文件。
    with tempfile.TemporaryDirectory(prefix="riic-export-") as directory:
        stage = Path(directory)
        source = GameSource(Path(base), stage)
        language = export_rules(source)
        BlueprintExporter(source, language).run()
        export_fonts_and_background(source)
        export_scene_rules(source)
        source.finish()
        files = sorted(path for path in stage.rglob("*") if path.is_file())
        changed = [
            path
            for path in files
            if not equivalent(path, args.output / path.relative_to(stage))
        ]
        if args.check:
            if changed:
                for path in changed:
                    print(f"不一致：{path.relative_to(stage).as_posix()}")
                raise SystemExit(1)
            print(f"校验通过：{len(files)} 个文件均可从本机游戏重新生成")
            return
        for path in changed:
            target = args.output / path.relative_to(stage)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, target)
        print(
            f"生成完成：{len(files)} 个文件，更新 {len(changed)} 个；输出：{args.output}"
        )


if __name__ == "__main__":
    main()
