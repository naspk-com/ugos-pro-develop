import { useCallback, useEffect, useMemo, useState } from 'react';
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

const initialWindowState: WindowState = {
  winId: cloudWindow.winId,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  maximized: '-',
  minimized: '-',
  alwaysOnTop: '-',
};

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

function WindowManagementPage() {
  const [windowState, setWindowState] = useState<WindowState>(initialWindowState);
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<ActionKey | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refreshWindowState = useCallback(async () => {
    const [size, position, maximized, minimized, alwaysOnTop] = await Promise.all([
      cloudWindow.getSize(),
      cloudWindow.getPosition(),
      cloudWindow.isMaximized(),
      cloudWindow.isMinimized(),
      cloudWindow.isAlwaysOnTop(),
    ]);

    setWindowState({
      winId: cloudWindow.winId,
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y,
      maximized: maximized ? '是' : '否',
      minimized: minimized ? '是' : '否',
      alwaysOnTop: alwaysOnTop ? '是' : '否',
    });
  }, []);

  const runAction = useCallback(
    async (action: ActionKey) => {
      setRunningAction(action);
      setError('');
      setMessage('');

      try {
        if (action === 'resize') {
          await cloudWindow.setSize(1024, 640);
          setMessage('已将窗口调整为 1024 × 640。');
        } else if (action === 'center') {
          await cloudWindow.center();
          setMessage('已将窗口移动到屏幕中心。');
        } else if (action === 'maximize') {
          await cloudWindow.maximize();
          setMessage('已执行窗口最大化。');
        } else if (action === 'unmaximize') {
          await cloudWindow.unmaximize();
          setMessage('已退出窗口最大化。');
        } else if (action === 'minimize') {
          await cloudWindow.minimize();
          setMessage('已执行窗口最小化。');
        } else if (action === 'restore') {
          await cloudWindow.restore();
          setMessage('已恢复窗口显示状态。');
        } else if (action === 'pin') {
          await cloudWindow.setAlwaysOnTop(true);
          setMessage('已开启窗口置顶。');
        } else if (action === 'unpin') {
          await cloudWindow.setAlwaysOnTop(false);
          setMessage('已取消窗口置顶。');
        } else {
          setMessage('已刷新窗口状态。');
        }

        await refreshWindowState();
      } catch (err) {
        setError(err instanceof Error ? err.message : '窗口操作失败');
      } finally {
        setRunningAction(null);
        setLoading(false);
      }
    },
    [refreshWindowState]
  );

  useEffect(() => {
    void runAction('refresh');
  }, [runAction]);

  const stateItems = useMemo(
    () => [
      { label: '窗口 ID', value: windowState.winId || '-' },
      { label: '窗口宽度', value: `${windowState.width}` },
      { label: '窗口高度', value: `${windowState.height}` },
      { label: 'X 坐标', value: `${windowState.x}` },
      { label: 'Y 坐标', value: `${windowState.y}` },
      { label: '是否最大化', value: windowState.maximized },
      { label: '是否最小化', value: windowState.minimized },
      { label: '是否置顶', value: windowState.alwaysOnTop },
    ],
    [windowState]
  );

  return (
    <section className='contentSection' aria-labelledby='window-management-title'>
      <div className='sectionHeader'>
        <div>
          <h1 id='window-management-title'>应用窗口管理</h1>
          <p className='sectionDescription'>以下示例展示如何通过 @ugreen-nas/core 的 cloudWindow 能力读取和控制当前窗口。</p>
        </div>
      </div>

      <div className='actionGrid'>
        {actionDefinitions.map(action => (
          <button
            key={action.key}
            type='button'
            className='actionButton'
            onClick={() => void runAction(action.key)}
            disabled={runningAction !== null}
          >
            {runningAction === action.key ? '执行中…' : action.label}
          </button>
        ))}
      </div>

      {message ? <p className='statusMessage isSuccess'>{message}</p> : null}
      {error ? <p className='statusMessage isError'>操作失败：{error}</p> : null}
      {loading ? <p className='statusMessage'>正在读取窗口状态…</p> : null}

      <dl className='infoList'>
        {stateItems.map(item => (
          <div className='infoItem' key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default WindowManagementPage;
