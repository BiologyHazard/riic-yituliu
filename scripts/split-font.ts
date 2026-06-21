import { access, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontSplit } from 'cn-font-split';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const TTF_PATH = join(
  PROJECT_ROOT,
  'public',
  'fonts',
  'Alibaba_PuHuiTi_3.0',
  'AlibabaPuHuiTi-3-35-Thin.woff2',
);
const OUT_DIR = join(PROJECT_ROOT, 'src', 'assets', 'fonts', 'Alibaba_PuHuiTi_3.0');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function splitFont(): Promise<void> {
  if (!(await exists(TTF_PATH))) {
    console.error(`[ERROR] 字体文件不存在: ${TTF_PATH}`);
    process.exit(1);
  }

  if (await exists(OUT_DIR)) {
    console.log(`[INFO] 输出目录已存在，正在清理: ${OUT_DIR}/`);
    await rm(OUT_DIR, { recursive: true, force: true });
  }
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`[INFO] 输入字体: ${TTF_PATH}`);
  console.log(`[INFO] 输出目录: ${OUT_DIR}/`);
  console.log(`[INFO] 正在分片，请稍候...`);

  await fontSplit({
    input: TTF_PATH,
    outDir: OUT_DIR,

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

    // chunkSize: 128 * 1024, // 单个分片目标大小
    // chunkSizeTolerance: 1 * 1024, // 分片容差
    // maxAllowSubsetsCount: 10, // 最大允许分包数量，可能会和 chunkSize 冲突

    // testHtml: false, // 是否生成测试 HTML 文件
    // reporter: false, // 是否生成 reporter.bin 文件
    renameOutputFont: '[index].[ext]', // 自定义分包输出的文件名
    silent: true, // 不在控制台打印多余的日志信息
  });

  console.log('[SUCCESS] 字体分片完成！');

  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith('.woff2'));
  const sizes = await Promise.all(files.map((f) => stat(join(OUT_DIR, f))));
  const totalSize = sizes.reduce((sum, s) => sum + s.size, 0);
  const avgSize = totalSize / files.length;

  console.log(`分片数量: ${files.length}`);
  console.log(`总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`平均每片: ${(avgSize / 1024).toFixed(1)} KB`);
}

splitFont();
