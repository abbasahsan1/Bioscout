import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export default function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
  return (
    <div className="bg-[#222222] rounded-xl p-8 shadow-xl border-2 border-[#333333] transition-all duration-300 hover:scale-105 hover:border-[#1DE954]/30">
      <div className="text-5xl mb-6 bg-[#1DE954]/10 p-5 rounded-full w-20 h-20 flex items-center justify-center">{icon}</div>
      <h3 className="text-2xl font-bold text-[#1DE954] mb-4">{title}</h3>
      <p className="text-white mb-6 opacity-90">{description}</p>
      <Link
        href={link}
        className="inline-flex items-center text-[#1DE954] font-semibold hover:underline group"
      >
        Learn more <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
