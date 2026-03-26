export interface ProductTranslation {
  language: {
    code: string;
  };
  name: string;
  description?: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  translations: {
    language: {
      code: string;
    };
  }[];
}

import { UploadedFile } from "./file";

export interface Product {
  id: string;
  slug?: string;
  stock: number;
  price: number;
  salePrice: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  translations: ProductTranslation[];
  categories: ProductCategory[];
  files: UploadedFile[];
}

export interface ProductsResponse {
  results: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductTranslationInput {
  name: string;
  description?: string;
  languageCode: string;
}

export interface CreateProductDto {
  translations: ProductTranslationInput[];
  slug?: string;
  stock?: number;
  price: number;
  salePrice?: number;
  isActive?: boolean;
  categoryIds?: string[];
  fileIds?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface BulkUploadResult {
  success: boolean;
  row: number;
  slug: string;
  name: string;
  price: number;
  salePrice?: number;
  categoryName: string;
  action: "created" | "updated" | "failed";
  message: string;
}

export interface BulkUploadResponse {
  results: BulkUploadResult[];
  total: number;
  totalSuccess: number;
  totalFailed: number;
  createdProducts: number;
  updatedProducts: number;
}
