import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, fullWidth }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${fullWidth ? 'cursor-pointer w-full border-gray-200 dark:border-transparent text-[#131E29] dark:text-white' : 'cursor-pointer w-full sm:w-[160px] border-transparent text-gray-700 dark:text-gray-300'} flex items-center justify-between bg-gray-50 dark:bg-[#2c3033] focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] hover:border-[#EC6608]/50 rounded-lg px-3 py-2.5 text-sm outline-none transition-all text-left shadow-sm border`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-1 bg-white dark:bg-[#323639] rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] overflow-hidden py-1 border border-gray-100 dark:border-white/5"
          >
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`cursor-pointer w-full text-left px-3 py-2 text-sm transition-colors ${value === ''
                  ? 'bg-gray-50 dark:bg-[#2c3033] text-[#EC6608] font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2c3033]'
                }`}
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer w-full text-left px-3 py-2 text-sm transition-colors ${value === option.value
                    ? 'bg-gray-50 dark:bg-[#2c3033] text-[#EC6608] font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2c3033]'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
