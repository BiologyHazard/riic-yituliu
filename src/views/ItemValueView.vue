<script setup lang="ts">
import { computed, ref } from 'vue';
import defaultItems from '@/assets/json/item.json';
import { itemValues, type ItemValue } from '@/utils/itemValue';

// 搜索和过滤
const searchQuery = ref<string>('');
const pasteInput = ref<string>('');

const filteredItems = computed<ItemValue[]>(() => {
  if (!searchQuery.value) return itemValues.value;
  const query = searchQuery.value.toLowerCase();
  return itemValues.value.filter(
    (item) => item.name.toLowerCase().includes(query) || item.id.includes(query),
  );
});

// 处理文件上传
async function handleFileUpload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedData = JSON.parse(text);
    if (Array.isArray(importedData)) {
      itemValues.value = importedData;
      alert('导入成功！');
    } else {
      alert('JSON 格式错误：应为数组。');
    }
  } catch (err) {
    alert('解析失败：' + err);
  }
}

// 粘贴 JSON
function handlePasteImport(): void {
  try {
    const importedData = JSON.parse(pasteInput.value);
    if (Array.isArray(importedData)) {
      itemValues.value = importedData;
      pasteInput.value = '';
      alert('导入成功！');
    } else {
      alert('JSON 格式错误：应为数组。');
    }
  } catch (err) {
    alert('解析失败：' + err);
  }
}

// 导出 JSON
function exportJson(): void {
  const data = JSON.stringify(itemValues.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'item.json';
  a.click();
  URL.revokeObjectURL(url);
}

// 重置到默认
function resetToDefault(): void {
  if (confirm('确定要重置所有物品价值到默认值吗？')) {
    itemValues.value = JSON.parse(JSON.stringify(defaultItems));
  }
}
</script>

<template>
  <div class="item-value-view mx-auto max-w-4xl p-4">
    <h1 class="mb-6 text-2xl font-bold">物品价值管理</h1>

    <!-- 顶部操作栏 -->
    <div class="mbe-6 flex flex-wrap items-end gap-4 border-be pb-6">
      <div class="min-w-64 flex-1">
        <label class="mbe-1 block text-sm font-medium">搜索物品</label>
        <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="名称或 ID..." />
      </div>

      <div class="flex gap-2">
        <UButton color="neutral" variant="soft" @click="exportJson">
          <template #leading>
            <UIcon name="i-lucide-download" />
          </template>
          导出 JSON
        </UButton>
        <UButton color="error" variant="soft" @click="resetToDefault">重置默认</UButton>
      </div>
    </div>

    <!-- 导入区域 -->
    <div class="mbe-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <div class="font-bold">上传 JSON 文件</div>
        </template>
        <div class="flex flex-col gap-2">
          <UFileUpload
            accept="application/json"
            description="选择 JSON 文件"
            icon="i-lucide-upload"
            type="file"
            @change="handleFileUpload"
          />
          <p class="text-xs text-muted">选择与 item.json 格式相同的 JSON 文件</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-bold">粘贴 JSON 文本</div>
        </template>
        <div class="flex flex-col gap-2">
          <UTextarea
            v-model="pasteInput"
            autoresize
            placeholder="在此粘贴 JSON 内容..."
            :rows="3"
          />
          <UButton block color="primary" :disabled="!pasteInput" @click="handlePasteImport">
            确认导入
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- 物品列表 -->
    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-start">
          <thead>
            <tr class="border-be">
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">名称</th>
              <th class="px-4 py-2">价值 (AP)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="border-be border-accented hover:bg-muted"
            >
              <td class="px-4 py-2 font-mono">{{ item.id }}</td>
              <td class="px-4 py-2">
                <span :class="`rarity-${item.rarity}`">{{ item.name }}</span>
              </td>
              <td class="px-4 py-2">
                <UInputNumber
                  v-model="item.apValue"
                  :format-options="{
                    maximumSignificantDigits: 21,
                    useGrouping: false,
                  }"
                  :step="1"
                  :step-snapping="false"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.rarity-5 {
  color: #ff7f27;
}
.rarity-4 {
  color: #e1b2ff;
}
.rarity-3 {
  color: #00b0ff;
}
.rarity-2 {
  color: #c9e100;
}
.rarity-1 {
  color: #9e9e9e;
}
</style>
