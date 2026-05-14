import { Link, useLocation } from 'react-router-dom';
import { Code2, FileJson, FileText, Edit3, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const Navigation = () => {
  const location = useLocation();
  const isEditor = location.pathname === '/universal-editor';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/universal-editor', label: 'Code Editor', icon: Edit3 },
    { path: '/diff-checker', label: 'Diff Checker', icon: Code2 },
    { path: '/json-formatter', label: 'JSON Formatter', icon: FileJson },
    { path: '/xml-formatter', label: 'XML Formatter', icon: FileText },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <Link to="/universal-editor" className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              DevUtils
            </motion.div>
          </Link>

          {/* Center/Right: Navigation Items + Theme Toggle */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {/* Theme Toggle - Left of nav items (only when not on editor) */}
            {!isEditor && (
              <div className="mr-4 pl-4 border-l border-gray-300 dark:border-gray-700">
                <ThemeToggle />
              </div>
            )}

            {/* Navigation Items */}
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <motion.button
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </motion.button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            title="Toggle menu"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-3 space-y-2"
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <motion.button
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </motion.button>
              </Link>
            ))}
            {!isEditor && (
              <div className="px-3 py-2 border-t border-gray-300 dark:border-gray-700 mt-2 pt-2">
                <ThemeToggle />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};
