import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class UploadService {
  private client: S3Client | null = null;
  private bucket = '';
  private publicBase = '';

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('s3.endpoint');
    const accessKey = config.get<string>('s3.accessKey');
    const secretKey = config.get<string>('s3.secretKey');
    const bucket = config.get<string>('s3.bucket');
    const region = config.get<string>('s3.region') ?? 'us-east-1';
    const publicBase = config.get<string>('s3.publicBase');
    if (endpoint && accessKey && secretKey && bucket && publicBase) {
      this.bucket = bucket;
      this.publicBase = publicBase.replace(/\/$/, '');
      this.client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle: true,
      });
    }
  }

  enabled() {
    return this.client !== null;
  }

  async presignPut(contentType: string, filename: string) {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Upload chưa cấu hình (S3/MinIO). Xem .env S3_*',
      );
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      throw new BadRequestException(
        `Chỉ cho phép: ${[...ALLOWED_TYPES].join(', ')}`,
      );
    }
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const key = `uploads/${randomUUID()}-${safe || 'image'}`;
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, cmd, { expiresIn: 300 });
    const publicUrl = `${this.publicBase}/${key}`;
    return { uploadUrl, publicUrl, key, contentType };
  }
}
