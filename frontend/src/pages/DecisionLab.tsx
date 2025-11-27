import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "../config";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const DecisionLab = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/decisions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data || []);
    } catch (e) {
      // ignore silently
    }
  };

  const handleAnalyze = async () => {
    if (!question.trim()) {
      toast({ title: "Enter a question", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/decision/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "AI failed", variant: "destructive" });
        setLoading(false);
        return;
      }

      setResult(data);
      toast({ title: "Decision Generated" });
      setQuestion("");
      fetchHistory();
    } catch (err: any) {
      toast({ title: "Network error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-6">Decision Lab — Cognitive Mode</h1>

        {/* Input */}
        <Card className="p-6 mb-6">
          <label className="block mb-2 font-medium">Ask your question</label>
          <Input
            value={question}
            onChange={(e) => setQuestion((e.target as HTMLInputElement).value)}
            placeholder="e.g. Should I take the internship offer or wait for campus placements?"
          />
          <div className="flex gap-3 mt-4">
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Thinking..." : "Analyze Decision"}
            </Button>
            <Button variant="ghost" onClick={() => { setQuestion(""); setResult(null); }}>
              Clear
            </Button>
          </div>
        </Card>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="p-6 mb-4">
              <h2 className="text-xl font-semibold mb-2">Final Decision</h2>
              <p className="mb-3 text-muted-foreground">{result.final_decision}</p>

              <h3 className="text-sm font-medium text-muted-foreground">Rationale</h3>
              <p className="mb-3">{result.rationale}</p>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold">{result.confidence_score}%</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className="text-lg font-bold">{result.risk_level}</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-xs text-muted-foreground">Bias</p>
                  <p className="text-lg font-bold">{result.bias_detected || "None"}</p>
                </div>
              </div>

              <h3 className="text-sm font-medium text-muted-foreground">Cognitive Alignment</h3>
              <p className="mb-2">{result.cognitive_alignment}</p>

              <h3 className="text-sm font-medium text-muted-foreground">Emotional Influence</h3>
              <p className="mb-2">{result.emotional_influence}</p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Short Term Effect</h4>
                  <p>{result.short_term_effect}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Long Term Effect</h4>
                  <p>{result.long_term_effect}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Action Steps</h4>
                <ol className="list-decimal ml-5">
                  {result.action_steps && result.action_steps.length > 0 ? (
                    result.action_steps.map((s: string, i: number) => <li key={i} className="mb-1">{s}</li>)
                  ) : (
                    <li>No specific steps provided.</li>
                  )}
                </ol>
              </div>
            </Card>
          </motion.div>
        )}

        {/* History */}
        <Card className="p-6">
          <h2 className="text-2xl font-heading font-semibold mb-4">Past Decisions</h2>
          <div className="space-y-4">
            {history.length === 0 && <p className="text-muted-foreground">No past decisions yet.</p>}
            {history.map((h) => (
              <div key={h.id} className="p-4 bg-white/5 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{h.question}</p>
                    <p className="text-xs text-muted-foreground">{h.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{h.result?.confidence_score ?? "-" }%</p>
                    <p className="text-xs text-muted-foreground">{h.result?.risk_level ?? "-" }</p>
                  </div>
                </div>

                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">{h.result?.final_decision ?? ""}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default DecisionLab;
