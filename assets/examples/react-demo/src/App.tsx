import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './App.css';
import { KeyboardControl } from '@ugreen-nas/core/plugins';

const menuItems = [
  { path: '/capacity', label: '应用能力' },
  { path: '/window-management', label: '应用窗口管理' },
  { path: '/application-authorization', label: '应用授权' },
  { path: '/project-basic-info', label: '项目基础信息' },
];

function App() {
  useEffect(() => {
    initKeyboard();
  }, []);

  function initKeyboard() {
    const kb = new KeyboardControl([
      { key: 'Ctrl+f', action: 'save' },
      { key: 'ArrowLeft', action: 'globalLeft', global: true },
    ]);
    kb.on('action', action => {
      console.log('🚀 ~ useEffect ~ action:', action);
    });
  }

  return (
    <main className='appLayout'>
      <aside className='sidebar'>
        <h2 className='sidebarTitle'>示例导航</h2>
        <nav aria-label='示例项目页面导航'>
          <ul className='menuList'>
            {menuItems.map(menuItem => (
              <li key={menuItem.path}>
                <NavLink to={menuItem.path} className={({ isActive }) => (isActive ? 'menuButton isActive' : 'menuButton')}>
                  {menuItem.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section className='content'>
        <Outlet />
      </section>
    </main>
  );
}

export default App;
