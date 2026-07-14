import type { ComputedRef, MaybeRefOrGetter } from 'vue';
import { computed, onUnmounted, ref, toValue, watchEffect } from 'vue';

/**
 * 仿照 `@unhead/vue` 的竞态处理策略：
 *
 * 每个 `useHead()` 调用创建一个 entry，带单调递增的 `_i` 索引。
 * 解析时对所有 tag 按 `(weight, position)` 排序后去重。
 * 对 `title` 这类唯一 tag，相同 dedupe key 的多个 entry 中，
 * `_p`（= `entryIndex << 10 + tagIndex`）最大的胜出 ——
 * 即 **后注册的组件优先**，卸载时自动移除 entry，次新顶上。
 *
 * 这里用 `Map<id, value>` 替代 entry 列表，`headerTitle` computed
 * 取最大 id 的 value，实现完全相同的「后注册优先，卸载自动回退」语义。
 */

let nextId = 0;
const entries = ref(new Map<number, string | null>());

const headerTitle = computed<string | null>(() => {
  let bestId = -1;
  let bestValue: string | null = null;
  for (const [id, value] of entries.value) {
    if (id > bestId) {
      bestId = id;
      bestValue = value;
    }
  }
  return bestValue;
});

/**
 * 设置或读取标题栏（Header）的动态标题。
 *
 * - 在子组件中调用 `useHeaderTitle(getter)` 可注册动态标题，
 *   当依赖变化时自动更新，组件卸载时自动清除。
 *   当多个子组件同时注册时，**最后注册**的标题胜出，
 *   卸载后自动回退到次新的标题。
 * - 在 AppHeader 中调用 `useHeaderTitle()`（无参数）可获取
 *   当前动态标题的只读引用。
 *
 * 用法类似 `useHead`：
 * ```ts
 * useHeaderTitle(() => `${props.name} - 塞壬唱片 - 专辑详情`);
 * ```
 */
export function useHeaderTitle(): ComputedRef<string | null>;
export function useHeaderTitle(title: MaybeRefOrGetter<string | null | undefined>): void;
export function useHeaderTitle(
  title?: MaybeRefOrGetter<string | null | undefined>,
): ComputedRef<string | null> | void {
  if (arguments.length === 0) {
    return headerTitle;
  }

  const id = nextId++;

  const stop = watchEffect(() => {
    entries.value.set(id, toValue(title) ?? null);
  });

  onUnmounted(() => {
    stop();
    entries.value.delete(id);
  });
}
