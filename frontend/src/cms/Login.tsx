import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';
import { authService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function CMSLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await authService.login(data.email, data.password);
      setAuth(res.data.data.user, res.data.data.accessToken);
      navigate('/admin');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[--color-background] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[--color-accent]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[--color-surface]/50 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-[--font-heading] font-bold text-3xl">
            RZ<span className="text-[--color-accent]">.</span>
          </span>
          <p className="text-[--color-muted] text-sm mt-2">CMS Dashboard</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-[--radius-2xl] bg-[--color-surface] border border-[--color-border] shadow-[--shadow-lg]">
          <h1 className="text-2xl font-[--font-heading] font-bold mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[--color-foreground] mb-2">
                Email Address
              </label>
              <div className="relative">
                <MdEmail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted]" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@rizalzaky.dev"
                  className={`w-full pl-10 pr-4 py-3 bg-[--color-background] border rounded-xl text-sm text-[--color-foreground] placeholder-[--color-muted]/60 focus:outline-none focus:ring-1 transition-all
                    ${errors.email ? 'border-[--color-destructive] focus:ring-[--color-destructive]/20' : 'border-[--color-border] focus:border-[--color-accent] focus:ring-[--color-accent]/20'}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-[--color-destructive]">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[--color-foreground] mb-2">
                Password
              </label>
              <div className="relative">
                <MdLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted]" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-[--color-background] border rounded-xl text-sm text-[--color-foreground] placeholder-[--color-muted]/60 focus:outline-none focus:ring-1 transition-all
                    ${errors.password ? 'border-[--color-destructive] focus:ring-[--color-destructive]/20' : 'border-[--color-border] focus:border-[--color-accent] focus:ring-[--color-accent]/20'}`}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-[--color-destructive]">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="p-3 rounded-lg bg-[--color-destructive]/10 border border-[--color-destructive]/20 text-sm text-[--color-destructive]">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              icon={<MdLogin size={16} />}
              className="w-full justify-center"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[--color-muted] mt-6">
          Default: admin@rizalzaky.dev / Admin@123456
        </p>
      </motion.div>
    </div>
  );
}
