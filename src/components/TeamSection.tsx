
const team = [
  { name: "Tyler Mangini", role: "Co-Founder", image: "/images/team/tyler.png" },
  { name: "Arshaan Ali", role: "Co-Founder", image: "/images/team/arshaan.png" },
  { name: "Nathan Alam", role: "Co-Founder", image: "/images/team/nathan.png" },
];

const TeamSection = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="container mx-auto max-w-4xl">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 text-center uppercase">
          Founding Team
        </p>
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          Architects of the new standard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {team.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center group"
            >
              <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors duration-500">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <h3 className="font-mono text-sm font-semibold tracking-wider text-foreground">
                {member.name}
              </h3>
              <p className="font-mono text-xs text-muted-foreground tracking-wider mt-1">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
