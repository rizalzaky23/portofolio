import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdCloudUpload, MdDelete, MdDriveFileRenameOutline, MdSearch, MdImage, MdPictureAsPdf, MdLink } from 'react-icons/md';
import { mediaService } from '@/services';
import type { Media } from '@/types';
import { CMSLayout } from '../Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatBytes, formatDate } from '@/lib/utils';

export default function CMSMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: 24 };
    if (search) params.search = search;
    if (folder) params.folder = folder;
    const r = await mediaService.list(params);
    setMedia(r.data.data);
    setTotal(r.data.meta?.total ?? 0);
    setLoading(false);
  }, [page, search, folder]);

  useEffect(() => { void load(); }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    await mediaService.upload(Array.from(files), folder || 'general');
    await load();
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    await mediaService.delete(id);
    await load();
  };

  const handleBulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} files permanently?`)) return;
    await Promise.all(Array.from(selected).map((id) => mediaService.delete(id)));
    setSelected(new Set());
    await load();
  };

  const handleRename = async () => {
    if (!renaming) return;
    await mediaService.rename(renaming.id, renaming.name);
    setRenaming(null);
    await load();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isPdf   = (mimeType: string) => mimeType === 'application/pdf';

  return (
    <CMSLayout title="Media Library">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted]" />
          <input
            type="search"
            placeholder="Search files..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 bg-[--color-surface] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent] w-48"
          />
        </div>

        <select
          value={folder}
          onChange={(e) => { setFolder(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[--color-surface] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent] cursor-pointer"
        >
          <option value="">All Folders</option>
          {['general', 'projects/covers', 'projects/gallery', 'achievements', 'certificates', 'about', 'experiences', 'avatars'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {selected.size > 0 && (
          <Button variant="danger" size="sm" icon={<MdDelete size={14} />} onClick={handleBulkDelete}>
            Delete {selected.size} selected
          </Button>
        )}

        <div className="ml-auto">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            variant="primary"
            icon={<MdCloudUpload size={16} />}
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Files
          </Button>
        </div>
      </div>

      {/* Drop zone hint */}
      <p className="text-xs text-[--color-muted] mb-4">{total} files total · Images are auto-optimized to WebP</p>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : media.length === 0 ? (
        <div className="text-center py-20">
          <MdCloudUpload size={48} className="mx-auto mb-4 text-[--color-muted] opacity-30" />
          <p className="text-[--color-muted]">No files found. Upload some media!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {media.map((file, i) => (
            <motion.div
              key={file.id}
              className={`group relative rounded-[--radius-xl] overflow-hidden border-2 transition-all cursor-pointer
                ${selected.has(file.id) ? 'border-[--color-accent]' : 'border-transparent'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => toggleSelect(file.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-[--color-surface] flex items-center justify-center">
                {isImage(file.mimeType) ? (
                  <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" loading="lazy" />
                ) : isPdf(file.mimeType) ? (
                  <MdPictureAsPdf size={40} className="text-red-400" />
                ) : (
                  <MdImage size={40} className="text-[--color-muted]" />
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setRenaming({ id: file.id, name: file.originalName }); }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Rename"
                >
                  <MdDriveFileRenameOutline size={16} />
                </button>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Open"
                >
                  <MdLink size={16} />
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <MdDelete size={16} />
                </button>
              </div>

              {/* Info */}
              <div className="p-2 bg-[--color-surface]">
                <p className="text-xs text-[--color-foreground] truncate" title={file.originalName}>{file.originalName}</p>
                <p className="text-[10px] text-[--color-muted]">{formatBytes(file.size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 24 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[--color-muted]">{total} files</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 24 >= total}>Next</Button>
          </div>
        </div>
      )}

      {/* Rename modal */}
      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setRenaming(null)}>
          <div className="w-full max-w-sm p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Rename File</h3>
            <input
              value={renaming.name}
              onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent] mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleRename} className="flex-1 justify-center">Rename</Button>
              <Button variant="ghost" onClick={() => setRenaming(null)} className="flex-1 justify-center">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </CMSLayout>
  );
}
