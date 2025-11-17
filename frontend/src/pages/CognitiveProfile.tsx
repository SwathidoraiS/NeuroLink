import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Eye, Shield, Lightbulb, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "../config";

interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  department?: string;
  year?: string;
  learning_styles?: string[];
  subjects?: string[];
  college?: string;
  phone?: string;
  enrollment_number?: string;
  dob?: string;
  created_at?: string;
}

const CognitiveProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load profile");

        setProfile(data);
      } catch (error: any) {
        toast({ title: "Error Loading Profile", description: error.message, variant: "destructive" });
      }
    };

    fetchProfile();
  }, [toast]);

  const metrics = [
    { icon: Brain, title: "Cognitive Style", value: "Analytical-Creative Hybrid" },
    { icon: Zap, title: "Processing Speed", value: "Above Average" },
    { icon: Eye, title: "Pattern Recognition", value: "Exceptional" },
    { icon: Shield, title: "Stress Resilience", value: "High" },
    { icon: Lightbulb, title: "Problem Solving", value: "Advanced" },
    { icon: Target, title: "Goal Orientation", value: "Strong" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
            {profile?.name ? `Welcome, ` : "Your"}{" "}
            <span className="text-gradient">{profile?.name ?? "Cognitive Explorer"}</span>
          </h1>
          <p className="text-muted-foreground">
            {profile?.department ? `${profile.department} • Year ${profile.year || "N/A"}` : "Complete your profile in Settings."}
          </p>
          {profile?.email && <p className="text-sm text-muted-foreground mt-2">{profile.email}</p>}
        </div>

        {/* Profile quick cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {metrics.map((m, i) => (
            <Card key={i} className="glass-card p-6">
              <m.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-sm text-muted-foreground mb-1">{m.title}</h3>
              <p className="text-lg font-semibold">{m.value}</p>
            </Card>
          ))}
        </div>

        {/* Learning Styles and Subjects */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Learning Styles</h3>
            {profile?.learning_styles && profile.learning_styles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.learning_styles.map((ls, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                    {ls}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No learning styles set. Complete in Settings.</p>
            )}
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Subjects of Interest</h3>
            {profile?.subjects && profile.subjects.length > 0 ? (
              <ul className="space-y-2">
                {profile.subjects.map((s, i) => (
                  <li key={i} className="text-sm text-foreground">• {s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No subjects set. Add them in Settings.</p>
            )}
          </Card>
        </div>

        {/* Optional Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="glass-card p-4">
            <h4 className="text-sm text-muted-foreground">College</h4>
            <p className="font-medium">{profile?.college ?? "Not provided"}</p>
          </Card>

          <Card className="glass-card p-4">
            <h4 className="text-sm text-muted-foreground">Enrollment</h4>
            <p className="font-medium">{profile?.enrollment_number ?? "Not provided"}</p>
          </Card>

          <Card className="glass-card p-4">
            <h4 className="text-sm text-muted-foreground">DOB</h4>
            <p className="font-medium">{profile?.dob ?? "Not provided"}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CognitiveProfile;
