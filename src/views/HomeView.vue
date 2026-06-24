<script setup lang="ts">
import {
  avatarSources,
  baseSkillIconSources,
  currentAvatarSource,
  currentAvatarSourceId,
  currentBaseSkillIconSource,
  currentBaseSkillIconSourceId,
  currentGameDataBaseUrl,
  currentGameDataSource,
  currentGameDataSourceId,
  currentItemIconSource,
  currentItemIconSourceId,
  currentMirrorId,
  gameDataSources,
  githubMirrors,
  itemIconSources,
} from '@/utils/dataSources';
import { loadGameData } from '@/utils/gameData';
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
import { watch } from 'vue';

watch(currentGameDataBaseUrl, loadGameData);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody class="space-y-6">
        <section class="data-source-settings rounded-lg p-4">
          <h2 class="mb-4 text-lg font-bold">数据源设置</h2>
          <div class="flex flex-col gap-4">
            <UFormField label="游戏数据源">
              <USelect
                v-model="currentGameDataSourceId"
                class="w-full max-w-xs"
                :content="{ bodyLock: false }"
                :items="gameDataSources"
                :ui="{
                  trailingIcon:
                    'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
                value-key="id"
              />
            </UFormField>
            <UFormField label="干员头像源">
              <USelect
                v-model="currentAvatarSourceId"
                class="w-full max-w-xs"
                :content="{ bodyLock: false }"
                :items="avatarSources"
                :ui="{
                  trailingIcon:
                    'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
                value-key="id"
              />
            </UFormField>
            <UFormField label="基建技能图标源">
              <USelect
                v-model="currentBaseSkillIconSourceId"
                class="w-full max-w-xs"
                :content="{ bodyLock: false }"
                :items="baseSkillIconSources"
                :ui="{
                  trailingIcon:
                    'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
                value-key="id"
              />
            </UFormField>
            <UFormField label="物品图标源">
              <USelect
                v-model="currentItemIconSourceId"
                class="w-full max-w-xs"
                :content="{ bodyLock: false }"
                :items="itemIconSources"
                :ui="{
                  trailingIcon:
                    'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
                value-key="id"
              />
            </UFormField>
            <UFormField
              v-if="
                currentGameDataSource.isGithub ||
                currentAvatarSource.isGithub ||
                currentItemIconSource.isGithub ||
                currentBaseSkillIconSource.isGithub
              "
              label="GitHub 镜像"
            >
              <USelect
                v-model="currentMirrorId"
                class="w-full max-w-xs"
                :content="{ bodyLock: false }"
                :items="githubMirrors"
                :ui="{
                  trailingIcon:
                    'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
                value-key="id"
              />
            </UFormField>

            <div class="text-xs break-all text-muted">
              当前 Base URL：<span class="font-mono">{{ currentGameDataBaseUrl }}</span>
            </div>
          </div>
        </section>

        <div class="flex flex-col">
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://h089spg07ll.feishu.cn/wiki/space/7463413966732361756"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            飞书知识库
          </UButton>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://space.bilibili.com/37179776"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            bilibili@Bio-Hazard
          </UButton>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://www.skland.com/profile?id=1138552273321"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            森空岛@BioHazard
          </UButton>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://bbs.nga.cn/thread.php?authorid=60824354"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            NGA@Bio-Hazard
          </UButton>
        </div>

        <figure>
          <ULink
            href="https://prts.wiki/w/用户:BioHazard/基建地图"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt="2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机 by bilibili@Bio-Hazard"
              class="theme-dark-darken"
              referrerpolicy="no-referrer"
              :src="
                getPrtsWikiMediaUrl(
                  '2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机_by_bilibili@Bio-Hazard.png',
                )
              "
            />
          </ULink>
          <figcaption class="mbs-2 text-center text-sm text-toned">
            2025-09-30-「众生行记」版本之后基建房间 <code>slot_id</code> 和清理提供的无人机 by
            <ULink
              class="text-primary hover:text-primary/75"
              rel="noopener noreferrer"
              target="_blank"
              to="https://space.bilibili.com/37179776"
            >
              bilibili@Bio-Hazard
            </ULink>
          </figcaption>
        </figure>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
