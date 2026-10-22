"""读取已核验蓝图场景的相机序列化参数。"""

import hashlib
import struct

lazy from .source import GameSource

SCENE_SHA256 = "49b9ea242c2acb790d09f8e7687b790e242f7782b98559b0c0a795559a57f0f9"


def export_scene_rules(source: GameSource) -> None:
    path = source.base / "Arknights_Data/level9"
    if hashlib.sha256(path.read_bytes()).hexdigest() != SCENE_SHA256:
        raise ValueError("蓝图场景版本未经核验，不能继续使用旧的序列化字段偏移")
    env = source.load_file("Arknights_Data/level9")
    objects = {
        obj.path_id: obj for obj in env.objects if obj.assets_file.name == "level9"
    }
    controller = objects[412].get_raw_data()
    camera = objects[214].get_raw_data()
    touch = objects[440].get_raw_data()
    if len(controller) != 52 or len(camera) != 161:
        raise ValueError("相机对象大小与已核验布局不一致")
    if struct.unpack_from("<iq", controller, 32) != (0, 440):
        raise ValueError("BCameraController 的触控相机引用发生变化")
    if struct.unpack_from("<iq", touch) != struct.unpack_from("<iq", camera):
        raise ValueError("Camera 与 MobileTouchCamera 不属于同一对象")
    if struct.unpack_from("<i", touch, 32)[0] != 0:
        raise ValueError("触控相机不再使用 XY 平面，必须重新核验投影和边界算法")
    # 场景缺少完整类型树；绑定源哈希和字段偏移，版本变化时停止生成。
    source.write_json(
        "scene-rules.json",
        {
            "camera": {
                "verticalFieldOfView": struct.unpack_from("<f", camera, 88)[0],
                "widthFitRatio": struct.unpack_from("<f", controller, 44)[0],
                "defaultPositionX": struct.unpack_from("<f", controller, 48)[0],
                "overdragMargin": struct.unpack_from("<f", touch, 52)[0],
            },
            "source": {
                "path": "Arknights_Data/level9",
                "sha256": SCENE_SHA256,
                "controllerPathId": "412",
                "cameraPathId": "214",
                "touchCameraPathId": "440",
                "offsets": {
                    "verticalFieldOfView": 88,
                    "widthFitRatio": 44,
                    "defaultPositionX": 48,
                    "overdragMargin": 52,
                },
            },
        },
    )
