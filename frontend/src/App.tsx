import { useState } from 'react';
import { useAuth } from './providers';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { Cpu } from 'lucide-react';
import type { AppPage } from './types';

export default function App() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>("monitor");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Cpu className="h-16 w-16 animate-pulse text-gray-300" />
      </div>
    );
  }

  if (!user) return <Login />;

  if (currentPage === "reports") {
    return <Reports currentPage={currentPage} onNavigate={setCurrentPage} />;
  }

  return <Dashboard currentPage={currentPage} onNavigate={setCurrentPage} />;
}
