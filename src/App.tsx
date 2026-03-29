import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CharacterPage from './pages/Character';
import TasksPage from './pages/Tasks';
import ShopPage from './pages/Shop';
import CalendarPage from './pages/Calendar';
import PrinciplesPage from './pages/Principles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="character" element={<CharacterPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="principles" element={<PrinciplesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
