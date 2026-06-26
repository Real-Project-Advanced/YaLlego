import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-black text-slate-950 mb-2">Favorite Routes</h1>
        <p className="text-slate-600">Quick access to your saved routes</p>

        {/* Placeholder for favorites content */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">Your favorite routes will appear here.</p>
        </div>
      </div>
    </main>
  );
}
