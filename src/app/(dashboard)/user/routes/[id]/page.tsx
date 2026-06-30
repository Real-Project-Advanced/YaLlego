import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RouteDetailsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-black text-slate-950 mb-2">Route Details</h1>
        <p className="text-slate-600">Route ID: {params.id}</p>

        {/* Placeholder for route details */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">Route details coming soon...</p>
        </div>
      </div>
    </main>
  );
}
