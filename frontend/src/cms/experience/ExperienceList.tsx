import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdCloudUpload } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { experienceService } from '@/services';
import type { Experience } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDateShort } from '@/lib/utils';

export default function CMSExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await experienceService.list();
    setExperiences(r.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<{
    company: string; position: string; description: string; website: string;
    startDate: string; endDate: string; current: boolean; displayOrder: number;
  }>();

  const isCurrent = watch('current');

  const openModal = (item?: Experience) => {
    setEditing(item ?? null);
    if (item) {
      reset({
        company: item.company,
        position: item.position,
        description: item.description,
        website: item.website ?? '',
        startDate: new Date(item.startDate).toISOString().split('T')[0],
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        current: item.current,
        displayOrder: item.displayOrder,
      });
    } else {
      reset({ current: false, displayOrder: 0, company: '', position: '', description: '' });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data: {
    company: string; position: string; description: string; website: string;
    startDate: string; endDate: string; current: boolean; displayOrder: number;
  }) => {
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: !data.current && data.endDate ? new Date(data.endDate).toISOString() : null,
      website: data.website || null,
    };

    let savedId: string;
    if (editing) {
      await experienceService.update(editing.id, payload);
      savedId = editing.id;
    } else {
      const r = await experienceService.create(payload);
      savedId = r.data.data.id;
    }

    if (logoFile) {
      setUploadingLogo(true);
      await experienceService.uploadLogo(savedId, logoFile);
      setUploadingLogo(false);
      setLogoFile(null);
    }

    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await experienceService.delete(id);
    await load();
  };

  const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]';

  return (
    <CMSLayout title="Experience">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[--color-muted] text-sm">{experiences.length} positions recorded</p>
        <Button variant="primary" icon={<MdAdd size={16} />} onClick={() => openModal()}>
          Add Experience
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-20 text-[--color-muted]">
          <p className="mb-4">No experience entries found.</p>
          <Button variant="outline" icon={<MdAdd size={14} />} onClick={() => openModal()}>
            Add first position
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((item, i) => (
            <motion.div
              key={item.id}
              className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] flex items-start gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {item.logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[--color-background] shrink-0 border border-[--color-border]">
                  <img src={item.logo} alt={item.company} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[--color-background] shrink-0 border border-[--color-border] flex items-center justify-center font-bold text-[--color-accent]">
                  {item.company.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-base text-[--color-foreground]">{item.position}</h3>
                    <p className="text-sm text-[--color-accent] font-medium">{item.company}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.current && <Badge variant="accent">Current</Badge>}
                    <button onClick={() => openModal(item)} className="p-1.5 text-[--color-muted] hover:text-[--color-foreground] cursor-pointer">
                      <MdEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[--color-muted] hover:text-[--color-destructive] cursor-pointer">
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[--color-muted] mb-3">
                  {formatDateShort(item.startDate)} — {item.current ? 'Present' : (item.endDate ? formatDateShort(item.endDate) : '')}
                </p>

                <p className="text-sm text-[--color-muted] leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Experience' : 'New Experience'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Company *</label>
              <input {...register('company', { required: 'Required' })} className={inputClass} placeholder="Tech Company Inc." />
              {errors.company && <p className="text-xs text-[--color-destructive] mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Position *</label>
              <input {...register('position', { required: 'Required' })} className={inputClass} placeholder="Senior Frontend Engineer" />
              {errors.position && <p className="text-xs text-[--color-destructive] mt-1">{errors.position.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Description *</label>
            <textarea {...register('description', { required: 'Required' })} className={`${inputClass} min-h-[100px] resize-y`} placeholder="Responsibilities & key achievements..." />
            {errors.description && <p className="text-xs text-[--color-destructive] mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Start Date *</label>
              <input {...register('startDate', { required: 'Required' })} type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">End Date</label>
              <input {...register('endDate')} type="date" className={inputClass} disabled={isCurrent} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('current')} type="checkbox" className="accent-[--color-accent]" />
            <span className="text-sm">I currently work here</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Company Website</label>
            <input {...register('website')} type="url" className={inputClass} placeholder="https://company.com" />
          </div>

          {/* Logo Upload */}
          <div>
            <p className="text-xs text-[--color-muted] mb-2">Company Logo</p>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-[--color-background] border border-[--color-border] border-dashed rounded-xl cursor-pointer hover:border-[--color-accent]/50 transition-colors">
              <MdCloudUpload size={18} className="text-[--color-muted]" />
              <span className="text-sm text-[--color-muted]">{logoFile ? logoFile.name : 'Choose logo file...'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <Button type="submit" loading={isSubmitting || uploadingLogo} className="w-full justify-center">
            {editing ? 'Save Changes' : 'Create Experience'}
          </Button>
        </form>
      </Modal>
    </CMSLayout>
  );
}
