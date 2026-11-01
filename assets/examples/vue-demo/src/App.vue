<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { KeyboardControl } from '@ugreen-nas/core/plugins';

const menuItems = [
  { path: '/capacity', label: '应用能力' },
  { path: '/window-management', label: '应用窗口管理' },
  { path: '/application-authorization', label: '应用授权' },
  { path: '/project-basic-info', label: '项目基础信息' },
];

onMounted(() => {
  initKeyboard();
});

function initKeyboard() {
  const kb = new KeyboardControl([
    { key: 'Ctrl+f', action: 'save' },
    { key: 'ArrowLeft', action: 'globalLeft', global: true },
  ]);
  kb.on('action', action => {
    console.log('🚀 ~ useEffect ~ action:', action);
  });
}
</script>

<template>
  <main class="appLayout">
    <aside class="sidebar">
      <h2 class="sidebarTitle">示例导航</h2>
      <nav aria-label="示例项目页面导航">
        <ul class="menuList">
          <li v-for="menuItem in menuItems" :key="menuItem.path">
            <RouterLink :to="menuItem.path" class="menuButton" active-class="isActive">
              {{ menuItem.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>
    <section class="content">
      <RouterView />
    </section>
  </main>
</template>
