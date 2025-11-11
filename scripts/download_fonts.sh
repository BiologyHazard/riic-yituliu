#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

HOS_FONT_URL="https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyManage/011/111/111/0000000000011111111.20250923104318.11664078982054632530113858317517:50001231000000:2800:C0DB7AC2067D28B96607BC0D598A48EAF74CA1B7D936B819A36F67CB6E071F30.zip?needInitFileName=true"
HOS_SRC_FILELIST=(
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Thin.ttf"
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Light.ttf"
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Regular.ttf"
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Medium.ttf"
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Semibold.ttf"
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Bold.ttf"
    "HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Black.ttf"
)
HOS_DST_DIR="$ROOT_DIR/public/fonts/HarmonyOS_Sans_SC"
HOS_HEADER=""

PH_FONT_URL="https://fonts.alibabadesign.com/AlibabaPuHuiTi-3.zip"
PH_SRC_FILELIST=(
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-35-Thin/AlibabaPuHuiTi-3-35-Thin.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-45-Light/AlibabaPuHuiTi-3-45-Light.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-55-Regular/AlibabaPuHuiTi-3-55-Regular.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-65-Medium/AlibabaPuHuiTi-3-65-Medium.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-75-SemiBold/AlibabaPuHuiTi-3-75-SemiBold.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-85-Bold/AlibabaPuHuiTi-3-85-Bold.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-95-ExtraBold/AlibabaPuHuiTi-3-95-ExtraBold.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.woff2"
    "AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-115-Black/AlibabaPuHuiTi-3-115-Black.woff2"
)
PH_DST_DIR="$ROOT_DIR/public/fonts/Alibaba_PuHuiTi_3.0"
PH_HEADER="Referer: https://fonts.alibabadesign.com"

log() {
    local ts
    ts="$(date +'%Y-%m-%d %H:%M:%S.%3N')"
    printf '%s | fonts | %s\n' "$ts" "$*"
}

need_cmd() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    else
        echo "缺少命令: $1" >&2
        exit 1
    fi
}

download_file() {
    local url="$1" out="$2" header="${3:-}"
    log "开始下载: $url -> $out"
    if command -v curl >/dev/null 2>&1; then
        curl -L --fail --show-error -H "$header" "$url" -o "$out"
    elif command -v wget >/dev/null 2>&1; then
        wget --header="$header" "$url" -O "$out"
    else
        echo "需要 curl 或 wget" >&2
        exit 1
    fi
    log "完成下载: $url -> $out"
}

extract_and_copy() {
    local zip_file="$1" array_name="$2" dst_dir="$3"
    local -n src_filelist="$array_name"   # 通过 nameref 引用完整数组
    local tmp_dir
    tmp_dir="$(mktemp -d)"
    log "开始解压: $zip_file -> $tmp_dir"
    unzip -q "$zip_file" -d "$tmp_dir"
    mkdir -p "$dst_dir"
    for src_file in "${src_filelist[@]}"; do
        if [ -f "$tmp_dir/$src_file" ]; then
            log "开始复制: $tmp_dir/$src_file -> $dst_dir/"
            cp -u "$tmp_dir/$src_file" "$dst_dir/"
        else
            echo "未找到文件: $tmp_dir/$src_file" >&2
        fi
    done
    log "准备删除临时目录: $tmp_dir"
    rm -rf "$tmp_dir"
}

fetch_font() {
    local name="$1" url="$2" src_filelist_name="$3" dst_dir="$4" header="${5:-}"
    log "开始处理: $name"
    local tmp_zip
    tmp_zip="$(mktemp)"
    download_file "$url" "$tmp_zip" "$header"
    extract_and_copy "$tmp_zip" "$src_filelist_name" "$dst_dir"
    log "准备删除临时文件: $tmp_zip"
    rm -f "$tmp_zip"
    log "完成: $name -> $dst_dir"
}

need_cmd unzip

fetch_font "鸿蒙黑体" "$HOS_FONT_URL" HOS_SRC_FILELIST "$HOS_DST_DIR" "$HOS_HEADER"
fetch_font "阿里巴巴普惠体 3.0" "$PH_FONT_URL" PH_SRC_FILELIST "$PH_DST_DIR" "$PH_HEADER"

log "全部字体已处理完成"
