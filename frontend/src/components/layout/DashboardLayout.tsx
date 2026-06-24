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
  FileText,
  ScrollText,
  ChevronsUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LayoutProvider } from '../../context/LayoutContext';
import { useWorkspace, useWorkspaces } from '../../hooks/useWorkspaces';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AppHeader, PageContainer } from './AppHeader';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const mainNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
];

export const DashboardLayout: React.FC = () => {
  return (
    <LayoutProvider>
      <DashboardLayoutInner />
    </LayoutProvider>
  );
};

const DashboardLayoutInner: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const workspaceId = id ? Number(id) : null;
  const { data: workspace } = useWorkspace(workspaceId ?? 0);
  const { data: workspaces } = useWorkspaces();
  const { isError: auditUnavailable } = useAuditLogs(
    workspaceId ?? 0,
    undefined,
    !!workspaceId,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isWorkspaceRoute =
    !!workspaceId &&
    location.pathname.startsWith('/workspaces/') &&
    !location.pathname.endsWith('/new');

  const workspaceNavItems = workspaceId
    ? [
        {
          to: `/workspaces/${workspaceId}`,
          label: 'Overview',
          icon: FolderOpen,
          exact: true,
        },
        {
          to: `/workspaces/${workspaceId}/pages`,
          label: 'Pages',
          icon: FileText,
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
        ...(!auditUnavailable
          ? [
              {
                to: `/workspaces/${workspaceId}/audit-logs`,
                label: 'Audit logs',
                icon: ScrollText,
              },
            ]
          : []),
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
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        )}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <Link
          to="/dashboard"
          className="text-lg font-bold text-slate-900"
          onClick={() => setSidebarOpen(false)}
        >
          Team<span className="text-blue-600">Vault</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Main
        </p>
        {mainNavItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
        <Link
          to="/workspaces/new"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Plus size={18} />
          New workspace
        </Link>

        {isWorkspaceRoute && workspace && (
          <>
            <div className="pt-4 pb-2">
              <Link
                to="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft size={14} />
                All workspaces
              </Link>
            </div>

            <div className="px-3 mb-2 relative">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {workspace.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    /{workspace.slug}
                  </p>
                </div>
                <ChevronsUpDown size={14} className="text-slate-400 shrink-0" />
              </button>
              {workspaceMenuOpen && workspaces && workspaces.length > 1 && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                  {workspaces
                    .filter((w) => w.id !== workspace.id)
                    .map((w) => (
                      <Link
                        key={w.id}
                        to={`/workspaces/${w.id}`}
                        onClick={() => {
                          setWorkspaceMenuOpen(false);
                          setSidebarOpen(false);
                        }}
                        className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 truncate"
                      >
                        {w.name}
                      </Link>
                    ))}
                </div>
              )}
            </div>

            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Workspace
            </p>
            {workspaceNavItems.map((item) => (
              <NavLink key={item.to} {...item} exact={'exact' in item ? item.exact : false} />
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-1">
        <Link
          to="/change-password"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Lock size={18} />
          Account
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
        {user && (
          <div className="px-3 pt-2 pb-1">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user.username}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold truncate text-slate-900">
            {workspace?.name ?? 'TeamVault'}
          </span>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <AppHeader />

        <main className="flex-1">
          <PageContainer fullWidth>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
};
