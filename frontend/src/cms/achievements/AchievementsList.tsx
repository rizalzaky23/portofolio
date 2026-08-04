// CMS: Achievements, Certificates, Experience, Skills — list pages with CRUD
// Each uses the same pattern: list + inline delete + modal form
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdCloudUpload } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { achievementService } from '@/services';
import type { Achievement } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  competition:  'Competition',
  award:        'Award',
  scholarship:  'Scholarship',
  recognition:  'Recognition',
  certificate:  'Certificate',
};

export default function CMSAchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await achievementService.list({ limit: 50 });
    setItems(r.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<{
    title: string; description: string; organizer: string; date: string;
    category: string; featured: boolean; displayOrder: number;
  }>();

  const openModal = (item?: Achievement) => {
    setEditing(item ?? null);
    if (item) {
      reset({
        title: item.title,
        description: item.description,
        organizer: item.organizer,
        date: new Date(item.date).toISOString().split('T')[0],
        category: item.category,
        featured: item.featured,
        displayOrder: item.displayOrder,
      });
    } else {
      reset({ featured: false, displayOrder: 0, category: 'competition' });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data: {
    title: string; description: string; organizer: string; date: string;
    category: string; featured: boolean; displayOrder: number;
  }) => {
    const payload = { ...data, category: data.category as import('@/types').AchievementCategory, date: new Date(data.date).toISOString() };
    let savedId: string;

    if (editing) {
      await achievementService.update(editing.id, payload);
      savedId = editing.id;
    } else {
      const r = await achievementService.create(payload);
      savedId = r.data.data.id;
    }

    if (certificateFile) {
      setUploadingCert(true);
      await achievementService.uploadCertificate(savedId, certificateFile);
      setUploadingCert(false);
      setCertificateFile(null);
    }

    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    await achievementService.delete(id);
    await load();
  };

  return (
    <CMSLayout title="Achievements">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[--color-muted] text-sm">{items.length} total achievements</p>
        <Button variant="primary" icon={<MdAdd size={16} />} onClick={() => openModal()}>
          Add Achievement
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] hover:border-[--color-accent]/40 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {item.certificateImage && (
                <div className="aspect-[16/9] rounded-[--radius-lg] overflow-hidden mb-4 bg-[--color-background]">
                  <img src={item.certificateImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-1.5">
                    <Badge variant="accent">{CATEGORY_LABELS[item.category] ?? item.category}</Badge>
                    {item.featured && <Badge variant="success">Featured</Badge>}
                  </div>
                  <h3 className="font-semibold text-sm text-[--color-foreground] leading-tight mb-1">{item.title}</h3>
                  <p className="text-xs text-[--color-muted]">{item.organizer} · {formatDate(item.date, { year: 'numeric', month: 'short' })}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openModal(item)} className="p-1.5 text-[--color-muted] hover:text-[--color-foreground] cursor-pointer">
                    <MdEdit size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[--color-muted] hover:text-[--color-destructive] cursor-pointer">
                    <MdDelete size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Achievement' : 'New Achievement'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('title', { required: 'Required' })} className="w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]" placeholder="Achievement title" />
          {errors.title && <p className="text-xs text-[--color-destructive]">{errors.title.message}</p>}

          <textarea {...register('description', { required: 'Required' })} className="w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent] min-h-[80px] resize-y" placeholder="Description" />

          <div className="grid grid-cols-2 gap-3">
            <input {...register('organizer', { required: 'Required' })} className="w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]" placeholder="Organizer" />
            <input {...register('date', { required: 'Required' })} type="date" className="w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]" />
          </div>

          <select {...register('category')} className="w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]">
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('featured')} type="checkbox" className="accent-[--color-accent]" />
            <span className="text-sm">Featured</span>
          </label>

          {/* Certificate upload */}
          <div>
            <p className="text-xs text-[--color-muted] mb-2">Certificate Image or PDF</p>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-[--color-background] border border-[--color-border] border-dashed rounded-xl cursor-pointer hover:border-[--color-accent]/50 transition-colors">
              <MdCloudUpload size={18} className="text-[--color-muted]" />
              <span className="text-sm text-[--color-muted]">{certificateFile ? certificateFile.name : 'Choose file...'}</span>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <Button type="submit" loading={isSubmitting || uploadingCert} className="w-full justify-center">
            {editing ? 'Save Changes' : 'Create Achievement'}
          </Button>
        </form>
      </Modal>
    </CMSLayout>
  );
}
