import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // ✅ Check auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsAuthenticated(true);
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name || "User");
      } catch {
        setUserName("User");
      }
    } else {
      setIsAuthenticated(false);
      setUserName(null);
    }
  }, [location.pathname]); // Recheck when route changes

  const publicNavLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/features", label: "Features" },
    { to: "/demo", label: "Demo" },
    { to: "/contact", label: "Contact" },
  ];

  const privateNavLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/cognitive-profile", label: "Profile" },
    { to: "/decision-lab", label: "Decision Lab" },
    { to: "/emotion-tracker", label: "Emotions" },
    { to: "/Courses" , label: "Courses"},
    { to: "/twin-settings", label: "Settings" },

  ];

  const navLinks = isAuthenticated ? privateNavLinks : publicNavLinks;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserName(null);
    toast({
      title: "Logged Out",
      description: "You’ve been successfully logged out.",
    });
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary animate-glow" />
              <div className="absolute inset-0 blur-xl bg-primary/50 group-hover:bg-primary/70 transition-all" />
            </div>
            <span className="text-2xl font-heading font-bold text-gradient">
              NeuroLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isActive(link.to) ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    isActive(link.to) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/20 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="default"
                className="bg-primary hover:bg-primary/90 glow-primary"
              >
                <Link to="/auth">Login / Sign Up</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-medium transition-colors ${
                  isActive(link.to) ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/20 flex items-center gap-2 justify-center"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                asChild
                variant="default"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  Login / Sign Up
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
