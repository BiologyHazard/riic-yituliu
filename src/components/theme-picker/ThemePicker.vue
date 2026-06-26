<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { useColorMode } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';

const colorModeCalculated = useColorMode();
const colorModeRaw = useColorMode({ emitAuto: true });

const open = ref(false);

const activeColorRole = ref<number>(0);
const carousel = useTemplateRef('carousel');

function onTabChange(val: string | number) {
  carousel.value?.emblaApi?.scrollTo(Number(val));
}

function onCarouselSelect(index: number) {
  activeColorRole.value = index;
}

const {
  primaryColors,
  secondaryColors,
  neutralColors,
  radiuses,
  englishFontOptions,
  chineseFontOptions,
  monospaceFontOptions,
  iconSets,
  colorModes,
  primary,
  secondary,
  neutral,
  radius,
  englishFont,
  chineseFont,
  monospaceFont,
  iconSet,
  resetTheme,
  loadEnglishFontCss,
  loadChineseFontCss,
  loadMonospaceFontCss,
} = useTheme();
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{
      content: 'w-80 px-4 py-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-5rem)]',
    }"
  >
    <UTooltip text="更改主题">
      <UButton
        aria-label="更改主题"
        color="neutral"
        icon="i-lucide-palette"
        square
        :ui="{ leadingIcon: 'text-primary' }"
        :variant="open ? 'soft' : 'ghost'"
      />
    </UTooltip>

    <template #content>
      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">主题色</legend>
        <UTabs
          v-model="activeColorRole"
          :content="false"
          :items="[
            { label: '第一主题色', value: 0 },
            { label: '第二主题色', value: 1 },
            { label: '中性色', value: 2 },
          ]"
          size="xs"
          variant="link"
          @update:model-value="onTabChange"
        />

        <UCarousel
          ref="carousel"
          v-slot="{ item }"
          auto-height
          class="mt-2"
          :duration="20"
          :items="[0, 1, 2]"
          :ui="{ container: 'transition-[height]' }"
          @select="onCarouselSelect"
        >
          <div v-if="item === 0" class="grid grid-cols-3 gap-1">
            <ThemePickerButton
              v-for="{ id, lightLabel, darkLabel, chipStyle } in primaryColors"
              :key="id"
              :chip-style
              :label="colorModeCalculated === 'dark' ? darkLabel : lightLabel"
              :selected="primary === id"
              @click="primary = id"
            />
          </div>
          <div v-else-if="item === 1" class="grid grid-cols-3 gap-1">
            <ThemePickerButton
              v-for="{ id, lightLabel, darkLabel, chipStyle } in secondaryColors"
              :key="id"
              :chip-style
              :label="colorModeCalculated === 'dark' ? darkLabel : lightLabel"
              :selected="secondary === id"
              @click="secondary = id"
            />
          </div>
          <div v-else-if="item === 2" class="grid grid-cols-3 gap-1">
            <ThemePickerButton
              v-for="{ id, lightLabel, darkLabel, chipStyle } in neutralColors"
              :key="id"
              :chip-style
              :label="colorModeCalculated === 'dark' ? darkLabel : lightLabel"
              :selected="neutral === id"
              @click="neutral = id"
            />
          </div>
        </UCarousel>
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
        <legend class="mb-2 text-xs leading-none font-semibold select-none">英文字体</legend>
        <div>
          <USelect
            v-model="englishFont"
            class="w-full rounded-sm ring-default hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
            color="neutral"
            :content="{ bodyLock: false }"
            icon="i-lucide-type"
            :items="englishFontOptions"
            size="sm"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            @update:open="
              (open) => {
                if (open) loadEnglishFontCss();
              }
            "
          >
            <template #item-label="{ item }">
              <span
                :style="{
                  fontFamily:
                    item.source.type === 'use-chinese'
                      ? undefined
                      : item.source.type === 'keyword'
                        ? `${item.family}, sans-serif`
                        : `'${item.family}', sans-serif`,
                }"
              >
                {{ item.label }}
              </span>
            </template>
          </USelect>
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">中文字体</legend>
        <div>
          <USelect
            v-model="chineseFont"
            class="w-full rounded-sm ring-default hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
            color="neutral"
            :content="{ bodyLock: false }"
            icon="i-lucide-quote"
            :items="chineseFontOptions"
            size="sm"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            @update:open="
              (open) => {
                if (open) loadChineseFontCss();
              }
            "
          >
            <template #item-label="{ item }">
              <span
                :style="{
                  fontFamily:
                    item.source.type === 'keyword'
                      ? `${item.family}, sans-serif`
                      : `'${item.family}', sans-serif`,
                }"
              >
                {{ item.label }}
              </span>
            </template>
          </USelect>
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold select-none">等宽字体</legend>
        <div>
          <USelect
            v-model="monospaceFont"
            class="w-full rounded-sm font-mono ring-default hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
            color="neutral"
            :content="{ bodyLock: false }"
            icon="i-lucide-code"
            :items="monospaceFontOptions"
            size="sm"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            @update:open="
              (open) => {
                if (open) loadMonospaceFontCss();
              }
            "
          >
            <template #item-label="{ item }">
              <span
                :style="{
                  fontFamily:
                    item.source.type === 'keyword'
                      ? `${item.family}, monospace`
                      : `'${item.family}', monospace`,
                }"
              >
                {{ item.label }}
              </span>
            </template>
          </USelect>
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
