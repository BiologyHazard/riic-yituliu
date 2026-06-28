/**
 * 阿里云 OSS 图片缩放模式。
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/resize-images-4
 *
 * - `lfit`（默认值）：等比缩放至指定宽高区域内最大图形。
 * - `mfit`：等比缩放至覆盖指定宽高区域。
 * - `fill`：等比缩放至覆盖指定宽高区域并居中裁剪。
 * - `pad`：等比缩放至指定宽高内最大图形并填充颜色至指定尺寸。
 * - `fixed`：固定宽高，强制缩放。
 */
export type AliyunOssResizeMode = 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed';

/**
 * 阿里云 OSS 图片缩放参数。
 *
 * 操作名称：resize
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/resize-images-4
 */
export interface AliyunOssImageResizeOptions {
  /** 按百分比缩放图片。取值范围 [1,1000]，小于 100 为缩小，大于 100 为放大。 */
  p?: number;
  /** 指定目标缩放图的宽度。取值范围 [1,16384]。 */
  w?: number;
  /** 指定目标缩放图的高度。取值范围 [1,16384]。 */
  h?: number;
  /** 指定缩放的模式。默认值：lfit。 */
  m?: AliyunOssResizeMode;
  /** 指定目标缩放图的最长边。取值范围 [1,16384]。 */
  l?: number;
  /** 指定目标缩放图的最短边。取值范围 [1,16384]。 */
  s?: number;
  /**
   * 当目标图片分辨率大于原图分辨率时，设置是否进行缩放。
   * - 1（默认值）：返回按照原图分辨率转换的图片（可能和原图的体积不一样）。
   * - 0：按指定参数进行缩放。
   */
  limit?: 0 | 1;
  /**
   * 当缩放模式选择为 pad（缩放填充）时，可以设置填充的颜色。
   * RGB 颜色值，例如：000000 表示黑色，FFFFFF 表示白色。默认值：FFFFFF（白色）。
   */
  color?: string;
}

/**
 * 阿里云 OSS 图片质量变换参数。
 *
 * 质量变换操作是使用原图本身的格式对图片进行压缩。
 * 操作名称：quality
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/adjust-image-quality
 */
export interface AliyunOssImageQualityOptions {
  /**
   * 设置图片的相对质量，对原图按百分比进行质量压缩。
   * 取值范围 [1,100]。
   */
  q?: number;
  /**
   * 设置图片的绝对质量。
   * 如果原图的质量高于或等于设定的目标质量（Q%），则压缩到指定的目标质量。
   * 取值范围 [1,100]。
   */
  Q?: number;
}

/**
 * 阿里云 OSS 图片格式转换的目标格式。
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/convert-image-formats-2
 *
 * - `jpg`：将原图保存为 JPG 格式。
 * - `png`：将原图保存为 PNG 格式。
 * - `webp`：将原图保存为 WebP 格式。
 * - `bmp`：将原图保存为 BMP 格式。
 * - `gif`：原图为 GIF 图片则继续保存为 GIF 格式；原图不是 GIF 图片，则按原图格式保存。
 * - `tiff`：将原图保存为 TIFF 格式。
 * - `heic`：将原图保存为 HEIF 格式。
 * - `avif`：将原图保存为 AVIF 格式。
 */
export type AliyunOssImageFormat =
  | 'jpg'
  | 'png'
  | 'webp'
  | 'bmp'
  | 'gif'
  | 'tiff'
  | 'heic'
  | 'avif';

/**
 * 阿里云 OSS 设置图片显示方式。
 *
 * 操作名称：interlace
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/gradual-display
 *
 * 指定是否设置图片为渐进显示。
 *
 * - `0`：标准显示。
 * - `1`：渐进显示。
 *
 * @remarks 图片处理的渐进显示操作仅适用于原图为 JPG 格式图片的情况。
 * 如果原图不是 JPG 格式，您需要通过 `format,jpg` 参数将图片修改 JPG 格式。
 */
export type AliyunOssImageInterlace = 0 | 1;

/**
 * 阿里云 OSS 图片处理全部可选参数。
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/overview-17/
 */
export interface AliyunOssImageOptions {
  /**
   * 图片缩放参数
   *
   * @see https://help.aliyun.com/zh/oss/user-guide/resize-images-4
   */
  resize?: AliyunOssImageResizeOptions;
  /**
   * 质量变换参数
   *
   * @see https://help.aliyun.com/zh/oss/user-guide/adjust-image-quality
   */
  quality?: AliyunOssImageQualityOptions;
  /**
   * 格式转换参数
   *
   * @see https://help.aliyun.com/zh/oss/user-guide/convert-image-formats-2
   */
  format?: AliyunOssImageFormat;
  /**
   * 设置图片为渐进显示。操作名称：interlace。
   *
   * @see https://help.aliyun.com/zh/oss/user-guide/gradual-display
   */
  interlace?: AliyunOssImageInterlace;
}

/** 图片处理操作链 */
const ossProcessChain: Array<{
  operation: string;
  buildParams: (options: AliyunOssImageOptions) => string | null;
}> = [
  {
    operation: 'resize',
    buildParams(options) {
      const r = options.resize;
      if (!r) return null;
      const parts: string[] = [];
      if (r.p !== undefined) parts.push(`p_${r.p}`);
      if (r.w !== undefined) parts.push(`w_${r.w}`);
      if (r.h !== undefined) parts.push(`h_${r.h}`);
      if (r.m !== undefined) parts.push(`m_${r.m}`);
      if (r.l !== undefined) parts.push(`l_${r.l}`);
      if (r.s !== undefined) parts.push(`s_${r.s}`);
      if (r.limit !== undefined) parts.push(`limit_${r.limit}`);
      if (r.color !== undefined) parts.push(`color_${r.color}`);
      if (parts.length === 0) return null;
      return parts.join(',');
    },
  },
  {
    operation: 'quality',
    buildParams(options) {
      const q = options.quality;
      if (!q) return null;
      const parts: string[] = [];
      if (q.q !== undefined) parts.push(`q_${q.q}`);
      if (q.Q !== undefined) parts.push(`Q_${q.Q}`);
      if (parts.length === 0) return null;
      return parts.join(',');
    },
  },
  {
    operation: 'format',
    buildParams(options) {
      if (!options.format) return null;
      return options.format;
    },
  },
  {
    operation: 'interlace',
    buildParams(options) {
      if (options.interlace === undefined) return null;
      return String(options.interlace);
    },
  },
];

/**
 * 对阿里云 OSS 图片添加图片处理参数。
 *
 * 您可以直接在图片 URL 后添加处理参数，以允许任何人永久匿名访问处理后的图片 URL。
 * 处理参数格式：`?x-oss-process=image/<操作名称>,<参数1>/<操作名称>,<参数2>`
 *
 * @param url - 原始图片 URL
 * @param options - OSS 图片处理参数
 * @returns 添加了处理参数的 URL
 */
export function getAliyunOssProcessedUrl(url: string, options?: AliyunOssImageOptions): string {
  if (!options) {
    return url;
  }

  let processValue = '';
  for (const { operation, buildParams } of ossProcessChain) {
    const params = buildParams(options);
    if (params !== null) {
      if (!processValue) {
        processValue = 'image';
      }
      processValue += `/${operation},${params}`;
    }
  }

  if (!processValue) {
    return url;
  }

  const urlObj = new URL(url);
  urlObj.searchParams.set('x-oss-process', processValue);
  return urlObj.toString();
}

/**
 * 将阿里云 OSS 的原图缩放至指定宽度，转换为 WebP 格式，并压缩至 50% 质量。
 *
 * @param url - 原始封面 URL
 * @param width - 目标宽度（px）
 * @returns 添加了缩放与 WebP 转换参数的 URL
 */
export function getResizedCoverUrl(url: string, width: number | null): string {
  return getAliyunOssProcessedUrl(url, {
    resize: { w: width ?? undefined },
    format: 'webp',
    quality: { Q: 50 },
  });
}
