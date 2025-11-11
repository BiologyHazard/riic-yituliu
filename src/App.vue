<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { theme, toggleTheme, initTheme } from '@/utils/theme';
import DarkMode from './components/icons/DarkMode.vue';
import LightMode from './components/icons/LightMode.vue';

// initialize theme on app start
initTheme();
</script>

<template>
  <header>
    <RouterLink to="/">
      <img class="logo theme-dark-darken" src="@/assets/images/白鸥.webp" alt="logo" />
    </RouterLink>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/riic">RIIC</RouterLink>
    </nav>
    <button class="theme-toggle" @click="toggleTheme" type="button">
      <!-- 🌞🌙 -->
      <div class="theme-icon">
        <DarkMode v-if="theme === 'dark'" />
        <LightMode v-else />
      </div>
    </button>
  </header>

  <RouterView />
</template>

<style scoped lang="scss">
header {
  // position: sticky;
  // top: 0;
  // z-index: 100;
  // background-color: var(--color-background);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  // gap: 1em;
  margin-block-end: 1em;
}

header a {
  display: flex;
}

.logo {
  display: inline-block;
  width: 2em;
  height: 2em;
}

nav {
  text-align: center;
  font-size: 1em;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1em;
}

nav a:not(:first-of-type) {
  border-left: 1px solid var(--color-border);
}

.theme-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none;
  width: 2em;
  height: 2em;
  padding: 0;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  cursor: pointer;
  color: var(--color-text);
  font-size: 1em;
  transition: background-color 0.1s;
}

.theme-icon {
  width: 1.5em;
  height: 1.5em;
}

.theme-toggle:hover {
  background-color: #aaa3;
  transition: background-color 0.1s;
}
</style>
