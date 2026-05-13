import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/get-user';

const TEMPLATE_LABELS: Record<string, string> = {
  'product-launch': 'Product Launch',
  'feature-update': 'Feature Update',
  'newsletter': 'Newsletter',
  'promotional': 'Promotional',
  'event-invitation': 'Event Invitation',
  'partner-spotlight': 'Partner Spotlight',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/signin');

  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  const supabase = createAdminClient();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, slug, title, subject, template, status, created_at, loops_campaign_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#002771' }}
          >
            H
          </div>
          <span className="font-semibold text-gray-900">HitPay EDM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
            Settings
          </Link>
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#002771' }}>
              Campaigns
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {campaigns?.length ?? 0} campaign{(campaigns?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/campaigns/new"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#2465DE' }}
          >
            + New Campaign
          </Link>
        </div>

        {!campaigns || campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <p className="text-gray-400 text-sm mb-4">No campaigns yet</p>
            <Link
              href="/campaigns/new"
              className="text-sm font-medium hover:underline"
              style={{ color: '#2465DE' }}
            >
              Create your first campaign →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Subject</th>
                  <th className="text-left px-6 py-3">Template</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Created</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                      {c.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {TEMPLATE_LABELS[c.template] ?? c.template}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          c.status === 'uploaded'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.status === 'uploaded' ? 'Uploaded' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('en-SG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#2465DE' }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
