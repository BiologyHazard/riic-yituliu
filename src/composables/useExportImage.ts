/**
 * 图片导出组合式函数
 *
 * 封装 html-to-image 导出设置状态与核心导出逻辑，
 * 供多个页面复用，避免重复代码。
 */

import { downloadFile } from '@/utils/file';
import { getFontEmbedCSS, toCanvas, toSvg } from 'html-to-image';
import type { Options } from 'html-to-image/lib/types';
import { computed, ref } from 'vue';

export type ExportFormat = 'webp' | 'png' | 'jpeg' | 'svg';

const MIME_TYPE_MAP: Record<ExportFormat, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
};

const FILE_EXTENSION_MAP: Record<ExportFormat, string> = {
  webp: 'webp',
  png: 'png',
  jpeg: 'jpg',
  svg: 'svg',
};

export interface UseExportImageOptions {
  /**
   * html-to-image 的 filter 选项，用于排除不需要导出的 DOM 节点。
   * 例如排除 `data-ignore-export` 属性的元素。
   */
  filter?: (node: Node) => boolean;
}

export function useExportImage(opts?: UseExportImageOptions) {
  // ─── 导出设置 ──────────────────────────────────────────

  const exportFormat = ref<ExportFormat>('webp');
  const exportQuality = ref<number>(75);
  const exportPixelRatio = ref<number>(1);

  const isQualityEnabled = computed<boolean>(
    () => exportFormat.value === 'webp' || exportFormat.value === 'jpeg',
  );

  // ─── 字体嵌入缓存 ─────────────────────────────────────

  const cachedFontEmbedCSS = ref<string | null>(null);
  const sharedOptions = computed<Options>(() => ({
    cacheBust: true,
    pixelRatio: exportPixelRatio.value,
    fontEmbedCSS: cachedFontEmbedCSS.value ?? undefined,
    ...(opts?.filter ? { filter: opts.filter } : {}),
  }));

  async function ensureFontEmbedCSS(target: HTMLElement): Promise<void> {
    if (!cachedFontEmbedCSS.value) {
      cachedFontEmbedCSS.value = await getFontEmbedCSS(target);
    }
  }

  // ─── 核心导出逻辑 ─────────────────────────────────────

  /**
   * 将指定 DOM 元素导出为图片并触发下载
   * @param target 要导出的 DOM 元素
   * @param filenameBase 文件名前缀（不含扩展名和时间戳）
   */
  async function exportTargetAsImage(target: HTMLElement, filenameBase: string): Promise<void> {
    const timestamp = new Date().getTime();
    const ext = FILE_EXTENSION_MAP[exportFormat.value];

    if (exportFormat.value === 'svg') {
      const dataUrl = await toSvg(target, sharedOptions.value);
      await downloadFile(dataUrl, `${filenameBase}-${timestamp}.${ext}`);
      return;
    }

    const canvas = await toCanvas(target, sharedOptions.value);
    const quality = exportFormat.value !== 'png' ? exportQuality.value / 100 : undefined;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, MIME_TYPE_MAP[exportFormat.value], quality),
    );

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    await downloadFile(blob, `${filenameBase}-${timestamp}.${ext}`);
  }

  return {
    // 状态
    exportFormat,
    exportQuality,
    exportPixelRatio,
    isQualityEnabled,
    // 方法
    ensureFontEmbedCSS,
    exportTargetAsImage,
  };
}
