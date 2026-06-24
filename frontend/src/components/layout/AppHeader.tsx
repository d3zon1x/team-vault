import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { useLayoutContext } from '../../context/LayoutContext';
import { cn } from '../../lib/utils';

export const AppHeader: React.FC = () => {
  const { header } = useLayoutContext();
  const {
    title,
    subtitle,
    breadcrumbs,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    primaryAction,
  } = header;

  if (!title && !breadcrumbs?.length && !primaryAction && !onSearchChange) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-slate-500 mb-2 flex-wrap">
            {breadcrumbs.map((item, i) => (
              <React.Fragment key={`${item.label}-${i}`}>
                {i > 0 && <ChevronRight size={14} className="shrink-0" />}
                {item.to ? (
                  <Link
                    to={item.to}
                    className="hover:text-slate-900 transition-colors truncate max-w-[160px]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onSearchChange && (
              <div className="relative hidden md:block">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchValue ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder ?? 'Search...'}
                  className="w-56 pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            )}
            {primaryAction}
          </div>
        </div>
      </div>
    </header>
  );
};

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  fullWidth,
}) => (
  <div
    className={cn(
      'px-4 sm:px-6 lg:px-8 py-6',
      !fullWidth && 'max-w-7xl mx-auto',
      className,
    )}
  >
    {children}
  </div>
);
