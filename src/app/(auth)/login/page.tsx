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
      title="Sign in and plan your next route through Medellin."
      subtitle="Welcome back"
      description="Save frequent destinations, review recommended routes, and compare options before you leave."
      footerText="Do not have an account?"
      footerLink={{ text: 'Register', href: '/register' }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black">Login</h2>
        <p className="mt-2 text-sm text-slate-600">
          Do not have an account?{' '}
          <Link href="/register" className="font-bold text-blue-700 hover:text-blue-800">
            Register
          </Link>
        </p>
      </div>

      <Form action={loginAction}>
        {nextPath && <input type="hidden" name="redirectTo" value={nextPath} />}

        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
          required
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 font-semibold text-slate-600">
            <input type="checkbox" className="size-4 rounded border-slate-300 accent-blue-700" />
            Remember me
          </label>
          <Link href="/" className="font-bold text-blue-700">
            Forgot password
          </Link>
        </div>

        <FormButton>Sign in</FormButton>
      </Form>
    </AuthLayout>
  );
}
