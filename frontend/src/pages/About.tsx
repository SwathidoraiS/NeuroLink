import { CheckCircle2 } from "lucide-react";
import cognitiveBrainImage from "@/assets/cognitive-brain.jpg";

const About = () => {
  const steps = [
    {
      title: "Collect",
      description: "Gather cognitive patterns, decisions, and behavioral data through intuitive interactions",
    },
    {
      title: "Learn",
      description: "Advanced AI algorithms analyze and understand your unique cognitive fingerprint",
    },
    {
      title: "Reflect",
      description: "Your digital twin mirrors your thought processes and decision-making patterns",
    },
    {
      title: "Assist",
      description: "Receive personalized insights and recommendations for better decision-making",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            About <span className="text-gradient">NeuroLink</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pioneering the future of human-AI synergy through cognitive digital twins
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-heading font-bold mb-6">
              The Future of <span className="text-gradient">Cognitive Intelligence</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Cognitive digital twins represent a breakthrough in understanding human intelligence.
              NeuroLink creates a sophisticated AI model that learns from your decisions, emotions,
              and patterns to become a true reflection of your cognitive processes.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Unlike traditional AI assistants, your cognitive twin understands the nuances of your
              thinking, predicts how you might react to situations, and provides insights that feel
              genuinely personalized because they're based on your unique mental framework.
            </p>
            <div className="space-y-3">
              {[
                "Privacy-first architecture with encrypted data",
                "Continuous learning and adaptation",
                "Scientifically validated cognitive models",
                "Ethical AI with transparent decision-making",
              ].map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden glass border border-white/10">
              <img
                src={cognitiveBrainImage}
                alt="Cognitive Digital Twin"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-heading font-bold text-center mb-16">
            How <span className="text-gradient">NeuroLink</span> Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass-card hover-scale text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="glass-card text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-4">
            We believe that understanding oneself is the key to making better decisions and living a
            more fulfilling life. NeuroLink empowers individuals with unprecedented insights into
            their own cognitive processes, making the invisible visible and the unconscious conscious.
          </p>
          <p className="text-lg text-muted-foreground">
            By bridging the gap between human intelligence and artificial intelligence, we're creating
            a future where technology truly understands and amplifies human potential.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
