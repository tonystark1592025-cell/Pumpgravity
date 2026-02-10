'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminNav() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex gap-4 items-center">
            <Link href="/admin/stats">
              <Button variant="ghost">Stats</Button>
            </Link>
            <Link href="/admin/articles">
              <Button variant="ghost">Articles</Button>
            </Link>
            <Link href="/admin/news">
              <Button variant="ghost">News</Button>
            </Link>
            <Link href="/admin/debug">
              <Button variant="ghost">Debug</Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
