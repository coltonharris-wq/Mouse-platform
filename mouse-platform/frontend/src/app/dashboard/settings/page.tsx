'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, User, Bell, Users, Check, Download, FileText, Trash2, AlertTriangle, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface AccountInfo {
  business_name: string;
  email: string;
  phone: string | null;
  owner_name: string | null;
}

interface NotificationPrefs {
  email_urgent: boolean;
  email_daily_summary: boolean;
  email_weekly_report: boolean;
  sms_critical: boolean;
  notification_email: string | null;
  notification_phone: string | null;
}

export default function SettingsPage() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Editable fields
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, prefRes] = await Promise.all([
        apiFetch(`/api/settings/account?customer_id=${customerId}`),
        apiFetch(`/api/notifications/preferences?customer_id=${customerId}`),
      ]);

      const accData = await accRes.json();
      const prefData = await prefRes.json();

      if (accData.account) {
        setAccount(accData.account);
        setBusinessName(accData.account.business_name || '');
        setPhone(accData.account.phone || '');
        setOwnerName(accData.account.owner_name || '');
      }

      if (prefData.preferences) {
        setPrefs(prefData.preferences);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveAccount = async () => {
    setSavingAccount(true);
    setAccountSaved(false);
    try {
      await apiFetch('/api/settings/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          business_name: businessName,
          phone: phone || null,
          owner_name: ownerName || null,
        }),
      });
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 3000);
    } catch {
      // Ignore
    } finally {
      setSavingAccount(false);
    }
  };

  const togglePref = async (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    const newValue = !prefs[key];
    const updated = { ...prefs, [key]: newValue };
    setPrefs(updated);
    setSavingPrefs(true);
    setPrefsSaved(false);
    try {
      await apiFetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          [key]: newValue,
        }),
      });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch {
      // Revert on failure
      setPrefs(prefs);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-[#0B1F3B] mb-8">Settings</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded w-full" />
                <div className="h-12 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-[#0B1F3B] mb-8">Settings</h1>

      <div className="space-y-8 max-w-3xl">
        {/* ── Account Info ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[#0F6B6E]/10 rounded-lg">
              <User className="w-6 h-6 text-[#0F6B6E]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F3B]">Account Info</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6B6E] focus:border-[#0F6B6E] outline-none"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={account?.email || ''}
                disabled
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-base text-gray-400 mt-1">Contact support to change your email</p>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6B6E] focus:border-[#0F6B6E] outline-none"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6B6E] focus:border-[#0F6B6E] outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={saveAccount}
              disabled={savingAccount}
              className="flex items-center gap-2 px-6 py-3 bg-[#0F6B6E] text-white text-lg font-semibold rounded-lg hover:bg-[#0d5c5f] transition-colors disabled:opacity-50"
            >
              {savingAccount ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {savingAccount ? 'Saving...' : 'Save Changes'}
            </button>
            {accountSaved && (
              <span className="flex items-center gap-1 text-lg text-green-600 font-medium">
                <Check className="w-5 h-5" /> Saved
              </span>
            )}
          </div>
        </section>

        {/* ── Notification Preferences ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F6B6E]/10 rounded-lg">
                <Bell className="w-6 h-6 text-[#0F6B6E]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B1F3B]">Notification Preferences</h2>
            </div>
            {prefsSaved && !savingPrefs && (
              <span className="flex items-center gap-1 text-lg text-green-600 font-medium">
                <Check className="w-5 h-5" /> Saved
              </span>
            )}
          </div>

          {prefs && (
            <div className="space-y-1">
              <ToggleRow
                label="Urgent Alerts"
                description="Get emailed immediately when something needs your attention"
                checked={prefs.email_urgent}
                onChange={() => togglePref('email_urgent')}
              />
              <ToggleRow
                label="Daily Summary"
                description="A daily email recap of what King Mouse accomplished"
                checked={prefs.email_daily_summary}
                onChange={() => togglePref('email_daily_summary')}
              />
              <ToggleRow
                label="Weekly Report"
                description="A weekly performance and activity report"
                checked={prefs.email_weekly_report}
                onChange={() => togglePref('email_weekly_report')}
              />
              <ToggleRow
                label="SMS for Critical Issues"
                description="Text message alerts for critical system events"
                checked={prefs.sms_critical}
                onChange={() => togglePref('sms_critical')}
              />
            </div>
          )}
        </section>

        {/* ── Your Data ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[#0F6B6E]/10 rounded-lg">
              <Download className="w-6 h-6 text-[#0F6B6E]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F3B]">Your Data</h2>
          </div>
          <p className="text-lg text-gray-500 mb-6">Download your data at any time. Exports include all conversations, documents, and settings.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ExportButton
              label="Export Conversations"
              description="Chat history (CSV)"
              icon={<FileText className="w-5 h-5" />}
              url={`/api/export/conversations?customer_id=${customerId}&format=csv`}
              filename="conversations.csv"
            />
            <ExportButton
              label="Export Documents"
              description="Files & screenshots (JSON)"
              icon={<Download className="w-5 h-5" />}
              url={`/api/export/documents?customer_id=${customerId}`}
              filename="documents.json"
            />
            <ExportButton
              label="Export Settings"
              description="Configuration (JSON)"
              icon={<Download className="w-5 h-5" />}
              url={`/api/export/settings?customer_id=${customerId}`}
              filename="settings.json"
            />
          </div>
        </section>

        {/* ── Team ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F3B]">Team</h2>
          </div>
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500 font-medium">Coming Soon</p>
            <p className="text-lg text-gray-400 mt-2">Invite team members to your KingMouse workspace</p>
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <DangerZone customerId={customerId} />
      </div>
    </div>
  );
}

/* ── Toggle Row Component ── */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-xl font-medium text-gray-900">{label}</p>
        <p className="text-lg text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[#0F6B6E]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

/* ── Export Button ── */
function ExportButton({
  label,
  description,
  icon,
  url,
  filename,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  filename: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await apiFetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Ignore
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="flex flex-col items-center gap-2 p-5 rounded-xl border border-gray-200 hover:border-[#0F6B6E] hover:bg-[#0F6B6E]/5 transition-colors text-center disabled:opacity-50"
    >
      <div className="text-[#0F6B6E]">{icon}</div>
      <p className="text-lg font-medium text-gray-900">{label}</p>
      <p className="text-base text-gray-400">{description}</p>
      {downloading && (
        <div className="w-5 h-5 border-2 border-[#0F6B6E] border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}

/* ── Danger Zone ── */
function DangerZone({ customerId }: { customerId: string }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await apiFetch(`/api/customers?customer_id=${customerId}&confirmation=DELETE`, {
        method: 'DELETE',
      });
      setShowCancelModal(false);
      window.location.href = '/';
    } catch {
      // Ignore
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await apiFetch(`/api/customers?customer_id=${customerId}&confirmation=DELETE`, {
        method: 'DELETE',
      });
      sessionStorage.clear();
      window.location.href = '/';
    } catch {
      // Ignore
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="rounded-xl border-2 border-red-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-red-100">
            <div>
              <p className="text-xl font-medium text-gray-900">Cancel Subscription</p>
              <p className="text-lg text-gray-500">Your account will remain active until the end of the billing period.</p>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-5 py-2.5 border-2 border-red-300 text-red-600 text-lg font-semibold rounded-lg hover:bg-red-50 transition-colors shrink-0"
            >
              Cancel Plan
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-xl font-medium text-gray-900">Delete Account</p>
              <p className="text-lg text-gray-500">Permanently delete your account, VM, and all data. This cannot be undone.</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowCancelModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">Cancel Subscription?</h3>
            <p className="text-lg text-gray-600 text-center mb-6">
              Your King Mouse will continue working until the end of your billing period. After that, your VM will be paused.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 text-lg font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">Delete Your Account?</h3>
            <p className="text-lg text-gray-600 text-center mb-6">
              This will permanently delete your account, cancel your subscription, and shut down your King Mouse VM. This action cannot be undone.
            </p>
            <p className="text-lg font-medium text-gray-700 mb-2">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                className="flex-1 py-3 text-lg font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
