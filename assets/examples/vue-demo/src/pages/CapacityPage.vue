<script setup lang="ts">
import { computed, ref } from 'vue';
import cloudWindow from '@ugreen-nas/core/cloudWindow';

type CapacityActionKey =
  | 'getThirdToken'
  | 'getComputerName'
  | 'getComputerUserFolder'
  | 'getDeviceLocation'
  | 'checkComputerPathExists'
  | 'getLocalPath'
  | 'openAppCenterDetail';

interface CapacityResultState {
  actionLabel: string;
  status: string;
  value: string;
}

const actionDefinitions: Array<{ key: CapacityActionKey; label: string }> = [
  { key: 'getThirdToken', label: '获取第三方令牌' },
  { key: 'getComputerName', label: '获取计算机名称' },
  { key: 'getComputerUserFolder', label: '获取用户目录' },
  { key: 'getDeviceLocation', label: '获取设备位置' },
  { key: 'checkComputerPathExists', label: '检查路径是否存在' },
  { key: 'getLocalPath', label: '读取本地路径子目录' },
  { key: 'openAppCenterDetail', label: '跳转应用中心' },
];

const runningAction = ref<CapacityActionKey | null>(null);
const result = ref<CapacityResultState | null>(null);
const error = ref('');

function stringifyResult(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

async function invokeCapacity(action: CapacityActionKey) {
  if (action === 'checkComputerPathExists') {
    return cloudWindow.useCapacity('checkComputerPathExists', { path: '/' });
  }

  if (action === 'getLocalPath') {
    return cloudWindow.useCapacity('getLocalPath', '/');
  }

  if (action === 'openAppCenterDetail') {
    return cloudWindow.useCapacity('openAppCenterDetail', { appCenterType: 1 });
  }

  return cloudWindow.useCapacity(action);
}

async function runAction(action: CapacityActionKey, actionLabel: string) {
  runningAction.value = action;
  error.value = '';

  try {
    const value = await invokeCapacity(action);
    result.value = {
      actionLabel,
      status: '调用成功',
      value: stringifyResult(value),
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : '调用失败';
    result.value = {
      actionLabel,
      status: '调用失败',
      value: '-',
    };
  } finally {
    runningAction.value = null;
  }
}

const resultItems = computed(() => [
  { label: '最近调用能力', value: result.value?.actionLabel ?? '-' },
  { label: '调用状态', value: result.value?.status ?? '-' },
  { label: '返回结果', value: result.value?.value ?? '-' },
]);
</script>

<template>
  <section class="contentSection" aria-labelledby="capacity-title">
    <div class="sectionHeader">
      <div>
        <h1 id="capacity-title">应用能力</h1>
        <p class="sectionDescription">以下示例展示如何通过 @ugreen-nas/core 的 cloudWindow.useCapacity 调用应用能力接口。</p>
      </div>
    </div>

    <div class="actionGrid">
      <button
        v-for="action in actionDefinitions"
        :key="action.key"
        type="button"
        class="actionButton"
        :disabled="runningAction !== null"
        @click="runAction(action.key, action.label)"
      >
        {{ runningAction === action.key ? '调用中…' : action.label }}
      </button>
    </div>

    <p v-if="error" class="statusMessage isError">调用失败：{{ error }}</p>
    <p v-else-if="result" class="statusMessage isSuccess">{{ result.actionLabel }}已执行。</p>

    <dl class="infoList">
      <div v-for="item in resultItems" :key="item.label" class="infoItem">
        <dt>{{ item.label }}</dt>
        <dd class="resultValue">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
