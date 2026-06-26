import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminRoutesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-black text-slate-950 mb-2">Route Management</h1>
        <p className="text-slate-600">Manage all system routes</p>

        {/* Admin routes content */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">Route management coming soon...</p>
        </div>
      </div>
    </main>
  );
}
