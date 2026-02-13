import React from 'react';
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import TeamSection from "../components/TeamSection";
import CTASection from "../components/CTASection";

export function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <TeamSection />
            <CTASection />
            <footer className="border-t border-border/50 py-8 px-6">
                <div className="container mx-auto flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground tracking-wider">
                        © 2025 INTERLOCK SYSTEMS
                    </span>
                    <span className="font-mono text-xs text-muted-foreground tracking-wider">
                        Built for regulated manufacturing
                    </span>
                </div>
            </footer>
        </div>
    );
}
