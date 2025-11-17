import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, Heart } from "lucide-react";

const Demo = () => {
  const [activeDemo, setActiveDemo] = useState<"decision" | "emotion">("decision");

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            Meet Your Twin <span className="text-gradient">In Action</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience how your cognitive digital twin analyzes decisions and emotions in real-time
          </p>
        </div>

        {/* Demo Type Selector */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            onClick={() => setActiveDemo("decision")}
            variant={activeDemo === "decision" ? "default" : "outline"}
            className={activeDemo === "decision" ? "bg-primary glow-primary" : "border-primary/50"}
          >
            <Brain className="mr-2 h-4 w-4" />
            Decision Analysis
          </Button>
          <Button
            onClick={() => setActiveDemo("emotion")}
            variant={activeDemo === "emotion" ? "default" : "outline"}
            className={activeDemo === "emotion" ? "bg-secondary glow-secondary" : "border-secondary/50"}
          >
            <Heart className="mr-2 h-4 w-4" />
            Emotion Mapping
          </Button>
        </div>

        {/* Decision Demo */}
        {activeDemo === "decision" && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card className="glass-card border-white/10 p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-semibold mb-2">Decision Scenario</h3>
                    <p className="text-muted-foreground mb-4">
                      Should I accept the new job offer in a different city?
                    </p>

                    <div className="space-y-4">
                      <div className="glass p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">Cognitive Analysis</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on your past decisions and career patterns, you tend to prioritize
                          growth opportunities over stability. Your cognitive twin predicts 78%
                          satisfaction with this change.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-xl">
                          <h4 className="font-semibold text-sm mb-2 text-primary">Pros Alignment</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Career advancement (High match)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              New experiences (High match)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Learning opportunities (High match)
                            </li>
                          </ul>
                        </div>

                        <div className="glass p-4 rounded-xl">
                          <h4 className="font-semibold text-sm mb-2 text-accent">Concerns Analysis</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              Distance from family (Medium concern)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              Relocation stress (Low concern)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              Financial adjustment (Low concern)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="glass p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">Twin Recommendation</h4>
                            <p className="text-sm text-muted-foreground">
                              Your cognitive patterns suggest you thrive in growth-oriented environments.
                              Consider a trial period or negotiating remote work options to balance both priorities.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Emotion Demo */}
        {activeDemo === "emotion" && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card className="glass-card border-white/10 p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-semibold mb-2">Emotion Analysis</h3>
                    <p className="text-muted-foreground mb-4">
                      Current emotional state and patterns detected
                    </p>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="glass p-4 rounded-xl text-center">
                          <div className="text-3xl font-bold text-primary mb-1">78%</div>
                          <div className="text-sm text-muted-foreground">Optimism</div>
                        </div>
                        <div className="glass p-4 rounded-xl text-center">
                          <div className="text-3xl font-bold text-secondary mb-1">65%</div>
                          <div className="text-sm text-muted-foreground">Focus</div>
                        </div>
                        <div className="glass p-4 rounded-xl text-center">
                          <div className="text-3xl font-bold text-accent mb-1">82%</div>
                          <div className="text-sm text-muted-foreground">Motivation</div>
                        </div>
                      </div>

                      <div className="glass p-4 rounded-xl">
                        <h4 className="font-semibold text-sm mb-4">Weekly Emotion Timeline</h4>
                        <div className="space-y-3">
                          {[
                            { day: "Monday", level: 70, color: "primary" },
                            { day: "Tuesday", level: 85, color: "secondary" },
                            { day: "Wednesday", level: 65, color: "accent" },
                            { day: "Thursday", level: 90, color: "primary" },
                            { day: "Friday", level: 95, color: "secondary" },
                          ].map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{item.day}</span>
                                <span className="text-foreground font-medium">{item.level}%</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r from-${item.color} to-${item.color}`}
                                  style={{ width: `${item.level}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">Emotional Insight</h4>
                            <p className="text-sm text-muted-foreground">
                              Your emotional patterns show strong resilience this week. Mid-week dips
                              are normal and align with your energy cycles. Consider scheduling important
                              tasks during your peak emotional states (Thursdays and Fridays).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;
