import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Form, FormField, FormButton } from '@/components/common/Form';
import { loginAction } from '@/modules/auth/actions/auth.actions';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Inicia sesión y muévete por Medellín con confianza."
      subtitle="Ingresa a LlegoYa"
      description="Accede a tus destinos favoritos, consulta el estado de tus rutas preferidas y planifica tus viajes por el Valle de Aburrá."
      footerText="¿No tienes cuenta?"
      footerLink={{ text: 'Regístrate gratis', href: '/register' }}
    >
      {/* Header Centrado */}
      <div className="mb-8 text-center animate-fade-in-up">
        <h2 className="text-3xl font-black text-slate-900">Iniciar sesión</h2>
        <p className="mt-2 text-sm text-slate-500">
          ¿No tienes cuenta aún?{' '}
          <Link
            href="/register"
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </div>

      {/* Formulario y Campos Centrados */}
      <Form action={loginAction} className="animate-fade-in-up delay-100 space-y-5">
        <div className="text-center">
          <FormField
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            required
            validate="email"
          />
        </div>

        <div className="text-center">
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            required
            validate="password"
          />
        </div>

        {/* Opciones de recuperación */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 transition-colors">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-slate-300 accent-blue-600"
            />
            Recordarme
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <FormButton>Ingresar</FormButton>

        <p className="text-center text-xs text-slate-400">
          🔐 Conexión segura de extremo a extremo.
        </p>
      </Form>
    </AuthLayout>
  );
}
