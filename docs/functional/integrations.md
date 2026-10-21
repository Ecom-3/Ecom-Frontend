# Integrations, data ownership and configuration

## Service ownership

Source: [service routes](../../src/config/serviceRoutes.js). Prefixes are composed with `VITE_API_BASE_URL` unless the per-service override is set.

| Service / gateway prefix | Business responsibility | Frontend adapter |
|---|---|---|
| Organization access `/org-access` | Customer/staff auth, identity, partner profiles and operations | `customerAuthService`, `orgAccessService`, `deliveryPartnerApi` |
| Customer profile `/customer-profile` | Personal profile and saved addresses | `customerProfileService` |
| Catalog `/catalog-service` | Categories, products, variants, images, banners, stores, store offers, delivery quotes/zones | `catalogApi` |
| Inventory `/inventory-service` | Stock records and stock movements/reservations | `inventoryApi` |
| Cart `/cart-api` | Store/customer carts and items | `cartApi` |
| Order `/order-api` | Saved orders, history, cancellation, reviews, checkout groups | `orderApi` |
| Payment `/payment-service` | Capability, payment reads/transactions and gated provider workflow | `paymentApi` |
| Fulfillment `/fulfillment` | Fulfillment, shipment, assignment and tracking | `fulfillmentApi` |
| Notification `/notification-service` | Notification records/history and templates | `notificationApi` |
| Alerts `/alerts-service` | Alert integration | `alertsService` |

Config server, gateway, service discovery and HTTP synchronization infrastructure support these services. They are not separate customer features. See [backend endpoint inventory](backend-endpoints.md) for source mappings and guards.

## Persistence boundary

| Data | Current functional storage |
|---|---|
| Authenticated session | Session storage plus backend authentication |
| Guest cart | Browser local storage |
| Customer/store cart | Cart Service; frontend cache/state |
| Catalog/inventory | Service-backed with local adapters/cache/fallbacks in selected paths |
| Customer profile/addresses | Profile Service; frontend caches |
| Wishlist/saved items | Browser local storage, including account-scoped keys |
| Orders | Order Service plus separate local/demo order representations |
| Global stocked-store assignment screen | Local order store |
| Order reviews | Order Service database |
| General product reviews | Local collection |
| General notifications page | Local notification store |
| Order/OTP notifications | Notification Service integration |
| Rewards/referral vouchers | Local loyalty store |
| Support tickets/chat | Local storage, automatic local reply |
| Generic customer/security/coupon collections | Local collection behavior |
| Admin audit entries | Local collection activity |
| Locale preferences | Local preferences/profile store |

Do not assume local data follows a user to another browser. Some collections use shared browser keys rather than per-account keys. Demo/local classes and helpers are not evidence that production routes use every method they expose.

## Core business entities

- **Customer/user:** authentication identity and customer profile identity are related but not interchangeable; token `customerId` drives customer service ownership.
- **Store:** operational location, coordinates, contact, delivery/pickup capability and associated manager.
- **Product/variant/store offer:** master description plus variant identity and store-specific availability/price mapping.
- **Inventory:** store/product/variant quantities, reservations and reorder threshold.
- **Cart:** customer/store selection before order creation.
- **Order:** immutable-at-creation item/address/delivery snapshots plus order/payment state.
- **Checkout group:** coordinated attempt containing store checkout children and recovery information.
- **Fulfillment:** preparation/allocation lifecycle.
- **Shipment:** delivery assignment, transport lifecycle and tracking events.
- **Payment:** saved payment state and transaction evidence; distinct from order success.
- **Review:** either local product moderation record or database order review.

## Maps and location

[Google Maps service](../../src/services/googleMapsService.js) reads `VITE_GOOGLE_MAPS_API_KEY`, loads browser maps/geocoding and normalizes location results. Browser geolocation requires browser/user availability. Document the key's presence as a dependency, never its value.

[OpenStreetMap service](../../src/services/openStreetMapService.js) supports search/reverse geocoding, embedded maps and directions URLs, with local suggestion/fallback behavior in parts of the implementation. Delivery navigation uses approximate straight-line calculations.

Catalog delivery verification uses OpenRouteService driving-route results. The three mechanisms serve different purposes; a frontend map working does not prove backend route quotes work.

## Configuration switches and dependencies

- `VITE_API_BASE_URL` and service URL overrides determine service routing.
- `VITE_PERSISTED_MULTI_STORE_CHECKOUT=false` disables multigroup checkout at the payment screen.
- `VITE_GOOGLE_MAPS_API_KEY` enables the corresponding Google browser integration.
- Server mail/OTP delivery, route provider, databases and service-to-service authentication affect runtime success.
- Payment processing is currently disabled in controller code, not simply hidden by a UI preference.
- Currency display preference does not change backend INR payment verification.

Private `.env` values and YAML secrets were not copied into this pack.

## Errors and session behavior

[apiClient](../../src/services/apiClient.js) adds bearer authentication when appropriate and parses server validation/messages. Default timeout is 12 seconds for GET-like requests and 30 seconds for mutations; customer auth overrides with its 20-second request signal.

A 401/403 with a stale/missing session token can dispatch session expiry. A valid token with insufficient permissions is treated separately. Requests from an older token should not expire a newly established session.

204 returns no body. Non-JSON error bodies are supported. UI pages decide whether to show empty state, retry, local fallback or hard failure; these decisions vary by feature.

## Integration acceptance boundaries

Verify service contracts using owned test records and non-production notification destinations. Confirm event-driven convergence separately from synchronous responses. Do not infer payment settlement, carrier dispatch, support delivery or global account deletion from a local success message.
