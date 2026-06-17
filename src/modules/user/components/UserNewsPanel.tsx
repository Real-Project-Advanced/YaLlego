import { AlertCircle, Newspaper } from 'lucide-react';
import type { MobilityNews } from '../data/user-dashboard.data';

type UserNewsPanelProps = {
  news: MobilityNews[];
};

export function UserNewsPanel({ news }: UserNewsPanelProps) {
  return (
    <section id="novedades" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-700">Noticias y novedades</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Estado de movilidad</h2>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <Newspaper size={20} />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {news.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <AlertCircle size={16} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{item.time}</span>
                </div>
                <h3 className="mt-2 text-sm font-black text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
