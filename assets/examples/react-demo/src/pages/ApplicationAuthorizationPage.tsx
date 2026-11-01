import { useMemo } from 'react';
import { type AuthorizationInfoResponse, useApplicationAuthorizationInfo } from '../hooks/useApplicationAuthorizationInfo';

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

function getDisplayValue(value: AuthorizationInfoResponse[keyof AuthorizationInfoResponse]) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
}

function ApplicationAuthorizationPage() {
  const { data, loading, error, refresh } = useApplicationAuthorizationInfo();

  const items = useMemo(() => fieldDefinitions.map(field => ({ ...field, value: getDisplayValue(data?.[field.key]) })), [data]);

  return (
    <section className='contentSection' aria-labelledby='application-authorization-title'>
      <div className='sectionHeader'>
        <div>
          <h1 id='application-authorization-title'>应用授权</h1>
          <p className='sectionDescription'>该页面展示获得授权后，请求 `/demoapi/v1/info` 接口返回的应用与用户信息。</p>
        </div>
        <button type='button' className='actionButton' onClick={() => void refresh()} disabled={loading}>
          {loading ? '加载中…' : '重新获取'}
        </button>
      </div>

      {error ? <p className='statusMessage isError'>获取数据失败：{error}</p> : null}

      <dl className='infoList'>
        {items.map(item => (
          <div className='infoItem' key={item.key}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default ApplicationAuthorizationPage;
