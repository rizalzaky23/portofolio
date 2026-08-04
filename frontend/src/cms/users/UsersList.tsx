import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdPerson } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { userService } from '@/services';
import type { User } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function CMSUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await userService.list();
    setUsers(r.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{
    name: string; email: string; password?: string; role: 'ADMIN' | 'EDITOR';
  }>();

  const openModal = (item?: User) => {
    setEditing(item ?? null);
    if (item) {
      reset({ name: item.name, email: item.email, role: item.role, password: '' });
    } else {
      reset({ name: '', email: '', role: 'EDITOR', password: '' });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data: {
    name: string; email: string; password?: string; role: 'ADMIN' | 'EDITOR';
  }) => {
    if (editing) {
      await userService.update(editing.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
      });
    } else {
      if (!data.password) return;
      await userService.create({
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password,
      });
    }

    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm('Delete this user?')) return;
    await userService.delete(id);
    await load();
  };

  const inputClass = 'w-full px-4 py-2.5 bg-[--color-background] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent]';

  return (
    <CMSLayout title="User Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[--color-muted] text-sm">{users.length} registered users</p>
        <Button variant="primary" icon={<MdAdd size={16} />} onClick={() => openModal()}>
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="rounded-[--radius-xl] border border-[--color-border] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[--color-surface] border-b border-[--color-border]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase hidden sm:table-cell">Last Login</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {users.map((u) => (
                <tr key={u.id} className="bg-[--color-background] hover:bg-[--color-surface] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[--color-accent] flex items-center justify-center text-[--color-background] font-bold text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[--color-foreground]">{u.name}</p>
                        <p className="text-xs text-[--color-muted]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'ADMIN' ? 'accent' : 'default'}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[--color-muted] hidden sm:table-cell">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(u)} className="p-1.5 text-[--color-muted] hover:text-[--color-foreground] cursor-pointer">
                        <MdEdit size={16} />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-[--color-muted] hover:text-[--color-destructive] cursor-pointer">
                          <MdDelete size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'New User'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Full Name *</label>
            <input {...register('name', { required: 'Required' })} className={inputClass} placeholder="Jane Doe" />
            {errors.name && <p className="text-xs text-[--color-destructive] mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Email Address *</label>
            <input {...register('email', { required: 'Required' })} type="email" className={inputClass} placeholder="jane@example.com" />
            {errors.email && <p className="text-xs text-[--color-destructive] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">
              Password {editing ? '(leave blank to keep current)' : '*'}
            </label>
            <input {...register('password', { required: editing ? false : 'Password is required' })} type="password" className={inputClass} placeholder="••••••••" />
            {errors.password && <p className="text-xs text-[--color-destructive] mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[--color-foreground] mb-1">Role *</label>
            <select {...register('role')} className={inputClass}>
              <option value="ADMIN">ADMIN</option>
              <option value="EDITOR">EDITOR</option>
            </select>
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full justify-center">
            {editing ? 'Save Changes' : 'Create User'}
          </Button>
        </form>
      </Modal>
    </CMSLayout>
  );
}
