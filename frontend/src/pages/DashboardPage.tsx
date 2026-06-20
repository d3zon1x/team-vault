import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Clock, BookOpen, FolderOpen, Lock, Loader } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TeamVault
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <Loader size={20} className="animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={20} />
                Logout
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User info card */}
        <div className="mb-12 p-6 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h1>
          <div className="space-y-2 text-slate-400">
            <p>Email: <span className="text-slate-200">{user.email}</span></p>
            <p>Account status: <span className="text-green-400 font-semibold">
              {user.is_verified ? 'Verified' : 'Pending verification'}
            </span></p>
          </div>
        </div>

        {/* Dashboard sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Workspaces */}
          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <FolderOpen className="text-blue-400 group-hover:text-blue-300 transition-colors" size={32} />
              <span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-semibold text-slate-300">Coming soon</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Workspaces</h3>
            <p className="text-slate-400 text-sm">Create and manage your team workspaces</p>
          </div>

          {/* Pages */}
          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="text-purple-400 group-hover:text-purple-300 transition-colors" size={32} />
              <span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-semibold text-slate-300">Coming soon</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Pages</h3>
            <p className="text-slate-400 text-sm">View and edit all your documentation pages</p>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-green-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <Clock className="text-green-400 group-hover:text-green-300 transition-colors" size={32} />
              <span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-semibold text-slate-300">Coming soon</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-slate-400 text-sm">See what changed in your workspaces</p>
          </div>

          {/* Settings */}
          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-orange-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <Lock className="text-orange-400 group-hover:text-orange-300 transition-colors" size={32} />
              <span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-semibold text-slate-300">Coming soon</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-slate-400 text-sm">Manage your account and preferences</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-600/50">
          <h2 className="text-lg font-semibold mb-4">Next steps</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Create your first workspace
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Invite team members
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Start documenting
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
