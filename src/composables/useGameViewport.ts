import { useEventListener } from '@vueuse/core';
import { computed, onBeforeUnmount, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

interface GameViewport {
  pageFullscreen: Ref<boolean>;
  expanded: ComputedRef<boolean>;
  error: Ref<string>;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
}

/** 网页扩展与浏览器全屏独立管理，浏览器退出时以真实状态为准。 */
export function useGameViewport(): GameViewport {
  const pageFullscreen = ref<boolean>(false);
  const browserFullscreen = ref<boolean>(false);
  const error = ref<string>('');
  const expanded = computed<boolean>(() => pageFullscreen.value || browserFullscreen.value);

  useEventListener(document, 'fullscreenchange', () => {
    browserFullscreen.value = document.fullscreenElement === document.documentElement;
  });
  useEventListener(document, 'keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    // 弹层先处理自己的关闭操作，避免一次按键同时退出游戏视口。
    if (
      document.querySelector(
        '[role="dialog"][data-state="open"], [role="listbox"][data-state="open"]',
      )
    )
      return;
    if (
      event.target instanceof Element &&
      event.target.closest('[role="dialog"], [role="listbox"]')
    )
      return;
    pageFullscreen.value = false;
  });

  async function enterFullscreen(): Promise<void> {
    error.value = '';
    try {
      // 全屏包含网页弹层，房间编辑器的 Portal 仍能正常显示。
      await document.documentElement.requestFullscreen();
      pageFullscreen.value = false;
    } catch {
      error.value = '浏览器未允许全屏，请使用网页全屏或重新尝试。';
    }
  }

  async function exitFullscreen(): Promise<void> {
    if (document.fullscreenElement === document.documentElement) await document.exitFullscreen();
    pageFullscreen.value = false;
  }

  onBeforeUnmount(() => {
    void exitFullscreen();
  });

  return { pageFullscreen, expanded, error, enterFullscreen, exitFullscreen };
}
