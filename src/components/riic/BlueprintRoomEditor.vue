<script setup lang="ts">
import type { BuildingSlot } from '@/types/gameData';
import {
  getCharMaxEliteLevel,
  isCharInGame,
  isRogueSpChar,
  patchedCharacterTable,
} from '@/utils/gameData/character';
import type { BlueprintRoomState } from '@/utils/riic/roomState';
import {
  createRoomState,
  getRoomCapacity,
  getRoomName,
  getSlotRooms,
  getStatusOptions,
  normalizeRoomState,
  roomRules,
} from '@/utils/riic/roomState';
import { computed, ref, toRaw, watch } from 'vue';
import BlueprintRoom from './BlueprintRoom.vue';

const props = defineProps<{ roomSlot: BuildingSlot; state: BlueprintRoomState }>();
const emit = defineEmits<{ save: [state: BlueprintRoomState]; reset: [] }>();
const open = defineModel<boolean>('open', { required: true });
const draft = ref<BlueprintRoomState>(structuredClone(toRaw(props.state)));
const candidates = computed<{ label: string; value: string }[]>(() =>
  getSlotRooms(props.roomSlot).map((room) => ({ label: room.name, value: room.id })),
);
const capacity = computed<number>(() => getRoomCapacity(draft.value));
const maxLevel = computed<number>(() => roomRules[draft.value.roomId]?.phases.length ?? 1);
const statuses = computed<{ label: string; value: string }[]>(() =>
  getStatusOptions(draft.value.roomId),
);
const outputRoom = computed<boolean>(() =>
  ['TRADING', 'MANUFACTURE', 'POWER'].includes(draft.value.roomId),
);
const hasProgress = computed<boolean>(
  () => outputRoom.value || ['HIRE', 'TRAINING', 'RECYCLE'].includes(draft.value.roomId),
);
const hasTriangles = computed<boolean>(() => outputRoom.value || draft.value.roomId === 'RECYCLE');
const built = computed<boolean>(() => draft.value.construction === 'built');
const owners = computed<{ label: string; value: string }[]>(() => [
  { label: '未进驻', value: '__none__' },
  ...Object.entries(patchedCharacterTable.value)
    .filter(([id]) => id.startsWith('char_') && isCharInGame(id) && !isRogueSpChar(id))
    .map(([value, character]) => ({ value, label: character.name })),
]);
const constructions = [
  { label: '已建造', value: 'built' },
  { label: '待建造', value: 'empty' },
  { label: '未清理', value: 'unclean' },
  { label: '建造完成待确认', value: 'complete' },
];

watch(
  () => props.state,
  (state) => {
    draft.value = structuredClone(toRaw(state));
  },
);
watch(open, (value) => {
  if (value) draft.value = structuredClone(toRaw(props.state));
});
watch(
  () => draft.value.level,
  () => {
    draft.value.staff = Math.min(draft.value.staff, capacity.value);
  },
);
watch(
  () => draft.value.trainingLevel,
  (level) => {
    draft.value.trainingTargetLevel = Math.min(level + 1, 3);
  },
);

function changeRoom(roomId: string) {
  draft.value = createRoomState(roomId);
  draft.value.status = getStatusOptions(roomId)[0]?.value ?? 'idle';
}

function changeOwner(value: string) {
  draft.value.ownerId = value === '__none__' ? '' : value;
  draft.value.ownerElite = Math.min(
    draft.value.ownerElite,
    getCharMaxEliteLevel(draft.value.ownerId),
  );
  draft.value.staff = draft.value.ownerId ? 1 : 0;
  draft.value.status = draft.value.ownerId ? 'working' : 'idle';
}

function save() {
  emit('save', normalizeRoomState(toRaw(draft.value)));
  open.value = false;
}

function close() {
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    description="调整房间状态，应用后更新基建地图。"
    :title="`${getRoomName(draft)} · ${roomSlot.storeyId || '顶层'}`"
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #body>
      <div class="flex flex-col gap-5">
        <div
          class="room-preview"
          :style="{ aspectRatio: `${roomSlot.size.col} / ${roomSlot.size.row}` }"
        >
          <BlueprintRoom
            :cols="roomSlot.size.col"
            :room-name="getRoomName(draft)"
            :rows="roomSlot.size.row"
            :state="draft"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="设施类型"
            ><USelect
              class="w-full"
              :items="candidates"
              :model-value="draft.roomId"
              @update:model-value="changeRoom"
          /></UFormField>
          <UFormField v-if="draft.roomId !== 'CONTROL'" label="建造状态"
            ><USelect
              v-model="draft.construction"
              class="w-full"
              :items="
                constructions.filter((item) => item.value !== 'complete' || roomSlot.size.col > 2)
              "
          /></UFormField>
          <template v-if="built">
            <UFormField v-if="maxLevel > 1" label="设施等级"
              ><UInputNumber
                v-model="draft.level"
                class="w-full"
                :max="maxLevel"
                :min="1"
                :step="1"
            /></UFormField>
            <UFormField
              v-if="capacity > 0 && draft.roomId !== 'PRIVATE'"
              :label="`进驻干员数量（上限 ${capacity}）`"
              ><UInputNumber
                v-model="draft.staff"
                class="w-full"
                :max="capacity"
                :min="0"
                :step="1"
            /></UFormField>
            <template v-if="draft.roomId === 'PRIVATE'">
              <UFormField label="进驻干员"
                ><USelectMenu
                  class="w-full"
                  :items="owners"
                  :model-value="draft.ownerId || '__none__'"
                  value-key="value"
                  @update:model-value="changeOwner"
              /></UFormField>
              <UFormField v-if="draft.ownerId" label="头像精英阶段"
                ><UInputNumber
                  v-model="draft.ownerElite"
                  :max="getCharMaxEliteLevel(draft.ownerId)"
                  :min="0"
              /></UFormField>
            </template>
            <UFormField v-if="statuses.length > 1" label="工作状态"
              ><USelect v-model="draft.status" class="w-full" :items="statuses"
            /></UFormField>
            <UFormField v-if="['DORMITORY', 'PRIVATE'].includes(draft.roomId)" label="房间名称"
              ><UInput
                v-model="draft.name"
                class="w-full"
                :placeholder="roomRules[draft.roomId]?.name"
            /></UFormField>
            <UFormField
              v-if="hasProgress"
              :hint="`${Math.round(draft.progress * 100)}%`"
              label="进度"
              ><USlider v-model="draft.progress" :max="1" :min="0" :step="0.01"
            /></UFormField>
            <UFormField v-if="hasTriangles" label="工作动画当前三角数量"
              ><UInputNumber v-model="draft.triangles" class="w-full" :max="3" :min="0" :step="1"
            /></UFormField>
            <template v-if="draft.roomId === 'TRAINING' && draft.status !== 'idle'">
              <UFormField label="当前专精等级"
                ><UInputNumber v-model="draft.trainingLevel" :max="3" :min="0"
              /></UFormField>
              <UFormField label="目标专精等级"
                ><UInputNumber v-model="draft.trainingTargetLevel" disabled :max="3" :min="1"
              /></UFormField>
            </template>
          </template>
        </div>
        <div v-if="built" class="flex flex-col gap-3">
          <USwitch
            v-if="outputRoom && draft.staff > 0"
            v-model="draft.tired"
            label="进驻干员疲劳"
          />
          <USwitch v-if="outputRoom" v-model="draft.highlight" label="房间高亮" />
          <USwitch
            v-if="['TRADING', 'MANUFACTURE', 'RECYCLE'].includes(draft.roomId)"
            v-model="draft.product"
            label="有产物可领取"
          />
          <USwitch v-if="maxLevel > draft.level" v-model="draft.canLevelUp" label="满足升级条件" />
          <template v-if="draft.roomId === 'MEETING'">
            <USwitch v-model="draft.clue" label="线索提示" />
            <USwitch v-model="draft.message" label="留言板提示" />
          </template>
          <USwitch v-if="draft.roomId === 'CONTROL'" v-model="draft.trust" label="信赖上限提示" />
          <template v-if="draft.roomId === 'ELEVATOR'">
            <USwitch v-model="draft.directions.up" label="上方连接" />
            <USwitch v-model="draft.directions.down" label="下方连接" />
            <USwitch v-model="draft.directions.left" label="左侧连接" />
            <USwitch v-model="draft.directions.right" label="右侧连接" />
          </template>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-between gap-3">
        <UButton
          color="neutral"
          label="恢复该房间默认状态"
          variant="ghost"
          @click="emit('reset')"
        />
        <div class="flex gap-2">
          <UButton color="neutral" label="取消" variant="soft" @click="close" />
          <UButton label="应用" @click="save" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.room-preview {
  position: relative;
  align-self: center;
  inline-size: min(100%, 360px);
}
</style>
