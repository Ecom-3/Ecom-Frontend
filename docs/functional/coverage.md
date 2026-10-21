# Coverage and source inventory

Generated from the local source on the documentation baseline. Every declared router path is included; wildcard admin subpages are expanded separately. Inventory presence is not runtime verification.

## Declared routes

| Route | Functional chapter |
|---|---|
| `/` | [customer](customer.md) |
| `/forgot-password` | [customer](customer.md) |
| `/mobile-login` | [customer](customer.md) |
| `/` | [customer](customer.md) |
| `/intro` | [customer](customer.md) |
| `/register` | [customer](customer.md) |
| `/register-otp` | [customer](customer.md) |
| `/login` | [customer](customer.md) |
| `/home` | [customer](customer.md) |
| `/search` | [customer](customer.md) |
| `/banners/:bannerId` | [customer](customer.md) |
| `/stores` | [customer](customer.md) |
| `/stores/:storeId` | [customer](customer.md) |
| `/categories` | [customer](customer.md) |
| `/product-info/:productId` | [customer](customer.md) |
| `/product-info` | [customer](customer.md) |
| `/cart` | [customer](customer.md) |
| `/wishlist` | [customer](customer.md) |
| `/saved-for-later` | [customer](customer.md) |
| `/orders` | [commerce](commerce.md) |
| `/checkout-group/:groupId` | [commerce](commerce.md) |
| `/order-details` | [commerce](commerce.md) |
| `/order-details/:orderId/review` | [commerce](commerce.md) |
| `/order-details/:orderId` | [commerce](commerce.md) |
| `/saved-addresses` | [customer](customer.md) |
| `/help-center` | [customer](customer.md) |
| `/delete-account` | [customer](customer.md) |
| `/privacy-policy` | [customer](customer.md) |
| `/terms-conditions` | [customer](customer.md) |
| `/address-map` | [customer](customer.md) |
| `/address-search` | [customer](customer.md) |
| `/address-form` | [customer](customer.md) |
| `/payment-options` | [commerce](commerce.md) |
| `/checkout` | [commerce](commerce.md) |
| `/order` | [commerce](commerce.md) |
| `/order/:orderId` | [commerce](commerce.md) |
| `/profile` | [customer](customer.md) |
| `/language` | [customer](customer.md) |
| `/notifications` | [customer](customer.md) |
| `/reviews` | [customer](customer.md) |
| `/rewards` | [customer](customer.md) |
| `/settings/language` | [customer](customer.md) |
| `/tracking` | [commerce](commerce.md) |
| `/about-us` | [customer](customer.md) |
| `/contact-us` | [customer](customer.md) |
| `/team-login` | [roles](roles.md) |
| `/admin/*` | [administration](administration.md) |
| `/store-manager/dashboard` | [operations](operations.md) |
| `/store-manager/profile` | [operations](operations.md) |
| `/store-manager/orders` | [operations](operations.md) |
| `/store-manager/delivery-partners` | [operations](operations.md) |
| `/store-manager/delivery-radius` | [operations](operations.md) |
| `/store-manager/delivery-settings` | [operations](operations.md) |
| `/store-manager/change-password` | [operations](operations.md) |
| `/delivery` | [operations](operations.md) |
| `/delivery/orders` | [operations](operations.md) |
| `/delivery/history` | [operations](operations.md) |
| `/delivery/navigation` | [operations](operations.md) |
| `/unauthorized` | [customer](customer.md) |
| `/*` | [customer](customer.md) |

## Admin wildcard modules

All modules below are documented in [administration](administration.md); role lists are in [roles](roles.md).

- `/admin/dashboard`
- `/admin/locations`
- `/admin/users`
- `/admin/categories`
- `/admin/stores`
- `/admin/products`
- `/admin/banners`
- `/admin/inventory`
- `/admin/orders`
- `/admin/payments`
- `/admin/delivery`
- `/admin/notifications`
- `/admin/customers`
- `/admin/reviews`
- `/admin/coupons`
- `/admin/reports`
- `/admin/security`
- `/admin/audit-logs`
- `/admin/orders/assign/:orderId` — local global stocked-store assignment.
- `/admin/orders/delivery/:orderId` — backend partner assignment.

## Page and nested workspace source files

This inventory includes components without a top-level route. `OrdersHistoryPage` has no direct current router import; Register is a Login wrapper. Nested admin/store pages are reached through workspace logic.

| Source | Functional chapter |
|---|---|
| [src/pages/AddressFormPage/AddressFormPage.jsx](../../src/pages/AddressFormPage/AddressFormPage.jsx) | [customer](customer.md) |
| [src/pages/AddressMapPage/AddressMapPage.jsx](../../src/pages/AddressMapPage/AddressMapPage.jsx) | [customer](customer.md) |
| [src/pages/AddressSearchPage/AddressSearchPage.jsx](../../src/pages/AddressSearchPage/AddressSearchPage.jsx) | [customer](customer.md) |
| [src/pages/AdminWorkspace/AdminReports.jsx](../../src/pages/AdminWorkspace/AdminReports.jsx) | [administration](administration.md) |
| [src/pages/AdminWorkspace/AdminWorkspace.jsx](../../src/pages/AdminWorkspace/AdminWorkspace.jsx) | [administration](administration.md) |
| [src/pages/AdminWorkspace/DeliveryPartnerAssignment.jsx](../../src/pages/AdminWorkspace/DeliveryPartnerAssignment.jsx) | [administration](administration.md) |
| [src/pages/AdminWorkspace/GlobalStoreAssignment.jsx](../../src/pages/AdminWorkspace/GlobalStoreAssignment.jsx) | [administration](administration.md) |
| [src/pages/BannerPage.jsx](../../src/pages/BannerPage.jsx) | [customer](customer.md) |
| [src/pages/CartPage/CartPage.jsx](../../src/pages/CartPage/CartPage.jsx) | [customer](customer.md) |
| [src/pages/CategoriesPage/CategoriesPage.jsx](../../src/pages/CategoriesPage/CategoriesPage.jsx) | [customer](customer.md) |
| [src/pages/CheckoutGroupPage.jsx](../../src/pages/CheckoutGroupPage.jsx) | [commerce](commerce.md) |
| [src/pages/CheckoutPage/CheckoutPage.jsx](../../src/pages/CheckoutPage/CheckoutPage.jsx) | [commerce](commerce.md) |
| [src/pages/CustomerFeaturePage/CustomerFeaturePage.jsx](../../src/pages/CustomerFeaturePage/CustomerFeaturePage.jsx) | [customer](customer.md) |
| [src/pages/DeleteAccountPage/DeleteAccountPage.jsx](../../src/pages/DeleteAccountPage/DeleteAccountPage.jsx) | [customer](customer.md) |
| [src/pages/DeliveryNavigationPage/DeliveryNavigationPage.jsx](../../src/pages/DeliveryNavigationPage/DeliveryNavigationPage.jsx) | [operations](operations.md) |
| [src/pages/DeliveryWorkspace/DeliveryWorkspace.jsx](../../src/pages/DeliveryWorkspace/DeliveryWorkspace.jsx) | [operations](operations.md) |
| [src/pages/HelpCenterPage/HelpCenterPage.jsx](../../src/pages/HelpCenterPage/HelpCenterPage.jsx) | [customer](customer.md) |
| [src/pages/Home/Home.jsx](../../src/pages/Home/Home.jsx) | [customer](customer.md) |
| [src/pages/Introduction/Introduction.jsx](../../src/pages/Introduction/Introduction.jsx) | [customer](customer.md) |
| [src/pages/LanguageSelectionPage/LanguageSelectionPage.jsx](../../src/pages/LanguageSelectionPage/LanguageSelectionPage.jsx) | [customer](customer.md) |
| [src/pages/LegalPolicyPage/LegalPolicyPage.jsx](../../src/pages/LegalPolicyPage/LegalPolicyPage.jsx) | [customer](customer.md) |
| [src/pages/Login/Login.jsx](../../src/pages/Login/Login.jsx) | [customer](customer.md) |
| [src/pages/OrderDetailViewPage/OrderDetailViewPage.jsx](../../src/pages/OrderDetailViewPage/OrderDetailViewPage.jsx) | [commerce](commerce.md) |
| [src/pages/OrderPage/OrderPage.jsx](../../src/pages/OrderPage/OrderPage.jsx) | [commerce](commerce.md) |
| [src/pages/OrderReviewPage/OrderReviewPage.jsx](../../src/pages/OrderReviewPage/OrderReviewPage.jsx) | [commerce](commerce.md) |
| [src/pages/OrdersHistoryPage/OrdersHistoryPage.jsx](../../src/pages/OrdersHistoryPage/OrdersHistoryPage.jsx) | [commerce](commerce.md) |
| [src/pages/OrdersListPage/OrdersListPage.jsx](../../src/pages/OrdersListPage/OrdersListPage.jsx) | [commerce](commerce.md) |
| [src/pages/PaymentOptions/PaymentOptions.jsx](../../src/pages/PaymentOptions/PaymentOptions.jsx) | [commerce](commerce.md) |
| [src/pages/Profile/Profile.jsx](../../src/pages/Profile/Profile.jsx) | [customer](customer.md) |
| [src/pages/Register/Register.jsx](../../src/pages/Register/Register.jsx) | [customer](customer.md) |
| [src/pages/RoleLoginPage/RoleLoginPage.jsx](../../src/pages/RoleLoginPage/RoleLoginPage.jsx) | [roles](roles.md) |
| [src/pages/SavedAddressesPage/SavedAddressesPage.jsx](../../src/pages/SavedAddressesPage/SavedAddressesPage.jsx) | [customer](customer.md) |
| [src/pages/SavedForLaterPage/SavedForLaterPage.jsx](../../src/pages/SavedForLaterPage/SavedForLaterPage.jsx) | [customer](customer.md) |
| [src/pages/SearchPage/SearchPage.jsx](../../src/pages/SearchPage/SearchPage.jsx) | [customer](customer.md) |
| [src/pages/StatusPage/StatusPage.jsx](../../src/pages/StatusPage/StatusPage.jsx) | [customer](customer.md) |
| [src/pages/StoreManager/DeliveryPartners.jsx](../../src/pages/StoreManager/DeliveryPartners.jsx) | [operations](operations.md) |
| [src/pages/StoreManager/StoreManagerPortal.jsx](../../src/pages/StoreManager/StoreManagerPortal.jsx) | [operations](operations.md) |
| [src/pages/StorePage/StorePage.jsx](../../src/pages/StorePage/StorePage.jsx) | [customer](customer.md) |
| [src/pages/StoresListPage/StoresListPage.jsx](../../src/pages/StoresListPage/StoresListPage.jsx) | [customer](customer.md) |
| [src/pages/WishlistPage/WishlistPage.jsx](../../src/pages/WishlistPage/WishlistPage.jsx) | [customer](customer.md) |

## Service adapters and functional utilities

Exported names aid traceability; an export may be dormant or internal. Business descriptions and limitations remain authoritative in the chapters.

| Source | Exported symbols |
|---|---|
| [src/services/alertsService.js](../../src/services/alertsService.js) | `alertsService` |
| [src/services/apiClient.js](../../src/services/apiClient.js) | `ApiError`, `apiRequest` |
| [src/services/cartApi.js](../../src/services/cartApi.js) | `createCart`, `getCart`, `getActiveCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCartItems`, `calculateCartTotal` |
| [src/services/cartDeliveryLines.js](../../src/services/cartDeliveryLines.js) | `buildCartDeliveryLines`, `hasGlobalDelivery` |
| [src/services/catalogAdapter.js](../../src/services/catalogAdapter.js) | `adaptCategory`, `adaptVariant`, `adaptImage`, `adaptStoreProduct`, `adaptProduct`, `adaptProductList`, `adaptCategoryList`, `adaptBanner`, `adaptBannerList`, `adaptStoreProductList` |
| [src/services/catalogApi.js](../../src/services/catalogApi.js) | `getCategories`, `getCategory`, `createCategory`, `updateCategory`, `deleteCategory`, `getCategoryProducts`, `getBanners`, `createBanner`, `updateBanner`, `deleteBanner`, `setBannerStatus`, `getProducts`, `searchProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `getStores`, `getStore`, `createStore`, `updateStore`, `deleteStore`, `getStoreDeliveryZones`, `createStoreDeliveryZone`, `updateStoreDeliveryZone`, `deleteStoreDeliveryZone`, `getStoreDeliveryQuote`, `getCachedStoreDeliveryQuote`, `clearDeliveryQuoteCache`, `getProductVariants`, `getVariant`, `createVariant`, `updateVariant`, `deleteVariant`, `getProductImages`, `getImage`, `createImage`, `updateImage`, `deleteImage`, `getStoreProducts`, `createStoreProduct`, `updateStoreProduct`, `deleteStoreProduct` |
| [src/services/catalogConfig.js](../../src/services/catalogConfig.js) | `catalogBaseUrl` |
| [src/services/categoryImages.js](../../src/services/categoryImages.js) | `categoryImageFor`, `productImageFor`, `bannerImageFor`, `homepageCategoryImages` |
| [src/services/couponService.js](../../src/services/couponService.js) | `PENDING_COUPON_KEY`, `listCoupons`, `findCouponByCode`, `savePendingCouponCode`, `consumePendingCouponCode`, `cartPromotionContext`, `calculateCouponDiscount`, `validateCoupon`, `validateCouponCode` |
| [src/services/customerAuthService.js](../../src/services/customerAuthService.js) | `customerAuthService` |
| [src/services/customerProfileService.js](../../src/services/customerProfileService.js) | `customerProfileService` |
| [src/services/deliveryPartnerApi.js](../../src/services/deliveryPartnerApi.js) | `getDeliveryPartners`, `createDeliveryPartner`, `setDeliveryPartnerActive`, `getMyDeliveryProfile`, `updateMyDeliveryProfile`, `setMyAvailability`, `saveMyDeliveryLocation`, `getMyDeliveries`, `assignDatabasePartner`, `deliveryAction`, `requestDeliveryOtp` |
| [src/services/demoDataBootstrap.js](../../src/services/demoDataBootstrap.js) | `bootstrapDemoData` |
| [src/services/fulfillmentApi.js](../../src/services/fulfillmentApi.js) | `FULFILLMENT_STATUSES`, `FULFILLMENT_TYPES`, `SHIPMENT_STATUSES`, `isFulfillmentServiceUnavailable`, `isFulfillmentNotFound`, `createFulfillment`, `getFulfillmentById`, `getFulfillmentByOrderId`, `updateFulfillmentStatus`, `getShipmentByOrderId`, `createShipment`, `updateShipmentStatus`, `assignShipmentDeliveryPartner`, `markShipmentDelivered`, `getTrackingEvents`, `addTrackingEvent`, `normalizeFulfillment`, `normalizeShipment`, `normalizeTrackingEvent` |
| [src/services/googleMapsService.js](../../src/services/googleMapsService.js) | `loadGoogleMaps`, `getBrowserLocation`, `normalizeGoogleResult`, `reverseGeocodeLocation`, `getCurrentDeliveryLocation`, `googleMapsConfigured` |
| [src/services/inventoryAdapter.js](../../src/services/inventoryAdapter.js) | `adaptInventory`, `adaptInventoryList`, `adaptStockMovement`, `adaptStockMovementList`, `toInventoryCreatePayload`, `toInventoryUpdatePayload`, `toStockOperationPayload` |
| [src/services/inventoryApi.js](../../src/services/inventoryApi.js) | `createInventory`, `updateInventory`, `getInventory`, `getInventories`, `getInventoryForItem`, `findInventoryForItem`, `increaseStock`, `decreaseStock`, `reserveStock`, `releaseStock`, `getStockMovements` |
| [src/services/inventoryConfig.js](../../src/services/inventoryConfig.js) | `inventoryBaseUrl` |
| [src/services/localDataService.js](../../src/services/localDataService.js) | `authStore`, `profileStore`, `orderStore`, `deliveryPartnerStore`, `staffProfileStore`, `staffAuthStore`, `collectionStore`, `subscribeToLocalData`, `notificationStore`, `supportStore`, `loyaltyStore` |
| [src/services/notificationApi.js](../../src/services/notificationApi.js) | `NOTIFICATION_STATUSES`, `NOTIFICATION_CHANNELS`, `NOTIFICATION_TYPES`, `isNotificationServiceUnavailable`, `createNotification`, `getNotificationsByOrder`, `getNotificationsByCustomer`, `getNotificationHistory`, `getNotificationTemplates`, `sendNotification`, `normalizeNotification` |
| [src/services/openStreetMapService.js](../../src/services/openStreetMapService.js) | `getDeliveryLocationSuggestions`, `reverseGeocodeOpenStreetMap`, `geocodeOpenStreetMap`, `openStreetMapLocationUrl`, `openStreetMapDirectionsUrl`, `openStreetMapEmbedUrl`, `searchDeliveryLocations` |
| [src/services/orderApi.js](../../src/services/orderApi.js) | `ORDER_STATUSES`, `PAYMENT_STATUSES`, `isOrderServiceUnavailable`, `createOrder`, `getOrders`, `getOrder`, `getCheckoutGroup`, `getCheckoutGroupByKey`, `retryCheckoutGroup`, `createCheckoutGroup`, `getCustomerOrders`, `updateOrderStatus`, `updateOrderPaymentStatus`, `cancelOrder`, `getOrderItems`, `getOrderReview`, `saveOrderReview`, `getCustomerOrderHistory`, `normalizeOrderItem`, `normalizeOrder`, `orderDeliveryAddress`, `buildOrderItemsPayload`, `buildAddressPayload`, `buildOrderAddressesPayload` |
| [src/services/orderServiceWorkflow.js](../../src/services/orderServiceWorkflow.js) | `runOrderServiceWorkflow`, `prepareShipmentForAssignment` |
| [src/services/orgAccessService.js](../../src/services/orgAccessService.js) | `teamLandingPath`, `orgAccessService` |
| [src/services/paymentApi.js](../../src/services/paymentApi.js) | `PAYMENT_STATUSES`, `PAYMENT_METHODS`, `getPaymentCapabilities`, `isPaymentServiceUnavailable`, `normalizePayment`, `createPayment`, `getPayment`, `getPaymentByOrder`, `processDemoPayment`, `getPaymentStatus`, `refundDemoPayment`, `getPaymentTransactions` |
| [src/services/productStoreResolver.js](../../src/services/productStoreResolver.js) | `rememberProductStore`, `resolveProductStore` |
| [src/services/promotionScope.js](../../src/services/promotionScope.js) | `resolvedPromotionScope`, `promotionApplies` |
| [src/utils/addressPrefill.js](../../src/utils/addressPrefill.js) | `addressFieldsFromLocation`, `fillMissingAddressFields` |
| [src/utils/addressValidation.js](../../src/utils/addressValidation.js) | `validateAddressFields` |
| [src/utils/checkoutAvailability.js](../../src/utils/checkoutAvailability.js) | `validateCheckoutAvailability` |
| [src/utils/checkoutCart.js](../../src/utils/checkoutCart.js) | `prepareCheckoutCart`, `finishCheckoutCart` |
| [src/utils/checkoutGroup.js](../../src/utils/checkoutGroup.js) | `checkoutGroupView`, `resetFailedCheckout`, `submitCheckoutGroup` |
| [src/utils/checkoutPolicy.js](../../src/utils/checkoutPolicy.js) | `checkoutReviewError`, `checkoutPolicyError` |
| [src/utils/deliveryCharges.js](../../src/utils/deliveryCharges.js) | `totalDeliveryCharge` |
| [src/utils/demoCheckout.js](../../src/utils/demoCheckout.js) | `simulateCheckout` |
| [src/utils/demoTracking.js](../../src/utils/demoTracking.js) | `DEMO_TRACKING_INTERVAL`, `DEMO_TRACKING_STAGES`, `demoTrackingSnapshot`, `startDemoTracking`, `readManagedDemoTracking`, `listManagerDemoOrders`, `advanceManagerDemoOrder` |
| [src/utils/fulfillmentStatus.js](../../src/utils/fulfillmentStatus.js) | `fulfillmentStatusLabel`, `shipmentStatusLabel`, `fulfillmentTypeLabel`, `customerDeliveryStatus` |
| [src/utils/globalCheckout.js](../../src/utils/globalCheckout.js) | `validateGlobalCheckout`, `checkoutErrorMessage` |
| [src/utils/invoicePdf.js](../../src/utils/invoicePdf.js) | `invoiceFileName`, `invoiceLines`, `createInvoicePdf`, `downloadInvoicePdf` |
| [src/utils/orderCreationAttempt.js](../../src/utils/orderCreationAttempt.js) | `createOrderAttempt` |
| [src/utils/orderReceipt.js](../../src/utils/orderReceipt.js) | `receiptRows`, `verifiedPaymentLabel` |
| [src/utils/paymentAvailability.js](../../src/utils/paymentAvailability.js) | `requirePaymentProcessing` |
| [src/utils/persistedPayment.js](../../src/utils/persistedPayment.js) | `verifyPersistedPayment` |
| [src/utils/persistedStoreCheckout.js](../../src/utils/persistedStoreCheckout.js) | `persistStoreCheckout` |
| [src/utils/phoneValidation.js](../../src/utils/phoneValidation.js) | `indianMobileDigits`, `isValidIndianMobile`, `formatIndianMobile` |
| [src/utils/productStock.js](../../src/utils/productStock.js) | `loadProductStock` |
| [src/utils/profileCompletion.js](../../src/utils/profileCompletion.js) | `hasCompleteProfile` |
| [src/utils/registrationValidation.js](../../src/utils/registrationValidation.js) | `validRegistrationName`, `validRegistrationGmail` |
| [src/utils/selectedLocation.js](../../src/utils/selectedLocation.js) | `validLocation`, `readSelectedLocation`, `storeSelectedLocation` |
| [src/utils/shipmentRequest.js](../../src/utils/shipmentRequest.js) | `shipmentRequest` |
| [src/utils/storeDelivery.js](../../src/utils/storeDelivery.js) | `DELIVERY_MODE_OPTIONS`, `DELIVERY_METHOD_PRIORITY`, `parseDeliveryModes`, `deliveryMethodId`, `sortDeliveryMethods`, `preferredDeliveryMethod`, `deliverySlotLabel`, `deliverySummary`, `isGlobalStore`, `isGlobalProduct`, `deliveryDistanceKm`, `storeDeliversTo`, `deliveryProducts` |
| [src/utils/storeFulfillment.js](../../src/utils/storeFulfillment.js) | `storeFulfillmentMethod`, `pickupDeliveryLine` |
| [src/utils/storeProductListings.js](../../src/utils/storeProductListings.js) | `uniqueCatalogProducts`, `uniqueStoreProductListings`, `balancedStoreProductPreview` |
| [src/utils/textEncoding.js](../../src/utils/textEncoding.js) | `cleanDisplayText`, `cleanDisplayList` |

## Shared UI components

Components may serve multiple routes or local/demo presentations. Do not treat every component as a separately enabled feature.

- [src/components/BottomNav/BottomNav.jsx](../../src/components/BottomNav/BottomNav.jsx)
- [src/components/BrandLoader/BrandLoader.jsx](../../src/components/BrandLoader/BrandLoader.jsx)
- [src/components/CampaignCarousel/CampaignCarousel.jsx](../../src/components/CampaignCarousel/CampaignCarousel.jsx)
- [src/components/CartAddedPopover/CartAddedPopover.jsx](../../src/components/CartAddedPopover/CartAddedPopover.jsx)
- [src/components/CartDrawer/CartDrawer.jsx](../../src/components/CartDrawer/CartDrawer.jsx)
- [src/components/CategoryCircle/CategoryCircle.jsx](../../src/components/CategoryCircle/CategoryCircle.jsx)
- [src/components/CategoryNav/CategoryNav.jsx](../../src/components/CategoryNav/CategoryNav.jsx)
- [src/components/CheckoutGroupResult.jsx](../../src/components/CheckoutGroupResult.jsx)
- [src/components/DemoDeliveryTracking.jsx](../../src/components/DemoDeliveryTracking.jsx)
- [src/components/DemoOrderDetails.jsx](../../src/components/DemoOrderDetails.jsx)
- [src/components/DemoTrackingMap.jsx](../../src/components/DemoTrackingMap.jsx)
- [src/components/FulfillmentTrackingPanel/FulfillmentTrackingPanel.jsx](../../src/components/FulfillmentTrackingPanel/FulfillmentTrackingPanel.jsx)
- [src/components/GoogleLocationPicker/GoogleLocationPicker.jsx](../../src/components/GoogleLocationPicker/GoogleLocationPicker.jsx)
- [src/components/Header/Header.jsx](../../src/components/Header/Header.jsx)
- [src/components/HeroBanner/HeroBanner.jsx](../../src/components/HeroBanner/HeroBanner.jsx)
- [src/components/HomeHeaderBanner/HomeHeaderBanner.jsx](../../src/components/HomeHeaderBanner/HomeHeaderBanner.jsx)
- [src/components/LocationSelectionModal/LocationSelectionModal.jsx](../../src/components/LocationSelectionModal/LocationSelectionModal.jsx)
- [src/components/ManagerDemoOrders.jsx](../../src/components/ManagerDemoOrders.jsx)
- [src/components/NotificationHistoryPanel/NotificationHistoryPanel.jsx](../../src/components/NotificationHistoryPanel/NotificationHistoryPanel.jsx)
- [src/components/OrderDocuments.jsx](../../src/components/OrderDocuments.jsx)
- [src/components/OTPVerification/OTPVerification.jsx](../../src/components/OTPVerification/OTPVerification.jsx)
- [src/components/PersistedPaymentReference.jsx](../../src/components/PersistedPaymentReference.jsx)
- [src/components/ProductCard/ProductCard.jsx](../../src/components/ProductCard/ProductCard.jsx)
- [src/components/ProductInfo/ProductInfo.jsx](../../src/components/ProductInfo/ProductInfo.jsx)
- [src/components/ProductSection/ProductSection.jsx](../../src/components/ProductSection/ProductSection.jsx)
- [src/components/ProtectedRoute/ProtectedRoute.jsx](../../src/components/ProtectedRoute/ProtectedRoute.jsx)
- [src/components/SafeProductImage/SafeProductImage.jsx](../../src/components/SafeProductImage/SafeProductImage.jsx)
- [src/components/SmsDisclaimer/SmsDisclaimer.jsx](../../src/components/SmsDisclaimer/SmsDisclaimer.jsx)
- [src/components/TermsAndConditions/TermsAndConditons.jsx](../../src/components/TermsAndConditions/TermsAndConditons.jsx)

## Coverage totals

- Declared router paths: 60.
- Admin module names: 18.
- Page/workspace JSX files: 40.
