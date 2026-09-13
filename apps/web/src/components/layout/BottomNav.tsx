import React from 'react';
import { useApp, AppView } from '../../store/AppContext';
import { Home, Mic, BarChart3, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, startDailyPractice } = useApp();

  const navItems: { id: AppView; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'practice', label: 'Practice', icon: Mic },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (item.id === 'practice') {
                startDailyPractice(0);
              } else {
                setCurrentView(item.id);
              }
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
