import React from 'react';
import ReactDOM from 'react-dom/client';
import UGOSCore from '@ugreen-nas/core';
import App from './App';
import './index.css';

// UGOS SDK initialisation is mandatory before any cloudWindow.useCapacity call.
// We swallow init errors so the dev-mode (outside UGOS shell) still renders.
try {
  UGOSCore.init();
} catch (err) {
  console.warn('[ugnas-reader] UGOSCore.init failed (probably running outside UGOS shell):', err);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
