import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar will go here later */}
      <main className="flex-1 overflow-y-auto">
        {/* Navbar will go here later */}
        <Outlet />
      </main>
    </div>
  );
};
