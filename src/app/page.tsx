import Link from 'next/link';
import { Header } from '@/components/common/Header';

const routeCards = [
  {
    title: 'Universidad de Antioquia a Poblado',
    time: '34 min',
    detail: 'Metro A + alimentador integrado',
  },
  {
    title: 'Laureles a Ruta N',
    time: '28 min',
    detail: 'Bus circular + caminata segura',
  },
  {
    title: 'Belen a Estadio',
    time: '22 min',
    detail: 'Ruta urbana directa',
  },
];

const features = [
  'Comparacion de rutas por tiempo, costo y transbordos',
  'Alertas de congestiones, cierres y cambios de servicio',
  'Opciones priorizadas para estudiantes y trabajadores',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-blue-50 text-slate-950">
      <Header />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex rounded-lg bg-white px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            Rutas urbanas inteligentes para Medellin
          </p>
          <h1 className="text-5xl font-black leading-tight text-slate-950 sm:text-6xl">
            Nexthus te muestra la mejor ruta para llegar a tu destino.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
            Planea trayectos dentro del Valle de Aburra con rutas sugeridas, tiempos estimados,
            conexiones y alternativas pensadas para moverte por Medellin con mas confianza.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-blue-700 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-blue-200 bg-white px-6 py-3 text-center text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              Iniciar sesion
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-10 top-8 h-40 rounded-[48px] bg-sky-300" />
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-200/60">
            <div className="bg-blue-700 px-5 py-4 text-white">
              <p className="text-sm font-bold uppercase">Ruta recomendada</p>
              <h2 className="mt-2 text-2xl font-black">Centro a El Poblado</h2>
            </div>
            <div className="p-5">
              <div className="rounded-xl bg-slate-950 p-5 text-white">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="text-xs text-slate-300">Salida</p>
                    <p className="font-bold">Parque Berrio</p>
                  </div>
                  <span className="h-1 w-10 rounded-full bg-sky-300" />
                  <div className="text-right">
                    <p className="text-xs text-slate-300">Destino</p>
                    <p className="font-bold">Milla de Oro</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-2xl font-black">31</p>
                    <p className="text-xs text-slate-300">min</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-2xl font-black">1</p>
                    <p className="text-xs text-slate-300">transbordo</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-2xl font-black">$3.6k</p>
                    <p className="text-xs text-slate-300">aprox.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Camina 4 min hasta la estacion',
                  'Toma Metro linea A',
                  'Conecta con bus integrado',
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

      <section id="rutas" className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              Decide con datos claros antes de subirte.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Nexthus organiza informacion de buses, metro, caminatas y transbordos para recomendar
              trayectos urbanos faciles de comparar.
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

          <div className="grid gap-4 sm:grid-cols-3">
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
