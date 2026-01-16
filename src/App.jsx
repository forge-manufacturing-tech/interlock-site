import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileJson,
  Database,
  Cpu,
  ArrowRight,
  Layers,
  Binary,
  Terminal,
  Activity,
  Lock,
  CheckCircle2,
  XCircle,
  ScanLine
} from 'lucide-react';

import favicon from './assets/favicon.png';

const InterlockLanding = () => {
  const [activeTab, setActiveTab] = useState('brand');
  const [auditStep, setAuditStep] = useState(0);
  const [isAuditing, setIsAuditing] = useState(false);

  // Simulation data
  const auditLogs = [
    { id: 1, type: 'info', text: 'INITIATING SESSION... CONNECTED TO MFG_NODE_08' },
    { id: 2, type: 'process', text: 'INGESTING ARTIFACT: "Summer_Tee_V4.pdf"' },
    { id: 3, type: 'process', text: 'PARSING INTENT VECTORS...' },
    { id: 4, type: 'warn', text: 'CONFLICT DETECTED: MATERIAL SPEC' },
    { id: 5, type: 'error', text: '>> SOURCE A (TEXT): "100% Cotton, 180gsm"' },
    { id: 6, type: 'error', text: '>> SOURCE B (IMG): "Poly-Blend visual drape"' },
    { id: 7, type: 'action', text: 'EXECUTING RULE #402: "FABRIC AVAILABILITY CHECK"' },
    { id: 8, type: 'success', text: 'RESOLUTION: SWATCH_LIB_MATCH FOUND (COTTON_HEAVY_02)' },
    { id: 9, type: 'info', text: 'GENERATING KNOWLEDGE OBJECTS...' },
    { id: 10, type: 'success', text: 'COMPILE COMPLETE. STATUS: LOCKED.' },
  ];

  useEffect(() => {
    let timer;
    if (isAuditing && auditStep < auditLogs.length) {
      timer = setTimeout(() => {
        setAuditStep(prev => prev + 1);
      }, 600);
    } else if (auditStep >= auditLogs.length) {
      setIsAuditing(false);
    }
    return () => clearTimeout(timer);
  }, [isAuditing, auditStep]);

  const startAudit = () => {
    setAuditStep(0);
    setIsAuditing(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FF4400] selection:text-white overflow-x-hidden">

      {/* Navigation / HUD */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#050505]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={favicon} alt="Interlock Logo" className="w-8 h-8 object-contain" />
            <span className="font-mono text-xl font-bold tracking-tighter">INTERLOCK_</span>
          </div>
          <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
            <div>LATENCY: 12ms</div>
            <div>VER: 2.4.0</div>
          </div>
          <button className="bg-white text-black font-mono text-xs font-bold px-4 py-2 hover:bg-[#FF4400] hover:text-white transition-colors uppercase">
            Deploy Protocol
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-2 py-1 border border-[#FF4400] text-[#FF4400] font-mono text-xs mb-6 uppercase tracking-widest">
              The Firewall for Manufacturing
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              STOP THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">THRASH.</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mb-10 leading-relaxed font-light">
              Ambiguity is liability. Interlock is an AI-driven compiler that audits Tech Packs against factory physics before they ever hit the floor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 bg-[#FF4400] text-white px-8 py-4 font-mono font-bold hover:bg-white hover:text-black transition-all group">
                START AUDIT
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center justify-center gap-3 border border-white/20 text-gray-300 px-8 py-4 font-mono hover:border-white transition-colors">
                VIEW ARCHITECTURE
              </button>
            </div>
          </div>

          {/* Interactive Simulation Console */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4400] to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-lg p-1 font-mono text-sm shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0F0F0F]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
                </div>
                <div className="text-xs text-gray-500">ambiguity_hunter_v1.sh</div>
              </div>

              <div className="p-6 min-h-[400px] flex flex-col">
                <div className="flex-1 space-y-2 font-mono text-xs md:text-sm">
                  {auditLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`transition-all duration-300 flex gap-3 ${index > auditStep ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
                    >
                      <span className="text-gray-600 w-6">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className={`
                        ${log.type === 'process' ? 'text-blue-400' : ''}
                        ${log.type === 'warn' ? 'text-yellow-400' : ''}
                        ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'action' ? 'text-[#FF4400]' : ''}
                        ${log.type === 'info' ? 'text-gray-300' : ''}
                      `}>
                        {log.type === 'process' && '> '}
                        {log.type === 'error' && '! '}
                        {log.type === 'success' && '✓ '}
                        {log.text}
                      </span>
                    </div>
                  ))}
                  {isAuditing && auditStep < auditLogs.length && (
                    <div className="animate-pulse text-[#FF4400]">_</div>
                  )}
                  {!isAuditing && auditStep === 0 && (
                    <div className="text-gray-500 mt-4">Waiting for artifact input...</div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SECURITY: HIGH</span>
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CORES: 8</span>
                  </div>
                  <button
                    onClick={startAudit}
                    disabled={isAuditing}
                    className={`text-xs font-bold px-4 py-2 border ${isAuditing ? 'border-gray-700 text-gray-700 cursor-not-allowed' : 'border-[#FF4400] text-[#FF4400] hover:bg-[#FF4400] hover:text-white'}`}
                  >
                    {isAuditing ? 'RUNNING...' : 'RUN SIMULATION'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-24 px-6 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">

            <div className="group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#FF4400] transition-colors">
                <ScanLine className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-mono">AMBIGUITY HUNTER</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We don't just store files; we read them. Our Agent parses conflicting signals between images and text, forcing resolution before manufacturing begins.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#FF4400] transition-colors">
                <Binary className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-mono">DETERMINISTIC RENDER</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Zero hallucination. We render actual machine files (.dst, .dxf) directly to the canvas. What you see is mathematically what executes.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#FF4400] transition-colors">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-mono">THE GOLDEN MASTER</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Once validated against factory rules, the Tech Pack is locked into a read-only state. This object becomes the single source of truth for liability.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Two Player Game Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A PROTOCOL FOR TWO PLAYERS</h2>
            <div className="w-24 h-1 bg-[#FF4400] mx-auto"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-0 md:gap-8">
            {/* Manufacturer Side */}
            <div className={`flex-1 border p-8 transition-all duration-500 cursor-pointer ${activeTab === 'mfg' ? 'border-[#FF4400] bg-[#FF4400]/5' : 'border-white/10 bg-transparent hover:border-white/30'}`} onClick={() => setActiveTab('mfg')}>
              <div className="flex justify-between items-start mb-6">
                <div className="font-mono text-xs text-[#FF4400] tracking-widest uppercase">Player 1</div>
                <Database className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">THE MANUFACTURER</h3>
              <p className="text-gray-400 mb-8 text-sm">Drowning in bad data.</p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4400] mt-0.5 shrink-0" />
                  <span>Define constraints (Physics, Stock, Machinery) via low-code YAML.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4400] mt-0.5 shrink-0" />
                  <span>Auto-reject non-compliant specs instantly.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4400] mt-0.5 shrink-0" />
                  <span>Receive only compile-ready binary files.</span>
                </li>
              </ul>
            </div>

            {/* Middle Connector */}
            <div className="hidden md:flex flex-col items-center justify-center relative">
              <div className="w-px h-full bg-white/10 absolute top-0 bottom-0 left-1/2"></div>
              <div className="z-10 bg-[#050505] p-2 border border-white/20 rounded-full">
                <Activity className="w-6 h-6 text-[#FF4400]" />
              </div>
            </div>

            {/* Brand Side */}
            <div className={`flex-1 border p-8 transition-all duration-500 cursor-pointer ${activeTab === 'brand' ? 'border-[#FF4400] bg-[#FF4400]/5' : 'border-white/10 bg-transparent hover:border-white/30'}`} onClick={() => setActiveTab('brand')}>
              <div className="flex justify-between items-start mb-6">
                <div className="font-mono text-xs text-[#FF4400] tracking-widest uppercase">Player 2</div>
                <Layers className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">THE BRAND</h3>
              <p className="text-gray-400 mb-8 text-sm">Paying the ambiguity tax.</p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4400] mt-0.5 shrink-0" />
                  <span>Upload unstructured creative (PDF, AI, JPG).</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4400] mt-0.5 shrink-0" />
                  <span>Get instant feedback on feasibility & cost impact.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4400] mt-0.5 shrink-0" />
                  <span>Sign off on a "Golden Master" that guarantees output.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Spec Strip */}
      <section className="py-12 border-y border-white/10 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between gap-8 text-gray-500 font-mono text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>PYTHON LANGGRAPH AGENT</span>
          </div>
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            <span>KNOWLEDGE OBJECT SCHEMA</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>VECTOR STORE RETRIEVAL</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>IMMUTABLE AUDIT LOGS</span>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">READY TO COMPILE?</h2>
          <p className="text-gray-400 mb-12 max-w-lg mx-auto">
            Join the beta. We are onboarding high-volume manufacturers and technical apparel brands.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-[#FF4400] text-white px-8 py-4 font-mono font-bold hover:bg-white hover:text-black transition-all">
              REQUEST ACCESS
            </button>
            <button className="border border-white/20 text-white px-8 py-4 font-mono font-bold hover:bg-white/10 transition-all">
              READ THE DOCS
            </button>
          </div>
          <div className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center text-xs text-gray-600 font-mono">
            <div>© 2026 INTERLOCK SYSTEMS INC.</div>
            <div className="flex gap-4">
              <span className="hover:text-[#FF4400] cursor-pointer">PRIVACY</span>
              <span className="hover:text-[#FF4400] cursor-pointer">TERMS</span>
              <span className="hover:text-[#FF4400] cursor-pointer">STATUS: ONLINE</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default InterlockLanding;
