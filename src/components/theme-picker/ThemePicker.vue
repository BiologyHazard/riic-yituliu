<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { useColorMode } from '@vueuse/core';
import { ref } from 'vue';

const colorModeCalculated = useColorMode();
const colorModeRaw = useColorMode({ emitAuto: true });

const open = ref(false);

const activeColorRole = ref<'primary' | 'secondary'>('primary');

const {
  primaryColors,
  secondaryColors,
  neutralColors,
  radiuses,
  fonts,
  iconSets,
  colorModes,
  primary,
  secondary,
  neutral,
  radius,
  font,
  iconSet,
  resetTheme,
} = useTheme();
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{ content: 'w-80 px-4 py-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-5rem)]' }"
  >
    <template #default>
      <UButton
        aria-label="颜色选择器"
        color="neutral"
        icon="i-lucide-swatch-book"
        square
        :ui="{ leadingIcon: 'text-primary' }"
        :variant="open ? 'soft' : 'ghost'"
      />
    </template>

    <template #content>
      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">主题色</legend>
        <UTabs
          v-model="activeColorRole"
          :items="[
            { label: '第一主题色', value: 'primary', slot: 'primary-content' },
            { label: '第二主题色', value: 'secondary', slot: 'secondary-content' },
          ]"
          size="xs"
          variant="link"
        >
          <template #primary-content>
            <div class="mt-2 grid grid-cols-3 gap-1">
              <ThemePickerButton
                v-for="{ id, lightLabel, darkLabel, chipStyle } in primaryColors"
                :key="id"
                :chip-style
                :label="colorModeCalculated === 'dark' ? darkLabel : lightLabel"
                :selected="primary === id"
                @click="primary = id"
              />
            </div>
          </template>

          <template #secondary-content>
            <div class="mt-2 grid grid-cols-3 gap-1">
              <ThemePickerButton
                v-for="{ id, lightLabel, darkLabel, chipStyle } in secondaryColors"
                :key="id"
                :chip-style
                :label="colorModeCalculated === 'dark' ? darkLabel : lightLabel"
                :selected="secondary === id"
                @click="secondary = id"
              />
            </div>
          </template>
        </UTabs>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">中性色</legend>
        <div class="grid grid-cols-3 gap-1">
          <ThemePickerButton
            v-for="{ id, lightLabel, darkLabel, chipStyle } in neutralColors"
            :key="id"
            :chip-style
            :label="colorModeCalculated === 'dark' ? darkLabel : lightLabel"
            :selected="neutral === id"
            @click="neutral = id"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">圆角</legend>
        <div class="grid grid-cols-5 gap-1">
          <ThemePickerButton
            v-for="r in radiuses"
            :key="r"
            class="justify-center px-0"
            :label="String(r)"
            :selected="radius === r"
            @click="radius = r"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">字体</legend>
        <div>
          <USelect
            v-model="font"
            class="w-full rounded-sm ring-default hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
            color="neutral"
            :content="{ bodyLock: false }"
            icon="i-lucide-type"
            :items="fonts"
            size="sm"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">图标</legend>
        <div>
          <USelect
            v-model="iconSet"
            class="w-full rounded-sm capitalize ring-default hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
            color="neutral"
            :content="{ bodyLock: false }"
            :icon="iconSets.find((i) => i.value === iconSet)?.icon"
            :items="iconSets"
            size="sm"
            :ui="{
              item: 'capitalize',
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">颜色模式</legend>
        <div class="grid grid-cols-3 gap-1">
          <ThemePickerButton
            v-for="{ label, value, icon } in colorModes"
            :key="label"
            :icon="icon"
            :label="label"
            :selected="colorModeRaw === value"
            @click="colorModeRaw = value"
          />
        </div>
      </fieldset>

      <fieldset>
        <div class="flex justify-end">
          <UTooltip text="重置主题">
            <UButton
              class="ring-default hover:bg-elevated/50"
              color="neutral"
              icon="i-lucide-rotate-ccw"
              size="sm"
              variant="outline"
              @click="resetTheme"
            />
          </UTooltip>
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>
