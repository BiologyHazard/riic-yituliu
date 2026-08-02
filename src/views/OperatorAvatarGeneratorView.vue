<script setup lang="ts">
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import type { OperatorSpec } from '@/types/riic';
import { getCharIdByName } from '@/utils/gameData/character';
import { computed, ref, useTemplateRef } from 'vue';

// ─── 解析逻辑 ───────────────────────────────────────────────

function parseToken(token: string): OperatorSpec | null {
  let remaining = token.trim();

  // 1. 检查末尾的 !
  let isTired = false;
  if (remaining.endsWith('!')) {
    isTired = true;
    remaining = remaining.slice(0, -1);
  }

  // 2. 检查末尾的数字 (0/1/2)
  let eliteLevel: number | null = null;
  const lastChar = remaining.charAt(remaining.length - 1);
  if (['0', '1', '2'].includes(lastChar)) {
    eliteLevel = parseInt(lastChar);
    remaining = remaining.slice(0, -1);
  }

  const charName = remaining.trim();

  // 3. 查找干员
  const charId = getCharIdByName(charName);
  if (!charId) return null;

  return {
    charId,
    charName,
    eliteLevel,
    isTired,
  };
}

function parseInput(text: string): OperatorSpec[] {
  return text
    .split(/[\s]+/)
    .map(parseToken)
    .filter((x) => x !== null);
}

const inputText = ref<string>('');
const isCopying = ref<boolean>(false);

const operatorSpecs = computed<OperatorSpec[]>(() => parseInput(inputText.value));

// ─── 显示开关 ───────────────────────────────────────────────

const spacing = ref<number>(0);
const showEdgePadding = ref<boolean>(false);
const showBackground = ref<boolean>(false);
const showProfession = ref<boolean>(true);
const showRarity = ref<boolean>(true);
const showEliteLevel = ref<boolean>(true);

// ─── 复制到剪贴板 ───────────────────────────────────────────

const avatarCanvasRef = useTemplateRef('avatarCanvasRef');

async function copyToClipboard(): Promise<void> {
  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();

  try {
    isCopying.value = true;
    initToast({ title: '复制到剪贴板', description: '正在获取图片…' });

    updateProgress(0.3, { description: '正在获取图片…' });
    const avatarCanvas = avatarCanvasRef.value;
    if (!avatarCanvas) throw new Error('Canvas not found');
    const blob = await avatarCanvas.toBlob();

    updateProgress(0.7, { description: '正在写入剪贴板…' });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);

    completeToast({ title: '复制成功', description: '干员头像已复制到剪贴板！' });
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    failToast({
      title: '复制失败',
      description: error instanceof Error ? error.message : '复制失败，请重试',
    });
  } finally {
    isCopying.value = false;
  }
}
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="干员头像生成器" />

      <UPageBody>
        <div class="flex flex-col gap-8">
          <!-- 预览区 -->
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-default"
            >
              <OperatorAvatarCanvas
                ref="avatarCanvasRef"
                :operator-specs
                :show-background
                :show-edge-padding
                :show-elite-level
                :show-profession
                :show-rarity
                :spacing
              />
            </div>

            <UButton
              :disabled="isCopying"
              icon="i-lucide-clipboard-copy"
              size="lg"
              variant="subtle"
              @click="copyToClipboard"
            >
              复制到剪贴板
            </UButton>
          </div>

          <!-- 控制面板 -->
          <div class="grid gap-8 lg:grid-cols-2">
            <!-- 左栏：输入区 -->
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-toned" for="operator-input">干员输入</label>
                <p class="text-xs text-toned">
                  以空格分隔。名称后加 0/1/2 表示精英等级，加 ! 表示注意力涣散。
                </p>
                <UTextarea
                  v-model="inputText"
                  placeholder="谬因2 Lancet-20! 缇缇1 乌尔比安"
                  :rows="3"
                  size="lg"
                />
              </div>

              <!-- 已识别干员 -->
              <div
                v-if="operatorSpecs.filter((s) => s.charId).length > 0"
                class="flex flex-col gap-1.5"
              >
                <span class="text-xs font-medium text-toned"
                  >已识别 {{ operatorSpecs.filter((s) => s.charId).length }} 名干员</span
                >
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="({ charName, isTired, eliteLevel }, i) in operatorSpecs"
                    :key="i"
                    color="neutral"
                    size="sm"
                    variant="soft"
                  >
                    {{ charName }}
                    <template v-if="eliteLevel !== null"> · 精英{{ eliteLevel }}</template>
                    <template v-if="isTired"> · 涣散</template>
                  </UBadge>
                </div>
              </div>
            </div>

            <!-- 右栏：设置区 -->
            <div class="flex flex-col gap-5">
              <!-- 间距 -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-toned">干员间距</label>
                <p class="text-xs text-toned">相邻干员之间的间距（1 单位 = 头像宽度）</p>
                <UInputNumber v-model="spacing" :min="0" size="sm" :step="0.05" />
              </div>

              <!-- 边距开关 -->
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-toned">两侧边距</span>
                  <span class="text-xs text-toned">在最左和最右添加间距的一半作为边距</span>
                </div>
                <USwitch v-model="showEdgePadding" size="sm" />
              </div>

              <!-- 分隔线 -->
              <USeparator />

              <!-- 显示开关 -->
              <div class="flex flex-col gap-3">
                <span class="text-sm font-medium text-toned">显示选项</span>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">背景底图</span>
                  <USwitch v-model="showBackground" size="sm" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">职业角标</span>
                  <USwitch v-model="showProfession" size="sm" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">精英化等级</span>
                  <USwitch v-model="showEliteLevel" size="sm" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">星级</span>
                  <USwitch v-model="showRarity" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
