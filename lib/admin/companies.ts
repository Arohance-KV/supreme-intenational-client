import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch, adminUpload } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompanyPrimaryContact {
  name?: string;
  email?: string;
  isdCode?: string;
  phoneNumber?: string;
}

export interface AdminCompany {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  walletMode: 'points' | 'coupon';
  primaryContact?: CompanyPrimaryContact;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesListResponse {
  items: AdminCompany[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface CreateCompanyBody {
  name: string;
  primaryContact?: CompanyPrimaryContact;
  notes?: string;
}

export interface UpdateCompanyBody {
  name?: string;
  status?: 'active' | 'inactive';
  walletMode?: 'points' | 'coupon';
  primaryContact?: CompanyPrimaryContact;
  notes?: string;
}

// Employee status enum from user.model.ts: 'invited' | 'active' | 'deactivated'
export interface AdminEmployee {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  isdCode?: string;
  phoneNumber?: string;
  accountType: 'employee';
  companyId?: string;
  employeeStatus?: 'invited' | 'active' | 'deactivated';
  createdAt: string;
  updatedAt: string;
}

export interface InviteEmployeeBody {
  firstName: string;
  lastName?: string;
  isdCode?: string;
  phoneNumber?: string;
  email: string;
}

export interface UpdateEmployeeStatusBody {
  status: 'active' | 'deactivated';
}

// Wallet: balance in rupees (amount is a float > 0, stored as Number in DB)
export interface EmployeeWallet {
  balance: number;
  currency: string;
}

export interface WalletAmountBody {
  amount: number; // rupees (float > 0)
  reason: string;
}

// Ledger entry shape from walletLedger.model.ts
export interface LedgerEntry {
  _id: string;
  walletId: string;
  employeeId: string;
  companyId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  reason: string;
  source: 'admin_topup' | 'admin_adjustment' | 'order_redemption' | 'refund';
  createdBy?: string;
  referenceId?: string;
  createdAt: string;
}

export interface LedgerResponse {
  items: LedgerEntry[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

// Catalog: products (with per-product hidden/pointsOverride state) + categoryIds
export interface CompanyCatalogProduct {
  productId: string;
  name: string | null;
  hidden: boolean;
  pointsOverride: number | null;
}

export interface CompanyCatalog {
  companyId: string;
  products: CompanyCatalogProduct[];
  categoryIds: string[];
}

export interface UpdateCatalogBody {
  addProductIds?: string[];
  removeProductIds?: string[];
  addCategoryIds?: string[];
  removeCategoryIds?: string[];
}

// Company products list — uses the same AdminProduct shape as products.ts
export interface CompanyProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  isActive?: boolean;
  minPrice?: number;
  visibility?: 'public' | 'company';
}

export interface CompanyProductsResponse {
  products: CompanyProduct[];
  pagination?: { total: number; page: number; limit: number; pages: number };
}

// Company self-service login: POST /admin/companies/:id/login
export interface CreateCompanyLoginBody {
  email: string;
  password: string; // min 8 chars
}

export interface CreateCompanyLoginResponse {
  email: string;
}

// ── Query key helpers ─────────────────────────────────────────────────────────

const COMPANIES_LIST_KEY = (page: number, search?: string, status?: string) =>
  ['admin', 'companies', 'list', page, search ?? '', status ?? ''] as const;

const COMPANY_KEY = (id: string) =>
  ['admin', 'companies', 'detail', id] as const;

const EMPLOYEES_KEY = (companyId: string) =>
  ['admin', 'companies', 'employees', companyId] as const;

const EMPLOYEE_WALLET_KEY = (employeeId: string) =>
  ['admin', 'employee-wallet', employeeId, 'balance'] as const;

const EMPLOYEE_LEDGER_KEY = (employeeId: string, page: number) =>
  ['admin', 'employee-wallet', employeeId, 'ledger', page] as const;

const COMPANY_CATALOG_KEY = (companyId: string) =>
  ['admin', 'companies', 'catalog', companyId] as const;

const COMPANY_PRODUCTS_KEY = (companyId: string) =>
  ['admin', 'companies', 'products', companyId] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useCompanies(
  page = 1,
  search?: string,
  status?: string,
  options?: { enabled?: boolean },
) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (search) qs.set('search', search);
  if (status) qs.set('status', status);

  return useQuery<CompaniesListResponse>({
    queryKey: COMPANIES_LIST_KEY(page, search, status),
    queryFn: () =>
      adminFetch<CompaniesListResponse>(`/admin/companies?${qs.toString()}`),
    enabled: options?.enabled ?? true,
  });
}

export function useCompany(id: string) {
  return useQuery<AdminCompany>({
    queryKey: COMPANY_KEY(id),
    queryFn: () => adminFetch<AdminCompany>(`/admin/companies/${id}`),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompanyBody) =>
      adminFetch<AdminCompany>('/admin/companies', { method: 'POST', body }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'companies', 'list'] }),
  });
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCompanyBody) =>
      adminFetch<AdminCompany>(`/admin/companies/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMPANY_KEY(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'companies', 'list'] });
    },
  });
}

export function useCompanyEmployees(companyId: string) {
  return useQuery<AdminEmployee[]>({
    queryKey: EMPLOYEES_KEY(companyId),
    queryFn: () =>
      adminFetch<AdminEmployee[]>(`/admin/companies/${companyId}/employees`),
    enabled: !!companyId,
  });
}

export function useBulkInvite(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      adminUpload<{ invited: number }>(`/admin/companies/${companyId}/employees/bulk-invite`, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPLOYEES_KEY(companyId) }),
  });
}

export function useBulkIssueCoupons(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      adminUpload<{ issued?: number; credited?: number }>(`/admin/companies/${companyId}/employees/bulk-coupon`, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY(companyId) });
      qc.invalidateQueries({ queryKey: ['admin', 'employee-wallet'] });
    },
  });
}

// In-app picker: allocate the same value to selected employees (mode-aware server-side).
export function useBulkAllocateSelected(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { employeeIds: string[]; value: number }) =>
      adminFetch<{ issued?: number; credited?: number }>(`/admin/companies/${companyId}/employees/bulk-allocate`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY(companyId) });
      qc.invalidateQueries({ queryKey: ['admin', 'employee-wallet'] });
    },
  });
}

export function useInviteEmployee(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteEmployeeBody) =>
      adminFetch<AdminEmployee>(`/admin/companies/${companyId}/employees/invite`, {
        method: 'POST',
        body,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY(companyId) }),
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (employeeId: string) =>
      adminFetch<boolean>(`/admin/employees/${employeeId}/resend-invite`, {
        method: 'POST',
      }),
  });
}

export function useUpdateEmployeeStatus(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, status }: { employeeId: string; status: 'active' | 'deactivated' }) =>
      adminFetch<AdminEmployee>(`/admin/employees/${employeeId}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY(companyId) }),
  });
}

export function useEmployeeWallet(employeeId: string) {
  return useQuery<EmployeeWallet>({
    queryKey: EMPLOYEE_WALLET_KEY(employeeId),
    queryFn: () =>
      adminFetch<EmployeeWallet>(`/admin/employees/${employeeId}/wallet`),
    enabled: !!employeeId,
  });
}

export function useEmployeeLedger(employeeId: string, page = 1) {
  return useQuery<LedgerResponse>({
    queryKey: EMPLOYEE_LEDGER_KEY(employeeId, page),
    queryFn: () =>
      adminFetch<LedgerResponse>(
        `/admin/employees/${employeeId}/wallet/ledger?page=${page}`,
      ),
    enabled: !!employeeId,
  });
}

export function useCreditWallet(employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: WalletAmountBody) =>
      adminFetch<EmployeeWallet>(`/admin/employees/${employeeId}/wallet/credit`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEE_WALLET_KEY(employeeId) });
      qc.invalidateQueries({ queryKey: ['admin', 'employee-wallet', employeeId, 'ledger'] });
    },
  });
}

export function useDebitWallet(employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: WalletAmountBody) =>
      adminFetch<EmployeeWallet>(`/admin/employees/${employeeId}/wallet/debit`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEE_WALLET_KEY(employeeId) });
      qc.invalidateQueries({ queryKey: ['admin', 'employee-wallet', employeeId, 'ledger'] });
    },
  });
}

export function useIssueCoupon(employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { value: number; reason?: string }) =>
      adminFetch<EmployeeWallet>(`/admin/employees/${employeeId}/wallet/coupon`, { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEE_WALLET_KEY(employeeId) });
      qc.invalidateQueries({ queryKey: ['admin', 'employee-wallet', employeeId, 'ledger'] });
    },
  });
}

export function useCompanyCatalog(companyId: string) {
  return useQuery<CompanyCatalog>({
    queryKey: COMPANY_CATALOG_KEY(companyId),
    queryFn: () =>
      adminFetch<CompanyCatalog>(`/admin/companies/${companyId}/catalog`),
    enabled: !!companyId,
  });
}

export function useUpdateCompanyCatalog(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCatalogBody) =>
      adminFetch<CompanyCatalog>(`/admin/companies/${companyId}/catalog`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: COMPANY_CATALOG_KEY(companyId) }),
  });
}

export function useCreateCompanyLogin(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompanyLoginBody) =>
      adminFetch<CreateCompanyLoginResponse>(`/admin/companies/${companyId}/login`, {
        method: 'POST',
        body,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: COMPANY_KEY(companyId) }),
  });
}

export function useCompanyProducts(companyId: string) {
  return useQuery<CompanyProductsResponse>({
    queryKey: COMPANY_PRODUCTS_KEY(companyId),
    queryFn: () =>
      adminFetch<CompanyProductsResponse>(`/admin/companies/${companyId}/products`),
    enabled: !!companyId,
  });
}
