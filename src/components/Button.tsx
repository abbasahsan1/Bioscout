"use client";

import Link from 'next/link';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
}

export default function Button({ 
  href, 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button',
  isLoading = false 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-md font-bold transition-all duration-300";
  
  let variantStyles = "";
  switch (variant) {
    case 'primary':
      variantStyles = "bg-[#1DE954] text-black hover:bg-[#19C048]";
      break;
    case 'secondary':
      variantStyles = "bg-[#333] text-white hover:bg-[#444]";
      break;
    case 'outline':
      variantStyles = "border-2 border-[#1DE954] text-[#1DE954] hover:bg-[#1DE954] hover:text-black";
      break;
    default:
      variantStyles = "bg-[#1DE954] text-black hover:bg-[#19C048]";
  }
  
  const disabledStyles = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed hover:bg-[#1DE954] hover:text-black' : '';
  const combinedStyles = `${baseStyles} ${variantStyles} ${disabledStyles} ${className}`;
  
  const content = isLoading ? (
    <div className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </div>
  ) : children;
  
  if (href && !disabled && !isLoading) {
    return (
      <Link href={href} className={combinedStyles}>
        {content}
      </Link>
    );
  }
  
  return (
    <button 
      onClick={onClick} 
      className={combinedStyles} 
      disabled={disabled || isLoading}
      type={type}
    >
      {content}
    </button>
  );
}