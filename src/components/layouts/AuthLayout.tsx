import { Header } from '@/components/common/Header';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

/**
 * AuthLayout: Layout for authentication pages.
 */
export async function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header />

      <section className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
