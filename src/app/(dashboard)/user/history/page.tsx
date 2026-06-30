import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type RideHistoryItem = {
  id: string;
  route_name?: string | null;
  driver_code?: string | null;
  nearest_stop?: string | null;
  destination_name?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const statusLabels: Record<string, string> = {
  accepted: 'Aceptada',
  completed: 'Completada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
};

export default async function HistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('ride_requests')
    .select('id, route_name, driver_code, nearest_stop, destination_name, status, created_at')
    .eq('user_id', String(user.id))
    .order('created_at', { ascending: false })
    .limit(50);
  const requests = error ? [] : ((data ?? []) as RideHistoryItem[]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-2 text-4xl font-black text-slate-950">Historial</h1>
        <p className="text-slate-600">Revisa tus viajes y solicitudes anteriores</p>

        {error && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            No pude cargar el historial desde Supabase. Verifica que exista la tabla ride_requests.
          </div>
        )}

        {requests.length === 0 && !error ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6">
            <p className="text-slate-600">Tus solicitudes de bus apareceran aqui.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 lg:grid-cols-2">
            {requests.map((request) => (
              <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-slate-950">
                      {request.route_name ?? 'Ruta solicitada'}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Conductor {request.driver_code ?? 'sin asignar'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    {statusLabels[request.status ?? ''] ?? request.status ?? 'Pendiente'}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                  <p>Parada: {request.nearest_stop ?? 'sin parada registrada'}</p>
                  <p>Destino: {request.destination_name ?? 'sin destino registrado'}</p>
                  <p>
                    Fecha:{' '}
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString('es-CO')
                      : 'sin fecha'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
