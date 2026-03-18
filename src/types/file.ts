export interface UploadedFile {
    id: string;
    name: string;
    url: string;
    fileType: string;
    type: string;
    entityType: string;
    entityId: string;
    createdById: string;
    createdAt?: string;
  }

export interface UploadFileParams {
    type?: FileUsage;
    entityType?: EntityType;
    entityId?: string;
}

export type FileUsage = 'CATEGORY' | 'PRODUCT' | 'AVATAR' | 'PENDING';

export type EntityType = 'CATEGORY' | 'PRODUCT' | 'USER' | 'PENDING';