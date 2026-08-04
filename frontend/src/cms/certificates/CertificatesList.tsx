import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdOpenInNew, MdCloudUpload } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { certificateService } from '@/services';
import type { Certificate } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function CMSCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await certificateService.list({ limit: 50 });
    setCertificates(r.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{
    title: string; issuer: string; credentialId: string; credentialUrl: string;
    issueDate: string; expirationDate: string; featured: boolean; displayOrder: number;
  }>();

  const openModal = (item?: Certificate) => {
    setEditing(item ?? null);
    if (item) {
      reset({
        title: item.title,
        issuer: item.issuer,
        credentialId: item.credentialId ?? '',
        credentialUrl: item.credentialUrl ?? '',
        issueDate: new Date(item.issueDate).toISOString().split('T')[0],
        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
        featured: item.featured,
        displayOrder: item.displayOrder,
      });
    } else {
      reset({ featured: false, displayOrder: 0, issuer: '', title: '' });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data: {
    title: string; issuer: string; credentialId: string; credentialUrl: string;
    issueDate: string; expirationDate: string; featured: boolean; displayOrder: number;
  }) => {
    const payload = {
      ...data,
      issueDate: new Date(data.issueDate).toISOString(),
      expirationDate: data.expirationDate ? new Date(data.expirationDate).toISOString() : null,
      credentialId: data.credentialId || null,
      credentialUrl: data.credentialUrl || null,
    };

    if (editing) {
      await certificateService.update(editing.id, payload);
    } else {
      await certificateService.create(payload);
    }

    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate?')) return;
    await certificateService.delete(id);
    await load();
  };

  const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]';

  return (
    <CMSLayout title="Certificates">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[--color-muted] text-sm">{certificates.length} certificates total</p>
        <Button variant="primary" icon={<MdAdd size={16} />} onClick={() => openModal()}>
          Add Certificate
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-20 text-[--color-muted]">
          <p className="mb-4">No certificates found.</p>
          <Button variant="outline" icon={<MdAdd size={14} />} onClick={() => openModal()}>
            Add first certificate
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {certificates.map((item, i) => (
            <motion.div
              key={item.id}
              className="p-5 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] hover:border-[--color-accent]/40 transition-all flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="accent">{item.issuer}</Badge>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openModal(item)} className="p-1.5 text-[--color-muted] hover:text-[--color-foreground] cursor-pointer">
                      <MdEdit size={15} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[--color-muted] hover:text-[--color-destructive] cursor-pointer">
                      <MdDelete size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-[--color-foreground] leading-tight mb-2">{item.title}</h3>
                {item.credentialId && (
                  <p className="text-xs text-[--color-muted] mb-1 font-mono">ID: {item.credentialId}</p>
                )}
                <p className="text-xs text-[--color-muted] mb-4">
                  Issued: {formatDate(item.issueDate, { year: 'numeric', month: 'short' })}
                  {item.expirationDate ? ` · Expires: ${formatDate(item.expirationDate, { year: 'numeric', month: 'short' })}` : ' · No Expiration'}
                </p>
              </div>

              {item.credentialUrl && (
                <a
                  href={item.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[--color-accent] hover:underline mt-2"
                >
                  <MdOpenInNew size={14} /> Verify Credential
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Certificate' : 'New Certificate'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Title *</label>
            <input {...register('title', { required: 'Title is required' })} className={inputClass} placeholder="AWS Certified Developer" />
            {errors.title && <p className="text-xs text-[--color-destructive] mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Issuer *</label>
            <input {...register('issuer', { required: 'Issuer is required' })} className={inputClass} placeholder="Amazon Web Services" />
            {errors.issuer && <p className="text-xs text-[--color-destructive] mt-1">{errors.issuer.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Issue Date *</label>
              <input {...register('issueDate', { required: 'Required' })} type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--color-foreground] mb-1">Expiration Date</label>
              <input {...register('expirationDate')} type="date" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Credential ID</label>
            <input {...register('credentialId')} className={inputClass} placeholder="AWS-DEV-12345" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Credential URL</label>
            <input {...register('credentialUrl')} type="url" className={inputClass} placeholder="https://aws.amazon.com/verify/..." />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('featured')} type="checkbox" className="accent-[--color-accent]" />
            <span className="text-sm">Featured</span>
          </label>

          <Button type="submit" loading={isSubmitting} className="w-full justify-center">
            {editing ? 'Save Changes' : 'Create Certificate'}
          </Button>
        </form>
      </Modal>
    </CMSLayout>
  );
}
