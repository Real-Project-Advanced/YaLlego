import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'SUPER_ADMIN') {
    redirect('/admin');
  }

  if (user.role === 'DRIVER') {
    redirect('/driver');
  }

  return <>{children}</>;
}
