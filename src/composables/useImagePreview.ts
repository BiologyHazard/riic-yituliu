import { computed, ref } from 'vue';

export type PreviewTarget = {
  url: string;
  name: string;
  downloadName: string;
};

export function useImagePreview() {
  const preview = ref<PreviewTarget | null>(null);
  const scale = ref(1);
  const offset = ref({ x: 0, y: 0 });
  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });
  const offsetStart = ref({ x: 0, y: 0 });

  const imgStyle = computed(() => ({
    transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`,
    cursor: isDragging.value ? 'grabbing' : 'grab',
    transition: isDragging.value ? 'none' : 'transform 0.15s ease',
  }));

  function open(target: PreviewTarget) {
    preview.value = target;
    scale.value = 1;
    offset.value = { x: 0, y: 0 };
  }

  function close() {
    preview.value = null;
  }

  function zoomIn() {
    scale.value = Math.min(scale.value * 1.25, 8);
  }

  function zoomOut() {
    scale.value = Math.max(scale.value / 1.25, 0.125);
  }

  function resetZoom() {
    scale.value = 1;
    offset.value = { x: 0, y: 0 };
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }

  function onMousedown(e: MouseEvent) {
    if (e.button !== 0) return;
    isDragging.value = true;
    dragStart.value = { x: e.clientX, y: e.clientY };
    offsetStart.value = { ...offset.value };
  }

  function onMousemove(e: MouseEvent) {
    if (!isDragging.value) return;
    offset.value = {
      x: offsetStart.value.x + e.clientX - dragStart.value.x,
      y: offsetStart.value.y + e.clientY - dragStart.value.y,
    };
  }

  function onMouseup() {
    isDragging.value = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') zoomIn();
    else if (e.key === '-') zoomOut();
    else if (e.key === '0') resetZoom();
  }

  async function download() {
    if (!preview.value) return;
    const { url, downloadName } = preview.value;

    function triggerDownload(href: string) {
      const a = document.createElement('a');
      a.href = href;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // blob: / data: URL 可直接触发下载，无需重新 fetch
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      triggerDownload(url);
      return;
    }

    // 同源 URL：直接设置 download 属性即可，浏览器会处理下载
    const isSameOrigin = (() => {
      try {
        return new URL(url).origin === location.origin;
      } catch {
        return true; // 相对路径视为同源
      }
    })();

    if (isSameOrigin) {
      triggerDownload(url);
      return;
    }

    // 跨域：download 属性会被浏览器忽略，需 fetch 转为 blob URL 再触发
    try {
      const res = await fetch(url, { referrerPolicy: 'no-referrer' });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // fetch 失败时回退到新标签页打开
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  return {
    preview,
    scale,
    imgStyle,
    open,
    close,
    zoomIn,
    zoomOut,
    resetZoom,
    onWheel,
    onMousedown,
    onMousemove,
    onMouseup,
    onKeydown,
    download,
  };
}
