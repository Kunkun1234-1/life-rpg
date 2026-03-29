import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-2xl text-gray-400">{name}</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<PlaceholderPage name="仪表盘" />} />
          <Route path="character" element={<PlaceholderPage name="角色" />} />
          <Route path="tasks" element={<PlaceholderPage name="任务中心" />} />
          <Route path="shop" element={<PlaceholderPage name="商城" />} />
          <Route path="calendar" element={<PlaceholderPage name="日历" />} />
          <Route path="principles" element={<PlaceholderPage name="原则" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
