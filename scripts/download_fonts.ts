import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import yauzl from 'yauzl';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

/**
 * 字体配置接口
 */
interface FontConfig {
  /** 字体名称（用于日志） */
  name: string;
  /** 字体下载 URL */
  url: string;
  /**
   * 需要提取的字体文件列表
   * source: ZIP 压缩包内的文件路径
   * destination: 相对于项目根目录的目标文件路径
   */
  files: { source: string; destination: string }[];
  /** 可选的 HTTP 请求头 */
  headers?: Record<string, string>;
}

const FONTS: FontConfig[] = [
  {
    name: '鸿蒙黑体',
    url: 'https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyManage/011/111/111/0000000000011111111.20260611171743.77886644144213121813005934094365:50001231000000:2800:0CCF575ADA0FCAD85EE25909C15C402A40FA94ABCCFEFC5BD37061A6B94239FF.zip?needInitFileName=true',
    files: [
      {
        source: 'HarmonyOS Sans/HarmonyOS_Sans_SC.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC.ttf',
      },
    ],
  },
  {
    name: '阿里巴巴普惠体 3.0',
    url: 'https://fonts.alibabadesign.com/AlibabaPuHuiTi-3.zip',
    files: [
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-35-Thin/AlibabaPuHuiTi-3-35-Thin.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-35-Thin.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-45-Light/AlibabaPuHuiTi-3-45-Light.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-45-Light.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-55-Regular/AlibabaPuHuiTi-3-55-Regular.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-55-Regular.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-65-Medium/AlibabaPuHuiTi-3-65-Medium.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-65-Medium.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-75-SemiBold/AlibabaPuHuiTi-3-75-SemiBold.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-75-SemiBold.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-85-Bold/AlibabaPuHuiTi-3-85-Bold.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-85-Bold.woff2',
      },
      {
        source:
          'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-95-ExtraBold/AlibabaPuHuiTi-3-95-ExtraBold.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-95-ExtraBold.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-105-Heavy.woff2',
      },
      {
        source: 'AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-115-Black/AlibabaPuHuiTi-3-115-Black.woff2',
        destination: 'public/fonts/Alibaba_PuHuiTi_3.0/AlibabaPuHuiTi-3-115-Black.woff2',
      },
    ],
    headers: {
      Referer: 'https://fonts.alibabadesign.com',
    },
  },
  {
    name: 'JetBrains Mono',
    url: 'https://download.jetbrains.com/fonts/JetBrainsMono-2.304.zip',
    files: [
      {
        source: 'fonts/variable/JetBrainsMono[wght].ttf',
        destination: 'public/fonts/JetBrains_Mono/JetBrainsMono[wght].ttf',
      },
      {
        source: 'fonts/variable/JetBrainsMono-Italic[wght].ttf',
        destination: 'public/fonts/JetBrains_Mono/JetBrainsMono-Italic[wght].ttf',
      },
    ],
  },
  {
    name: 'Outfit',
    url: 'https://github.com/Outfitio/Outfit-Fonts/archive/refs/tags/1.1.zip',
    files: [
      {
        source: 'Outfit-Fonts-1.1/fonts/variable/Outfit[wght].ttf',
        destination: 'public/fonts/Outfit/Outfit[wght].ttf',
      },
    ],
  },
];

/**
 * 记录带时间戳的日志
 * @param args - 要记录的日志内容
 */
function log(...args: unknown[]): void {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, -1);
  console.log(`${ts} | fonts |`, ...args);
}

/**
 * 从 URL 下载字体 ZIP 到内存 Buffer
 * @param url - 字体 ZIP 的下载 URL
 * @param headers - 可选的 HTTP 请求头
 */
async function downloadToBuffer(
  name: string,
  url: string,
  headers?: Record<string, string>,
): Promise<Buffer> {
  log(`[${name}] 开始下载: ${url}`);

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  log(`[${name}] 下载完成 (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
  return buffer;
}

/**
 * 从 ZIP Buffer 中提取指定文件到目标位置
 * 使用 yauzl 的 lazyEntries 模式，只读取需要的文件条目，避免全量解压
 * @param buffer - ZIP 文件的完整 Buffer
 * @param files - 需要从 ZIP 中提取的文件映射列表
 *                   source: ZIP 内的文件路径
 *                   destination: 相对于项目根目录的目标文件路径
 */
async function extractFromBuffer(
  name: string,
  buffer: Buffer,
  files: { source: string; destination: string }[],
): Promise<void> {
  const destMap = new Map(files.map((f) => [f.source, f.destination]));
  const pendingFiles = new Set(files.map((f) => f.source));

  log(`[${name}] 开始解压`);

  const zipfile = await yauzl.fromBufferPromise(buffer);

  for await (const entry of zipfile.eachEntry()) {
    const destPath = destMap.get(entry.fileName);

    if (destPath) {
      const fullDestPath = resolve(ROOT_DIR, destPath);

      log(`[${name}] 开始复制: ${entry.fileName} -> ${destPath}`);
      await mkdir(dirname(fullDestPath), { recursive: true });

      const readStream = await zipfile.openReadStreamPromise(entry);
      const writeStream = createWriteStream(fullDestPath);
      await pipeline(readStream, writeStream);

      pendingFiles.delete(entry.fileName);
    }
  }

  if (pendingFiles.size > 0) {
    throw new Error(`ZIP 内未找到配置的源文件: ${[...pendingFiles].join(', ')}`);
  }

  log(`[${name}] 完成解压`);
}

/**
 * 获取字体文件（下载到内存、解压提取）
 * @param config - 字体配置对象
 */
async function fetchFont(config: FontConfig): Promise<void> {
  const { name, url, files, headers } = config;

  log(`[${name}] 开始处理`);

  const buffer = await downloadToBuffer(name, url, headers);
  await extractFromBuffer(name, buffer, files);

  log(`[${name}] 完成`);
}

/**
 * 主函数：并行处理所有字体
 */
async function main(): Promise<void> {
  const results = await Promise.allSettled(FONTS.map((font) => fetchFont(font)));

  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length > 0) {
    for (const r of rejected) {
      log('[错误] 字体处理失败:', r.reason);
    }
    log(`字体处理结束，${rejected.length} 个失败`);
    process.exit(1);
  }

  log('全部字体已处理完成');
  process.exit(0);
}

main();
