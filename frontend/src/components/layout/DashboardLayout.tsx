import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Users,
  Plus,
  LogOut,
  Lock,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../hooks/useWorkspaces';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const mainNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workspaces/new', label: 'New workspace', icon: Plus },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const workspaceId = id ? Number(id) : null;
  const { data: workspace } = useWorkspace(workspaceId ?? 0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isWorkspaceRoute = location.pathname.startsWith('/workspaces/') && workspaceId;

  const workspaceNavItems = workspaceId
    ? [
        {
          to: `/workspaces/${workspaceId}`,
          label: 'Overview',
          icon: FolderOpen,
          exact: true,
        },
        {
          to: `/workspaces/${workspaceId}/members`,
          label: 'Members',
          icon: Users,
        },
        {
          to: `/workspaces/${workspaceId}/settings`,
          label: 'Settings',
          icon: Settings,
        },
      ]
    : [];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavLink = ({
    to,
    label,
    icon: Icon,
    exact,
  }: {
    to: string;
    label: string;
    icon: React.ElementType;
    exact?: boolean;
  }) => {
    const isActive = exact
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800',
        )}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <Link
          to="/dashboard"
          className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          onClick={() => setSidebarOpen(false)}
        >
          TeamVault
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Main
        </p>
        {mainNavItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}

        {isWorkspaceRoute && workspace && (
          <>
            <div className="pt-4 pb-2">
              <Link
                to="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ChevronLeft size={14} />
                Back to dashboard
              </Link>
            </div>
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 truncate">
              {workspace.name}
            </p>
            {workspaceNavItems.map((item) => (
              <NavLink key={item.to} {...item} exact={item.exact} />
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          to="/change-password"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Lock size={18} />
          Change password
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
        {user && (
          <div className="px-3 pt-2">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold truncate">
            {workspace?.name ?? 'TeamVault'}
          </span>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
