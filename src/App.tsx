import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
