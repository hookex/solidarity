import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full py-1.5 text-center text-xs text-gray-400/70 bg-transparent">
      <Link 
        href="https://beian.miit.gov.cn" 
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-500 transition-colors duration-200"
      >
        京ICP备2024099627号
      </Link>
    </footer>
  );
};
