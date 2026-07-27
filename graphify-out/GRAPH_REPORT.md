# Graph Report - client  (2026-07-24)

## Corpus Check
- 246 files · ~151,089 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1593 nodes · 3179 edges · 94 communities (88 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 141 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aae5d6dc`
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
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 108|Community 108]]

## God Nodes (most connected - your core abstractions)
1. `ApiError` - 69 edges
2. `apiFetch()` - 48 edges
3. `useConfirm()` - 43 edges
4. `adminFetch()` - 26 edges
5. `useAuth()` - 25 edges
6. `getSessionId()` - 23 edges
7. `StatusChip()` - 19 edges
8. `formatIN()` - 17 edges
9. `compilerOptions` - 16 edges
10. `fmtDate()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `SubmissionDetailInner()` --calls--> `fmtDateTime()`  [INFERRED]
  app/admin/submissions/[id]/page.tsx → lib/admin/format.ts
- `QuotationRow()` --calls--> `formatIN()`  [INFERRED]
  app/company/quotations/page.tsx → lib/company/format.ts
- `VariantRow()` --calls--> `useConfirm()`  [INFERRED]
  app/seller/products/[id]/page.tsx → components/ConfirmDialog.tsx
- `OpeningsTab()` --calls--> `useConfirm()`  [INFERRED]
  app/admin/careers/page.tsx → components/ConfirmDialog.tsx
- `CategoriesTable()` --calls--> `useCategories()`  [EXTRACTED]
  app/admin/catalog/categories/page.tsx → lib/admin/taxonomy.ts

## Import Cycles
- None detected.

## Communities (94 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (23): CompaniesListResponse, CompanyCatalog, CompanyCatalogProduct, CompanyLogin, CompanyPrimaryContact, CompanyProduct, CompanyProductsResponse, CreateCompanyLoginResponse (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (48): AdminModal(), Field(), ApplicationsResponse, ApplicationStatus, CreateApplicationInput, JobApplication, JobOpening, JobOpeningInput (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (28): AdminCustomer, CustomerAccountType, CustomersResponse, useCustomers(), AdminReview, CreateReviewBody, ReviewProduct, REVIEWS_LIST_KEY() (+20 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (50): AdminGuard(), PUBLIC, AdminShell(), ICON, NAV, NavEntry, navFor(), NavGroup (+42 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (27): useDeleteBlog(), fmtDate(), AdminSubmission, ATTR_REVIEW_KEY(), AttributeReview, AttributeReviewItem, DraftVariant, DraftVariantAttribute (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (16): ImportResult, SubmissionDetailPage(), DraftVariant, Paginated, Submission, T, useImportSubmissions(), useMySubmissions() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (31): ActivityItem, DashboardSummary, EnquiriesSummary, EnqVsQuotePoint, GeneratedPoint, LowStockVariant, OrderStatusCount, RevenueData (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (46): AdminProduct, AdminProductDetail, AdminProductDetailResponse, AdminProductsResponse, BulkCreateVariantsBody, CreateVariantBody, FlashSaleBody, PRODUCT_DETAIL_KEY() (+38 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (8): LoginForm(), DcWordmark(), AuthResponse, LoginBody, SignupBody, useLogin(), useSignup(), SignupPage()

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (27): dependencies, next, react, react-dom, @tanstack/react-query, devDependencies, eslint, eslint-config-next (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (25): Ambient background, Badges / chips (pill, JetBrains Mono, 11px, weight 500), Brand, Buttons, Cards, Colors, Components, CSS custom properties (root `--` tokens) (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (20): CompanyQuotation, CompanyQuotationContact, CompanyQuotationItem, CompanyQuotationsResult, ENQUIRIES_KEY, EnquiriesResult, Enquiry, EnquiryItem (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (28): AddAttributeValueBody, AdminAttribute, AdminCategory, ATTRIBUTES_KEY, AttributeValue, CATEGORIES_KEY, CreateAttributeBody, CreateCategoryBody (+20 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (14): PageProps, TrackView(), TrackViewProps, catalogFetch(), CategoryAttribute, getBestsellers(), getProductBySlug(), getProducts() (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (16): Attribute, AttributeValue, CategoryItem, Filters(), KNOWN_KEYS, ProductsToolbar(), SORTS, Review (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (10): ActivateForm(), LoginForm(), ResetPasswordForm(), STATUS_PILL, statusPill(), AuthResponse, useActivate(), useEmployeeLogin() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (18): AdminEmployee, COMPANY_LOGINS_KEY(), CreateCompanyLoginBody, InviteEmployeeBody, LedgerEntry, UpdateCompanyBody, useBulkAllocateSelected(), useBulkInvite() (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (18): AdminCoupon, COUPON_DETAIL_KEY(), COUPONS_LIST_KEY, CreateCouponBody, UpdateCouponBody, useCoupon(), useCoupons(), useCreateCoupon() (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (28): AdminSeller, SELLER_KEY(), SELLER_PERFORMANCE_KEY(), SELLER_PRODUCTS_KEY(), SellerContact, SellerPerformance, SellerProduct, SellerProductsResponse (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (13): adminUpload(), _nav, mockApiFetch, importProductsCsv(), CompanyProfile, PROFILE_KEY, T, uploadCompanyLogo() (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (17): AdminPayout, PAYOUT_KEY(), PayoutLineItem, PAYOUTS_LIST_KEY(), PayoutsFilters, PayoutsListResponse, SellerPayoutStatus, useAdminPayout() (+9 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (14): AdminBlog, AdminBlogsResponse, BLOG_DETAIL_KEY(), BLOGS_LIST_KEY(), CreateBlogBody, UpdateBlogBody, useBlog(), useBlogs() (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (13): ProductRow(), CompanyProduct, PatchProductBody, PatchProductResult, postProductRequest(), ProductRequestBody, PRODUCTS_KEY, ProductsResponse (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (19): Card(), Dashboard, DashboardPool, DashboardRecentOrder, DashboardSeriesPoint, DashboardStats, Range, RecentOrderStatus (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (13): QuotationHistoryPage(), apiFetch(), emailQuotation(), GenerateQuotationBody, GenerateQuotationResult, getQuotationPdfUrl(), MyQuotationsResult, QuotationItem (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (18): 1. `components/employee/EmployeeHeader.tsx`, 2. `app/employee/page.tsx` (dashboard), 3. `app/employee/products/page.tsx`, 4. `app/employee/products/[slug]/page.tsx`, 5. Cart — `app/employee/cart/page.tsx` + shared `components/CartView.tsx`, 6. `app/employee/checkout/page.tsx`, 7. Orders — `app/employee/orders/page.tsx` + `[orderId]/page.tsx`, 8. `app/employee/wallet/page.tsx` (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.11
Nodes (17): AdminEnquiry, AdminEnquiryItem, ContactLead, ContactLeadsResponse, EnquiriesResponse, EnquiryCounts, EnquiryType, LeadContact (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.10
Nodes (24): AdminOrderFilters, AdminOrdersResponse, Billing, Order, OrderItem, OrderStatus, Payment, ShippingAddress (+16 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (11): TABS, CompanyOrdersFilter, CompanyOrderSummary, exportCompanyOrdersCsv(), OrdersPage, OrdersPagination, OrderStatus, T (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (16): TABS, OrderBilling, OrderDetail, OrderItem, OrderPayment, OrdersPage, OrderStatus, OrderSummary (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.14
Nodes (16): PageProps, EmployeeAttribute, EmployeeAttributeValue, EmployeeCatalogFilters, EmployeeProductsParams, fetchEmployeeProducts(), ProductPage, useEmployeeFilters() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (25): AddEmployeeBody, buildProposalBody(), buildWalletAdjustment(), Employee, EMPLOYEES_KEY, EmployeeWallet, POINTS_POOL_KEY, PointsPoolView (+17 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (13): EnquiryStatus, useContactLeads(), useEnquiries(), useEnquiryCounts(), useUpdateEnquiryStatus(), AdminEnquiriesPage(), ContactLeadsList(), EnquiryList() (+5 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (16): Employee Portal Redesign Implementation Plan, File Structure, Global Constraints, Self-Review, Task 10: Wallet, Task 11: Auth pages ×4 (login, activate, forgot-password, reset-password), Task 12: Final verification + graph update, Task 1: Shared UI constants module (+8 more)

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (13): NewSubmissionPage(), Cat, CatAttr, emptyVariant(), LocalAttr, LocalVariant, Props, SubmissionForm() (+5 more)

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (10): AccountPage(), CAT_HEADS, Catalogue, initials(), Profile, QUOTE_HEADS, STATUS_STYLE, Tab (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (16): CartPage(), CartItemRow(), CartItemRowProps, formatPrice(), CartView(), CartViewProps, formatPrice(), B2B_LOCK_CODES (+8 more)

### Community 38 - "Community 38"
Cohesion: 0.20
Nodes (8): LoginForm(), useCompanyAuth(), CompanySidebar(), NAV, CompanyGuard(), PUBLIC, AuthResponse, useCompanyLogin()

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (16): EmployeeCartPage(), EmployeeCheckoutPage(), FieldProps, INITIAL_ADDRESS, KEY, useEmployeeCart(), useEmployeeCartMutations(), CheckoutPayload (+8 more)

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (8): ForgotPasswordForm(), ResetPasswordForm(), SellerApplyPage(), ApplyBody, T, useSellerApply(), useSellerForgotPassword(), useSellerResetPassword()

### Community 41 - "Community 41"
Cohesion: 0.23
Nodes (7): SellerProfile, useSellerMe(), PUBLIC, SellerGuard(), NAV, PUBLIC, SellerSidebar()

### Community 42 - "Community 42"
Cohesion: 0.31
Nodes (8): inr(), PayoutsPage(), STATUS_CHIP, Paginated, Payout, T, useEarningsSummary(), usePayouts()

### Community 43 - "Community 43"
Cohesion: 0.11
Nodes (8): PortalAbout, PortalAnnouncement, PortalContentBlock, PortalHero, PortalPromotion, PortalTheme, EmployeeCompany, PromotionBanner()

### Community 44 - "Community 44"
Cohesion: 0.12
Nodes (12): geistMono, geistSans, jakarta, jbMono, metadata, Providers(), activeKey(), ConditionalSiteHeader() (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (11): useEmployeeAuth(), useEmployeeCompany(), useRecentlyViewed(), EmployeeFooter(), EmployeeHeader(), EmployeeTabBar(), TABS, EmployeeGuard() (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (8): LeadFollowUpStatus, LeadType, useLeads(), useUpdateLeadStatus(), FOLLOW_UP_STATUSES, LEAD_TYPES, LeadsTable(), LeadStatusCell()

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (11): ImportPreview, ImportResult, ImageEntry, BulkImportWizard(), ImageEntry, ImportApi, Mode, REQUIRED_TARGETS (+3 more)

### Community 48 - "Community 48"
Cohesion: 0.27
Nodes (10): useOrder(), useRetryPayment(), useVerifyPayment(), fmt(), fmtDate(), isRetriable(), OrderDetailPage(), stepIndex() (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (8): LedgerEntry, useWallet(), useWalletLedger(), WalletBalance, FILTERS, inr(), SOURCE_LABEL, WalletPage()

### Community 50 - "Community 50"
Cohesion: 0.23
Nodes (12): COMPANIES_LIST_KEY(), useCompanies(), CreateProductModal(), CreateProductBody, useCreateProduct(), useDeleteProduct(), useImportProducts(), useCategories() (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.19
Nodes (12): AdminPointsProposal, DecideProposalBody, PROPOSALS_KEY, useDecideProposal(), usePendingProposals(), AlertOptions, ConfirmContext, ConfirmContextValue (+4 more)

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
Cohesion: 0.26
Nodes (11): applyMapping(), ATTRIBUTE_SYNONYMS, buildTargets(), IGNORE_TARGET, levenshtein(), MapTarget, matchOne(), normalize() (+3 more)

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (7): CareerDetailPage(), jakarta, mono, ApplyInput, JobOpening, useApplyToJob(), useJob()

### Community 59 - "Community 59"
Cohesion: 0.70
Nodes (3): formatLakh(), initials(), parsePointsInput()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (11): AdminTicket, Paginated, TicketStatus, useAdminClose(), useAdminReply(), useAdminTicket(), useAdminTickets(), useInvalidate() (+3 more)

### Community 61 - "Community 61"
Cohesion: 0.23
Nodes (8): ForgotPasswordForm(), EmployeeProfile, useEmployeeProfile(), useForgotPassword(), initials(), memberSince(), ProfilePage(), STATUS_CHIP

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (10): adminFetch(), apiBase(), authHeaders(), commitImportBatch(), downloadTemplate(), parseSheet(), previewImport(), uploadFolder() (+2 more)

### Community 63 - "Community 63"
Cohesion: 0.23
Nodes (11): AdminCompany, COMPANY_PRODUCTS_KEY(), PortalStat, useCompanyProducts(), useUpdateCompany(), PortalBrandingSection(), useDebounced(), PRODUCT_LIST_KEY() (+3 more)

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (7): AddToCartMini(), CartTarget, EMPLOYEE_CART, PUBLIC_CART, ProductCardProps, Product, ProductDetail

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (11): Addendum — 2026-07-20: fix for review finding (stale-cache self-correction gap), Confirmation: `ApiError` change is additive for existing consumers, Constraints respected, Files changed, Files changed, Finding being fixed, Self-review findings, Task 7 Report — Client: B2B approval queue + quotation lock banner (+3 more)

### Community 66 - "Community 66"
Cohesion: 0.29
Nodes (7): benefits, CareersPage(), heroPills, jakarta, mono, steps, useJobs()

### Community 67 - "Community 67"
Cohesion: 0.21
Nodes (6): HomePage(), _productsCache, fallbackBrands, Category, getCategories(), getFeatured()

### Community 68 - "Community 68"
Cohesion: 0.18
Nodes (5): BADGES, IconProps, RESOURCES, SupremeSection(), WHY

### Community 69 - "Community 69"
Cohesion: 0.24
Nodes (5): CreateCompanyBody, useCreateCompany(), blankForm(), CreateCompanyModal(), CreateCompanyModalProps

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (9): Animations (`--animate-*` tokens + keyframes in `globals.css`), Auth pages (applied pattern), Colors (`@theme` tokens → Tailwind utilities), Component patterns (canonical class strings — `components/employee/ui.ts`), Glass surface, Gradients, Radii & shadows, Supreme × Elate — Design System (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.27
Nodes (7): SellerDashboard, T, useSellerDashboard(), inr(), SellerDashboardPage(), STATUS_CHIP, STATUS_LABEL

### Community 72 - "Community 72"
Cohesion: 0.28
Nodes (7): formatDate(), useCompanyOrder(), STATUS_VARIANT, StatusPill(), Variant, VARIANT_CLASS, CompanyOrderDetailPage()

### Community 73 - "Community 73"
Cohesion: 0.17
Nodes (15): BlogListPage(), metadata, ClientsPage(), Blog, BlogList, CaseStudy, ClientLogo, contentFetch() (+7 more)

### Community 74 - "Community 74"
Cohesion: 0.24
Nodes (6): listeners, useCookieAuth(), SellerLoginPage(), STATUS_MSG, useSellerAuth(), useSellerLogin()

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
Cohesion: 0.40
Nodes (5): COMPANY_CATALOG_KEY(), useCompanyCatalog(), useUpdateCompanyCatalog(), CompanyCatalogSection(), useDebounced()

### Community 79 - "Community 79"
Cohesion: 0.43
Nodes (5): useQuotation(), useUpdateQuotationStatus(), fmtDateTime(), AdminQuotationDetailPage(), QUOTATION_STATUSES

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (3): floats, HomeHeroFloats(), stock()

### Community 81 - "Community 81"
Cohesion: 0.50
Nodes (4): COMPANY_KEY(), useCompany(), CompanyDetailInner(), CompanyName()

### Community 87 - "Community 87"
Cohesion: 0.40
Nodes (3): DcPhoto(), GRADS, pick()

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **478 isolated node(s):** `jakarta`, `mono`, `metadata`, `stats`, `directors` (+473 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `Community 19` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 32`, `Community 35`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 46`, `Community 47`, `Community 50`, `Community 51`, `Community 52`, `Community 53`, `Community 58`, `Community 60`, `Community 62`, `Community 63`, `Community 64`, `Community 69`, `Community 74`, `Community 77`, `Community 79`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `Community 25` to `Community 3`, `Community 5`, `Community 7`, `Community 8`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 19`, `Community 23`, `Community 24`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 49`, `Community 52`, `Community 53`, `Community 58`, `Community 61`, `Community 64`, `Community 71`, `Community 75`, `Community 76`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `adminFetch()` connect `Community 62` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 12`, `Community 60`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 54`, `Community 51`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `useConfirm()` (e.g. with `VariantRow()` and `ProductRow()`) actually correct?**
  _`useConfirm()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `jakarta`, `mono`, `metadata` to the rest of the system?**
  _478 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10869565217391304 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.060655737704918035 - nodes in this community are weakly interconnected._