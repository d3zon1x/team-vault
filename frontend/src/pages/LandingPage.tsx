import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, Lock, Users, Search, GitBranch, Shield } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TeamVault
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Organize Your{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Team Knowledge
                </span>
              </h1>
              <p className="text-xl text-slate-400">
                A modern, intuitive platform for team documentation, knowledge bases, and secure workspaces.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 gap-2"
              >
                Get started
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-slate-600 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-700/50 flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-slate-700/20 [background-size:20px_20px]"></div>
            <div className="relative z-10 space-y-4 w-full h-full p-8 flex flex-col justify-center items-center">
              <Book className="text-blue-400" size={48} />
              <p className="text-center text-slate-300">
                Document everything your team needs to know
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-slate-400">
            Everything you need to keep your team organized and productive
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Team Workspaces',
              description: 'Create and manage multiple workspaces for different teams or projects',
            },
            {
              icon: Book,
              title: 'Markdown Documentation',
              description: 'Write beautiful documentation using Markdown with real-time preview',
            },
            {
              icon: GitBranch,
              title: 'Version History',
              description: 'Track all changes and roll back to previous versions anytime',
            },
            {
              icon: Lock,
              title: 'Secure File Attachments',
              description: 'Share files securely within your team with granular access control',
            },
            {
              icon: Search,
              title: 'Powerful Search',
              description: 'Find what you need instantly with full-text search across all documents',
            },
            {
              icon: Shield,
              title: 'Role-Based Access',
              description: 'Control permissions with flexible role-based access control (RBAC)',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/75 hover:bg-slate-800/75 transition-all duration-200 group"
              >
                <div className="mb-4">
                  <Icon className="text-blue-400 group-hover:text-purple-400 transition-colors" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-600/50 rounded-xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join teams that are already using TeamVault to organize their knowledge
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 gap-2"
          >
            Start free today
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 TeamVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
