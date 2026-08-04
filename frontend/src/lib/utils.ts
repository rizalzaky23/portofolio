import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]): string => clsx(inputs);

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(new Date(date));

export const formatDateShort = (date: string | Date): string =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(new Date(date));

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
