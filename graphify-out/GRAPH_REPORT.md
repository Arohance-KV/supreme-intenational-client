# Graph Report - client  (2026-09-24)

## Corpus Check
- 261 files · ~185,953 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1655 nodes · 3380 edges · 100 communities (93 shown, 7 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 157 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `35aa6c35`
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
2. `apiFetch()` - 52 edges
3. `useConfirm()` - 44 edges
4. `StatusChip()` - 31 edges
5. `adminFetch()` - 29 edges
6. `useAdminProfile()` - 28 edges
7. `useAuth()` - 25 edges
8. `getSessionId()` - 23 edges
9. `fmtDateTime()` - 17 edges
10. `fmtDate()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getProductBySlug()`  [INFERRED]
  app/products/[slug]/page.tsx → lib/catalog.ts
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

## Communities (100 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (14): FlashSaleBody, PRODUCT_DETAIL_KEY(), UpdateProductBody, UpdateVariantBody, uploadAdminImage(), useAdminProduct(), useDeleteProduct(), useSetFlashSale() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (28): AdminModal(), Field(), CaseStudy, CaseStudyInput, ClientLogo, ClientLogoInput, PopupTrigger, SitePopup (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (30): AdminCustomer, CustomerAccountType, CustomerCatalogue, CustomerDetail, CustomersResponse, useCustomers(), Quotation, AdminReview (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): AdminGuard(), PUBLIC, AdminShell(), ICON, NAV, NavEntry, navFor(), NavGroup (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (13): useCustomer(), ADMIN_MAP, COMPANY_STATUS_VARIANT, COMPANY_VARIANT_CLASS, CompanyVariant, EMPLOYEE_MAP, SELLER_ACCOUNT_MAP, SELLER_COLOR_MAP (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (14): SubmissionDetailPage(), NewSubmissionPage(), DraftVariant, importSubmissionsCsv(), Paginated, Submission, SubmissionInput, T (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (31): ActivityItem, DashboardSummary, EnquiriesSummary, EnqVsQuotePoint, GeneratedPoint, LowStockVariant, OrderStatusCount, RevenueData (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (16): AdminProduct, AdminProductDetail, AdminProductsResponse, BulkCreateVariantsBody, CreateVariantBody, importProductsCsv(), ImportResult, useAdjustStock() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (13): LoginForm(), SellerApplyPage(), DcWordmark(), cities, jakarta, mono, AuthResponse, LoginBody (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (27): dependencies, next, react, react-dom, @tanstack/react-query, devDependencies, eslint, eslint-config-next (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (25): Ambient background, Badges / chips (pill, JetBrains Mono, 11px, weight 500), Brand, Buttons, Cards, Colors, Components, CSS custom properties (root `--` tokens) (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (20): PageHeader(), CompanyQuotation, CompanyQuotationContact, CompanyQuotationItem, CompanyQuotationsResult, ENQUIRIES_KEY, EnquiriesResult, Enquiry (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (26): ATTR_REVIEW_KEY(), AttributeReview, AttributeReviewItem, CAT_REVIEW_KEY(), CategoryReview, DraftVariant, DraftVariantAttribute, RejectSubmissionBody (+18 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (15): HomePage(), _productsCache, catalogFetch(), Category, CategoryAttribute, getBestsellers(), getCategories(), getFeatured() (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (14): Attribute, AttributeValue, CategoryItem, Filters(), KNOWN_KEYS, Review, Reviews(), ReviewsProps (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (6): PortalAbout, PortalAnnouncement, PortalContentBlock, PortalHero, PortalTheme, EmployeeCompany

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (22): AdminEmployee, COMPANY_KEY(), COMPANY_LOGINS_KEY(), CreateCompanyLoginBody, InviteEmployeeBody, LedgerEntry, UpdateCompanyBody, useBulkAllocateSelected() (+14 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (18): AdminCoupon, COUPON_DETAIL_KEY(), COUPONS_LIST_KEY, CreateCouponBody, UpdateCouponBody, useCoupon(), useCoupons(), useCreateCoupon() (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (28): AdminSeller, SELLER_KEY(), SELLER_PERFORMANCE_KEY(), SELLER_PRODUCTS_KEY(), SellerContact, SellerPerformance, SellerProduct, SellerProductsResponse (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (11): adminUpload(), _nav, mockApiFetch, fetchAttributes(), mockAdminFetch, mockApiFetch, HIDE, Popup (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (19): B2BStatus, B2BUser, B2BUserPage, SetB2BApprovalBody, useB2BUsers(), useSetB2BApproval(), useUpdateCompany(), ACTION_COPY (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (3): AdminProductDetailResponse, AddToCartProps, ProductVariant

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (13): ProductRow(), CompanyProduct, PatchProductBody, PatchProductResult, postProductRequest(), ProductRequestBody, PRODUCTS_KEY, ProductsResponse (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (17): Dashboard, DashboardPool, DashboardRecentOrder, DashboardSeriesPoint, DashboardStats, Range, RecentOrderStatus, useCompanyDashboard() (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (17): B2B_LOCK_CODES, inr0(), QuotationCartView(), QuotationHistoryPage(), emailQuotation(), GenerateQuotationBody, GenerateQuotationResult, getQuotationPdfUrl() (+9 more)

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
Cohesion: 0.15
Nodes (14): TABS, Card(), CompanyOrdersFilter, CompanyOrderSummary, exportCompanyOrdersCsv(), OrdersPage, OrdersPagination, OrderStatus (+6 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (38): TABS, EmployeeCheckoutPage(), FieldProps, INITIAL_ADDRESS, CheckoutPayload, CheckoutRazorpayResponse, CheckoutResponse, CheckoutWalletOnlyResponse (+30 more)

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
Nodes (21): BulkImportWizard(), AddAttributeValueBody, AdminAttribute, ATTRIBUTES_KEY, AttributeValue, CATEGORIES_KEY, CreateAttributeBody, UpdateAttributeBody (+13 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (9): AccountPage(), CAT_HEADS, Catalogue, initials(), Profile, QUOTE_HEADS, STATUS_STYLE, Tab (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.16
Nodes (16): CartPage(), EmployeeCartPage(), CartItemRow(), CartItemRowProps, formatPrice(), CartView(), CartViewProps, formatPrice() (+8 more)

### Community 38 - "Community 38"
Cohesion: 0.06
Nodes (36): ApplicationsResponse, ApplicationStatus, CreateApplicationInput, JobApplication, JobOpening, JobOpeningInput, useApplications(), useCreateApplication() (+28 more)

### Community 39 - "Community 39"
Cohesion: 0.31
Nodes (6): StatCard(), SellerDashboard, T, useSellerDashboard(), SellerDashboardPage(), STATUS_LABEL

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (14): AdminBlog, AdminBlogsResponse, BLOG_DETAIL_KEY(), BLOGS_LIST_KEY(), CreateBlogBody, UpdateBlogBody, useBlog(), useBlogs() (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.06
Nodes (27): LoginForm(), ForgotPasswordForm(), ResetPasswordForm(), useCompanyAuth(), CompanySidebar(), NAV, CompanyGuard(), PUBLIC (+19 more)

### Community 42 - "Community 42"
Cohesion: 0.31
Nodes (8): inr(), PayoutsPage(), STATUS_CHIP, Paginated, Payout, T, useEarningsSummary(), usePayouts()

### Community 43 - "Community 43"
Cohesion: 0.11
Nodes (23): CompaniesListResponse, CompanyCatalog, CompanyCatalogProduct, CompanyLogin, CompanyPrimaryContact, CompanyProduct, CompanyProductsResponse, CreateCompanyLoginResponse (+15 more)

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (5): AdminSubmission, SUBMISSIONS_LIST_KEY(), SubmissionStatus, useSubmissions(), SubmissionsTable()

### Community 45 - "Community 45"
Cohesion: 0.29
Nodes (7): benefits, CareersPage(), heroPills, jakarta, mono, steps, useJobs()

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (8): LeadFollowUpStatus, LeadType, useLeads(), useUpdateLeadStatus(), FOLLOW_UP_STATUSES, LEAD_TYPES, LeadsTable(), LeadStatusCell()

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (10): ImportPreview, ImportResult, ImageEntry, ImageEntry, ImportApi, Mode, REQUIRED_TARGETS, SheetData (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.50
Nodes (4): COMPANY_CATALOG_KEY(), useCompanyCatalog(), useUpdateCompanyCatalog(), CompanyCatalogSection()

### Community 49 - "Community 49"
Cohesion: 0.06
Nodes (33): ActivateForm(), ForgotPasswordForm(), LoginForm(), ResetPasswordForm(), useEmployeeAuth(), useEmployeeCompany(), EmployeeFooter(), EmployeeHeader() (+25 more)

### Community 50 - "Community 50"
Cohesion: 0.19
Nodes (12): CreateProductModal(), CreateProductBody, PRODUCT_LIST_KEY(), useAdminProducts(), useAdminProductsInfinite(), useCreateProduct(), useImportProducts(), useCategories() (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (11): useDeleteBlog(), AdminPointsProposal, DecideProposalBody, PROPOSALS_KEY, useDecideProposal(), usePendingProposals(), VariantRow(), BlogRow() (+3 more)

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
Cohesion: 0.12
Nodes (12): advantages, advTags, directors, jakarta, metadata, mono, stats, CartBadge() (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.28
Nodes (6): QuotationStatus, useQuotationAnalytics(), useQuotations(), AnalyticsCards(), QUOTATION_STATUSES, QuotationsTable()

### Community 57 - "Community 57"
Cohesion: 0.23
Nodes (12): applyMapping(), ATTRIBUTE_SYNONYMS, buildTargets(), IGNORE_TARGET, levenshtein(), MapTarget, matchOne(), NEW_ATTRIBUTE_TARGET (+4 more)

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (7): CareerDetailPage(), jakarta, mono, ApplyInput, JobOpening, useApplyToJob(), useJob()

### Community 59 - "Community 59"
Cohesion: 0.62
Nodes (4): formatDate(), formatLakh(), initials(), parsePointsInput()

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
Cohesion: 0.23
Nodes (9): AdminCompany, COMPANY_PRODUCTS_KEY(), PortalStat, useCompanyProducts(), useStagePortalBranding(), PortalBrandingSection(), ProductsToolbar(), SORTS (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (7): AddToCartMini(), CartTarget, EMPLOYEE_CART, PUBLIC_CART, ProductCardProps, Product, ProductDetail

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (11): Addendum — 2026-07-20: fix for review finding (stale-cache self-correction gap), Confirmation: `ApiError` change is additive for existing consumers, Constraints respected, Files changed, Files changed, Finding being fixed, Self-review findings, Task 7 Report — Client: B2B approval queue + quotation lock banner (+3 more)

### Community 66 - "Community 66"
Cohesion: 0.23
Nodes (14): Role, AdminUser, CreateUserInput, useAdminUsers(), useCreateUser(), useDeleteUser(), useSetUserActive(), useUpdateUser() (+6 more)

### Community 68 - "Community 68"
Cohesion: 0.14
Nodes (9): PortalPromotion, useRecentlyViewed(), EmployeeDashboard(), PromotionBanner(), IconProps, RESOURCES, STATS, SupremeSection() (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.19
Nodes (8): COMPANIES_LIST_KEY(), CreateCompanyBody, useCompanies(), useCreateCompany(), blankForm(), CompaniesTable(), CreateCompanyModal(), CreateCompanyModalProps

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (9): Animations (`--animate-*` tokens + keyframes in `globals.css`), Auth pages (applied pattern), Colors (`@theme` tokens → Tailwind utilities), Component patterns (canonical class strings — `components/employee/ui.ts`), Glass surface, Gradients, Radii & shadows, Supreme × Elate — Design System (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.23
Nodes (10): listeners, useAdminAuth(), AdminProfile, useAdminChangePassword(), useAdminLogin(), useAdminProfile(), AdminLoginPage(), ChangePasswordSection() (+2 more)

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (8): ProductRow(), SellerProductsPage(), useMyProducts(), useSetProductActive(), SellerBulkImportButton(), useImportSubmissions(), useMySubmissions(), SubmissionsPage()

### Community 73 - "Community 73"
Cohesion: 0.17
Nodes (15): BlogListPage(), metadata, ClientsPage(), Blog, BlogList, CaseStudy, ClientLogo, contentFetch() (+7 more)

### Community 74 - "Community 74"
Cohesion: 0.26
Nodes (13): AddVariantForm(), ProductDetailPage(), Paginated, SellerProduct, SellerProductDetail, T, useAddVariant(), useAdjustStock() (+5 more)

### Community 75 - "Community 75"
Cohesion: 0.32
Nodes (5): FUNNEL_TONE, SellerPerformancePage(), SellerPerformance, T, useSellerPerformance()

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (4): CatalogueOptions, GenerateResult, KNOWN_KEYS, OPTION_LABELS

### Community 77 - "Community 77"
Cohesion: 0.23
Nodes (12): CompanyProfile, PROFILE_KEY, T, uploadCompanyLogo(), generateId(), getSessionId(), apiBase(), authHeaders() (+4 more)

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
Cohesion: 0.22
Nodes (13): ApprovalChangeDetail, ApprovalChangeField, ApprovalItem, ApprovalType, useApprovalDetail(), useApprovals(), useDecideApproval(), actionChipLabel() (+5 more)

### Community 87 - "Community 87"
Cohesion: 0.21
Nodes (7): PageProps, DcPhoto(), GRADS, pick(), TrackView(), TrackViewProps, generateMetadata()

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **491 isolated node(s):** `jakarta`, `mono`, `metadata`, `stats`, `directors` (+486 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `Community 19` to `Community 0`, `Community 1`, `Community 2`, `Community 5`, `Community 7`, `Community 8`, `Community 11`, `Community 12`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 30`, `Community 32`, `Community 35`, `Community 37`, `Community 38`, `Community 40`, `Community 41`, `Community 44`, `Community 46`, `Community 47`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 53`, `Community 58`, `Community 60`, `Community 62`, `Community 63`, `Community 64`, `Community 66`, `Community 69`, `Community 71`, `Community 72`, `Community 74`, `Community 77`, `Community 78`, `Community 79`, `Community 81`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `Community 19` to `Community 5`, `Community 8`, `Community 11`, `Community 14`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 35`, `Community 36`, `Community 37`, `Community 39`, `Community 41`, `Community 42`, `Community 49`, `Community 52`, `Community 53`, `Community 58`, `Community 64`, `Community 71`, `Community 74`, `Community 75`, `Community 76`, `Community 77`, `Community 78`, `Community 87`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `adminFetch()` connect `Community 62` to `Community 1`, `Community 2`, `Community 6`, `Community 7`, `Community 12`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 27`, `Community 28`, `Community 35`, `Community 38`, `Community 40`, `Community 43`, `Community 51`, `Community 54`, `Community 60`, `Community 61`, `Community 66`, `Community 71`, `Community 82`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `useConfirm()` (e.g. with `VariantRow()` and `ProductRow()`) actually correct?**
  _`useConfirm()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `jakarta`, `mono`, `metadata` to the rest of the system?**
  _491 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10793650793650794 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._