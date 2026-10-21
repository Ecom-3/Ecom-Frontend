# Backend endpoint inventory

Generated controller mapping/authorization annotations from the sibling backend source. Entries preserve declared annotations instead of guessing fully composed URLs. Class `RequestMapping` supplies a prefix; method mappings supply suffixes. Authorization can also be enforced in service/access classes, gateway filters and global security configuration.

This is an implementation appendix, not a promise that every endpoint is exposed in a user workflow or that all controller internals were runtime-tested.

## cart-service: CartController

Source: [CartController.java](../../../ecom-backend/cart-service/src/main/java/com/metaarch/cart/cart/CartController.java).

```java
// line 11
@RequestMapping("/api/v1/carts")
// line 16
@PreAuthorize("@cartAccess.customer(#request.customerId())")
// line 17
@PostMapping
// line 18
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 19
@GetMapping("/{cartId}")
// line 20
@PreAuthorize("@cartAccess.customer(#customerId)")
// line 21
@GetMapping("/active")
// line 22
@PreAuthorize("@cartAccess.customer(#customerId)")
// line 23
@GetMapping("/customer/{customerId}/active")
// line 24
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 25
@PostMapping("/{cartId}/items")
// line 26
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 27
@PostMapping("/{cartId}/checkout-claim")
// line 28
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 29
@PatchMapping("/{cartId}/items/{itemId}")
// line 30
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 31
@DeleteMapping("/{cartId}/items/{itemId}")
// line 32
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 33
@DeleteMapping("/{cartId}/items")
// line 34
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 35
@PostMapping("/{cartId}/calculate-total")
// line 36
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 37
@PatchMapping("/{cartId}/items/{itemId}/save-for-later")
// line 38
@PreAuthorize("@cartAccess.owner(#cartId)")
// line 39
@PatchMapping("/{cartId}/items/{itemId}/move-to-cart")
```

## catalog-service: BannerController

Source: [BannerController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/banner/BannerController.java).

```java
// line 10
@RequestMapping("/api/v1/banners")
// line 15
@GetMapping
// line 20
@GetMapping("/{id}")
// line 23
@PostMapping
// line 29
@PutMapping("/{id}")
// line 32
@PatchMapping("/{id}/status")
// line 38
@DeleteMapping("/{id}")
```

## catalog-service: CategoryController

Source: [CategoryController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/category/CategoryController.java).

```java
// line 3
@RequestMapping("/api/v1/categories")
// line 5
@PostMapping
// line 6
@GetMapping
// line 6
@GetMapping("/{id}")
// line 6
@PutMapping("/{id}")
// line 7
@GetMapping("/{id}/products")
// line 8
@DeleteMapping("/{id}")
```

## catalog-service: ProductImageController

Source: [ProductImageController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/image/ProductImageController.java).

```java
// line 5
@PostMapping("/api/v1/products/{productId}/images")
// line 6
@GetMapping("/api/v1/products/{productId}/images")
// line 6
@GetMapping("/api/v1/images/{id}")
// line 7
@PutMapping("/api/v1/images/{id}")
// line 7
@DeleteMapping("/api/v1/images/{id}")
```

## catalog-service: ProductController

Source: [ProductController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/product/ProductController.java).

```java
// line 3
@RequestMapping("/api/v1/products")
// line 5
@PostMapping
// line 6
@GetMapping
// line 7
@GetMapping("/{id}")
// line 7
@PutMapping("/{id}")
// line 8
@DeleteMapping("/{id}")
```

## catalog-service: StoreController

Source: [StoreController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/store/StoreController.java).

```java
// line 10
@RequestMapping("/api/v1/stores")
// line 18
@PostMapping
// line 24
@GetMapping
// line 27
@GetMapping("/{id}")
// line 30
@PutMapping("/{id}")
// line 33
@DeleteMapping("/{id}")
// line 37
@GetMapping("/{id}/delivery-zones")
// line 40
@GetMapping("/delivery-zones/{zoneId}/location")
// line 43
@PostMapping("/{id}/delivery-zones")
// line 49
@PutMapping("/{storeId}/delivery-zones/{zoneId}")
// line 54
@DeleteMapping("/{storeId}/delivery-zones/{zoneId}")
// line 58
@GetMapping("/{id}/delivery-quote")
```

## catalog-service: StoreProductController

Source: [StoreProductController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/storeproduct/StoreProductController.java).

```java
// line 3
@RequestMapping("/api/v1/store-products")
// line 5
@PostMapping
// line 6
@GetMapping
// line 6
@GetMapping("/{id}")
// line 7
@PutMapping("/{id}")
// line 7
@DeleteMapping("/{id}")
```

## catalog-service: ProductVariantController

Source: [ProductVariantController.java](../../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/variant/ProductVariantController.java).

```java
// line 5
@PostMapping("/api/v1/products/{productId}/variants")
// line 6
@GetMapping("/api/v1/products/{productId}/variants")
// line 6
@GetMapping("/api/v1/variants/{id}")
// line 7
@PutMapping("/api/v1/variants/{id}")
// line 7
@DeleteMapping("/api/v1/variants/{id}")
```

## customer-profile-service: CustomerAddressController

Source: [CustomerAddressController.java](../../../ecom-backend/customer-profile-service/src/main/java/com/metaarch/customerprofile/address/CustomerAddressController.java).

```java
// line 3
@RequestMapping("/api/v1/profiles/me/addresses")
// line 6
@GetMapping
// line 7
@PostMapping
// line 8
@PutMapping("/{id}")
// line 9
@PatchMapping("/{id}/default")
// line 10
@DeleteMapping("/{id}")
```

## customer-profile-service: CustomerProfileController

Source: [CustomerProfileController.java](../../../ecom-backend/customer-profile-service/src/main/java/com/metaarch/customerprofile/profile/CustomerProfileController.java).

```java
// line 6
@RequestMapping("/api/v1/profiles")
// line 10
@GetMapping("/me")
// line 11
@PutMapping("/me")
// line 12
@DeleteMapping("/me")
// line 13
@GetMapping("/{username}")
```

## Ecom-Alerts: AlertsController

Source: [AlertsController.java](../../../ecom-backend/Ecom-Alerts/src/main/java/com/metaarch/alerts/controller/AlertsController.java).

```java
// line 20
@RequestMapping("/api/alerts")
// line 28
@GetMapping("/health")
// line 33
@PostMapping("/test-email")
```

## Ecom-Org-access: AuthController

Source: [AuthController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/auth/AuthController.java).

```java
// line 14
@RequestMapping("/api/auth")
// line 24
@PostMapping("/login")
// line 31
@PostMapping("/register")
// line 37
@GetMapping("/validate")
// line 42
@GetMapping("/me")
```

## Ecom-Org-access: CustomerAccountController

Source: [CustomerAccountController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/customer/CustomerAccountController.java).

```java
// line 18
@GetMapping("/api/customers/me")
// line 18
@PreAuthorize("hasRole('CUSTOMER')")
// line 20
@PutMapping("/api/customers/me/name")
// line 20
@PreAuthorize("hasRole('CUSTOMER')")
// line 26
@PostMapping("/api/auth/logout")
```

## Ecom-Org-access: CustomerAuthController

Source: [CustomerAuthController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/customer/CustomerAuthController.java).

```java
// line 10
@RequestMapping("/api/auth/customer")
// line 24
@GetMapping("/options")
// line 25
@PostMapping("/register")
// line 28
@PostMapping("/login")
// line 31
@PostMapping("/otp/send")
// line 34
@PostMapping("/otp/verify")
// line 37
@PostMapping("/password/reset")
```

## Ecom-Org-access: DeliveryOperationsController

Source: [DeliveryOperationsController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/DeliveryOperationsController.java).

```java
// line 21
@RequestMapping("/api/delivery")
// line 89
@GetMapping("/me/orders")
// line 90
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
// line 117
@PutMapping("/orders/{orderId}/partner/{partnerId}")
// line 118
@PreAuthorize("hasAnyRole('STORE_MANAGER','LOCATION_ADMIN','GLOBAL_ADMIN','SUPER_ADMIN')")
// line 122
@PreAuthorize
// line 149
@PostMapping("/me/orders/{orderId}/actions")
// line 150
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
// line 186
@PostMapping("/me/orders/{orderId}/otp")
// line 187
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
```

## Ecom-Org-access: DeliveryPartnerController

Source: [DeliveryPartnerController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/DeliveryPartnerController.java).

```java
// line 17
@RequestMapping("/api/delivery-partners")
// line 18
@PreAuthorize("hasAnyRole('STORE_MANAGER','LOCATION_ADMIN','GLOBAL_ADMIN','SUPER_ADMIN')")
// line 41
@GetMapping
// line 60
@PostMapping
// line 62
@PreAuthorize("hasRole('STORE_MANAGER')")
// line 86
@PutMapping("/{id}/status")
```

## Ecom-Org-access: NotificationRecipientController

Source: [NotificationRecipientController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/NotificationRecipientController.java).

```java
// line 15
@RequestMapping("/internal/notification-recipients")
// line 23
@GetMapping
// line 24
@PreAuthorize("hasAnyRole('SUPER_ADMIN','GLOBAL_ADMIN')")
```

## Ecom-Org-access: StaffProfileController

Source: [StaffProfileController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/StaffProfileController.java).

```java
// line 15
@RequestMapping("/api/users/me")
// line 19
@GetMapping
// line 37
@PutMapping
// line 38
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
// line 48
@PutMapping("/availability")
// line 49
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
// line 56
@PutMapping("/delivery-location")
// line 57
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
```

## Ecom-Org-access: UserController

Source: [UserController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/UserController.java).

```java
// line 15
@RequestMapping("/api/users")
// line 20
@PostMapping
// line 22
@PreAuthorize("hasAnyRole('SUPER_ADMIN','GLOBAL_ADMIN') and hasAuthority('PERM_USER_WRITE')")
// line 28
@PutMapping("/me/password")
```

## Ecom-Org-access: PingController

Source: [PingController.java](../../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/system/PingController.java).

```java
// line 9
@RequestMapping("/api/ping")
// line 12
@GetMapping
```

## fulfillment-service: FulfillmentController

Source: [FulfillmentController.java](../../../ecom-backend/fulfillment-service/src/main/java/com/metaarch/fulfillment/fulfillment/FulfillmentController.java).

```java
// line 10
@RequestMapping("/api/v1/fulfillments")
// line 14
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.create(#request)")
// line 15
@PostMapping
// line 16
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.owner(#fulfillmentId)")
// line 17
@GetMapping("/{fulfillmentId}")
// line 18
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.order(#orderId)")
// line 19
@GetMapping("/order/{orderId}")
// line 20
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.manage(#fulfillmentId)")
// line 21
@PatchMapping("/{fulfillmentId}/status")
```

## fulfillment-service: ShipmentController

Source: [ShipmentController.java](../../../ecom-backend/fulfillment-service/src/main/java/com/metaarch/fulfillment/shipment/ShipmentController.java).

```java
// line 10
@RequestMapping("/api/v1/shipments")
// line 14
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.partnerId() != null")
// line 15
@GetMapping("/assigned")
// line 19
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.manage(#request.fulfillmentId())")
// line 20
@PostMapping
// line 21
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.order(#orderId)")
// line 22
@GetMapping("/order/{orderId}")
// line 23
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.updateAssignedShipment(#shipmentId)")
// line 24
@PatchMapping("/{shipmentId}/status")
// line 25
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.manageShipment(#shipmentId)")
// line 26
@PatchMapping("/{shipmentId}/delivery-partner")
// line 27
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.manageShipment(#shipmentId)")
// line 28
@PatchMapping("/{shipmentId}/delivered")
```

## fulfillment-service: AssignmentAcceptanceController

Source: [AssignmentAcceptanceController.java](../../../ecom-backend/fulfillment-service/src/main/java/com/metaarch/fulfillment/tracking/AssignmentAcceptanceController.java).

```java
// line 7
@RequestMapping("/api/v1/shipments")
// line 11
@PostMapping("/{shipmentId}/start-delivery")
// line 12
@PreAuthorize("@fulfillmentAccess.assignedShipment(#shipmentId)")
// line 16
@PostMapping("/{shipmentId}/accept-assignment")
// line 17
@PreAuthorize("@fulfillmentAccess.assignedShipment(#shipmentId)")
```

## fulfillment-service: TrackingController

Source: [TrackingController.java](../../../ecom-backend/fulfillment-service/src/main/java/com/metaarch/fulfillment/tracking/TrackingController.java).

```java
// line 10
@RequestMapping("/api/v1/shipments/{shipmentId}/tracking-events")
// line 14
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.updateAssignedShipment(#shipmentId)")
// line 15
@PostMapping
// line 16
@org.springframework.security.access.prepost.PreAuthorize("@fulfillmentAccess.shipment(#shipmentId)")
// line 17
@GetMapping
```

## http-sync: SyncController

Source: [SyncController.java](../../../ecom-backend/http-sync/src/main/java/com/metaarch/sync/SyncController.java).

```java
// line 20
@PostMapping(value = "/internal/events", consumes = "application/json")
```

## inventory-service: InventoryController

Source: [InventoryController.java](../../../ecom-backend/inventory-service/src/main/java/com/metaarch/inventory/inventory/InventoryController.java).

```java
// line 22
@RequestMapping("/api/v1/inventories")
// line 27
@org.springframework.security.access.prepost.PreAuthorize("T(com.metaarch.sync.PublicApiSecurity).administrator()")
// line 28
@PostMapping
// line 31
@org.springframework.security.access.prepost.PreAuthorize("T(com.metaarch.sync.PublicApiSecurity).administrator()")
// line 32
@PutMapping("/{id}")
// line 33
@GetMapping("/{id}")
// line 34
@GetMapping(params = "productId")
// line 35
@GetMapping
```

## inventory-service: StockController

Source: [StockController.java](../../../ecom-backend/inventory-service/src/main/java/com/metaarch/inventory/movement/StockController.java).

```java
// line 17
@org.springframework.security.access.prepost.PreAuthorize("T(com.metaarch.sync.PublicApiSecurity).administrator()")
// line 23
@PostMapping("/api/v1/inventories/{id}/stock/increase")
// line 24
@PostMapping("/api/v1/inventories/{id}/stock/decrease")
// line 25
@PostMapping("/api/v1/inventories/{id}/stock/reserve")
// line 26
@PostMapping("/api/v1/inventories/{id}/stock/release")
// line 27
@GetMapping("/api/v1/inventories/{id}/movements")
```

## notification-service: NotificationController

Source: [NotificationController.java](../../../ecom-backend/notification-service/src/main/java/com/metaarch/notification/notification/NotificationController.java).

```java
// line 13
@RequestMapping("/api/v1/notifications")
// line 18
@PostMapping
// line 19
@GetMapping("/{notificationId}")
// line 20
@GetMapping("/customer/{customerId}")
// line 21
@GetMapping("/order/{orderId}")
// line 22
@GetMapping("/history")
// line 23
@PatchMapping("/{notificationId}/status")
// line 24
@PostMapping("/{notificationId}/send")
```

## notification-service: NotificationTemplateController

Source: [NotificationTemplateController.java](../../../ecom-backend/notification-service/src/main/java/com/metaarch/notification/template/NotificationTemplateController.java).

```java
// line 13
@RequestMapping("/api/v1/notification-templates")
// line 18
@PostMapping
// line 19
@PutMapping("/{templateId}")
// line 20
@GetMapping("/{templateId}")
// line 21
@GetMapping
```

## order-service: CheckoutController

Source: [CheckoutController.java](../../../ecom-backend/order-service/src/main/java/com/metaarch/order/order/CheckoutController.java).

```java
// line 10
@RequestMapping("/api/v1/checkouts")
// line 21
@PostMapping
// line 32
@GetMapping("/{id}")
// line 33
@GetMapping("/by-key/{key}")
// line 34
@PostMapping("/{id}/retry")
```

## order-service: OrderController

Source: [OrderController.java](../../../ecom-backend/order-service/src/main/java/com/metaarch/order/order/OrderController.java).

```java
// line 10
@RequestMapping("/api/v1/orders")
// line 16
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.create(#request.customerId())")
// line 17
@PostMapping
// line 18
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.store(#storeId)")
// line 19
@GetMapping
// line 20
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.read(#orderId)")
// line 21
@GetMapping("/{orderId}")
// line 22
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.customer(#customerId)")
// line 23
@GetMapping("/customer/{customerId}")
// line 24
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.manage(#orderId)")
// line 25
@PatchMapping("/{orderId}/status")
// line 26
@org.springframework.security.access.prepost.PreAuthorize("false")
// line 27
@PatchMapping("/{orderId}/payment-status")
// line 28
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.owner(#orderId)")
// line 29
@PostMapping("/{orderId}/cancel")
// line 30
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.owner(#orderId)")
// line 31
@GetMapping("/{orderId}/items")
// line 32
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.owner(#orderId)")
// line 33
@GetMapping("/{orderId}/review")
// line 34
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.owner(#orderId)")
// line 35
@PostMapping("/{orderId}/review")
// line 36
@org.springframework.security.access.prepost.PreAuthorize("@orderAccess.customer(#customerId)")
// line 37
@GetMapping("/customer/{customerId}/history")
```

## payment-service: PaymentController

Source: [PaymentController.java](../../../ecom-backend/payment-service/src/main/java/com/metaarch/payment/payment/PaymentController.java).

```java
// line 10
@RequestMapping("/api/v1/payments")
// line 14
@GetMapping("/capabilities")
// line 18
@org.springframework.security.access.prepost.PreAuthorize("false")
// line 19
@PostMapping
// line 20
@org.springframework.security.access.prepost.PreAuthorize("@paymentAccess.owner(#paymentId)")
// line 21
@GetMapping("/{paymentId}")
// line 22
@org.springframework.security.access.prepost.PreAuthorize("@paymentAccess.order(#orderId)")
// line 23
@GetMapping("/order/{orderId}")
// line 24
@org.springframework.security.access.prepost.PreAuthorize("false")
// line 25
@PostMapping("/{paymentId}/process-demo")
// line 26
@org.springframework.security.access.prepost.PreAuthorize("@paymentAccess.owner(#paymentId)")
// line 27
@GetMapping("/{paymentId}/status")
// line 28
@org.springframework.security.access.prepost.PreAuthorize("false")
// line 29
@PostMapping("/{paymentId}/refund-demo")
// line 30
@org.springframework.security.access.prepost.PreAuthorize("@paymentAccess.owner(#paymentId)")
// line 31
@GetMapping("/{paymentId}/transactions")
```

## payment-service: PaymentWebhookController

Source: [PaymentWebhookController.java](../../../ecom-backend/payment-service/src/main/java/com/metaarch/payment/provider/PaymentWebhookController.java).

```java
// line 9
@PostMapping(value="/internal/provider/payment-webhook", consumes="application/json")
```
