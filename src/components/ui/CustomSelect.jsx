import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, fullWidth, multiple }) => {
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

  const handleToggle = (optValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(optValue);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(optValue);
      }
      onChange(newValue);
    } else {
      onChange(optValue);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (!Array.isArray(value) || value.length === 0) return placeholder;
      if (value.length === 1) return options.find(o => o.value === value[0])?.label || placeholder;
      return `${value.length} selecionados`;
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const isSelected = (optValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optValue);
    }
    return value === optValue;
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${fullWidth ? 'cursor-pointer w-full border-gray-200 dark:border-transparent text-[#131E29] dark:text-white' : 'cursor-pointer w-full sm:w-[160px] border-transparent text-gray-700 dark:text-gray-300'} flex items-center justify-between bg-gray-50 dark:bg-[#2c3033] focus:bg-white dark:focus:bg-[#323639] focus:border-brand hover:border-brand/50 rounded-lg px-3 py-2.5 text-sm outline-none transition-all text-left shadow-sm border`}
      >
        <span className="truncate">{getDisplayValue()}</span>
        <div className="flex items-center gap-1.5">
          {multiple && Array.isArray(value) && value.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold shadow-sm">
              {value.length}
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[60] w-full mt-1 bg-white dark:bg-[#323639] rounded-xl shadow-[0_10px_40px_-4px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-4px_rgba(0,0,0,0.5)] overflow-y-auto max-h-60 py-1 border border-gray-100 dark:border-white/5 no-scrollbar"
          >
            {!multiple && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className={`cursor-pointer w-full text-left px-3 py-2 text-sm transition-colors ${!value ? 'bg-gray-50 dark:bg-[#2c3033] text-brand font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2c3033]'}`}
              >
                {placeholder}
              </button>
            )}
            {options.map((option) => {
              const selected = isSelected(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={`cursor-pointer w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${selected ? 'bg-brand/5 dark:bg-brand/10 text-brand font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2c3033]'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && <Check size={14} strokeWidth={3} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
