import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative py-32 px-6 border-t border-border/50">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to sync?
        </h2>
        <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
          Stop interpreting. Start manufacturing.
        </p>
        <Button
            className="font-mono text-sm tracking-wider px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate('/login?mode=register')}
        >
          INITIALIZE TRANSFER
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
