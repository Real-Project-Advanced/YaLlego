import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Form, FormField, FormButton } from '@/components/common/Form';
import { loginAction } from '@/modules/auth/actions/auth.actions';

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

function getSafeNextPath(next?: string | string[]) {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value?.startsWith('/') || value.startsWith('//')) return '';
  if (value === '/login' || value === '/register') return '';
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const nextPath = getSafeNextPath(params?.next);

  return (
    <AuthLayout
      title="Entra y planea tu proxima ruta por Medellin."
      subtitle="Bienvenido de nuevo"
      description="Guarda destinos frecuentes, revisa rutas recomendadas y compara alternativas antes de salir."
      footerText="Aun no tienes cuenta?"
      footerLink={{ text: 'Registrate', href: '/register' }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black">Login</h2>
        <p className="mt-2 text-sm text-slate-600">
          Aun no tienes cuenta?{' '}
          <Link href="/register" className="font-bold text-blue-700 hover:text-blue-800">
            Registrate
          </Link>
        </p>
      </div>

      <Form action={loginAction}>
        {nextPath && <input type="hidden" name="redirectTo" value={nextPath} />}

        <FormField
          label="Correo"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 font-semibold text-slate-600">
            <input type="checkbox" className="size-4 rounded border-slate-300 accent-blue-700" />
            Recordarme
          </label>
          <Link href="/" className="font-bold text-blue-700">
            Olvide mi contraseña
          </Link>
        </div>

        <FormButton>Entrar</FormButton>
      </Form>
    </AuthLayout>
  );
}
