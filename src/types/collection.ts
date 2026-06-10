import { Product } from "./product";

export enum CollectionType {
  MAIN = "MAIN",
  SUGGESTED = "SUGGESTED",
  FAMOUS = "FAMOUS",
  SALE = "SALE",
  SEASONAL = "SEASONAL",
}

export const COLLECTION_LABELS: Record<CollectionType, string> = {
  [CollectionType.MAIN]: "Main",
  [CollectionType.SUGGESTED]: "Suggested",
  [CollectionType.FAMOUS]: "Famous",
  [CollectionType.SALE]: "Sale",
  [CollectionType.SEASONAL]: "Seasonal",
};

export const COLLECTION_TYPES = Object.values(CollectionType);

export interface ProductCollection {
  id: string;
  collection: CollectionType;
  position: number;
  productId: string;
  product: Product;
}

export interface ProductCollectionsResponse {
  results: ProductCollection[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateProductCollectionDto {
  collection: CollectionType;
  productId: string;
  position?: number;
}

export type UpdateProductCollectionDto = Partial<Pick<CreateProductCollectionDto, "collection" | "position">>;

export interface GetProductCollectionsParams {
  collection: CollectionType;
  page: number;
  pageSize: number;
  isActive?: boolean;
}
