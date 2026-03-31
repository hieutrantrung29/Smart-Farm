import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';

export default function FloatingChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Don't show on chatbot page itself or login page
  if (location.pathname === '/chatbot' || location.pathname === '/') {
    return null;
  }

  const handleClick = () => {
    navigate('/chatbot');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center group transition-all duration-300"
        size="icon"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
          AI Assistant
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
