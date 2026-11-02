import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FilesView from '@/views/FilesView.vue';
import EditView from '@/views/EditView.vue';
import AiView from '@/views/AiView.vue';
import AiMcpView from '@/views/AiMcpView.vue';
import AiPromptView from '@/views/AiPromptView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/files',
      name: 'files',
      component: FilesView,
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditView,
    },
    {
      path: '/ai',
      component: AiView,
      children: [
        {
          path: '',
          redirect: { name: 'ai-mcp' },
        },
        {
          path: 'mcp',
          name: 'ai-mcp',
          component: AiMcpView,
        },
        {
          path: 'prompt',
          name: 'ai-prompt',
          component: AiPromptView,
        },
      ],
    },
  ],
});

export default router;
