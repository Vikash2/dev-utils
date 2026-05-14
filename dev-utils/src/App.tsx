import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { Navigation } from './components/Navigation';
import { DiffChecker } from './pages/DiffChecker';
import { JSONFormatter } from './pages/JSONFormatter';
import { XMLFormatter } from './pages/XMLFormatter';
import { UniversalEditor } from './components/UniversalEditor';
import { useEffect } from 'react';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/universal-editor" element={<UniversalEditor isEmbedded={true} />} />
            <Route path="/diff-checker" element={<DiffChecker />} />
            <Route path="/json-formatter" element={<JSONFormatter />} />
            <Route path="/xml-formatter" element={<XMLFormatter />} />
            <Route path="/" element={<Navigate to="/universal-editor" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
