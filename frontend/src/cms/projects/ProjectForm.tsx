import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MdSave, MdArrowBack, MdCloudUpload } from 'react-icons/md';
import { projectService } from '@/services';
import type { Project } from '@/types';
import { CMSLayout } from '../Layout';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/utils';

const projectFormSchema = z.object({
  title:        z.string().min(1, 'Title is required'),
  slug:         z.string().min(1, 'Slug is required'),
  summary:      z.string().min(1, 'Summary is required').max(500),
  description:  z.string().min(1, 'Description is required'),
  problem:      z.string().min(1, 'Problem is required'),
  solution:     z.string().min(1, 'Solution is required'),
  architecture: z.string(),
  challenges:   z.string(),
  lessons:      z.string(),
  status:       z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured:     z.boolean(),
  year:         z.number().int().min(2000).max(2100),
  category:     z.string().min(1, 'Category is required'),
  githubUrl:    z.string(),
  demoUrl:      z.string(),
  techStack:    z.string().min(1, 'At least one technology is required'),
  metaTitle:    z.string(),
  metaDescription: z.string(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

function FormField({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[--color-foreground] mb-2">
        {label}{required && <span className="text-[--color-destructive] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-[--color-destructive]">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] placeholder-[--color-muted]/60 focus:outline-none focus:border-[--color-accent] focus:ring-1 focus:ring-[--color-accent]/20 transition-all';
const textareaClass = `${inputClass} resize-y min-h-[120px]`;

export default function CMSProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      description: '',
      problem: '',
      solution: '',
      architecture: '',
      challenges: '',
      lessons: '',
      status: 'DRAFT',
      featured: false,
      year: new Date().getFullYear(),
      category: '',
      githubUrl: '',
      demoUrl: '',
      techStack: '',
      metaTitle: '',
      metaDescription: '',
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title) {
      setValue('slug', slugify(title), { shouldValidate: false });
    }
  }, [title, isEdit, setValue]);

  // Load existing project for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    projectService.get(id).then((r) => {
      const p: Project = r.data.data;
      const techStack = Array.isArray(p.techStack)
        ? p.techStack.join(', ')
        : JSON.parse(p.techStack as unknown as string ?? '[]').join(', ');

      reset({
        title:        p.title,
        slug:         p.slug,
        summary:      p.summary,
        description:  p.description,
        problem:      p.problem,
        solution:     p.solution,
        architecture: p.architecture ?? '',
        challenges:   p.challenges ?? '',
        lessons:      p.lessons ?? '',
        status:       p.status,
        featured:     p.featured,
        year:         p.year,
        category:     p.category,
        githubUrl:    p.githubUrl ?? '',
        demoUrl:      p.demoUrl ?? '',
        techStack:    techStack,
        metaTitle:    p.metaTitle ?? '',
        metaDescription: p.metaDescription ?? '',
      });
      setCoverPreview(p.coverImage);
    });
  }, [id, isEdit, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    const payload = {
      ...data,
      techStack: data.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      githubUrl: data.githubUrl || null,
      demoUrl:   data.demoUrl   || null,
    };

    let projectId: string;
    if (isEdit && id) {
      await projectService.update(id, payload);
      projectId = id;
    } else {
      const res = await projectService.create(payload);
      projectId = res.data.data.id;
    }

    // Upload cover if selected
    if (coverFile && projectId) {
      setUploadingCover(true);
      await projectService.uploadCover(projectId, coverFile);
      setUploadingCover(false);
    }

    navigate('/admin/projects');
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  return (
    <CMSLayout title={isEdit ? 'Edit Project' : 'New Project'}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/projects" className="p-2 rounded-lg text-[--color-muted] hover:text-[--color-foreground] transition-colors">
            <MdArrowBack size={20} />
          </Link>
          <h2 className="font-[--font-heading] font-bold text-xl">{isEdit ? 'Edit Project' : 'New Project'}</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-5">
                <FormField label="Title" required error={errors.title?.message}>
                  <input {...register('title')} className={inputClass} placeholder="My Awesome Project" />
                </FormField>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Slug" required error={errors.slug?.message}>
                    <input {...register('slug')} className={inputClass} placeholder="my-awesome-project" />
                  </FormField>
                  <FormField label="Category" required error={errors.category?.message}>
                    <input {...register('category')} className={inputClass} placeholder="Web App" />
                  </FormField>
                </div>

                <FormField label="Summary" required error={errors.summary?.message}>
                  <textarea {...register('summary')} className={textareaClass} rows={3} placeholder="Brief description (max 500 chars)" />
                </FormField>

                <FormField label="Tech Stack (comma-separated)" required error={errors.techStack?.message}>
                  <input {...register('techStack')} className={inputClass} placeholder="React, Node.js, MySQL, Docker" />
                </FormField>

                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="GitHub URL" error={errors.githubUrl?.message}>
                    <input {...register('githubUrl')} className={inputClass} placeholder="https://github.com/..." type="url" />
                  </FormField>
                  <FormField label="Demo URL" error={errors.demoUrl?.message}>
                    <input {...register('demoUrl')} className={inputClass} placeholder="https://..." type="url" />
                  </FormField>
                  <FormField label="Year" required error={errors.year?.message}>
                    <input {...register('year', { valueAsNumber: true })} className={inputClass} type="number" min={2000} max={2100} />
                  </FormField>
                </div>
              </div>

              {/* Long text sections */}
              {([
                ['description',  'Description *',         true],
                ['problem',      'Problem Statement *',   true],
                ['solution',     'Solution *',            true],
                ['architecture', 'Architecture',          false],
                ['challenges',   'Challenges',            false],
                ['lessons',      'Lessons Learned',       false],
              ] as [keyof ProjectFormData, string, boolean][]).map(([field, label, req]) => (
                <div key={field} className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]">
                  <FormField label={label} required={req} error={errors[field]?.message as string}>
                    <textarea
                      {...register(field)}
                      className={textareaClass}
                      rows={6}
                      placeholder={`Write the ${label.toLowerCase()}...`}
                    />
                  </FormField>
                </div>
              ))}

              {/* SEO */}
              <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-4">
                <h3 className="font-semibold text-[--color-foreground]">SEO</h3>
                <FormField label="Meta Title">
                  <input {...register('metaTitle')} className={inputClass} placeholder="SEO title (defaults to project title)" />
                </FormField>
                <FormField label="Meta Description">
                  <textarea {...register('metaDescription')} className={textareaClass} rows={3} placeholder="SEO description (max 160 chars)" />
                </FormField>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Publish settings */}
              <div className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-4">
                <h3 className="font-semibold text-sm">Publish Settings</h3>

                <FormField label="Status" error={errors.status?.message}>
                  <select {...register('status')} className={inputClass}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </FormField>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register('featured')} type="checkbox" className="w-4 h-4 rounded border-[--color-border] accent-[--color-accent]" />
                  <span className="text-sm text-[--color-foreground]">Featured project</span>
                </label>

                <Button
                  type="submit"
                  loading={isSubmitting || uploadingCover}
                  icon={<MdSave size={16} />}
                  className="w-full justify-center"
                >
                  {isEdit ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>

              {/* Cover image */}
              <div className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]">
                <h3 className="font-semibold text-sm mb-4">Cover Image</h3>
                {coverPreview ? (
                  <div className="relative aspect-[16/9] rounded-[--radius-lg] overflow-hidden mb-3 bg-[--color-background]">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverPreview(null); setCoverFile(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white text-xs hover:bg-black/80 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : null}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-upload"
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={<MdCloudUpload size={14} />}
                  className="w-full justify-center text-xs"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? 'Change Cover' : 'Upload Cover'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CMSLayout>
  );
}
