import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, Target, Zap, Award, AlertCircle } from "lucide-react";

const InsightReports = () => {
  const reports = [
    {
      title: "Decision Consistency",
      score: 87,
      trend: "+5%",
      icon: Target,
      color: "primary",
      description: "Your decision-making patterns show high consistency across similar scenarios.",
    },
    {
      title: "Risk Level",
      score: 62,
      trend: "-3%",
      icon: AlertCircle,
      color: "accent",
      description: "Moderate risk tolerance with a slight decrease in risk-taking behavior.",
    },
    {
      title: "Cognitive Accuracy",
      score: 91,
      trend: "+8%",
      icon: Brain,
      color: "primary",
      description: "Exceptional accuracy in pattern recognition and problem-solving tasks.",
    },
    {
      title: "Processing Speed",
      score: 78,
      trend: "+2%",
      icon: Zap,
      color: "secondary",
      description: "Above-average cognitive processing speed with steady improvement.",
    },
  ];

  const weeklyInsights = [
    {
      day: "Monday",
      focus: 85,
      stress: 35,
      productivity: 88,
    },
    {
      day: "Tuesday",
      focus: 90,
      stress: 28,
      productivity: 92,
    },
    {
      day: "Wednesday",
      focus: 75,
      stress: 45,
      productivity: 78,
    },
    {
      day: "Thursday",
      focus: 92,
      stress: 22,
      productivity: 95,
    },
    {
      day: "Friday",
      focus: 88,
      stress: 30,
      productivity: 90,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gradient">Insight Reports</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-generated detailed analysis of your cognitive performance and patterns
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reports.map((report, index) => (
            <Card
              key={index}
              className="glass-card border-white/10 hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${report.color}/20 flex items-center justify-center`}>
                  <report.icon className={`h-6 w-6 text-${report.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gradient">{report.score}%</div>
                  <div className="text-sm text-primary font-semibold">{report.trend}</div>
                </div>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </Card>
          ))}
        </div>

        {/* Weekly Performance */}
        <Card className="glass-card border-white/10 p-8 mb-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Weekly Performance Overview
          </h3>

          <div className="space-y-6">
            {weeklyInsights.map((day, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium w-24">{day.day}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-primary">Focus: {day.focus}%</span>
                    <span className="text-accent">Stress: {day.stress}%</span>
                    <span className="text-secondary">Productivity: {day.productivity}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80"
                      style={{ width: `${day.focus}%` }}
                    />
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent/80"
                      style={{ width: `${day.stress}%` }}
                    />
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-secondary/80"
                      style={{ width: `${day.productivity}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Summary */}
        <Card className="glass-card border-white/10 p-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-8 w-8 text-primary animate-glow" />
            <h3 className="text-2xl font-heading font-semibold">AI-Generated Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div className="glass p-6 rounded-xl border border-primary/30">
              <h4 className="font-semibold mb-3 text-primary">Peak Performance Patterns</h4>
              <p className="text-sm text-muted-foreground">
                Your cognitive twin has identified that you perform optimally on Tuesdays and Thursdays, 
                with focus levels consistently above 90%. These days align with your natural energy cycles 
                and show minimal stress indicators.
              </p>
            </div>

            <div className="glass p-6 rounded-xl border border-accent/30">
              <h4 className="font-semibold mb-3 text-accent">Areas for Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Wednesday shows a notable dip in performance metrics. Consider scheduling lighter tasks 
                or implementing stress-reduction techniques mid-week. Your twin suggests incorporating 
                brief cognitive breaks during this period.
              </p>
            </div>

            <div className="glass p-6 rounded-xl border border-secondary/30">
              <h4 className="font-semibold mb-3 text-secondary">Cognitive Growth Trajectory</h4>
              <p className="text-sm text-muted-foreground">
                Overall upward trend in cognitive accuracy (+8%) and decision consistency (+5%) over 
                the past month. Your twin has adapted to your patterns and is providing increasingly 
                personalized insights. Continue current practices for sustained improvement.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InsightReports;
