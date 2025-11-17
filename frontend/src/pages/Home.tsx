import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Sparkles, TrendingUp } from "lucide-react";
import heroNeuralImage from "@/assets/hero-neural.jpg";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroNeuralImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background z-0" />

        <div className="container mx-auto px-4 z-10 text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 glass-card mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Next-Generation Cognitive AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-glow">
              <span className="text-gradient">NeuroLink</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-3xl mx-auto">
              Your Cognitive Digital Twin for Smarter Living
            </p>

            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Experience the future of human-AI synergy through your own cognitive digital twin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 glow-primary text-base px-8"
              >
                <Link to="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 text-base px-8"
              >
                <Link to="/demo">Explore Twin</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              <span className="text-gradient">Cognitive Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mirror your mind, amplify your decisions, understand yourself deeper
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Decision Insight",
                description: "Predict outcomes and guide smarter decisions with AI-powered analysis",
              },
              {
                icon: TrendingUp,
                title: "Behavioral Analysis",
                description: "Understand and visualize your mental patterns and cognitive trends",
              },
              {
                icon: Sparkles,
                title: "Cognitive Evolution",
                description: "Watch your digital twin learn and evolve with you over time",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card hover-scale group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-4">
                  <feature.icon className="h-12 w-12 text-primary group-hover:text-secondary transition-colors" />
                  <div className="absolute inset-0 blur-2xl bg-primary/20 group-hover:bg-secondary/30 transition-all" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Link to="/features">
                View All Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
