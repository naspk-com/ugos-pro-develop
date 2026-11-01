import { Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import ApplicationAuthorizationPage from './pages/ApplicationAuthorizationPage';
import CapacityPage from './pages/CapacityPage';
import ProjectBasicInfoPage from './pages/ProjectBasicInfoPage';
import WindowManagementPage from './pages/WindowManagementPage';

function AppRouter() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route index element={<Navigate to='/project-basic-info' replace />} />
        <Route path='/project-basic-info' element={<ProjectBasicInfoPage />} />
        <Route path='/capacity' element={<CapacityPage />} />
        <Route path='/window-management' element={<WindowManagementPage />} />
        <Route path='/application-authorization' element={<ApplicationAuthorizationPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
