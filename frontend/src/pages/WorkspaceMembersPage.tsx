import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Loader, Trash2, Users } from 'lucide-react';
import {
  useWorkspace,
  useWorkspaceMembers,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
} from '../hooks/useWorkspaces';
import { addMemberSchema } from '../lib/validation';
import type { AddMemberFormData } from '../lib/validation';
import { useLayoutHeader } from '../context/LayoutContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateViews';
import { RoleBadge } from '../components/workspace/RoleBadge';
import {
  canManageMembers,
  formatDate,
  getApiErrorMessage,
  getMemberRole,
  isSameUser,
} from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import type { AssignableWorkspaceRole } from '../types/workspace';
import { toast } from 'sonner';

export const WorkspaceMembersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const { user } = useAuth();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

  const { data: workspace, isLoading: workspaceLoading } =
    useWorkspace(workspaceId);

  const {
    data: members,
    isLoading: membersLoading,
    isError,
    error,
    refetch,
  } = useWorkspaceMembers(workspaceId);

  const addMember = useAddMember(workspaceId);
  const updateMemberRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  const currentRole = getMemberRole(members ?? [], user?.id);
  const canManage = canManageMembers(currentRole);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { role: 'viewer' },
  });

  const onAddMember = async (data: AddMemberFormData) => {
    try {
      await addMember.mutateAsync(data);
      toast.success(`Invitation sent to ${data.email}`);
      reset({ email: '', role: 'viewer' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add member'));
    }
  };

  const handleRoleChange = async (
    memberId: number,
    role: AssignableWorkspaceRole,
  ) => {
    try {
      await updateMemberRole.mutateAsync({ memberId, body: { role } });
      toast.success('Role updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update role'));
    }
  };

  const handleRemove = async () => {
    if (!confirmRemoveId) return;
    setRemovingId(confirmRemoveId);
    try {
      await removeMember.mutateAsync(confirmRemoveId);
      toast.success('Member removed');
      setConfirmRemoveId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove member'));
    } finally {
      setRemovingId(null);
    }
  };

  useLayoutHeader(
    {
      title: 'Members',
      subtitle: workspace?.name,
      breadcrumbs: workspace
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: workspace.name, to: `/workspaces/${workspaceId}` },
            { label: 'Members' },
          ]
        : undefined,
    },
    [workspace, workspaceId],
  );

  if (workspaceLoading || membersLoading) {
    return <LoadingState message="Loading members..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Failed to load members')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      {canManage && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-400" />
            Add member
          </h2>
          <form
            onSubmit={handleSubmit(onAddMember)}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <input
                {...register('email')}
                type="email"
                placeholder="colleague@company.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <select
              {...register('role')}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={addMember.isPending}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addMember.isPending ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                'Add'
              )}
            </button>
          </form>
        </div>
      )}

      {!canManage && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          You can view members but need admin access to make changes.
        </div>
      )}

      {members && members.length === 0 && (
        <EmptyState
          icon={<Users className="text-slate-500" size={28} />}
          title="No members yet"
          description="Add team members to collaborate in this workspace."
        />
      )}

      {members && members.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Member</span>
            <span>Role</span>
            <span>Joined</span>
            <span />
          </div>
          <ul className="divide-y divide-slate-100">
            {members.map((member) => {
              const isCurrentUser = isSameUser(user?.id, member.user_id);
              const isOwner = member.role === 'owner';

              return (
                <li
                  key={member.id}
                  className="px-5 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-3 sm:gap-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {member.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-400">(you)</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>

                  <div>
                    {canManage && !isOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.id,
                            e.target.value as AssignableWorkspaceRole,
                          )
                        }
                        disabled={updateMemberRole.isPending}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </div>

                  <p className="text-sm text-slate-400">
                    {formatDate(member.created_at)}
                  </p>

                  <div className="sm:text-right">
                    {canManage && !isOwner && !isCurrentUser && (
                      <button
                        onClick={() => setConfirmRemoveId(member.id)}
                        disabled={removingId === member.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {removingId === member.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemoveId !== null}
        title="Remove member?"
        description="This user will lose access to the workspace."
        confirmLabel="Remove"
        variant="danger"
        isLoading={removingId !== null}
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemoveId(null)}
      />
    </div>
  );
};
