import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdSend, MdCheckCircle } from 'react-icons/md';
import { messageService } from '@/services';
import { Button } from '@/components/ui/Button';

const MotionDiv = motion.div;

const contactSchema = z.object({
  name:    z.string().min(1, 'Name is required').max(100),
  email:   z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  body:    z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

type ContactForm = z.infer<typeof contactSchema>;

const CONTACT_INFO = [
  { icon: MdEmail,       label: 'Email',     value: 'hello@rizalzaky.dev', href: 'mailto:hello@rizalzaky.dev' },
  { icon: MdLocationOn,  label: 'Location',  value: 'Indonesia 🇮🇩', href: null },
  { icon: FaGithub,      label: 'GitHub',    value: 'github.com/rizalzaky', href: 'https://github.com/rizalzaky' },
  { icon: FaLinkedin,    label: 'LinkedIn',  value: 'linkedin.com/in/rizalzaky', href: 'https://linkedin.com/in/rizalzaky' },
  { icon: FaInstagram,   label: 'Instagram', value: '@rizalzaky', href: 'https://instagram.com/rizalzaky' },
];

function InputField({
  id, label, type = 'text', placeholder, error, rows, ...props
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  [key: string]: unknown;
}) {
  const baseClass = `w-full px-4 py-3 bg-[--color-surface] border rounded-xl text-[--color-foreground] placeholder-[--color-muted]/60 text-sm
    focus:outline-none focus:ring-1 transition-all duration-[--duration-base]
    ${error ? 'border-[--color-destructive] focus:border-[--color-destructive] focus:ring-[--color-destructive]/20' : 'border-[--color-border] focus:border-[--color-accent] focus:ring-[--color-accent]/20'}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[--color-foreground] mb-2">
        {label}
      </label>
      {rows ? (
        <textarea id={id} rows={rows} placeholder={placeholder} className={baseClass} {...props as object} />
      ) : (
        <input id={id} type={type} placeholder={placeholder} className={baseClass} {...props as object} />
      )}
      {error && <p className="mt-1.5 text-xs text-[--color-destructive]">{error}</p>}
    </div>
  );
}

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    setServerError('');
    try {
      await messageService.send(data);
      setSent(true);
      reset();
    } catch {
      setServerError('Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-[--color-slate-950]">
      <div className="container-portfolio">
        <MotionDiv
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-6xl font-[--font-heading] font-black">
            Let's build something<br />
            <span className="gradient-text">together</span>
          </h2>
        </MotionDiv>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[--color-muted] text-lg leading-relaxed mb-10">
              Whether you have a project in mind, want to collaborate, or just want to say hi — I'm always open to interesting conversations.
            </p>

            <div className="space-y-5">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[--color-surface] border border-[--color-border] text-[--color-accent] shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[--color-muted] font-medium uppercase tracking-wide">{label}</p>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-[--color-foreground] hover:text-[--color-accent] transition-colors text-sm">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-[--color-foreground]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map embed */}
            <div className="mt-10 rounded-[--radius-xl] overflow-hidden border border-[--color-border] aspect-[16/9]">
              <iframe
                title="Location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16069523.60760782!2d101.50734!3d-2.5489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2c4c07d7796f5fbf%3A0x526fa6f4affab8c2!2sIndonesia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-70"
              />
            </div>
          </MotionDiv>

          {/* Contact form */}
          <MotionDiv
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {sent ? (
              <motion.div
                className="h-full flex flex-col items-center justify-center text-center p-12 rounded-[--radius-2xl] border border-[--color-accent]/30 bg-[--color-accent-muted]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              >
                <MdCheckCircle size={56} className="text-[--color-accent] mb-4" />
                <h3 className="text-2xl font-[--font-heading] font-bold mb-2">Message Sent!</h3>
                <p className="text-[--color-muted]">Thanks for reaching out. I'll get back to you soon.</p>
                <Button variant="outline" className="mt-8" onClick={() => setSent(false)}>
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 p-8 rounded-[--radius-2xl] bg-[--color-surface] border border-[--color-border]"
                noValidate
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField
                    id="contact-name"
                    label="Your Name"
                    placeholder="Rizal Zaky"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <InputField
                    id="contact-email"
                    label="Email Address"
                    type="email"
                    placeholder="hello@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <InputField
                  id="contact-subject"
                  label="Subject"
                  placeholder="Let's work together"
                  error={errors.subject?.message}
                  {...register('subject')}
                />

                <InputField
                  id="contact-body"
                  label="Message"
                  placeholder="Tell me about your project..."
                  rows={6}
                  error={errors.body?.message}
                  {...register('body')}
                />

                {serverError && (
                  <p className="text-sm text-[--color-destructive]">{serverError}</p>
                )}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={<MdSend size={16} />}
                  className="w-full justify-center"
                >
                  Send Message
                </Button>
              </form>
            )}
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
