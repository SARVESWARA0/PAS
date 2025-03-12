import type React from "react";

const CustomLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="relative">
        {/* Rotating outer ring */}
        <div className="w-24 h-24 rounded-full border-8 border-indigo-500 border-t-transparent animate-spin"></div>
        
      </div>
    </div>
  );
};

export default CustomLoader;
