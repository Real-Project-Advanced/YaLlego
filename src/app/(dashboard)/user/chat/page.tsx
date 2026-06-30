import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/features/ChatInterface';

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-black text-slate-950 mb-2">Route Chat</h1>
        <p className="text-slate-600">Get personalized route recommendations</p>

        <div className="mt-8 bg-white rounded-lg shadow-p-6">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
