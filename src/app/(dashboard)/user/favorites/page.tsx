import { getCurrentUser } from '@/lib/auth';
import { UserSavedPlacesPanel } from '@/modules/user/components/UserSavedPlacesPanel';
import { redirect } from 'next/navigation';

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-2 text-4xl font-black text-slate-950">Rutas Favoritas</h1>
        <p className="text-slate-600">Acceso rapido a tus rutas guardadas</p>

        <UserSavedPlacesPanel />
      </div>
    </main>
  );
}
