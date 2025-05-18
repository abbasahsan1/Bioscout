import Link from 'next/link';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#1DE954]">
            Explore Our Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              title="Submit Observations" 
              description="Add your biodiversity sightings and contribute to our database."
              icon="📝"
              link="/observations/submit"
            />
            <FeatureCard 
              title="Explore Data" 
              description="Browse through observations from the community."
              icon="🔍"
              link="/observations"
            />
            <FeatureCard 
              title="Ask AI" 
              description="Have questions about Islamabad's biodiversity? Our AI can help!"
              icon="🤖"
              link="/ask"
            />
          </div>
        </div>
      </section>
      
      <section className="py-24 px-6 bg-[#111]">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-10 text-[#1DE954]">
            About BioScout Islamabad
          </h2>
          <p className="mx-auto text-center text-lg text-white leading-relaxed">
            BioScout Islamabad is a community-driven platform that aims to document and preserve 
            the biodiversity of Pakistan's capital city. By contributing your observations, 
            you're helping build a comprehensive database that supports conservation efforts 
            and environmental awareness.
          </p>
          <div className="flex justify-center mt-12">
            <Link
              href="/observations/submit"
              className="px-8 py-4 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-colors duration-300"
            >
              Start Contributing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}