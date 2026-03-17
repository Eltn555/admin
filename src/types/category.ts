export enum LanguageCode {
  ENGLISH = 'en',
  UZBEK = 'uz',
  RUSSIAN = 'ru',
  KAZAKH = 'kk',
  KYRGYZ = 'ky',
  TAJIK = 'tg',
  TURKMEN = 'tk',
  TURKISH = 'tr',
  ARABIC = 'ar',
  PERSIAN = 'fa',
  CHINESE = 'zh',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  FRENCH = 'fr',
  GERMAN = 'de',
  SPANISH = 'es',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  HINDI = 'hi',
}

export interface CategoryTranslation {
  language: {
    code: string;
  };
  name: string;
  description?: string;
}

export interface CategoryParent {
  id: string;
  slug: string;
  translations: {
    language: {
      code: string;
    };
  }[];
}

export interface Category {
  id: string;
  slug: string;
  isActive: boolean;
  position: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  translations: CategoryTranslation[];
  parent: CategoryParent | null;
  _count: {
    children: number;
  };
}

export interface CategoriesResponse {
  results: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoryTranslationInput {
  name: string;
  description?: string;
  languageCode: string;
}

export interface CreateCategoryDto {
  translations: CategoryTranslationInput[];
  slug?: string;
  isActive?: boolean;
  position?: number;
  parentId?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
}
