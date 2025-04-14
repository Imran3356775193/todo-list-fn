// src/app/page.tsx
import TodoList from '@/components/TodoList';
import { Toaster } from 'react-hot-toast';

<Toaster position="top-center" />


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <TodoList />
    </main>
  );
}
