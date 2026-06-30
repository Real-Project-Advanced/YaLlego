import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DriverTrackingStatus from './DriverTrackingStatus';

export default async function DriverDashboardPage() {
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
        <h1 className="text-4xl font-black text-slate-950 mb-2">Driver Panel</h1>
        <p className="text-slate-600">
          Welcome, <span className="font-bold">{user.fullname}</span>
        </p>

        {/* Driver dashboard content */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Service Status</h2>
          <p className="text-slate-600">Driver control panel coming soon...</p>
        </div>
      </div>
    </main>
  );
}
