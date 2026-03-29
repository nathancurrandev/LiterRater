import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, BASE_URL } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';

export default function AccountSettingsPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  async function handleExport() {
    setExportLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/account/export`, { credentials: 'include' });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-literrater-data.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.del('/api/account');
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {currentUser && (
        <section>
          <h2 className="text-lg font-semibold mb-1">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Signed in as <strong>@{currentUser.username}</strong> ({currentUser.displayName})
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">Export your data</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Download a copy of all your LiterRater data — reading entries, ratings, reviews, lists, and follows.
        </p>
        <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
          {exportLoading ? 'Preparing…' : 'Download my data'}
        </Button>
      </section>

      <section className="rounded-lg border border-destructive/30 p-4">
        <h2 className="text-lg font-semibold text-destructive mb-2">Delete account</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Permanently delete your account and anonymise all your data. This cannot be undone.
        </p>
        <Button variant="outline" className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
          Delete my account
        </Button>
      </section>

      {showDeleteDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm account deletion"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Delete account?</h2>
            <p className="text-sm text-muted-foreground">
              This will anonymise all your data and you won't be able to log in. Enter your password to confirm.
            </p>
            <div>
              <Label htmlFor="confirm-password">Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoFocus
              />
            </div>
            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeletePassword(''); setDeleteError(null); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteLoading || !deletePassword}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, delete my account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
