import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      
      {/* Efecto de luz de fondo sutil */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-red-600/10 blur-[100px]" />

      {/* Nuevo Icono de Advertencia Médica/Seguridad */}
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-600/20 bg-red-600/5 transition-transform hover:scale-105">
        <svg 
          className="h-10 w-10 text-red-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <div className="absolute inset-0 rounded-3xl bg-red-600/10 animate-pulse" />
      </div>

      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
        Acceso <span className="text-red-600">Restringido</span>
      </h1>
      
      <p className="max-w-md text-balance text-slate-600 mt-2">
        Su perfil actual no cuenta con las credenciales necesarias para acceder a este módulo de <span className="text-slate-950 font-semibold">Nexthus</span>
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row items-center justify-center">
        <Link
          href="/login?force=true"
          className="flex h-12 items-center justify-center rounded-full border border-slate-300 px-8 text-sm font-bold text-slate-700 transition-all hover:border-red-600 hover:text-red-600 hover:bg-red-50"
        >
          Cambiar de Cuenta
        </Link>

        <Link
          href="/user"
          className="flex h-12 items-center justify-center rounded-full border border-red-600 px-8 text-sm font-bold text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
        >
          Ir al Panel Principal
        </Link>
      </div>

      <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
        Seguridad — Error 403
      </p>
    </div>
  );
}