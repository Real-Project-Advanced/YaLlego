import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DriverStatusPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'DRIVER') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-black text-slate-950 mb-2">Service Status</h1>
        <p className="text-slate-600">Update your availability status</p>

        {/* Driver status content */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">Service status controls coming soon...</p>
        </div>
      </div>
    </main>
  );
}
