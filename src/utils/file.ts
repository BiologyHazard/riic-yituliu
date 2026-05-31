/**
 * 触发浏览器下载文件
 * @param url 文件链接或数据链接 (Blob, DataURL, URL)
 * @param filename 下载的文件名
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  function triggerDownload(href: string) {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // blob: / data: URL 可直接触发下载，无需重新 fetch
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    triggerDownload(url);
    return;
  }

  // 判断是否同源
  const isSameOrigin = (() => {
    try {
      return new URL(url, location.href).origin === location.origin;
    } catch {
      return true;
    }
  })();

  if (isSameOrigin) {
    triggerDownload(url);
    return;
  }

  // 跨域资源：download 属性会被忽略，尝试转换为 blob 下载
  try {
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch {
    // 最终回退：新标签页打开
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
