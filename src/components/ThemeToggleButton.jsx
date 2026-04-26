import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle" 
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="thumb"></span>
    </button>
  );
}