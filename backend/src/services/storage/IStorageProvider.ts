// Abstract storage provider interface — enables swapping MinIO for S3, GCS, etc.
export interface UploadOptions {
  folder?: string;
  filename?: string;
  mimeType?: string;
  optimize?: boolean;         // resize/compress images
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface UploadResult {
  filename: string;           // stored object name
  url: string;                // public URL
  size: number;               // bytes after processing
  mimeType: string;
  width?: number;
  height?: number;
}

export interface IStorageProvider {
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(filename: string): Promise<void>;
  replace(filename: string, buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  getSignedUrl(filename: string, expirySeconds?: number): Promise<string>;
  getPublicUrl(filename: string): string;
  listFiles(folder?: string): Promise<string[]>;
}
