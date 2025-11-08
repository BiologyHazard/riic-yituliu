<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="32" height="32" />
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/riic">RIIC</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped lang="scss">
header {
  display: flex;
  place-items: center;
  justify-content: center;
  line-height: 1.5;
  max-height: 100vh;
}

header .wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}

.logo {
  display: block;
  margin: 0 2rem 0 0;
}

nav {
  // width: 100%;
  text-align: center;
  font-size: 1.5rem;
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
</style>
