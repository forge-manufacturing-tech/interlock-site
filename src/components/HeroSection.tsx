import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image replacement */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        {/* Add a subtle grid or gradient to make it look less empty */}
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <p className="font-mono text-xs tracking-[0.4em] text-primary mb-8 uppercase animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          The Software-Enabled Solution
        </p>
        <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
          <span className="text-foreground">ACCELERATE</span>
          <br />
          <span className="text-gradient-primary">TECH TRANSFER</span>
        </h1>
        <p className="max-w-lg mx-auto text-muted-foreground text-lg mb-12 animate-fade-up opacity-0" style={{ animationDelay: "0.6s" }}>
          Bridging the gap between engineering design and manufacturing production.
        </p>
        <div className="flex items-center justify-center gap-4 animate-fade-up opacity-0" style={{ animationDelay: "0.8s" }}>
          <Button
            className="font-mono text-xs tracking-wider px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate('/login?mode=register')}
          >
            INITIALIZE TRANSFER
          </Button>
          <Button
            variant="outline"
            className="font-mono text-xs tracking-wider px-8 py-6 border-border text-foreground hover:bg-secondary"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            LEARN MORE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
