// hooks/useRTL.js
import { useMemo } from 'react';

export const useRTL = (lang) => {
  const isRTL = useMemo(() => lang === 'ar', [lang]);
  
  // Helper for conditional classes
  const getDirectionalClass = (ltrClass, rtlClass) => {
    return isRTL ? rtlClass : ltrClass;
  };
  
  // Helper for margin/padding
  const getSpacing = (side, value) => {
    const sides = {
      left: isRTL ? 'right' : 'left',
      right: isRTL ? 'left' : 'right',
    };
    return `${sides[side]}-${value}`;
  };
  
  return { 
    isRTL, 
    getDirectionalClass,
    getSpacing 
  };
};