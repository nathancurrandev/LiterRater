import React, { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r bg-muted/40 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <nav className="space-y-1">
          <Link
            to="/admin/books"
            className="block rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Books
          </Link>
          <Link
            to="/admin/authors"
            className="block rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Authors
          </Link>
          <Link
            to="/admin/users"
            className="block rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Users
          </Link>
        </nav>
      </aside>
      <div className="flex-1">
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
