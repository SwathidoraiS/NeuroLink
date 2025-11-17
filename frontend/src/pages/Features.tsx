import { Brain, TrendingUp, Heart, Lightbulb, Target, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Decision Insight Engine",
      description: "Analyze decision patterns and predict outcomes based on your cognitive model",
      gradient: "from-primary to-secondary",
    },
    {
      icon: TrendingUp,
      title: "Behavioral Analysis",
      description: "Visualize and understand your mental patterns, habits, and cognitive trends",
      gradient: "from-secondary to-accent",
    },
    {
      icon: BarChart3,
      title: "Performance Predictor",
      description: "Forecast your performance in various scenarios using historical cognitive data",
      gradient: "from-accent to-primary",
    },
    {
      icon: Heart,
      title: "Emotion Mapper",
      description: "Decode your emotional landscape and understand emotional patterns over time",
      gradient: "from-primary to-accent",
    },
    {
      icon: Lightbulb,
      title: "Cognitive Simulation Lab",
      description: "Run thought experiments and explore alternative scenarios with your twin",
      gradient: "from-secondary to-primary",
    },
    {
      icon: Target,
      title: "Goal Alignment System",
      description: "Align your daily actions with long-term goals through cognitive insights",
      gradient: "from-accent to-secondary",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            Powerful <span className="text-gradient">Features</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the full potential of your cognitive digital twin with advanced AI-powered features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card hover-scale group cursor-pointer border-white/10 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div
                  className={`absolute inset-0 blur-2xl bg-gradient-to-br ${feature.gradient} opacity-20 group-hover:opacity-40 transition-opacity`}
                />
              </div>

              <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Real-time <span className="text-gradient">Cognitive Insights</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your cognitive twin continuously learns from your interactions, decisions, and patterns.
              Every choice you make refines its understanding of your unique cognitive framework.
            </p>
            <div className="space-y-4">
              {[
                "Live cognitive state monitoring",
                "Predictive decision analysis",
                "Emotional intelligence tracking",
                "Personalized improvement recommendations",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 glass p-4 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary glow-primary" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="glass-card p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cognitive Balance</span>
                  <span className="text-primary font-semibold">87%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: "87%" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Decision Accuracy</span>
                  <span className="text-secondary font-semibold">92%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Emotional Insight</span>
                  <span className="text-accent font-semibold">95%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                    style={{ width: "95%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
