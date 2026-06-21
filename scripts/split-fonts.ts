#!/usr/bin/env node

/**
 * 字体分片脚本
 *
 * 自动化对所有已下载的字体进行 cn-font-split 分片，
 * 输出结构适配 main.scss 的导入路径。
 *
 * 先手动执行 `npm run download-fonts` 下载原始字体，
 * 再执行本脚本（或通过 `npm run build` 自动触发）。
 *
 * 输出结构（与 main.scss 一一对应）：
 *   src/assets/fonts/
 *     HarmonyOS_Sans_SC/result.css
 *     Alibaba_PuHuiTi_3.0/
 *       AlibabaPuHuiTi-3-35-Thin/result.css
 *       AlibabaPuHuiTi-3-45-Light/result.css
 *       ... (共 10 个字重)
 *     JetBrains_Mono/result.css
 *     Outfit/result.css
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontSplit } from 'cn-font-split';

// ============ 路径常量 ============

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
const PUBLIC_FONTS_DIR = join(PROJECT_ROOT, 'public', 'fonts');
const ASSETS_FONTS_DIR = join(PROJECT_ROOT, 'src', 'assets', 'fonts');

// ============ 类型定义 ============

/** 单个字体的分片条目 */
interface SplitEntry {
  /** 显示名称（仅用于日志） */
  label: string;
  /** 原始字体文件路径（public/fonts/ 下的原始文件） */
  inputPath: string;
  /** 分片输出目录（src/assets/fonts/ 下的目录） */
  outDir: string;
  /** 字体系列名称（用于 CSS 的 font-family） */
  fontFamily?: string;
}

// ============ 分片配置 ============

const SPLITS: SplitEntry[] = [
  // 鸿蒙黑体
  {
    label: 'HarmonyOS Sans SC',
    inputPath: join(PUBLIC_FONTS_DIR, 'HarmonyOS_Sans_SC', 'HarmonyOS_Sans_SC.ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'HarmonyOS_Sans_SC'),
    fontFamily: 'HarmonyOS Sans SC',
  },

  // 阿里巴巴普惠体 3.0
  {
    label: 'AlibabaPuHuiTi-3-35-Thin',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-35-Thin.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-35-Thin'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-45-Light',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-45-Light.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-45-Light'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-55-Regular',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-55-Regular.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-55-Regular'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-65-Medium',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-65-Medium.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-65-Medium'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-75-SemiBold',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-75-SemiBold.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-75-SemiBold'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-85-Bold',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-85-Bold.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-85-Bold'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-95-ExtraBold',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-95-ExtraBold.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-95-ExtraBold'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-105-Heavy',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-105-Heavy.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-105-Heavy'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },
  {
    label: 'AlibabaPuHuiTi-3-115-Black',
    inputPath: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-115-Black.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-115-Black'),
    fontFamily: 'Alibaba PuHuiTi 3.0',
  },

  // JetBrains Mono
  {
    label: 'JetBrains Mono',
    inputPath: join(PUBLIC_FONTS_DIR, 'JetBrains_Mono', 'JetBrainsMono[wght].ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'JetBrains_Mono'),
    fontFamily: 'JetBrains Mono',
  },

  // Outfit
  {
    label: 'Outfit',
    inputPath: join(PUBLIC_FONTS_DIR, 'Outfit', 'Outfit[wght].ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'Outfit'),
    fontFamily: 'Outfit',
  },
];

// ============ 工具函数 ============

/** 带时间戳的日志输出 */
function log(...args: unknown[]): void {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, -1);
  console.log(`${ts} | split-font |`, ...args);
}

/** 打印分片统计信息 */
async function printSplitStats(outDir: string): Promise<void> {
  if (!existsSync(outDir)) return;

  const files = (await readdir(outDir)).filter((f) => f.endsWith('.woff2'));
  if (files.length === 0) return;

  const sizes = await Promise.all(files.map((f) => stat(join(outDir, f))));
  const totalSize = sizes.reduce((sum, s) => sum + s.size, 0);
  const avgSize = totalSize / files.length;

  log(
    `${files.length} 分片, ${(totalSize / 1024 / 1024).toFixed(2)} MB, 平均 ${(avgSize / 1024).toFixed(1)} KB`,
  );
}

// ============ 分片逻辑 ============

/** 对单个字体文件进行分片 */
async function splitSingleFont(label: string, inputPath: string, outDir: string): Promise<void> {
  log(`开始分片: ${label}`);

  // 清空输出目录
  if (existsSync(outDir)) {
    log(`清空输出目录: ${outDir}`);
    await rm(outDir, { recursive: true, force: true });
  }
  await mkdir(outDir, { recursive: true });

  await fontSplit({
    input: inputPath,
    outDir,
    renameOutputFont: '[index].[ext]',
    silent: true,
  });

  // 删除不需要的元数据文件
  for (const junk of ['index.html', 'index.proto', 'reporter.bin']) {
    const junkPath = join(outDir, junk);
    if (existsSync(junkPath)) {
      await rm(junkPath);
    }
  }

  await printSplitStats(outDir);
}

// ============ 主流程 ============

async function main(): Promise<void> {
  log('开始字体分片');

  let hasMissingSource = false;
  let hasErrors = false;

  for (const split of SPLITS) {
    if (!existsSync(split.inputPath)) {
      log(`[跳过] 原始字体文件不存在: ${split.inputPath}`);
      log(`请先运行 \`npm run download-fonts\` 下载原始字体文件。`);
      hasMissingSource = true;
      continue;
    }

    try {
      await splitSingleFont(split.label, split.inputPath, split.outDir);
    } catch (err) {
      log(`[错误] 分片失败: ${split.label}`, err);
      hasErrors = true;
    }
  }

  if (hasMissingSource) {
    log('提示：部分字体尚未下载，请执行 npm run download-fonts');
  }
  if (hasErrors) {
    log('分片完成（有错误）');
    process.exit(1);
  } else {
    log('分片完成');
  }
}

main();
