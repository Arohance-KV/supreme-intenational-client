# Graph Report - client  (2026-08-18)

## Corpus Check
- 254 files · ~157,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1632 nodes · 3288 edges · 99 communities (92 shown, 7 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 149 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f6324ea`
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
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 108|Community 108]]

## God Nodes (most connected - your core abstractions)
1. `ApiError` - 70 edges
2. `apiFetch()` - 48 edges
3. `useConfirm()` - 43 edges
4. `adminFetch()` - 27 edges
5. `useAuth()` - 25 edges
6. `getSessionId()` - 23 edges
7. `useAdminProfile()` - 22 edges
8. `StatusChip()` - 20 edges
9. `fmtDateTime()` - 16 edges
10. `formatIN()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `VariantRow()` --calls--> `useConfirm()`  [INFERRED]
  app/seller/products/[id]/page.tsx → components/ConfirmDialog.tsx
- `CreateBlogForm()` --calls--> `useAdminProfile()`  [INFERRED]
  app/admin/blogs/[id]/page.tsx → lib/admin/userAuth.ts
- `EditBlogForm()` --calls--> `useAdminProfile()`  [INFERRED]
  app/admin/blogs/[id]/page.tsx → lib/admin/userAuth.ts
- `OpeningsTab()` --calls--> `useConfirm()`  [INFERRED]
  app/admin/careers/page.tsx → components/ConfirmDialog.tsx
- `CategoriesTable()` --calls--> `useCategories()`  [EXTRACTED]
  app/admin/catalog/categories/page.tsx → lib/admin/taxonomy.ts

## Import Cycles
- None detected.

## Communities (99 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (8): EMPLOYEE_LEDGER_KEY(), EMPLOYEE_WALLET_KEY(), useCreditWallet(), useDebitWallet(), useEmployeeLedger(), useEmployeeWallet(), useIssueCoupon(), EmployeeWalletPanel()

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (28): AdminModal(), Field(), CaseStudy, CaseStudyInput, ClientLogo, ClientLogoInput, PopupTrigger, SitePopup (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (31): AdminCustomer, CustomerAccountType, CustomerCatalogue, CustomerDetail, CustomersResponse, useCustomers(), Quotation, AdminReview (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): AdminGuard(), PUBLIC, AdminShell(), ICON, NAV, NavEntry, navFor(), NavGroup (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (8): useDeleteBlog(), useCustomer(), fmtDate(), STATUS_CLASS_MAP, StatusChip(), StatusChipProps, BlogRow(), AdminCustomerDetailPage()

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (14): SubmissionDetailPage(), NewSubmissionPage(), DraftVariant, Paginated, Submission, SubmissionInput, T, useCreateSubmission() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (31): ActivityItem, DashboardSummary, EnquiriesSummary, EnqVsQuotePoint, GeneratedPoint, LowStockVariant, OrderStatusCount, RevenueData (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (25): AdminProduct, AdminProductDetail, AdminProductsResponse, BulkCreateVariantsBody, CreateVariantBody, FlashSaleBody, PRODUCT_DETAIL_KEY(), PRODUCT_LIST_KEY() (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (9): LoginForm(), DcWordmark(), EmployeeFooter(), AuthResponse, LoginBody, SignupBody, useLogin(), useSignup() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (27): dependencies, next, react, react-dom, @tanstack/react-query, devDependencies, eslint, eslint-config-next (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (25): Ambient background, Badges / chips (pill, JetBrains Mono, 11px, weight 500), Brand, Buttons, Cards, Colors, Components, CSS custom properties (root `--` tokens) (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (20): formatDate(), CompanyQuotation, CompanyQuotationContact, CompanyQuotationItem, CompanyQuotationsResult, ENQUIRIES_KEY, EnquiriesResult, Enquiry (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (25): fmtDateTime(), AdminSubmission, ATTR_REVIEW_KEY(), AttributeReview, AttributeReviewItem, DraftVariant, DraftVariantAttribute, RejectSubmissionBody (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (12): HomePage(), _productsCache, catalogFetch(), Category, CategoryAttribute, getBestsellers(), getCategories(), getFeatured() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (16): Attribute, AttributeValue, CategoryItem, Filters(), KNOWN_KEYS, ProductsToolbar(), SORTS, Review (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (12): ActivateForm(), ForgotPasswordForm(), LoginForm(), ResetPasswordForm(), STATUS_PILL, statusPill(), AuthResponse, useActivate() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (21): AdminEmployee, COMPANY_CATALOG_KEY(), CreateCompanyLoginBody, InviteEmployeeBody, LedgerEntry, UpdateCompanyBody, useBulkAllocateSelected(), useBulkInvite() (+13 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (18): AdminCoupon, COUPON_DETAIL_KEY(), COUPONS_LIST_KEY, CreateCouponBody, UpdateCouponBody, useCoupon(), useCoupons(), useCreateCoupon() (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (28): AdminSeller, SELLER_KEY(), SELLER_PERFORMANCE_KEY(), SELLER_PRODUCTS_KEY(), SellerContact, SellerPerformance, SellerProduct, SellerProductsResponse (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (8): adminUpload(), _nav, mockApiFetch, importProductsCsv(), generateId(), getSessionId(), importSubmissionsCsv(), uploadSubmissionImage()

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (19): B2BStatus, B2BUser, B2BUserPage, SetB2BApprovalBody, useB2BUsers(), useSetB2BApproval(), useUpdateCompany(), ACTION_COPY (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (4): AdminProductDetailResponse, AddToCartProps, ApiError, ProductVariant

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (13): ProductRow(), CompanyProduct, PatchProductBody, PatchProductResult, postProductRequest(), ProductRequestBody, PRODUCTS_KEY, ProductsResponse (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (23): Card(), Dashboard, DashboardPool, DashboardRecentOrder, DashboardSeriesPoint, DashboardStats, Range, RecentOrderStatus (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (15): HIDE, Popup, QuotationHistoryPage(), apiFetch(), ApiFetchOptions, emailQuotation(), GenerateQuotationBody, GenerateQuotationResult (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (18): 1. `components/employee/EmployeeHeader.tsx`, 2. `app/employee/page.tsx` (dashboard), 3. `app/employee/products/page.tsx`, 4. `app/employee/products/[slug]/page.tsx`, 5. Cart — `app/employee/cart/page.tsx` + shared `components/CartView.tsx`, 6. `app/employee/checkout/page.tsx`, 7. Orders — `app/employee/orders/page.tsx` + `[orderId]/page.tsx`, 8. `app/employee/wallet/page.tsx` (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.11
Nodes (17): AdminEnquiry, AdminEnquiryItem, ApproveQuotationInput, ContactLead, ContactLeadsResponse, EnquiriesResponse, EnquiryCounts, EnquiryType (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.10
Nodes (23): AdminOrderFilters, AdminOrdersResponse, Billing, Order, OrderCompany, OrderItem, OrderStatus, Payment (+15 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (11): TABS, CompanyOrdersFilter, CompanyOrderSummary, exportCompanyOrdersCsv(), OrdersPage, OrdersPagination, OrderStatus, T (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (16): TABS, OrderBilling, OrderDetail, OrderItem, OrderPayment, OrdersPage, OrderStatus, OrderSummary (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.16
Nodes (13): EmployeeAttribute, EmployeeAttributeValue, EmployeeCatalogFilters, EmployeeProductsParams, fetchEmployeeProducts(), ProductPage, useEmployeeFilters(), useEmployeeProductsInfinite() (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (24): AddEmployeeBody, buildProposalBody(), buildWalletAdjustment(), Employee, EMPLOYEES_KEY, EmployeeWallet, POINTS_POOL_KEY, PointsPoolView (+16 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (13): EnquiryStatus, useContactLeads(), useEnquiries(), useEnquiryCounts(), useUpdateEnquiryStatus(), AdminEnquiriesPage(), ContactLeadsList(), EnquiryList() (+5 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (16): Employee Portal Redesign Implementation Plan, File Structure, Global Constraints, Self-Review, Task 10: Wallet, Task 11: Auth pages ×4 (login, activate, forgot-password, reset-password), Task 12: Final verification + graph update, Task 1: Shared UI constants module (+8 more)

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (21): BulkImportWizard(), AddAttributeValueBody, AdminAttribute, ATTRIBUTES_KEY, AttributeValue, CATEGORIES_KEY, CreateAttributeBody, UpdateAttributeBody (+13 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (9): AccountPage(), CAT_HEADS, Catalogue, initials(), Profile, QUOTE_HEADS, STATUS_STYLE, Tab (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.16
Nodes (19): CartPage(), CartItemRow(), CartItemRowProps, formatPrice(), CartView(), CartViewProps, formatPrice(), B2B_LOCK_CODES (+11 more)

### Community 38 - "Community 38"
Cohesion: 0.13
Nodes (20): ApplicationsResponse, ApplicationStatus, CreateApplicationInput, JobApplication, JobOpening, JobOpeningInput, useApplications(), useCreateApplication() (+12 more)

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (13): EmployeeCartPage(), EmployeeCheckoutPage(), FieldProps, INITIAL_ADDRESS, KEY, useEmployeeCart(), useEmployeeCartMutations(), CheckoutPayload (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (15): AdminBlog, AdminBlogsResponse, BLOG_DETAIL_KEY(), BLOGS_LIST_KEY(), CreateBlogBody, UpdateBlogBody, useBlog(), useBlogs() (+7 more)

### Community 41 - "Community 41"
Cohesion: 0.06
Nodes (28): LoginForm(), ForgotPasswordForm(), ResetPasswordForm(), SellerApplyPage(), useCompanyAuth(), CompanySidebar(), NAV, CompanyGuard() (+20 more)

### Community 42 - "Community 42"
Cohesion: 0.16
Nodes (14): inr(), PayoutsPage(), STATUS_CHIP, SellerDashboard, T, useSellerDashboard(), SellerDashboardPage(), STATUS_CHIP (+6 more)

### Community 43 - "Community 43"
Cohesion: 0.07
Nodes (25): CompaniesListResponse, COMPANY_LOGINS_KEY(), CompanyCatalog, CompanyCatalogProduct, CompanyLogin, CompanyPrimaryContact, CompanyProduct, CompanyProductsResponse (+17 more)

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (10): geistMono, geistSans, jakarta, jbMono, metadata, Providers(), activeKey(), ConditionalSiteHeader() (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.23
Nodes (10): useEmployeeAuth(), useEmployeeCompany(), useRecentlyViewed(), EmployeeHeader(), EmployeeTabBar(), TABS, EmployeeGuard(), PUBLIC (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (8): LeadFollowUpStatus, LeadType, useLeads(), useUpdateLeadStatus(), FOLLOW_UP_STATUSES, LEAD_TYPES, LeadsTable(), LeadStatusCell()

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (10): ImportPreview, ImportResult, ImageEntry, ImageEntry, ImportApi, Mode, REQUIRED_TARGETS, SheetData (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (13): useOrder(), useRetryPayment(), useVerifyPayment(), loadRazorpay(), openRazorpay(), Window, fmt(), fmtDate() (+5 more)

### Community 49 - "Community 49"
Cohesion: 0.14
Nodes (14): EmployeeProfile, useEmployeeProfile(), LedgerEntry, useWallet(), useWalletLedger(), WalletBalance, initials(), memberSince() (+6 more)

### Community 50 - "Community 50"
Cohesion: 0.24
Nodes (12): COMPANIES_LIST_KEY(), useCompanies(), CreateProductModal(), CreateProductBody, useAdminProductsInfinite(), useCreateProduct(), useDeleteProduct(), useImportProducts() (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (11): COMPANY_KEY(), useCompany(), AdminPointsProposal, DecideProposalBody, PROPOSALS_KEY, useDecideProposal(), usePendingProposals(), useConfirm() (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.24
Nodes (12): Thread(), Paginated, SupportTicket, T, TicketMessage, TicketStatus, useCreateTicket(), useMyTickets() (+4 more)

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (8): OtpModal(), OtpModalProps, RequestOtpBody, RequestOtpResult, useRequestOtp(), useVerifyOtp(), VerifyOtpBody, VerifyOtpResult

### Community 54 - "Community 54"
Cohesion: 0.23
Nodes (9): AdditionalCharge, CatalogueResult, GenerateBody, ProductVariant, QuotationResult, useAdminGenerateCatalogue(), useAdminGenerateQuotation(), ChargeRow (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.10
Nodes (15): advantages, advTags, directors, jakarta, metadata, mono, stats, CartBadge() (+7 more)

### Community 56 - "Community 56"
Cohesion: 0.28
Nodes (6): QuotationStatus, useQuotationAnalytics(), useQuotations(), AnalyticsCards(), QUOTATION_STATUSES, QuotationsTable()

### Community 57 - "Community 57"
Cohesion: 0.23
Nodes (12): applyMapping(), ATTRIBUTE_SYNONYMS, buildTargets(), IGNORE_TARGET, levenshtein(), MapTarget, matchOne(), NEW_ATTRIBUTE_TARGET (+4 more)

### Community 58 - "Community 58"
Cohesion: 0.16
Nodes (14): benefits, CareersPage(), heroPills, jakarta, mono, steps, CareerDetailPage(), jakarta (+6 more)

### Community 59 - "Community 59"
Cohesion: 0.42
Nodes (6): formatIN(), formatLakh(), initials(), parsePointsInput(), useCompanyOrder(), CompanyOrderDetailPage()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (11): AdminTicket, Paginated, TicketStatus, useAdminClose(), useAdminReply(), useAdminTicket(), useAdminTickets(), useInvalidate() (+3 more)

### Community 61 - "Community 61"
Cohesion: 0.17
Nodes (16): AdminPayout, PAYOUT_KEY(), PayoutLineItem, PAYOUTS_LIST_KEY(), PayoutsFilters, PayoutsListResponse, SellerPayoutStatus, useAdminPayout() (+8 more)

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (10): adminFetch(), apiBase(), authHeaders(), commitImportBatch(), downloadTemplate(), parseSheet(), previewImport(), uploadFolder() (+2 more)

### Community 63 - "Community 63"
Cohesion: 0.31
Nodes (8): COMPANY_PRODUCTS_KEY(), PortalStat, useCompanyProducts(), useStagePortalBranding(), PortalBrandingSection(), useDebounced(), useAdminProducts(), readableTextColor()

### Community 64 - "Community 64"
Cohesion: 0.23
Nodes (10): PageProps, AddToCartMini(), CartTarget, EMPLOYEE_CART, PUBLIC_CART, ProductCardProps, useEmployeeProduct(), useEmployeeRelated() (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (11): Addendum — 2026-07-20: fix for review finding (stale-cache self-correction gap), Confirmation: `ApiError` change is additive for existing consumers, Constraints respected, Files changed, Files changed, Finding being fixed, Self-review findings, Task 7 Report — Client: B2B approval queue + quotation lock banner (+3 more)

### Community 66 - "Community 66"
Cohesion: 0.23
Nodes (14): Role, AdminUser, CreateUserInput, useAdminUsers(), useCreateUser(), useDeleteUser(), useSetUserActive(), useUpdateUser() (+6 more)

### Community 68 - "Community 68"
Cohesion: 0.20
Nodes (4): IconProps, RESOURCES, STATS, WHY

### Community 69 - "Community 69"
Cohesion: 0.20
Nodes (7): AdminCompany, CreateCompanyBody, useCreateCompany(), blankForm(), CompaniesTable(), CreateCompanyModal(), CreateCompanyModalProps

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (9): Animations (`--animate-*` tokens + keyframes in `globals.css`), Auth pages (applied pattern), Colors (`@theme` tokens → Tailwind utilities), Component patterns (canonical class strings — `components/employee/ui.ts`), Glass surface, Gradients, Radii & shadows, Supreme × Elate — Design System (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.23
Nodes (10): listeners, useAdminAuth(), AdminProfile, useAdminChangePassword(), useAdminLogin(), useAdminProfile(), AdminLoginPage(), ChangePasswordSection() (+2 more)

### Community 72 - "Community 72"
Cohesion: 0.20
Nodes (10): ImportResult, ProductRow(), SellerProductsPage(), useMyProducts(), useSetProductActive(), SellerBulkImportButton(), useImportSubmissions(), useMySubmissions() (+2 more)

### Community 73 - "Community 73"
Cohesion: 0.17
Nodes (15): BlogListPage(), metadata, ClientsPage(), Blog, BlogList, CaseStudy, ClientLogo, contentFetch() (+7 more)

### Community 74 - "Community 74"
Cohesion: 0.23
Nodes (14): AddVariantForm(), VariantRow(), ProductDetailPage(), Paginated, SellerProduct, SellerProductDetail, T, useAddVariant() (+6 more)

### Community 75 - "Community 75"
Cohesion: 0.32
Nodes (5): FUNNEL_TONE, SellerPerformancePage(), SellerPerformance, T, useSellerPerformance()

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (4): CatalogueOptions, GenerateResult, KNOWN_KEYS, OPTION_LABELS

### Community 77 - "Community 77"
Cohesion: 0.57
Nodes (6): apiBase(), authHeaders(), commitImportBatch(), parseSheet(), postJson(), previewImport()

### Community 78 - "Community 78"
Cohesion: 0.18
Nodes (9): Cat, CatAttr, emptyVariant(), LocalAttr, LocalVariant, Props, SubmissionForm(), toLocalVariants() (+1 more)

### Community 79 - "Community 79"
Cohesion: 0.36
Nodes (7): useApproveQuotation(), useQuotation(), useSaveQuotationDraft(), useSubmitQuotationForApproval(), useUpdateQuotationStatus(), AdminQuotationDetailPage(), QUOTATION_STATUSES

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (3): floats, HomeHeroFloats(), stock()

### Community 81 - "Community 81"
Cohesion: 0.22
Nodes (8): AdminCategory, CreateCategoryBody, UpdateCategoryBody, useCreateCategory(), useUpdateCategory(), CategoriesTable(), CreateCategoryForm(), EditCategoryRow()

### Community 82 - "Community 82"
Cohesion: 0.36
Nodes (8): ApprovalItem, ApprovalType, useApprovals(), useDecideApproval(), AdminApprovalsPage(), ApprovalRow(), groupByType(), TYPE_LABEL

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (6): AlertOptions, ConfirmContext, ConfirmContextValue, ConfirmOptions, DialogState, Tone

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (4): STATUS_VARIANT, StatusPill(), Variant, VARIANT_CLASS

### Community 87 - "Community 87"
Cohesion: 0.19
Nodes (10): PageProps, DcPhoto(), GRADS, pick(), TrackView(), TrackViewProps, getProductBySlug(), getRelated() (+2 more)

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **484 isolated node(s):** `jakarta`, `mono`, `metadata`, `stats`, `directors` (+479 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `Community 21` to `Community 2`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 32`, `Community 35`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 46`, `Community 47`, `Community 50`, `Community 51`, `Community 52`, `Community 53`, `Community 58`, `Community 60`, `Community 62`, `Community 63`, `Community 64`, `Community 66`, `Community 69`, `Community 71`, `Community 72`, `Community 74`, `Community 77`, `Community 78`, `Community 79`, `Community 81`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `Community 25` to `Community 5`, `Community 8`, `Community 11`, `Community 14`, `Community 15`, `Community 19`, `Community 21`, `Community 23`, `Community 24`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 36`, `Community 37`, `Community 39`, `Community 41`, `Community 42`, `Community 49`, `Community 52`, `Community 53`, `Community 58`, `Community 64`, `Community 71`, `Community 74`, `Community 75`, `Community 76`, `Community 78`, `Community 87`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `adminFetch()` connect `Community 62` to `Community 1`, `Community 2`, `Community 6`, `Community 7`, `Community 12`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 27`, `Community 28`, `Community 35`, `Community 38`, `Community 40`, `Community 43`, `Community 51`, `Community 54`, `Community 60`, `Community 61`, `Community 66`, `Community 71`, `Community 82`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `useConfirm()` (e.g. with `VariantRow()` and `ProductRow()`) actually correct?**
  _`useConfirm()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `jakarta`, `mono`, `metadata` to the rest of the system?**
  _484 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11229946524064172 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07560975609756097 - nodes in this community are weakly interconnected._