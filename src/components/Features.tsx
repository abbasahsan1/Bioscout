import { ReactNode } from 'react';

type FeatureCardProps = {
  number: number;
  title: string;
  description: string;
};

function FeatureCard({ number, title, description }: FeatureCardProps) {
  return (
    <div className="card p-6 flex flex-col items-center text-center h-full animate-fadeInUp">
      <div className="w-16 h-16 rounded-full bg-[#1DE954] flex items-center justify-center mb-4 transition-transform hover:scale-110 hover:rotate-3">
        <span className="text-[#1A1A1A] text-2xl font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#CCCCCC]">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="py-12 md:py-16 px-4 bg-[#282828]">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 animate-fadeInDown">
          How It Works
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fadeIn">
          <FeatureCard 
            number={1} 
            title="Submit Observations" 
            description="Upload photos and details of plants and animals you spot around Islamabad."
          />
          <FeatureCard 
            number={2} 
            title="AI Identification" 
            description="Our AI helps identify species from your photos, making biodiversity documentation easier."
          />
          <FeatureCard 
            number={3} 
            title="Ask Questions" 
            description="Use our AI-powered Q&A system to learn more about local biodiversity."
          />
        </div>
      </div>
    </section>
  );
}