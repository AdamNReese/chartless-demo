import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Activity, 
  Brain, 
  CheckCircle, 
  Share2, 
  Settings, 
  Home,
  Stethoscope,
  FileText,
  Monitor,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Ambient Listening', href: '/ambient', icon: Activity },
    { name: 'Clinical Understanding', href: '/clinical', icon: Brain },
    { name: 'Smart Review', href: '/review', icon: CheckCircle },
    { name: 'Integration', href: '/integration', icon: Share2 },
    { name: 'System Status', href: '/status', icon: Monitor },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-lg sm:text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">Hospital Charting </span>
                <span className="text-primary-600">Demo</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="status-indicator status-active"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <nav className={`
          fixed lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
          w-64 bg-white shadow-sm min-h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:block
        `}>
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Demo Info */}
          <div className="mt-8 p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Mode</h3>
              <p className="text-xs text-blue-700">
                This is a demonstration of the Hospital Charting Automation System. 
                All data is simulated and no real medical information is processed.
              </p>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;