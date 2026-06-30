import Link from 'next/link';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  footerText?: string;
  footerLink?: { text: string; href: string };
}

export async function AuthLayout({ title, subtitle, description, children }: AuthLayoutProps) {
  return (
    <main
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f8fafc 100%)' }}
    >
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between px-12 py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 45%, #0284c7 100%)' }}
      >
        <div
          className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 self-start group">
          <span className="grid size-10 place-items-center rounded-xl bg-white font-black text-blue-600 shadow-md transform group-hover:scale-105 transition-transform">
            LL
          </span>
          <span className="text-xl font-black tracking-tight text-white">
            Llego<span className="text-blue-200">Ya</span>
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-md text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm border border-white/10">
            📍 Movilidad Inteligente
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight whitespace-pre-line">
            {title}
          </h1>
          <p className="mt-4 text-base text-blue-100/90 leading-relaxed">{description}</p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { n: '12+', label: 'Comunas\ncubiertas' },
              { n: '40+', label: 'Rutas\nactivas' },
              { n: '98%', label: 'Precisión\nestimada' },
            ].map((s, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 text-center animate-fade-in-up delay-${(i + 2) * 100}`}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <p className="text-2xl font-black text-white">{s.n}</p>
                <p className="mt-1 text-xs whitespace-pre-line" style={{ color: '#93c5fd' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs animate-fade-in" style={{ color: '#93c5fd' }}>
          Rutas urbanas, conexiones y tiempos aproximados en un solo lugar.
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="lg:hidden px-6 py-4 flex items-center gap-3 border-b border-blue-100 bg-white">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-blue-700 font-black text-white">
              LL
            </span>
            <span className="font-black text-slate-900">LlegoYa</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 bg-white">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </main>
  );
}
