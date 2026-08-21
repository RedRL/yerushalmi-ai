import { randomUUID } from 'node:crypto';
import { PassThrough, type Readable } from 'node:stream';
import { ZipArchive } from 'archiver';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { NotFoundError, ValidationError } from '../types/errors';
import {
  buildInquiryPhotoBundleKey,
  buildInquiryStorageKey,
  extractInquiryFolderId,
  isInquiryPhotoBundleKey,
  isManagedStorageKey,
  isValidInquiryFolderId,
  resolveUploadFolderId,
} from './storage-key.util';
import type {
  CompleteUploadResult,
  CreateInquiryPhotoBundleInput,
  InitiateUploadInput,
  InitiateUploadResult,
  StorageService,
} from './storage.types';

const PRESIGN_EXPIRY_SECONDS = 15 * 60;

export class R2StorageService implements StorageService {
  public readonly providerName = 'r2';

  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl } = env.r2;

    this.bucket = bucketName;
    this.publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async initiateUpload(input: InitiateUploadInput): Promise<InitiateUploadResult> {
    const folderId = resolveUploadFolderId(
      input.contactName ?? '',
      input.inquiryFolderId,
      new Date(),
      input.inquiryReferenceId,
    );
    this.assertValidFolderId(folderId);

    const storageKey = buildInquiryStorageKey(
      folderId,
      input.fileName,
      randomUUID().slice(0, 8),
    );
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: input.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: PRESIGN_EXPIRY_SECONDS,
    });

    return {
      storageKey,
      uploadUrl,
      method: 'PUT',
      expiresAt: new Date(Date.now() + PRESIGN_EXPIRY_SECONDS * 1000).toISOString(),
    };
  }

  async completeUpload(storageKey: string): Promise<CompleteUploadResult> {
    if (!isManagedStorageKey(storageKey) && !isInquiryPhotoBundleKey(storageKey)) {
      throw new ValidationError('מפתח אחסון לא תקין');
    }

    await this.assertObjectExists(storageKey);

    return {
      storageKey,
      url: this.getPublicUrl(storageKey),
    };
  }

  async createInquiryPhotoBundle(input: CreateInquiryPhotoBundleInput): Promise<CompleteUploadResult> {
    this.assertValidFolderId(input.folderId);

    const imageKeys = input.storageKeys.filter(
      (key) => isManagedStorageKey(key) && extractInquiryFolderId(key) === input.folderId,
    );

    if (imageKeys.length === 0) {
      throw new ValidationError('לא נמצאו תמונות ליצירת קובץ ZIP');
    }

    const bundleKey = buildInquiryPhotoBundleKey(input.folderId);
    const passThrough = new PassThrough();
    const archive = new ZipArchive({ zlib: { level: 5 } });

    archive.on('error', (error: Error) => {
      passThrough.destroy(error);
    });

    archive.pipe(passThrough);

    const uploadPromise = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: bundleKey,
        Body: passThrough,
        ContentType: 'application/zip',
      },
    }).done();

    for (const storageKey of imageKeys) {
      const object = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );

      if (!object.Body) {
        throw new NotFoundError(`הקובץ ${storageKey} לא נמצא באחסון`);
      }

      const entryName = storageKey.split('/').pop() ?? storageKey;
      archive.append(object.Body as Readable, { name: entryName });
    }

    await archive.finalize();
    await uploadPromise;

    return {
      storageKey: bundleKey,
      url: this.getPublicUrl(bundleKey),
    };
  }

  getPublicUrl(storageKey: string): string {
    const encodedKey = storageKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `${this.publicBaseUrl}/${encodedKey}`;
  }

  private assertValidFolderId(folderId: string): void {
    if (!isValidInquiryFolderId(folderId)) {
      throw new ValidationError('מזהה תיקיית העלאה לא תקין');
    }
  }

  private async assertObjectExists(storageKey: string): Promise<void> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );
    } catch (error) {
      const errorName = error instanceof Error ? error.name : '';
      if (errorName === 'NotFound' || errorName === 'NoSuchKey') {
        throw new NotFoundError('הקובץ לא נמצא באחסון. ייתכן שההעלאה לא הושלמה.');
      }
      throw error;
    }
  }
}
