import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "../config";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Frown,
  Meh,
  Heart,
  Brain,
  Cloud,
  Bot,
} from "lucide-react";

const emotionOptions = [
  { name: "Joy", color: "from-yellow-400 via-amber-500 to-orange-500", icon: Smile },
  { name: "Calm", color: "from-sky-400 via-cyan-500 to-blue-500", icon: Cloud },
  { name: "Focused", color: "from-indigo-400 via-purple-500 to-fuchsia-500", icon: Brain },
  { name: "Love", color: "from-pink-400 via-rose-500 to-red-500", icon: Heart },
  { name: "Sad", color: "from-blue-300 via-indigo-400 to-purple-400", icon: Frown },
  { name: "Neutral", color: "from-gray-400 via-slate-500 to-gray-600", icon: Meh },
];

const EmotionTracker = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [emotions, setEmotions] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<any | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const { toast } = useToast();

  const token = localStorage.getItem("token");

  // ======================================
  // 1️⃣ Fetch Emotional + Cognitive Trends
  // ======================================
  const fetchInsights = () => {
    fetch(`${API_BASE_URL}/api/emotions/insights`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch(() => {});
  };

  // ======================================
  // 2️⃣ Fetch Emotion History
  // ======================================
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/emotions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setEmotions(data));

    fetchInsights();
  }, []);

  // ======================================
  // 3️⃣ Handle Emotion Submission
  // ======================================
  const handleSubmit = async () => {
    if (!selectedEmotion) {
      toast({
        title: "Select Emotion",
        description: "Please choose an emotion before recording.",
        variant: "destructive",
      });
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/emotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emotion: selectedEmotion, intensity }),
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: `${selectedEmotion} logged!`,
        description: "Your emotional state has been recorded.",
      });

      // Add new emotion to list
      setEmotions([
        { emotion: selectedEmotion, intensity, timestamp: new Date().toISOString(), ...data.ai },
        ...emotions,
      ]);

      // Show AI interpretation
      setAiInsight(data.ai);

      // Refresh trends
      fetchInsights();

      setSelectedEmotion(null);
      setIntensity(50);
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  // Gradient background based on emotion
  const currentGradient =
    emotionOptions.find((e) => e.name === selectedEmotion)?.color ||
    "from-primary/10 via-secondary/10 to-accent/10";

  return (
    <motion.div
      className={`min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-start bg-gradient-to-br ${currentGradient} transition-all duration-500`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-4xl font-heading font-bold mb-10 text-white text-center">
        Emotional <span className="text-gradient">Pulse Tracker</span>
      </h1>

      {/* ============================== */}
      {/*        Emotion Selector        */}
      {/* ============================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-3xl w-full">
        {emotionOptions.map((emotion) => (
          <motion.div
            key={emotion.name}
            className={`cursor-pointer p-6 rounded-2xl text-center glass-card border-white/20 transition-all hover:scale-105 relative ${
              selectedEmotion === emotion.name ? "ring-2 ring-white shadow-lg scale-105" : "opacity-90"
            }`}
            onClick={() => setSelectedEmotion(emotion.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <emotion.icon className="h-8 w-8 mx-auto mb-3 text-white/90" />
            <p className="font-semibold text-lg">{emotion.name}</p>
            <div
              className={`absolute inset-0 bg-gradient-to-r ${emotion.color} opacity-20 rounded-2xl blur-lg`}
            />
          </motion.div>
        ))}
      </div>

      {/* ============================== */}
      {/*       Intensity Controller     */}
      {/* ============================== */}
      <Card className="p-6 glass-card border-white/10 mb-8 w-full max-w-md text-center">
        <h3 className="text-lg font-semibold mb-4">Emotion Intensity: {intensity}%</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <Button
          onClick={handleSubmit}
          className="mt-4 bg-primary hover:bg-primary/90 glow-primary w-full"
        >
          Record Emotion
        </Button>
      </Card>

      {/* ============================== */}
      {/*       AI Insight (Chat UI)     */}
      {/* ============================== */}
      {aiInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-8"
        >
          <Card className="p-6 glass-card border-white/10 bg-white/10">
            <div className="flex gap-3 mb-3">
              <Bot className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-xl text-white">Twin Insight</h2>
            </div>

            <p className="text-sm text-gray-200 mb-3">{aiInsight.interpretation}</p>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <Card className="p-3 text-center bg-black/20 border-white/10">
                <p className="text-xs text-white/50">Focus</p>
                <p className="text-xl font-bold text-primary">{aiInsight.focus_score}</p>
              </Card>

              <Card className="p-3 text-center bg-black/20 border-white/10">
                <p className="text-xs text-white/50">Stress</p>
                <p className="text-xl font-bold text-red-400">{aiInsight.stress_score}</p>
              </Card>

              <Card className="p-3 text-center bg-black/20 border-white/10">
                <p className="text-xs text-white/50">Motivation</p>
                <p className="text-xl font-bold text-green-400">{aiInsight.motivation_score}</p>
              </Card>
            </div>

            <p className="mt-4 text-sm text-primary">{aiInsight.recommendation}</p>
          </Card>
        </motion.div>
      )}

      {/* ============================== */}
      {/*       Trend Summary Cards      */}
      {/* ============================== */}
      {insights && (
        <div className="w-full max-w-3xl grid md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 bg-white/10 border-white/10 text-center">
            <p className="text-sm text-gray-300">Dominant Emotion</p>
            <p className="text-xl font-bold text-white">{insights.dominant_emotion}</p>
          </Card>
          <Card className="p-4 bg-white/10 border-white/10 text-center">
            <p className="text-sm text-gray-300">Stability</p>
            <p className="text-xl font-bold text-white">{insights.stability}</p>
          </Card>
          <Card className="p-4 bg-white/10 border-white/10 text-center">
            <p className="text-sm text-gray-300">Avg Intensity</p>
            <p className="text-xl font-bold text-white">{insights.average_intensity}</p>
          </Card>
        </div>
      )}

      {/* ============================== */}
      {/*     Emotion History List       */}
      {/* ============================== */}
      <AnimatePresence>
        {emotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mt-10"
          >
            <Card className="p-6 glass-card border-white/10">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-white">
                Recent Emotional Waves 🌙
              </h2>
              <ul className="space-y-3">
                {emotions.map((e: any, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white/5 p-3 rounded-xl text-sm"
                  >
                    <span className="font-medium text-white/90">{e.emotion}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-primary">{e.intensity}%</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(e.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmotionTracker;
