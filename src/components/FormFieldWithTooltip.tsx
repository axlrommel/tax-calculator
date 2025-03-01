import { useState } from 'react';

interface IProps {
  label: String;
  tooltipText: string;
  children: any;
  labelClassName?: string;
  containerClassName?: string;
  wrapperClassName?: string;
}

const FormFieldWithTooltip = ({ 
  label, 
  tooltipText, 
  children,
  labelClassName = "text-sm font-medium",
  containerClassName = "w-1/2",
  wrapperClassName = "flex gap-6 mb-2"
}: IProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  
  // Generate a unique ID for each tooltip based on the label
  const tooltipId = `tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className={wrapperClassName}>
      <div className={containerClassName}>
        <div className="flex items-center gap-2 mb-2">
          <label className={labelClassName}>{label}</label>
          <div className="relative">
            <button 
              type="button"
              className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsTooltipVisible(!isTooltipVisible)}
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
              aria-label={`${label} information`}
            >
              i
            </button>
            <div 
              id={tooltipId} 
              className={`absolute z-50 mt-2 w-64 transform -translate-x-1/2 left-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg ${isTooltipVisible ? '' : 'hidden'}`}
              role="tooltip"
            >
              {tooltipText}
              <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -mt-4 left-1/2 -ml-1"></div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FormFieldWithTooltip;