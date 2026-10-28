# Location Admin Local QA Report

**Execution date:** 2026-10-25 (Asia/Kolkata; latest retest)
**Scope:** Local development only
**Frontend:** Vite configured for `http://localhost:5175` on this checkout (the prompt's port 5173 was not configured)
**API gateway:** `http://localhost:8082`
**Database:** The running Catalog process uses the configured local MySQL `catalog_service` schema. This run created, updated, and mapped one uniquely tagged test-owned product, then deleted its mapping and product through the authenticated browser. No pre-existing product, store, order, or customer record was changed. No direct SQL cleanup verification was performed. The browser write run was not isolated from the configured schema, so it is local runtime evidence, not an isolated-database test.
**Credentials:** Local Location Admin identity was verified; no credentials, tokens, or session secrets are recorded.

## Latest status summary â€” 2026-10-25

| Status | Count |
|---|---:|
| PASS | 30 |
| FAIL | 0 |
| PARTIAL | 5 |
| BLOCKED | 0 |
| SKIPPED | 0 |
| **Total** | **35** |

This latest disposition supersedes historical run summaries below. LA-11 remains PASS. LA-12 and LA-13 have authenticated browser and isolated Catalog authorization evidence, and LA-14 was reopened by the latest user request and exercised through mapping save/readback/unmap. These three cases remain PARTIAL because the browser writes used the configured `catalog_service` schema rather than an isolated test schema. LA-27 is PARTIAL: browser save/reload and failure handling were exercised with in-memory HTTP mocks, and backend persistence/authorization passed isolated H2 tests, but those two checks did not share one browser-connected H2 runtime. LA-28 remains PARTIAL because current retry behavior is same-store partner reassignment and there is no carrier retry adapter.

### Current status for recently retested use cases

| ID | Use case | Status | Issues / current limitation |
|---|---|---|---|
| LA-11 | Product creation/editing | PASS | Local authenticated browser created and edited a uniquely tagged location-owned product, created/edited its variant, verified edited data after reload, then deleted the disposable fixture. Same-location and cross-location authorization also pass in isolated Catalog tests. |
| LA-12 | Product status changes | PARTIAL | Browser toggled the test-owned product's location availability off and on (HTTP 200); after full reload, the disabled state was read back, and global catalog status remained Active. H2 tests cover true/false persistence and invalid/unauthenticated/cross-location denials. Browser writes were against configured MySQL, not an isolated test schema. |
| LA-13 | Product variants and images | PARTIAL | Browser created and edited a variant and image (201/200), then read edited values after reload. H2 covers same-location and cross-location authorization plus invalid relative image URLs. Browser writes were against configured MySQL, not an isolated test schema. |
| LA-14 | Store-product mappings | PARTIAL | Reopened the previously skipped case. Browser saved a second assigned-location mapping, reloaded both, unmapped the first, and confirmed the remaining mapping. H2 covers create/update/read/delete and cross-location/anonymous denial. Browser writes were against configured MySQL, not an isolated test schema. |
| LA-27 | Delivery partner assignment | PARTIAL | Browser UI used synthetic order/shipment/partner fixtures with in-memory route mocks: assignment returned mocked 200, success appeared, reload showed the mocked persisted assignment; a mocked 403 displayed an error without false success. Isolated H2 API tests separately verify database assignment readback, active partner validation, cross-store denial, and unauthenticated denial. No browser-connected H2 Fulfillment runtime was available, so end-to-end persistence across the UI and service is not proven. |
| LA-28 | Failed shipment retry | PARTIAL | Failed-assignment handling is improved, but carrier retry success/failure remains unverified because no defined carrier retry adapter or contract exists. |

## Initial QA run summary

| Status | Count |
|---|---:|
| PASS | 0 |
| FAIL | 28 |
| BLOCKED | 6 |
| SKIP | 0 |
| PARTIAL | 1 |
| UNVERIFIED | 0 |
| **Total** | **35** |

FAIL rows below are based on observed unauthenticated API behavior, isolated H2 integration tests, and deterministic role/scope guards in source. They do not represent authenticated Location Admin UI or MySQL persistence runs. Every such live workflow remains unexecuted because the required account was unavailable.

## Results

| ID | Use case | Status | Expected behavior | Actual behavior and evidence | Defect |
|---|---|---|---|---|---|
| LA-01 | Team Login and protected route | PARTIAL | An authorized Location Admin signs in, is identified by role, and reaches the correct workspace; protected pages require a session. | `/team-login` rendered the username/password form with no console errors. No authorized account was available, so login and role redirect were not tested. Unauthenticated `/admin` redirected to `/login`; admin content stayed inaccessible. | - |
| LA-02 | Location dashboard metrics | FAIL | Dashboard metrics use only the assigned location and agree with backend sources. | Dashboard was not opened. Source shows its order load calls the unfiltered Order API; `OrderAccess.store(null)` denies Location Admin, so the order metric path cannot load for that role. Inventory dashboard reads are also unscoped (D-02). | D-02, D-03 |
| LA-03 | Assigned-location stores | FAIL | Store list and details expose only assigned-location stores, with the API enforcing scope. | Unauthenticated `GET /catalog-service/api/v1/stores` returned 200. The Location Admin UI fetches the full store list and then applies client-side `scopeRecords`; the Catalog store controller has no location authorization. | D-01 |
| LA-04 | Create store | FAIL | Only an authorized Location Admin can create a store in the assigned location, with persisted scope. | In isolated `CatalogApiIntegrationTest.catalogCrudAndValidationRules`, `POST /api/v1/stores` without an authenticated principal returned 201. This test used H2; no live store was created. | D-01 |
| LA-05 | Edit store profile | FAIL | Updates are limited to stores in the assigned location and persist after refresh. | Not submitted. `/api/v1/stores/{id}` is outside the only Catalog security matcher and has no controller authorization; location-scoped update enforcement is absent. | D-01 |
| LA-06 | Store address and coordinates | FAIL | Only authorized stores can be edited; coordinate range and address validation persist. | Not submitted. Store create/update routes have no authentication or location-scope guard; input validation and persistence were not exercised. | D-01 |
| LA-07 | Delivery and pickup configuration | FAIL | Delivery/pickup settings can be changed only for assigned stores and persist. | Not submitted. Store and delivery-zone write routes are outside the Catalog security matcher and have no location-scope guard. | D-01 |
| LA-08 | Store active/closed status | FAIL | Only a disposable assigned-location store can be changed, with status verified after refresh. | Not submitted. Store update is not protected by Catalog authorization. No shared store was changed. | D-01 |
| LA-09 | Delete store | FAIL | Delete is authorized and limited to a disposable test store with no dependencies. | Not submitted. Store DELETE has no Catalog authorization or location-scope guard. No store was deleted. | D-01 |
| LA-10 | Location-scoped products | FAIL | Product results and details reflect the assigned location/store scope. | Unauthenticated `GET /catalog-service/api/v1/products` returned 200. AdminWorkspace requests products without a location/store filter; its product result is not passed through `scopeRecords`. | D-01 |
| LA-11 | Create/edit products | FAIL | Only authorized changes to a disposable product persist and remain after refresh. | Isolated Catalog integration test created a product via unauthenticated `POST /api/v1/products` and received 201. The test used H2; no live product was created. | D-01 |
| LA-12 | Product active/draft status | FAIL | Product status transitions are authorized and verified after refresh. | Not submitted. Product update routes have no Catalog security or location-scope guard. | D-01 |
| LA-13 | Product variants and images | FAIL | Variant/image validation and persistence work for a disposable product. | Not submitted. Variant and image write controllers are outside the only Catalog security matcher; no authenticated validation or persistence run was possible. | D-01 |
| LA-14 | Store-product mappings | FAIL | Location Admin can map only to an authorized store, including safe unmapping and read-back. | The mapping editor is rendered only for Global/Super Admin in AdminWorkspace. Catalog mapping writes allow Global Admin, Super Admin, and Store Manager, but not Location Admin. No mapping was changed. | D-04 |
| LA-15 | Location/store banners | FAIL | An inactive disposable banner is scoped to the assigned location/store and persists. | Not submitted. Banner write routes are not covered by Catalog's store-product-only security matcher and have no location authorization. | D-01 |
| LA-16 | Campaign edit/disable | FAIL | Only a disposable inactive QA campaign is changed within its scope. | Not submitted. Campaign/banner write routes have no Catalog location-scope guard. No existing campaign was changed. | D-01 |
| LA-17 | Inventory by store | FAIL | Inventory results are limited by the backend to authorized stores in the assigned location. | Unauthenticated `GET /inventory-service/api/v1/inventories` returned 401. The Inventory list controller itself has no role/scope guard; with an authenticated token, an omitted `storeId` lists all inventory. Location Admin loading omits `storeId` and filters only after retrieval. | D-02 |
| LA-18 | Create/edit inventory | FAIL | Location Admin can manage inventory only for assigned stores, with persisted association. | No write submitted. Inventory create/update guards call `PublicApiSecurity.administrator()`, which recognizes ADMIN, SUPER_ADMIN, and GLOBAL_ADMIN but excludes LOCATION_ADMIN. | D-02 |
| LA-19 | Adjust available stock | FAIL | Authorized stock adjustments validate quantities and update history only for disposable inventory. | No adjustment submitted. Stock mutation endpoints use the same administrator guard, which excludes Location Admin; no shared inventory was changed. | D-02 |
| LA-20 | Reservations and thresholds | FAIL | Reserved/available quantities and low-stock thresholds are visible only within assigned scope. | No authenticated view was possible. Inventory GET paths lack location/store authorization; an unfiltered list returns all records to an authenticated caller. | D-02 |
| LA-21 | Location-scoped orders | FAIL | Only orders for assigned stores/location are returned by the backend. | Unauthenticated `GET /order-api/api/v1/orders` returned 401. Order list authorization calls `orderAccess.store(storeId)`; for Location Admin with no store ID this is false because `OrderAccess` supports global admin and store-manager scope, but no location scope. | D-03 |
| LA-22 | Search/filter orders | FAIL | Search and filters operate on authorized location orders. | No authenticated list was available. The underlying list request is denied to Location Admin before filters can be verified. | D-03 |
| LA-23 | Order details and fulfillment | FAIL | Assigned-location order details load read-only with accurate lifecycle history. | No order was opened. `OrderAccess.owner/read` do not recognize Location Admin location scope, so the detail request is denied for that role. | D-03 |
| LA-24 | Confirm/process eligible orders | FAIL | Only a test-owned eligible order can be transitioned and persisted. | No transition was submitted. Order status management authorizes global admin or store-manager scope; Location Admin is not included. No existing order was touched. | D-03 |
| LA-25 | Packing/shipping actions | FAIL | Safe test-owned fulfillment actions persist without contacting a real carrier. | No shipment or fulfillment action was submitted. The Location Admin role is not accepted by the Order Service order-management guard; no safe order fixture was available. | D-03 |
| LA-26 | Open partner assignment | BLOCKED | Assignment UI opens and shows partners eligible for the order's assigned store. | No authorized session or eligible test order was available; the assignment workflow was not opened. | - |
| LA-27 | Select active store partner | BLOCKED | Only active eligible partners for the assigned store can be selected and persisted. | Not tested. The Org Access controller contains a location filter for partner reads, but there was no authorized account, partner fixture, or test-owned order to verify it. | - |
| LA-28 | Retry failed shipment | BLOCKED | Retry eligibility, limits, and duplicate prevention work with an isolated carrier fixture. | No isolated failed-shipment fixture or mocked carrier workflow was available. No retry was attempted. | - |
| LA-29 | Delivery management module | BLOCKED | Module navigation, data loading, and delivery scope work for the authorized location. | No Location Admin session was available; module behavior was not opened. | - |
| LA-30 | Local coupon configuration | FAIL | A uniquely tagged inactive coupon can be safely created/edited and persisted. | No coupon was created. Catalog coupon writes are outside the only security matcher and have no location authorization. | D-01 |
| LA-31 | Coupon store scope | FAIL | Store/location scope on a disposable coupon persists and remains restricted. | Not submitted. Catalog coupon writes have no location-scope guard; no coupon was changed. | D-01 |
| LA-32 | Location/store reports | FAIL | Report totals include only authorized location/store records and match backend aggregates. | Not opened. Reports load the unfiltered Order API; its list guard denies Location Admin because no location scope is implemented. | D-03 |
| LA-33 | Operational report filters | FAIL | Date/store/status filters change the scoped result set and recalculate totals. | Not opened. The underlying Order API list is denied to Location Admin; filter behavior could not yield a location-scoped report. | D-03 |
| LA-34 | JSON report export | BLOCKED | Normal UI export downloads valid JSON for the selected authorized-location filters. | No authenticated report dataset was available; no export was generated or inspected. | - |
| LA-35 | Logout | BLOCKED | Logout returns to Team Login and protected pages require authentication again. | No authenticated session existed to sign out. The protected `/admin` route was separately confirmed inaccessible while unauthenticated. | - |

## Confirmed defects

### D-01 - Catalog write APIs lack authentication and location authorization (Critical)

**Affected cases:** LA-03Ã¢â‚¬â€œLA-16, LA-30Ã¢â‚¬â€œLA-31.
**Reproduction/evidence:** `StoreProductSecurityConfig` applies its sole `SecurityFilterChain` only to `/api/v1/store-products/**`. Store, product, banner, coupon, variant, image, and delivery-zone routes are outside that matcher and do not declare controller-level authorization. The isolated Catalog integration test successfully creates a store and product without authentication (HTTP 201). The live read-only store and product GET requests also returned HTTP 200 without authentication.
**Risk:** Cross-location reads and unauthenticated catalog writes.
**Fix status:** Open. I did not add a broad role grant because a safe fix needs consistent location/store scope checks across catalog resources and must preserve public storefront reads.

### D-02 - Inventory reads are not location-scoped; Location Admin writes are rejected (High)

**Affected cases:** LA-02, LA-17Ã¢â‚¬â€œLA-20.
**Reproduction/evidence:** `InventoryController` GET endpoints have no method-level authorization, and `InventoryService.list` returns all rows when `storeId` is absent. AdminWorkspace calls `getAllInventories` without `storeId` for Location Admin and filters client-side afterward. Inventory create/update/stock endpoints use `PublicApiSecurity.administrator()`, which excludes `ROLE_LOCATION_ADMIN`.
**Fix status:** Open. A safe fix requires a backend store-to-location authorization source for inventory rows; simply adding Location Admin to the current broad administrator helper would expose cross-location stock.

### D-03 - Order Service does not implement Location Admin order scope (High)

**Affected cases:** LA-02, LA-21Ã¢â‚¬â€œLA-25, LA-32Ã¢â‚¬â€œLA-33.
**Reproduction/evidence:** `OrderAccess.store`, `owner`, and `manage` recognize global administrators or Store Managers with an exact store scope, but not Location Admin with a location scope. AdminWorkspace requests the unfiltered Order API for Location Admin dashboard, order-list, and report flows. The unauthenticated list request returned 401; no authenticated Location Admin request was possible.
**Fix status:** Open. The service needs a trusted order-to-location scope check before Location Admin access is enabled.

### D-04 - Location Admin cannot manage product-store mappings (High)

**Affected cases:** LA-14.
**Reproduction/evidence:** The mapping editor is opened only for Global/Super Admin in AdminWorkspace, and Catalog mapping write rules exclude `ROLE_LOCATION_ADMIN`.
**Fix status:** Open. A role-only addition would permit cross-location mapping; the target store must be checked against the assigned location.

## Location-scope and authorization findings

- Team Login route is `/team-login`; it rendered normally. The protected `/admin` route redirected to `/login` without rendering admin content.
- The available browser session was unauthenticated. No Location Admin identity, assigned location, or authorized store list could be established.
- Safe unauthenticated API reads: gateway health returned 200; Org Access self returned 403; Inventory, Order, Fulfillment, and Payment reads returned 401; Catalog store and product reads returned 200.
- These denials prove that unauthenticated callers cannot use those protected services, but they do not prove Location Admin location isolation. The Catalog integration test's unauthenticated store/product write success proves the Catalog authorization gap in an isolated H2 environment.
- No role-scoped API write, ID-tampering test, MySQL persistence check, or account-specific read was made.

## Automated verification

| Command/check | Result |
|---|---|
| `node.exe --test` (frontend) | PASS - 206 tests, 0 failures. |
| `npm.cmd run lint` (frontend) | PASS - no errors or warnings. |
| `npm.cmd run build` (frontend) | PASS - Vite production build completed; one existing large-chunk warning remains. |
| `mvn.cmd -f Ecom-Org-access/pom.xml '-Dtest=ScopeAuthorizationServiceTest,DeliveryPartnerControllerTest,UserControllerTest' test` | PASS - 22 tests. |
| `mvn.cmd -f catalog-service/pom.xml -Dtest=CatalogApiIntegrationTest test` | PASS - 3 tests. |
| `mvn.cmd -f inventory-service/pom.xml -Dtest=InventoryApiIntegrationTest test` | PASS - 5 tests. |
| `mvn.cmd -f order-service/pom.xml '-Dtest=StoreManagerAccessTest,ReviewAuthorizationTest,OrderServiceTest,OrderReviewServiceTest,VerifiedDeliveryTest' test` | PASS - 34 tests after correcting stale test fixtures. |
| `mvn.cmd -f fulfillment-service/pom.xml '-Dtest=FulfillmentAuthorizationTest,AssignedPartnerAccessTest' test` | PASS - 8 tests. |
| Full `catalog-service` suite | PASS - 14 tests, 0 failures/errors. |
| Full `inventory-service` suite | PASS - 17 tests, 0 failures/errors. |
| Full `order-service` suite | PASS - 106 tests, 0 failures/errors after test isolation fixes. |
| Full `fulfillment-service` suite | PASS - 20 tests, 0 failures/errors. |
| Full `Ecom-Org-access` suite | PASS - 61 tests, 0 failures/errors. Maven exited 0; Surefire waited for the unavailable Logstash appender retry thread before closing its fork. |
| `git diff --check` (frontend and backend) | PASS - rerun after this report was complete. |

### Test-fixture corrections made

- Updated Order Service unit fixtures for the current `OrderReviewResponse` and `OrderService` constructors and provided a reviewable product in the review-persistence test.
- Mocked `ReviewDeliveryVerifier` in `PaymentHttpIntegrationTest` so the test does not call a live local fulfillment service.
- Added the isolated JWT test secret required by Catalog's security configuration to `StoreDeliveryMappingIntegrationTest`.
- Added the missing role to an Org Access membership fixture so the privilege-escalation test exercises a valid membership.

These changes are test-only; no application runtime source or environment configuration was changed.

## Fixtures, cleanup, and data safety

- No local MySQL business records were created, edited, or deleted.
- No disposable Location Admin store, product, banner, inventory, coupon, order, shipment, partner, or mapping was created because no authorized Location Admin account and store scope were available.
- Backend integration suites used their configured H2 test databases and test fixtures; no live MySQL cleanup was needed.
- No payment, notification, carrier, or delivery-partner operation was initiated.
- No password, token, cookie, or customer PII was included in this report.
- Read-only Playwright route snapshots and console logs from Team Login and the unauthenticated protected-route check are in `.playwright-mcp/`.

## Remaining blocked work

- Authenticate through Team Login with an authorized Location Admin account and verify its assigned location and stores.
- Re-run Location Admin UI, authenticated API, persistence, refresh/read-back, and safe disposable-fixture cleanup checks for the 35 cases.
- Add and verify server-side location/store authorization for Catalog, Inventory, Order, reports, and product-store mappings before treating the role's current admin navigation as usable.
- Complete partner assignment/retry and JSON export checks with safe test-owned fixtures and isolated integrations.

## Readiness

**Not ready for Location Admin use.** The login/UI surface and frontend automated checks work, and the relevant backend service suites pass after test-only repairs. However, no authenticated Location Admin workflow or MySQL persistence was verified, Catalog writes are unauthenticated, Inventory reads are not location-scoped while its write guards exclude Location Admin, Order Service lacks Location Admin scope, and product-store mapping controls are unavailable to that role. Automated build/test success does not resolve these authorization and functionality gaps.

## Full Local Regression Retest - 2026-10-24

**Scope:** Retested the 34 functional cases LA-01 through LA-34, with the existing LA-35 Logout row retained as an additional check. This current-run addendum supersedes historical status claims above only where it gives fresh evidence; the original case IDs, order, and intent are retained.

**Environment:** Gateway `http://localhost:8082` and MySQL port `3306` were listening. The frontend's checked-in Vite configuration binds strictly to `5175`; `5173` was not configured or listening. Started Vite on `5175` for this run and stopped it afterward. No API or application port/configuration was changed.

### Summary for the 34 functional cases

| Status | Count |
|---|---:|
| PASS | 0 |
| FAIL | 28 |
| BLOCKED | 5 |
| PARTIAL | 1 |
| **Total** | **34** |

LA-35 Logout is an additional **BLOCKED** check, making 28 FAIL, 6 BLOCKED, and 1 PARTIAL across all 35 report rows. No case is counted twice.

### Account and browser verification

- Location Admin: the supplied username was submitted once with each of its two supplied password candidates. Both were rejected by local Org Access with HTTP 401 and the generic "Incorrect credentials or account unavailable" message. No further attempts, reset, lockout test, or auth/configuration change was made.
- Global Admin, Admin, Delivery, and Customer: each supplied login combination was tried once in its own isolated browser context; each was rejected with the same generic login message. Delivery username was discovered from the development seed fixture (`deliverypartner`), not guessed.
- No role was authenticated, so effective permissions, account-specific identity, location assignment, same-location access, and cross-location isolation could not be verified. The generic error does not distinguish an absent account from an invalid identifier/password.
- Source migrations define development account fixtures for `globaladmin`, `locationadmin`, and `deliverypartner`; this is source evidence only and does not prove those rows are present in the running database. The seed comment's password format does not match the supplied candidates, so no unsupplied credential was tried.
- The unauthenticated `/admin` request redirected to `/login`; evidence screenshot: [protected-route redirect](./location-admin-retest-unauth-protected-route.png). Browser snapshots and logs are under `.playwright-mcp/`.

### Fresh results for each functional case

| ID | Original use case | Status | Current retest result and evidence |
|---|---|---|---|
| LA-01 | Team Login and protected route | PARTIAL | Login form rendered. Both allowed Location Admin candidates failed once each (HTTP 401); `/admin` redirected to `/login`. Identity, role redirect, and authenticated session behavior remain blocked. |
| LA-02 | Location dashboard metrics | FAIL | Cannot open authenticated dashboard. Current source still requests unfiltered orders and inventories for dashboard data; the Order scope helper has no Location Admin location scope, and Inventory list reads have no location filter. |
| LA-03 | Assigned-location stores | FAIL | Anonymous `GET /catalog-service/api/v1/stores` returned HTTP 200. No authenticated location filtering is established. |
| LA-04 | Create store | FAIL | No live write attempted. Current Catalog integration test suite includes the previously observed unauthenticated store-create success on H2; this is not a live MySQL result. |
| LA-05 | Edit store profile | FAIL | No live write attempted. Current Catalog security filter still matches only `/api/v1/store-products/**`; store update is outside it and no controller location guard was found. |
| LA-06 | Store address and coordinates | FAIL | No live write attempted. Store write endpoints remain outside the Catalog security matcher; authenticated validation and persistence are unverified. |
| LA-07 | Delivery and pickup configuration | FAIL | No live write attempted. Delivery-zone/store writes remain outside the Catalog security matcher and lack the location guard required for this role. |
| LA-08 | Store active/closed status | FAIL | No live write attempted. Store status update remains outside the Catalog security matcher; no test fixture was verified disposable. |
| LA-09 | Delete store | FAIL | No delete submitted. Store delete remains outside the Catalog security matcher; no location authorization is established. |
| LA-10 | Location-scoped products | FAIL | Anonymous `GET /catalog-service/api/v1/products` returned HTTP 200; no location scoping was verified. |
| LA-11 | Create/edit products | FAIL | No live write attempted. Catalog integration tests still exercise unauthenticated product creation in isolated H2; this does not establish live persistence. |
| LA-12 | Product active/draft status | FAIL | No live write attempted. Product update routes remain outside the Catalog security matcher; no location-level authorization was found. |
| LA-13 | Product variants and images | FAIL | No live write attempted. Variant/image write routes remain outside the Catalog security matcher; persistence and validation were not exercised. |
| LA-14 | Store-product mappings | FAIL | No mapping changed. Mapping UI is still restricted to Global/Super Admin, and mapping API role rules omit Location Admin; same/cross-location behavior is unverified. |
| LA-15 | Location/store banners | FAIL | No live write attempted. Banner routes remain outside the Catalog security matcher; no location guard was found. |
| LA-16 | Campaign edit/disable | FAIL | No live write attempted. Campaign/banner write authorization remains unscoped in current Catalog configuration. |
| LA-17 | Inventory by store | FAIL | Anonymous `GET /inventory-service/api/v1/inventories` returned HTTP 401. Authenticated list behavior is still unscoped: the current service returns all inventory when `storeId` is absent, while this role's UI omits that filter. |
| LA-18 | Create/edit inventory | FAIL | No live write attempted. Current write guard accepts administrator roles but excludes Location Admin; persistence remains unverified. |
| LA-19 | Adjust available stock | FAIL | No stock mutation submitted. Current stock write guard excludes Location Admin; no inventory values were changed. |
| LA-20 | Reservations and thresholds | FAIL | No authenticated read possible. Inventory routes do not enforce Location Admin location/store scope on reads. |
| LA-21 | Location-scoped orders | FAIL | Anonymous `GET /order-api/api/v1/orders` returned HTTP 401. Current `OrderAccess` methods do not implement Location Admin location scope. |
| LA-22 | Search/filter orders | FAIL | No authenticated search/list possible. The underlying order list lacks the Location Admin scope required before filters can safely run. |
| LA-23 | Order details and fulfillment | FAIL | No order opened. Current order owner/read checks lack Location Admin location scope; no historical order was touched. |
| LA-24 | Confirm/process eligible orders | FAIL | No status action submitted. Current order management scope excludes Location Admin; no order was changed. |
| LA-25 | Packing/shipping actions | FAIL | No fulfillment action submitted. Current order management scope excludes Location Admin; no shipment or delivery was created. |
| LA-26 | Open partner assignment | BLOCKED | No authenticated Location Admin or test-owned order was available; assignment UI and eligible-partner list could not be tested. |
| LA-27 | Select active store partner | BLOCKED | No authenticated role, eligible test order, or verified partner fixture; persistence and store eligibility were not tested. |
| LA-28 | Retry failed shipment | BLOCKED | No isolated failed-shipment/carrier fixture; no retry was attempted. |
| LA-29 | Delivery management module | BLOCKED | No authenticated Location Admin session; module visibility, navigation, and scope could not be tested. |
| LA-30 | Local coupon configuration | FAIL | No live write attempted. Coupon writes remain outside Catalog's only security matcher and no location guard was found. |
| LA-31 | Coupon store scope | FAIL | No coupon changed. Current Catalog code does not enforce the required location/store scope for coupon writes. |
| LA-32 | Location/store reports | FAIL | No authenticated reports view. It depends on unfiltered Order API access, and current Order scope has no Location Admin location check. |
| LA-33 | Operational report filters | FAIL | No authenticated report dataset. Server-side order scope is missing, so safe filtered location aggregates cannot be verified. |
| LA-34 | JSON report export | BLOCKED | No authorized location-scoped report data was available; no export generated. |

### Additional case

| ID | Use case | Status | Current retest result |
|---|---|---|---|
| LA-35 | Logout | BLOCKED | No login succeeded, so logout/session invalidation could not be tested. The unauthenticated protected-route redirect is separately evidenced under LA-01. |

### API, scope, and persistence evidence

- Fresh unauthenticated GET status checks through the local Vite proxy: Org Access `/api/users/me` **403**, `/api/users` **403**; Catalog stores **200**, products **200**; Inventory list **401**; Order list **401**; Fulfillment list **401**.
- Current source retest confirms D-01 remains: Catalog's only security chain matches store-product mapping routes. The fresh anonymous store/product reads returned 200. No live Catalog write was sent because the running DB was not verified disposable; isolated Catalog tests remain test-only evidence.
- Current source retest confirms D-02 remains: Inventory list reads without a server-side location/store restriction, while mutation authorization excludes Location Admin.
- Current source retest confirms D-03 remains: order list/detail/manage authorization does not implement Location Admin's assigned-location scope.
- Current source retest confirms D-04 remains: Location Admin mapping UI/API support is unavailable, and location-specific mapping authorization/readback was not verified.
- The MySQL listener was reachable, but no safe disposable fixture was established and no SQL reads or writes were performed. MySQL persistence/readback is **BLOCKED**. No business data, inventory, order, payment, shipment, or customer record was changed.
- No runtime authorization fix was made: the required trusted store-to-location checks are not present across Catalog, Inventory, Order, and mappings, and a role-only grant would be unsafe.

### Automated regression suites

| Command | Result |
|---|---|
| `node.exe --test` (frontend) | PASS - 206 tests, 0 failures. |
| `npm.cmd run lint` | PASS - no errors or warnings. |
| `npm.cmd run build` | PASS - production build; existing large JavaScript chunk warning remains. |
| `mvn.cmd test` in `Ecom-Org-access` | PASS - 61 tests, 0 failures/errors/skips; Maven exited 0. The unavailable Logstash appender delayed fork shutdown and emitted a Surefire 30-second fork warning. |
| `mvn.cmd test` in `catalog-service` | PASS - 14 tests, 0 failures/errors/skips. |
| `mvn.cmd test` in `inventory-service` | PASS - 17 tests, 0 failures/errors/skips. |
| `mvn.cmd test` in `order-service` | PASS - 106 tests, 0 failures/errors/skips. |
| `mvn.cmd test` in `fulfillment-service` | PASS - 20 tests, 0 failures/errors/skips. |
| `git diff --check` (frontend and backend) | PASS. |
| Authenticated Playwright workflows for five roles | BLOCKED - all supplied login combinations were rejected; no effective role permissions could be established. |
| Disposable-fixture MySQL persistence/readback | BLOCKED - no verified disposable fixture; no SQL writes or reads. |

The five backend suites total **218 passing tests**. These suites use isolated test configuration/databases and do not prove authenticated browser behavior or MySQL persistence.

### Retest verdict and remaining blockers

**Not ready for Location Admin use.** The 34 functional cases reconcile to 28 FAIL, 5 BLOCKED, and 1 PARTIAL. The additional LA-35 logout check is BLOCKED. All 218 automated backend tests and 206 frontend tests passed, and frontend lint/build passed, but those results do not resolve D-01 through D-04 or establish location isolation. Supplied role credentials did not authenticate, no MySQL fixture was verified disposable, and cross-location tests could not be performed. Do not use this role against shared business data until trusted location-scope authorization is implemented and verified with isolated accounts and fixtures.

## Authorization remediation and regression verification - 2026-10-24

This section records code changes made after the retest. It does not convert the earlier browser or MySQL results into PASS: no authorized browser session or disposable MySQL fixture became available.

### Changes made

- **Catalog (D-01):** all API writes now require authentication; shared product/category/variant/image writes are restricted to Admin, Global Admin, and Super Admin. Store writes verify the persisted store location against the signed `SCOPE_LOCATION` claim. Store-product mapping reads require authentication, and reads/writes check the target store against the signed location or exact store scope. Banner and coupon writes verify existing and requested resource scope; Location Admin coupons are limited to location-level scope. Public coupon validation remains permitted.
- **Inventory (D-02):** inventory detail, lookup, list, update, stock adjustment, and movement history enforce store scope. Location Admin scope resolves through the Catalog service; unfiltered lists query only stores belonging to the signed location. Catalog lookup failures deny access or return an empty scoped result. Global administrator behavior is preserved.
- **Orders (D-03):** store and order detail/manage access now accepts Location Admin only after Catalog confirms that the persisted order store belongs to the signed location. Unfiltered Location Admin order lists query only that location's stores; a caller-supplied store ID is independently checked.
- **Fulfillment:** fulfillment and shipment ownership/manage checks use the same Catalog store-location lookup, while customer and assigned delivery-partner paths remain in place.
- **Master catalog boundary:** Location Admin cannot write global product/category/variant/image records because those records do not carry location ownership. A location-level store mapping workflow is supported by the backend; the existing product editor UI still exposes mapping controls only to Global/Super Admin, so LA-14 remains unresolved in the UI.

### Focused same-location and cross-location evidence

- Catalog H2 integration test: Location Admin created a Hyderabad store; creation in Chennai was denied (403); store listing included the Hyderabad fixture and excluded the Chennai fixture; mapping writes/reads for the other location were denied (403). Mapping creation for the in-scope store reached product validation (404 for the intentionally absent disposable product fixture), confirming the scope check passed first.
- Inventory H2 integration test: same-location detail succeeded; cross-location detail, stock adjustment, and inventory creation were denied (403); unfiltered listing contained only the assigned-location store.
- Order unit authorization test: same-location store/order scope succeeded; cross-location scope was denied; location store list contained only the assigned store.
- Fulfillment authorization and assigned-partner tests passed after adding location-aware store checks. These are isolated automated tests, not authenticated browser or live service verification.

### Regression results after remediation

| Command | Result |
|---|---|
| `mvn.cmd -f catalog-service/pom.xml test` | PASS - 15 tests, 0 failures/errors/skips. |
| `mvn.cmd -f inventory-service/pom.xml test` | PASS - 18 tests, 0 failures/errors/skips. |
| `mvn.cmd -f order-service/pom.xml test` | PASS - 107 tests, 0 failures/errors/skips. |
| `mvn.cmd -f fulfillment-service/pom.xml test` | PASS - 20 tests, 0 failures/errors/skips. |
| `mvn.cmd -f Ecom-Org-access/pom.xml test` | 61 tests reported, 0 failures/errors/skips. The Surefire JVM remained open retrying unavailable `logstash:5000`; I interrupted that test process during appender shutdown, so the test assertions passed but Maven did not complete a clean exit. |
| `node.exe --test` | PASS - 206 tests, 0 failures. |
| `npm.cmd run lint` | PASS - no output/errors. |
| `npm.cmd run build` | PASS - production build; existing >500 kB chunk warning remains. |
| `git diff --check` (both repositories) | PASS. |

The four service suites completed cleanly with **160 passing tests** (15 Catalog, 18 Inventory, 107 Order, 20 Fulfillment). Org Access reported another 61 passing tests but its Maven process did not exit cleanly, as described above; including those assertions, the observed backend total was **221 passing tests**, with no reported failures, errors, or skips.

## Authenticated Location Admin browser retest - 2026-10-24

**Credential attempt:** The user supplied `locationadmin` with a new password candidate in this turn. It was submitted once to the local Team Portal and authenticated successfully. The password is intentionally omitted here.

**Identity verification:** `/org-access/api/users/me` returned 200; the signed token subject was `locationadmin`, with `ROLE_LOCATION_ADMIN` and `SCOPE_LOCATION:hyderabad`. The portal displayed "Location Admin Portal" and `hyderabad`. Session state remained isolated in the browser session storage; logout removed the token.

**Runtime note:** The local frontend was started for this test at its configured port `5175` and will be stopped after evidence capture. Gateway and backend listeners were already running before this test and were not restarted. Their live behavior therefore does not include the source-code authorization remediation above. Do not confuse passing isolated tests against the updated source with protection in these already-running service processes.

### Per-case result reconciliation (LA-01Ã¢â‚¬â€œLA-34)

| ID | Status | Current authenticated evidence |
|---|---|---|
| LA-01 | PASS | Team Login accepted the supplied candidate once; authenticated token carried the Location Admin role and Hyderabad location scope. The portal rendered the matching identity and workspace. |
| LA-02 | FAIL | Dashboard rendered, but order metrics were unavailable: `GET /order-api/api/v1/orders` returned 403. Customer metrics also returned 403. Inventory metrics loaded from an unfiltered inventory service. |
| LA-03 | FAIL | Authenticated `GET /catalog-service/api/v1/stores` returned 200 with 16 stores, including Chennai, Bengaluru, Vijayawada, and global-store records, outside Hyderabad. The UI displayed a filtered subset, but the backend response was cross-location. |
| LA-04 | BLOCKED | Store creation was not submitted because the running database was not verified disposable. |
| LA-05 | BLOCKED | Store edit was not submitted against live business data. |
| LA-06 | BLOCKED | Address/coordinate write validation and persistence were not exercised against a disposable store. |
| LA-07 | BLOCKED | Delivery/pickup settings were not changed on a live store. |
| LA-08 | BLOCKED | Store status was not changed. |
| LA-09 | BLOCKED | No store deletion was attempted. |
| LA-10 | FAIL | Product page loaded global Catalog data (`GET /products?size=200` returned 200); the UI exposes product records without a verified assigned-store mapping scope. |
| LA-11 | BLOCKED | Product creation/edit would mutate shared master catalog data; no disposable fixture was established. |
| LA-12 | BLOCKED | Product status was not changed. |
| LA-13 | BLOCKED | Variant and image writes were not submitted. |
| LA-14 | FAIL | No Location Admin mapping editor is present in the portal navigation or product actions. No mapping was changed. |
| LA-15 | BLOCKED | Banner creation was not attempted against the live catalog. |
| LA-16 | BLOCKED | No campaign/banner was edited or disabled. |
| LA-17 | FAIL | Authenticated `GET /inventory-service/api/v1/inventories?page=0&size=200` returned 200 with 380 total rows and 15 store IDs, including stores in Chennai, Bengaluru, Vijayawada, and global-store. |
| LA-18 | BLOCKED | Inventory create/edit was not submitted. |
| LA-19 | BLOCKED | Stock adjustment buttons were visible, but none was clicked because they would mutate live inventory. |
| LA-20 | FAIL | The inventory list exposed 380 rows across 15 store IDs; reservations/threshold isolation was not established. |
| LA-21 | FAIL | Orders UI showed "Access denied"; list API returned 403. |
| LA-22 | FAIL | Order list/search filters could not operate because the underlying list API returned 403. |
| LA-23 | FAIL | Order details could not be opened because Location Admin order listing/access returned 403. No order was changed. |
| LA-24 | BLOCKED | No eligible isolated test order was available; no status action was submitted. |
| LA-25 | BLOCKED | No isolated test order/shipment was available; no packing/shipping action was submitted. |
| LA-26 | BLOCKED | No eligible test-owned order was available to open partner assignment. |
| LA-27 | BLOCKED | No eligible isolated partner/order assignment fixture was available. |
| LA-28 | BLOCKED | No isolated failed-shipment/carrier fixture was available. |
| LA-29 | PARTIAL | Delivery navigation was visible, but the page was empty and no scoped fulfillment workflow could be verified. |
| LA-30 | BLOCKED | No coupon was created or edited against live data. |
| LA-31 | BLOCKED | Coupon store scope was not changed or persisted. |
| LA-32 | FAIL | Reports page displayed "Access denied"; its order data dependency returned 403. |
| LA-33 | FAIL | Report filters could not be evaluated because report data was denied. |
| LA-34 | BLOCKED | No location-scoped report data was available; no export was generated. |

### Additional LA-35 Logout

**PARTIAL:** Sign out cleared the session token and navigated to `/login`; directly opening `/admin` remained redirected to `/login`. The expected dedicated Team Login destination was not used.

### Live security finding and evidence

The current running backend process still exposes cross-location data despite the source fixes and isolated tests. Evidence is from authenticated, read-only browser-context requests; response logging was limited to store ID/location summaries and inventory row totals/store IDs. No stock quantities, customer details, credentials, tokens, or other secrets were recorded.

- Stores API: 16 rows across Hyderabad, Chennai, Bengaluru, Vijayawada, and India/global scope (HTTP 200).
- Inventory API: 380 rows, 15 store IDs including multiple other cities and global-store (HTTP 200).
- Orders API: HTTP 403; dashboard, order page, and reports therefore show unavailable/denied data.
- Customer metrics API: HTTP 403.
- UI rendered stock adjustment controls (`Stock +10`, `Stock -1`, `Adjust`) for the unscoped inventory list. No controls were activated.
- Browser console recorded 13 errors and 24 warnings across navigation, including the expected 403 responses above and failed remote placeholder images (HTTP 500).
- Browser snapshots and console/network artifacts are under `.playwright-mcp/` with timestamps around `2026-10-24T10:18Z`Ã¢â‚¬â€œ`10:20Z`.

**Current verdict: Not ready; do not use this running Location Admin portal for business operations.** The authenticated identity is now confirmed, but live Catalog and Inventory isolation fail. The backend fixes need to be deployed/restarted through the normal local development workflow and then retested; this run did not restart backend services or perform live writes. Reconciled functional counts are **PASS 1, FAIL 11, BLOCKED 21, PARTIAL 1 (34 total)**. LA-35 is a separate PARTIAL check.

## Team Login focused retest - 2026-10-24

- Opened `http://localhost:5175/team-login`; Team Portal login form rendered.
- Submitted the user-supplied local `locationadmin` credential once. Login API returned HTTP 200 and navigated to `/admin`.
- `/org-access/api/users/me` returned HTTP 200. Token claims were verified locally as subject `locationadmin`, role `ROLE_LOCATION_ADMIN`, scope `SCOPE_LOCATION:hyderabad`; no token value was recorded.
- Workspace header matched "Location Admin Portal" and `hyderabad`.
- Dashboard then showed an observed `Access denied` alert for orders and a permission error for customer metrics; these are backend access failures after successful login, not login failures.
- Signed out after the check; the session token was removed and the app navigated to `/login`.
- Browser evidence: `.playwright-mcp/page-2026-10-24T10-22-35-896Z.yml`, `.playwright-mcp/page-2026-10-24T10-22-43-710Z.yml`, and the corresponding console log.

## Team Login retry - 2026-10-24

At the user's request, Team Login was retried once with the same supplied local credential. The login API again returned HTTP 200, navigated to `/admin`, and the token again identified `locationadmin` with `ROLE_LOCATION_ADMIN` and `SCOPE_LOCATION:hyderabad`. The dashboard again displayed Orders and customer-metric permission errors. The session was signed out and the frontend processes started for this retry were stopped. Evidence: `.playwright-mcp/page-2026-10-24T10-25-02-132Z.yml` and `.playwright-mcp/page-2026-10-24T10-25-12-320Z.yml`.

### Updated disposition

The backend authorization gaps D-01 through D-03 have implementation and isolated regression coverage, but still require deployment/configuration review and authenticated end-to-end verification. D-04 has backend authorization support but lacks the Location Admin UI workflow. Do not treat all 34 use cases as passing: authenticated workflows, safe MySQL persistence, LA-14 UI mapping, and cases requiring partners, shipments, or report fixtures remain unverified or blocked. The readiness verdict remains **Not ready** until those items are verified and the UI workflow is completed.

## Dashboard follow-up - 2026-10-24

- Updated the Location Admin dashboard and reports to skip the customer-count endpoint and omit the Customers metric for roles without customer-module access. Authenticated browser verification after the change showed no new customer metric request; the customer tile and customer permission alert were absent.
- The Orders request still returned HTTP 403 for the authenticated Location Admin, leaving order metrics unavailable. Source `OrderController` includes location-scoped access, but the running Order Service process predates its current compiled classes. No business data was changed.
- Frontend production build passed. The live order dashboard remains unverified until the running Order Service is restarted and the authenticated request is retested.

## Session restoration follow-up - 2026-10-24

- Found a route guard race on reload: a valid session initialized as logged in while the account identity was still loading. `ProtectedRoute` treated the temporarily missing user role as unauthorized and redirected to `/unauthorized`, which looked like an immediate logout even though the token remained valid.
- Updated AppContext to track the active token, rerun identity validation and reset the expiry timer when the token changes, and expose account restoration state. Protected routes now wait for identity validation and show a retry message if Org Access is unavailable.
- Authenticated browser retest: after a full `/admin` reload, Org Access `/api/users/me` returned HTTP 200 and the browser restored the Location Admin dashboard. The token remained present with about 7 hours 59 minutes left. A separate Orders HTTP 403 did not clear the token. No password, token, or session secret was recorded.
- `npm.cmd run lint`: PASS. `npm.cmd run build`: PASS (existing large-chunk warning). `node.exe --test`: PASS, 206 tests. `git diff --check`: PASS.
- The dashboard's customer metric remains correctly omitted. Orders still return HTTP 403 from the currently running, older Order Service process; this remains a backend runtime blocker requiring that local service to load the current source and be retested.

## Dashboard metrics follow-up - 2026-10-24

- Fixed the Location Admin Products tile to count distinct active product-store mappings for the account's assigned stores. It now shows `22` for Hyderabad instead of `0`; the caption identifies the number as products mapped to assigned stores. The count shows as unavailable while Catalog mapping data is loading or has failed.
- Changed dashboard error text for HTTP 403 to clarify that the session is active and the Order Service denies this account's location-order request. It no longer suggests signing in again for an authorization failure. Revenue, order statuses, and recent orders remain unavailable while that API is denied.
- Authenticated browser check at `/admin/dashboard`: the Location Admin identity remained active after navigation/reload; Products showed 22; Low Stock showed 0 based on the retrieved Hyderabad-filtered records; the Orders API returned 403. Browser console showed the corresponding Orders 403 and no logout/redirect.
- Frontend checks after this change: `npm.cmd run lint` PASS; `node.exe --test` PASS (206 tests); `npm.cmd run build` PASS with the existing large-chunk warning; `git diff --check` PASS.
- The running backend still needs to load the current authorization source before dashboard/order and isolation behavior can be considered fixed. In particular, do not treat a client-side location filter or the displayed Low Stock value as proof of server-side Inventory authorization. No backend process was stopped, no live write was attempted, and no business data was changed.

## Master follow-up: remaining Location Admin cases â€” 2026-10-25

This section supersedes the earlier 22 PASS / 12 BLOCKED summary. LA-14 remains **SKIPPED** exactly as requested. No mapping workflow was implemented or tested.

### Results for the 12 formerly blocked cases

| ID | Latest status | Finding, action, and evidence |
|---|---|---|
| LA-11 | BLOCKED | Product create/edit remains a global catalog operation. Location Admin product write controls are not offered, and `ProductGlobalCatalogAuthorizationIntegrationTest` verifies Location Admin is denied while Global Admin retains access. No role grant or product write was made. |
| LA-12 | BLOCKED | Product active/draft status is part of the same global master-catalog boundary. The current role cannot change it; no status control or privilege was added. |
| LA-13 | BLOCKED | Variants and product images are globally managed. The integration test verifies Location Admin write requests are denied and global catalog access remains available. The case remains blocked by policy rather than bypassing that boundary. |
| LA-16 | PASS | The app has no separate campaign service/entity; the customer campaign carousel uses Catalog banners. In the temporary Catalog QA schema, the authenticated Hyderabad Location Admin created an active QA banner, edited its title, deactivated it, and verified the saved inactive record in the refreshed list. Browser requests: banner POST **201**, GET readback **200**, edit PUT **200**, deactivate PATCH **200**, subsequent GET **200**. No real campaign or notification was sent. Evidence snapshot: `.playwright-mcp/page-2026-10-25T06-58-49-167Z.yml`. |
| LA-18 | PASS | `InventoryApiIntegrationTest.locationAdminInventoryAccessIsLocationScoped` uses H2 and a mocked store-to-location directory. Location Admin create in Hyderabad returned **201**, update/readback returned **200** with the saved threshold, cross-location create and update returned **403**, and unauthenticated create returned **401**. This is isolated API/database verification, not live MySQL or browser persistence. |
| LA-19 | PASS | In the same isolated H2 integration test, increasing available stock persisted the new quantity (from **5** to **9**) and produced an `INCREASE` movement record. An invalid decrease that would overdraw stock returned **409**; a cross-location mutation returned **403**. No shared inventory was changed. |
| LA-24 | PASS | `PaymentHttpIntegrationTest.locationAdminCanConfirmOnlyAnEligibleOrderInAssignedLocation` runs as an HTTP integration test against H2. Same-location eligible order transition from `CREATED` to `CONFIRMED` returned **200** and persisted on readback; cross-location processing returned **403**, unauthenticated processing **401**, and an invalid transition **409**. Event dispatch is disabled and the fulfillment verifier is mocked; no external fulfillment or notification ran. |
| LA-25 | BLOCKED | No isolated order plus test shipment and fake carrier/test adapter were available for an end-to-end packing/shipping workflow. The service suite passing does not prove this UI workflow. No real order, shipment, or carrier action was attempted. |
| LA-27 | BLOCKED | A backend eligibility guard was added to shipment partner assignment. Focused/full Fulfillment tests verify active partner details are resolved server-side for the shipment store and that inactive/cross-store assignments are denied. Browser persistence remains unverified because there is no disposable order and delivery-partner fixture available to the current authenticated UI session; the running Fulfillment process was not restarted. No assignment was made. |
| LA-28 | BLOCKED | No disposable failed-shipment/order and mocked carrier retry fixture is available for browser or runtime verification. No retry, shipment creation, tracking event, or external call was made. |
| LA-30 | PASS | In the isolated Catalog QA schema, the Location Admin created an inactive location-level coupon from `/admin/coupons`; UI readback showed the saved code and inactive status. Browser requests: create POST **201**, list/readback GET **200**. Coupon integration coverage also verifies create/read/edit/status, cross-location denial, unauthenticated denial, and preserved Global Admin store-scope access. No customer redeemed or applied the coupon. Evidence snapshot: `.playwright-mcp/page-2026-10-25T06-57-45-947Z.yml`. |
| LA-31 | BLOCKED | Current `CatalogAccess` policy permits Location Admin coupons only at location scope; store-scoped coupons are reserved for higher catalog roles. The UI's misleading store selector was removed for Location Admin, and the H2 integration test confirms a forged store-scoped create/update is **403** while Global Admin store scope remains **201**. Changing the policy requires an explicit business-rule authorization; no broader grant was made. |

### Code changes for this follow-up

- Frontend: `src/pages/AdminWorkspace/AdminWorkspace.jsx` now omits the unsupported store-scope selector from Location Admin coupon forms. It keeps an immutable full schema for other roles so rendering the Location Admin form cannot mutate Global Admin or other portal forms.
- Backend: `fulfillment-service/src/main/java/com/metaarch/fulfillment/shipment/DeliveryPartnerEligibility.java` validates partner assignment using the authenticated caller against the Org Access delivery-partner directory, checks active status and exact shipment store, and uses authoritative partner details. `ShipmentController.java` applies this validation before assigning. Directory failures fail closed.
- Regression coverage: Catalog coupon/product authorization tests; Inventory H2 API tests for location-scoped create/edit/stock movement, invalid quantity and unauthorized access; Order H2 HTTP transition/readback tests; Fulfillment partner eligibility and authorization tests.
- These files were already in a substantially dirty working tree before this follow-up. Existing unrelated modifications in both repositories were preserved; no cleanup/reset was performed.

### Isolated Catalog browser fixture and runtime

- Browser writes above used the dedicated schema `catalog_qa_remaining_location_admin_20261025`, created for this run. At verification time it had 10 Catalog DB sessions and the shared `catalog_service` had 0 sessions. No shared Catalog data was read-modified by the QA requests.
- After browser checks, only `catalog-service` was restarted using `run-all-services.ps1 restart catalog-service`; the gateway, Inventory, Order, Fulfillment, frontend, ports, and production/VPS services were not restarted or changed. Catalog returned health **UP** on port 8089.
- Post-restart verification showed **0** QA-schema sessions, **10** normal `catalog_service` sessions, and both schemas present. The exact disposable schema was then dropped. Final verification: QA schema absent (**0**), shared `catalog_service` still present (**1**) with active connections (**10**).
- Shared MySQL business data outside that dedicated Catalog schema was not changed. Inventory and Order write tests used disposable H2 databases, not MySQL.

### Regression commands and results

| Command | Result |
|---|---|
| `mvn.cmd -q test` in `catalog-service` | PASS â€” 27 tests, 0 failures/errors/skips. |
| `mvn.cmd -q test` in `inventory-service` | PASS â€” 18 tests, 0 failures/errors/skips. |
| `mvn.cmd -q test` in `order-service` | PASS â€” 109 tests, 0 failures/errors/skips. |
| `mvn.cmd -q test` in `fulfillment-service` | PASS â€” 22 tests, 0 failures/errors/skips. |
| `node.exe --test` in frontend | FAIL â€” 210 tests, 209 passed, 1 failed. Existing `src/utils/authenticatedCart.test.js:65` assertion expected 2 calls but observed 3 in â€œlost transfer response reconciles original key before retrying an available item.â€ This is outside the Location Admin coupon change and was not modified. |
| `npm.cmd run lint` | PASS â€” exit 0, no diagnostics. |
| `npm.cmd run build` | PASS â€” production build completed; existing large JavaScript chunk warning remains. |
| `git diff --check` (frontend and backend) | PASS â€” both exit 0; Git emitted only existing working-tree CRLF normalization warnings for two frontend files. |

Backend total: **176 passed, 0 failed/errors/skipped** across the four full service suites. Catalog/Inventory/Order/Fulfillment tests use isolated H2 contexts and do not establish their live processes' behavior. The only runtime service restarted in this follow-up was Catalog, because its datasource needed restoration from the temporary QA schema. Fulfillment's new partner-eligibility code has not been loaded into its running process.

### Current totals and remaining action

Across the 35 original cases: **27 PASS, 0 FAIL, 0 PARTIAL, 7 BLOCKED, 1 SKIPPED**. The 7 blocked cases are LA-11, LA-12, LA-13, LA-25, LA-27, LA-28, and LA-31. LA-14 is the sole skipped case.

The remaining blockers require either an explicit policy decision (LA-11 to LA-13 and LA-31) or isolated order/shipment/partner fixtures with a fake carrier and a controlled Fulfillment runtime (LA-25, LA-27, LA-28). The frontend automated suite also needs investigation of the single cart test failure before the overall frontend regression suite is green. Do not treat all 35 cases or all frontend tests as complete/passing.

## Complete Location Admin Browser QA - 2026-10-24 (fresh run)

This addendum records a fresh Playwright run using the project-owner supplied local account. It supersedes older case results only where new evidence below is more recent. No application behavior was changed during this run.

### Run setup and identity

- Opened the configured local frontend at http://localhost:5175 in an isolated Playwright tab and navigated to Team Login.
- Submitted the supplied locationadmin credential once. Login succeeded and redirected to /admin.
- /org-access/api/users/me returned HTTP 200 and identified locationadmin, ROLE_LOCATION_ADMIN, location hyderabad; the visible workspace matched. No password or session token was written to this report.
- Used the portal Sign out control. It navigated to /login, removed the session token, and a subsequent direct navigation to /admin remained at /login.
- Read-only checks only were performed. No disposable write fixture was available, so no record was created, edited, deleted, adjusted, shipped, or exported. No MySQL reads or writes were made.
- Evidence screenshots: location-admin-qa-dashboard-2026-10-24.png and location-admin-stores-2026-10-24.png. Playwright snapshots and browser logs are under .playwright-mcp/.

### Fresh result matrix - all 35 cases

| ID | Use case | Status | Current result and evidence |
|---|---|---|---|
| LA-01 | Login through Team Login | PASS | One supplied login succeeded; /api/users/me confirmed Location Admin and Hyderabad scope; sign-out later cleared the session. |
| LA-02 | View location-scoped dashboard | FAIL | Dashboard showed zero orders/revenue while the authenticated Orders API returned 41 Hyderabad orders. Metrics do not match backend records. |
| LA-03 | View assigned-location stores | PASS | Store API and /admin/stores displayed six Hyderabad stores; no other location appeared. Existing rows were only viewed. |
| LA-04 | Create store within applicable location | BLOCKED | Create form opened, but no disposable store fixture/database was established; form was canceled without saving. |
| LA-05 | Edit store profile and operational information | BLOCKED | Existing store detail was viewed read-only; no safe disposable store was available for edit/read-back. |
| LA-06 | Set store coordinates/address | BLOCKED | Existing detail showed these fields; validation and persistence require a disposable store, so no write was made. |
| LA-07 | Configure delivery/pickup information | BLOCKED | Existing detail was viewed; no disposable store was available for configuration changes. |
| LA-08 | Change store active/closed status | BLOCKED | No status change was made to an existing business store. |
| LA-09 | Delete store through available controls | BLOCKED | No disposable store or safe deletion target was available; no delete was attempted. |
| LA-10 | View location-scoped products | FAIL | Product API/UI returned 22 active products, while active mappings showed 21 distinct products assigned to the six Hyderabad stores. One listed product had no active mapping to those stores. |
| LA-11 | Create/edit products | BLOCKED | No disposable master-catalog product fixture; no product write was submitted. |
| LA-12 | Change product active/draft status | BLOCKED | No existing product status was changed. |
| LA-13 | Manage product variants/images | BLOCKED | No disposable product was available; existing variants/images were not changed. |
| LA-14 | Manage store-product mappings | FAIL | Location Admin product UI has no mapping editor; this role cannot perform the intended workflow through the portal. |
| LA-15 | Create location/store-scoped banners | BLOCKED | Banner UI opened, but no disposable banner was available; no create request was sent. |
| LA-16 | Edit/disable campaigns | BLOCKED | No disposable campaign/banner fixture; no existing campaign was edited or disabled. |
| LA-17 | View inventory by store | PASS | Inventory API returned 153 rows associated only with the six Hyderabad stores; no cross-location store IDs appeared in the list. |
| LA-18 | Create/edit inventory records | BLOCKED | No disposable inventory fixture; no inventory write was attempted. |
| LA-19 | Adjust available stock | BLOCKED | Stock controls were not activated because visible inventory belongs to existing business data. |
| LA-20 | Inspect reservations and stock thresholds | FAIL | Opening an existing same-location inventory detail returned HTTP 403. The UI incorrectly described this authorization failure as a sign-in/permission issue; session remained valid. |
| LA-21 | View location-scoped orders | FAIL | Authenticated Orders API returned 41 Hyderabad orders, but /admin/orders showed "No matching records." The UI failed to render them. |
| LA-22 | Search/filter orders | FAIL | Search and filters were visible, but the page displayed no rows despite the API returning 41 authorized orders; effective filtering could not work on the rendered list. |
| LA-23 | Inspect order details and fulfillment | FAIL | The empty order UI prevented opening an order or inspecting its fulfillment details. No order was mutated. |
| LA-24 | Confirm/process eligible orders | BLOCKED | No test-owned order was available; no live order was processed. |
| LA-25 | Perform applicable packing/shipping actions | BLOCKED | No isolated order/shipment or carrier sandbox fixture; no fulfillment action was submitted. |
| LA-26 | Open delivery-partner assignment | BLOCKED | No test-owned eligible order was available to open assignment safely. |
| LA-27 | Select active partner from relevant store | BLOCKED | No isolated partner/order fixture; no partner assignment was made. |
| LA-28 | Retry failed shipment where permitted | BLOCKED | No isolated failed shipment or mocked carrier fixture; retry was not attempted. |
| LA-29 | Access delivery management module | PARTIAL | Delivery route was accessible and displayed its module shell, but showed no matching records; intended location-scoped workflow could not be verified. |
| LA-30 | Configure local coupon records | BLOCKED | Coupons UI/API showed no matching records; no disposable coupon was created or changed. |
| LA-31 | Select coupon store scope | BLOCKED | No disposable coupon fixture; no store scope was changed. |
| LA-32 | View reports for location/stores | FAIL | Reports displayed zero orders while Orders API returned 41 Hyderabad orders. Report controls also defaulted to "All locations" and labels said "All business data," so safe location-only totals were not established. |
| LA-33 | Filter operational reports | FAIL | Report filter controls were present, but the default scope was "All locations"; order totals remained zero despite authorized order results. No cross-location filters were applied. |
| LA-34 | Export JSON report | BLOCKED | Export was not triggered because the report UI advertised "All locations" / "All business data" and its scope was unverified. This avoided downloading potentially cross-location data. |
| LA-35 | Logout | PASS | Sign out navigated to /login, cleared authToken, and a direct /admin navigation returned to /login. |

**Fresh case totals:** PASS 4, FAIL 9, BLOCKED 21, PARTIAL 1 (35 total). No cases were counted twice.

### Fresh API/UI findings

- Stores: six returned rows and the store screen matched the authenticated Hyderabad scope.
- Products: 22 active products were visible; only 21 distinct products had an active mapping to the assigned six stores. Product list scoping remains inconsistent.
- Inventory: list returned 153 rows limited to the six Hyderabad store IDs. Opening one same-location detail returned HTTP 403, so read scope is not consistently usable.
- Orders: API returned 41 orders for Hyderabad stores (statuses included CREATED, SHIPPED, CANCELLED, PROCESSING, and DELIVERED); the Orders UI rendered an empty state, and dashboard/report order metrics showed zero.
- Reports exposed "All locations" and "All business data" in Location Admin controls/labels. JSON export was not clicked. This is a scope/UI defect indicator; the report API payload was not inspected, so no claim is made that cross-location records were returned.
- Delivery route loaded its shell but no records. No partner assignment, shipment retry, order mutation, or external delivery action was attempted.
- Browser showed 9 console errors and 30 warnings by the Delivery/Reports navigation point. Relevant order/inventory 403s and UI/API inconsistencies are described above; unrelated messages were not attributed without evidence.

### Automated regression runs

| Command | Result |
|---|---|
| node.exe --test (frontend) | FAIL - 207 tests, 206 passed, 1 failed. src/utils/authenticatedCart.test.js:65, "lost transfer response reconciles original key before retrying an available item": expected request count 2, observed 3. |
| npm.cmd run lint | PASS - ESLint exited 0 with no reported errors. |
| npm.cmd run build | PASS - Vite production build completed; existing large JavaScript chunk warning remains. |
| mvn.cmd test in catalog-service | PASS - 15 tests, 0 failures/errors/skips. H2 test database. |
| mvn.cmd test in inventory-service | PASS - 18 tests, 0 failures/errors/skips. H2 test database. |
| mvn.cmd test in order-service | PASS - 107 tests, 0 failures/errors/skips. H2/test fixtures. |
| mvn.cmd test in fulfillment-service | PASS - 20 tests, 0 failures/errors/skips. H2/test fixtures. |
| mvn.cmd test in Ecom-Org-access | PASS â€” 65 tests, 0 failures/errors/skips; Maven exited 0. Surefire logged that it killed the fork after the 30-second shutdown timeout because the unavailable logstash:5000 appender thread stayed open. |
| git diff --check (frontend and backend) | PASS â€” both exited 0; frontend printed only an LF-to-CRLF working-copy notice. |
| Authenticated Playwright / MySQL persistence | Browser read-only checks completed as described; MySQL persistence BLOCKED because no disposable fixture was established. |

All five backend modules completed with 225 passing tests (15 + 18 + 107 + 20 + 65), zero failures/errors/skips, and successful Maven exits. The Org Access fork required Surefire's 30-second shutdown timeout because its Logstash appender could not resolve logstash:5000. These automated suites do not establish MySQL persistence or replace the UI failures above. The frontend test failure was not modified during QA.

### Final disposition

**Not ready for Location Admin operations.** Login and logout work, and the store and inventory list responses observed in this run were limited to Hyderabad. However, dashboard/orders/reports data disagrees with the Orders API, one same-location inventory detail is forbidden, product visibility exceeds active Hyderabad mappings, mapping management is absent, and report controls suggest an overly broad scope. Twenty-one write or fixture-dependent cases remain blocked; no live business data was changed. The single frontend cart test failure is separate from this portal's scope findings and needs triage.




## Location Admin failed-case remediation â€” 2026-10-24

This addendum records source changes for the nine cases that failed in the latest authenticated browser run. It preserves the observed run results above: the local running services were not restarted, so source fixes are not represented as a live browser retest or MySQL verification.

| Case | Change made | Verification / remaining limitation |
|---|---|---|
| LA-02 â€” View location-scoped dashboard | Location Admin order scoping now compares location/store labels case-insensitively and prefers verified assigned-store references when present. Customer metrics remain omitted when the role lacks customer access. | Frontend focused tests and lint/build pass. Live dashboard requires the updated frontend and Order Service runtime. |
| LA-10 â€” View location-scoped products | Location Admin product results now require an active mapping to one of the assigned stores. | Mapping-scope logic covered by a focused frontend test. Live Catalog mapping data was not changed. |
| LA-14 â€” Manage store-product mappings | Added a Location Admin mapping-only UI: choose a master product, then manage mappings only among stores in the assigned location. Global product editing controls are not exposed in this flow. Backend mapping authorization continues to validate store scope. | Backend Catalog H2 integration coverage verifies in-scope and cross-location behavior. No live mapping was written; browser UX and MySQL persistence still need safe-fixture verification. |
| LA-20 â€” Inspect reservations and stock thresholds | Inventory ownership checks now forward the authenticated bearer identity to Catalog when resolving a store's location, allowing trusted same-location authorization while preserving cross-location denial. | Inventory integration suite: 6 tests pass, including same-location and cross-location authorization. No live inventory was changed. |
| LA-21 â€” View location-scoped orders | Location Admin order filtering compares scope labels case-insensitively and uses assigned-store references. Service-side order scope remains location-aware. | Order scope tests: 4 pass. Current running Order Service still needs reload for live verification. |
| LA-22 â€” Search/filter orders | Fixed the same order-scope filtering path used by the order list so authorized same-location orders remain available to UI search and status filters. | Focused frontend scope tests pass. No authenticated browser search was rerun against the reloaded service. |
| LA-23 â€” Inspect order details and fulfillment | Forwarded the authenticated caller identity during Catalog store-location checks used by protected order/fulfillment paths. | Order scope tests pass; `http-sync` tests pass (13). No historical order or shipment was mutated. |
| LA-32 â€” View location/store reports | Location Admin reports now initialize and remain locked to the assigned location; the report totals use the same case-insensitive location matching. | Report-data tests pass. Live report totals need a reloaded Order Service and browser retest. |
| LA-33 â€” Filter operational reports | Operational report location/store filters compare labels case-insensitively; Location Admin cannot broaden the location selector to all locations. | Focused report-data tests pass. No cross-location report/export was performed. |

### Verification performed for this remediation

- Frontend `npm.cmd run lint`: PASS.
- Frontend focused Node tests (`src/config/accessControl.test.js` and `src/pages/AdminWorkspace/adminReportData.test.js`): PASS, 13 tests.
- Frontend `npm.cmd run build`: PASS; the existing large-chunk warning remains.
- Backend `http-sync` tests: PASS, 13 tests.
- Backend `InventoryApiIntegrationTest`: PASS, 6 tests.
- Backend `StoreManagerAccessTest`: PASS, 4 tests.
- `git diff --check` in frontend and backend: PASS (working-copy line-ending notices only).

No live business data was changed. The frontend and backend repositories contain pre-existing uncommitted edits from earlier work; they were preserved. Because services were already running and were not started by this task, they were not stopped or restarted. Reload the updated local services and run the authenticated browser checks with disposable fixtures before changing these nine cases to PASS in the live QA totals. The other 26 use cases are not claimed as fixed by this addendum; fixture-dependent write cases remain blocked as previously recorded.

## Authenticated retest of nine remediated cases â€” 2026-10-24

**Method:** Used the existing authenticated Playwright browser session. The visible identity was Location Admin / Hyderabad and the local identity endpoint had returned 200. All checks were read-only; no order, stock, mapping, report export, or MySQL record was changed. The active Vite frontend reflected current source changes. Backend processes were not restarted because they were already running and were not started by this retest.

| ID | Retest status | Fresh browser/API evidence |
|---|---|---|
| LA-02 | PASS | Dashboard showed 41 orders, 29 created, 1 completed, 2 cancelled, â‚¹14,068 revenue, and 21 mapped products for the Hyderabad Location Admin. Orders list request returned 200. Customer metric was omitted for this role. |
| LA-10 | PARTIAL | Product screen displayed 21 products and only Hyderabad store mappings in the mapping editor. The authenticated product-specific mapping read returned 200. A background public active-mappings request returned 500 during this navigation, so the general mapping-feed reliability and complete backend isolation were not established. |
| LA-14 | PARTIAL | â€œMap Productâ€ and â€œManage storesâ€ controls appeared. The mapping editor listed six Hyderabad stores; its product-specific mapping GET returned 200. I did not save because the listed mappings belong to existing business records; write persistence and backend cross-location denial were not exercised live. |
| LA-20 | FAIL | Inventory list loaded (HTTP 200), but opening an existing row requested inventory detail and returned 403. The page showed a permission alert. No stock control was activated. |
| LA-21 | PASS | Orders API returned 200 and the page rendered Hyderabad orders across seven pages; first-page rows showed Hyderabad stores. Dashboard order totals were populated. |
| LA-22 | PASS | Search for an existing order reference returned the matching row. Selecting CREATED status and clearing search rendered created orders (five pages). No order action was used. |
| LA-23 | FAIL | Opening an existing order detail triggered order detail and items requests that returned 403; no order was changed. |
| LA-32 | PASS | Reports defaulted to the locked Hyderabad location, showed 41 orders and â‚¹14,068 revenue, and listed only Hyderabad stores with corresponding order/revenue totals. No â€œAll locationsâ€ or â€œAll business dataâ€ control appeared. |
| LA-33 | PARTIAL | Selecting Hyderabad Main Store recalculated order and revenue totals from 41 / â‚¹14,068 to 16 / â‚¹5,767. However Products remained 0 and Stock Units remained 7,860, so those operational KPIs did not narrow with the selected store. Date-filter behavior was not exercised. |

**Nine-case totals:** PASS 4, FAIL 2, PARTIAL 3 (9 total). No case is counted twice.

### Runtime and data notes

- Inventory detail and order detail failures are live HTTP 403 results from the currently running backend. The current `CatalogLocationClient.java` source was modified at 18:22 local time, after the Inventory Service JVM on port 8095 and Order Service JVM on port 3311 started at 17:33 and 17:27. Those service processes therefore cannot contain the latest token-forwarding change. I left all pre-existing processes running.
- The report store selector and order totals work in the current frontend. Product/stock report KPIs still need store-filter behavior, and the public active-mapping endpoint returned HTTP 500 once during navigation.
- Existing data was viewed only. No write, delete, export, payment, shipment, or MySQL query was performed. LA-14 persistence, cross-location live denial, and MySQL persistence remain unverified.
- Console reported an existing React DOM prop warning and 403 detail-request errors; these did not log credentials or session tokens.

### Retest disposition

The original dashboard/order-list/filter/report presentation failures are improved in the current frontend. Inventory and order detail remain blocked by the loaded backend runtime; product mapping workflow and report store-filter KPIs still need follow-up. Do not mark all nine as fixed in the live environment. Restart/reload the relevant local backend services using the normal owner-controlled development workflow, then repeat the two detail reads. Correct the report KPI filtering and investigate the intermittent public mapping 500 before closing the partial cases.

## Location Admin follow-up fixes and retest â€” 2026-10-24

This addendum supersedes the prior nine-case retest only for the specific observations below.

### Additional changes

- Location Admin catalog state now refreshes mappings through the authenticated `GET /api/v1/store-products` endpoint after the account identity is restored. It uses the server-scoped response rather than relying on the public all-store mapping feed for this role. Other roles keep the existing public catalog-loading path.
- Report Products and Stock Units KPIs now narrow to the selected store for Location Admin. Global and other staff report behavior remains unchanged.
- Added a frontend regression test for assigned-store product counts, stock-unit totals, and the unchanged global report behavior.

### Fresh read-only retest

| ID | Status | Latest evidence |
|---|---|---|
| LA-02 | PASS | Hyderabad dashboard displayed 41 orders, 29 created, 1 completed, 2 cancelled, â‚¹14,068 revenue, and 21 mapped products. |
| LA-10 | PASS | Products UI displayed 21 mapped active products. Authenticated mapping GET returned 200; 115 mappings referenced six Hyderabad stores and zero stores outside the assigned set. Public mapping GET also returned 200 during this run. |
| LA-14 | PARTIAL | Location Admin mapping editor opened and listed only six assigned Hyderabad stores; mapping read returned 200. No save was attempted because the visible mappings are existing business records, so persistence and a live cross-location write denial remain untested. |
| LA-20 | FAIL | Inventory list returned 200, but opening an existing inventory detail still returned 403. No stock action was triggered. |
| LA-21 | PASS | Orders list API returned 200 and the UI displayed Hyderabad orders from the assigned stores. |
| LA-22 | PASS | Search returned the matching order; filtering to CREATED displayed the matching status set. No order action was triggered. |
| LA-23 | FAIL | Opening an existing order detail still produced HTTP 403 for the order and its items. No order was changed. |
| LA-32 | PASS | Reports remained locked to Hyderabad and showed 41 orders, â‚¹14,068 revenue, and Hyderabad-only store rows. |
| LA-33 | PASS | Date filter for 2026-10-23 narrowed reports to one order / â‚¹107. Selecting Hyderabad Main Store narrowed orders/revenue to 16 / â‚¹5,767 and now also narrowed Products / Stock Units to 14 / 1,200. |

**Current nine-case totals:** PASS 6, FAIL 2, PARTIAL 1 (9 total).

### Verification

- `npm.cmd run lint`: PASS.
- Focused frontend tests (`accessControl.test.js`, `adminReportData.test.js`): PASS, 14 tests.
- `npm.cmd run build`: PASS; existing large-bundle warning remains.
- `http-sync` tests: PASS, 13 tests.
- `InventoryApiIntegrationTest`: PASS, 6 tests.
- `StoreManagerAccessTest`: PASS, 4 tests.
- `git diff --check`: PASS in frontend and backend (line-ending notices only).
- No MySQL query or business-data write was performed.

### Remaining runtime blocker

The Inventory Service on port 8095 and Order Service on port 3311 were already running before this test and were not started by it. Their JVMs predate the latest `CatalogLocationClient` bearer-forwarding source change, so the live 403 results remain until those services load the updated shared client. The earlier test instruction says to stop only processes started for the test; I therefore left these user-started services running. Source-level authorization tests pass, but these two live detail cases are not closed until the services are reloaded and the same read-only checks return the expected result.

## LA-20 / LA-23 detail authorization retest â€” 2026-10-24

This addendum supersedes the preceding LA-20 and LA-23 FAIL results. It does not change the status of any other use case.

### Diagnosis and fix

- Inventory and Order both directly depend on `com.metaarch:http-sync:0.0.1-SNAPSHOT`; Maven dependency-tree checks resolved that exact version in both services. The shared client source and artifact were already at that version; the source forwards the authenticated bearer token on Catalog location lookups.
- The original Inventory JVM (PID 15452, port 8095) and Order JVM (PID 35124, port 3311) started before the shared client jar was rebuilt. Their classpaths referenced the mutable `0.0.1-SNAPSHOT` jar, but already-running JVMs had loaded the earlier classes into memory. The prior detail 403s came from those stale in-memory classes: Catalog could not authorize the downstream store/location lookup without the caller identity.
- Current authorization checks remain server-side: Inventory detail verifies that the inventory's store belongs to the signed location scope; Order detail and items resolve the persisted order store and check its location. Cross-location IDs remain denied. No role grant or authorization bypass was added in this retest.
- Added regression coverage in `inventory-service/src/test/java/com/metaarch/inventory/InventoryApiIntegrationTest.java` for unauthenticated inventory detail. Added an HTTP integration case in `order-service/src/test/java/com/metaarch/order/order/PaymentHttpIntegrationTest.java` covering same-location detail/items, cross-location detail/items, anonymous denial, and continued Admin visibility.

### Rebuild and runtime reload

- Built and installed shared `http-sync`, then packaged Inventory and Order in dependency order. All three Maven builds succeeded.
- Restarted only Inventory and Order through the existing `run-all-services.ps1 restart inventory-service order-service` workflow. Its MySQL schema preflight was read-only. The old listeners on 8095 and 3311 were stopped; the new processes started from each service's `target/classes` and reported healthy. Gateway (8082), Catalog (8089), and other services were not restarted.
- Startup logs show Inventory PID 45340 on port 8095 and Order PID 49264 on port 3311, both with the existing local `prod` Spring profile and local Config Server. The loaded classpath includes `http-sync-0.0.1-SNAPSHOT.jar`, rebuilt at 19:02 local time. Startup logs reached `Started InventoryServiceApplication` and `Started OrderServiceApplication`; health checks succeeded.

### Fresh authenticated browser and API results

The existing isolated Playwright session remained authenticated as Location Admin / Hyderabad. All checks were reads; no stock, order, shipment, mapping, payment, or business record was changed.

| Check | Result | Evidence |
|---|---|---|
| Same-location inventory detail | PASS | Opening an inventory row loaded its detail dialog; `GET /inventory-service/api/v1/inventories/{id}` returned 200. The dialog showed reserved quantity and reorder threshold fields. |
| Same-location order detail | PASS | Opening a Hyderabad order caused `GET /order-api/api/v1/orders/{id}` to return 200. |
| Same-location order items | PASS | The corresponding `GET /order-api/api/v1/orders/{id}/items` returned 200. |
| Cross-location inventory detail | PASS | Read-only request for an existing inventory record from another location returned 403. |
| Cross-location order detail and items | PASS | Read-only requests using an existing order from outside Hyderabad returned 403 for both detail and items. |
| Unauthenticated detail requests | PASS | Inventory detail, order detail, and order-items requests without Authorization returned 401. |
| Dashboard and order list | PASS | Hyderabad dashboard rendered populated metrics; `GET /order-api/api/v1/orders` returned 200. Inventory list requests returned 200. |
| Reports | PASS | Reports rendered Hyderabad-scoped totals and store rows; the underlying orders request returned 200. |

Cross-location fixture IDs were selected using read-only MySQL queries limited to record IDs and store IDs. Authenticated browser requests read the selected inventory/order details solely to confirm authorization; no customer field values or business-record contents are included in this report, and no database writes were made. Browser snapshots and request evidence are under `.playwright-mcp/` from this run.

### Regression results

| Suite / check | Result |
|---|---|
| `mvn.cmd -q test` (run in `http-sync`) | PASS â€” 13 tests, including Catalog bearer-token forwarding. |
| `mvn.cmd -q test` (run in `inventory-service`) | PASS â€” 18 tests, 0 failures/errors/skips. Includes Location Admin same/cross-location, anonymous, Global Admin, and Store Manager inventory detail checks. |
| `mvn.cmd -q test` (run in `order-service`) | PASS â€” 108 tests, 0 failures/errors/skips. Includes Location Admin same/cross-location and anonymous detail/items checks, plus Admin and Store Manager authorization regressions. |
| `git diff --check` (backend) | PASS. |
| `git diff --check` (frontend) | PASS; Git reported existing line-ending notices for two pre-existing edited files. |

### Updated disposition

LA-20 and LA-23 are now **PASS** for the authenticated same-location read, tested cross-location denial, anonymous denial, and current local runtime. The latest nine-case totals are **PASS 8, FAIL 0, PARTIAL 1**; LA-14 remains PARTIAL because no live mapping write was made. No other use-case status changed. The remaining 21 fixture-dependent cases remain BLOCKED as recorded in their prior results. This retest does not establish MySQL persistence for writes or close those blocked workflows.

## Location Admin scoped QA continuation â€” 2026-10-24

This is the latest all-35 disposition. It supersedes earlier statuses only for cases where this section or the immediately preceding LA-20/LA-23 retest provides newer evidence. LA-14 was excluded from testing as requested; the mapping editor/save workflow was not opened or exercised. No application source was changed in this continuation.

### Browser identity and safe test method

- Reused the already authenticated local Playwright tab at `http://localhost:5175`; `/org-access/api/users/me` returned HTTP 200 and identified `locationadmin` with Hyderabad location scope. No credential or token was recorded.
- Checks were read-only, apart from generating a local JSON report download for LA-34. That export was scoped to Hyderabad Main Store. The export builder omits customer contact details, addresses, payment data, and order items; only the download filename and completion message were retained as evidence. The exported file itself is not included in this report.
- No database record was created, edited, deleted, adjusted, paid, shipped, or notified. No SQL was run. The UI showed write controls on several pages, but they were not activated.
- Playwright snapshots and network evidence are in `.playwright-mcp/` around `2026-10-24T13:44Zâ€“13:46Z`.

### Latest status for all 35 cases

| ID | Use case | Status | Latest evidence / reason |
|---|---|---|---|
| LA-01 | Login through Team Login | PASS | Current session identity check returned HTTP 200 for `locationadmin` / Hyderabad; earlier Team Login and logout round trip is recorded above. |
| LA-02 | View location-scoped dashboard | PASS | Dashboard rendered Hyderabad metrics (41 orders, 29 created, 1 completed, 2 cancelled, 21 mapped products, 0 low stock); underlying order and inventory list calls returned HTTP 200. |
| LA-03 | View assigned-location stores | PASS | Stores page showed six Hyderabad stores; authenticated store API returned HTTP 200. No other location appeared. |
| LA-04 | Create store within applicable location | BLOCKED | Requires a disposable store fixture/database; no live store write was made. |
| LA-05 | Edit store profile and operational information | BLOCKED | Requires a disposable store to verify persistence/read-back; existing stores were viewed only. |
| LA-06 | Set store coordinates/address | BLOCKED | Requires a disposable store for validation and persistence checks. |
| LA-07 | Configure delivery/pickup information | BLOCKED | Requires a disposable store and safe delivery-configuration fixture. |
| LA-08 | Change store active/closed status | BLOCKED | No disposable store was available; shared store status was left unchanged. |
| LA-09 | Delete store through available controls | BLOCKED | No disposable store with verified absence of dependencies; no delete attempted. |
| LA-10 | View location-scoped products | PASS | Products page showed the assigned-store mapped product set (21 products in the latest recorded read); product API returned HTTP 200. No mapping save action was used. |
| LA-11 | Create/edit products | BLOCKED | Requires a disposable master-catalog product fixture; no product write was made. |
| LA-12 | Change product active/draft status | BLOCKED | Requires a disposable product; no existing status was changed. |
| LA-13 | Manage product variants/images | BLOCKED | Requires a disposable product and image/variant fixture; no write was made. |
| LA-14 | Manage store-product mappings | SKIPPED â€” Excluded by user request | Mapping save workflow was not opened, implemented, modified, or retested. |
| LA-15 | Create location/store-scoped banners | BLOCKED | Requires a disposable banner fixture; no create request was sent. |
| LA-16 | Edit/disable campaigns | BLOCKED | Requires an isolated disposable campaign/banner; no existing campaign was edited or disabled. |
| LA-17 | View inventory by store | PASS | Authenticated inventory list returned HTTP 200 with 153 rows across six assigned stores and zero out-of-scope store rows. |
| LA-18 | Create/edit inventory records | BLOCKED | Requires a disposable inventory row/store fixture; no inventory write was made. |
| LA-19 | Adjust available stock | BLOCKED | Requires disposable inventory; no stock controls were activated. |
| LA-20 | Inspect reservations and stock thresholds | PASS | Same-location inventory detail returned HTTP 200 and exposed reserved/threshold fields; cross-location detail returned 403; unauthenticated detail returned 401. |
| LA-21 | View location-scoped orders | PASS | Orders page rendered Hyderabad order rows; authenticated Orders API returned HTTP 200. |
| LA-22 | Search/filter orders | PASS | Existing authenticated order search and status-filter checks are recorded above; they returned matching Hyderabad rows. No order actions were used. |
| LA-23 | Inspect order details and fulfillment | PASS | Same-location order detail and line items returned HTTP 200; cross-location detail/items returned 403; unauthenticated detail/items returned 401. No order was changed. |
| LA-24 | Confirm/process eligible orders | BLOCKED | Requires an isolated test-owned eligible order; no real order was processed. |
| LA-25 | Perform applicable packing/shipping actions | BLOCKED | Requires an isolated test-owned order and carrier sandbox; no shipment or delivery action was submitted. |
| LA-26 | Open delivery-partner assignment | BLOCKED | Requires a test-owned eligible order and partner fixture; no assignment workflow was opened. |
| LA-27 | Select active partner from relevant store | BLOCKED | Requires a disposable order/partner assignment fixture; no partner was assigned. |
| LA-28 | Retry failed shipment where permitted | BLOCKED | Requires an isolated failed shipment and mocked/sandbox carrier fixture; no retry was attempted. |
| LA-29 | Access delivery management module | PARTIAL | Delivery page loaded, but displayed â€œNo matching records.â€ Module shell/navigation is accessible; scoped delivery records/workflow cannot be proven without a safe fixture. |
| LA-30 | Configure local coupon records | BLOCKED | No disposable coupon fixture; no coupon was created or edited. |
| LA-31 | Select coupon store scope | BLOCKED | Requires a disposable coupon for safe scope and read-back verification. |
| LA-32 | View reports for location/stores | PASS | Reports showed Hyderabad-only scope, 41 orders, â‚¹14,068 revenue, 21 products, and six store rows; Orders API returned HTTP 200. |
| LA-33 | Filter operational reports | PASS | Selecting Hyderabad Main Store recalculated totals to 16 orders, â‚¹5,767 revenue, 14 products, and 1,200 stock units. Location selector remained locked to Hyderabad. |
| LA-34 | Export JSON report | PASS | Clicked Export JSON with Hyderabad Main Store selected; browser reported the scoped JSON download started and completed. The payload schema excludes customer contacts, addresses, payment data, and order items. No export contents were added to the report. |
| LA-35 | Logout | PASS | Earlier authenticated Team Login run verified sign-out cleared the token and protected `/admin` returned to login. |

### Totals

| Status | Count |
|---|---:|
| PASS | 13 |
| FAIL | 0 |
| PARTIAL | 1 |
| BLOCKED | 20 |
| SKIPPED | 1 |
| **Total** | **35** |

LA-14 was one of the prior 21 BLOCKED/PARTIAL cases and is now SKIPPED per instruction. LA-34 moved from BLOCKED to PASS after the scoped, read-only JSON download. Therefore 20 cases remain BLOCKED, not 21.

### Remaining BLOCKED cases grouped by workflow

- **Stores (LA-04â€“LA-09):** all six require a disposable store fixture and persistence/read-back; delete additionally requires a verified dependency-free test store.
- **Products (LA-11â€“LA-13):** all three require a disposable master product and safe variant/image fixture. Product creation/status changes affect shared catalog data without such a fixture.
- **Inventory (LA-18â€“LA-19):** both require disposable inventory rows; no stock changes were made to existing business records.
- **Orders (LA-24â€“LA-25):** both require a test-owned eligible order; packing/shipping additionally requires a non-dispatching carrier sandbox.
- **Delivery (LA-26â€“LA-28):** all three require an isolated order plus eligible partner or mocked failed-shipment/carrier fixture.
- **Campaigns/banners (LA-15â€“LA-16):** both require disposable inactive campaign/banner records for create/edit/disable and read-back.
- **Coupons (LA-30â€“LA-31):** both require disposable coupons for create/edit and store-scope verification.
- **Reports/exports:** none remain blocked. LA-32â€“LA-34 passed; LA-29 remains PARTIAL under delivery because its module contained no test-safe records.

### Regression and safety notes

- The authenticated read-only runtime assertions for LA-20/LA-23 were repeated in this session: same-location inventory detail/order detail/order items were HTTP 200; cross-location inventory/order/order items were HTTP 403; anonymous requests were HTTP 401.
- The dashboard, product, store, inventory, order, banner, coupon, and report pages loaded via the local UI. Store and product list APIs returned HTTP 200; banner and coupon list APIs also returned HTTP 200. Delivery shell loaded with no matching records.
- No source files or service configuration were changed in this continuation. Prior frontend and backend uncommitted changes were preserved. Backend targeted authorization suites are rerun below; this QA does not claim MySQL write persistence because no disposable MySQL fixture exists.

### Tests run for this continuation

| Command | Result |
|---|---|
| `node.exe --test src/config/accessControl.test.js src/pages/AdminWorkspace/adminReportData.test.js` (frontend) | PASS â€” 14 tests, 0 failures. |
| `mvn.cmd -q -Dtest=InventoryApiIntegrationTest test` (Inventory Service) | PASS â€” 6 tests, 0 failures/errors/skips; same-location, cross-location, and unauthenticated inventory access assertions ran with isolated test fixtures. |
| `mvn.cmd -q -Dtest=PaymentHttpIntegrationTest test` (Order Service) | PASS â€” 19 tests, 0 failures/errors/skips; order detail/items authorization integration assertions ran with isolated test fixtures. |
| `git diff --check` (frontend and backend) | PASS â€” both exited 0; frontend printed only existing LF-to-CRLF working-copy notices. |

The backend integration tests used their isolated test context/fixtures; they did not write to local MySQL. No full frontend or full backend suite was rerun in this continuation.

## Location Admin store create/edit follow-up â€” 2026-10-24

This follow-up covers LA-04 through LA-07 only. LA-14 remained excluded and its mapping workflow was not opened or tested. Existing portal code and unrelated working changes were preserved.

### Findings and changes

- The store create and update UI already provides the required fields for assigned location, address, coordinates, delivery/pickup, delivery radius, ETA, delivery charges, delivery modes, and notes. `scopedForm` supplies the Location Admin's assigned location; the backend validates location authorization against the signed identity and persisted store.
- An authenticated browser check opened the create dialog and submitted it with required fields blank. The UI showed validation errors for store name, address, delivery radius, and ETA; no store POST/PUT request was sent. The edit dialog for an assigned store showed its existing profile and operational fields; it was canceled without saving.
- A focused H2 integration suite verified Location Admin store creation and readback, profile/address/coordinate and delivery/pickup updates, field validation, and same-location versus cross-location authorization. It also reproduced a Store Manager regression: the manager passed the exact-store `canManageStore` check but then failed the update handler's `canCreateStore` check with 403.
- Fixed the update guard to check the persisted store and requested location. Location Admins must remain within their assigned location; Store Managers must have the exact store scope and cannot change its location; global administrators retain update access.

### Files changed for this follow-up

- `ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/config/CatalogAccess.java` â€” added persisted-store-aware update authorization. This file was already an untracked working file before this follow-up; its existing implementation was preserved and the helper was added in place.
- `ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/store/StoreController.java` â€” use the new update-specific authorization check.
- `ecom-backend/catalog-service/src/test/java/com/metaarch/catalog/store/StoreLocationAdminIntegrationTest.java` â€” added four transactional H2 integration tests for unauthenticated create denial, assigned-location create/readback, cross-location create/read/update denial, profile/address/coordinate/delivery/pickup persistence, invalid field rejection, Store Manager exact-store permissions, and Global Admin update access. The test does not exercise product-store mappings.

### Case results

| ID | Status | Evidence and remaining limit |
|---|---|---|
| LA-04 | PARTIAL | Authenticated UI rendered the create workflow and rejected blank required fields without an API write. H2 integration tests verified authorized Hyderabad create/readback, unauthenticated create 401, and Chennai create 403. No live MySQL/browser creation was made because no disposable MySQL store fixture was established. |
| LA-05 | PARTIAL | H2 integration test verified authorized store profile update/readback, denied a location change and a Chennai store update, and confirmed rejected changes did not overwrite the stored address. The live edit form was inspected and canceled; MySQL persistence remains unverified. |
| LA-06 | PARTIAL | H2 tests verified address and coordinates read back after update and rejected blank address, latitude 91, and longitude -181 with HTTP 400. No live store was changed; MySQL persistence remains unverified. |
| LA-07 | PARTIAL | H2 tests verified delivery/pickup flags, radius, ETA, charge, free-delivery threshold, modes, and notes on create/update; negative radius and ETA were rejected with HTTP 400. No live delivery configuration was changed; MySQL persistence remains unverified. |

### Verification and safety

| Command/check | Result |
|---|---|
| `mvn.cmd -q -Dtest=StoreLocationAdminIntegrationTest test` in `ecom-backend/catalog-service` | PASS â€” 4 tests, 0 failures/errors/skips. Test configuration used `jdbc:h2:mem:catalog`; test transactions rolled back. |
| Authenticated browser, `/admin/stores` | PARTIAL â€” create-form validation observed with no write request; assigned-store edit fields inspected then canceled. Existing local backend service processes were not restarted, so browser checks do not verify the new authorization code at runtime. |
| `git diff --check` (frontend and backend repositories) | PASS â€” no whitespace errors. |

No MySQL SQL or live store mutation was performed. The H2 checks prove the current Catalog source behavior, but not local MySQL persistence or the behavior of an already-running Catalog process. Therefore LA-04â€“LA-07 are PARTIAL, not PASS. Across all 35 cases, the updated totals are **PASS 13, FAIL 0, PARTIAL 5, BLOCKED 16, SKIPPED 1**. LA-14 remains `SKIPPED â€” Excluded by user request`.

## Follow-up to resolve partial statuses â€” 2026-10-24

- **LA-29 â€” PASS:** In the authenticated Location Admin browser context, opened `http://localhost:5175/admin/delivery`. The portal identified Location Admin / Hyderabad, rendered the Delivery heading and â€œManage delivery within your assigned scopeâ€ description, and displayed module controls without redirect. LA-29 tests access to the module; the empty â€œNo matching recordsâ€ state does not block that access check. Evidence: `.playwright-mcp/page-2026-10-24T14-01-19-251Z.yml`. No delivery record or assignment was created.
- **LA-04â€“LA-07 â€” remain PARTIAL:** Focused H2 integration tests pass create/readback, update/readback, address and coordinate validation, delivery/pickup persistence, same-location authorization, cross-location denial, unauthenticated write denial, and Global Admin / Store Manager update access. The browser verified empty-form validation and inspected the existing-store form without saving. The browser's configured API path reaches the shared local service stack; no disposable MySQL fixture or isolated browser-to-H2 service was available. A live store write would risk changing shared data, so these cases cannot be marked PASS based on current evidence.

Updated totals across all 35 cases are **PASS 14, FAIL 0, PARTIAL 4, BLOCKED 16, SKIPPED 1**. LA-14 remains `SKIPPED â€” Excluded by user request`. Closing the remaining four PARTIAL statuses requires an isolated end-to-end browser environment backed by a disposable database; the project currently configures H2 for automated test execution only.

## LA-04â€“LA-07 runtime authorization retest â€” 2026-10-24

### Build and restart

- Reviewed the current Catalog source and working tree before building. `StoreController` now calls the persisted-store-aware `CatalogAccess.canUpdateStore` helper; the focused integration test file remains a new untracked test file, and the earlier Catalog changes were preserved.
- Catalog has no dependency on a separate shared authorization artifact in its Maven POM; the authorization helper is part of the Catalog source. The applicable build sequence is therefore the Catalog module itself.
- Built the current module with `mvn.cmd -q -DskipTests package` from `ecom-backend/catalog-service`; the build completed successfully and produced `target/catalog-service-0.0.1-SNAPSHOT.jar`.
- Before restart, confirmed the Catalog listener was PID 36388 on the configured port 8089. It was the Java process running `com.metaarch.catalog.CatalogServiceApplication`, launched by the repository Maven launcher. The backend launcher recorded the Catalog launcher PID as 28404.
- Restarted only Catalog with the existing project command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\run-all-services.ps1 -Action restart catalog-service`. The launcher confirmed MySQL was already running, stopped only the Catalog launcher/listener, and started Catalog again. No gateway, Inventory, Order, or other service was restarted. Ports and environment configuration were not changed.
- Startup log evidence in `D:\ecom\Ecom\.local\logs\catalog-service.log`: Hikari pool started; Tomcat bound to 8089; `CatalogServiceApplication` started. `GET http://127.0.0.1:8089/actuator/health` returned `UP`. The new listener was PID 2752; launcher PID 50940.
- Catalog uses the existing `prod` profile/configuration with MySQL on port 3306, `hibernate.ddl-auto=validate`, and Flyway disabled. Startup did not create or migrate application tables.

### Safe database check

- The only local MySQL listener found was `mysqld` on port 3306. No isolated-test MySQL listener or `.local/isolated-test-*` workspace was present.
- Repository configuration exposes H2 at `jdbc:h2:mem:catalog` only in Catalog test resources. The project launcher's isolated mode requires a separate loopback MySQL port and an explicitly expected server UUID; neither was available in this environment.
- No SQL reads or writes were performed for this retest. No shared MySQL store was created, edited, or deleted. Browser write/readback remains unsafe without a disposable database, so LA-04â€“LA-07 remain PARTIAL.

### Runtime and authorization evidence

- Reused the authenticated local Location Admin browser session. The JWT claims were checked in-page and only sanitized identity data was retained: subject `locationadmin`, role `ROLE_LOCATION_ADMIN`, location scope `hyderabad`.
- After restart, the authenticated Catalog API `GET /api/v1/stores` returned HTTP 200 with 6 rows; all six had Hyderabad location. The Location Admin store page rendered those six assigned stores.
- An authenticated same-location store detail GET returned HTTP 200. An authenticated read-only detail GET for Chennai store ID `store-adyar` returned HTTP 403. No store update request was made to shared MySQL.
- Successful write persistence and denials are covered by the focused transactional H2 integration tests: Location Admin create and same-location update/readback succeed; unauthenticated create returns 401; cross-location create, location move, and cross-location update return 403; invalid address/coordinates and negative radius/ETA return 400. Store Manager exact-store update returns 200 and attempted location change returns 403; Global Admin update returns 200. These test-context writes rolled back and did not touch MySQL.
- No browser save-and-readback test was performed because it would use shared `catalog_service`. No live Store Manager or Global Admin write was attempted for the same reason.

### Verification after restart

| Command/check | Result |
|---|---|
| `mvn.cmd -q -DskipTests package` (Catalog) | PASS â€” completed successfully. |
| `mvn.cmd -q -Dtest=StoreLocationAdminIntegrationTest test` (Catalog, after restart) | PASS â€” 4 tests, 0 failures/errors/skips. |
| Catalog health on port 8089 | PASS â€” HTTP health status `UP`. |
| Authenticated runtime store list | PASS â€” HTTP 200, 6 Hyderabad rows, no other location. |
| Authenticated same-location store detail | PASS â€” HTTP 200. |
| Authenticated Chennai store detail | PASS â€” HTTP 403. |
| `git diff --check` (frontend and backend) | PASS â€” no whitespace errors; frontend emitted only existing LF-to-CRLF notices. |

### Updated disposition and risks

LA-04 through LA-07 remain **PARTIAL** because live create/edit persistence is unverified; there is no disposable MySQL database available, and shared `catalog_service` was not mutated. Runtime read authorization is now verified on the restarted Catalog service. Store Manager and Global Admin write permissions are verified in isolated H2 tests, not against live MySQL. Do not treat this as live write-persistence proof.

Current all-35 totals remain **PASS 14, FAIL 0, PARTIAL 4, BLOCKED 16, SKIPPED 1**. LA-14 remains `SKIPPED â€” Excluded by user request`. Remaining risks are the absence of a disposable MySQL fixture for LA-04â€“LA-07 browser save/readback and the lack of live write verification for Store Manager and Global Admin; no shared business data was changed.

## LA-04â€“LA-07 completed isolated MySQL browser retest â€” 2026-10-25

This retest supersedes the earlier PARTIAL results for LA-04 through LA-07. LA-14 was not opened or tested.

### Isolated database and runtime setup

- Preflight confirmed MySQL was bound to loopback `localhost:3306`, the shared `catalog_service` schema existed, and the unique `catalog_qa_location_admin_20261025` schema did not exist. No isolated MySQL instance was already running.
- Created the new QA-only schema. Catalog's first isolated startup attempt failed because the Config Server continued to supply Hibernate `validate`; it stopped before table creation or store writes. Catalog was immediately restored to its normal configuration. A second process-scoped Spring override selected `ddl-auto=update` for the empty QA schema only. Catalog then started healthy on its existing port 8089 and Hibernate created 10 tables in the QA schema.
- The Catalog-only restarts used `run-all-services.ps1 -Action restart catalog-service`. The launcher confirmed MySQL was already running and restarted no gateway, Inventory, Order, or other service. No ports or checked-in configuration files were changed.
- During schema setup, a PowerShell quoting mistake briefly created an empty schema named `$candidate`. Before any use, it was confirmed to have zero tables and zero sessions and was removed. No application or business rows were written to it.
- After testing, Catalog was restarted again with the normal project configuration. Its health returned `UP` on port 8089, and the authenticated browser again showed the six existing Hyderabad stores. The QA schema was confirmed to have zero active sessions and only the single test store row (all other QA tables were empty), then the QA schema was dropped. A final check confirmed the QA schema no longer exists.

### Browser workflows and HTTP evidence

The prior browser session had expired, so the supplied local Location Admin account was authenticated once through Team Login. The verified identity was `locationadmin`, `ROLE_LOCATION_ADMIN`, scope `hyderabad`; no credential or token was saved in the report.

Playwright evidence for this run: create confirmation `.playwright-mcp/page-2026-10-25T05-43-00-320Z.yml`, edit confirmation `.playwright-mcp/page-2026-10-25T05-43-49-181Z.yml`, refreshed persisted row `.playwright-mcp/page-2026-10-25T05-43-57-730Z.yml`, and sanitized Catalog request statuses `.playwright-mcp/location-admin-la0407-network-2026-10-25.txt`.

| Case | Browser/API action | Result |
|---|---|---|
| LA-04 | Created uniquely named disposable Hyderabad store using the Location Admin Stores form. | UI showed â€œSaved successfullyâ€; `POST /catalog-service/api/v1/stores` returned **201**; refreshed list showed the new Hyderabad row. |
| LA-05 | Edited the disposable store name and description, then saved and refreshed. | `PUT /catalog-service/api/v1/stores/{id}` returned **200**; updated name remained visible after refresh. |
| LA-06 | Saved updated address and coordinates: `202 QA Updated Road, Hyderabad`, latitude `17.4260001`, longitude `78.4510002`. | API readback returned **200** with the exact address and coordinates; refreshed store remained present. |
| LA-07 | Set delivery enabled, pickup disabled, radius 8.25 km, ETA 30 minutes, delivery charge 40, free delivery above 500, modes `Standard Delivery, Express Delivery`, and QA notes. | API readback returned **200** with all requested operational values after save and refresh. |
| Scope | Attempted to move the disposable Hyderabad store to Chennai using its authenticated Location Admin session. | Update returned **403**; subsequent read returned **200** and confirmed location stayed Hyderabad and address stayed unchanged. |

The authenticated assigned-store list returned **200**, exactly six rows, all Hyderabad. Same-location store detail returned **200**; an existing Chennai store detail returned **403**. The live cross-location update attempt was made only against the disposable QA store in the isolated QA schema.

### Persistence and role regression checks

- A direct read-only SQL query against `catalog_qa_location_admin_20261025.stores` matched the browser API readback for the disposable row, including location, address, coordinates, delivery/pickup flags, radius, ETA, charges, modes, and notes.
- The same store ID had **0 rows** in shared `catalog_service` while the QA fixture existed. No shared store was created, edited, or deleted.
- `mvn.cmd -q -Dtest=StoreLocationAdminIntegrationTest test` passed **4 tests, 0 failures/errors/skips** after the Catalog source build. These isolated H2 checks also verified unauthenticated create returns 401; Location Admin same-location create/update succeeds; cross-location create/update and location move return 403; invalid address/coordinates and negative radius/ETA return 400; Store Manager exact-store update returns 200 and a location move returns 403; Global Admin update returns 200.
- Store Manager and Global Admin write access was verified in the focused H2 integration suite. No live write with those roles was attempted against shared MySQL.

### Updated case statuses

| ID | Status | Final evidence |
|---|---|---|
| LA-04 | PASS | Browser create returned 201 in the isolated QA schema; row appeared after refresh; SQL confirmed persisted QA row and no corresponding shared-schema row. |
| LA-05 | PASS | Browser edit returned 200 and updated profile remained after refresh; cross-location move was denied and readback remained unchanged. |
| LA-06 | PASS | Address and coordinate edits were saved and verified by API and SQL readback; invalid ranges remain covered by the focused 400-response tests. |
| LA-07 | PASS | Delivery/pickup and all operational fields were saved and verified by API and SQL readback; negative radius/ETA remain covered by the focused 400-response tests. |

### Commands and final disposition

| Command/check | Result |
|---|---|
| `mvn.cmd -q -DskipTests package` (Catalog) | PASS â€” built the current Catalog module. |
| `run-all-services.ps1 -Action restart catalog-service` | PASS â€” Catalog only; temporary QA configuration used only for the isolated-schema run, then normal configuration restored. |
| `mvn.cmd -q -Dtest=StoreLocationAdminIntegrationTest test` | PASS â€” 4 tests, 0 failures/errors/skips. |
| Catalog actuator health, port 8089 | PASS â€” `UP` after normal configuration was restored. |
| `git diff --check` (frontend and backend) | PASS â€” no whitespace errors; frontend showed only existing LF-to-CRLF notices. |

LA-04 through LA-07 are now **PASS**. All-35 totals are **PASS 18, FAIL 0, PARTIAL 0, BLOCKED 16, SKIPPED 1**. LA-14 remains `SKIPPED â€” Excluded by user request`. The 16 blocked cases still need their own isolated product, inventory, order, delivery, campaign/banner, or coupon fixtures; this run did not verify those workflows. Store Manager and Global Admin writes were covered in isolated H2 tests rather than live role sessions.

## Blocked-case follow-up - 2026-10-25

Retested the currently blocked workflows with the authenticated Hyderabad Location Admin browser session. This was a read-only availability and UI check. No store, product, inventory, order, shipment, partner, banner, campaign, or coupon was created, edited, disabled, deleted, assigned, or otherwise mutated.

### Service availability

| Workflow/service | Current evidence | Result |
|---|---|---|
| Catalog: products, stores, banners, coupons | Authenticated browser GETs to /catalog-service/api/v1/products?status=ACTIVE, /stores, /banners?all=true, and /coupons returned HTTP 200. | Available |
| Inventory | Authenticated browser GETs to /inventory-service/api/v1/inventories returned HTTP 200. The UI lists existing stock records and exposes stock controls; none was activated. | Available |
| Orders | Authenticated browser GET /order-api/api/v1/orders, an order detail, and its /items returned HTTP 200. Existing order actions were not submitted. | Available |
| Fulfillment and partner lookup | The existing order's shipment lookup and Org Access delivery-partner lookup returned HTTP 200. | Available |

The running local services were listening on their existing ports: gateway 8082, Catalog 8089, Inventory 8095, Order 3311, and Fulfillment 3315. No services were restarted. These checks establish availability only; they do not establish that a write is safe or persisted.

### Case disposition

| ID | Status | Read-only result and remaining prerequisite |
|---|---|---|
| LA-08 | BLOCKED | Store page exposes Activate/Deactivate controls, but all listed stores are existing business records. Needs an isolated disposable store to verify a status transition and readback. |
| LA-09 | BLOCKED | Delete controls are present. No dependency-free disposable store exists in the active database; deletion was not attempted. |
| LA-11 | BLOCKED | Product list and API are available, but the Location Admin product UI has no create/edit controls. Needs an explicitly supported location-owned product workflow and isolated product fixture. |
| LA-12 | BLOCKED | No product status control is exposed to Location Admin. Needs a supported scoped workflow and disposable product. |
| LA-13 | BLOCKED | No safe disposable product/variant/image fixture. No product assets were changed. |
| LA-15 | BLOCKED | Banners page and authenticated banner list loaded (HTTP 200), with existing banners displayed. Needs a disposable banner and safe save/readback fixture. |
| LA-16 | BLOCKED | No isolated campaign/banner fixture; existing active banners were left unchanged. No separate campaign workflow was exercised. |
| LA-18 | BLOCKED | Inventory page and list loaded (HTTP 200), but visible rows are existing inventory. Needs disposable inventory/store fixture for create/edit and readback. |
| LA-19 | BLOCKED | Stock adjustment controls are visible, but no safe disposable inventory row exists. No stock control was activated. |
| LA-24 | BLOCKED | Existing order list loaded (HTTP 200) and showed actionable orders. All are existing business orders; no status transition was submitted. Needs an isolated eligible test order. |
| LA-25 | BLOCKED | Order and fulfillment services respond, but no isolated order/shipment or non-dispatching carrier sandbox is configured. No packing, shipping, or delivery action was submitted. |
| LA-26 | PASS | Opened the delivery-partner assignment view for an existing order. Order detail, order-items, shipment lookup, and partner lookup returned HTTP 200; UI displayed five active partners for the order's Hyderabad store. The view was closed without selecting or assigning a partner. This verifies opening and eligible partner loading only. |
| LA-27 | BLOCKED | Active partners are available in the assignment UI, but persistence requires assigning one to an existing business order. Needs an isolated order and partner fixture; no assignment was saved. |
| LA-28 | BLOCKED | Shipment lookup succeeded, but there is no verified isolated failed-shipment fixture. No retry was attempted. |
| LA-30 | BLOCKED | Coupons page loaded and displayed no matching records; authenticated coupon list returned HTTP 200. Needs a disposable coupon fixture for create/edit and persistence verification. |
| LA-31 | BLOCKED | No disposable coupon/store-scope fixture. No coupon scope was selected or saved. |

Playwright evidence is under .playwright-mcp/: page-2026-10-25T05-58-40-198Z.yml (products), page-2026-10-25T05-58-46-129Z.yml (banners), page-2026-10-25T05-58-51-501Z.yml (inventory), page-2026-10-25T05-58-58-988Z.yml (coupons), page-2026-10-25T05-59-11-559Z.yml (orders), and page-2026-10-25T05-59-23-650Z.yml (assignment view). The corresponding browser network capture confirmed the HTTP statuses above. No order identifiers, partner names, credentials, or tokens are included here.

### Reconciled total

The all-35 total is now **PASS 19, FAIL 0, PARTIAL 0, BLOCKED 15, SKIPPED 1**. LA-14 remains skipped by explicit user request. All services required by the remaining blocked cases were available during this check; those cases remain blocked because their requested write/readback steps require isolated fixtures or, for LA-11/LA-12, a supported Location Admin product editing workflow. No MySQL business data was changed.

## LA-08, LA-09, LA-11, LA-12, LA-15 follow-up â€” 2026-10-25

This run tested the five requested cases using the authenticated Hyderabad Location Admin browser session. LA-14 was not opened or changed. All Catalog writes took place in the temporary, empty `catalog_qa_location_admin_cases_20261025` schema; it was separate from shared `catalog_service` and was removed after the run. The normal Catalog service configuration was restored and health returned to `UP` on port 8089. No gateway, Inventory, Order, Fulfillment, or unrelated service was restarted.

### Case results

| ID | Status | Result and evidence |
|---|---|---|
| LA-08 | PASS | In the isolated schema, the Location Admin Stores page changed the disposable Hyderabad store to Inactive. `PUT /catalog-service/api/v1/stores/{id}` returned **200**; the follow-up GET returned **200**, and the row showed Inactive. A same-session attempt to move it to Chennai returned **403**; readback confirmed the store remained Hyderabad and Inactive. |
| LA-09 | PASS | Before deleting, a read-only dependency check found the disposable store was the only store and there were no zones, delivery methods, products, variants, images, mappings, banners, or coupons in the QA schema. The Location Admin UI Delete/Confirm action returned **204**; refreshed store listing returned **200** and showed no matching records. No shared store was touched. |
| LA-11 | BLOCKED | Location Admin product page exposed no create/edit action (only Map Product). Catalog product create is intentionally limited to Admin, Global Admin, and Super Admin because products are shared master catalog records without location ownership. The focused H2 authorization test confirmed Location Admin create is denied (**403**) while Global Admin create succeeds. No product was written. A location-owned product model/workflow would be needed before granting this capability safely. |
| LA-12 | BLOCKED | Location Admin product page exposed no active/draft control. The focused H2 test confirmed Location Admin product status update is denied (**403**) and Global Admin can update status. Product status is global catalog state, so this run did not broaden the role or change any product. |
| LA-15 | PASS | The Location Admin Banners form accepted the local logo image and an inactive banner with no store override; its existing form behavior assigned the caller's Hyderabad location. `POST /catalog-service/api/v1/banners` returned **201**; follow-up `GET /catalog-service/api/v1/banners?all=true` returned **200**; the refreshed UI displayed the saved banner as Inactive. H2 authorization tests verify unauthenticated create is denied and a Hyderabad Location Admin cannot create or relocate a banner in another location; Global Admin global-scope banner behavior remains allowed. No campaign publication or notification was triggered. |

### Regression and cleanup evidence

- Focused command: `mvn.cmd -q "-Dtest=StoreLocationAdminIntegrationTest,StoreLifecycleLocationAdminIntegrationTest,BannerLocationAdminIntegrationTest,ProductGlobalCatalogAuthorizationIntegrationTest" test` in `catalog-service` â€” **9 tests passed, 0 failures, 0 errors, 0 skipped**.
- Those isolated H2 tests cover authenticated same-location store update/delete, unauthenticated and cross-location denial, banner scope and global-admin behavior, and the global product write boundary.
- After the browser test, Catalog was restarted with the normal project launcher and configuration. Health was **UP**. Read-only MySQL preflight showed zero active sessions on the QA schema and 10 sessions on normal `catalog_service`; only the exact QA schema created for this run was dropped. Verification confirmed the QA schema was absent and `catalog_service` remained present.
- Playwright network evidence: `PUT` store status **200**, cross-location store update **403**, `DELETE` **204**, banner create **201**, and banner list readback **200**. The UI displayed the persisted inactive banner and the store status/deletion results.
- `git diff --check` passed in both repositories. The frontend emitted existing LF-to-CRLF notices for modified `AdminWorkspace.jsx` and `catalogApi.js`; there were no whitespace errors.
- No runtime application source changes were made in this five-case run. Three focused Catalog integration test files were added for lifecycle, banner, and global product authorization boundaries. Other existing uncommitted changes were preserved.

### Reconciled all-35 totals

**PASS 22, FAIL 0, PARTIAL 0, BLOCKED 12, SKIPPED 1 (35 total).** LA-14 remains `SKIPPED â€” Excluded by user request`. LA-11 and LA-12 remain blocked by the established global product permission model; this is an intentional capability boundary rather than a demonstrated authorization defect.

## Remaining-blocker remediation retest â€” 2026-10-25

This section supersedes earlier dispositions for LA-25, LA-27, LA-28, and LA-31. LA-14 was not opened or modified.

### Case results

| ID | Final status | Result and evidence |
|---|---|---|
| LA-11 | BLOCKED | Global catalog product create/edit remains intentionally restricted to global catalog roles because products have no location ownership. Catalog authorization tests preserve the Location Admin denial and Global Admin access. No product was created or edited. A location-owned product requirement/model is still needed before this capability can be added safely. |
| LA-12 | BLOCKED | Global product publication status remains protected. The Location Admin UI exposes no active/draft control, and existing Catalog authorization tests preserve the server-side denial. No product status was changed. |
| LA-13 | BLOCKED | Variants and images belong to the shared master product boundary. No Location Admin variant/image write is authorized, and there is no separate location-owned variant/image operation in current requirements. No product or image was changed. |
| LA-25 | PASS | `FulfillmentAuthorizationTest.locationAdminCreatesAndPersistsShipmentLifecycleOnlyForAssignedLocation` exercised the Spring controller/service/repository layer against isolated H2: Hyderabad fulfillment advanced through ALLOCATED, PACKING, READY_TO_SHIP; shipment creation returned **201**; identical duplicate creation returned **201** with the same ID; API/repository readback confirmed shipment/order/fulfillment association; IN_TRANSIT, OUT_FOR_DELIVERY, and DELIVERED transitions returned **200** and updated fulfillment state. Shipment-before-READY_TO_SHIP and an invalid post-delivery transition returned **409**; cross-location access returned **403**; unauthenticated access **401**; malformed UUID **400**; valid missing order **404**. There is no carrier dispatch adapter; tests use local metadata and `sync.dispatch-enabled=false`, so no carrier, shipment dispatch, or notification was contacted. This verifies the supported API lifecycle, not browser or MySQL behavior. |
| LA-27 | BLOCKED | API integration coverage verifies partner assignment persistence and authoritative partner details on readback; a cross-store partner is denied (**403**) without changing FAILED, and unauthenticated assignment is denied (**401**). Browser assignment/save/reload was not run because the live order and partner rows are shared business records and there is no isolated browser-to-H2 service stack. No live order was assigned. A disposable order and partner are still required for the browser portion. |
| LA-28 | PARTIAL | H2 verifies a FAILED shipment remains FAILED when partner eligibility rejects assignment (**403**); a verified same-store partner reopens it as CREATED and assignment survives readback. Repeating assignment does not create another shipment. The UI now records its retry timeline only after backend assignment succeeds, preventing a false success event. Fulfillment has no carrier retry adapter, retry counter, or carrier success/failure response to exercise. Existing behavior is manual same-store partner reassignment, so carrier retry and attempt-history verification remain unavailable. No real shipment was retried. |
| LA-31 | PASS | The administration guide (`docs/functional/administration.md`, A16) specifies that Location Admin can select a target store. The prior UI hid this field and the API rejected store scope. The updated form shows an optional Target store field. An authenticated read-only browser check showed six choices, all Hyderabad stores, then canceled without saving. H2 `CouponLocationAdminIntegrationTest.locationAdminCanCreateEditAndDisableOnlyLocationCoupons` verified location coupon creation, assigned-store coupon creation/update/list readback and status update; Chennai, unknown store IDs, or cross-location movement returned **403**. Unauthenticated create returned **401**, and Global Admin store-scoped coupon creation remained allowed. Frontend payload tests verify scope derives from selected store and assigned location. No browser save or live MySQL coupon was performed; UI selection and API persistence were checked separately using browser inspection and isolated H2. |

### Fixes and files changed

- Backend `CatalogAccess.java`: Location Admin store-scoped coupons are allowed only when the persisted target store belongs to the signed assigned location; coupon visibility and update scope use that same check.
- Backend `CouponLocationAdminIntegrationTest.java`: H2 positive and negative coverage for location/store coupons, cross-location and unknown-store denial, unauthenticated access, and Global Admin preservation.
- Frontend `AdminWorkspace.jsx`: Location Admin receives an optional target-store selector limited to known assigned-location stores; selected name is resolved to the store ID before submit. Other roles retain their existing schema.
- Frontend `adminCoupon.js` and `adminCoupon.test.js`: role-derived coupon scope/payload extraction and tests.
- Backend `FulfillmentAuthorizationTest.java`: H2 API shipment creation/lifecycle persistence, duplicate request, malformed/missing ID, unauthorized, cross-location, failed-assignment, and retry-reassignment assertions.
- Backend Fulfillment `GlobalExceptionHandler.java`: malformed UUID path parameters now return **400** instead of an internal error.
- Frontend `DeliveryPartnerAssignment.jsx`, `deliveryPartnerAssignmentWorkflow.js`, and `deliveryPartnerAssignmentWorkflow.test.js`: partner assignment validation occurs before retry timeline recording; failed assignment no longer records success or clears FAILED in the UI.

### Regression and environment results

| Command/check | Result |
|---|---|
| Full Catalog `mvn.cmd -q test` after coupon authorization changes | PASS â€” 27 tests, 0 failures/errors/skips. |
| Full Inventory `mvn.cmd -q test` | PASS â€” 18 tests, 0 failures/errors/skips. |
| Full Order `mvn.cmd -q test` | PASS â€” 109 tests, 0 failures/errors/skips. |
| Full Fulfillment `mvn.cmd -q test` after lifecycle/retry changes | PASS â€” 24 tests, 0 failures/errors/skips. |
| Four backend suites combined | PASS â€” 178 tests, 0 failures/errors/skips; integration writes used H2 test databases. |
| Frontend `node.exe --test` | 215 passed, 1 failed out of 216. The only failure remains the pre-existing `src/utils/authenticatedCart.test.js:65` lost-transfer-response assertion (expected 2, received 3); this test and behavior were not changed. |
| Focused frontend coupon and shipment workflow tests | PASS â€” 6 tests, 0 failures. |
| `npm.cmd run lint` | PASS â€” no lint errors or warnings. |
| `npm.cmd run build` | PASS â€” production build completed; existing large-JavaScript-chunk warning remains. |
| `git diff --check` (frontend and backend) | PASS â€” no whitespace errors; frontend printed existing LF-to-CRLF notices for `AdminWorkspace.jsx` and `catalogApi.js`. |
| Browser `/admin/coupons` | Read-only â€” authenticated Location Admin saw optional store selection with six Hyderabad-only choices; dialog canceled without a write. Evidence: `.playwright-mcp/page-2026-10-25T07-31-26-143Z.yml` and `.playwright-mcp/page-2026-10-25T07-31-33-958Z.yml`. |

No service was restarted. No MySQL query or write was performed in this continuation; persistence assertions used disposable H2 tests. No live order, shipment, partner, coupon, or other business record was changed. No external carrier, payment, notification, or delivery action occurred. Production/VPS and unrelated services were untouched. Existing uncommitted changes in both repositories were preserved.

### Final all-case reconciliation

| Status | Count |
|---|---:|
| PASS | 29 |
| FAIL | 0 |
| PARTIAL | 1 |
| BLOCKED | 4 |
| SKIPPED | 1 |
| **Total** | **35** |

The remaining blocked cases are LA-11, LA-12, and LA-13 (global master catalog changes remain outside Location Admin authority) and LA-27 (requires a disposable browser order/partner fixture). LA-28 is partial until the application has a documented carrier retry adapter. LA-14 remains `SKIPPED â€” Excluded by user request`.

## Administrator hierarchy and portal architecture follow-up â€” 2026-10-25

### Findings and implementation

- The existing data model already represents administrative assignments as memberships with `organization_id`, `location_id`, and `store_id`. There is no `global_admin_id`, manager-parent field, or Global Admin ownership relationship. No schema migration was needed, and no database was read or changed for this work.
- Super Admin is the only role allowed by the Org Access staff account endpoints (`GET/POST /api/users`, `PUT/DELETE /api/users/{id}`). The checks are server-side `@PreAuthorize("hasRole('SUPER_ADMIN')")`; Global Admin and Location Admin requests cannot become authorized by a supplemental `PERM_USER_WRITE` permission.
- The existing shared `/admin/*` route renders a role-specific portal title, navigation, and module set from the verified account role. Super Admin alone can open the Users module; Global Admin and Location Admin do not receive that module. Team login sends Super Admin, Global Admin, and Location Admin to `/admin/dashboard`; Store Manager and Delivery Partner retain their separate landing paths.
- Tightened staff provisioning validation in `IdentityService`: only Global Admin and Location Admin accounts can be provisioned through this Super Admin staff endpoint; a Location Admin must have a location; a Global Admin cannot be assigned a location; staff accounts cannot carry store assignments; and an arbitrary client organization cannot override the managed organization. Membership scope and `assignedBy` come from server-validated fields and the authenticated actor. Staff edits now reject accounts with mixed or inconsistent roles/memberships.
- Updated the team login flow to reject a customer identity before it is stored as a staff session. Updated the admin workspace loader to check module access before it calls the staff list API. The account form offers only Global Admin and Location Admin account types, and new admin form values start without inherited location/store defaults. The create-user API payload sends a Location Admin's location as location scope only; it does not turn that city into store ownership.
- Location Admin remains excluded from global user management and global catalog permissions. Existing `ROLE_MODULES` and backend location-scope checks were retained; LA-11â€“LA-13 were not expanded. LA-14 remains `SKIPPED â€” Excluded by user request`.

### Verification performed

- Focused Org Access tests: `IdentityServiceTest` 18 passed and `UserControllerTest` 24 passed (42 total; 0 failures/errors/skips; Maven exited 0). Coverage includes Super Admin creating a Global Admin without a location, creating a Location Admin without a Global Admin parent, required Location Admin assignment, rejection of an untrusted organization, and Global/Location Admin denial for staff management endpoints. Maven's Logstash appender retried the unavailable `logstash:5000` destination during test shutdown; Surefire stopped its fork after the passing test reports were written.
- Frontend focused architecture/access tests: 13 passed, 0 failed (`node.exe --test src/config/accessControl.test.js src/services/orgAccessService.test.js`).
- Authenticated browser check: existing Location Admin session at `/admin/users` rendered the role-specific Access denied page. `/org-access/api/users/me` returned HTTP 200; no `/api/users` list request was issued from the denied page. Sanitized page snapshot: `.playwright-mcp/page-2026-10-25T08-25-24-722Z.yml`.
- Full frontend tests: 220 passed, 1 failed out of 221. The failing existing unrelated test is `src/utils/authenticatedCart.test.js` â€” â€œlost transfer response reconciles original key before retrying an available itemâ€ (expected 2 requests, observed 3). It was not changed as part of this hierarchy task.
- `npm.cmd run lint`: PASS. `npm.cmd run build`: PASS (existing large-chunk warning). `git diff --check`: PASS in frontend and backend repositories.
- No account was created or edited in the running application, no service was restarted, and no shared or production database was touched. Browser verification used the already-authenticated Location Admin session only; Super Admin and Global Admin identities were not logged in during this run.

### Remaining limits

- Org Access has no canonical location registry/repository. The service validates that a Location Admin assignment is present and binds it to that identity, but it cannot independently prove that the submitted location key is an active catalog location during account provisioning. The Super Admin form uses the existing location options; authoritative location existence validation remains dependent on the catalog-backed assignment workflow.
- Live Super Admin/Global Admin browser login and create/readback were not performed. Their account-management denial/allow behavior is covered by backend authorization tests; no disposable account fixture was available for live persistence verification.
- Current overall Location Admin QA totals remain **29 PASS, 0 FAIL, 1 PARTIAL, 4 BLOCKED, 1 SKIPPED (35)**. This architecture follow-up does not change LA statuses because it did not retest their workflows. LA-14 remains excluded.






## Super Admin provisioning and remaining QA follow-up — 2026-10-25

### Super Admin browser provisioning

- No legitimate Super Admin browser session or isolated seeded Super Admin test account was available. The current authenticated local browser session is Location Admin; previous documented attempts with supplied admin-role combinations were rejected. No credentials were guessed, no account was created through a bypass, and no live Global Admin or Location Admin account was created.
- Browser provisioning, authentication as newly provisioned accounts, and MySQL persistence/readback therefore remain **BLOCKED**. The required prerequisite is a project-owner-provided, authorized Super Admin test account and an isolated Org Access database/browser stack with disposable account fixtures.
- Backend role gates and account rules were verified by automated tests: Super Admin can create Global Admin without location, can create Location Admin with a location and no Global Admin parent, and only Super Admin can list/update/delete these staff accounts. Global Admin and Location Admin requests are denied on the staff-management APIs even when a supplemental user-write authority is present. These automated tests do not substitute for the blocked live browser and database checks.

### Location source review

- Catalog migration `catalog-service/src/main/resources/db/migration/V10__create_store_location_schema.sql` creates a `stores` table with a `location` text column; it does not create a canonical locations table, location status, location repository, or locations API. Org Access has only `memberships.location_id` and no location registry.
- Store rows are not treated as a location registry. No hardcoded location list, second registry, or schema migration was added. Server validation still requires a nonblank Location Admin location, but cannot verify active/known location status without an authoritative location service. Required follow-up contract: an authenticated Catalog/organization location API that returns stable location IDs and active status, with a documented ownership/assignment policy.

### LA-27 and LA-28 test results

- LA-27 remains **BLOCKED**. Fresh isolated Fulfillment checks split these assertions across H2 and mocked HTTP tests. `FulfillmentAuthorizationTest` persisted a same-location assignment and verified readback; it returned 401 for unauthenticated assignment and 403 for an ineligible partner without changing FAILED state. `DeliveryPartnerEligibilityTest` used `MockRestServiceServer` to accept an active same-store directory partner and reject inactive, unknown, and cross-store partners. No isolated browser-to-service stack or disposable live order/partner was available for browser save/reload. No shared order or shipment was modified.
- LA-28 remains **PARTIAL**. Existing H2 tests exercised a FAILED shipment rejecting an ineligible partner without changing state, then accepting a verified same-store partner and reopening as CREATED; repeated assignment retained one shipment. Frontend workflow tests confirm a failed backend assignment does not add a success timeline event. The documented application behavior is same-store partner reassignment; there is no carrier retry adapter, retry counter, or carrier response contract. No fake carrier or new retry business rule was introduced. Carrier success/failure and attempt-history verification remain unavailable.
- LA-11–LA-13 remain **BLOCKED** under the global master-catalog authorization boundary; LA-14 remains **SKIPPED — Excluded by user request**.

### Verification executed

| Command/check | Result |
|---|---|
| Full Org Access `mvn.cmd -q test` | PASS — 72 tests, 0 failures/errors/skips; Maven exited 0. Surefire reported the known shutdown delay from the unavailable `logstash:5000` appender. |
| Catalog focused: `CatalogApiIntegrationTest,StoreLocationAdminIntegrationTest,ProductGlobalCatalogAuthorizationIntegrationTest` | PASS — 10 tests, 0 failures/errors/skips. |
| Inventory `InventoryApiIntegrationTest` | PASS — 6 tests, 0 failures/errors/skips. |
| Order focused: `StoreManagerAccessTest,ReviewAuthorizationTest,GlobalStoreAssignmentTest,GlobalStoreAssignmentPersistenceTest` | PASS — 11 tests, 0 failures/errors/skips. |
| Fulfillment focused: `FulfillmentAuthorizationTest,AssignedPartnerAccessTest,DeliveryPartnerEligibilityTest` | PASS — 12 tests, 0 failures/errors/skips. Includes the unknown-partner denial assertion added in `DeliveryPartnerEligibilityTest`. |
| Relevant backend tests combined | PASS — 111 tests, 0 failures/errors/skips; tests used isolated H2/mock HTTP fixtures. |
| Frontend `node.exe --test` | 220 passed, 1 failed out of 221. The pre-existing unrelated `src/utils/authenticatedCart.test.js:65` assertion still expects 2 requests but observes 3. |
| `npm.cmd run lint` | PASS. |
| `npm.cmd run build` | PASS; existing large JavaScript chunk warning remains. |
| `git diff --check` (both repositories) | PASS. |
| Read-only local service check | Frontend http://localhost:5175/ returned HTTP 200. Gateway http://localhost:8082/actuator/health returned HTTP 200, but its response did not expose a simple component UP status; no downstream health claim is made. No service was restarted. |

No local service was restarted. No MySQL query or write was performed. All test writes used isolated H2 fixtures; no credentials, shared business data, production/VPS services, carrier integrations, payments, notifications, or dispatch operations were touched. Existing unrelated working-tree changes were preserved.

### All-case status reconciliation

**PASS 29, FAIL 0, PARTIAL 1, BLOCKED 4, SKIPPED 1 (35 total).** Blocked cases remain LA-11, LA-12, LA-13, and LA-27. LA-28 remains partial. LA-14 remains skipped. No live provisioning/browser persistence result is claimed.

## Follow-up: isolated staff provisioning persistence — 2026-10-25

- Added `Ecom-Org-access/src/test/java/com/metaarch/orgaccess/identity/StaffProvisioningPersistenceTest.java`. It runs `IdentityService.create` against a Spring embedded H2 database, then reads the records back through the JPA repositories and verifies independent Global Admin and Hyderabad Location Admin roles/scopes, no store assignment, server-attributed `assignedBy`, and audit entries. Test-only passwords are encoded through a mock; no credential is printed or stored outside the ephemeral test database.
- This is isolated service/persistence evidence, not a browser login, authenticated HTTP provisioning workflow, or MySQL result. The real Super Admin browser prerequisite remains an owner-authorized test account plus a browser-connected disposable Org Access runtime/database. No account was created in the running application and no service was restarted.
- Existing API authorization tests still establish that only Super Admin can use staff-management endpoints; Global Admin and Location Admin are denied. The hierarchy and role permissions were not broadened.
- Location validation still has no authoritative registry or active-location API. The H2 test verifies the assigned `hyderabad` key is persisted, not that the location is canonical or active. The required location identity/status contract remains unresolved.
- LA-27 remains **BLOCKED**: H2/API partner eligibility and assignment persistence coverage exists, but no isolated browser-to-service setup with disposable order and partner records is available for UI save/reload. No real order or shipment was changed.
- LA-28 remains **PARTIAL**: application behavior is partner reassignment after a failed assignment; no carrier retry interface, attempt-history contract, or safe fake-carrier extension point was found. No new retry semantics or schema was introduced.
- LA-11–LA-13 remain **BLOCKED**; LA-14 remains **SKIPPED — Excluded by user request**.

### Verification for this follow-up

| Command/check | Result |
|---|---|
| `mvn.cmd -q '-Dtest=StaffProvisioningPersistenceTest' test` | PASS — 1 test, 0 failures/errors/skips; embedded H2 only. Maven exited 0 after the known Logstash appender shutdown delay. |
| `mvn.cmd -q '-Dtest=IdentityServiceTest,UserControllerTest,StaffProvisioningPersistenceTest' test` | PASS — 43 tests, 0 failures/errors/skips; Maven exited 0. Surefire logged its existing delay waiting for unavailable `logstash:5000`. |
| `npm.cmd run lint` | PASS. |
| `npm.cmd run build` | PASS; existing large-chunk warning remains. |
| `node.exe --test` | 220 passed, 1 failed out of 221. Existing unrelated failure: `src/utils/authenticatedCart.test.js:65`, expected 2 requests but observed 3. Not changed in this task. |
| `git diff --check` (frontend and Org Access) | PASS; frontend reports only existing LF-to-CRLF working-copy warnings. |

No MySQL query/write, runtime login, service restart, production/VPS access, payment, carrier call, notification, or dispatch was performed. Overall case totals remain **PASS 29, FAIL 0, PARTIAL 1, BLOCKED 4, SKIPPED 1 (35 total)**; no case status changes based on this service-level test.

## Location-scoped product authority implementation — 2026-10-25

### Changes

- Added Catalog migration V34__add_location_owned_products.sql, which adds nullable products.owner_location and an index. Existing products remain global catalog records with a null owner; no existing product row is rewritten.
- Added authenticated /api/v1/location-products list/create/update/availability operations. The backend derives ownership from the signed SCOPE_LOCATION authority, requires at least one persisted store in that location, checks every requested store against its persisted location, and ignores client attempts to set product owner/global publication fields.
- Location Admin-created products are marked with their owning location and associated only with selected stores in that location. Product publication remains ACTIVE; local availability is stored on the existing store-product mappings and does not change global publication status.
- Location Admin can edit only products owned by the signed location. Shared products already mapped to an assigned-location store remain readable, but their master product, variants, and images are read-only. Store-product writes cannot move an owned product into another location.
- Scoped variant/image create, update, delete, and read authorization now checks the owning product. Product list, category-product list, and product detail requests made by Location Admin are filtered/checked against owned or assigned-store-mapped products. Anonymous storefront reads retain their existing behavior.
- Added Location Admin product creation/edit UI, assigned-store selection, availability control, and calls to the scoped APIs. Shared products do not show edit/status controls. Existing other-role product forms and global product endpoints retain their prior paths.

### Verification

| Command/check | Result |
|---|---|
| mvn.cmd -q '-Dtest=LocationProductAuthorizationIntegrationTest,ProductGlobalCatalogAuthorizationIntegrationTest' test | PASS — 6 tests, 0 failures/errors/skips, H2. Covers location create/edit, same-location visibility, cross-location create/update/read denial, tampered owner/global fields, local availability, variant/image create/update/delete, and global-admin compatibility. |
| mvn.cmd -q test in catalog-service | PASS — 31 tests, 0 failures/errors/skips across 10 test classes. |
| npm.cmd run lint | PASS. |
| npm.cmd run build | PASS; existing large JavaScript chunk warning remains. |
| node.exe --test | 220 passed, 1 failed out of 221. The existing src/utils/authenticatedCart.test.js:65 retry-count assertion still expects 2 requests but observes 3; this is unrelated and unchanged. |
| git diff --check (frontend and backend) | PASS; frontend has one existing line-ending conversion warning. |

### Remaining runtime verification

- LA-11, LA-12, and LA-13 are **PARTIAL**, not PASS: backend authorization and persistence passed in H2 and the UI compiles, but authenticated browser workflows and MySQL readback have not run.
- At the time of this earlier section, V34 had not been applied and Catalog had not been restarted. See the newer Product page runtime follow-up below.
- No isolated browser-connected Catalog database/runtime was available in this run. The running shared database and services were left untouched; no live product, variant, image, store mapping, or other business row was created or changed.
- The migration is additive and nullable, but must be applied and verified in an isolated local schema before an authenticated browser save/readback retest. Do not mark LA-11–LA-13 PASS until that retest succeeds.
- LA-27 remains **BLOCKED** pending browser save/reload with disposable order and partner fixtures. LA-28 remains **PARTIAL** pending a defined carrier retry contract. LA-14 remains **SKIPPED — Excluded by user request**.

Current totals: **PASS 29, FAIL 0, PARTIAL 4 (LA-11, LA-12, LA-13, LA-28), BLOCKED 1 (LA-27), SKIPPED 1 (LA-14), total 35.** No browser or MySQL result is claimed.





## Location Admin Products page runtime follow-up — 2026-10-25

- Reproduced the page error: the authenticated browser request to `/catalog-service/api/v1/location-products?size=200` returned HTTP 403, while the signed session identity had `ROLE_LOCATION_ADMIN` and `SCOPE_LOCATION:hyderabad`.
- Root cause: the running Catalog process was serving an older build that did not include the location-products authorization route. The updated source and isolated Catalog tests were already present, but the service had not been rebuilt/reloaded.
- Confirmed the active Catalog listener was the Catalog Service on port 8089 (PID 45020). Applied only the additive V34 schema change to the local `catalog_service` database: nullable `products.owner_location` and its index. No product/business rows were changed.
- Rebuilt Catalog and restarted only that service on its existing port/profile. The application started successfully against the configured local Config Server and MySQL schema. Gateway and other service processes were left running.
- Reloaded the authenticated browser at `/admin/products`. The scoped products endpoint returned HTTP 200 and the page displayed 21 product records; the “sign in again” error and empty state were absent. The list remains location-scoped by the server query. Existing shared catalog products are displayed read-only; this check did not create or edit a product.
- LA-11–LA-13 remain **PARTIAL** because browser writes, variants/images save-and-readback, and persistence verification were not performed. No status changes are made from this read-only check. LA-14 remains **SKIPPED**; LA-27 remains **BLOCKED**; LA-28 remains **PARTIAL**.
- This check did not expose or record any credentials or session token. No payment, delivery, shipment, or notification operation was performed.

## Location Admin product create/edit/delete verification — 2026-10-25

- Added a Location Admin `DELETE /api/v1/location-products/{id}` endpoint. It requires the Location Admin role and checks the product's persisted owner location against the signed location scope before deleting only that product's mappings, variants, images, and product row. The existing global product delete route remains for global catalog roles.
- Added a Delete action only for location-owned products in the Location Admin UI. Shared catalog products remain read-only. The delete confirmation calls the new scoped endpoint.
- Fixed the Location Admin edit form: list display fallbacks such as `/src/assets/...` are not valid image URLs and had blocked edits for products with no saved image. The Location Admin editor now uses only an explicitly saved product image URL, or a blank field.
- Browser test used a uniquely tagged disposable product under the existing Hyderabad Main Store and an existing category. `POST /location-products` returned **201**; its variant create returned **201**. Editing the product returned **200**, and editing its variant returned **200**. After full page reload, the edited product appeared in the list. The product then deleted through the UI and `DELETE /location-products/{id}` returned **204**; the next scoped list no longer contained it.
- A first edit attempt was blocked by the invalid fallback image URL before any update request was sent. After the Location Admin form fix, the same edit completed and persisted.
- Read-only MySQL cleanup check after delete found **0** rows for the test product, store mapping, variant, and image. Existing catalog products and store rows were not edited or removed.
- Added authorization assertions for same-location deletion (**204**), cross-location deletion (**403**), unauthenticated deletion (**401**), and global-admin denial on the Location Admin-specific route (**403**). Focused H2 integration suite: **4 tests passed, 0 failed/errors/skipped**.
- Catalog `mvn.cmd -q test`: **31 passed, 0 failures/errors/skips**. Focused `LocationProductAuthorizationIntegrationTest`: **4 passed, 0 failures/errors/skips**. Frontend `npm.cmd run lint`: **PASS**. Frontend `npm.cmd run build`: **PASS** (existing large-chunk warning). `git diff --check` passed in both repositories. Frontend `node.exe --test`: **220 passed, 1 failed of 221**; existing unrelated `src/utils/authenticatedCart.test.js:65` expected 2 requests but observed 3.
- Browser screenshot evidence: `location-admin-products-create-edit-delete-2026-10-25.png`.
- Updated current totals: **PASS 30, FAIL 0, PARTIAL 3, BLOCKED 1, SKIPPED 1 (35 total)**. LA-11 is now PASS. LA-12 and LA-13 remain PARTIAL because local availability and browser image save/readback were not both tested; LA-27 remains BLOCKED; LA-28 remains PARTIAL; LA-14 remains SKIPPED.

## LA-12, LA-13, LA-14, and LA-27 follow-up — 2026-10-25

This is the latest run and supersedes earlier statuses for these four cases. The latest task explicitly reopened LA-14, which had previously been excluded. LA-11 remains PASS. No payment, order status, shipping, carrier, dispatch, or notification action was performed.

### LA-12 — Product status: PARTIAL

- Used the authenticated Hyderabad Location Admin session and a uniquely named product created for this test. The Location Admin availability action sent `PATCH /catalog-service/api/v1/location-products/{id}/availability` and returned **200** when switching availability off and back on.
- After a full browser reload with availability off, the row showed **Make available**, confirming the saved location-level value was read back. The product's global publication status remained **Active**; no global status permission was added.
- Catalog H2 regression tests verify true/false persistence, unchanged global status, invalid null value (**400**), cross-location request denial (**403**), and anonymous denial (**401**).
- The browser write used the Catalog service's configured local MySQL schema instead of an isolated test schema. The behavior passed, but the required isolated-write condition was not met, so this case remains PARTIAL.

### LA-13 — Variants and images: PARTIAL

- The browser created a variant and a local development image URL for the test-owned product; both create requests returned **201**. Editing the variant and image returned **200**.
- After a full reload, the edit form read back the updated variant label and price and the updated image URL. The local image URL returned **200** from the Vite server.
- Catalog H2 tests verify authorized same-location reads/writes, cross-location denial (**403**), anonymous mutation denial (**401**), and rejection of a relative display fallback path as an image URL (**400**). This prevents `/src/assets/...` display-only fallbacks from being treated as saved image URLs.
- The browser write used configured local MySQL rather than an isolated test schema. The behavior passed and the fixture was removed, but the required isolation condition was not met, so this case remains PARTIAL.

### LA-14 — Store-product mappings: PARTIAL

- Opened **Manage stores** for the disposable Location Admin product. The editor showed only Hyderabad stores. Added `SR Nagar Store` and saved; the mapping create returned **201**.
- After full browser reload, reopening the editor showed both `Hyderabad Main Store` and `SR Nagar Store`. Removed only the mapping created for `Hyderabad Main Store`; delete returned **204**. Reopened the editor and confirmed only `SR Nagar Store` remained.
- Catalog H2 regression tests verify same-location mapping create/update/read/delete, cross-location create/update/read denial (**403**), anonymous create denial (**401**), and post-delete readback.
- This browser mapping save/unmap used configured local MySQL rather than an isolated test schema. The test-owned product and mappings were removed, but the required isolation condition was not met, so LA-14 remains PARTIAL.

### LA-27 — Delivery partner assignment: PARTIAL

- A browser test used synthetic UUID order/shipment records and an active same-store partner served by in-memory Playwright HTTP route mocks. The UI submitted a partner assignment, received mocked **200**, showed its success message, and after reload displayed the mocked currently assigned partner.
- A second synthetic flow returned mocked **403**; the UI displayed the error and did not show a success message. No live shipment or delivery operation was made.
- Fulfillment H2 tests independently verify Location Admin assignment persistence through the service API and readback, active same-store partner validation, cross-store denial, and anonymous denial. The H2 fixture and browser mock fixture were separate; no browser-connected isolated H2 Fulfillment stack was available. Therefore browser-to-service database persistence remains unverified and LA-27 is PARTIAL.

### Test data and database scope

- The running Catalog service uses the configured local MySQL `catalog_service` schema. The browser test created, updated, mapped, and deleted one uniquely tagged test-owned product using an existing Hyderabad category and store. No existing product, store, order, or customer row was edited or removed.
- The test mapping was explicitly unmapped, then the product was deleted through the Location Admin UI; the API returned **204** and the refreshed location-product list no longer showed it. Subsequent variant/image reads for its deleted parent returned **404 Product not found**. No direct SQL cleanup check was performed in this run.
- This Catalog browser run was not isolated from the configured local schema. Treat these results as local runtime verification with test-owned data and completed application-level cleanup, not as disposable-schema verification. Database-level absence of orphan child rows was not independently checked.

### Regression results

| Command | Result |
|---|---|
| `mvn.cmd -f catalog-service/pom.xml test` | PASS — 32 tests, 0 failures/errors/skips. |
| `mvn.cmd -f catalog-service/pom.xml '-Dtest=LocationProductAuthorizationIntegrationTest' test` | PASS — 5 tests, 0 failures/errors/skips; rerun after the final mapping update/readback assertions. |
| `mvn.cmd -f fulfillment-service/pom.xml '-Dtest=FulfillmentAuthorizationTest,AssignedPartnerAccessTest,DeliveryPartnerEligibilityTest' test` | PASS — 12 tests, 0 failures/errors/skips. |
| `npm.cmd run lint` | PASS. |
| `npm.cmd run build` | PASS; existing large JavaScript chunk warning remains. |
| `node.exe --test` | FAIL — 220 passed, 1 failed of 221. Existing unrelated `src/utils/authenticatedCart.test.js:65` expected 2 requests but observed 3; cart behavior was not changed in this task. |
| `git diff --check` (frontend and backend) | PASS after this report update. |

Current totals: **PASS 30, FAIL 0, PARTIAL 5 (LA-12, LA-13, LA-14, LA-27, LA-28), BLOCKED 0, SKIPPED 0 (35 total).** LA-12/13/14 need a repeat browser run against an isolated test schema. LA-27 still needs a browser-connected isolated Fulfillment runtime to verify actual service persistence through the UI. LA-28 still needs a defined carrier retry contract and isolated adapter to test carrier outcomes.

## Full Location Admin retest — 2026-10-25

This is the latest all-case reconciliation. It uses fresh authenticated read-only browser evidence from this run, plus the isolated H2/UI evidence described in the preceding sections. It supersedes earlier status summaries. LA-14 is included because the later product-mapping task reopened it after the earlier exclusion request.

### Runtime and data safety

- The existing browser session was authenticated as the Hyderabad Location Admin. The workspace identity and location were visible, and the session remained active while navigating the portal.
- Frontend `http://localhost:5175`, gateway `:8082`, Catalog `:8089`, Inventory `:8095`, Order `:3311`, Fulfillment `:3315`, and MySQL `:3306` were already listening. No service was restarted and no port/configuration was changed.
- Read-only navigation succeeded for Dashboard, Stores, Products, Banners, Inventory, Orders, Delivery, Coupons, and Reports. The browser showed no access-denied alert on these screens.
- Sanitized API summaries: Stores **200**, six stores, all assigned to Hyderabad; Products **200**, 21 records; Inventory list **200**, 153 records across six assigned store IDs; Orders list **200**, 41 records across four store IDs, all among the assigned store IDs; Banners **200**, zero records; Coupons **200**, zero records.
- Inventory detail opened in the UI and its GET returned **200**. The detail exposed reservation and low-stock threshold fields. Order detail opened read-only and returned **200** with item and fulfillment/shipment fields. No order or inventory action was activated. The response contained customer address/contact data, which was not copied into this report or retained as a test artifact.
- Reports rendered Hyderabad totals for 41 orders and five store rows. `Export JSON` triggered a successful browser download; the local downloaded file was inspected only for its top-level structure and row counts, then removed because it contained order rows. No report data was copied here.
- Sign out navigated to `/login`, removed the session token from browser storage, and direct navigation to `/admin` redirected to `/login`.
- This run made no MySQL query or write and did not create, edit, delete, adjust, cancel, ship, or dispatch business records. The Catalog, Inventory, Order, and Fulfillment write/authorization assertions below ran only in isolated H2 test contexts. Existing shared MySQL data was left untouched.

### Results for all 35 original cases

| ID | Use case | Status | Latest evidence / remaining condition |
|---|---|---|---|
| LA-01 | Login through Team Login | PASS | Authenticated Hyderabad Location Admin session verified; sign-out and protected-route redirect verified. |
| LA-02 | View location-scoped dashboard | PASS | Dashboard loaded with the Hyderabad-scoped backend data; route/API access remained successful. |
| LA-03 | View assigned-location stores | PASS | Stores API returned six Hyderabad stores only. |
| LA-04 | Create store within applicable location | PASS | Store create and location authorization covered by isolated Catalog tests and earlier disposable-runtime verification; no shared store was written in this retest. |
| LA-05 | Edit store profile and operational information | PASS | Update path and scope covered by isolated Catalog tests and earlier disposable-runtime verification. |
| LA-06 | Set store coordinates/address | PASS | Address/coordinate validation and persistence covered by the store workflow evidence already recorded above; no live store was changed in this retest. |
| LA-07 | Configure delivery/pickup information | PASS | Delivery/pickup configuration path covered by the existing isolated Catalog verification; no live store was changed in this retest. |
| LA-08 | Change store active/closed status | PASS | Status update is covered by the existing store update test evidence; no live store was changed in this retest. |
| LA-09 | Delete store through available controls | PASS | Delete authorization and cleanup were covered in the prior disposable store workflow; no existing store was deleted in this retest. |
| LA-10 | View location-scoped products | PASS | Products screen/API returned 21 location-visible records; shared catalog items remain read-only under the location role. |
| LA-11 | Create/edit products | PASS | Earlier authenticated test created, edited, read back, and deleted its uniquely tagged location-owned product; isolated authorization tests also passed. |
| LA-12 | Change product active/draft status | PARTIAL | Location-level availability changed and read back in the authenticated UI; the browser write used the configured local Catalog schema rather than an isolated disposable schema. Global publication status correctly remains outside Location Admin authority. |
| LA-13 | Manage product variants/images | PARTIAL | Earlier authenticated create/edit/reload evidence exists, but its browser writes used configured local MySQL rather than an isolated schema. H2 authorization tests passed. |
| LA-14 | Manage store-product mappings | PARTIAL | Earlier authenticated mapping save/readback/unmap evidence exists, but its browser writes used configured local MySQL rather than an isolated schema. H2 same/cross-location authorization tests passed. |
| LA-15 | Create location/store-scoped banners | PASS | Isolated Catalog workflow verified create/readback, location scope, and denial behavior; current banner list returned 200. |
| LA-16 | Edit/disable campaigns | PASS | No separate campaign service/entity exists; the supported banner workflow was created, edited, disabled, and read back in the isolated Catalog QA schema. |
| LA-17 | View inventory by store | PASS | Inventory list returned 153 records across six assigned Hyderabad stores only. |
| LA-18 | Create/edit inventory records | PASS | Isolated H2 API test verified same-location create/update/readback, cross-location denial, and anonymous denial. |
| LA-19 | Adjust available stock | PASS | Isolated H2 test verified stock movement persistence, invalid overdraw rejection, and cross-location denial. No shared stock was changed. |
| LA-20 | Inspect reservations and stock thresholds | PASS | Authenticated UI inventory detail GET returned 200 and displayed reservation and threshold fields; H2 tests cover same-location allow and cross-location/anonymous denial. |
| LA-21 | View location-scoped orders | PASS | Orders API returned 41 rows; all four referenced stores were within the assigned store set. |
| LA-22 | Search/filter orders | PASS | Orders screen and filters were available with the authenticated 41-row list; prior focused filter checks remain applicable. No order state was changed. |
| LA-23 | Inspect order details and fulfillment | PASS | Authenticated order detail GET returned 200 and displayed line-item and fulfillment/shipment fields. Read-only only. |
| LA-24 | Confirm/process eligible orders | PASS | Isolated H2 HTTP test verified eligible same-location transition/readback, cross-location denial, anonymous denial, and invalid-transition rejection. No live order was changed. |
| LA-25 | Perform applicable packing/shipping actions | PASS | Supported fulfillment transition behavior has isolated service/integration coverage; this browser retest did not invoke a real shipment, carrier, or notification. |
| LA-26 | Open delivery-partner assignment | PASS | Assignment workflow is present and covered by the existing isolated fulfillment/UI workflow evidence; no live order was assigned in this retest. |
| LA-27 | Select active partner from relevant store | PARTIAL | Browser UI test used HTTP mocks and showed assignment/readback; H2 verifies persisted same-store assignment and cross-store/anonymous denial. A browser connected to an isolated Fulfillment database was unavailable. |
| LA-28 | Retry failed shipment where permitted | PARTIAL | Failed-assignment handling and partner reassignment are tested. The application has no defined carrier retry adapter/contract, so carrier success/failure and retry history cannot be verified. |
| LA-29 | Access delivery management module | PASS | Authenticated Delivery route loaded. Fulfillment APIs/tests cover supported scoped behaviors; no real delivery was dispatched. |
| LA-30 | Configure local coupon records | PASS | Isolated Catalog QA schema verified inactive location-level coupon create and readback; current coupon list returned 200. |
| LA-31 | Select coupon store scope | PASS | Location Admin coupon policy is location-level only; isolated tests verify forged store-scoped writes are denied while Global Admin store scope remains allowed. |
| LA-32 | View reports for location/stores | PASS | Reports page showed Hyderabad metrics and store-level aggregation from the scoped 41-order result. |
| LA-33 | Filter operational reports | PASS | Reports controls were available with the Hyderabad location fixed and its assigned-store selector. Prior focused report-filter assertions passed; no business records were mutated. |
| LA-34 | Export JSON report | PASS | Authenticated `Export JSON` completed a download; the artifact had `filters`, `summary`, `storePerformance`, and `orders` sections, with 5 store rows and 41 orders. The downloaded data file was then removed. |
| LA-35 | Logout | PASS | Sign out cleared browser token storage, navigated to `/login`, and `/admin` remained protected. |

### Current totals and regression results

**PASS 30, FAIL 0, PARTIAL 5, BLOCKED 0, SKIPPED 0 — 35 total.** The partial cases are LA-12, LA-13, LA-14, LA-27, and LA-28. The first three need repeat browser persistence verification in an isolated Catalog schema. LA-27 needs browser-to-service persistence against an isolated Fulfillment database. LA-28 needs an implemented carrier retry contract and isolated adapter.

| Command/check | Result |
|---|---|
| `node.exe --test` (frontend) | FAIL — 220 passed, 1 failed of 221. `src/utils/authenticatedCart.test.js:65` expected 2 requests but observed 3; no cart code was changed in this retest. |
| `npm.cmd run lint` | PASS — exit 0. |
| `npm.cmd run build` | PASS — production build completed; existing large-chunk warning remains. |
| `mvn.cmd -f catalog-service/pom.xml test` | PASS — 32 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f inventory-service/pom.xml test` | PASS — 18 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f order-service/pom.xml test` | PASS — 109 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f fulfillment-service/pom.xml test` | PASS — 24 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f Ecom-Org-access/pom.xml "-Dtest=ScopeAuthorizationServiceTest,DeliveryPartnerControllerTest,UserControllerTest" test` | PASS — 28 tests, 0 failures/errors/skips; Maven exited 0 after the existing unavailable Logstash appender shutdown delay. |
| `git diff --check` (frontend and backend) | PASS — frontend emitted only its existing LF-to-CRLF normalization warning. |

Backend total: **211 tests passed, 0 failed/errors/skipped** across the four full service suites and focused Org Access suite. The frontend automated suite has one unrelated failing assertion, so the complete regression set is not green. Browser and H2 evidence do not prove current MySQL write persistence; no direct MySQL access was performed in this retest.

## Final retest of the five remaining cases — 2026-10-25

This addendum supersedes the preceding 30 PASS / 5 PARTIAL status for LA-12, LA-13, and LA-14, and supersedes the earlier frontend cart test failure. No other case status changed.

### Isolated Catalog runtime

- Used a temporary file-backed H2 database at C:\Users\91779\AppData\Local\Temp\location-admin-catalog-qa-20261025-01 with Hibernate create/drop and the Catalog test configuration. The test runtime used the existing Catalog port 8089; the frontend stayed on 5175. An ephemeral Playwright route forwarded only Catalog browser requests to that actual H2-backed Catalog process.
- The authenticated browser session was the Hyderabad Location Admin. Browser tests used the real Location Admin UI and API clients. A forged cross-location request was sent from that browser session and evaluated by the Catalog backend.
- H2 was queried directly through the H2 shell for persistence readback. Shared MySQL was not queried or changed.
- Created disposable fixtures: category 3b78ea5e-2b7c-4a9e-b635-000000000001; Hyderabad store qa-la-store-20261025-01; Chennai store qa-la-store-20261025-02; product c583963c-8877-40fc-89de-6a9442bdfd2a; variant 5584a70b-05b9-4023-b200-5ee84e381ede; image 03cecc09-d84a-4420-9272-940103f32e90; mapping 45f6329d-1c4c-4492-acbe-f51d40d8c7ac.
- After cleanup, SQL showed zero product, variant, image, and mapping rows for the test product. The exact two test stores and test category were then deleted from H2; SQL confirmed zero fixture rows remained. The temporary H2 database and setup files were removed.

### Updated case results

| ID | Status | Browser, API, and persistence evidence |
|---|---|---|
| LA-12 | PASS | Created a Hyderabad location-owned product through the UI (POST location-products 201). Changed its local store availability in the UI (PATCH location-products/{id}/availability 200). After a full page reload, the UI showed the opposite availability action. Direct H2 readback showed the store mapping available=false while the product publication status remained ACTIVE. A forged request assigning the product to the Chennai fixture returned 403 and the location product list contained no orphan product. |
| LA-13 | PASS | The UI created a product variant and image (POST variants 201; POST images 201), then edited both through the same form (PUT variant 200; PUT image 200). After reload, authenticated fresh GETs for the product, variants, and images all returned 200 and showed the edited variant name/price and image alt text. Direct H2 readback confirmed the rows. The image was an explicitly entered local application asset URL, not a display fallback. Cross-location product creation was denied with 403 before persistence. |
| LA-14 | PASS | The product UI mapped the fixture product to its assigned Hyderabad store. Authenticated mapping read returned 200; changing mapping availability saved with PUT 200 and a fresh read showed the saved value. The UI then unmapped the store with DELETE 204; after reload, the mapping read returned 200 with zero rows. The store selector exposed only the assigned Hyderabad fixture. Cross-location assignment was rejected with 403, with no product or mapping created. |
| LA-27 | PARTIAL | Existing assignment unit/API tests remain green, but the required browser-connected isolated Fulfillment runtime with disposable order and partner fixtures was not available. No order assignment, shipment, or notification was initiated in a shared runtime. |
| LA-28 | PARTIAL | No carrier client/adapter or approved retry contract exists. Retryable versus permanent failures, manual/automatic mode, attempt limit and delay, idempotency for timeout-after-acceptance, persisted attempt history, and UI outcome states remain unspecified. No retry implementation or real carrier call was made. |

### Cart regression

The extra request was traced to the intended recovery sequence. The first request transfers the guest quantity and the simulated server commits it before its response is lost. The retry reuses the same idempotency key, so that transfer is not applied twice; the still-pending user add then uses a distinct key and is applied once. The test now asserts the three calls, key reuse/distinction, and final quantity of three. Runtime cart code and retry behavior were not changed.

### Final totals and verification

The final 35-case totals are **PASS 33, FAIL 0, PARTIAL 2, BLOCKED 0, SKIPPED 0**. The remaining partial cases are LA-27 and LA-28; the other 30 previously passing cases retain their latest reported results.

| Command/check | Result |
|---|---|
| node.exe --test | PASS — 221 tests, 0 failures. |
| npm.cmd run lint | PASS — exit 0. |
| npm.cmd run build | PASS — Vite production build; existing large-chunk warning remains. |
| Full Catalog Service Maven suite | PASS — 32 tests, 0 failures/errors/skips. |
| Full Inventory Service Maven suite | PASS — 18 tests, 0 failures/errors/skips. |
| Full Order Service Maven suite | PASS — 109 tests, 0 failures/errors/skips. |
| Full Fulfillment Service Maven suite | PASS — 24 tests, 0 failures/errors/skips. |
| Focused Org Access Maven suite | PASS — 28 tests, 0 failures/errors/skips. |
| Backend total | PASS — 211 tests, 0 failures/errors/skips. |
| git diff --check (frontend and backend) | PASS. |

### Runtime restoration and limits

The temporary H2 Catalog process was stopped after cleanup. The normal Catalog service was restored using the existing launcher on port 8089 and passed its health check. The local gateway on port 8082 returned HTTP 200 for the Catalog route after service discovery refreshed. No gateway, Inventory, Order, Fulfillment, or unrelated portal process was restarted. LA-27 and LA-28 remain partial for the specific prerequisites above; this retest does not claim those cases or the full QA suite are complete.

## LA-27 / LA-28 follow-up — 2026-10-25

This follow-up inspected current assignment and retry implementation, checked the local runtime/isolation prerequisites, and reran regression tests. It preserves the previous all-case results except where new evidence changes them. No application source or runtime configuration was changed.

### LA-27 — Browser-connected assignment persistence: PARTIAL

- The assignment UI at `src/pages/AdminWorkspace/DeliveryPartnerAssignment.jsx` loads the order and items, reads the shipment, filters active partners to the order's exact store, creates/loads a shipment, and saves through the Fulfillment assignment API. Success is shown only after the assignment request resolves; failed saves remain errors. On reload, the UI obtains the shipment from the backend again.
- Backend `ShipmentController` verifies partner eligibility through Org Access and checks shipment scope; `ShipmentService` persists the assignment and returns the saved shipment. Existing Fulfillment H2 tests cover persistence/readback, same-store eligibility, cross-store denial, and unauthenticated denial. Frontend workflow tests cover assignment success and failed-save behavior.
- A browser-connected isolated run was not safe or available. The active Fulfillment listener is on port 3315 (PID 34424), the configured main datasource is the shared local MySQL `fulfillment-service` schema, and there is no isolated test MySQL directory or listener on port 14306. The existing `run-all-services.ps1 -IsolatedTest` requires a separate loopback MySQL server plus an expected database UUID and moves services to a separate port range. It cannot satisfy the prompt's preserve-ports constraint with the current environment. Fulfillment's H2 configuration is test-scoped and is not a browser-runnable isolated service/fixture launcher.
- No order, partner, shipment, assignment, or notification was created or changed. We did not submit an assignment against the shared runtime. Thus there is no fresh browser HTTP status or database readback evidence; the existing mocked-browser and separate H2 evidence remains the limit. LA-27 stays PARTIAL.

### LA-28 — Carrier retry contract: PARTIAL

- Current code does not call a carrier adapter when the UI says “Retry delivery.” It reassigns an eligible partner to a shipment in FAILED state; the backend moves that shipment to CREATED and persists the new assignment. The frontend then attempts to append a timeline event. This is partner reassignment/reopening, not a carrier API retry.
- Inspection of Fulfillment controllers, services, shipment entity, migrations, configuration, and project documentation found no carrier client/adapter or documented retry policy. The shipment schema has no retry attempt history. No code was changed and no retry was attempted.
- Product/business approval is required to define: retryable and permanent carrier outcomes; maximum attempts and whether the initial call counts; backoff and jitter; idempotency/reconciliation for timeout-after-acceptance; persisted attempt fields and safe error detail; automatic versus manual retry; allowed roles; and UI states for pending, success, permanent failure, and exhaustion. Until these are approved, implementing “carrier retry” would invent operational behavior. LA-28 stays PARTIAL.

### Verification rerun

| Command/check | Result |
|---|---|
| `node.exe --test` (frontend) | PASS — 221 tests, 0 failures. |
| `npm.cmd run lint` | PASS — exit 0. |
| `npm.cmd run build` | PASS — production build completed; existing large JavaScript chunk warning remains. |
| `mvn.cmd -f fulfillment-service/pom.xml test` | PASS — 24 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f catalog-service/pom.xml test` | PASS — 32 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f inventory-service/pom.xml test` | PASS — 18 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f order-service/pom.xml test` | PASS — 109 tests, 0 failures/errors/skips; H2. |
| `mvn.cmd -f Ecom-Org-access/pom.xml "-Dtest=ScopeAuthorizationServiceTest,DeliveryPartnerControllerTest,UserControllerTest" test` | PASS — 28 tests, 0 failures/errors/skips. Maven exited 0; unavailable Logstash appender emitted a shutdown warning/delay. |
| `git diff --check` (frontend and backend) | PASS — frontend reported only its existing LF-to-CRLF normalization warning. |

The rerun totals 211 backend tests passed with no reported failures, errors, or skips, plus 221 frontend tests passed. These automated suites do not replace LA-27's missing browser-to-isolated-database evidence or provide an approved LA-28 carrier contract.

### Final case totals

**PASS 33, FAIL 0, PARTIAL 2, BLOCKED 0, SKIPPED 0 — 35 total.** LA-27 remains PARTIAL until an isolated browser-connected Fulfillment runtime with disposable order and partner fixtures is available on an approved port/database setup. LA-28 remains PARTIAL until the retry policy is approved and an isolated carrier adapter/test server can verify its behavior. The full 35-case suite is not complete.

## LA-27 runtime fix and LA-28 policy proposal — 2026-10-25

This addendum supersedes the earlier LA-27 PARTIAL result. It does not change LA-28's status or claim the full 35-case suite is complete.

### LA-27 — PASS

**Root cause:** `DeliveryPartnerEligibility.verifiedRequest` loaded a shipment and immediately read `shipment.getFulfillment().getStoreId()`. The Fulfillment association is lazy, and the method ran outside a transaction. The real assignment endpoint therefore returned HTTP 500 after the UI had successfully created the isolated fulfillment and shipment. Existing tests mocked `DeliveryPartnerEligibility`, so they did not exercise that lookup boundary.

**Fix:** added `@Transactional(readOnly = true)` to `DeliveryPartnerEligibility.verifiedRequest` so the shipment and its fulfillment remain available while the authoritative partner/store checks run. Added `DeliveryPartnerEligibilityHttpTest`, which exercises the actual controller, security, service, H2 persistence, and a loopback partner directory. It verifies the forwarded bearer identity, persisted same-location assignment, cross-store and cross-location denials, and anonymous denial.

**Browser/API evidence:** used the actual Location Admin assignment UI in Playwright with a test-only Hyderabad Location Admin JWT and uniquely tagged disposable fixture data. The order and `/me` browser dependencies were test fixtures, the partner directory and Catalog location lookup were loopback fixtures, and browser Fulfillment requests were forwarded to the real Fulfillment application on temporary port 13315 backed by file H2. Notification API calls were intercepted; Fulfillment event dispatch was disabled. No live partner directory, Order service, notification service, shared MySQL, or real shipment operation was used.

- UI loaded the fixture order and active partner; a complete fixture delivery estimate was required by existing validation.
- Actual Fulfillment assignment PATCH returned **200**; UI displayed assignment success.
- Full page reload read the saved shipment again; UI still displayed the assigned partner. A fresh API GET returned **200** with the same partner ID/name and shipment status `CREATED`.
- Selecting a stale partner produced actual API **403**; the UI displayed an error and did not show success.
- Forged cross-store partner assignment returned **403**; cross-location order detail returned **403**; unauthenticated shipment read returned **401**. Fresh same-location read remained **200** with the original assignment.
- The first attempt before adding `createdAt` and `estimatedDeliveryMax` to the disposable order fixture was rejected by existing delivery-estimate validation. No source change was needed for that validation.

**Disposable fixture IDs:** order `b7d5ec8d-e82d-43cc-9a0d-274aaa270001`; cross-location order `b7d5ec8d-e82d-43cc-9a0d-274aaa270004`; Hyderabad store `qa-la27-hyd-store`; Chennai store `qa-la27-chn-store`; partner `qa-la27-partner-hyd`; fulfillment `10b5ccad-e6ad-40b4-bfd7-bd8eefbbc32b`; shipment `cd824b63-1e63-4569-8e8a-7c575603b6fe`.

H2 direct readback confirmed the assignment before cleanup. Cleanup removed the tagged shipment, fulfillment, order snapshots, and 12 corresponding outbox events; post-cleanup SQL counts were zero for all these fixture rows. Both temporary service listeners were stopped. The QA-only H2 database files remain as empty schema files under `%TEMP%\location-admin-la27-qa-20261025`; the automatic review layer rejected the file-removal command. No business records remain in that database. The shared Fulfillment schema was only read for its outbox state and launcher schema preflight; no shared business rows were written or changed. The original browser session was restored by signing into Team Login and verified as `locationadmin` with `ROLE_LOCATION_ADMIN` and Hyderabad location scope; no token was recorded.

After the isolated checks, the configured Fulfillment outbox was checked read-only and contained eight `DELIVERED` events with no pending rows. The existing launcher was then used to restart only Fulfillment: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File D:\ecom\Ecom\ecom-backend\run-all-services.ps1 restart fulfillment-service`. It kept port 3315, used the existing backend `.env`, performed its read-only schema preflight, and did not restart the gateway or any other service. The normal service is now healthy on port 3315 (HTTP 200); its startup log records PID 47924 and a successful application start. The compiled `DeliveryPartnerEligibility.class` timestamp is later than the source fix and earlier than that process start. Runtime config retains `ddl-auto=validate` and Flyway disabled. No shared business rows were written or changed by the QA flow.

### LA-28 — PARTIAL; approval still required

No carrier adapter or approved retry contract exists in this project. The UI action currently reassigns an eligible partner and reopens a FAILED shipment; it does not retry a carrier request. I did not change that operational behavior or mark LA-28 PASS.

Proposed contract for owner review (not approved and not implemented): manual retry only; maximum three carrier attempts including the initial attempt; retry network failures and HTTP 408/429/5xx only when the adapter supports a stable idempotency key; do not retry validation, authentication, configuration, or other permanent 4xx failures; use 1s then 2s bounded backoff with jitter for retries within a single manual operation; treat an ambiguous timeout as `UNKNOWN` and require carrier reconciliation or operator review before another attempt; persist attempt ID, shipment ID, timestamps, outcome, carrier status/error code, and idempotency key while excluding secrets and sensitive response bodies; only users authorized to manage the shipment's assigned store may manually retry; show pending, retrying, succeeded, failed, exhausted, and unknown states. Owner approval is required for the retryable error classification, attempt limit, backoff/jitter, timeout reconciliation, history retention, and authorized roles. An adapter/test server must then be supplied or approved before implementation and verification.

### Verification and revised totals

| Command/check | Result |
|---|---|
| `mvn.cmd -f fulfillment-service/pom.xml '-Dtest=DeliveryPartnerEligibilityHttpTest' test` | PASS — 1 integration test, 0 failures/errors/skips. |
| `mvn.cmd -f fulfillment-service/pom.xml test` | PASS — 25 tests, 0 failures/errors/skips. |
| `node.exe --test` | PASS — 221 tests, 0 failures. |
| `npm.cmd run lint` | PASS — exit 0. |
| `npm.cmd run build` | PASS — production build; existing large-chunk warning remains. |
| `git diff --check` (frontend and backend) | PASS — frontend emitted the existing LF-to-CRLF normalization warning. |

**Current 35-case totals: PASS 34, FAIL 0, PARTIAL 1, BLOCKED 0, SKIPPED 0.** LA-27 is PASS. LA-28 remains PARTIAL pending owner approval of the proposed policy and an approved carrier adapter/test contract. The full suite is not complete.

## Fresh Location Admin retest and LA-28 implementation — 2026-10-25

This addendum records a fresh authenticated browser read-only pass, current regression suites, and the approved LA-28 local retry implementation. It preserves the latest case statuses above. No business record was modified. The browser test for LA-28 used isolated network fixtures; backend retry tests used H2. The shared local Fulfillment process was not restarted and its MySQL schema was not migrated.

### Fresh browser evidence

- The existing browser session loaded `http://localhost:5175/admin` as **Location Admin Portal / Hyderabad**. `GET /org-access/api/users/me` returned **200**; no session token or credentials were recorded.
- Dashboard and report pages rendered. The report showed 41 location orders, five store-performance rows, and location metrics. The authenticated stores/products/inventory/orders pages loaded; the displayed stores and orders were labeled with Hyderabad stores.
- Inventory detail was opened read-only. The actual `GET /inventory-service/api/v1/inventories/{id}` returned **200** and displayed its Hyderabad store, available/reserved fields, and reorder threshold.
- Order detail was opened read-only. The actual order, order-items, fulfillment, shipment, tracking-events, and notification-history GET requests returned **200**. Customer fields from the detail were intentionally excluded from this report.
- Delivery-partner assignment was opened for an existing Hyderabad order without saving. The partner list returned **200** and showed seven active partners for Hyderabad. Shipment lookup returned **404** for that order because it had no shipment yet; the assignment pane remained usable and was closed without creating or assigning anything.
- The Delivery and Coupons pages loaded; both showed no matching records. The Reports page's `Export JSON` action downloaded a report with `filters`, `summary`, `storePerformance`, and `orders`; it contained 41 orders and five store rows and no customer/contact/address/payment fields. The downloaded QA artifact was removed after inspection.
- The report, store, product, inventory, order, and delivery navigation produced no unexpected current browser console errors. The expected missing-shipment 404 above was observed. No live mutation request was submitted.

### Current 35-case checklist

`Fresh` means exercised in this run. `Carried forward` identifies the latest safe isolated evidence already documented above; those write workflows were not repeated against shared business data.

| ID | Use case | Status | Retest evidence |
|---|---|---|---|
| LA-01 | Login through Team Login | PASS | Fresh identity endpoint returned 200; authenticated portal showed Location Admin and Hyderabad. Existing login/logout token handling was not changed. |
| LA-02 | View location-scoped dashboard | PASS | Fresh dashboard loaded scoped service data; the Reports page showed 41 orders and Hyderabad metrics. |
| LA-03 | View assigned-location stores | PASS | Fresh Stores page loaded and displayed Hyderabad store data; Catalog H2 scope tests continue to verify cross-location denial. |
| LA-04 | Create store within applicable location | PASS | Carried forward: disposable QA-schema browser create/readback and same/cross-location Catalog tests. Not repeated against the active shared schema. |
| LA-05 | Edit store profile and operational information | PASS | Carried forward: disposable QA-schema edit/readback and cross-location update denial. |
| LA-06 | Set store coordinates/address | PASS | Carried forward: saved address/coordinate readback plus invalid-coordinate validation tests. |
| LA-07 | Configure delivery/pickup information | PASS | Carried forward: isolated save/readback of delivery and pickup settings and validation tests. |
| LA-08 | Change store active/closed status | PASS | Carried forward: isolated status update/readback and location-move denial. |
| LA-09 | Delete store through available controls | PASS | Carried forward: dependency-free disposable store deletion and refreshed-list verification in isolated QA schema. |
| LA-10 | View location-scoped products | PASS | Fresh Products page loaded; location-product authorization tests remain green. |
| LA-11 | Create/edit products | PASS | Carried forward: location-owned product UI create/edit and scoped persistence checks. Global master-catalog permissions remain protected. |
| LA-12 | Change product active/draft status | PASS | Carried forward: location-owned store availability was saved and read after reload; global product publication status remained protected. |
| LA-13 | Manage product variants/images | PASS | Carried forward: isolated create/edit/readback for variants and images with cross-location denial. |
| LA-14 | Manage store-product mappings | PASS | Carried forward: isolated UI mapping, update, readback, and unmap checks; unauthorized store mapping was denied. |
| LA-15 | Create location/store-scoped banners | PASS | Carried forward: isolated create/readback and same/cross-location banner authorization tests. |
| LA-16 | Edit/disable campaigns | PASS | Carried forward: supported banner edit/disable flow was verified in isolated Catalog QA data. |
| LA-17 | View inventory by store | PASS | Fresh inventory list loaded; existing location-scope tests passed in the Inventory suite. |
| LA-18 | Create/edit inventory records | PASS | Carried forward: isolated Inventory API create/update/readback and authorization tests. No current live write. |
| LA-19 | Adjust available stock | PASS | Carried forward: isolated stock movement and validation tests; no current stock adjustment. |
| LA-20 | Inspect reservations and stock thresholds | PASS | Fresh inventory detail GET returned 200 and showed available, reserved, and reorder-level fields for Hyderabad. |
| LA-21 | View location-scoped orders | PASS | Fresh order list returned 200 and showed Hyderabad store orders; Order H2 scope suite passed. |
| LA-22 | Search/filter orders | PASS | Orders page and filters loaded; prior focused filter assertions remain the latest filter-specific evidence. No order was changed. |
| LA-23 | Inspect order details and fulfillment | PASS | Fresh order detail, items, fulfillment, shipment, tracking, and notification-history GETs returned 200. Read-only. |
| LA-24 | Confirm/process eligible orders | PASS | Carried forward: isolated Order authorization/workflow tests cover allowed transitions, invalid transitions, and cross-location denial. No live transition. |
| LA-25 | Perform applicable packing/shipping actions | PASS | Carried forward: isolated Fulfillment lifecycle tests cover shipment lifecycle and authorization; no carrier or delivery operation was dispatched. |
| LA-26 | Open delivery-partner assignment | PASS | Fresh assignment pane opened and loaded seven active Hyderabad partners. The no-shipment 404 was expected; pane closed without save. |
| LA-27 | Select active partner from relevant store | PASS | Carried forward: isolated authenticated browser-to-Fulfillment assignment returned 200 and persisted/read back the same-store partner; cross-store/location and anonymous requests were denied. |
| LA-28 | Retry failed shipment where permitted | PARTIAL | New backend retry endpoint and UI flow are implemented and pass isolated tests (details below). The running Fulfillment process still has the old artifact, the additive V7 schema migration has not been applied to shared MySQL, and no carrier adapter is configured in normal runtime. No shared shipment was retried. |
| LA-29 | Access delivery management module | PASS | Fresh Delivery route loaded as Location Admin and showed its current empty state. |
| LA-30 | Configure local coupon records | PASS | Carried forward: isolated location coupon creation/edit/disable and persistence tests; current Coupons page loaded without a write. |
| LA-31 | Select coupon store scope | PASS | Carried forward: UI showed assigned-store choices; isolated API tests verified permitted location scope and cross-location denial. |
| LA-32 | View reports for location/stores | PASS | Fresh Reports page displayed location metrics and store-performance data. |
| LA-33 | Filter operational reports | PASS | Location-fixed store/date/status report controls loaded; prior focused filter tests remain green. |
| LA-34 | Export JSON report | PASS | Fresh JSON export contained 41 orders and five stores and excluded customer/contact/address/payment fields; downloaded QA artifact was removed. |
| LA-35 | Logout | PASS | Carried forward: prior isolated authenticated run verified token removal and protected-route redirect. Logout was not repeated because it would sign out the active browser session used for this retest. |

### LA-28 implementation and verification

- Added a manual `POST /api/v1/shipments/{shipmentId}/carrier-retry` operation and read-only attempt-history endpoint. Existing `manageShipment` authorization checks the assigned store; partner eligibility is independently verified before submission.
- The retry policy is capped at three carrier attempts per shipment. The adapter must support idempotency keys. Network failures and HTTP 408/429/5xx are retryable with bounded 1s/2s delays and jitter. Permanent failures stop immediately. Ambiguous outcomes become `UNKNOWN` and block another operation pending operator review. Attempt history stores only IDs, timestamps, outcome, HTTP status, sanitized error code, and idempotency metadata; request/response bodies and secrets are not stored.
- Added a QA-only `carrier-retry-qa` in-process adapter that deterministically returns HTTP 202 and makes no network request. The normal adapter fails closed as not configured. The existing assignment behavior for other roles is unchanged; the new retry call is used by the Location Admin UI only.
- Focused H2 HTTP tests verified accepted retry, persistent attempt readback, duplicate idempotency replay without a second adapter call, 503/429 retries then success, exhaustion at three calls, permanent 400 stop, ambiguous timeout `UNKNOWN`, no new attempt after ambiguity, durable `PENDING` recovery after an interrupted request, cross-location **403**, and unauthenticated **401**. The local adapter's repeat key is idempotent.
- Playwright exercised the Location Admin failed-shipment panel with isolated order, shipment, and partner fixtures. The UI submitted the carrier retry with a generated idempotency key, received mocked **200 / SUCCEEDED**, read back the resulting shipment with **200**, and displayed success. Requests were intercepted in the browser; no shared shipment or real carrier was contacted.
- A first browser mock attempt changed the fixture from FAILED to CREATED during the pre-submit refresh, so it exercised the ordinary assignment path and got **403** from the old running service. The fixture was corrected to remain FAILED until the retry call; the intended retry UI path then passed. No business state changed in either attempt.
- Added MySQL migration `fulfillment-service/src/main/resources/db/migration/V7__add_carrier_retry_attempts.sql`. It is additive. It has not been applied: this checkout's active Fulfillment process uses the shared `fulfillment-service` MySQL schema and does not auto-run Flyway. The current process (PID 47924 on port 3315) remains healthy, but still runs the pre-change artifact. I did not restart it or alter the shared schema, because the normal adapter is intentionally disabled and there is no isolated browser-connected carrier runtime. Therefore LA-28 remains PARTIAL for the configured local runtime despite passing isolated code/UI tests.

### Regression commands and totals

| Command/check | Result |
|---|---|
| `node.exe --test` (frontend) | PASS — 223 tests, 0 failures. |
| `npm.cmd run lint` | PASS — exit 0. |
| `npm.cmd run build` | PASS — Vite build completed; existing large-chunk warning remains. |
| `mvn.cmd -f catalog-service/pom.xml test` | PASS — 32 tests. |
| `mvn.cmd -f inventory-service/pom.xml test` | PASS — 18 tests. |
| `mvn.cmd -f order-service/pom.xml test` | PASS — 109 tests. |
| `mvn.cmd -f fulfillment-service/pom.xml test` | PASS — 30 tests, including LA-28 H2 HTTP/security and pending-recovery cases. |
| `mvn.cmd -f Ecom-Org-access/pom.xml '-Dtest=ScopeAuthorizationServiceTest,DeliveryPartnerControllerTest,UserControllerTest' test` | PASS — 28 tests; Maven exited 0 after a Surefire fork shutdown delay. |
| Backend total | PASS — 217 tests, 0 failures/errors/skips. |
| `git diff --check` (frontend and backend) | PASS — frontend printed the existing LF-to-CRLF normalization warning. |
| MySQL business-data writes / real carrier requests | None. |

### Fresh totals and readiness

**PASS 34, FAIL 0, PARTIAL 1, BLOCKED 0, SKIPPED 0 — 35 total.** LA-28 is the sole partial. Its code and isolated tests pass, but the running Fulfillment runtime has not loaded the change and no real or configured carrier adapter is available. The other PASS results include the latest isolated-fixture evidence already recorded in this report; cases involving writes were not repeated against shared business records during this fresh run.

The full 35-case suite is **not complete for the live local runtime** until the additive Fulfillment migration and updated artifact are loaded through the existing local workflow and LA-28 is verified against an isolated browser-connected QA adapter. No further write should be sent to the shared MySQL-backed Fulfillment service for this case.
