import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MdSave } from 'react-icons/md';
import { settingsService } from '@/services';
import type { Settings } from '@/types';
import { CMSLayout } from '../Layout';
import { Button } from '@/components/ui/Button';

export default function CMSSettingsPage() {
  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<Partial<Settings>>();

  useEffect(() => {
    settingsService.get().then((r) => reset(r.data.data));
  }, [reset]);

  const onSubmit = async (data: Partial<Settings>) => {
    await settingsService.bulkUpdate(data as Settings);
  };

  const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent] focus:ring-1 focus:ring-[--color-accent]/20 transition-all';

  return (
    <CMSLayout title="Settings">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* Site Info */}
        <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-5">
          <h3 className="font-semibold">Site Information</h3>
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-2">Site Title</label>
            <input {...register('site_title')} className={inputClass} placeholder="My Portfolio" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-2">Site Description</label>
            <textarea {...register('site_description')} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Meta description for SEO" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-2">Site URL</label>
            <input {...register('site_url')} className={inputClass} type="url" placeholder="https://yoursite.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-2">Contact Email</label>
            <input {...register('contact_email')} className={inputClass} type="email" placeholder="hello@yoursite.com" />
          </div>
        </div>

        {/* Analytics */}
        <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] space-y-5">
          <h3 className="font-semibold">Analytics</h3>
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-2">Google Analytics ID</label>
            <input {...register('google_analytics_id')} className={inputClass} placeholder="G-XXXXXXXXXX" />
          </div>
        </div>

        {/* Maintenance */}
        <div className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]">
          <h3 className="font-semibold mb-4">Maintenance Mode</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('maintenance_mode')}
              type="checkbox"
              value="true"
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm text-[--color-foreground]">Enable maintenance mode</span>
          </label>
          <p className="text-xs text-[--color-muted] mt-2">When enabled, visitors will see a maintenance page.</p>
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          icon={<MdSave size={16} />}
          disabled={!isDirty}
        >
          Save Settings
        </Button>
      </form>
    </CMSLayout>
  );
}
