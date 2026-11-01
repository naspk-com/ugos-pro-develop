import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ShelfPage } from './pages/ShelfPage';
import { ReaderPage } from './pages/ReaderPage';
import { useAuth } from './hooks/useAuth';
import './App.css';

export default function App() {
  // Block render until we know whether we're in UGOS or dev mode. The token
  // (or lack thereof) is pushed into the API client as a side effect, so
  // every downstream fetch sees a consistent state from first paint.
  const auth = useAuth();

  if (auth.status === 'loading') {
    return (
      <div className="app-loading" role="status">
        <p>正在初始化…</p>
      </div>
    );
  }

  return (
    <HashRouter>
      {auth.status === 'dev' && (
        <div className="dev-banner" role="status">
          dev 模式（未在 UGOS 桌面内打开 ·
          {auth.reason === 'capacity_failed'
            ? ` getThirdToken 失败: ${auth.error ?? '未知'}`
            : auth.reason === 'timeout'
              ? ' getThirdToken 超时（IPC 桥未响应）'
              : ' 无 Ugreen-Ttk'}
          ）—— 所有进度会以用户 id "dev" 保存。
        </div>
      )}
      <Routes>
        <Route path="/" element={<ShelfPage />} />
        <Route path="/read/:id" element={<ReaderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
