import Link from 'next/link';
import { Header } from '@/components/common/Header';

const routeCards = [
  {
    title: 'Universidad de Antioquia a Poblado',
    time: '34 min',
    detail: 'Metro A + integrated feeder bus',
  },
  {
    title: 'Laureles a Ruta N',
    time: '28 min',
    detail: 'Circular bus + safe walk',
  },
  {
    title: 'Belen to Stadium',
    time: '22 min',
    detail: 'Direct urban route',
  },
];

const features = [
  'Route comparison by time, cost, and transfers',
  'Alerts for congestion, closures, and service changes',
  'Prioritized options for students and workers',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-blue-50 text-slate-950">
      <Header />

      <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:min-h-[calc(100vh-73px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex max-w-full rounded-lg bg-white px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            Smart urban routes for Medellin
          </p>
          <h1 className="text-[clamp(2.25rem,8vw,4rem)] font-black leading-[1.04] text-slate-950">
            LlegoYa shows you the best route to your destination.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8">
            Plan trips across the Aburra Valley with suggested routes, estimated times, connections,
            and alternatives designed to move through Medellin with more confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-blue-700 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-blue-200 bg-white px-6 py-3 text-center text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute inset-x-6 top-8 h-32 rounded-[32px] bg-sky-300 sm:inset-x-10 sm:h-40 sm:rounded-[48px]" />
          <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-white shadow-2xl shadow-blue-200/60 sm:rounded-2xl">
            <div className="bg-blue-700 px-4 py-4 text-white sm:px-5">
              <p className="text-sm font-bold uppercase">Recommended route</p>
              <h2 className="mt-2 text-xl font-black sm:text-2xl">Downtown to El Poblado</h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="rounded-xl bg-slate-950 p-4 text-white sm:p-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300">Start</p>
                    <p className="truncate font-bold">Parque Berrio</p>
                  </div>
                  <span className="hidden h-1 w-10 rounded-full bg-sky-300 sm:block" />
                  <div className="min-w-0 sm:text-right">
                    <p className="text-xs text-slate-300">Destination</p>
                    <p className="truncate font-bold">Milla de Oro</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 text-center min-[380px]:grid-cols-3">
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-2xl font-black">31</p>
                    <p className="text-xs text-slate-300">min</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-2xl font-black">1</p>
                    <p className="text-xs text-slate-300">transfer</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-2xl font-black">$3.6k</p>
                    <p className="text-xs text-slate-300">approx.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Walk 4 min to the station',
                  'Take Metro line A',
                  'Connect with the integrated bus',
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-lg border border-blue-100 p-3"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-sm font-black text-blue-700">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="routes" className="bg-white px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <div>
            <h2 className="text-[clamp(1.75rem,5vw,2.25rem)] font-black leading-tight text-slate-950">
              Decide with clear data before boarding.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              LlegoYa organizes bus, metro, walking, and transfer information to recommend urban
              trips that are easy to compare.
            </p>
            <div className="mt-6 space-y-3">
              {features.map((feature) => (
                <p
                  key={feature}
                  className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {feature}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routeCards.map((route) => (
              <article
                key={route.title}
                className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
              >
                <p className="text-3xl font-black text-blue-700">{route.time}</p>
                <h3 className="mt-4 text-base font-black text-slate-950">{route.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{route.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
