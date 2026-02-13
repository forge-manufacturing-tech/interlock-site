import { FileText, Cpu, Package } from "lucide-react";

const features = [
  {
    icon: FileText,
    label: "Ingest",
    description: "CAD files, engineering notes, BOMs — we understand your existing data.",
  },
  {
    icon: Cpu,
    label: "Structure",
    description: "An integrated knowledge graph that connects every part, spec, and requirement.",
  },
  {
    icon: Package,
    label: "Generate",
    description: "Work instructions, regulatory docs, and ERP-ready outputs — automatically.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 px-6 border-t border-border/50">
      <div className="container mx-auto max-w-5xl">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 text-center uppercase">
          How It Works
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-center mb-20 text-foreground">
          From documents to production
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.label}
              className="relative p-8 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-500 group"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-foreground mb-3 tracking-wide">
                {feature.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
