<script setup lang="ts">
import { computed } from 'vue';
import { type AuthorizationInfoResponse, useApplicationAuthorizationInfo } from '../composables/useApplicationAuthorizationInfo';

const fieldDefinitions: Array<{ key: keyof AuthorizationInfoResponse; label: string }> = [
  { key: 'client_id', label: '客户端 ID' },
  { key: 'remote_addr', label: '远端地址' },
  { key: 'result', label: '结果' },
  { key: 'ug_language', label: '语言' },
  { key: 'ug_user_id', label: '用户 ID' },
  { key: 'ug_user_name', label: '用户名' },
  { key: 'ug_user_role', label: '用户角色' },
  { key: 'user_agent', label: 'User-Agent' },
  { key: 'x_forwarded_for', label: 'X-Forwarded-For' },
  { key: 'x_real_ip', label: 'X-Real-IP' },
];

const { data, loading, error, refresh } = useApplicationAuthorizationInfo();

function getDisplayValue(value: AuthorizationInfoResponse[keyof AuthorizationInfoResponse]) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
}

const items = computed(() =>
  fieldDefinitions.map(field => ({
    ...field,
    value: getDisplayValue(data.value?.[field.key]),
  }))
);
</script>

<template>
  <section class="contentSection" aria-labelledby="application-authorization-title">
    <div class="sectionHeader">
      <div>
        <h1 id="application-authorization-title">应用授权</h1>
        <p class="sectionDescription">该页面展示获得授权后，请求 `/demoapi/v1/info` 接口返回的应用与用户信息。</p>
      </div>
      <button type="button" class="actionButton" :disabled="loading" @click="refresh()">
        {{ loading ? '加载中…' : '重新获取' }}
      </button>
    </div>

    <p v-if="error" class="statusMessage isError">获取数据失败：{{ error }}</p>

    <dl class="infoList">
      <div v-for="item in items" :key="item.key" class="infoItem">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
