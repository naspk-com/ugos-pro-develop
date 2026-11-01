import { createRouter, createWebHistory } from 'vue-router';
import ApplicationAuthorizationPage from '../pages/ApplicationAuthorizationPage.vue';
import CapacityPage from '../pages/CapacityPage.vue';
import ProjectBasicInfoPage from '../pages/ProjectBasicInfoPage.vue';
import WindowManagementPage from '../pages/WindowManagementPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/project-basic-info' },
    { path: '/project-basic-info', component: ProjectBasicInfoPage },
    { path: '/capacity', component: CapacityPage },
    { path: '/window-management', component: WindowManagementPage },
    { path: '/application-authorization', component: ApplicationAuthorizationPage },
  ],
});

export default router;
