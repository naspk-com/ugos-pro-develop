import { useMemo, useState } from 'react';
import cloudWindow from '@ugreen-nas/core/cloudWindow';

type CapacityActionKey =
  | 'getThirdToken'
  | 'getComputerName'
  | 'getDeviceLocation'
  | 'checkComputerPathExists'
  | 'openAppCenterDetail';

interface CapacityResultState {
  actionLabel: string;
  status: string;
  value: string;
}

const actionDefinitions: Array<{ key: CapacityActionKey; label: string }> = [
  { key: 'getThirdToken', label: '获取第三方令牌' },
  { key: 'getComputerName', label: '获取计算机名称' },
  { key: 'getDeviceLocation', label: '获取设备位置' },
  { key: 'checkComputerPathExists', label: '检查路径是否存在' },
  { key: 'openAppCenterDetail', label: '跳转应用中心' },
];

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

  if (action === 'openAppCenterDetail') {
    return cloudWindow.useCapacity('openAppCenterDetail', { appCenterType: 1 });
  }

  return cloudWindow.useCapacity(action);
}

function CapacityPage() {
  const [runningAction, setRunningAction] = useState<CapacityActionKey | null>(null);
  const [result, setResult] = useState<CapacityResultState | null>(null);
  const [error, setError] = useState('');

  async function runAction(action: CapacityActionKey, actionLabel: string) {
    setRunningAction(action);
    setError('');

    try {
      const value = await invokeCapacity(action);
      setResult({
        actionLabel,
        status: '调用成功',
        value: stringifyResult(value),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '调用失败');
      setResult({
        actionLabel,
        status: '调用失败',
        value: '-',
      });
    } finally {
      setRunningAction(null);
    }
  }

  const resultItems = useMemo(
    () => [
      { label: '最近调用能力', value: result?.actionLabel ?? '-' },
      { label: '调用状态', value: result?.status ?? '-' },
      { label: '返回结果', value: result?.value ?? '-' },
    ],
    [result]
  );

  return (
    <section className='contentSection' aria-labelledby='capacity-title'>
      <div className='sectionHeader'>
        <div>
          <h1 id='capacity-title'>应用能力</h1>
          <p className='sectionDescription'>
            以下示例展示如何通过 @ugreen-nas/core 的 cloudWindow.useCapacity 调用应用能力接口。
          </p>
        </div>
      </div>

      <div className='actionGrid'>
        {actionDefinitions.map(action => (
          <button
            key={action.key}
            type='button'
            className='actionButton'
            onClick={() => void runAction(action.key, action.label)}
            disabled={runningAction !== null}
          >
            {runningAction === action.key ? '调用中…' : action.label}
          </button>
        ))}
      </div>

      {error ? <p className='statusMessage isError'>调用失败：{error}</p> : null}
      {!error && result ? <p className='statusMessage isSuccess'>{result.actionLabel}已执行。</p> : null}

      <dl className='infoList'>
        {resultItems.map(item => (
          <div className='infoItem' key={item.label}>
            <dt>{item.label}</dt>
            <dd className='resultValue'>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default CapacityPage;
