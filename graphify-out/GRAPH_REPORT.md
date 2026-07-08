# Graph Report - client  (2026-07-06)

## Corpus Check
- 228 files · ~125,915 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1521 nodes · 2565 edges · 113 communities (92 shown, 21 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1e1eb24`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]

## God Nodes (most connected - your core abstractions)
1. `ApiError` - 54 edges
2. `apiFetch()` - 39 edges
3. `useAuth()` - 21 edges
4. `adminFetch()` - 19 edges
5. `StatusChip()` - 18 edges
6. `compilerOptions` - 16 edges
7. `fmtDate()` - 15 edges
8. `formatIN()` - 14 edges
9. `Supreme International — Design System` - 13 edges
10. `File Structure` - 13 edges

## Surprising Connections (you probably didn't know these)
- `QuotationRow()` --calls--> `formatIN()`  [INFERRED]
  app/company/quotations/page.tsx → lib/company/format.ts
- `AddVariantForm()` --calls--> `useAttributes()`  [INFERRED]
  app/admin/catalog/products/[id]/page.tsx → lib/admin/taxonomy.ts
- `CreateProductModal()` --calls--> `useCompanies()`  [INFERRED]
  app/admin/catalog/products/page.tsx → lib/admin/companies.ts
- `CreateProductModal()` --calls--> `useCategories()`  [INFERRED]
  app/admin/catalog/products/page.tsx → lib/admin/taxonomy.ts
- `AdminQuotationDetailPage()` --calls--> `fmtDateTime()`  [INFERRED]
  app/admin/quotations/[id]/page.tsx → lib/admin/format.ts

## Import Cycles
- None detected.

## Communities (113 total, 21 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (54): AdminCompany, AdminEmployee, COMPANIES_LIST_KEY(), CompaniesListResponse, COMPANY_CATALOG_KEY(), COMPANY_KEY(), COMPANY_PRODUCTS_KEY(), CompanyCatalog (+46 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (48): AdminModal(), Field(), ApplicationsResponse, ApplicationStatus, CreateApplicationInput, JobApplication, JobOpening, JobOpeningInput (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (42): AdminBlog, AdminBlogsResponse, BLOG_DETAIL_KEY(), BLOGS_LIST_KEY(), CreateBlogBody, UpdateBlogBody, useBlog(), useBlogs() (+34 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (39): AdminGuard(), PUBLIC, AdminShell(), ICON, NAV, NavEntry, navFor(), NavGroup (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (41): fmtDateTime(), AdminPayout, PAYOUT_KEY(), PayoutLineItem, PAYOUTS_LIST_KEY(), PayoutsFilters, PayoutsListResponse, SellerPayoutStatus (+33 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (29): SubmissionDetailPage(), generateId(), getSessionId(), NewSubmissionPage(), Cat, CatAttr, emptyVariant(), LocalAttr (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (23): ActivityItem, DashboardSummary, EnquiriesSummary, EnqVsQuotePoint, GeneratedPoint, LowStockVariant, OrderStatusCount, RevenueData (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (25): AdminProduct, AdminProductDetail, AdminProductsResponse, BulkCreateVariantsBody, CreateVariantBody, FlashSaleBody, PRODUCT_DETAIL_KEY(), UpdateProductBody (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): adminFetch(), _nav, mockApiFetch, LoginForm(), TrackView(), TrackViewProps, ApiError, apiFetch() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (27): dependencies, next, react, react-dom, @tanstack/react-query, devDependencies, eslint, eslint-config-next (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (25): Ambient background, Badges / chips (pill, JetBrains Mono, 11px, weight 500), Brand, Buttons, Cards, Colors, Components, CSS custom properties (root `--` tokens) (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (21): formatDate(), CompanyQuotation, CompanyQuotationContact, CompanyQuotationItem, CompanyQuotationsResult, ENQUIRIES_KEY, EnquiriesResult, Enquiry (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (20): AddAttributeValueBody, AdminAttribute, ATTRIBUTES_KEY, AttributeValue, CATEGORIES_KEY, CreateAttributeBody, UpdateAttributeBody, UpdateAttributeValueBody (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (18): AdminProductDetailResponse, PageProps, AddToCartProps, catalogFetch(), Category, CategoryAttribute, getBestsellers(), getCategories() (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (15): Attribute, AttributeValue, CategoryItem, Filters(), KNOWN_KEYS, UserProfile, Review, Reviews() (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (12): ActivateForm(), ForgotPasswordForm(), LoginForm(), ResetPasswordForm(), STATUS_PILL, statusPill(), AuthResponse, useActivate() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (21): `app/employee/orders/[orderId]/page.tsx`, `app/employee/orders/page.tsx`, Build, Build Result, Commit, Commit, Concerns, Concerns (+13 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (18): AdminCoupon, COUPON_DETAIL_KEY(), COUPONS_LIST_KEY, CreateCouponBody, UpdateCouponBody, useCoupon(), useCoupons(), useCreateCoupon() (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (17): AdminSeller, SELLER_KEY(), SELLER_PERFORMANCE_KEY(), SELLER_PRODUCTS_KEY(), SellerContact, SellerPerformance, SellerProduct, SellerProductsResponse (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (17): AddVariantForm(), ProductRow(), ProductDetailPage(), SellerProductsPage(), Paginated, SellerProduct, SellerProductDetail, T (+9 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (20): Add-to-cart button — scope decision, Build, Build Result, Changes Made, Changes Made, Commit, Commit, Concerns (+12 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (19): Already available (reuse — do NOT redefine differently), Background (portal shell root, in `app/company/layout.tsx` main wrapper), BUTTONS, Card, Company Portal — Design-Fidelity Spec (match the provided mockup exactly), Employees & Points, Glass tokens (add to globals `@theme` or use inline), GLOBAL: remove the site chrome from /company (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (13): ProductRow(), PageHeader(), CompanyProduct, PatchProductBody, PatchProductResult, ProductRequestBody, PRODUCTS_KEY, ProductsResponse (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (13): Card(), Dashboard, DashboardPool, DashboardRecentOrder, DashboardSeriesPoint, DashboardStats, Range, RecentOrderStatus (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (14): QuotationHistoryPage(), emailQuotation(), GenerateQuotationBody, GenerateQuotationResult, getQuotationPdfUrl(), MyQuotationsResult, Quotation, QuotationItem (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (18): 1. `components/employee/EmployeeHeader.tsx`, 2. `app/employee/page.tsx` (dashboard), 3. `app/employee/products/page.tsx`, 4. `app/employee/products/[slug]/page.tsx`, 5. Cart — `app/employee/cart/page.tsx` + shared `components/CartView.tsx`, 6. `app/employee/checkout/page.tsx`, 7. Orders — `app/employee/orders/page.tsx` + `[orderId]/page.tsx`, 8. `app/employee/wallet/page.tsx` (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.11
Nodes (17): AdminEnquiry, AdminEnquiryItem, ContactLead, ContactLeadsResponse, EnquiriesResponse, EnquiryCounts, EnquiryType, LeadContact (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (14): AdminOrderFilters, AdminOrdersResponse, Billing, Order, OrderItem, OrderStatus, Payment, ShippingAddress (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (14): CompanyOrdersFilter, CompanyOrderSummary, exportCompanyOrdersCsv(), OrdersPage, OrdersPagination, OrderStatus, T, useCompanyOrders() (+6 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (14): OrderBilling, OrderDetail, OrderItem, OrderPayment, OrdersPage, OrderStatus, OrderSummary, RazorpayHandlerResponse (+6 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (13): PageProps, ProductCardProps, EmployeeProductsParams, useEmployeeProduct(), useEmployeeProducts(), useEmployeeRelated(), useEmployeeSearch(), Pagination (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (15): AddEmployeeBody, buildWalletAdjustment(), Employee, EMPLOYEES_KEY, EmployeeWallet, T, useAddEmployee(), useAdjustPoints() (+7 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (13): EnquiryStatus, useContactLeads(), useEnquiries(), useEnquiryCounts(), useUpdateEnquiryStatus(), AdminEnquiriesPage(), ContactLeadsList(), EnquiryList() (+5 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (16): Employee Portal Redesign Implementation Plan, File Structure, Global Constraints, Self-Review, Task 10: Wallet, Task 11: Auth pages ×4 (login, activate, forgot-password, reset-password), Task 12: Final verification + graph update, Task 1: Shared UI constants module (+8 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (16): 1. `lib/api.ts` — tokenKey option + dead code removal, 2. `lib/api.test.ts` — New TDD test, 3. `lib/employee/auth.ts` — Employee auth store, 4. `components/employee/EmployeeHeader.tsx` — Employee portal header, 5. `app/employee/layout.tsx` — Portal layout + EmployeeGuard, 6. `app/employee/page.tsx` — Placeholder dashboard stub, Commit, Concerns (+8 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (6): AccountPage(), Catalogue, initials(), Profile, STATUS_STYLE, Tab

### Community 37 - "Community 37"
Cohesion: 0.26
Nodes (11): CartPage(), EmployeeCartPage(), CartView(), CartViewProps, formatPrice(), useEmployeeCart(), useEmployeeCartMutations(), Cart (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.20
Nodes (8): LoginForm(), useCompanyAuth(), CompanySidebar(), NAV, CompanyGuard(), PUBLIC, AuthResponse, useCompanyLogin()

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (12): EmployeeCheckoutPage(), FieldProps, INITIAL_ADDRESS, CheckoutPayload, CheckoutRazorpayResponse, CheckoutResponse, CheckoutWalletOnlyResponse, ShippingAddress (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (8): ForgotPasswordForm(), ResetPasswordForm(), SellerApplyPage(), ApplyBody, T, useSellerApply(), useSellerForgotPassword(), useSellerResetPassword()

### Community 41 - "Community 41"
Cohesion: 0.21
Nodes (10): SellerLoginPage(), STATUS_MSG, useSellerAuth(), useSellerMe(), PUBLIC, SellerGuard(), NAV, PUBLIC (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.21
Nodes (11): inr(), PayoutsPage(), STATUS_CHIP, inr(), SellerDashboardPage(), STATUS_CHIP, Paginated, Payout (+3 more)

### Community 43 - "Community 43"
Cohesion: 0.14
Nodes (13): `app/employee/activate/page.tsx`, `app/employee/forgot-password/page.tsx`, `app/employee/login/page.tsx`, `app/employee/reset-password/page.tsx`, Commit, Concerns, Grep gate, Logic/hooks integrity confirmation (+5 more)

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (9): geistMono, geistSans, jakarta, jbMono, metadata, Providers(), ConditionalSiteHeader(), HIDE (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.26
Nodes (7): CartBadge(), CartBadgeProps, useEmployeeAuth(), useRecentlyViewed(), EmployeeGuard(), PUBLIC, EmployeeDashboard()

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (8): LeadFollowUpStatus, LeadType, useLeads(), useUpdateLeadStatus(), FOLLOW_UP_STATUSES, LEAD_TYPES, LeadsTable(), LeadStatusCell()

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (9): AdminCategory, CreateCategoryBody, UpdateCategoryBody, useCategories(), useCreateCategory(), useUpdateCategory(), CategoriesTable(), CreateCategoryForm() (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.27
Nodes (10): useOrder(), useRetryPayment(), useVerifyPayment(), fmt(), fmtDate(), isRetriable(), OrderDetailPage(), StatusTimeline() (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.24
Nodes (6): EmployeeHeader(), LedgerEntry, useWallet(), useWalletLedger(), WalletBalance, WalletPage()

### Community 50 - "Community 50"
Cohesion: 0.25
Nodes (9): CreateProductBody, PRODUCT_LIST_KEY(), useAdminProducts(), useCreateProduct(), useDeleteProduct(), ProductRow(), CreateProductModal(), inr() (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (7): SELLERS_LIST_KEY(), SellerStatus, useSellers(), useUpdateSeller(), SellerEditForm(), MarginEditor(), SellersTable()

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (10): Byte-identical (unchanged), Changes made, Commit, Concerns, Note on `pageWrap`, Status: DONE, Step 1 — Balance hero + amountClass, Step 2 — Ledger + wrapper restyle (per mapping table) (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (8): OtpModal(), OtpModalProps, RequestOtpBody, RequestOtpResult, useRequestOtp(), useVerifyOtp(), VerifyOtpBody, VerifyOtpResult

### Community 54 - "Community 54"
Cohesion: 0.20
Nodes (9): Concerns, File: `components/employee/EmployeeHeader.tsx`, Status, Step 2: Grep Gate, Step 3: Tests, Step 4: Commit, Summary of Changes, Task 2: EmployeeHeader → glass nav — Report (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (7): advantages, advTags, directors, jakarta, metadata, mono, stats

### Community 56 - "Community 56"
Cohesion: 0.28
Nodes (6): QuotationStatus, useQuotationAnalytics(), useQuotations(), AnalyticsCards(), QUOTATION_STATUSES, QuotationsTable()

### Community 57 - "Community 57"
Cohesion: 0.36
Nodes (7): useAdminOrder(), useRefundOrder(), useUpdateOrderStatus(), AdminOrderDetailPage(), formatDate(), inr(), NEXT_STATUSES

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (7): CareerDetailPage(), jakarta, mono, ApplyInput, JobOpening, useApplyToJob(), useJob()

### Community 59 - "Community 59"
Cohesion: 0.42
Nodes (6): formatIN(), formatLakh(), initials(), parsePointsInput(), useCompanyOrder(), CompanyOrderDetailPage()

### Community 60 - "Community 60"
Cohesion: 0.31
Nodes (3): items, DcWordmark(), SiteHeader()

### Community 61 - "Community 61"
Cohesion: 0.22
Nodes (8): ALL 7 FRONTEND TASKS (14-20) COMPLETE + reviewed. Pending: tiny polish (StatusPill confirmed/refunded colors, orders search copy), final whole-branch client review, live e2e., ALL 7 FRONTEND TASKS (14-20) COMPLETE + reviewed. Pending: tiny polish (StatusPill confirmed/refunded colors, orders search copy), final whole-branch client review, live e2e., ALL 7 FRONTEND TASKS (14-20) COMPLETE + reviewed. Pending: tiny polish (StatusPill confirmed/refunded colors, orders search copy), final whole-branch client review, live e2e., Company Portal Frontend (Phase 5) — Progress Ledger, Employee Portal Redesign — Progress Ledger, FRONTEND COMPLETE. Running final whole-branch client review next, then live e2e., Tasks, Tasks

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (8): Commit, Concerns, Files, How the mockup was matched, Status toggle, Task 16b report — Employees & Points page, Top-up interaction (chosen: immediate stepper, fixed 100-pt step), Verification

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): Bug, Commit, Concerns, Files changed, Fix, Task 18 fix report — reject empty points input in store product editor, Test (RED -> GREEN), Verification

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (8): Files changed, Note on shared-component blast radius, Step 1 — `app/employee/cart/page.tsx`, Step 2 — `components/CartView.tsx` mappings applied, Step 3 — Grep gate, Step 4 — Tests, Step 5 — Commit, Task 6: Shared CartView + employee cart wrapper — Report

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (8): Commit, Concerns, Grep gate, Logic integrity confirmed, Mappings applied, Status: DONE, Task 7: Checkout Reskin — Report, Tests

### Community 66 - "Community 66"
Cohesion: 0.29
Nodes (7): benefits, CareersPage(), heroPills, jakarta, mono, steps, useJobs()

### Community 67 - "Community 67"
Cohesion: 0.25
Nodes (5): categories, featured, floats, jakarta, mono

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (7): Commit, Files changed, Final Client Fix Report, FIX 1 — Employee points top-up missing `reason` (CRITICAL), FIX 2 — Decorative Overview search input removed, FIX 3 — Softened unbacked "tops up monthly" copy, Verification results

### Community 69 - "Community 69"
Cohesion: 0.25
Nodes (7): Commit, Concerns, Files, Formatter reuse check, How the mockup was matched, Task 15 report — Overview dashboard page, Verification

### Community 70 - "Community 70"
Cohesion: 0.25
Nodes (7): Concerns / follow-ups, CSV export, Files, Real DTO shape (verified in server source, not guessed), Status-tab mapping, Task 17 — Company Orders & Purchases page, Verification (foreground)

### Community 71 - "Community 71"
Cohesion: 0.25
Nodes (7): Concerns, Files, Server DTOs (read directly from source, not guessed), Status, Task 18 — Company Portal: Store Products page, UX details, Verification

### Community 72 - "Community 72"
Cohesion: 0.25
Nodes (7): Concerns, Files, Server DTOs (read directly from source, not guessed), Status, Task 19 — Company Portal: Quotations & Enquiries page, UX details, Verification

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (5): cases, industries, jakarta, logos, mono

### Community 75 - "Community 75"
Cohesion: 0.29
Nodes (6): Concerns, Data/logic integrity, Design Fidelity Refactor — Report (Foundation + Primitives), Status: Complete, Verification, Work done this session

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (6): Commit, Concerns, Status, Task 1: Shared UI constants module — Report, Type-check result, What was done

### Community 77 - "Community 77"
Cohesion: 0.29
Nodes (6): Files changed, Fix applied, Objective A — Admin "Create login" UI, Objective B — Catalog response-shape compatibility, Task 20 — Admin "Create login" + catalog-shape compatibility fix, Verification

### Community 78 - "Community 78"
Cohesion: 0.29
Nodes (6): Changes Made, Commit Hash, Concerns, Status, Task 3: Dashboard → glass hero + quick links, Verification

### Community 79 - "Community 79"
Cohesion: 0.47
Nodes (4): useQuotation(), useUpdateQuotationStatus(), AdminQuotationDetailPage(), QUOTATION_STATUSES

### Community 80 - "Community 80"
Cohesion: 0.33
Nodes (5): Build & Test Results, Files Modified, Final Fixes Report: B2E Employee Portal, Fix 1: Employee Catalog Search Pagination, Fix 2: Checkout Submit Button Stuck Disabled

### Community 81 - "Community 81"
Cohesion: 0.33
Nodes (5): Concerns / follow-ups for Tasks 15-19, Design-system reuse, Files created, Task 14 report — Company portal foundation (client), Verification

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (5): Concerns, Status timeline (new), Task 9 Report: Order detail brand restyle + status timeline, Verification, What changed

### Community 83 - "Community 83"
Cohesion: 0.40
Nodes (3): cities, jakarta, mono

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (4): Concerns, Mappings applied, Task 4 Report: Products list chrome reskin, Verification

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (4): useUpdateSellerStatus(), allowedTransitions(), SellerStatusPanel(), StatusActions()

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): STATUS_CLASS_MAP, StatusChip(), StatusChipProps

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (3): DcPhoto(), GRADS, pick()

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **593 isolated node(s):** `jakarta`, `mono`, `metadata`, `stats`, `directors` (+588 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 23`, `Community 25`, `Community 32`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 46`, `Community 47`, `Community 50`, `Community 51`, `Community 53`, `Community 57`, `Community 58`, `Community 79`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `Community 8` to `Community 3`, `Community 5`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 19`, `Community 23`, `Community 24`, `Community 25`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 42`, `Community 49`, `Community 53`, `Community 58`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `adminFetch()` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 12`, `Community 17`, `Community 18`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `jakarta`, `mono`, `metadata` to the rest of the system?**
  _593 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.059887005649717516 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.061952074810052604 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.056107539450613676 - nodes in this community are weakly interconnected._