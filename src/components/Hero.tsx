"use client";

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-black text-white pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-[#1DE954]">
            Discover Biodiversity in Islamabad
          </h1>
          <p className="text-xl mb-10 text-white max-w-3xl mx-auto">
            Join our community to explore, document, and preserve the natural wonders of Pakistan's capital city.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/observations" 
              className="px-8 py-4 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-colors duration-300"
            >
              Browse Observations
            </Link>
            <Link 
              href="/observations/submit" 
              className="px-8 py-4 border-2 border-[#1DE954] text-[#1DE954] font-bold rounded-md hover:bg-[#1DE954] hover:text-black transition-colors duration-300"
            >
              Contribute Data
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}