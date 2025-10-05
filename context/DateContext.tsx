'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of the context data
interface DateContextType {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
}

// Create the context
const DateContext = createContext<DateContextType | undefined>(undefined);

// Create the provider component
export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
};

// Create a custom hook to easily use the date context
export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};