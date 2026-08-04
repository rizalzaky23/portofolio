import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { MdSave, MdCloudUpload } from 'react-icons/md';
import { aboutService } from '@/services';
import type { About } from '@/types';
import { CMSLayout } from '../Layout';
import { Button } from '@/components/ui/Button';

export default function CMSAboutPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<{
    biography: string;
    github: string;
    linkedin: string;
    instagram: string;
    email: string;
    techStack: string;
  }>();

  useEffect(() => {
    aboutService.get().then((r) => {
      const a: About = r.data.data;
      setPhotoPreview(a.photo);
      setResumeUrl(a.resume);
      reset({
        biography: a.biography,
        github: a.socialLinks?.github ?? '',
        linkedin: a.socialLinks?.linkedin ?? '',
        instagram: a.socialLinks?.instagram ?? '',
        email: a.socialLinks?.email ?? '',
        techStack: Array.isArray(a.techStack) ? a.techStack.join(', ') : JSON.parse(a.techStack as unknown as string ?? '[]').join(', '),
      });
    });
  }, [reset]);

  const onSubmit = async (data: {
    biography: string; github: string; linkedin: string; instagram: string; email: string; techStack: string;
  }) => {
    const payload = {
      biography: data.biography,
      socialLinks: {
        github: data.github || undefined,
        linkedin: data.linkedin || undefined,
        instagram: data.instagram || undefined,
        email: data.email || undefined,
      },
      techStack: data.techStack.split(',').map((s) => s.trim()).filter(Boolean),
    };

    await aboutService.update(payload);

    if (photoFile) {
      setUploadingPhoto(true);
      const res = await aboutService.uploadPhoto(photoFile);
      setPhotoPreview(res.data.data?.url ?? photoPreview);
      setUploadingPhoto(false);
      setPhotoFile(null);
    }

    if (resumeFile) {
      setUploadingResume(true);
      const res = await aboutService.uploadResume(resumeFile);
      setResumeUrl(res.data.data?.url ?? resumeUrl);
      setUploadingResume(false);
      setResumeFile(null);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]';

  return (
    <CMSLayout title="About Section">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-5">
              <h3 className="font-semibold">Biography</h3>
              <div>
                <label className="block text-xs font-medium text-[--color-foreground] mb-2">Full Bio Text</label>
                <textarea
                  {...register('biography')}
                  rows={8}
                  className={`${inputClass} resize-y min-h-[160px]`}
                  placeholder="Write your biography..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[--color-foreground] mb-2">Tech Stack Tags (comma-separated)</label>
                <input
                  {...register('techStack')}
                  className={inputClass}
                  placeholder="React, TypeScript, Node.js, Express, Docker"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-4">
              <h3 className="font-semibold">Social Links</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[--color-foreground] mb-1">GitHub</label>
                  <input {...register('github')} className={inputClass} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[--color-foreground] mb-1">LinkedIn</label>
                  <input {...register('linkedin')} className={inputClass} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[--color-foreground] mb-1">Instagram</label>
                  <input {...register('instagram')} className={inputClass} placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[--color-foreground] mb-1">Contact Email</label>
                  <input {...register('email')} type="email" className={inputClass} placeholder="hello@example.com" />
                </div>
              </div>
            </div>
          </div>

          {/* Media Assets */}
          <div className="space-y-5">
            {/* Profile Photo */}
            <div className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]">
              <h3 className="font-semibold text-sm mb-4">Profile Photo</h3>
              <div className="aspect-[3/4] rounded-[--radius-lg] overflow-hidden bg-[--color-background] mb-3 border border-[--color-border] relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">👨‍💻</div>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                icon={<MdCloudUpload size={14} />}
                className="w-full justify-center text-xs"
                onClick={() => photoInputRef.current?.click()}
              >
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </div>

            {/* CV / Resume */}
            <div className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]">
              <h3 className="font-semibold text-sm mb-2">Resume / CV Document</h3>
              {resumeUrl && (
                <p className="text-xs text-[--color-accent] truncate mb-3">
                  Current: <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="underline">View PDF</a>
                </p>
              )}
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="secondary"
                icon={<MdCloudUpload size={14} />}
                className="w-full justify-center text-xs"
                onClick={() => resumeInputRef.current?.click()}
              >
                {resumeFile ? resumeFile.name : (resumeUrl ? 'Update Resume PDF' : 'Upload Resume PDF')}
              </Button>
            </div>

            <Button
              type="submit"
              loading={isSubmitting || uploadingPhoto || uploadingResume}
              icon={<MdSave size={16} />}
              className="w-full justify-center"
            >
              Save About Changes
            </Button>
          </div>
        </div>
      </form>
    </CMSLayout>
  );
}
