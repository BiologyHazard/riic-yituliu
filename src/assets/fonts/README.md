# 字体分片输出

本目录由 `npm run split-font`（或 `npm run build` 自动触发）生成。

## 生成方式

1. 运行 `npm run download-fonts` 下载字体压缩包并解压到 `public/fonts/`
2. 运行 `npm run split-font` 将字体文件分片输出到本目录
3. 在 `src/assets/css/main.scss` 中导入各字体的 `result.css`

## 字体清单

| 字体               | 来源                                                      |
| ------------------ | --------------------------------------------------------- |
| 鸿蒙黑体           | https://developer.huawei.com/consumer/cn/design/resource/ |
| 阿里巴巴普惠体 3.0 | https://www.alibabafonts.com/#/font                       |
| JetBrains Mono     | https://www.jetbrains.com/lp/mono/                        |
| Outfit             | https://github.com/Outfitio/Outfit-Fonts                  |
