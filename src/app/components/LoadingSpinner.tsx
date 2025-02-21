import type React from "react";
import "./GearLoadingSpinner.css"; // We'll create this CSS file separately

const GearLoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="gearbox">
        <div className="overlay"></div>
        <div className="gear one">
          <div className="gear-inner">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
        <div className="gear two">
          <div className="gear-inner">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
        <div className="gear three">
          <div className="gear-inner">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
        <div className="gear four large">
          <div className="gear-inner">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GearLoadingSpinner;