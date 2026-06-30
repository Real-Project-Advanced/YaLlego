import Link from 'next/link';
import { Header } from '@/components/common/Header';
import {
  IoMapOutline,
  IoNotificationsOutline,
  IoSchoolOutline,
  IoCallOutline,
  IoMailOutline,
  IoLogoInstagram,
  IoLogoGithub,
  IoLogoWhatsapp,
  IoWalkOutline,
} from 'react-icons/io5';

const features = [
  {
    icon: <IoMapOutline className="text-2xl text-blue-600" />,
    title: 'Comparación de rutas',
    text: 'Analiza alternativas por tiempo, costo estimado y cantidad de transbordos.',
  },
  {
    icon: <IoNotificationsOutline className="text-2xl text-blue-600" />,
    title: 'Alertas en tiempo real',
    text: 'Entérate al instante de congestiones, cierres de estaciones o cambios de servicio.',
  },
  {
    icon: <IoSchoolOutline className="text-2xl text-blue-600" />,
    title: 'Opciones priorizadas',
    text: 'Rutas optimizadas pensando en las necesidades de estudiantes y trabajadores.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Ingresa tu destino',
    text: 'Indica tu punto de partida y a dónde deseas ir dentro del Valle de Aburrá.',
  },
  {
    num: '02',
    title: 'Compara alternativas',
    text: 'Evaluamos las combinaciones de Metro, buses colectivos, tranvía y caminatas.',
  },
  {
    num: '03',
    title: 'Viaja con confianza',
    text: 'Elige la ruta que mejor se adapte a tu tiempo o a tu bolsillo y llega seguro.',
  },
];

const stats = [
  { n: '12+', label: 'Comunas cubiertas' },
  { n: '40+', label: 'Rutas activas' },
  { n: '98%', label: 'Precisión estimada' },
];

const faqs = [
  {
    q: '¿La aplicación incluye rutas de buses colectivos?',
    a: 'Sí. Además del sistema Metro, integramos las rutas de buses tradicionales y colectivos de las distintas cuencas del Valle de Aburrá.',
  },
  {
    q: '¿Los tiempos estimados son en tiempo real?',
    a: 'Calculamos las estimaciones combinando los horarios oficiales y reportes de estado del servicio para darte la mayor precisión posible.',
  },
  {
    q: '¿Tengo que pagar algo por usar LlegoYa?',
    a: 'No, la consulta de rutas y planificación de trayectos es completamente gratuita para todos los usuarios.',
  },
  {
    q: '¿Funciona fuera de Medellín?',
    a: 'Está optimizada para Medellín y los municipios cercanos que componen el área metropolitana del Valle de Aburrá.',
  },
];

export default function Home() {
  return (
    <main
      className="min-h-screen text-slate-950"
      style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #f0f9ff 60%, #f8fafc 100%)' }}
    >
      <Header />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl text-left">
          <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <span>Rutas urbanas inteligentes para Medellín </span>
          </div>

          <h1 className="text-5xl font-black leading-tight sm:text-6xl">
            La ruta más inteligente{' '}
            <span className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent">
              para llegar donde
            </span>{' '}
            necesitas.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Planea trayectos dentro del Valle de Aburrá con rutas sugeridas, tiempos estimados,
            conexiones y alternativas pensadas para moverte por Medellín con más confianza.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="bg-blue-700 text-white rounded-xl shadow-md hover:bg-blue-800 transition-all text-center font-semibold py-3 px-6"
            >
              Crear cuenta gratis →
            </Link>
            <Link
              href="/login"
              className="bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-center font-semibold py-3 px-6"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            {['Gratis para usuarios', 'Funciona en móvil', 'Viajes rápidos'].map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>

        {/* PREVIEW CARD */}
        <div className="relative w-full">
          <div
            className="absolute inset-x-8 top-4 h-36 rounded-[48px] blur-2xl opacity-40"
            style={{ background: 'linear-gradient(90deg, #60a5fa, #38bdf8)' }}
          />

          <div
            className="relative overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-300 hover:-translate-y-1"
            style={{ border: '1px solid #dbeafe', boxShadow: '0 24px 48px rgba(37,99,235,0.15)' }}
          >
            <div
              className="px-5 py-4 text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest opacity-75">
                Ruta recomendada
              </p>
              <h2 className="mt-1 text-2xl font-black">Centro → El Poblado</h2>
            </div>

            <div className="p-5">
              <div
                className="rounded-xl p-5 text-white"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="text-xs opacity-60">Salida</p>
                    <p className="font-bold">Parque Berrío</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="h-1 w-10 rounded-full" style={{ background: '#60a5fa' }} />
                    <span className="text-xs opacity-50">Metro A</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-60">Destino</p>
                    <p className="font-bold">Milla de Oro</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[
                    ['31', 'min'],
                    ['1', 'transbordo'],
                    ['$3.6k', 'aprox'],
                  ].map(([n, l]) => (
                    <div
                      key={l}
                      className="rounded-lg p-3"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <p className="text-2xl font-black">{n}</p>
                      <p className="text-xs opacity-60">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  {
                    step: 'Camina 4 min hasta la estación',
                    icon: <IoWalkOutline className="text-lg text-blue-700" />,
                  },
                  { step: 'Toma Metro línea A', icon: '🚇' },
                  { step: 'Conecta con bus integrado', icon: '🚌' },
                ].map(({ step, icon }) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className="grid size-8 place-items-center rounded-lg text-sm font-black"
                      style={{ background: '#eff6ff', flexShrink: 0 }}
                    >
                      {icon}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-200 bg-white py-12 px-6">
        <div className="mx-auto w-full max-w-7xl grid grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-blue-700">{s.n}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="text-left max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4">
            Flujo simple
          </div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tight">
            ¿Cómo funciona LlegoYa?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Simplificamos la complejidad del transporte público de la ciudad en tres pasos sencillos
            para que planifiques tus viajes sin estrés.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative bg-white border border-slate-200 p-8 rounded-2xl shadow-sm"
            >
              <span className="absolute top-6 right-8 text-5xl font-black text-slate-100 select-none">
                {step.num}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 z-10 relative">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 z-10 relative">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="rutas" className="bg-white border-y border-slate-200 px-6 py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="text-left max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4">
              Información clara
            </div>
            <h2 className="text-4xl font-black text-slate-950 tracking-tight">
              Decide con datos antes de subirte.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              LlegoYa organiza información de buses, metro, caminatas y transbordos para recomendar
              trayectos urbanos fáciles de comparar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section id="faqs" className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] items-start">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4">
              Respuestas rápidas
            </div>
            <h2 className="text-4xl font-black text-slate-950 tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Todo lo que necesitas saber sobre el uso de la plataforma para moverte de forma
              eficiente por el Valle de Aburrá.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left"
              >
                <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                  <span className="text-blue-600 font-extrabold">?.</span>
                  {item.q}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 pl-5">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-20"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-white">Empieza a moverte mejor hoy.</h2>
          <p className="mt-4 text-lg text-blue-200">
            Crea tu cuenta gratis y accede a rutas inteligentes para Medellín.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-700 font-bold rounded-xl py-3 px-8 shadow-md hover:bg-blue-50 transition-all text-center"
            >
              Crear cuenta gratis →
            </Link>
            <Link
              href="/login"
              className="inline-block bg-white/10 text-white border border-white/30 font-semibold rounded-xl py-3 px-8 hover:bg-white/20 transition-all text-center"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER CON REACT-ICONS (ESTILO HEROUI) */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3 pb-8 items-start">
            <div className="text-left space-y-3">
              <span className="grid size-8 place-items-center rounded-lg bg-blue-700 text-sm font-black text-white">
                LY
              </span>
              <span className="font-black text-slate-800 text-lg">LlegoYa</span>
              <p className="text-sm text-slate-500 max-w-xs">
                Rutas urbanas inteligentes para el Valle de Aburrá. Conectando Medellín de forma
                eficiente.
              </p>
            </div>

            <div className="text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contacto y Soporte
              </h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <IoCallOutline className="text-base text-slate-400" />
                  <a href="tel:+573012510533" className="hover:text-blue-700 transition-colors">
                    +57 301 2510533
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <IoMailOutline className="text-base text-slate-400" />
                  <a
                    href="mailto:soporte@lleogya.com"
                    className="hover:text-blue-700 transition-colors"
                  >
                    soporte@lleogya.com
                  </a>
                </p>
              </div>
            </div>

            <div className="text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comunidad
              </h4>
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-700 transition-colors"
                >
                  <IoLogoInstagram className="text-base text-slate-500" /> Instagram
                </a>
                <a
                  href="https://github.com/Real-Project-Advanced/YaLlego"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-700 transition-colors"
                >
                  <IoLogoGithub className="text-base text-slate-500" /> GitHub
                </a>
                <a
                  href="https://wa.me/573012510533"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-700 transition-colors font-semibold text-emerald-600"
                >
                  <IoLogoWhatsapp className="text-base text-emerald-500" /> WhatsApp Soporte
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              &copy; 2026 LlegoYa. Todos los derechos reservados.
            </p>
            <p className="text-xs text-slate-400">Medellín, Antioquia, Colombia</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
