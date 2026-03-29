import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/apiClient';
import type { BookSummary } from '@/types';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    api
      .get<{ data: BookSummary[] }>('/api/admin/books')
      .then((res) => setBooks(res.data))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin — Books</h1>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          Add book
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {showAddDialog && (
        <div role="dialog" aria-label="Add book" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Add book</h2>
            <p className="text-sm text-muted-foreground mb-4">Book creation form (to be extended).</p>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Close</Button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Title</th>
            <th className="pb-2 font-medium">Authors</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className="border-b">
              <td className="py-2">{book.title}</td>
              <td className="py-2">{book.authors.map((a) => a.name).join(', ')}</td>
              <td className="py-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={async () => {
                    if (!confirm('Delete this book?')) return;
                    await api.del(`/api/admin/books/${book.id}`);
                    setBooks((prev) => prev.filter((b) => b.id !== book.id));
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
