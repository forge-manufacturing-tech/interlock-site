import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 metal-texture overflow-x-hidden">
            {/* Header/Nav */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="industrial-headline text-2xl">INTERLOCK</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-industrial-steel-400 hover:text-industrial-copper-500 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/login?mode=register')}
                            className="px-4 py-2 industrial-btn rounded-sm text-xs"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-24 px-6 scanlines border-b border-industrial-concrete">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-block px-3 py-1 mb-6 border border-industrial-copper-500/30 bg-industrial-copper-500/10 rounded-full">
                        <span className="text-[10px] font-mono text-industrial-copper-500 uppercase tracking-widest">The Software-Enabled Solution</span>
                    </div>
                    <h2 className="industrial-headline text-5xl md:text-7xl mb-8 leading-tight">
                        ACCELERATE <br/> <span className="text-industrial-copper-500">TECH TRANSFER</span>
                    </h2>
                    <p className="text-industrial-steel-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light mb-8">
                        The Software-Enabled Solution for Regulated Manufacturing.
                    </p>
                    <p className="text-industrial-steel-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-mono mb-12">
                        No behavior change required. We ingest your existing PDFs, Excel BOMs, and CAD packs and turn them into ERP-ready data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login?mode=register')}
                            className="px-8 py-4 industrial-btn text-sm tracking-widest"
                        >
                            INITIALIZE TRANSFER
                        </button>
                        <button
                            onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 border border-industrial-concrete bg-industrial-steel-900 hover:bg-industrial-steel-800 text-industrial-steel-300 rounded-sm text-sm font-mono uppercase tracking-widest transition-colors"
                        >
                            View Solutions
                        </button>
                    </div>
                </div>
            </section>

            {/* Problem / Metrics Section */}
            <section id="problem" className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="industrial-headline text-3xl mb-4">THE COST OF MANUAL TRANSFER</h3>
                        <p className="text-industrial-steel-400 font-mono text-sm uppercase tracking-widest">Why the old way is broken</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="industrial-panel p-8 text-center border-t-4 border-t-industrial-alert">
                            <div className="text-4xl font-bold text-industrial-alert mb-2">6–12</div>
                            <div className="text-sm font-mono text-industrial-steel-500 uppercase tracking-widest mb-4">Months</div>
                            <p className="text-industrial-steel-300">
                                Current timeline for tech transfer per product due to manual data entry and validation.
                            </p>
                        </div>
                         <div className="industrial-panel p-8 text-center border-t-4 border-t-industrial-caution">
                            <div className="text-4xl font-bold text-industrial-caution mb-2">8,500</div>
                            <div className="text-sm font-mono text-industrial-steel-500 uppercase tracking-widest mb-4">Pages</div>
                            <p className="text-industrial-steel-300">
                                Average volume of documentation teams manually process per product lifecycle.
                            </p>
                        </div>
                         <div className="industrial-panel p-8 text-center border-t-4 border-t-industrial-alert-dark">
                            <div className="text-4xl font-bold text-industrial-alert-dark mb-2">30%</div>
                            <div className="text-sm font-mono text-industrial-steel-500 uppercase tracking-widest mb-4">Failure Rate</div>
                            <p className="text-industrial-steel-300">
                                Of pilot runs fail due to manual transcription errors or noncompliance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Persona Section */}
             <section className="py-24 px-6 border-b border-industrial-concrete relative overflow-hidden">
                <div className="absolute inset-0 bg-industrial-copper-500/5 scanlines pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="industrial-headline text-3xl mb-6">BUILT FOR REGULATED INDUSTRIES</h3>
                            <p className="text-industrial-steel-300 mb-6 text-lg leading-relaxed">
                                Designed specifically for Mid-Sized Regulated U.S. Manufacturers (100–1,000 employees) who face the highest compliance burdens.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-industrial-copper-500 rounded-full"></span>
                                    <span className="text-industrial-steel-400 font-mono">Aerospace & Defense (ITAR)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-industrial-copper-500 rounded-full"></span>
                                    <span className="text-industrial-steel-400 font-mono">Medical Devices (FDA 21 CFR)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-industrial-copper-500 rounded-full"></span>
                                    <span className="text-industrial-steel-400 font-mono">AS9100 Certified Facilities</span>
                                </li>
                            </ul>
                        </div>
                        <div className="industrial-panel p-8 bg-industrial-steel-900/50 backdrop-blur-sm border border-industrial-concrete">
                             <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-industrial-steel-800 border border-industrial-concrete rounded">
                                        <svg className="w-6 h-6 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-neutral-200 font-bold text-sm mb-1">AUTOMATED COMPLIANCE</h4>
                                        <p className="text-industrial-steel-500 text-xs leading-relaxed">System automatically flags non-compliant specs against ITAR and FDA standards.</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-4">
                                    <div className="p-2 bg-industrial-steel-800 border border-industrial-concrete rounded">
                                        <svg className="w-6 h-6 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-neutral-200 font-bold text-sm mb-1">SECURE TRANSLATION</h4>
                                        <p className="text-industrial-steel-500 text-xs leading-relaxed">End-to-end encryption for sensitive IP during the file-to-ERP translation process.</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                     </div>
                </div>
             </section>

             {/* Success Story Section */}
            <section className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto">
                     <div className="industrial-panel p-12 relative overflow-hidden group hover:border-industrial-copper-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-64 h-64 text-industrial-copper-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                            </svg>
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-block px-3 py-1 mb-4 border border-industrial-active-dark/30 bg-industrial-active-dark/10 rounded-full">
                                    <span className="text-[10px] font-mono text-industrial-active-dark uppercase tracking-widest">Case Study: Modular Success</span>
                                </div>
                                <h3 className="industrial-headline text-3xl mb-4">PEKO PRECISION PRODUCTS</h3>
                                <p className="text-industrial-steel-300 mb-6 leading-relaxed">
                                    Pilot launching Feb 28. Focusing on the high-value thread of <strong>BOM-to-ERP translation</strong>.
                                </p>
                                <p className="text-industrial-steel-400 mb-8 text-sm">
                                    Instead of replacing their entire workflow, Interlock inserted a modular solution to automate the ingestion of complex customer BOMs directly into their ERP system.
                                </p>
                                <button className="text-industrial-copper-500 font-mono text-xs uppercase tracking-widest hover:text-industrial-copper-400 transition-colors flex items-center gap-2">
                                    Read Full Case Study <span className="text-lg">→</span>
                                </button>
                            </div>
                            <div className="bg-industrial-steel-950 border border-industrial-concrete p-6 rounded-sm font-mono text-xs text-industrial-steel-400">
                                <div className="flex justify-between border-b border-industrial-concrete pb-2 mb-2">
                                    <span>INPUT: customer_bom.xlsx</span>
                                    <span className="text-industrial-copper-500">PROCESSING...</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <span className="text-industrial-active">[OK]</span>
                                        <span>Parsing Part Numbers...</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-industrial-active">[OK]</span>
                                        <span>Matching Vendor Codes...</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-industrial-active">[OK]</span>
                                        <span>Validating Quantities...</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-industrial-copper-500">[wait]</span>
                                        <span>Human Approval Required for Line 42 (Ambiguous Spec)</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-2 border-t border-industrial-concrete flex justify-between">
                                    <span>OUTPUT: ERP_Import.csv</span>
                                    <span className="text-industrial-active">READY</span>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </section>

            {/* Reliability / Human-in-the-Loop Section */}
            <section className="py-24 px-6 border-b border-industrial-concrete">
                 <div className="max-w-4xl mx-auto text-center">
                    <h3 className="industrial-headline text-3xl mb-8">TRUST BUT VERIFY</h3>
                    <p className="text-industrial-steel-300 text-lg mb-12 max-w-2xl mx-auto">
                        We understand the skepticism around AI in manufacturing. That's why Interlock is built with a "Human-in-the-Loop" architecture.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="industrial-panel p-8">
                            <h4 className="text-neutral-200 font-bold mb-4 flex items-center gap-3">
                                <span className="text-industrial-copper-500">01.</span>
                                Automated Ingestion
                            </h4>
                            <p className="text-industrial-steel-400 text-sm leading-relaxed">
                                Our system handles the heavy lifting of data extraction and formatting, processing thousands of lines in seconds.
                            </p>
                        </div>
                        <div className="industrial-panel p-8 border border-industrial-copper-500/20 shadow-glow-copper">
                            <h4 className="text-neutral-200 font-bold mb-4 flex items-center gap-3">
                                <span className="text-industrial-copper-500">02.</span>
                                Human Verification
                            </h4>
                            <p className="text-industrial-steel-400 text-sm leading-relaxed">
                                Critical data points are flagged for review. Nothing enters your ERP without explicit human approval, ensuring <strong>100% accuracy</strong> and zero hallucinations.
                            </p>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Team Section */}
            <section className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="industrial-headline text-3xl mb-4">FOUNDING TEAM</h3>
                        <p className="text-industrial-steel-400 font-mono text-sm uppercase tracking-widest">Architects of the new industrial standard</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12">
                        {[
                            { name: 'Tyler Mangini', role: 'Co-Founder', img: '/images/team/tyler.png' },
                            { name: 'Arshaan Ali', role: 'Co-Founder', img: '/images/team/arshaan.png' },
                            { name: 'Nathan Alam', role: 'Co-Founder', img: '/images/team/nathan.png' }
                        ].map((member) => (
                            <div key={member.name} className="text-center group w-64">
                                <div className="w-48 h-48 mx-auto bg-industrial-steel-800 rounded-full border-2 border-industrial-concrete group-hover:border-industrial-copper-500 transition-colors mb-6 overflow-hidden relative">
                                    <img
                                        src={member.img}
                                        alt={member.name}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-industrial-copper-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <h4 className="text-xl font-bold text-neutral-200 mb-2">{member.name}</h4>
                                <p className="text-industrial-steel-500 text-sm font-mono uppercase tracking-wide">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center industrial-panel p-12 bg-gradient-to-b from-industrial-steel-900 to-industrial-steel-950">
                    <h3 className="industrial-headline text-3xl mb-6">READY TO SYNC?</h3>
                    <p className="text-industrial-steel-400 mb-8 max-w-2xl mx-auto">
                        Stop interpreting. Start manufacturing. Join the platform that speaks the language of both design and production.
                    </p>
                    <button
                        onClick={() => navigate('/login?mode=register')}
                        className="px-12 py-4 industrial-btn text-sm tracking-widest"
                    >
                        CREATE ACCOUNT
                    </button>
                    <div className="mt-6">
                         <button
                            onClick={() => navigate('/login')}
                            className="text-industrial-steel-500 hover:text-industrial-copper-500 text-xs font-mono uppercase tracking-widest transition-colors"
                        >
                            Already have an account? Log In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-industrial-concrete bg-industrial-steel-950 text-center">
                <p className="text-industrial-steel-600 text-[10px] font-mono uppercase tracking-widest">
                    © {new Date().getFullYear()} Interlock Systems. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
