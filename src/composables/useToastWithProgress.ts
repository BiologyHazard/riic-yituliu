import type { Toast } from '@nuxt/ui/composables/useToast';
import { nextTick, ref } from 'vue';

export function useToastWithProgress() {
  const toastComposable = useToast();

  const currentToastId = ref<string | number | null>(null);

  function initToast(toast: Partial<Toast>) {
    const t = toastComposable.add({
      icon: 'i-lucide-loader-circle',
      color: 'primary',
      duration: Infinity, // 设置为无限时长，相当于停止计时
      // @ts-expect-error 使用 modelValue 手动控制进度条
      progress: { modelValue: 0, max: 1 },
      ui: {
        icon: 'animate-spin',
      },
      ...toast,
    });
    currentToastId.value = t.id;
  }

  function updateProgress(progress: number, toast: Partial<Toast>) {
    if (currentToastId.value !== null) {
      toastComposable.update(currentToastId.value, {
        duration: Infinity,
        // @ts-expect-error 使用 modelValue 手动控制进度条
        progress: { modelValue: progress, max: 1 },
        ...toast,
      });
    }
  }

  async function completeToast(toast: Partial<Toast>) {
    if (currentToastId.value !== null) {
      toastComposable.update(currentToastId.value, {
        duration: 0,
        progress: false,
      });
      await nextTick(); // 确保进度条被隐藏后再更新为完成状态
      toastComposable.update(currentToastId.value, {
        icon: 'i-lucide-circle-check',
        color: 'success',
        duration: 5000,
        progress: true,
        ui: {
          icon: 'animate-none',
        },
        ...toast,
      });
    }
  }

  function failToast(toast: Partial<Toast>) {
    if (currentToastId.value !== null) {
      toastComposable.update(currentToastId.value, {
        icon: 'i-lucide-x-circle',
        color: 'error',
        duration: 0,
        progress: false,
        ui: {
          icon: 'animate-none',
        },
        ...toast,
      });
    }
  }

  return {
    initToast,
    updateProgress,
    completeToast,
    failToast,
  };
}
