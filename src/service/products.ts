import axios from '../lib/axios';
import {
  BulkUploadResponse,
  CreateProductDto,
  GetProductsParams,
  Product,
  ProductsResponse,
  UpdateProductDto,
} from '../types/product';

export class ProductService {
  public static async getProducts(params?: GetProductsParams): Promise<ProductsResponse> {
    try {
      const { data } = await axios.get('/products', { params });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async getProduct(id: string): Promise<Product> {
    try {
      const { data } = await axios.get(`/products/${id}`);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async createProduct(dto: CreateProductDto): Promise<Product> {
    try {
      const { data } = await axios.post('/products', dto);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      const { data } = await axios.patch(`/products/${id}`, dto);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async deleteProduct(id: string): Promise<void> {
    try {
      await axios.delete(`/products/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async downloadBulkSample(): Promise<void> {
    try {
      const response = await axios.get('/products/bulk-sample', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products-sample.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async bulkUpload(file: File): Promise<BulkUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('/products/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
