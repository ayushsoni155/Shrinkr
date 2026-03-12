'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/ui/Navbar';
import { formatDate, formatNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { ArrowLeft, BarChart3, Globe, Monitor } from 'lucide-react';

// Recharts custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-surface-200 border border-surface-300 rounded-xl px-3 py-2 text-xs">
                <p className="text-zinc-400">{label}</p>
                <p className="text-brand-400 font-bold">{payload[0].value} clicks</p>
            </div>
        );
    }
    return null;
};

function StatCard({ title, data, icon: Icon, colorKey }: { title: string; data: { label: string; value: number }[]; icon: any; colorKey: string }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Icon className="w-4 h-4 text-brand-400" /> {title}
            </h3>
            <div className="space-y-2.5">
                {data.slice(0, 5).map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-400 w-24 shrink-0 truncate">{item.label}</span>
                        <div className="flex-1 h-1.5 bg-surface-300 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-brand-500 transition-all duration-700"
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-white tabular-nums w-10 text-right">{formatNumber(item.value)}</span>
                    </div>
                ))}
                {data.length === 0 && <p className="text-zinc-600 text-xs">No data yet</p>}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { shortId } = useParams<{ shortId: string }>();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { router.push('/auth/login'); return; }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (!shortId) return;
        import('@/lib/api').then(({ urlApi }) =>
            urlApi.get(`/api/analytics/${shortId}`)
                .then(({ data: res }) => setData(res.data))
                .catch(() => setError('Could not load analytics for this link.'))
                .finally(() => setLoading(false))
        );
    }, [shortId]);

    return (
        <div className="min-h-screen bg-surface-0">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                    <span className="text-zinc-700">/</span>
                    <span className="text-sm font-mono text-brand-400">{shortId}</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32 text-zinc-500 text-sm">
                        <svg className="animate-spin h-5 w-5 mr-3 text-brand-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading analytics...
                    </div>
                ) : error ? (
                    <div className="text-center py-32 text-red-400 text-sm">{error}</div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Clicks', value: formatNumber(data?.totalClicks || 0) },
                                { label: 'Unique IPs', value: formatNumber(data?.uniqueIps || 0) },
                                { label: 'Top Country', value: data?.topCountry || '—' },
                                { label: 'Top Browser', value: data?.topBrowser || '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="glass rounded-2xl p-5 text-center">
                                    <p className="text-2xl font-bold text-white">{value}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Clicks over time chart */}
                        <div className="glass rounded-2xl p-6 mb-6">
                            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-brand-400" /> Clicks over time (last 14 days)
                            </h3>
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.clicksOverTime || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#26262e" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={false} />
                                        <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                                            {(data?.clicksOverTime || []).map((_: any, i: number) => (
                                                <Cell key={i} fill={i % 2 === 0 ? '#6366f1' : '#4f46e5'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Country + Browser stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard
                                title="Top Countries"
                                data={(data?.countries || []).map((c: any) => ({ label: c.country, value: c.count }))}
                                icon={Globe}
                                colorKey="country"
                            />
                            <StatCard
                                title="Top Browsers"
                                data={(data?.browsers || []).map((b: any) => ({ label: b.browser, value: b.count }))}
                                icon={Monitor}
                                colorKey="browser"
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
