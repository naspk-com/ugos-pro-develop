interface ProjectBasicInfo {
  name: string;
  appId: string;
  releaseName: string;
  author: string;
  description: string;
  version: string;
}

const projectBasicInfo: ProjectBasicInfo = {
  name: '@examples/react',
  appId: '@examples/react',
  releaseName: '@examples/react',
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

function ProjectBasicInfoPage() {
  return (
    <section className='contentSection' aria-labelledby='project-basic-info-title'>
      <h1 id='project-basic-info-title'>项目基础信息</h1>
      <p className='sectionDescription'>以下内容与当前示例项目的包元数据保持一致。</p>
      <dl className='infoList'>
        {Object.entries(projectBasicInfo).map(([fieldName, fieldValue]) => {
          const key = fieldName as keyof ProjectBasicInfo;
          return (
            <div className='infoItem' key={fieldName}>
              <dt>{fieldLabels[key]}</dt>
              <dd>{fieldValue}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export default ProjectBasicInfoPage;
