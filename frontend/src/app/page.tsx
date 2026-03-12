'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Zap, BarChart3, Shield, Copy, ExternalLink } from 'lucide-react';

const FEATURES = [
    { icon: Zap, title: 'Blazing Fast', desc: 'Sub-millisecond redirects powered by Redis caching. Your links load instantly.' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track clicks, geographic distribution, browser stats, and more.' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Built on a microservices architecture with Kafka-backed event streaming.' },
];

const EXAMPLE_URLS = [
    { short: 'shrinkr.app/github', original: 'https://github.com/your-very-long-repository-name-that-nobody-wants-to-type', clicks: '14.2K' },
    { short: 'shrinkr.app/launch', original: 'https://producthunt.com/posts/my-amazing-product-launch-2024', clicks: '8.7K' },
    { short: 'shrinkr.app/docs', original: 'https://docs.company.io/v3/getting-started/installation/prerequisites', clicks: '3.1K' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface-0 overflow-hidden">
            {/* Background Glow */}
            <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Shrinkr</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button variant="primary" size="sm">Get started free</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 text-center pt-20 pb-16 px-6 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Free forever plan — no credit card required
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
                    Shorten URLs.{' '}
                    <span className="gradient-text">Amplify reach.</span>
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Create short, memorable links and track every click with real-time analytics.
                    Powered by a high-performance microservices stack.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/signup">
                        <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-brand-900/40">
                            Start shortening free <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            Sign in to dashboard
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Demo URL Table */}
            <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20">
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-300/50 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                        <span className="text-xs text-zinc-500 ml-2 font-mono">dashboard.shrinkr.app</span>
                    </div>
                    <div className="divide-y divide-surface-300/50">
                        {EXAMPLE_URLS.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-200/50 transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-brand-400 font-mono text-sm font-medium flex items-center gap-1.5">
                                        {item.short}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </p>
                                    <p className="text-zinc-500 text-xs mt-0.5 truncate">{item.original}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm font-semibold text-white tabular-nums">{item.clicks}</span>
                                    <span className="text-xs text-zinc-500">clicks</span>
                                    <button className="p-1.5 rounded-lg hover:bg-surface-300 transition-colors text-zinc-500 hover:text-white">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
                <h2 className="text-3xl font-bold text-center text-white mb-12">
                    Everything you need to grow
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="glass rounded-2xl p-6 hover:border-brand-500/40 transition-colors group">
                            <div className="w-10 h-10 rounded-xl bg-brand-600/15 flex items-center justify-center mb-4 group-hover:bg-brand-600/25 transition-colors">
                                <Icon className="w-5 h-5 text-brand-400" />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 max-w-3xl mx-auto px-6 mb-24 text-center">
                <div className="glass rounded-3xl p-12 glow-brand">
                    <h2 className="text-3xl font-bold text-white mb-4">Start for free today</h2>
                    <p className="text-zinc-400 mb-8">Join thousands of developers and marketers using Shrinkr to track their impact.</p>
                    <Link href="/auth/signup">
                        <Button size="lg" className="shadow-xl shadow-brand-900/50">
                            Create your free account <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-surface-300/50 py-8 px-6 text-center text-zinc-500 text-sm">
                © {new Date().getFullYear()} Shrinkr. Built with ❤️ using Next.js & microservices.
            </footer>
        </div>
    );
}
