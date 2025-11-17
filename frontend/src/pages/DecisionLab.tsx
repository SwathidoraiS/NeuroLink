import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "../config";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Lightbulb, ThumbsUp, ThumbsDown, Target } from "lucide-react";

const DecisionLab = () => {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeDecision = async () => {
    if (!question.trim()) {
      toast({
        title: "Enter a question",
        description: "Ask something like: Should I choose AI or Cloud?",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/decision/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze");

      setResult(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-heading font-bold mb-6 text-center">
          Decision <span className="text-gradient">Lab</span>
        </h1>
        <p className="text-muted-foreground text-center mb-10">
          Ask your academic or career doubts – Get clear pros, cons & a recommendation.
        </p>

        {/* Input */}
        <Card className="glass-card border-white/10 p-6 mb-8">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="glass mb-4"
          />
          <Button
            onClick={analyzeDecision}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Decision"}
          </Button>
        </Card>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="glass-card border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" /> Answer
              </h3>
              <p className="text-muted-foreground">{result.answer}</p>
            </Card>

            <Card className="glass-card border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <ThumbsUp className="text-green-400" /> Pros
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.pros.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Card>

            <Card className="glass-card border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <ThumbsDown className="text-red-400" /> Cons
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.cons.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </Card>

            <Card className="glass-card border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Target className="text-primary" /> Recommendation
              </h3>
              <p className="font-medium">{result.recommendation}</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DecisionLab;
