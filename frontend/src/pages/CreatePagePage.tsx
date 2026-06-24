import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useWorkspacePages, useCreatePage } from '../hooks/usePages';
import { getApiErrorMessage } from '../lib/utils';
import { toast } from 'sonner';
import type { PageStatus } from '../types/page';

const createPageFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content_markdown: z.string().optional(),
  parent_id: z.string().optional(),
  status: z.enum(['draft', 'published']),
});

type CreatePageForm = z.infer<typeof createPageFormSchema>;

export const CreatePagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultParentId = searchParams.get('parent') ?? '';

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: pagesData } = useWorkspacePages(workspaceId, { limit: 100 });
  const createPage = useCreatePage(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePageForm>({
    resolver: zodResolver(createPageFormSchema),
    defaultValues: {
      title: '',
      content_markdown: '',
      parent_id: defaultParentId,
      status: 'draft',
    },
  });

  useLayoutHeader(
    {
      title: 'New page',
      breadcrumbs: workspace
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: workspace.name, to: `/workspaces/${workspaceId}` },
            { label: 'Pages', to: `/workspaces/${workspaceId}/pages` },
            { label: 'New page' },
          ]
        : undefined,
    },
    [workspace, workspaceId],
  );

  const onSubmit = async (data: CreatePageForm) => {
    try {
      const page = await createPage.mutateAsync({
        title: data.title,
        content_markdown: data.content_markdown || '',
        parent_id: data.parent_id ? Number(data.parent_id) : null,
        status: data.status as PageStatus,
      });
      toast.success('Page created');
      navigate(`/workspaces/${workspaceId}/pages/${page.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create page'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to={`/workspaces/${workspaceId}/pages`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to pages
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Create a new page
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Add a documentation page to {workspace?.name ?? 'your workspace'}.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              {...register('title')}
              placeholder="Getting started"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Parent page <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <select
              {...register('parent_id')}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="">None (top level)</option>
              {pagesData?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Initial content <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('content_markdown')}
              rows={8}
              placeholder="# Getting started&#10;&#10;Write your documentation in markdown..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={createPage.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {createPage.isPending ? (
              <>
                <Loader size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create page
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
