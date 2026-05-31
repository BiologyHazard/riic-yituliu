#!/usr/bin/env node

import { createWriteStream, existsSync } from 'node:fs';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

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
    url: 'https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyManage/011/111/111/0000000000011111111.20250923104318.11664078982054632530113858317517:50001231000000:2800:C0DB7AC2067D28B96607BC0D598A48EAF74CA1B7D936B819A36F67CB6E071F30.zip?needInitFileName=true',
    files: [
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Thin.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Thin.ttf',
      },
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Light.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Light.ttf',
      },
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Regular.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Regular.ttf',
      },
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Medium.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Medium.ttf',
      },
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Semibold.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Semibold.ttf',
      },
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Bold.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Bold.ttf',
      },
      {
        source: 'HarmonyOS Sans 字体/HarmonyOS_SansSC/HarmonyOS_SansSC_Black.ttf',
        destination: 'public/fonts/HarmonyOS_Sans_SC/HarmonyOS_SansSC_Black.ttf',
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
        destination: 'public/fonts/JetBrains_Mono/JetBrainsMono-wght.ttf',
      },
      {
        source: 'fonts/variable/JetBrainsMono-Italic[wght].ttf',
        destination: 'public/fonts/JetBrains_Mono/JetBrainsMono-Italic-wght.ttf',
      },
    ],
  },
  {
    name: 'Outfit',
    url: 'https://github.com/Outfitio/Outfit-Fonts/archive/refs/tags/1.1.zip',
    files: [
      {
        source: 'Outfit-Fonts-1.1/fonts/variable/Outfit[wght].ttf',
        destination: 'public/fonts/Outfit/Outfit-wght.ttf',
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
 * 从 URL 下载文件到本地
 * @param url - 要下载的文件 URL
 * @param destPath - 本地保存路径
 * @param headers - 可选的 HTTP 请求头
 * @throws 当下载失败或响应体为空时抛出错误
 */
async function downloadFile(
  url: string,
  destPath: string,
  headers?: Record<string, string>,
): Promise<void> {
  log(`开始下载: ${url} -> ${destPath}`);

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('响应体为空');
  }

  const fileStream = createWriteStream(destPath);
  // 将 Web ReadableStream 转换为 Node.js Readable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await pipeline(Readable.fromWeb(response.body as any), fileStream);

  log(`完成下载: ${url} -> ${destPath}`);
}

/**
 * 解压 ZIP 文件到指定目录
 * @param zipPath - ZIP 文件路径
 * @param destDir - 解压目标目录
 */
async function extractZip(zipPath: string, destDir: string): Promise<void> {
  log(`开始解压: ${zipPath} -> ${destDir}`);

  // 动态导入 extract-zip（仅在需要时加载）
  const extractZipModule = await import('extract-zip');
  const extractZipFn = extractZipModule.default;

  await extractZipFn(zipPath, { dir: destDir });

  log(`完成解压: ${zipPath}`);
}

/**
 * 解压 ZIP 文件并复制指定文件到目标位置
 * @param zipFile - ZIP 文件路径
 * @param files - 需要从 ZIP 中提取的文件映射列表
 *                   source: ZIP 内的文件路径
 *                   destination: 相对于项目根目录的目标文件路径
 */
async function extractAndCopy(
  zipFile: string,
  files: { source: string; destination: string }[],
): Promise<void> {
  // 创建临时目录
  const tmpDir = join(tmpdir(), `fonts-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  try {
    // 解压文件
    await extractZip(zipFile, tmpDir);

    // 复制文件
    for (const { source, destination } of files) {
      const srcPath = join(tmpDir, source);
      const dstPath = resolve(ROOT_DIR, destination);

      if (!existsSync(srcPath)) {
        throw new Error(`ZIP 内未找到配置的源文件: ${srcPath}（目标: ${destination}）`);
      }

      // 确保目标目录存在
      await mkdir(dirname(dstPath), { recursive: true });

      log(`开始复制: ${srcPath} -> ${dstPath}`);
      await copyFile(srcPath, dstPath);
    }
  } finally {
    // 清理临时目录
    log(`开始删除临时目录: ${tmpDir}`);
    await rm(tmpDir, { recursive: true, force: true });
  }
}

/**
 * 获取字体文件（下载、解压、复制）
 * @param config - 字体配置对象
 */
async function fetchFont(config: FontConfig): Promise<void> {
  log(`开始处理: ${config.name}`);

  // 创建临时文件
  const tmpZip = join(tmpdir(), `font-${Date.now()}.zip`);

  try {
    // 下载字体文件
    await downloadFile(config.url, tmpZip, config.headers);

    // 解压并复制
    await extractAndCopy(tmpZip, config.files);

    log(`完成: ${config.name}`);
  } finally {
    // 清理临时文件
    log(`开始删除临时文件: ${tmpZip}`);
    await rm(tmpZip, { force: true });
  }
}

/**
 * 主函数：依次处理所有字体
 */
async function main(): Promise<void> {
  try {
    for (const font of FONTS) {
      await fetchFont(font);
    }
    log('全部字体已处理完成');
  } catch (error) {
    console.error('处理字体时出错:', error);
    process.exit(1);
  }
}

main();
