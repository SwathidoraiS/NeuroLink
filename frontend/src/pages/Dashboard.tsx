import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useToast } from "@/hooks/use-toast";
import { Brain, BarChart, Smile, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface User {
  name: string;
  email: string;
}

interface EmotionSummary {
  stability: string;
  dominant_emotion: string | null;
  average_intensity: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [emotionSummary, setEmotionSummary] = useState<EmotionSummary | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🎯 Fetch profile + emotion data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [profileRes, emotionRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/emotions/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const emotionData = await emotionRes.json();

        if (!profileRes.ok) throw new Error(profileData.error || "Failed to load user");
        if (!emotionRes.ok) throw new Error(emotionData.error || "Failed to load emotions");

        setUser(profileData);
        setEmotionSummary(emotionData);
      } catch (error: any) {
        toast({
          title: "Error Loading Dashboard",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [toast]);

  // 🌤️ Define mood visuals
  const moodVisuals: Record<string, { emoji: string; color: string }> = {
    Stable: { emoji: "🌈", color: "text-green-400" },
    Balanced: { emoji: "🌤️", color: "text-yellow-400" },
    Fluctuating: { emoji: "🌪️", color: "text-red-400" },
    "No data": { emoji: "💤", color: "text-gray-400" },
  };

  const mood = emotionSummary?.stability || "No data";
  const moodVisual = moodVisuals[mood];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">
            Welcome Back,{" "}
            <span className="text-gradient">
              {user ? user.name : "Cognitive Explorer"}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Here’s a quick overview of your cognitive journey 🌐
          </p>
        </div>

        {/* 🧠 Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-white/10 p-6 text-center hover-scale">
            <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Cognitive Performance</h3>
            <p className="text-muted-foreground">82% Optimization</p>
          </Card>

          {/* 🌤️ Dynamic Emotion Stability */}
          <motion.div
            className="glass-card border-white/10 p-6 text-center hover-scale"
            animate={{ scale: [1, 1.02, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Smile className={`w-8 h-8 mx-auto mb-3 ${moodVisual.color}`} />
            <h3 className="text-lg font-semibold">Emotional Stability</h3>
            <p className="text-muted-foreground">
              {moodVisual.emoji} {mood}
              {emotionSummary?.dominant_emotion && (
                <>
                  {" • "}
                  <span className="font-medium text-foreground">
                    {emotionSummary.dominant_emotion}
                  </span>
                </>
              )}
            </p>
          </motion.div>

          <Card className="glass-card border-white/10 p-6 text-center hover-scale">
            <Activity className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Focus Level</h3>
            <p className="text-muted-foreground">High • 76%</p>
          </Card>
        </div>

        {/* ⚙️ Action Buttons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
            <BarChart className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">View Profile</h3>
            <Button onClick={() => navigate("/cognitive-profile")} variant="default" className="bg-primary hover:bg-primary/90">
              Go
            </Button>
          </Card>

          <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
            <Smile className="w-8 h-8 text-secondary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Emotion Tracker</h3>
            <Button onClick={() => navigate("/emotion-tracker")} variant="default" className="bg-secondary hover:bg-secondary/90">
              Explore
            </Button>
          </Card>

          <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
            <BarChart className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-lg font-semibold mb-2">Decision Lab</h3>
            <Button onClick={() => navigate("/decision-lab")} variant="default" className="bg-accent hover:bg-accent/90">
              Analyze
            </Button>
          </Card>

          <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
            <Settings className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Twin Settings</h3>
            <Button onClick={() => navigate("/twin-settings")} variant="default" className="bg-primary hover:bg-primary/90">
              Configure
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
