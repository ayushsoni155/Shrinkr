'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { apiCreateUrl, apiGetUrls, apiDeleteUrl } from '@/lib/api';
import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import { formatDate, truncateUrl, copyToClipboard, formatNumber } from '@/lib/utils';
import { Plus, Copy, Trash2, BarChart3, ExternalLink, Link2, Zap, TrendingUp, Check, X } from 'lucide-react';

interface UrlItem {
    shortId: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    customAlias: boolean;
    createdAt: string;
}

interface Pagination {
    page: number;
    total: number;
    pages: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [urls, setUrls] = useState<UrlItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState({ originalUrl: '', alias: '' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) router.push('/auth/login');
    }, [isAuthenticated, router]);

    const fetchUrls = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await apiGetUrls(page);
            setUrls(data.data.urls);
            setPagination(data.data.pagination);
        } catch {
            // handle error silently on dashboard
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUrls(1); }, [fetchUrls]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');
        try {
            const { data } = await apiCreateUrl(form.originalUrl, form.alias || undefined);
            setFormSuccess(`Created: ${data.data.shortUrl}`);
            setForm({ originalUrl: '', alias: '' });
            fetchUrls(1);
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to create short URL');
        } finally {
            setFormLoading(false);
        }
    }

    async function handleCopy(url: string, id: string) {
        await copyToClipboard(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    async function handleDelete(shortId: string) {
        try {
            await apiDeleteUrl(shortId);
            setUrls((prev) => prev.filter((u) => u.shortId !== shortId));
            setPagination((p) => ({ ...p, total: p.total - 1 }));
        } catch { }
        setDeleteId(null);
    }

    const totalClicks = urls.reduce((acc, u) => acc + u.clicks, 0);

    return (
        <div className="min-h-screen bg-surface-0">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header Stats */}
                <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { icon: Link2, label: 'Total Links', value: pagination.total.toString() },
                        { icon: TrendingUp, label: 'Total Clicks', value: formatNumber(totalClicks) },
                        { icon: Zap, label: 'Avg. Clicks', value: urls.length ? formatNumber(Math.round(totalClicks / urls.length)) : '0' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="glass rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-600/15 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Form */}
                <div className="glass rounded-2xl p-6 mb-8">
                    <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-brand-400" /> Shorten a new URL
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="url"
                                className="input-base flex-1"
                                placeholder="https://your-very-long-url.com/path/to/page"
                                value={form.originalUrl}
                                onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                className="input-base sm:w-48"
                                placeholder="Custom alias (optional)"
                                value={form.alias}
                                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                                pattern="[a-zA-Z0-9_-]{3,30}"
                                title="3-30 alphanumeric, hyphens, underscores"
                            />
                            <Button type="submit" loading={formLoading} className="shrink-0">
                                <Plus className="w-4 h-4" /> Shorten
                            </Button>
                        </div>
                        {formError && (
                            <p className="text-red-400 text-xs flex items-center gap-1"><X className="w-3 h-3" /> {formError}</p>
                        )}
                        {formSuccess && (
                            <p className="text-green-400 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> {formSuccess}</p>
                        )}
                    </form>
                </div>

                {/* URLs Table */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-300/50 flex items-center justify-between">
                        <h2 className="font-semibold text-white text-sm">Your shortened URLs</h2>
                        <span className="text-xs text-zinc-500">{pagination.total} links</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-zinc-500 text-sm">
                            <svg className="animate-spin h-5 w-5 mr-3 text-brand-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Loading your URLs...
                        </div>
                    ) : urls.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500">
                            <Link2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No URLs yet. Create your first short link above!</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-surface-300/50 text-left">
                                            {['Short URL', 'Original URL', 'Clicks', 'Created', 'Actions'].map((h) => (
                                                <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-300/30">
                                        {urls.map((url) => (
                                            <tr key={url.shortId} className="hover:bg-surface-200/40 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="text-brand-400 font-mono text-xs font-medium">
                                                        {url.shortId}
                                                        {url.customAlias && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-brand-600/20 text-[10px] text-brand-300">alias</span>}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <span className="text-zinc-400 text-xs" title={url.originalUrl}>{truncateUrl(url.originalUrl, 55)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-white tabular-nums">{formatNumber(url.clicks)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(url.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleCopy(url.shortUrl, url.shortId)}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-surface-300 transition-colors" title="Copy">
                                                            {copiedId === url.shortId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-surface-300 transition-colors" title="Open">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                        <Link href={`/dashboard/analytics/${url.shortId}`}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-400 hover:bg-brand-600/10 transition-colors" title="Analytics">
                                                            <BarChart3 className="w-3.5 h-3.5" />
                                                        </Link>
                                                        {deleteId === url.shortId ? (
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => handleDelete(url.shortId)}
                                                                    className="px-2 py-1 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">Yes</button>
                                                                <button onClick={() => setDeleteId(null)}
                                                                    className="px-2 py-1 text-xs rounded-lg text-zinc-500 hover:bg-surface-300 transition-colors">No</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setDeleteId(url.shortId)}
                                                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-surface-300/30">
                                {urls.map((url) => (
                                    <div key={url.shortId} className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <span className="text-brand-400 font-mono text-sm font-medium">{url.shortId}</span>
                                            <span className="font-bold text-white text-sm">{formatNumber(url.clicks)} clicks</span>
                                        </div>
                                        <p className="text-zinc-500 text-xs mb-3 truncate">{url.originalUrl}</p>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleCopy(url.shortUrl, url.shortId)} className="btn-ghost text-xs py-1.5 px-2.5">
                                                {copiedId === url.shortId ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                            <Link href={`/dashboard/analytics/${url.shortId}`} className="btn-ghost text-xs py-1.5 px-2.5">
                                                <BarChart3 className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-surface-300/50">
                                    <Button variant="ghost" size="sm" disabled={pagination.page <= 1}
                                        onClick={() => fetchUrls(pagination.page - 1)}>← Prev</Button>
                                    <span className="text-xs text-zinc-500">Page {pagination.page} of {pagination.pages}</span>
                                    <Button variant="ghost" size="sm" disabled={pagination.page >= pagination.pages}
                                        onClick={() => fetchUrls(pagination.page + 1)}>Next →</Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
