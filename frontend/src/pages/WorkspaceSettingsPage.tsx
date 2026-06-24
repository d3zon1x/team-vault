import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, Trash2, AlertTriangle } from 'lucide-react';
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '../hooks/useWorkspaces';
import { updateWorkspaceSchema } from '../lib/validation';
import type { UpdateWorkspaceFormData } from '../lib/validation';
import { useLayoutHeader } from '../context/LayoutContext';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import {
  canDeleteWorkspace,
  canEditWorkspace,
  getApiErrorMessage,
  getMemberRole,
} from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const WorkspaceSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspace(workspaceId);

  const { data: members, isLoading: membersLoading } =
    useWorkspaceMembers(workspaceId);

  const updateWorkspace = useUpdateWorkspace(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();

  const currentRole = getMemberRole(members ?? [], user?.id);
  const canEdit = canEditWorkspace(currentRole);
  const canDelete = canDeleteWorkspace(currentRole);

  useLayoutHeader(
    {
      title: 'Settings',
      subtitle: workspace?.name,
      breadcrumbs: workspace
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: workspace.name, to: `/workspaces/${workspaceId}` },
            { label: 'Settings' },
          ]
        : undefined,
    },
    [workspace, workspaceId],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description ?? '',
      });
    }
  }, [workspace, reset]);

  const onSubmit = async (data: UpdateWorkspaceFormData) => {
    try {
      await updateWorkspace.mutateAsync({
        name: data.name,
        description: data.description || null,
      });
      toast.success('Workspace updated successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update workspace'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      toast.success('Workspace deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete workspace'));
    }
  };

  if (isLoading || membersLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  if (isError || !workspace) {
    return (
      <ErrorState
        title="Workspace not found"
        message={getApiErrorMessage(error, 'Failed to load workspace')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-2xl">
      {!canEdit && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          You have read-only access. Contact an admin to make changes.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 mb-8 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">General</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Name
          </label>
          <input
            {...register('name')}
            type="text"
            disabled={!canEdit}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Slug
          </label>
          <input
            type="text"
            value={workspace.slug}
            disabled
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">Slug cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            disabled={!canEdit}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {canEdit && (
          <button
            type="submit"
            disabled={!isDirty || updateWorkspace.isPending}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateWorkspace.isPending ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        )}
      </form>

      {canDelete && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-800">Danger zone</h2>
              <p className="text-sm text-red-600/80 mt-1 mb-4">
                Permanently delete this workspace and all its data. This action
                cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/25 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete workspace
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-red-300 font-medium">
                    Are you sure?
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={deleteWorkspace.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {deleteWorkspace.isPending ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Yes, delete'
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
