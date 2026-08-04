import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdDelete, MdMarkEmailRead, MdEmail } from 'react-icons/md';
import { messageService } from '@/services';
import type { Message } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

const statusVariant = {
  UNREAD:  'accent',
  READ:    'default',
  REPLIED: 'success',
} as const;

export default function CMSMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    const r = await messageService.list(params);
    setMessages(r.data.data);
    setTotal(r.data.meta?.total ?? 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { void load(); }, [load]);

  const openMessage = async (msg: Message) => {
    const r = await messageService.get(msg.id);
    setSelected(r.data.data);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'READ' } : m));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await messageService.delete(id);
    if (selected?.id === id) setSelected(null);
    await load();
  };

  const handleMarkReplied = async (id: string) => {
    await messageService.markReplied(id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: 'REPLIED' } : m));
    if (selected?.id === id) setSelected({ ...selected, status: 'REPLIED' });
  };

  return (
    <CMSLayout title="Messages">
      <div className="flex gap-3 mb-6">
        {['', 'UNREAD', 'READ', 'REPLIED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
              ${statusFilter === s
                ? 'bg-[--color-accent] text-[--color-background]'
                : 'bg-[--color-surface] text-[--color-muted] border border-[--color-border] hover:text-[--color-foreground]'
              }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-[--color-muted]">
          <MdEmail size={48} className="mx-auto mb-4 opacity-30" />
          <p>No messages found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <motion.button
              key={msg.id}
              className={`w-full text-left p-4 rounded-[--radius-xl] border transition-all cursor-pointer
                ${msg.status === 'UNREAD'
                  ? 'bg-[--color-surface] border-[--color-accent]/30'
                  : 'bg-[--color-background] border-[--color-border] hover:bg-[--color-surface]'
                }`}
              onClick={() => openMessage(msg)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${msg.status === 'UNREAD' ? 'bg-[--color-accent]' : 'bg-[--color-border]'}`} />
                <div className="flex-1 min-w-0 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
                  <div>
                    <p className="text-sm font-semibold text-[--color-foreground]">{msg.name}</p>
                    <p className="text-xs text-[--color-muted]">{msg.email}</p>
                  </div>
                  <p className="text-sm text-[--color-muted] truncate">{msg.subject}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusVariant[msg.status]}>{msg.status}</Badge>
                    <span className="text-xs text-[--color-muted]">
                      {formatDate(msg.createdAt, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[--color-muted]">{total} messages total</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next</Button>
          </div>
        </div>
      )}

      {/* Message viewer modal */}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.subject} size="lg">
        {selected && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[--color-border]">
              <div>
                <p className="font-semibold">{selected.name}</p>
                <a href={`mailto:${selected.email}`} className="text-sm text-[--color-accent] hover:underline">{selected.email}</a>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant[selected.status]}>{selected.status}</Badge>
                <p className="text-xs text-[--color-muted] mt-1">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            <p className="text-[--color-muted] leading-relaxed whitespace-pre-wrap mb-6">{selected.body}</p>

            <div className="flex gap-3">
              <Button
                variant="primary"
                icon={<MdMarkEmailRead size={16} />}
                onClick={() => handleMarkReplied(selected.id)}
                disabled={selected.status === 'REPLIED'}
              >
                Mark Replied
              </Button>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">Reply via Email</Button>
              </a>
              <Button
                variant="danger"
                icon={<MdDelete size={14} />}
                onClick={() => handleDelete(selected.id)}
                className="ml-auto"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </CMSLayout>
  );
}
