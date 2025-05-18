"use client";

import Link from 'next/link';

interface CardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export default function Card({ title, description, image, link }: CardProps) {
  return (
    <div className="bg-[#282828] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 animate-fadeIn">
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#1DE954] mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        {link && (
          <Link 
            href={link} 
            className="inline-block px-4 py-2 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-colors duration-300"
          >
            Learn More
          </Link>
        )}
      </div>
    </div>
  );
}