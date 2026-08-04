import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { skillService } from '@/services';
import type { Skill } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function CMSSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const load = useCallback(async () => {
    setLoading(true);
    const r = await skillService.list();
    setSkills(r.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{
    name: string; category: string; level: number; icon: string; displayOrder: number;
  }>();

  const openModal = (item?: Skill) => {
    setEditing(item ?? null);
    if (item) {
      reset({
        name: item.name,
        category: item.category,
        level: item.level,
        icon: item.icon ?? '',
        displayOrder: item.displayOrder,
      });
    } else {
      reset({ name: '', category: 'Frontend', level: 80, displayOrder: 0, icon: '' });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data: {
    name: string; category: string; level: number; icon: string; displayOrder: number;
  }) => {
    const payload = { ...data, icon: data.icon || null };
    if (editing) {
      await skillService.update(editing.id, payload);
    } else {
      await skillService.create(payload);
    }
    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await skillService.delete(id);
    await load();
  };

  const categories = ['All', ...new Set(skills.map((s) => s.category))];
  const filtered = selectedCat === 'All' ? skills : skills.filter((s) => s.category === selectedCat);

  const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]';

  return (
    <CMSLayout title="Skills">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                ${selectedCat === cat
                  ? 'bg-[--color-accent] text-[--color-background]'
                  : 'bg-[--color-surface] text-[--color-muted] border border-[--color-border] hover:text-[--color-foreground]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button variant="primary" icon={<MdAdd size={16} />} onClick={() => openModal()}>
          Add Skill
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[--color-muted]">
          <p className="mb-4">No skills found in this category.</p>
          <Button variant="outline" icon={<MdAdd size={14} />} onClick={() => openModal()}>
            Add skill
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="p-4 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] flex flex-col justify-between"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-[--color-foreground]">{item.name}</h3>
                  <Badge variant="outline" className="text-[10px] mt-1">{item.category}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(item)} className="p-1 text-[--color-muted] hover:text-[--color-foreground] cursor-pointer">
                    <MdEdit size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-[--color-muted] hover:text-[--color-destructive] cursor-pointer">
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[--color-muted] mb-1">
                  <span>Proficiency</span>
                  <span>{item.level}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[--color-background] overflow-hidden">
                  <div className="h-full bg-[--color-accent] rounded-full" style={{ width: `${item.level}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Skill' : 'New Skill'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Skill Name *</label>
            <input {...register('name', { required: 'Required' })} className={inputClass} placeholder="React / Node.js" />
            {errors.name && <p className="text-xs text-[--color-destructive] mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Category *</label>
              <input {...register('category', { required: 'Required' })} className={inputClass} placeholder="Frontend / Backend / DevOps" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Proficiency Level (1-100) *</label>
              <input {...register('level', { valueAsNumber: true, min: 1, max: 100 })} type="number" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Icon Identifier (react-icons name)</label>
            <input {...register('icon')} className={inputClass} placeholder="FaReact / SiTypescript" />
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full justify-center">
            {editing ? 'Save Changes' : 'Create Skill'}
          </Button>
        </form>
      </Modal>
    </CMSLayout>
  );
}
