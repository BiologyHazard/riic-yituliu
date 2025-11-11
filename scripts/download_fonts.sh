#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PH_FONT_URL="https://fonts.alibabadesign.com/AlibabaPuHuiTi-3.zip"
PH_SRC_SUBDIR="AlibabaPuHuiTi-3"
PH_DST_DIR="$ROOT_DIR/src/assets/fonts/Alibaba_PuHuiTi_3.0"
PH_HEADER="Referer: https://fonts.alibabadesign.com"

HOS_FONT_URL="https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyManage/011/111/111/0000000000011111111.20250923104318.11664078982054632530113858317517:50001231000000:2800:C0DB7AC2067D28B96607BC0D598A48EAF74CA1B7D936B819A36F67CB6E071F30.zip?needInitFileName=true"
HOS_SRC_SUBDIR="HarmonyOS Sans 字体/HarmonyOS_SansSC"
HOS_DST_DIR="$ROOT_DIR/src/assets/fonts/HarmonyOS_Sans_SC"
HOS_HEADER=""

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
    local zip_file="$1" src_subdir="$2" dst_dir="$3"
    local tmp_dir
    tmp_dir="$(mktemp -d)"
    log "开始解压: $zip_file -> $tmp_dir"
    unzip -q "$zip_file" -d "$tmp_dir"
    if [ ! -d "$tmp_dir/$src_subdir" ]; then
        echo "未找到子目录: $src_subdir" >&2
        echo "临时目录结构:"
        find "$tmp_dir" -maxdepth 3 -type d >&2
        exit 1
    fi
    mkdir -p "$dst_dir"
    # rm -rf "$dst_dir"/*
    log "开始复制: $tmp_dir/$src_subdir/. -> $dst_dir/"
    cp -Ru "$tmp_dir/$src_subdir/." "$dst_dir/"
    log "准备删除临时目录: $tmp_dir"
    rm -rf "$tmp_dir"
}

fetch_font() {
    local name="$1" url="$2" src_subdir="$3" dst_dir="$4" header="${5:-}"
    log "开始处理: $name"
    local tmp_zip
    tmp_zip="$(mktemp)"
    download_file "$url" "$tmp_zip" "$header"
    extract_and_copy "$tmp_zip" "$src_subdir" "$dst_dir"
    log "准备删除临时文件: $tmp_zip"
    rm -f "$tmp_zip"
    log "完成: $name -> $dst_dir"
}

need_cmd unzip

fetch_font "阿里巴巴普惠体 3.0" "$PH_FONT_URL" "$PH_SRC_SUBDIR" "$PH_DST_DIR" "$PH_HEADER"
fetch_font "鸿蒙黑体" "$HOS_FONT_URL" "$HOS_SRC_SUBDIR" "$HOS_DST_DIR" "$HOS_HEADER"

log "全部字体已处理完成"
