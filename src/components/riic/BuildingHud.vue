<script setup lang="ts">
import data from '@/assets/images/riic/blueprint/hud.json';
import type { BlueprintNode } from '@/utils/riic/blueprintRenderer';
import { gameUiSprites } from '@/utils/riic/gameUiData';
import { computed } from 'vue';
import GameUiCanvas from './GameUiCanvas.vue';

export interface BuildingResources {
  labor: number;
  laborLimit: number;
  gold: number;
  electricity: number;
  electricityLimit: number;
}
const props = defineProps<{
  width: number;
  height: number;
  construction: boolean;
  resources: BuildingResources;
}>();
const emit = defineEmits<{ action: [action: string] }>();
const menuOpen = defineModel<boolean>('menuOpen', { default: false });
const prefabs = data.prefabs as unknown as Record<string, BlueprintNode>;
const actions = computed<Record<string, { action: string; label: string }>>(() => ({
  btn_topmenu_back: { action: 'back', label: '返回' },
  btn_topmenu_home: { action: 'menu', label: '菜单' },
  archi_switch_hotspot: {
    action: 'construction',
    label: props.construction ? '退出建造模式' : '进入建造模式',
  },
  panel_station_manage: { action: 'overview', label: '进驻总览' },
  panel_blank: { action: 'close-menu', label: '关闭菜单' },
  btn_building: { action: 'close-menu', label: '基建' },
}));

const roots = computed<BlueprintNode[]>(() => {
  const page = structuredClone(prefabs.float!);
  // 屏幕 Canvas 的矩形和缩放由 Unity 在初始化时计算，序列化的零值不参与子节点布局。
  page.rect = {
    ...page.rect,
    AnchorMin: { x: 0, y: 0 },
    AnchorMax: { x: 1, y: 1 },
    Pivot: { x: 0.5, y: 0.5 },
    LocalScale: { x: 1, y: 1 },
  };
  const topHolder = page.children.find((node) => node.name === 'panel_common_topmenu')!;
  topHolder.children = [structuredClone(prefabs.topMenu!)];
  const overview = structuredClone(prefabs.panel_bp_or_vault!);
  const blueprint = structuredClone(prefabs.panel_blueprint!);
  blueprint.active = true;
  const architecture = structuredClone(prefabs.panel_architecture!);
  architecture.active = props.construction;
  const resources = structuredClone(prefabs.resources!);
  const values: Record<string, string> = {
    text_gold: String(props.resources.gold),
    text_elect: String(props.resources.electricity),
    text_elect_limit: `/${props.resources.electricityLimit}`,
    text_labor: String(props.resources.labor),
    text_labor_limit: `/${props.resources.laborLimit}`,
  };
  function prepare(node: BlueprintNode) {
    if (node.name === 'panel_on') node.active = props.construction;
    if (node.name === 'panel_off') node.active = !props.construction;
    if (node.name === 'button')
      node.rect.AnchoredPosition.x = data.switchPositions[props.construction ? 'on' : 'off'];
    if (
      node.name === 'panel_backonly' ||
      node.name === 'icon_disable' ||
      node.name === 'panel_track_point' ||
      node.name === 'icon_ripple' ||
      node.name === 'icon_up' ||
      node.name === 'panel_dynamic_group' ||
      node.name === 'panel_labor_detail'
    )
      node.active = false;
    if (node.name === 'panel_content') node.active = menuOpen.value;
    if (node.text && values[node.name] !== undefined) node.text.value = values[node.name]!;
    node.children.forEach(prepare);
  }
  const result = [architecture, overview, blueprint, resources, page];
  result.forEach(prepare);
  return result;
});

function onAction(action: string) {
  if (action === 'menu') menuOpen.value = !menuOpen.value;
  else if (action === 'close-menu') menuOpen.value = false;
  else if (action === 'back' && menuOpen.value) menuOpen.value = false;
  else emit('action', action);
}
</script>

<template>
  <GameUiCanvas
    :actions="actions"
    class="building-hud"
    :height="height"
    :roots="roots"
    :sprites="gameUiSprites"
    :width="width"
    @action="onAction"
  />
</template>

<style scoped>
.building-hud {
  z-index: 3;
}
</style>
