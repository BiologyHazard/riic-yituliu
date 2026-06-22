import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontSplit } from 'cn-font-split';
import type { FontSplitProps } from 'cn-font-split/dist/interface.js';

// ============ 路径常量 ============

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
const PUBLIC_FONTS_DIR = join(PROJECT_ROOT, 'public', 'fonts');
const ASSETS_FONTS_DIR = join(PROJECT_ROOT, 'src', 'assets', 'fonts');

// ============ 类型定义 ============

/** 单个字体的分片条目 */
interface ExtendedFontSplitProps extends FontSplitProps {
  /** 显示名称（仅用于日志） */
  label: string;
  /** 原始字体文件路径（public/fonts/ 下的原始文件） */
  input: string;
  /** 分片输出目录（src/assets/fonts/ 下的目录） */
  outDir: string;
}

const globalFontSplitProps: Omit<FontSplitProps, 'input' | 'outDir'> = {
  // css: {
  //   commentBase: true,
  //   commentNameTable: true,
  //   commentUnicodes: false,
  //   compress: true,
  //   fileName: 'result.css',
  // },

  // languageAreas: true, // 是否启用语言区域优化，将同一语言的字符分到一起
  // autoSubset: true, // 当分包超过指定大小时是否自动拆分
  // fontFeature: true, // 是否保留字体特性（如 Code 字体的连字、字距调整等）
  // reduceMins: true, // 是否减少碎片分包，合并小分包以减少请求数，一般不需要修改

  // chunkSize: 70 * 1024, // 单个分片目标大小
  // chunkSizeTolerance: 1 * 1024, // 分片容差
  // maxAllowSubsetsCount: 10, // 最大允许分包数量，可能会和 chunkSize 冲突

  testHtml: false, // 是否生成测试 HTML 文件
  reporter: false, // 是否生成 reporter.bin 文件
  silent: true, // 不在控制台打印多余的日志信息
};

// ============ 分片配置 ============

const fontSplitProps: ExtendedFontSplitProps[] = [
  // 鸿蒙黑体
  {
    label: 'HarmonyOS Sans SC',
    input: join(PUBLIC_FONTS_DIR, 'HarmonyOS_Sans_SC', 'HarmonyOS_Sans_SC.ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'HarmonyOS_Sans_SC'),
    renameOutputFont: 'HarmonyOS_Sans_SC-[index].[ext]',
    css: {
      fontFamily: 'HarmonyOS Sans SC',
    },
  },

  // 阿里巴巴普惠体 3.0
  {
    label: 'AlibabaPuHuiTi-3-35-Thin',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-35-Thin.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-35-Thin'),
    renameOutputFont: 'AlibabaPuHuiTi-3-35-Thin-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-45-Light',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-45-Light.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-45-Light'),
    renameOutputFont: 'AlibabaPuHuiTi-3-45-Light-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-55-Regular',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-55-Regular.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-55-Regular'),
    renameOutputFont: 'AlibabaPuHuiTi-3-55-Regular-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-65-Medium',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-65-Medium.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-65-Medium'),
    renameOutputFont: 'AlibabaPuHuiTi-3-65-Medium-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-75-SemiBold',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-75-SemiBold.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-75-SemiBold'),
    renameOutputFont: 'AlibabaPuHuiTi-3-75-SemiBold-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-85-Bold',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-85-Bold.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-85-Bold'),
    renameOutputFont: 'AlibabaPuHuiTi-3-85-Bold-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-95-ExtraBold',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-95-ExtraBold.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-95-ExtraBold'),
    renameOutputFont: 'AlibabaPuHuiTi-3-95-ExtraBold-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-105-Heavy',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-105-Heavy.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-105-Heavy'),
    renameOutputFont: 'AlibabaPuHuiTi-3-105-Heavy-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },
  {
    label: 'AlibabaPuHuiTi-3-115-Black',
    input: join(PUBLIC_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-115-Black.woff2'),
    outDir: join(ASSETS_FONTS_DIR, 'Alibaba_PuHuiTi_3.0', 'AlibabaPuHuiTi-3-115-Black'),
    renameOutputFont: 'AlibabaPuHuiTi-3-115-Black-[index].[ext]',
    css: {
      fontFamily: 'Alibaba PuHuiTi 3.0',
    },
  },

  // JetBrains Mono
  {
    label: 'JetBrains Mono',
    input: join(PUBLIC_FONTS_DIR, 'JetBrains_Mono', 'JetBrainsMono[wght].ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'JetBrains_Mono', 'JetBrainsMono'),
    renameOutputFont: 'JetBrainsMono-[index].[ext]',
    css: {
      fontFamily: 'JetBrains Mono',
    },
  },
  {
    label: 'JetBrains Mono Italic',
    input: join(PUBLIC_FONTS_DIR, 'JetBrains_Mono', 'JetBrainsMono-Italic[wght].ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'JetBrains_Mono', 'JetBrainsMono-Italic'),
    renameOutputFont: 'JetBrainsMono-Italic-[index].[ext]',
    css: {
      fontFamily: 'JetBrains Mono',
    },
  },

  // Outfit
  {
    label: 'Outfit',
    input: join(PUBLIC_FONTS_DIR, 'Outfit', 'Outfit[wght].ttf'),
    outDir: join(ASSETS_FONTS_DIR, 'Outfit'),
    renameOutputFont: 'Outfit-[index].[ext]',
    css: {
      fontFamily: 'Outfit',
    },
  },
];

// ============ 工具函数 ============

/** 带时间戳的日志输出 */
function log(...args: unknown[]): void {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, -1);
  console.log(`${ts} | split-fonts |`, ...args);
}

/** 打印分片统计信息 */
async function printSplitStats(outDir: string): Promise<void> {
  if (!existsSync(outDir)) return;

  const files = (await readdir(outDir)).filter((f) => f.endsWith('.woff2'));
  if (files.length === 0) return;

  const stats = await Promise.all(files.map((f) => stat(join(outDir, f))));
  const sortedSizes = stats.map((s) => s.size).toSorted((a, b) => a - b);
  const totalSize = sortedSizes.reduce((sum, s) => sum + s, 0);
  const avgSize = totalSize / sortedSizes.length;
  const quantiles = [0, 0.25, 0.5, 0.75, 1].map((p) => percentile(sortedSizes, p));

  log(
    `${files.length} 分片, ${(totalSize / 1024 / 1024).toFixed(2)} MB, 平均 ${(avgSize / 1024).toFixed(2)} KB, 分位数: ${quantiles.map((q) => (q / 1024).toFixed(2)).join('/')} KB`,
  );
}

/** 计算排序后数组的百分位值（线性插值） */
function percentile(sorted: number[], p: number): number {
  let index = p * (sorted.length - 1);
  index = Math.max(0, Math.min(index, sorted.length - 1));
  const lowIndex = Math.floor(index);
  const highIndex = Math.ceil(index);
  if (lowIndex === highIndex) return sorted[lowIndex];
  return sorted[lowIndex] * (highIndex - index) + sorted[highIndex] * (index - lowIndex);
}

// ============ 分片逻辑 ============

/** 对单个字体文件进行分片 */
async function splitSingleFont(fontSplitProps: ExtendedFontSplitProps): Promise<void> {
  const { input, label, outDir } = fontSplitProps;

  if (!existsSync(input)) {
    log(`[跳过] 原始字体文件不存在: ${input}`);
    log(`请先运行 \`npm run download-fonts\` 下载原始字体文件。`);
    return;
  }

  log(`开始分片: ${label}`);

  // 清空输出目录（安全删除：只允许删除 ASSETS_FONTS_DIR 下的子目录）
  if (existsSync(outDir)) {
    if (relative(ASSETS_FONTS_DIR, outDir).startsWith('..')) {
      throw new Error(`拒绝删除: "${outDir}" 不在 src/assets/fonts/ 之下`);
    }
    log(`清空输出目录: ${outDir}`);
    await rm(outDir, { recursive: true, force: true });
  }
  await mkdir(outDir, { recursive: true });

  await fontSplit({
    ...globalFontSplitProps,
    ...fontSplitProps,
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

  const results = await Promise.allSettled(fontSplitProps.map((split) => splitSingleFont(split)));

  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length > 0) {
    for (const r of rejected) {
      log('[错误] 分片失败:', (r as PromiseRejectedResult).reason);
    }
    log(`字体分片结束，${rejected.length} 个失败`);
    process.exit(1);
  }

  log('字体分片完成');
}

main();
