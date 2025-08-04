<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { NavigationMenuRoot, NavigationMenuList, NavigationMenuItem } from 'reka-ui';
import GithubIcon from './components/Icon/GithubIcon.vue';
import ToastList from './components/ToastList.vue';
</script>

<template>
  <header class="p-2 border-b border-b-secondary-500 flex items-center justify-center gap-6 py-4">
    <img src="/favicon.png" height="32" width="32" alt="Favicon">
    <h1 class="font-bold text-lg">Anki Linguist</h1>
    <NavigationMenuRoot>
      <NavigationMenuList class="flex gap-4 mx-auto rounded-xl justify-center">
        <NavigationMenuItem class="text-gray-700">
          <RouterLink to="/">Home</RouterLink>
        </NavigationMenuItem>
        <NavigationMenuItem class="text-gray-700">
          <RouterLink to="/files">Files</RouterLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuRoot>
  </header>

  <RouterView />

  <ToastList />

  <footer class="border-t border-t-gray-500 p-2 mt-20">
    <div class="text-center text-gray-500 flex gap-2 justify-center items-center">
      <span>cup11 © 2025</span>
      <a href="https://github.com/cup113/anki-linguist">
        <GithubIcon></GithubIcon>
      </a>
    </div>
  </footer>
</template>
