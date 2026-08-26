import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../constants';
import { useNavigate } from 'react-router-dom';

interface DemoContextType {
  isDemoMode: boolean;
  timeLeft: number;
  startDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  endDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DEMO_DURATION = 15 * 60; // 15 minutes in seconds

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
  });
  
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedTime = localStorage.getItem('demoTimeLeft');
    return savedTime ? parseInt(savedTime, 10) : DEMO_DURATION;
  });

  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (isDemoMode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          localStorage.setItem('demoTimeLeft', newTime.toString());
          if (newTime <= 0) {
            endDemo();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDemoMode, timeLeft]);

  const startDemo = async () => {
    try {
      const response = await apiService.startDemo();
      
      // Save demo credentials
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
      localStorage.setItem('demoTimeLeft', DEMO_DURATION.toString());
      
      setIsDemoMode(true);
      setTimeLeft(DEMO_DURATION);
      
      // Force reload to apply demo mode everywhere or just navigate
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to start demo:', error);
      throw error;
    }
  };

  const resetDemo = async () => {
    try {
      await apiService.resetDemo();
      setTimeLeft(DEMO_DURATION);
      localStorage.setItem('demoTimeLeft', DEMO_DURATION.toString());
      // Refresh the page to clear any stale data in components
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset demo:', error);
    }
  };

  const endDemo = () => {
    setIsDemoMode(false);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
    localStorage.removeItem('demoTimeLeft');
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate('/demo');
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, timeLeft, startDemo, resetDemo, endDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
