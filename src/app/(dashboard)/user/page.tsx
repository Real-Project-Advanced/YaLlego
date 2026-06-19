import { getCurrentUser } from '@/lib/auth';
import { UserDashboard } from '@/modules/user/components';
import { redirect } from 'next/navigation';

export default async function UserPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <UserDashboard user={user} />;
}
