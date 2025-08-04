<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { NavigationMenuRoot, NavigationMenuList, NavigationMenuItem } from 'reka-ui';
import GithubIcon from './components/Icon/GithubIcon.vue';
import ToastList from './components/ToastList.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50">
    <header class="p-4 border-b border-secondary-300 flex items-center justify-between gap-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <div class="flex items-center gap-3">
        <img src="/favicon.png" height="32" width="32" alt="Favicon" class="rounded-lg">
        <h1 class="font-bold text-xl text-primary-800">Anki Linguist</h1>
      </div>
      <NavigationMenuRoot>
        <NavigationMenuList class="flex gap-2 mx-auto rounded-lg justify-center bg-primary-100 p-1">
          <NavigationMenuItem class="rounded-md">
            <RouterLink to="/" class="px-4 py-2 text-primary-700 hover:text-primary-900 transition-colors" active-class="bg-white shadow-sm rounded-md text-primary-900 font-medium">
              Home
            </RouterLink>
          </NavigationMenuItem>
          <NavigationMenuItem class="rounded-md">
            <RouterLink to="/files" class="px-4 py-2 text-primary-700 hover:text-primary-900 transition-colors" active-class="bg-white shadow-sm rounded-md text-primary-900 font-medium">
              Files
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuRoot>
    </header>

    <div class="flex-grow">
      <RouterView />
    </div>

    <ToastList />

    <footer class="border-t border-secondary-300 p-4 mt-8 bg-white">
      <div class="text-center text-secondary-600 flex gap-2 justify-center items-center">
        <span>cup11 © 2025</span>
        <a href="https://github.com/cup113/anki-linguist" class="flex items-center gap-2 hover:text-primary-700 transition-colors">
          <GithubIcon class="w-5 h-5" />
          <img src="https://img.shields.io/github/v/tag/cup113/anki_maker?label=%E5%BD%93%E5%89%8D%E7%89%88%E6%9C%AC" alt="Version" />
        </a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.router-link-active {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  font-weight: 500;
  color: var(--color-primary-900);
}
</style>