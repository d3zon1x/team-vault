import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { createWorkspaceSchema } from '../lib/validation';
import type { CreateWorkspaceFormData } from '../lib/validation';
import { useCreateWorkspace } from '../hooks/useWorkspaces';
import { getApiErrorMessage } from '../lib/utils';
import { toast } from 'sonner';

export const CreateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();

  useLayoutHeader(
    {
      title: 'New workspace',
      breadcrumbs: [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'New workspace' },
      ],
    },
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { description: '' },
  });

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      const workspace = await createWorkspace.mutateAsync({
        name: data.name,
        description: data.description || undefined,
      });
      toast.success('Workspace created successfully');
      navigate(`/workspaces/${workspace.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create workspace'));
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Create workspace</h2>
        <p className="text-slate-500 text-sm mb-6">
          Set up a new space for your team&apos;s documentation.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Engineering Docs"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description{' '}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What is this workspace for?"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createWorkspace.isPending}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createWorkspace.isPending ? (
              <>
                <Loader size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create workspace
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
