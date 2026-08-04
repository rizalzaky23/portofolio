import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { minioClient, ensureBucketExists } from '../../config/minio.js';
import { env } from '../../config/env.js';
import type {
  IStorageProvider,
  UploadOptions,
  UploadResult,
} from './IStorageProvider.js';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const isImage = (mimeType: string): boolean => IMAGE_MIME_TYPES.has(mimeType);

const buildObjectName = (folder: string, filename: string): string =>
  `${folder}/${filename}`;

export class MinIOProvider implements IStorageProvider {
  private bucket: string;

  constructor() {
    this.bucket = env.MINIO_BUCKET_NAME;
  }

  async initialize(): Promise<void> {
    await ensureBucketExists();
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const {
      folder = 'general',
      mimeType = 'application/octet-stream',
      optimize = true,
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
    } = options;

    let processedBuffer = buffer;
    let finalMimeType = mimeType;
    let width: number | undefined;
    let height: number | undefined;

    if (isImage(mimeType) && optimize) {
      const sharpInstance = sharp(buffer);
      const metadata = await sharpInstance.metadata();

      const shouldResize =
        (metadata.width ?? 0) > maxWidth || (metadata.height ?? 0) > maxHeight;

      const processed = shouldResize
        ? sharpInstance.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
        : sharpInstance;

      const result = await processed
        .webp({ quality })
        .toBuffer({ resolveWithObject: true });

      processedBuffer = result.data;
      finalMimeType = 'image/webp';
      width = result.info.width;
      height = result.info.height;
    }

    const ext = finalMimeType === 'image/webp' ? '.webp'
      : finalMimeType === 'application/pdf' ? '.pdf'
      : options.filename
        ? ''
        : '';

    const filename =
      options.filename ?? `${uuidv4()}${ext}`;
    const objectName = buildObjectName(folder, filename);

    await minioClient.putObject(
      this.bucket,
      objectName,
      processedBuffer,
      processedBuffer.length,
      { 'Content-Type': finalMimeType },
    );

    return {
      filename: objectName,
      url: this.getPublicUrl(objectName),
      size: processedBuffer.length,
      mimeType: finalMimeType,
      width,
      height,
    };
  }

  async delete(filename: string): Promise<void> {
    await minioClient.removeObject(this.bucket, filename);
  }

  async replace(
    filename: string,
    buffer: Buffer,
    options: UploadOptions,
  ): Promise<UploadResult> {
    await this.delete(filename);
    return this.upload(buffer, { ...options, filename: filename.split('/').pop() });
  }

  async getSignedUrl(filename: string, expirySeconds = 3600): Promise<string> {
    return minioClient.presignedGetObject(this.bucket, filename, expirySeconds);
  }

  getPublicUrl(filename: string): string {
    return `${env.MINIO_PUBLIC_URL}/${this.bucket}/${filename}`;
  }

  async listFiles(folder = ''): Promise<string[]> {
    const files: string[] = [];
    const stream = minioClient.listObjects(
      this.bucket,
      folder ? `${folder}/` : '',
      true,
    );
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) files.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }
}

// Singleton storage provider
export const storage = new MinIOProvider();
