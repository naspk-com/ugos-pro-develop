<script setup lang="ts">
interface ProjectBasicInfo {
  name: string;
  appId: string;
  releaseName: string;
  author: string;
  description: string;
  version: string;
}

const projectBasicInfo: ProjectBasicInfo = {
  name: '@examples/vue',
  appId: '@examples/vue',
  releaseName: '@examples/vue',
  author: 'test',
  description: 'demo project',
  version: '0.0.1',
};

const fieldLabels: Record<keyof ProjectBasicInfo, string> = {
  name: '包名称',
  appId: '应用 ID',
  releaseName: '发布名称',
  author: '作者',
  description: '项目描述',
  version: '版本号',
};
</script>

<template>
  <section class="contentSection" aria-labelledby="project-basic-info-title">
    <h1 id="project-basic-info-title">项目基础信息</h1>
    <p class="sectionDescription">以下内容与当前示例项目的包元数据保持一致。</p>
    <dl class="infoList">
      <div v-for="(fieldValue, fieldName) in projectBasicInfo" :key="fieldName" class="infoItem">
        <dt>{{ fieldLabels[fieldName as keyof ProjectBasicInfo] }}</dt>
        <dd>{{ fieldValue }}</dd>
      </div>
    </dl>
  </section>
</template>
