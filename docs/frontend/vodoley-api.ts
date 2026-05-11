// Vodoley API client for Vite + Quasar + Pinia + Axios
//
// - Set `VITE_API_BASE_URL` in your frontend `.env`, e.g. `http://localhost:3000`
// - Admin endpoints require JWT: call `authStore.login(...)` or `api.adminLogin(...)`
// - Images are served from `/uploads/...` (absolute URL is built via baseURL)

import axios, { AxiosError, AxiosInstance } from 'axios';
import { defineStore } from 'pinia';

export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  path: string;
  requestId: string;
  timestamp: string;
};

export type InventoryStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER';

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  children: CategoryNode[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Unit = {
  id: number;
  name: string;
  shortName: string;
  isActive: boolean;
  sortOrder: number;
};

export type ProductImage = {
  id?: number;
  url: string;
  alt?: string | null;
  sortOrder?: number;
  isMain?: boolean;
};

export type Inventory = {
  productId?: number;
  quantity: number;
  status: InventoryStatus;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  categoryId: number;
  unitId: number;
  images: ProductImage[];
  inventory: Inventory | null;
  unit?: Unit;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductSort = 'price_asc' | 'price_desc' | 'newest';

export type ProductListQuery = {
  q?: string;
  categoryId?: number;
  includeChildren?: boolean;
  unitId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type EstimatePreviewRequest = {
  items: Array<{ productId: number; quantity: number }>;
};

export type EstimatePreviewResponse = {
  items: Array<{
    productId: number;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }>;
  total: number;
};

export type AdminLoginRequest = { email: string; password: string };
export type AdminLoginResponse = { access_token: string };

export type CreateCategoryRequest = {
  name: string;
  slug: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
};
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type CreateUnitRequest = {
  name: string;
  shortName: string;
  isActive?: boolean;
};
export type UpdateUnitRequest = Partial<CreateUnitRequest>;

export type CreateProductRequest = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: number;
  unitId: number;
  isActive?: boolean;
  images?: ProductImage[];
  inventory?: Partial<Pick<Inventory, 'quantity' | 'status'>>;
};
export type UpdateProductRequest = Partial<CreateProductRequest>;
export type UpdateInventoryRequest = Partial<Pick<Inventory, 'quantity' | 'status'>>;

export type VodoleyApiConfig = {
  baseURL?: string;
  getToken?: () => string | null;
  getRequestId?: () => string | undefined;
};

function defaultBaseUrl() {
  const env = (import.meta as any)?.env;
  return (env?.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';
}

function joinUrl(baseURL: string, path: string) {
  const base = baseURL.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function createVodoleyApi(config: VodoleyApiConfig = {}) {
  const instance = axios.create({
    baseURL: config.baseURL ?? defaultBaseUrl(),
    withCredentials: true,
  });

  // Inject Authorization and x-request-id if present
  instance.interceptors.request.use((req) => {
    const token = config.getToken?.();
    if (token) {
      req.headers = req.headers ?? {};
      (req.headers as any).Authorization = `Bearer ${token}`;
    }

    const rid = config.getRequestId?.();
    if (rid) {
      req.headers = req.headers ?? {};
      (req.headers as any)['x-request-id'] = rid;
    }
    return req;
  });

  const api = {
    axios: instance as AxiosInstance,

    // Helpers
    getBaseURL() {
      return (instance.defaults.baseURL ?? defaultBaseUrl()) as string;
    },
    toAbsoluteUploadUrl(uploadPath: string) {
      // uploadPath from backend is like "/uploads/<file>"
      return joinUrl(api.getBaseURL(), uploadPath);
    },
    isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
      return axios.isAxiosError(error);
    },
    unwrapApiError(error: unknown): ApiErrorResponse | null {
      if (!axios.isAxiosError<ApiErrorResponse>(error)) return null;
      return (error.response?.data as ApiErrorResponse | undefined) ?? null;
    },

    // Public
    async health() {
      const { data } = await instance.get<{ status: 'ok' }>('/health');
      return data;
    },
    async categoriesTree() {
      const { data } = await instance.get<CategoryNode[]>('/categories');
      return data;
    },
    async productsList(query: ProductListQuery = {}) {
      const { data } = await instance.get<Paginated<Product>>('/products', { params: query });
      return data;
    },
    async productById(id: number) {
      const { data } = await instance.get<Product>(`/products/${id}`);
      return data;
    },
    async productRecommendations(id: number) {
      const { data } = await instance.get<Product[]>(`/products/${id}/recommendations`);
      return data;
    },
    async estimatePreview(payload: EstimatePreviewRequest) {
      const { data } = await instance.post<EstimatePreviewResponse>('/estimate/preview', payload);
      return data;
    },

    // Admin auth
    async adminLogin(payload: AdminLoginRequest) {
      const { data } = await instance.post<AdminLoginResponse>('/admin/auth/login', payload);
      return data;
    },

    // Admin / Products
    async adminProductsList() {
      const { data } = await instance.get<Product[]>('/admin/products');
      return data;
    },
    async adminProductById(id: number) {
      const { data } = await instance.get<Product>(`/admin/products/${id}`);
      return data;
    },
    async adminCreateProductJson(payload: CreateProductRequest) {
      // Backend supports JSON via service methods, but controller for create is multipart.
      // Use this only if you add a JSON create endpoint later.
      const { data } = await instance.post<Product>('/admin/products', payload);
      return data;
    },
    async adminCreateProductForm(payload: {
      name: string;
      slug: string;
      price: number;
      categoryId: number;
      unitId: number;
      description?: string;
      isActive?: boolean;
      inventoryQuantity?: number;
      inventoryStatus?: InventoryStatus;
      images?: File[];
    }) {
      const form = new FormData();
      form.set('name', payload.name);
      form.set('slug', payload.slug);
      if (payload.description != null) form.set('description', payload.description);
      form.set('price', String(payload.price));
      form.set('categoryId', String(payload.categoryId));
      form.set('unitId', String(payload.unitId));
      if (payload.isActive != null) form.set('isActive', String(payload.isActive));
      if (payload.inventoryQuantity != null)
        form.set('inventoryQuantity', String(payload.inventoryQuantity));
      if (payload.inventoryStatus != null) form.set('inventoryStatus', payload.inventoryStatus);
      (payload.images ?? []).forEach((f) => form.append('images', f));

      const { data } = await instance.post<Product>('/admin/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    async adminUpdateProduct(id: number, payload: UpdateProductRequest) {
      const { data } = await instance.patch<Product>(`/admin/products/${id}`, payload);
      return data;
    },
    async adminDeleteProduct(id: number) {
      const { data } = await instance.delete<Product>(`/admin/products/${id}`);
      return data;
    },
    async adminGetInventory(productId: number) {
      const { data } = await instance.get<Inventory | null>(
        `/admin/products/${productId}/inventory`,
      );
      return data;
    },
    async adminUpdateInventory(productId: number, payload: UpdateInventoryRequest) {
      const { data } = await instance.patch<Inventory>(
        `/admin/products/${productId}/inventory`,
        payload,
      );
      return data;
    },
    async adminUploadProductImage(productId: number, file: File) {
      const form = new FormData();
      form.append('file', file);
      const { data } = await instance.post<ProductImage>(`/admin/products/${productId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },

    // Admin / Categories
    async adminCategoriesList() {
      const { data } = await instance.get<Category[]>('/admin/categories');
      return data;
    },
    async adminCategoryById(id: number) {
      const { data } = await instance.get<Category>(`/admin/categories/${id}`);
      return data;
    },
    async adminCreateCategory(payload: CreateCategoryRequest) {
      const { data } = await instance.post<Category>('/admin/categories', payload);
      return data;
    },
    async adminUpdateCategory(id: number, payload: UpdateCategoryRequest) {
      const { data } = await instance.patch<Category>(`/admin/categories/${id}`, payload);
      return data;
    },
    async adminDeleteCategory(id: number) {
      const { data } = await instance.delete<Category>(`/admin/categories/${id}`);
      return data;
    },

    // Admin / Units
    async adminUnitsList() {
      const { data } = await instance.get<Unit[]>('/admin/units');
      return data;
    },
    async adminUnitById(id: number) {
      const { data } = await instance.get<Unit>(`/admin/units/${id}`);
      return data;
    },
    async adminCreateUnit(payload: CreateUnitRequest) {
      const { data } = await instance.post<Unit>('/admin/units', payload);
      return data;
    },
    async adminUpdateUnit(id: number, payload: UpdateUnitRequest) {
      const { data } = await instance.patch<Unit>(`/admin/units/${id}`, payload);
      return data;
    },
    async adminDeleteUnit(id: number) {
      const { data } = await instance.delete<Unit>(`/admin/units/${id}`);
      return data;
    },
  };

  return api;
}

// A ready-to-use singleton, backed by a Pinia store for JWT token persistence.
export const useVodoleyAuthStore = defineStore('vodoleyAuth', {
  state: () => ({
    token: (localStorage.getItem('vodoley_admin_token') as string | null) ?? null,
  }),
  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (token) localStorage.setItem('vodoley_admin_token', token);
      else localStorage.removeItem('vodoley_admin_token');
    },
    async login(payload: AdminLoginRequest, api?: ReturnType<typeof createVodoleyApi>) {
      const client =
        api ??
        createVodoleyApi({
          getToken: () => this.token,
        });
      const res = await client.adminLogin(payload);
      this.setToken(res.access_token);
      return res;
    },
    logout() {
      this.setToken(null);
    },
  },
});

// Convenience factory for components/stores:
// const auth = useVodoleyAuthStore()
// const api = createVodoleyApi({ getToken: () => auth.token })
export function useVodoleyApi() {
  const auth = useVodoleyAuthStore();
  return createVodoleyApi({ getToken: () => auth.token });
}

