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

            {/* Hero Section: Deterministic Execution */}
            <section className="relative py-24 px-6 scanlines border-b border-industrial-concrete">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-block px-3 py-1 mb-6 border border-industrial-copper-500/30 bg-industrial-copper-500/10 rounded-full">
                        <span className="text-[10px] font-mono text-industrial-copper-500 uppercase tracking-widest">Deterministic Execution</span>
                    </div>
                    <h2 className="industrial-headline text-4xl md:text-6xl mb-8 leading-tight">
                        FROM UNSTRUCTURED PDF <br/> TO <span className="text-industrial-copper-500">DETERMINISTIC PRODUCTION</span>
                    </h2>
                    <p className="text-industrial-steel-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
                        Stop quoting in spreadsheets. Interlock automatically ingests technical packets into a Rooted Manufacturing Operation Tree, generating accurate BOMs and compliance workflows instantly.
                    </p>

                    {/* Visual: Alternating Operation Tree */}
                    <div className="max-w-4xl mx-auto bg-industrial-steel-900/50 border border-industrial-concrete p-8 rounded-lg relative overflow-hidden mb-12">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                        <div className="relative z-10 flex flex-col items-center gap-8 font-mono text-xs">
                            {/* Part Node (Root) */}
                            <div className="flex flex-col items-center">
                                <div className="px-4 py-2 bg-industrial-active/10 border border-industrial-active text-industrial-active rounded shadow-[0_0_15px_rgba(76,175,80,0.3)]">
                                    [PART: FINISHED_ASSEMBLY_001]
                                </div>
                                <div className="h-8 w-px bg-industrial-concrete-light"></div>
                            </div>

                            {/* Operation Nodes Level */}
                            <div className="flex gap-16 relative">
                                {/* Connecting lines */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] h-px bg-industrial-concrete-light"></div>
                                <div className="absolute top-0 left-8 h-4 w-px bg-industrial-concrete-light"></div>
                                <div className="absolute top-0 right-8 h-4 w-px bg-industrial-concrete-light"></div>

                                {/* Op Node 1 (Validated) */}
                                <div className="flex flex-col items-center mt-4">
                                    <div className="px-3 py-1.5 bg-industrial-active/10 border border-industrial-active text-industrial-active rounded mb-4">
                                        [OP: CNC_MILL_OP10]
                                    </div>
                                    <div className="h-4 w-px bg-industrial-concrete-light"></div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-industrial-steel-800 border border-industrial-concrete text-industrial-steel-400 rounded">[RES: Labor: 45m]</span>
                                        <span className="px-2 py-1 bg-industrial-steel-800 border border-industrial-concrete text-industrial-steel-400 rounded">[RES: Al_6061]</span>
                                    </div>
                                </div>

                                {/* Op Node 2 (Unstructured/Alert) */}
                                <div className="flex flex-col items-center mt-4">
                                    <div className="px-3 py-1.5 bg-industrial-copper-500/10 border border-industrial-copper-500 text-industrial-copper-500 rounded animate-pulse mb-4">
                                        [OP: WELD_ASSEMBLY_REQ]
                                    </div>
                                    <div className="h-4 w-px bg-industrial-concrete-light"></div>
                                    <div className="px-2 py-1 bg-industrial-copper-500/10 border border-industrial-copper-500/50 text-industrial-copper-500 rounded text-[10px]">
                                        ⚠ AWAITING RESOLUTION
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login?mode=register')}
                            className="px-8 py-4 industrial-btn text-sm tracking-widest"
                        >
                            START INGESTION
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature: Automated Takeoff & Estimating */}
            <section className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h3 className="industrial-headline text-3xl mb-4">SMART TAKEOFF & BOM GENERATION</h3>
                        <p className="text-industrial-steel-300 text-lg leading-relaxed mb-6">
                            Eliminate the 'Fog of War' in quoting. Interlock ingests unstructured architectural drawings and 2D sketches to automatically generate Bill of Materials (BOM) and labor estimates.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-neutral-200 font-bold text-sm mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-industrial-copper-500 rounded-full"></span>
                                    HIERARCHICAL CONVERSION
                                </h4>
                                <p className="text-industrial-steel-400 text-sm">
                                    Convert static PDF drawings into a computable, hierarchical tree. Detect geometric errors and missing resources before they hit the shop floor.
                                </p>
                            </div>
                            <div className="p-4 bg-industrial-steel-800/50 border border-industrial-active/30 rounded">
                                <span className="text-industrial-active font-mono text-sm font-bold">IMPACT:</span>
                                <span className="text-industrial-steel-300 text-sm ml-2">
                                    Reduce estimation time from days to minutes and turn 'tribal knowledge' into structured, reusable assets.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="industrial-panel p-8 bg-industrial-steel-950 border border-industrial-concrete relative h-64 flex items-center justify-center">
                        {/* Abstract schematic representation */}
                        <div className="w-full h-full border border-dashed border-industrial-steel-700 p-4 relative">
                            <div className="absolute top-4 left-4 w-1/3 h-1/3 border border-industrial-steel-600"></div>
                            <div className="absolute bottom-4 right-4 w-1/2 h-1/2 border border-industrial-steel-600"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-industrial-copper-500/10 border border-industrial-copper-500 p-2 rounded text-xs text-industrial-copper-500 font-mono">
                                SCANNING GEOMETRY...
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature: Compliance & Tech Transfer */}
            <section className="py-24 px-6 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
                    <div className="order-2 md:order-1 industrial-panel p-8 bg-industrial-steel-950 border border-industrial-concrete flex items-center justify-center">
                        <div className="text-center font-mono">
                            <div className="mb-4 text-industrial-steel-400 text-xs">VENDOR ACCESS PORTAL</div>
                            <div className="flex items-center gap-4 justify-center mb-4">
                                <div className="w-16 h-16 border border-industrial-active bg-industrial-active/10 rounded flex items-center justify-center text-industrial-active">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="h-px w-12 bg-industrial-concrete-light border-t border-dashed"></div>
                                <div className="w-16 h-16 border border-industrial-steel-700 bg-industrial-steel-900 rounded flex items-center justify-center text-industrial-steel-600">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-xs text-industrial-active">SUBTREE LEASE: ACTIVE</div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <h3 className="industrial-headline text-3xl mb-4">REGULATED WORKFLOW ORCHESTRATION</h3>
                        <p className="text-industrial-steel-300 text-lg leading-relaxed mb-6">
                            Automate the generation of IQ, OQ, and PQ documentation. Manage high-stakes tech transfers in Aerospace and Medical without the administrative burden.
                        </p>
                        <div className="bg-industrial-steel-900/50 p-6 border-l-4 border-industrial-copper-500">
                            <h4 className="text-neutral-200 font-bold text-sm mb-2">SECURE SUBTREE LEASING</h4>
                            <p className="text-industrial-steel-400 text-sm leading-relaxed">
                                Collaborate with vendors using our proprietary Subtree Leasing. Grant exclusive write access to specific branches of your manufacturing tree—ensuring vendors see only what they need, while you maintain a unified system of record.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Feature: Intrinsic Costing Engine */}
             <section className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="industrial-headline text-3xl mb-6">POWERED BY INTRINSIC COST ACCUMULATION</h3>
                    <p className="text-industrial-steel-300 text-lg mb-12 leading-relaxed">
                        Interlock calculates cost by recursively aggregating "Atomic Resources"—labor durations, equipment depreciation, and energy usage—up the tree, rather than relying on static price tables.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
                        <div>
                            <div className="mb-8">
                                <h4 className="text-neutral-200 font-bold mb-2 text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 text-industrial-active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    TRUE MARGIN VISIBILITY
                                </h4>
                                <p className="text-industrial-steel-400 text-sm">
                                    Know the exact intrinsic cost of every node, updated instantly as labor or material variables change along the ancestor path.
                                </p>
                            </div>
                        </div>
                        <div className="industrial-panel p-8 bg-industrial-steel-950 font-mono text-xs">
                             <div className="flex flex-col items-center gap-4">
                                <div className="w-full flex justify-between items-center p-2 bg-industrial-steel-900 border border-industrial-concrete rounded">
                                    <span>ROOT COST</span>
                                    <span className="text-industrial-active font-bold">$1,245.50</span>
                                </div>
                                <div className="h-6 w-px bg-industrial-concrete-light"></div>
                                <div className="w-full flex gap-4">
                                     <div className="flex-1 p-2 bg-industrial-steel-900/50 border border-industrial-concrete rounded opacity-50">
                                        <div className="flex justify-between">
                                            <span>Sub-Assy A</span>
                                            <span>$400.00</span>
                                        </div>
                                     </div>
                                     <div className="flex-1 p-2 bg-industrial-steel-900 border border-industrial-copper-500 rounded relative overflow-hidden">
                                        <div className="absolute inset-0 bg-industrial-copper-500/10 animate-pulse"></div>
                                        <div className="flex justify-between relative z-10">
                                            <span>Welding</span>
                                            <span className="text-industrial-copper-500 font-bold">$845.50</span>
                                        </div>
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* How it Works */}
             <section className="py-24 px-6 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="industrial-headline text-3xl mb-4">THE DATA FLOW</h3>
                        <p className="text-industrial-steel-400 font-mono text-sm uppercase tracking-widest">From chaos to code</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="industrial-panel p-8 relative">
                            <div className="text-6xl font-bold text-industrial-steel-800 absolute top-4 right-4 opacity-50">01</div>
                            <h4 className="text-xl font-bold text-neutral-200 mb-4">INGEST</h4>
                            <p className="text-industrial-steel-400 text-sm mb-4">
                                Upload unstructured inputs (PDFs, Images, Text Requests). Machine learning models generate candidate subtrees.
                            </p>
                        </div>
                        <div className="industrial-panel p-8 relative border-t-4 border-t-industrial-copper-500">
                             <div className="text-6xl font-bold text-industrial-steel-800 absolute top-4 right-4 opacity-50">02</div>
                            <h4 className="text-xl font-bold text-neutral-200 mb-4">VALIDATE</h4>
                            <p className="text-industrial-steel-400 text-sm mb-4">
                                System checks against schema invariants (e.g., Operation must produce a State). Engineers review and commit.
                            </p>
                        </div>
                        <div className="industrial-panel p-8 relative">
                             <div className="text-6xl font-bold text-industrial-steel-800 absolute top-4 right-4 opacity-50">03</div>
                            <h4 className="text-xl font-bold text-neutral-200 mb-4">EXECUTE</h4>
                            <p className="text-industrial-steel-400 text-sm mb-4">
                                Compile the tree into 'Step-Result' travelers for the shop floor and structured procurement artifacts for ERPs.
                            </p>
                        </div>
                    </div>
                </div>
             </section>

            {/* Industry Solutions (Verticals) */}
             <section className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete relative overflow-hidden">
                <div className="absolute inset-0 bg-industrial-copper-500/5 scanlines pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                     <h3 className="industrial-headline text-3xl mb-12 text-center">INDUSTRY SOLUTIONS</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="industrial-panel p-8 bg-industrial-steel-950/80 backdrop-blur-sm">
                            <h4 className="text-neutral-200 font-bold mb-4 text-lg">Custom Fabrication</h4>
                            <p className="text-industrial-steel-400 text-sm mb-4">Retail / Architecture</p>
                            <p className="text-industrial-steel-300 text-sm leading-relaxed">
                                For high-mix shops handling architectural PDFs and complex fixture assemblies.
                            </p>
                        </div>
                        <div className="industrial-panel p-8 bg-industrial-steel-950/80 backdrop-blur-sm">
                            <h4 className="text-neutral-200 font-bold mb-4 text-lg">Textiles & Soft Goods</h4>
                            <p className="text-industrial-steel-400 text-sm mb-4">Pattern & Cut</p>
                            <p className="text-industrial-steel-300 text-sm leading-relaxed">
                                Translate tech packs into cut-ready patterns and detect CAD errors before the first stitch.
                            </p>
                        </div>
                        <div className="industrial-panel p-8 bg-industrial-steel-950/80 backdrop-blur-sm border border-industrial-active/20">
                            <h4 className="text-neutral-200 font-bold mb-4 text-lg">Regulated Industries</h4>
                            <p className="text-industrial-steel-400 text-sm mb-4">Aero / Defense / Med</p>
                            <p className="text-industrial-steel-300 text-sm leading-relaxed">
                                Streamline the 'digital filing cabinet' of compliance paperwork and qualification documentation.
                            </p>
                        </div>
                     </div>
                </div>
             </section>

             {/* Pilots Info (Replaces PEKO) */}
            <section className="py-24 px-6 border-b border-industrial-concrete">
                <div className="max-w-5xl mx-auto">
                     <div className="industrial-panel p-12 text-center bg-gradient-to-br from-industrial-steel-900 to-industrial-steel-950">
                        <div className="inline-block px-3 py-1 mb-6 border border-industrial-active/30 bg-industrial-active/10 rounded-full">
                            <span className="text-[10px] font-mono text-industrial-active uppercase tracking-widest">Active Deployments</span>
                        </div>
                        <h3 className="industrial-headline text-3xl mb-6">PILOT PROGRAMS</h3>
                        <p className="text-industrial-steel-300 text-xl leading-relaxed max-w-3xl mx-auto">
                            We are currently executing four pilots across <span className="text-neutral-100 font-bold">Textiles</span>, <span className="text-neutral-100 font-bold">Furniture</span>, <span className="text-neutral-100 font-bold">Aerospace</span>, and <span className="text-neutral-100 font-bold">Microelectronics</span>.
                        </p>
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
