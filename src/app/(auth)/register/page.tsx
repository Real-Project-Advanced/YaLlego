import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Form, FormField, FormButton } from '@/components/common/Form';
import { registerAction } from '@/modules/auth/actions/auth.actions';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta y muévete por Medellín con confianza."
      subtitle="Únete a LlegoYa"
      description="Guarda destinos favoritos, recibe recomendaciones y accede a las mejores rutas urbanas del Valle de Aburrá."
      footerText="¿Ya tienes cuenta?"
      footerLink={{ text: 'Inicia sesión', href: '/login' }}
    >
      {/* Header Centrado */}
      <div className="mb-8 text-center animate-fade-in-up">
        <h2 className="text-3xl font-black text-slate-900">Crear cuenta</h2>
        <p className="mt-2 text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      {/* Formulario y Campos Centrados */}
      <Form action={registerAction} className="animate-fade-in-up delay-100 space-y-5">
        <div className="text-center">
          <FormField
            label="Nombre completo"
            name="name"
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            required
            validate="name"
          />
        </div>

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
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            validate="password"
          />
        </div>

        {/* Requirements checklist */}
        <div
          className="rounded-xl p-4 space-y-2 text-left"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
        >
          <p className="text-xs font-bold text-slate-600 mb-2">La contraseña debe tener:</p>
          {['8 o más caracteres', 'Al menos una letra mayúscula', 'Al menos un número'].map(
            (req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className="size-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#e2e8f0' }}
                >
                  <svg width="8" height="8" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="3" fill="#94a3b8" />
                  </svg>
                </span>
                {req}
              </div>
            ),
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group text-left">
          <input
            type="checkbox"
            required
            name="terms"
            className="mt-1 size-4 rounded border-slate-300 accent-blue-600 flex-shrink-0"
          />
          <span className="text-sm font-medium leading-6 text-slate-600 group-hover:text-slate-800 transition-colors">
            Acepto recibir información de rutas, cambios de servicio y recomendaciones para mis
            trayectos en Medellín.
          </span>
        </label>

        <FormButton>Crear cuenta gratis</FormButton>

        <p className="text-center text-xs text-slate-400">
          🔐 Tus datos están protegidos con cifrado de extremo a extremo.
        </p>
      </Form>
    </AuthLayout>
  );
}
