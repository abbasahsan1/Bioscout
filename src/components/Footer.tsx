export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] py-8 px-4 border-t border-[#555555]">
      <div className="container mx-auto text-center">
        <p className="text-[#CCCCCC] mb-2">
          BioScout Islamabad - Supporting UN SDGs 15 (Life on Land) and 13 (Climate Action)
        </p>
        <p className="text-[#999999] text-sm">
          © {new Date().getFullYear()} BioScout Islamabad. All rights reserved.
        </p>
      </div>
    </footer>
  );
}