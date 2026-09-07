<script setup lang="ts">
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import type { CharDataType } from '@/types/riic';
import { downloadFile } from '@/utils/file';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';

interface AvatarPresetConfig {
  inputText: string;
  spacing: number;
  showEdgePadding: boolean;
  showBackground: boolean;
  showProfession: boolean;
  showRarity: boolean;
  showEliteLevel: boolean;
}

interface AvatarPreset {
  name: string;
  config: AvatarPresetConfig;
}

interface AvatarPresetExport {
  version: 1;
  presets: AvatarPreset[];
}

const PRESET_EXPORT_VERSION = 1;
const toast = useToast();

// ─── 解析逻辑 ───────────────────────────────────────────────

function parseToken(token: string): CharDataType | null {
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

  const displayName = remaining.trim();
  if (!displayName) return null;

  return {
    displayName,
    eliteLevel,
    isTired,
  };
}

function parseInput(text: string): CharDataType[] {
  return text
    .split(/[\s]+/)
    .map(parseToken)
    .filter((x) => x !== null);
}

const inputText = ref<string>('');
const isCopying = ref<boolean>(false);

const chars = computed<CharDataType[]>(() => parseInput(inputText.value));

// ─── 显示开关 ───────────────────────────────────────────────

const spacing = ref<number>(0);
const showEdgePadding = ref<boolean>(false);
const showBackground = ref<boolean>(false);
const showProfession = ref<boolean>(true);
const showRarity = ref<boolean>(true);
const showEliteLevel = ref<boolean>(true);

// ─── 预设 ───────────────────────────────────────────────────

const presetName = ref<string>('');
const presetImportFile = ref<File | null>(null);
const editingPresetIndex = ref<number | null>(null);
const editingPresetName = ref<string>('');
const presets = useLocalStorage<AvatarPreset[]>('avatar-generator-presets', []);

function getCurrentConfig(): AvatarPresetConfig {
  return {
    inputText: inputText.value,
    spacing: spacing.value,
    showEdgePadding: showEdgePadding.value,
    showBackground: showBackground.value,
    showProfession: showProfession.value,
    showRarity: showRarity.value,
    showEliteLevel: showEliteLevel.value,
  };
}

function generatePresetName(): string {
  const operatorNames = chars.value.slice(0, 3).map((char) => char.displayName);
  const operatorCountSuffix = chars.value.length > 3 ? `等${chars.value.length}名干员` : '';
  const baseName =
    operatorNames.length > 0 ? `${operatorNames.join('、')}${operatorCountSuffix}` : '未命名预设';
  let name = baseName;
  let suffix = 2;

  while (presets.value.some((preset) => preset.name === name)) {
    name = `${baseName} (${suffix})`;
    suffix += 1;
  }

  return name;
}

function savePreset(): void {
  const name = presetName.value.trim() || generatePresetName();

  const preset: AvatarPreset = { name, config: getCurrentConfig() };
  const existingIndex = presets.value.findIndex((item) => item.name === name);
  if (existingIndex >= 0) {
    presets.value.splice(existingIndex, 1, preset);
  } else {
    presets.value.push(preset);
  }

  presetName.value = '';
  cancelRenamePreset();
  toast.add({
    title: existingIndex >= 0 ? '预设已更新' : '预设已保存',
    description: name,
    color: 'success',
    icon: 'i-lucide-check',
  });
}

function startRenamePreset(index: number): void {
  const preset = presets.value[index];
  if (!preset) return;
  editingPresetIndex.value = index;
  editingPresetName.value = preset.name;
}

function cancelRenamePreset(): void {
  editingPresetIndex.value = null;
  editingPresetName.value = '';
}

function renamePreset(index: number): void {
  const preset = presets.value[index];
  if (!preset) return;

  const name = editingPresetName.value.trim();
  if (!name) {
    toast.add({ title: '无法更改名称', description: '预设名称不能为空', color: 'error' });
    return;
  }
  if (presets.value.some((item, itemIndex) => itemIndex !== index && item.name === name)) {
    toast.add({ title: '无法更改名称', description: '已存在同名预设', color: 'error' });
    return;
  }

  presets.value.splice(index, 1, { ...preset, name });
  cancelRenamePreset();
  toast.add({ title: '预设名称已更改', description: name, icon: 'i-lucide-check' });
}

function applyPreset(preset: AvatarPreset): void {
  inputText.value = preset.config.inputText;
  spacing.value = preset.config.spacing;
  showEdgePadding.value = preset.config.showEdgePadding;
  showBackground.value = preset.config.showBackground;
  showProfession.value = preset.config.showProfession;
  showRarity.value = preset.config.showRarity;
  showEliteLevel.value = preset.config.showEliteLevel;
  toast.add({ title: '已应用预设', description: preset.name, icon: 'i-lucide-check' });
}

function deletePreset(index: number): void {
  const [deletedPreset] = presets.value.splice(index, 1);
  if (!deletedPreset) return;
  cancelRenamePreset();
  toast.add({ title: '预设已删除', description: deletedPreset.name });
}

function isAvatarPresetConfig(value: unknown): value is AvatarPresetConfig {
  if (typeof value !== 'object' || value === null) return false;
  const config = value as Record<string, unknown>;
  return (
    typeof config.inputText === 'string' &&
    typeof config.spacing === 'number' &&
    Number.isFinite(config.spacing) &&
    config.spacing >= 0 &&
    typeof config.showEdgePadding === 'boolean' &&
    typeof config.showBackground === 'boolean' &&
    typeof config.showProfession === 'boolean' &&
    typeof config.showRarity === 'boolean' &&
    typeof config.showEliteLevel === 'boolean'
  );
}

function parsePresetExport(value: unknown): AvatarPreset[] {
  if (typeof value !== 'object' || value === null) {
    throw new Error('文件内容不是有效的预设数据');
  }

  const data = value as Partial<AvatarPresetExport>;
  if (data.version !== PRESET_EXPORT_VERSION || !Array.isArray(data.presets)) {
    throw new Error('不支持的预设文件格式或版本');
  }

  return data.presets.map((preset, index) => {
    if (
      typeof preset !== 'object' ||
      preset === null ||
      typeof preset.name !== 'string' ||
      !preset.name.trim() ||
      !isAvatarPresetConfig(preset.config)
    ) {
      throw new Error(`第 ${index + 1} 个预设格式无效`);
    }

    return { name: preset.name.trim(), config: preset.config };
  });
}

async function exportPresets(): Promise<void> {
  const data: AvatarPresetExport = { version: PRESET_EXPORT_VERSION, presets: presets.value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  await downloadFile(blob, 'avatar-generator-presets.json');
  toast.add({ title: '预设已导出', description: `共 ${presets.value.length} 个预设` });
}

async function importPresets(file: File | null | undefined): Promise<void> {
  if (!file) return;

  try {
    const importedPresets = parsePresetExport(JSON.parse(await file.text()));
    const mergedPresets = new Map(presets.value.map((preset) => [preset.name, preset]));
    importedPresets.forEach((preset) => mergedPresets.set(preset.name, preset));
    presets.value = [...mergedPresets.values()];
    cancelRenamePreset();
    toast.add({
      title: '预设导入成功',
      description: `已导入 ${importedPresets.length} 个预设，同名预设已覆盖`,
      color: 'success',
      icon: 'i-lucide-check',
    });
  } catch (error) {
    toast.add({
      title: '预设导入失败',
      description: error instanceof Error ? error.message : '无法读取预设文件',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    });
  } finally {
    presetImportFile.value = null;
  }
}

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
                :chars="chars"
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

              <!-- 已解析干员 -->
              <div v-if="chars.length > 0" class="flex flex-col gap-1.5">
                <span class="text-xs font-medium text-toned">已解析 {{ chars.length }} 名干员</span>
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="({ displayName, isTired, eliteLevel }, i) in chars"
                    :key="i"
                    color="neutral"
                    size="sm"
                    variant="soft"
                  >
                    {{ displayName }}
                    <template v-if="eliteLevel !== null"> · 精英{{ eliteLevel }}</template>
                    <template v-if="isTired"> · 涣散</template>
                  </UBadge>
                </div>
              </div>

              <USeparator />

              <div class="flex flex-col gap-3">
                <div>
                  <span class="text-sm font-medium text-toned">预设</span>
                  <p class="text-xs text-toned">保存干员列表、间距和显示选项。</p>
                </div>

                <UFieldGroup>
                  <UInput
                    v-model="presetName"
                    class="min-w-0 flex-1"
                    icon="i-lucide-bookmark"
                    maxlength="40"
                    placeholder="预设名称"
                    @keyup.enter="savePreset"
                  />
                  <UButton icon="i-lucide-save" label="保存" @click="savePreset" />
                </UFieldGroup>

                <div v-if="presets.length > 0" class="flex flex-col gap-2">
                  <div
                    v-for="(preset, index) in presets"
                    :key="preset.name"
                    class="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                  >
                    <UInput
                      v-if="editingPresetIndex === index"
                      v-model="editingPresetName"
                      autofocus
                      class="min-w-0 flex-1"
                      maxlength="40"
                      size="sm"
                      @keyup.enter="renamePreset(index)"
                      @keyup.esc="cancelRenamePreset"
                    />
                    <span v-else class="min-w-0 flex-1 truncate text-sm">{{ preset.name }}</span>
                    <span class="shrink-0 text-xs text-toned">
                      {{ parseInput(preset.config.inputText).length }} 名干员
                    </span>
                    <UTooltip v-if="editingPresetIndex === index" text="确认更改">
                      <UButton
                        color="success"
                        icon="i-lucide-check"
                        size="xs"
                        variant="ghost"
                        @click="renamePreset(index)"
                      />
                    </UTooltip>
                    <UTooltip v-if="editingPresetIndex === index" text="取消更改">
                      <UButton
                        color="neutral"
                        icon="i-lucide-x"
                        size="xs"
                        variant="ghost"
                        @click="cancelRenamePreset"
                      />
                    </UTooltip>
                    <UTooltip v-if="editingPresetIndex !== index" text="更改名称">
                      <UButton
                        color="neutral"
                        icon="i-lucide-pencil"
                        size="xs"
                        variant="ghost"
                        @click="startRenamePreset(index)"
                      />
                    </UTooltip>
                    <UTooltip v-if="editingPresetIndex !== index" text="应用预设">
                      <UButton
                        color="neutral"
                        icon="i-lucide-play"
                        size="xs"
                        variant="ghost"
                        @click="applyPreset(preset)"
                      />
                    </UTooltip>
                    <UTooltip v-if="editingPresetIndex !== index" text="删除预设">
                      <UButton
                        color="error"
                        icon="i-lucide-trash-2"
                        size="xs"
                        variant="ghost"
                        @click="deletePreset(index)"
                      />
                    </UTooltip>
                  </div>
                </div>
                <p v-else class="text-xs text-muted">尚未保存预设</p>

                <div class="flex flex-wrap gap-2">
                  <UButton
                    color="neutral"
                    :disabled="presets.length === 0"
                    icon="i-lucide-upload"
                    label="导出预设"
                    size="sm"
                    variant="subtle"
                    @click="exportPresets"
                  />
                  <UFileUpload
                    v-model="presetImportFile"
                    accept="application/json,.json"
                    icon="i-lucide-download"
                    label="导入预设"
                    :preview="false"
                    reset
                    size="sm"
                    variant="button"
                    @update:model-value="importPresets"
                  />
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
