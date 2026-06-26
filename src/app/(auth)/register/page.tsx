import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Form, FormField, FormButton } from '@/components/common/Form';
import { registerAction } from '@/modules/auth/actions/auth.actions';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account and plan your routes"
      subtitle="Register"
      description="Save your favorite destinations, receive personalized recommendations, and access the best routes in Medellin."
      footerText="Already have an account?"
      footerLink={{ text: 'Sign in', href: '/login' }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black">Register</h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-700 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div>

      <Form action={registerAction}>
        <FormField
          label="Full name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
        />

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
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          required
        />

        <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-600">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-slate-300 accent-blue-700"
            required
          />
          I agree to receive route updates, service changes, and recommendations for my urban trips.
        </label>

        <FormButton>Create account</FormButton>
      </Form>
    </AuthLayout>
  );
}
