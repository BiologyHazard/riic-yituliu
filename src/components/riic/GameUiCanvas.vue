<script setup lang="ts">
import type { BlueprintColor, BlueprintNode } from '@/utils/riic/blueprintRenderer';
import type { GameUiHit, GameUiSprite } from '@/utils/riic/gameUiRenderer';
import { renderGameUi } from '@/utils/riic/gameUiRenderer';
import { applyPressedColor } from '@/utils/riic/gameUiTree';
import { computed, onMounted, ref, useId } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps<{
  roots: BlueprintNode[];
  sprites: Record<string, GameUiSprite>;
  width: number;
  height: number;
  actions: Record<string, { action: string; label: string }>;
}>();
const emit = defineEmits<{ action: [action: string] }>();
const instanceId = useId();
const fontsReady = ref<number>(0);
const pressed = ref<string | null>(null);
onMounted(async () => {
  await Promise.all(
    ['NotoSansHans-Medium', 'JovannyLemonad-Bender', 'JovannyLemonad-Bender-Light'].map((font) =>
      document.fonts.load(`24px "${font}"`),
    ),
  );
  fontsReady.value++;
});
const rendered = computed<ReturnType<typeof renderGameUi>>(() => {
  void fontsReady.value;
  const roots = structuredClone(props.roots);
  roots.forEach((root) => applyPressedColor(root, pressed.value));
  return renderGameUi(roots, props.sprites, props.width, props.height, props.actions);
});
function filterId(color: BlueprintColor): string {
  return `${instanceId}-hud-${color.r}-${color.g}-${color.b}`;
}
const tints = computed<BlueprintColor[]>(() => {
  const result = new Map<string, BlueprintColor>();
  for (const layer of rendered.value.layers) {
    if (
      layer.kind === 'image' &&
      (layer.color.r !== 1 || layer.color.g !== 1 || layer.color.b !== 1)
    )
      result.set(filterId(layer.color), layer.color);
  }
  return [...result.values()];
});
function hitStyle(hit: GameUiHit): CSSProperties {
  return {
    left: `${(hit.box.x / props.width) * 100}%`,
    top: `${(hit.box.y / props.height) * 100}%`,
    width: `${((hit.box.width * hit.box.scaleX) / props.width) * 100}%`,
    height: `${((hit.box.height * hit.box.scaleY) / props.height) * 100}%`,
  };
}
</script>

<template>
  <div class="game-ui-canvas" @pointerdown.stop>
    <svg
      aria-hidden="true"
      class="game-ui-art"
      preserveAspectRatio="none"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <defs>
        <template v-for="layer in rendered.layers" :key="`clip-${layer.key}`">
          <clipPath v-if="layer.clip" :id="`${instanceId}-clip-${layer.key}`">
            <rect
              :height="layer.clip.height * layer.clip.scaleY"
              :width="layer.clip.width * layer.clip.scaleX"
              :x="layer.clip.x"
              :y="layer.clip.y"
            />
          </clipPath>
        </template>
        <filter
          v-for="color in tints"
          :id="filterId(color)"
          :key="filterId(color)"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            :values="`${color.r} 0 0 0 0 0 ${color.g} 0 0 0 0 0 ${color.b} 0 0 0 0 0 1 0`"
          />
        </filter>
      </defs>
      <g
        v-for="layer in rendered.layers"
        :key="layer.key"
        :clip-path="layer.clip ? `url(#${instanceId}-clip-${layer.key})` : undefined"
        :transform="layer.transform"
      >
        <svg
          v-if="layer.kind === 'image'"
          :height="layer.box.height * layer.box.scaleY"
          :opacity="layer.opacity"
          overflow="hidden"
          preserveAspectRatio="none"
          :viewBox="layer.crop"
          :width="layer.box.width * layer.box.scaleX"
          :x="layer.box.x"
          :y="layer.box.y"
        >
          <image
            :filter="
              layer.color.r !== 1 || layer.color.g !== 1 || layer.color.b !== 1
                ? `url(#${filterId(layer.color)})`
                : undefined
            "
            :height="layer.sprite.height"
            :href="layer.sprite.source"
            :width="layer.sprite.width"
          />
        </svg>
        <rect
          v-else-if="layer.kind === 'rect'"
          :fill="layer.fill"
          :height="layer.box.height * layer.box.scaleY"
          :width="layer.box.width * layer.box.scaleX"
          :x="layer.box.x"
          :y="layer.box.y"
        />
        <text
          v-else
          :dominant-baseline="layer.baseline"
          :fill="layer.fill"
          :font-family="layer.font"
          :font-size="layer.size"
          :text-anchor="layer.anchor"
          :x="layer.x"
          :y="layer.y"
        >
          <tspan v-for="(run, index) in layer.runs" :key="index" :fill="run.fill">
            {{ run.value }}
          </tspan>
        </text>
      </g>
    </svg>
    <!-- 热区使用游戏节点矩形，浏览器按钮仅提供键盘与读屏语义。 -->
    <button
      v-for="hit in rendered.hits"
      :key="hit.key"
      :aria-label="hit.label"
      class="game-ui-hit"
      :data-game-action="hit.action"
      :style="hitStyle(hit)"
      :title="hit.label"
      type="button"
      @blur="pressed = null"
      @click.stop="emit('action', hit.action)"
      @keydown.enter="pressed = hit.name"
      @keydown.space="pressed = hit.name"
      @keyup="pressed = null"
      @pointercancel="pressed = null"
      @pointerdown="pressed = hit.name"
      @pointerleave="pressed = null"
      @pointerup="pressed = null"
    ></button>
  </div>
</template>

<style scoped>
.game-ui-canvas,
.game-ui-art {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}

.game-ui-hit {
  position: absolute;
  padding: 0;
  pointer-events: auto;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.game-ui-hit:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: -2px;
}
</style>
