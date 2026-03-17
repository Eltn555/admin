import axios from '../lib/axios';
import { CategoriesResponse, Category, CreateCategoryDto, GetCategoriesParams, UpdateCategoryDto } from '../types/category';

export class CategoryService {
  public static async getCategories(params?: GetCategoriesParams): Promise<CategoriesResponse> {
    try {
      const { data } = await axios.get('/categories', { params });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async getCategory(id: string): Promise<Category> {
    try {
      const { data } = await axios.get(`/categories/${id}`);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async createCategory(dto: CreateCategoryDto): Promise<Category> {
    try {
      const { data } = await axios.post('/categories', dto);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const { data } = await axios.patch(`/categories/${id}`, dto);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async deleteCategory(id: string): Promise<void> {
    try {
      await axios.delete(`/categories/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
