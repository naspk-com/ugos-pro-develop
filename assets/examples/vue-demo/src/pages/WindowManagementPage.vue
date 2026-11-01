<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import cloudWindow from '@ugreen-nas/core/cloudWindow';

interface WindowState {
  winId: string;
  width: number;
  height: number;
  x: number;
  y: number;
  maximized: string;
  minimized: string;
  alwaysOnTop: string;
}

const actionDefinitions = [
  { key: 'refresh', label: '读取窗口状态' },
  { key: 'resize', label: '设置为 1024 × 640' },
  { key: 'center', label: '窗口居中' },
  { key: 'maximize', label: '最大化' },
  { key: 'unmaximize', label: '取消最大化' },
  { key: 'minimize', label: '最小化' },
  { key: 'restore', label: '恢复窗口' },
  { key: 'pin', label: '开启置顶' },
  { key: 'unpin', label: '取消置顶' },
] as const;

type ActionKey = (typeof actionDefinitions)[number]['key'];

const windowState = ref<WindowState>({
  winId: cloudWindow.winId,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  maximized: '-',
  minimized: '-',
  alwaysOnTop: '-',
});
const loading = ref(true);
const runningAction = ref<ActionKey | null>(null);
const message = ref('');
const error = ref('');

async function refreshWindowState() {
  const [size, position, maximized, minimized, alwaysOnTop] = await Promise.all([
    cloudWindow.getSize(),
    cloudWindow.getPosition(),
    cloudWindow.isMaximized(),
    cloudWindow.isMinimized(),
    cloudWindow.isAlwaysOnTop(),
  ]);

  windowState.value = {
    winId: cloudWindow.winId,
    width: size.width,
    height: size.height,
    x: position.x,
    y: position.y,
    maximized: maximized ? '是' : '否',
    minimized: minimized ? '是' : '否',
    alwaysOnTop: alwaysOnTop ? '是' : '否',
  };
}

async function runAction(action: ActionKey) {
  runningAction.value = action;
  message.value = '';
  error.value = '';

  try {
    if (action === 'resize') {
      await cloudWindow.setSize(1024, 640);
      message.value = '已将窗口调整为 1024 × 640。';
    } else if (action === 'center') {
      await cloudWindow.center();
      message.value = '已将窗口移动到屏幕中心。';
    } else if (action === 'maximize') {
      await cloudWindow.maximize();
      message.value = '已执行窗口最大化。';
    } else if (action === 'unmaximize') {
      await cloudWindow.unmaximize();
      message.value = '已退出窗口最大化。';
    } else if (action === 'minimize') {
      await cloudWindow.minimize();
      message.value = '已执行窗口最小化。';
    } else if (action === 'restore') {
      await cloudWindow.restore();
      message.value = '已恢复窗口显示状态。';
    } else if (action === 'pin') {
      await cloudWindow.setAlwaysOnTop(true);
      message.value = '已开启窗口置顶。';
    } else if (action === 'unpin') {
      await cloudWindow.setAlwaysOnTop(false);
      message.value = '已取消窗口置顶。';
    } else {
      message.value = '已刷新窗口状态。';
    }

    await refreshWindowState();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '窗口操作失败';
  } finally {
    runningAction.value = null;
    loading.value = false;
  }
}

onMounted(() => {
  void runAction('refresh');
});

const stateItems = computed(() => [
  { label: '窗口 ID', value: windowState.value.winId || '-' },
  { label: '窗口宽度', value: `${windowState.value.width}` },
  { label: '窗口高度', value: `${windowState.value.height}` },
  { label: 'X 坐标', value: `${windowState.value.x}` },
  { label: 'Y 坐标', value: `${windowState.value.y}` },
  { label: '是否最大化', value: windowState.value.maximized },
  { label: '是否最小化', value: windowState.value.minimized },
  { label: '是否置顶', value: windowState.value.alwaysOnTop },
]);
</script>

<template>
  <section class="contentSection" aria-labelledby="window-management-title">
    <div class="sectionHeader">
      <div>
        <h1 id="window-management-title">应用窗口管理</h1>
        <p class="sectionDescription">以下示例展示如何通过 @ugreen-nas/core 的 cloudWindow 能力读取和控制当前窗口。</p>
      </div>
    </div>

    <div class="actionGrid">
      <button
        v-for="action in actionDefinitions"
        :key="action.key"
        type="button"
        class="actionButton"
        :disabled="runningAction !== null"
        @click="runAction(action.key)"
      >
        {{ runningAction === action.key ? '执行中…' : action.label }}
      </button>
    </div>

    <p v-if="message" class="statusMessage isSuccess">{{ message }}</p>
    <p v-if="error" class="statusMessage isError">操作失败：{{ error }}</p>
    <p v-if="loading" class="statusMessage">正在读取窗口状态…</p>

    <dl class="infoList">
      <div v-for="item in stateItems" :key="item.label" class="infoItem">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
