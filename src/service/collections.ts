import axios from "../lib/axios";
import {
  CreateProductCollectionDto,
  GetProductCollectionsParams,
  ProductCollection,
  ProductCollectionsResponse,
  UpdateProductCollectionDto,
} from "../types/collection";

export class CollectionService {
  public static async getCollections(
    params: GetProductCollectionsParams
  ): Promise<ProductCollectionsResponse> {
    try {
      const { data } = await axios.get("/product-collections", { params });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async getCollection(id: string): Promise<ProductCollection> {
    try {
      const { data } = await axios.get(`/product-collections/${id}`);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async createCollection(dto: CreateProductCollectionDto): Promise<ProductCollection> {
    try {
      const { data } = await axios.post("/product-collections", dto);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async updateCollection(
    id: string,
    dto: UpdateProductCollectionDto
  ): Promise<ProductCollection> {
    try {
      const { data } = await axios.patch(`/product-collections/${id}`, dto);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async deleteCollection(id: string): Promise<void> {
    try {
      await axios.delete(`/product-collections/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
