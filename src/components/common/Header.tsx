import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { AppLogo } from './AppLogo';
import { HeaderMenu } from './HeaderMenu';

export async function Header() {
  const user = await getCurrentUser();

  const dashboardLink =
    user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : user?.role === 'DRIVER'
        ? '/driver'
        : user
          ? '/user'
          : '/';

  return (
    <header className="border-b border-blue-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href={dashboardLink} className="flex min-w-0 items-center gap-3" aria-label="Home">
          <AppLogo />
        </Link>

        <HeaderMenu
          isAuthenticated={Boolean(user)}
          userName={user?.fullname}
          isSuperAdmin={user?.role === 'SUPER_ADMIN'}
        />
      </nav>
    </header>
  );
}
