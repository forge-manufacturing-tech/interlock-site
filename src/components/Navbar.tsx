import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <span className="font-mono text-lg font-bold tracking-widest text-primary cursor-pointer" onClick={() => navigate('/')}>
          INTERLOCK
        </span>
        <div className="flex gap-4">
             <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/login')}
            >
              LOG IN
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs tracking-wider border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => navigate('/login?mode=register')}
            >
              GET STARTED
            </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
