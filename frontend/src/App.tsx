import { useAuth } from './providers';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Cpu } from 'lucide-react';

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Cpu className="h-16 w-16 animate-pulse text-gray-300" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}