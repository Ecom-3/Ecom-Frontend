# Store Manager Local QA Report

- **Latest execution date:** 2026-10-26 (Asia/Calcutta). Initial browser run: 2026-10-25.
- **Scope:** Local development only
- **Frontend:** `http://localhost:5175`
- **Gateway:** `http://localhost:8082`
- **Catalog:** `http://localhost:8089`
- **Fulfillment:** `http://localhost:3315`
- **Shared MySQL:** the current run used the normal local login flow before switching browser routes to disposable services; this may have caused read-only identity queries through local Org Access. No shared MySQL writes were made. All QA writes used disposable MySQL or H2. No production/VPS systems were accessed.

## Executive summary

| Status | Count |
|---|---:|
| PASS | 33 |
| FAIL | 0 |
| PARTIAL | 2 |
| BLOCKED | 13 |
| SKIPPED | 0 |
| **Total** | **48** |

**Latest readiness: Not complete.** The current 48-case totals are 33 PASS, 0 FAIL, 2 PARTIAL, and 13 BLOCKED. On 2026-10-26, Catalog enum-to-VARCHAR mapping was corrected and production-profile Hibernate validation succeeded against a fresh disposable MySQL database after migrations V1–V35. Store Manager product CRUD also passed against that schema with validation enabled. Authenticated browser CRUD now passes for SM-09, and isolated profile and delivery-settings save/reload pass for SM-05-SM-07. Isolated business fixtures for the remaining write workflows and the banner/coupon policy decision remain outstanding. Earlier totals and failures below are historical where later evidence supersedes them.

This retest includes a narrowly scoped Store Manager order-filter pagination fix and the QA report update. Pre-existing frontend and backend changes were preserved.

## Initial login and environment evidence (historical)

- Discovered the Store Manager login identifier from local Org Access development seed migrations; used the user-provided password once in the local Team Login form. The password and login identifier are omitted here.
- Login returned HTTP 200, navigated to `/store-manager/dashboard`, and `/org-access/api/users/me` returned HTTP 200. The resulting portal showed Store Manager role and assigned store **Gachibowli Fresh Hub** (`store-gachibowli`). No second login attempt or invalid-password attempt was made.
- Browser contexts remained isolated: Store Manager testing used a new tab. The existing Location Admin tab/session was not used, copied, or logged out.
- Gateway, Catalog, and Fulfillment health endpoints returned HTTP 200. MySQL was listening. No services were started, stopped, or restarted.
- No disposable MySQL database or test-only schema was established. No write request was sent to the local business database; no password, stock, store, product, banner, coupon, partner, order, shipment, or delivery record was changed.
- After testing, logout cleared the Store Manager session token and redirected to `/login`; opening the protected Store Manager dashboard redirected back to `/login`.

## Initial results (historical before remediation retest)

| ID | User Role | Use Case | Status | Issues / evidence |
|---|---|---|---|---|
| SM-01 | Store Manager | Login as Store Manager | PARTIAL | Supplied local credential succeeded once; `/api/users/me` returned 200 and the Store Manager workspace opened for Gachibowli Fresh Hub. Invalid-credential handling was not tested to avoid an unnecessary account lockout attempt. |
| SM-02 | Store Manager | Access assigned-store dashboard | PASS | `/store-manager/dashboard` opened under the Store Manager role. Header and metrics identified Gachibowli Fresh Hub. Authenticated same-store Orders read returned 200; other-store Orders query returned 403. |
| SM-03 | Store Manager | View store metrics and summary | FAIL | UI showed 12 orders, 11 active, and ₹4,748 revenue. Read-only API aggregation found 12 orders, 10 CREATED, 1 CANCELLED, 0 DELIVERED; the UI revenue equals the sum including the cancelled order (₹4,748), while non-cancelled totals are ₹4,394. Revenue therefore overstates active/non-cancelled order revenue by ₹354. |
| SM-04 | Store Manager | View assigned-store information | FAIL | Profile displayed the assigned store, but frontend Catalog GET requests omit the bearer token (`catalogApi.js` defaults Catalog GETs to `auth:false`). Unauthenticated `GET /catalog-service/api/v1/stores` returned 200 with 16 stores. An authenticated direct same-store detail returned 200 and other-store detail returned 403, so the server check works when the token is sent but the UI's list fallback is unscoped. |
| SM-05 | Store Manager | Edit store profile | BLOCKED | Edit form opened; no save was submitted because the running MySQL database was not established as disposable. Persistence and cross-store write denial were not exercised through browser save/read-back. |
| SM-06 | Store Manager | Update store contact/address details | BLOCKED | Fields were visible in the profile editor. Valid/invalid changes and persistence were not tested because no disposable store/database fixture was available. |
| SM-07 | Store Manager | Configure store delivery/pickup settings | BLOCKED | Delivery Settings page opened and showed current controls. No settings were saved because this would mutate shared store data; persisted read-back was not tested. |
| SM-08 | Store Manager | Attempt store-manager password change | BLOCKED | Change Password form is available. The logged-in account is not a verified disposable account, so no password change or restoration was attempted. |
| SM-09 | Store Manager | View/manage own-store products | FAIL | Product screen fetched `GET /catalog-service/api/v1/products?size=200` without auth and received 200 with 22 catalog products. Store Manager products are not filtered to the assigned store in this flow; ProductController's list only applies location scoping for Location Admin. Product writes were not attempted on shared catalog data. |
| SM-10 | Store Manager | Manage permitted banners | FAIL | Banner screen loaded; its Catalog GET is also unauthenticated and returned 3 banners. The backend banner visibility path does not apply Store Manager store scope, while write authorization does not grant Store Manager banner ownership. No banner was changed. |
| SM-11 | Store Manager | View own-store inventory | PASS | Inventory UI opened. Authenticated store-filtered Inventory read returned 200; the authenticated unfiltered list returned 200 and the rows checked belonged to the assigned store. Other-store list query returned 403 and unauthenticated Inventory read returned 401. |
| SM-12 | Store Manager | Update stock/stock thresholds | BLOCKED | No stock or threshold write was submitted because no disposable inventory fixture was available. No shared inventory values were changed. |
| SM-13 | Store Manager | View configured delivery radius rules | PARTIAL | Authenticated same-store delivery-zone read returned 200 with one configured rule; an other-store read returned 403. The browser page displayed an authentication-service error because its Catalog store lookup was sent without the bearer token and returned 401. |
| SM-14 | Store Manager | Add delivery radius band | BLOCKED | Add control is present. No band was saved because no disposable delivery-zone fixture/database was verified. |
| SM-15 | Store Manager | Edit delivery radius band | BLOCKED | Edit control is present for existing rules. No shared rule was edited; save/reload persistence was not tested. |
| SM-16 | Store Manager | Delete delivery radius band | BLOCKED | No rule was deleted because no disposable band was available. |
| SM-17 | Store Manager | Configure delivery charges | BLOCKED | Charge controls are visible in the zone editor. Valid/invalid values and persistence were not tested without a disposable zone fixture. |
| SM-18 | Store Manager | Configure free-delivery threshold | BLOCKED | Threshold controls are visible. No shared configuration was changed; boundary behavior and persistence remain unverified. |
| SM-19 | Store Manager | Configure minimum order | BLOCKED | Minimum-order control is visible. No configuration write or checkout mutation was made. |
| SM-20 | Store Manager | Configure minimum/maximum delivery ETA | BLOCKED | ETA controls are visible. Validation and save/read-back were not tested without a disposable zone. |
| SM-21 | Store Manager | Enable/disable delivery methods | BLOCKED | Method controls are visible in the editor. No method state was changed or persisted. |
| SM-22 | Store Manager | Configure pickup availability | BLOCKED | Pickup state is visible in Delivery Settings. No write was submitted; no isolated store configuration is available. |
| SM-23 | Store Manager | Preview radius bands on map | PARTIAL | Map panel and store marker rendered, but the UI could not load its delivery rules because the unauthenticated Catalog store lookup failed. No radius-band visualization or geographic accuracy was verified. |
| SM-24 | Store Manager | Save and reload delivery-zone configuration | BLOCKED | No save was performed because the only available store/database is shared business data. |
| SM-25 | Store Manager | Verify delivery quote/serviceability | PASS | Authenticated read-only quote API returned 200. At the assigned store coordinate it reported `deliveryAvailable=true`, distance 0 km and ETA 10–26 minutes; a far-away representative coordinate returned `deliveryAvailable=false` at 525.7 km and the outside-area message. No order or carrier operation was initiated. |
| SM-26 | Store Manager | View orders belonging to assigned store | PASS | Orders UI loaded two pages. Authenticated `GET /order-api/api/v1/orders?storeId=store-gachibowli` returned 200 with 12 orders; other-store query returned 403 and unauthenticated list returned 401. |
| SM-27 | Store Manager | Search/filter store orders | PARTIAL | Orders screen exposed search/status/sort controls and a no-match search produced the empty-result state. Full positive search, status-filter combinations, and pagination accuracy were not exhaustively verified. |
| SM-28 | Store Manager | Inspect order and customer delivery details | PARTIAL | Same-store order detail and items endpoints returned 200 in a sanitized status-only probe. No customer/order contents were captured. Because the available orders were not verified disposable test orders, the details workflow was not opened or inspected in the UI. |
| SM-29 | Store Manager | Confirm order | BLOCKED | No eligible isolated test order was available. No confirmation or notification was triggered. |
| SM-30 | Store Manager | Prepare/pack order | BLOCKED | No test-owned eligible order was available. No order state was changed. |
| SM-31 | Store Manager | Mark fulfillment ready for shipment | BLOCKED | No isolated order/fulfillment fixture was available. No shipment or status transition was initiated. |
| SM-32 | Store Manager | Create/recover shipment through workflow | BLOCKED | Read-only lookup for an existing listed order returned 404 for Fulfillment and Shipment. No isolated shipment adapter fixture was available; no create/recovery request was sent. |
| SM-33 | Store Manager | Assign order to delivery partner | BLOCKED | No isolated order/partner fixture was available. No assignment or partner notification was performed. |
| SM-34 | Store Manager | View delivery-partner availability | BLOCKED | Partner list was readable, but assignment-specific availability/eligibility requires a safe test order. No partner was assigned. |
| SM-35 | Store Manager | Retry failed shipment assignment | PARTIAL | No failed test shipment existed; retry was not attempted. Source has a QA-only local adapter profile and the default adapter reports carrier-not-configured, but the running profile/runtime retry configuration was not established. Retry policy/idempotency behavior remains unverified end to end. |
| SM-36 | Store Manager | View order/fulfillment/shipment progress | PARTIAL | Same-store order detail and line-item reads returned 200, but associated Fulfillment and Shipment lookups returned 404 for the sampled order. No disposable order with lifecycle history was available to verify persisted progress. |
| SM-37 | Store Manager | View store delivery partners | PASS | Store Manager Delivery Partners page loaded 7 active partner rows. The authenticated API returned 200 and all returned membership rows were assigned to Gachibowli Fresh Hub/Hyderabad. |
| SM-38 | Store Manager | Create new delivery partner | BLOCKED | Creating an account writes Org Access/MySQL. No disposable identity database was available; no partner or login account was created. |
| SM-39 | Store Manager | Assign newly created partner to store | BLOCKED | No disposable partner fixture was available. No membership assignment was written. |
| SM-40 | Store Manager | View partner contact/vehicle/licence details | PARTIAL | Partner list shows contact fields, but the sampled records reported vehicle and licence fields as not recorded. Sensitive contact details are intentionally omitted from this report. |
| SM-41 | Store Manager | Activate delivery partner | BLOCKED | Existing partners are shared accounts; no activation status was changed. |
| SM-42 | Store Manager | Deactivate delivery partner | BLOCKED | Existing partners may be serving real assignments; no deactivation was attempted. |
| SM-43 | Store Manager | Refresh partner records | PASS | Reloaded the partner view; authenticated Org Access list returned 200 and the page repopulated the 7 assigned-store partners. No partner data changed. |
| SM-44 | Store Manager | Filter eligible partners during order assignment | BLOCKED | No safe test order was available to open assignment. Eligibility filtering during assignment was not exercised. |
| SM-45 | Store Manager | Access permitted coupon configuration through admin route | FAIL | `/admin/coupons` opened but showed no matching records. Catalog coupon GET returned 200 with 2 rows, but Store Manager list scope is not enforced server-side; Store Manager create/update is not accepted by CatalogAccess. The advertised module therefore does not provide a verified store-scoped coupon workflow. No coupon was changed. |
| SM-46 | Store Manager | View/store-scope reports | FAIL | Reports page displayed Access denied. It issued unfiltered `GET /order-api/api/v1/orders`, which returned 403; report metrics were unavailable. |
| SM-47 | Store Manager | Export report JSON | FAIL | Report data did not load because the unfiltered Orders request returned 403. No export could be generated or validated. |
| SM-48 | Store Manager | Logout | PASS | Logout cleared the session token, navigated to `/login`, and a subsequent protected dashboard navigation returned to `/login`. |

## Authorization/API evidence

Read-only probes were made in the authenticated Store Manager tab. Responses were reduced to HTTP statuses, record counts, and scope booleans; no API response bodies containing customer or partner details were saved in this report.

| Resource | Same assigned store | Other store | Unauthenticated | Result |
|---|---:|---:|---:|---|
| Store detail | 200 | 403 | 401 | Server scope works with the token; Catalog UI GET client omits it. |
| Inventory list | 200 | 403 | 401 | Store-scoped and unfiltered authenticated reads were confined to the assigned store in the checked rows. |
| Orders list | 200 (12 rows) | 403 | 401 | Store-filtered list works. Unfiltered report request returns 403. |
| Order detail and items | 200 / 200 | Not verified with a test-owned cross-store order ID | Not separately probed | Read-only status probe only; no customer/order payload retained. |
| Store-product mapping list | 200 (21 rows) | 403 | Not separately probed | Store mapping endpoint enforces exact store scope. |
| Delivery zones | 200 (1 rule) | 403 | UI request failed with 401 | Direct authenticated API works; browser Catalog client omits auth on GET. |
| Delivery partners | 200 (7 rows) | N/A | Not separately probed | All returned records belonged to the assigned store. |

### Confirmed issues from this run

1. **Catalog GET authentication mismatch:** `src/services/catalogApi.js` sets `auth:false` on Catalog GET requests by default. Live browser requests to Stores, Products, and Banners omit the Store Manager token. Anonymous Stores returned 16 rows, Products 22, Banners 3, and Coupons 2. This bypasses the Catalog controller's authenticated Store Manager filtering for these list flows and breaks the delivery-radius page's store detail lookup.
2. **Store Manager product list is not store-filtered:** frontend loads the general products endpoint, and the backend only applies location filtering for Location Admin. The Store Manager page can display the general catalog rather than the assigned store's mapped products; product create/update permission remains restricted to global catalog roles.
3. **Store Manager banner/coupon scope mismatch:** UI modules are exposed, but list data is not properly store-scoped and the Catalog write access checks do not grant Store Manager ownership. This is inconsistent with the portal's advertised module access.
4. **Dashboard revenue includes cancelled order:** visible revenue matches all order totals, including the cancelled row, rather than the non-cancelled total.
5. **Reports call unfiltered Orders API:** Store Manager reports issue a request without `storeId`, receive 403, and cannot render or export the report.
6. **Delivery configuration UI cannot read its store:** direct authenticated store/zone reads work, but the UI's unauthenticated Catalog GET path receives 401. No delivery setting/radius persistence was tested.
7. **Fulfillment test fixtures missing:** queried existing order had no Fulfillment or Shipment record (404); carrier retry runtime configuration was not verified.

## Automated verification

| Command | Result |
|---|---|
| `node.exe --test` (frontend) | PASS — 223 tests, 0 failures. |
| `npm.cmd run lint` | PASS — no errors. |
| `npm.cmd run build` | PASS — production build completed; existing large-chunk warning (>500 kB) remains. |
| `mvn.cmd test` — Catalog Service | PASS — 32 tests, 0 failures/errors/skips. |
| `mvn.cmd test` — Inventory Service | PASS — 18 tests, 0 failures/errors/skips. |
| `mvn.cmd test` — Order Service | PASS — 109 tests, 0 failures/errors/skips. |
| `mvn.cmd test` — Fulfillment Service | PASS — 30 tests, 0 failures/errors/skips. |
| `mvn.cmd test` — Org Access | PASS — 73 tests, 0 failures/errors/skips; Maven exited 0. Optional Logstash appender repeatedly failed to resolve `logstash` and delayed shutdown, with a Surefire 30-second fork warning. |
| `git diff --check` — frontend and backend | PASS — both repositories returned clean; the frontend emitted only a line-ending normalization warning for a pre-existing modified file. |

The backend suites total **262 passing tests**. They ran against their test configurations (including embedded H2), not the running MySQL database. They do not substitute for browser write/read-back verification.

## Remaining blockers / next actions

- Fix the Store Manager Catalog GET client so authenticated administrative reads carry the token while public storefront reads remain explicitly unauthenticated only where intended; retest store details, products, banners, coupons, and delivery zones.
- Add/verify server-side Store Manager scope for product, banner, and coupon listings and matching write operations; test same-store and cross-store behavior.
- Make reports request only the assigned store's Orders and reconcile report totals/export with the dashboard.
- Correct dashboard revenue aggregation to exclude cancelled orders if that is the defined revenue rule.
- Provide an isolated MySQL schema or disposable test account/store/order/partner/zone fixtures before attempting profile, stock, delivery settings, order lifecycle, partner mutation, or password persistence tests.
- Provide a local/mock carrier retry configuration and a failed-shipment fixture for SM-35; do not enable real carrier dispatch for QA.

**Initial baseline disposition (historical):** the suite was not complete as an end-to-end write regression: 26 cases were BLOCKED and 8 were PARTIAL. Later evidence and totals are recorded in the current retest sections below.

## Store Manager remediation checkpoint — 2026-10-25

This section preserves the original 48-case table above as the initial browser run and records current code/test evidence separately. It does not claim that unrerun browser workflows or MySQL persistence passed.

### Current totals

| Status | Count |
|---|---:|
| PASS | 19 |
| FAIL | 0 |
| PARTIAL | 15 |
| BLOCKED | 14 |
| SKIPPED | 0 |
| **Total** | **48** |

The case statuses below include the 2026-10-25 browser and isolated API evidence plus the 2026-10-26 schema and regression run. Cases that still require authenticated browser workflows remain PARTIAL or BLOCKED.

### Current result for each case

| ID | User Role | Use Case | Status | Issues |
|---|---|---|---|---|
| SM-01 | Store Manager | Login as Store Manager | PASS | Authenticated once through Team Login; the portal and identity response confirmed the Store Manager role and Gachibowli assignment. Credentials and token were not recorded. |
| SM-02 | Store Manager | Access assigned-store dashboard | PASS | Retain prior browser evidence for assigned-store dashboard and same-store/other-store Orders scope. Dashboard request behavior was not re-opened in this run. |
| SM-03 | Store Manager | View store metrics and summary | PASS | Authenticated dashboard showed 12 orders, 11 active orders, and revenue 4394. The assigned-store order response had 12 rows and non-cancelled totals of 4394; no customer data was retained. |
| SM-04 | Store Manager | View assigned-store information | PASS | Store profile displayed Gachibowli Fresh Hub. After Catalog reload, assigned store GET returned 200, another store returned 403, and anonymous access returned 401. |
| SM-05 | Store Manager | Edit store profile | PASS | Prior authenticated disposable-MySQL edit, save, reload, and SQL read-back verified assigned-store profile persistence. |
| SM-06 | Store Manager | Update store contact/address details | PASS | Contact, address and location fields saved through the authenticated UI, reloaded, and matched SQL in disposable MySQL. |
| SM-07 | Store Manager | Configure store delivery/pickup settings | PASS | Delivery/pickup, ETA and notes saved through the authenticated UI, reloaded, and matched SQL in disposable MySQL. |
| SM-08 | Store Manager | Attempt store-manager password change | PASS | Password changed for the seeded identity in disposable Org Access MySQL through the UI; logout then normal login with the new password succeeded. Shared identity database was not changed. |
| SM-09 | Store Manager | View/manage own-store products | PASS | Authenticated browser create/edit/status/availability/variants/images/validation/delete and reload passed against disposable MySQL. API/SQL ownership, cleanup, cross-store/wrong-role 403, anonymous 401 and logout were verified. |
| SM-10 | Store Manager | Manage permitted banners | PASS | Approved store-only CRUD policy. Isolated Catalog integration tests verify assigned-store list/read/create/edit/status/delete, cross-store/global denial, payload-override rejection, and preserved Global Admin behavior; frontend payload tests verify assigned-store targeting. No authenticated browser CRUD was run. |
| SM-11 | Store Manager | View own-store inventory | PASS | Retain prior authenticated same-store 200, cross-store 403, and unauthenticated 401 evidence. No inventory rows were changed. |
| SM-12 | Store Manager | Update stock/stock thresholds | PASS | Authenticated browser Stock +10 and threshold update persisted/read back against isolated H2 Inventory. Only stock fields were mutable; product, variant and store identifiers were read-only. |
| SM-13 | Store Manager | View configured delivery radius rules | PASS | Authenticated UI displayed an active 0-8 KM rule, standard delivery charge, and ETA. Assigned store and delivery-zone reads returned 200; cross-store reads returned 403. No settings were changed. |
| SM-14 | Store Manager | Add delivery radius band | PASS | Added a synthetic radius band through the authenticated UI against disposable MySQL; displayed values and SQL read-back matched. |
| SM-15 | Store Manager | Edit delivery radius band | PASS | Edited the disposable band through the UI; radius, charge, threshold, minimum order, ETA and method state persisted and matched SQL after reload. |
| SM-16 | Store Manager | Delete delivery radius band | PASS | Deleted the disposable band through the UI; it disappeared and its delivery-method rows were removed from disposable MySQL. |
| SM-17 | Store Manager | Configure delivery charges | PASS | Synthetic delivery charge saved, reloaded and matched the disposable SQL row. |
| SM-18 | Store Manager | Configure free-delivery threshold | PASS | Synthetic threshold saved, reloaded and matched the disposable SQL row. |
| SM-19 | Store Manager | Configure minimum order | PASS | Synthetic minimum-order amount saved, reloaded and matched the disposable SQL row. |
| SM-20 | Store Manager | Configure minimum/maximum delivery ETA | PASS | ETA bounds saved and reloaded through the UI and matched SQL; zero radius was rejected by browser validation. |
| SM-21 | Store Manager | Enable/disable delivery methods | PASS | Delivery method toggle persisted and reloaded; SQL confirmed method state for the disposable band. |
| SM-22 | Store Manager | Configure pickup availability | PASS | Store Pickup toggle persisted and reloaded; SQL confirmed disabled state for the disposable band. |
| SM-23 | Store Manager | Preview radius bands on map | PASS | Authenticated map preview rendered the 8 KM radius with the active 0-8 KM rule and no UI alert. Screenshot: [delivery radius map](./store-manager-delivery-radius-map-2026-10-25.png). Geographic accuracy was not measured. |
| SM-24 | Store Manager | Save and reload delivery-zone configuration | PASS | Authenticated delivery-zone save, page reload and SQL read-back matched; synthetic zone was deleted and cleanup verified. |
| SM-25 | Store Manager | Verify delivery quote/serviceability | PASS | Retain prior authenticated read-only quote results for the store coordinate and a far-away coordinate. No order or carrier action was initiated. |
| SM-26 | Store Manager | View orders belonging to assigned store | PASS | Retain prior same-store Orders 200, other-store 403, and unauthenticated 401 evidence. |
| SM-27 | Store Manager | Search/filter store orders | PASS | Browser search returned exactly one matching order. CREATED filter returned 6 rows on page 1 and 4 on page 2; CANCELLED returned one row after changing filters from page 2. Fixed Store Manager filter changes to reset pagination to page 1. |
| SM-28 | Store Manager | Inspect order and customer delivery details | PASS | Store Manager View opened the detail dialog. Same-store order detail returned 200 and items returned 200 with one line item. The generic View action was restored for Store Manager orders while duplicate product View controls remain suppressed. No PII was recorded. |
| SM-29 | Store Manager | Confirm order | PASS | Authenticated UI confirmed a disposable Gachibowli order; Order Service persisted CONFIRMED. Notification traffic was stubbed locally. |
| SM-30 | Store Manager | Prepare/pack order | PASS | Authenticated UI moved a disposable order to PROCESSING and updated its fulfillment lifecycle. |
| SM-31 | Store Manager | Mark fulfillment ready for shipment | PASS | Authenticated Ready action moved the isolated fulfillment through ALLOCATED and PACKING to READY_TO_SHIP; browser/API read-back succeeded. |
| SM-32 | Store Manager | Create/recover shipment through workflow | PASS | Authenticated Ship action created a disposable Store Delivery shipment and persisted IN_TRANSIT with tracking; local notification stub used. |
| SM-33 | Store Manager | Assign order to delivery partner | PASS | Authenticated assignment succeeded for a same-store active partner; disposable SQL confirmed partner ID/name persisted on shipment. |
| SM-34 | Store Manager | View delivery-partner availability | PASS | Assignment page for an isolated store order displayed seven active partners scoped to Gachibowli. |
| SM-35 | Store Manager | Retry failed shipment assignment | PASS | Authenticated UI reassigned a disposable FAILED shipment; Fulfillment persisted CREATED with the selected partner and a retry tracking event. No carrier call was made. |
| SM-36 | Store Manager | View order/fulfillment/shipment progress | PASS | Authenticated order detail showed Order SHIPPED, Fulfillment SHIPPED, Shipment IN_TRANSIT, assigned partner, and tracking history from disposable services. |
| SM-37 | Store Manager | View store delivery partners | PASS | Retain prior authenticated partner-list evidence: returned memberships were assigned to the manager's store. Sensitive partner details were not recorded. |
| SM-38 | Store Manager | Create new delivery partner | PASS | Authenticated browser created a synthetic partner in disposable Org Access MySQL; UI and SQL confirmed its identity and details. |
| SM-39 | Store Manager | Assign newly created partner to store | PASS | Partner creation automatically assigned `store-gachibowli`; disposable SQL confirmed DELIVERY_PARTNER membership and Gachibowli store. |
| SM-40 | Store Manager | View partner contact/vehicle/licence details | PASS | Authenticated browser displayed synthetic contact-independent motorcycle, vehicle and licence fixture values for an assigned-store partner; API response matched disposable Org Access SQL. |
| SM-41 | Store Manager | Activate delivery partner | PASS | Authenticated UI reactivated the synthetic partner; active state persisted after page reload and SQL read-back. |
| SM-42 | Store Manager | Deactivate delivery partner | PASS | Authenticated UI deactivated the synthetic partner and showed inactive state before reactivation; disposable database only. |
| SM-43 | Store Manager | Refresh partner records | PASS | Retain prior authenticated refresh evidence showing the assigned-store partner list repopulated. |
| SM-44 | Store Manager | Filter eligible partners during order assignment | PASS | Assignment picker returned seven active partners for the isolated Gachibowli order; every option was from the manager's assigned store. |
| SM-45 | Store Manager | Access permitted coupon configuration through admin route | PASS | Approved store-only CRUD policy. Isolated Catalog integration tests verify assigned-store list/create/edit/status/delete, cross-store/global denial, payload-override rejection, preserved Global Admin behavior, and disabled redemption returning zero discount; frontend payload tests verify assigned-store targeting. No authenticated browser CRUD was run. |
| SM-46 | Store Manager | View/store-scope reports | PASS | Authenticated Reports page rendered without an alert; the assigned-store Orders request returned 200. Cross-store Orders returned 403 and unauthenticated Orders returned 401. |
| SM-47 | Store Manager | Export report JSON | PASS | Browser emitted a JSON download. Local validation found 12 orders, one distinct store, all rows assigned to Gachibowli, and no customer contact fields. No order or customer data was included in this report. |
| SM-48 | Store Manager | Logout | PASS | Retain prior browser evidence that logout removed the session and a protected dashboard navigation redirected to login. |

### Fixes and test evidence

- `src/services/catalogApi.js`: Catalog GET helpers used by administrative Store Manager pages accept explicit auth options while keeping existing public-read defaults. The in-flight request key now includes auth mode and current token so public and authenticated requests for the same path cannot share a response.
- `src/pages/StoreManager/StoreManagerPortal.jsx`: assigned-store profile and delivery-radius reads send authentication. Dashboard revenue now uses the shared cancelled-order exclusion rule.
- `src/pages/AdminWorkspace/AdminWorkspace.jsx`, `AdminReports.jsx`, and `adminReportData.js`: Store Manager product list includes the assigned `storeId`; Reports and dashboard report-data loading require the assigned store; report controls and product/inventory summary inputs stay within that store. Product master writes and unapproved banner/coupon creation controls are hidden for Store Manager.
- Catalog backend: product and category-product list requests from Store Manager require and validate the exact store claim, and return only products mapped to that store. Product detail/variant/image reads check mapping ownership. Authenticated non-global banner/coupon list results are filtered through existing ownership checks; global admin behavior and unauthenticated public storefront reads are preserved.
- Added `StoreManagerProductScopeIntegrationTest` using the Catalog test H2 database. It verifies same-store product list/detail and category list, cross-store and missing-store denials, no unrelated banner/coupon disclosure, and preserved public Catalog read behavior.

| Verification | Result |
|---|---|
| `node.exe --test` (frontend) | PASS — 224 tests, 0 failures. |
| `node.exe --test src/pages/AdminWorkspace/adminReportData.test.js` | PASS — 13 tests, including assigned-store report query and cancelled-order revenue rules. |
| `npm.cmd run lint` | PASS. |
| `npm.cmd run build` | PASS; existing large-bundle warning remains. |
| `mvn.cmd -q -f catalog-service/pom.xml '-Dtest=StoreManagerProductScopeIntegrationTest,CatalogApiIntegrationTest' test` | PASS — 6 tests, 0 failures/errors/skips. |
| `mvn.cmd -q -f catalog-service/pom.xml test` | PASS — 34 tests, 0 failures/errors/skips. |
| `mvn.cmd -q -f order-service/pom.xml test` | PASS — 109 tests, 0 failures/errors/skips. |
| `git diff --check` (frontend and backend) | PASS; frontend reported a line-ending normalization warning for the modified `catalogApi.js`. |

Catalog integration tests use `jdbc:h2:mem:catalog;MODE=MySQL`; neither test suite connects to local MySQL. The MySQL listener was not read or written by this retest.

### Runtime and remaining prerequisites

- Gateway and Catalog ports 8082 and 8089 were listening. The browser tabs available at retest time showed the Store Manager tab at `/login`; the prior Store Manager session had been logged out. No new credential was submitted and no role session was copied from another tab.
- At this earlier checkpoint, the running Catalog process had not been restarted, so its old runtime did not include the newly compiled authorization classes. The later authenticated retest below identifies and reloads the stale process and verifies live cross-store denial.
- No shared MySQL records or configuration were changed. No order transition, inventory adjustment, partner mutation, carrier retry, payment, email, SMS, or push notification was performed.
- Store Manager banner and coupon write workflows remain blocked pending an explicit decision defining their permitted scope. This task forbids adding permissions without that approval.
- The remaining blocked writes need an isolated MySQL schema or disposable account/store/zone/order/partner fixtures. Shipment retry additionally needs a documented mock-adapter policy and isolated failed-shipment record.

**Historical readiness at the prior remediation checkpoint: Not ready for a complete Store Manager regression.** At that checkpoint browser retest, MySQL persistence, safe order/fulfillment/partner mutations, and explicit banner/coupon permissions remained incomplete. The authenticated 2026-10-25 retest and latest totals are recorded below.

## Authenticated Store Manager partial-case retest — 2026-10-25

**Scope:** Fresh browser/API retest of the 13 cases previously marked PARTIAL. Existing PASS, FAIL, BLOCKED, and SKIPPED classifications outside those cases are retained. The updated matrix above now reflects this run.

### Runtime and safety evidence

- Authenticated Store Manager browser session was isolated in its own tab. Identity and assigned store were confirmed; the local credential and session token were not written to this report. After testing, sign-out returned to `/login` and the session token was absent.
- Frontend `http://localhost:5175`, gateway `http://localhost:8082`, and Catalog `localhost:8089` were checked. The old Catalog JVM (PID 49724) predated the current compiled authorization classes; after the Catalog suite passed, only that service was restarted with the existing `mvn.cmd -DskipTests spring-boot:run` launcher. The new Catalog JVM (PID 42728) logged the `prod` Spring profile and started successfully; `/actuator/health` returned HTTP 200. The checked-in local profile keeps port 8089. Gateway, Order, Inventory, Fulfillment, MySQL, and other portals were not restarted.
- The checked-in Catalog configuration defaults to the local MySQL `catalog_service` schema, uses Hibernate `ddl-auto: validate`, and has Flyway disabled. No SQL write, migration, reset, or cleanup was performed. No MySQL persistence claim is made.
- No order, inventory, delivery-zone, partner, shipment, payment, or customer record was mutated. No carrier, payment processor, or notification provider was contacted.

### Additional current verification

- Assigned-store Orders returned 200 with 12 rows; another store returned 403 and the unauthenticated request returned 401. Dashboard totals matched those rows after excluding the cancelled order.
- Product scoping initially failed against the stale Catalog process: assigned, cross-store, and unfiltered requests all returned 200 with the same 22 product IDs. After the Catalog reload, assigned-store returned 200 with 21 records; cross-store and missing-scope requests returned 403. Anonymous public Catalog listing continues to return 200 intentionally.
- Assigned Store and delivery-zone reads returned 200; cross-store reads returned 403; anonymous Store detail returned 401.
- Order detail and line items returned 200 (one line item). The sampled order had no Fulfillment or Shipment record (404), so shipment progress remains partial.
- Reports loaded the assigned-store Orders data. The browser downloaded `scoped-report-2026-10-25.json`; validation found 12 rows belonging to one store and no customer contact fields.

### Fixes in this retest

- Restarted only the stale local Catalog process after verifying its compiled source and isolated suite. This made the current Store Manager product scope checks active in the running service.
- Restored the generic View action for Store Manager order rows while retaining the single View action on product rows. This makes order detail inspection available without duplicating the product action.
- Reset Store Manager order pagination to page 1 when the status filter changes. The browser check verified CREATED results on both pages and one CANCELLED result after switching filters from page 2. Added automated coverage for the role-specific pagination behavior.

### Verification commands and results

| Command/check | Result |
|---|---|
| `mvn.cmd -q test` — Catalog Service | PASS — 34 tests, 0 failures, 0 errors, 0 skipped (H2 test database). |
| `mvn.cmd -q test` — Order Service | PASS — 109 tests, 0 failures/errors/skips. |
| `mvn.cmd -q test` — Fulfillment Service | PASS — 30 tests, 0 failures/errors/skips. |
| `mvn.cmd -q test` — Org Access | 73 tests reported, 0 failures/errors/skips in Surefire XML; Maven did not exit cleanly and its test process was stopped after completion because the unavailable `logstash:5000` appender kept retrying. |
| `node.exe --test` — frontend | PASS — 226 tests after adding Store Manager filter regression tests. |
| `npm.cmd run lint` | PASS — no errors. |
| `npm.cmd run build` | PASS — production build completed; existing >500 kB bundle warning remains. |
| `git diff --check` — frontend | PASS — existing line-ending normalization warning in `src/services/catalogApi.js`. |
| `git diff --check` — backend | PASS. |
| Authenticated Store Manager browser/API checks | PASS for SM-01, 03, 04, 09, 13, 23, 27, 28, 46, and 47; SM-35, 36, and 40 remain PARTIAL for the fixture/data reasons above. |
| Shared MySQL persistence/write check | Not run — no disposable schema/fixture was established; no shared MySQL writes were made. |

### Latest 48-case totals

| Status | Count |
|---|---:|
| PASS | 17 |
| FAIL | 0 |
| PARTIAL | 2 |
| BLOCKED | 28 |
| SKIPPED | 0 |
| **Total** | **48** |

The 13 targeted cases reconcile to **10 PASS and 3 PARTIAL**. The complete suite is not green: 28 cases remain BLOCKED, and the three partial cases still need isolated shipment/carrier and partner-detail fixtures. No remaining case was promoted based solely on source inspection or automated tests.

## Focused Store Manager partial-case follow-up — 2026-10-25

The task attachment described 13 currently PARTIAL cases, but the latest 48-case matrix above contains only **three** PARTIAL cases (SM-35, SM-36, and SM-40); the other ten cases from the earlier 13-case batch are already PASS in that matrix. I treated the latest report matrix as authoritative and retested each of its three remaining PARTIAL cases. The other 45 statuses remain unchanged.

### SM-35 — Retry failed shipment assignment — PARTIAL

- Fulfillment isolated H2 HTTP tests passed for successful retry/read-back, same-key idempotent replay (one adapter submission), transient retries with a three-attempt cap, permanent failure, ambiguous timeout, pending/crash recovery, cross-location denial (403), and unauthenticated denial (401). Test: `DeliveryPartnerEligibilityHttpTest` (4 tests).
- `LocalCarrierRetryAdapterTest` passed (2 tests): the `carrier-retry-qa` adapter accepts an in-process submission with HTTP-like 202 and deduplicates the same shipment/idempotency key; the default adapter fails closed without contacting a carrier.
- Frontend `deliveryPartnerAssignmentWorkflow.test.js` is included in the passing 226-test `node.exe --test` run; it verifies failed-only gating, stable idempotency key forwarding, verified partner selection, and no false success timeline on assignment failure.
- No authenticated Store Manager browser session was available in the current browser context: direct navigation to `/store-manager/delivery-partners` redirected to `/unauthorized`. No login attempt or retry request was made. The running Fulfillment service was not restarted or switched to the QA profile, and no live failed shipment exists that is verified disposable. The code/test gap is covered in isolation, but the running UI-to-service retry remains unverified, so this case remains PARTIAL.

### SM-36 — View order/fulfillment/shipment progress — PARTIAL

- Existing `FulfillmentAuthorizationTest` passed all 9 tests against isolated H2 fixtures. It verifies same-store authorized lifecycle reads, cross-store and anonymous denials, and persisted Fulfillment/Shipment status read-back through the API. `adminOrderDetail.test.js` also passed its empty-state and tracking-history assertions as part of the frontend suite.
- The only sampled live order in the prior browser run had no associated Fulfillment or Shipment records (both lookups returned 404). The current browser has no authenticated Store Manager session, so no UI read of a lifecycle-complete order was possible. No live order was modified or fabricated. The UI-to-live-service display of a complete progress history remains unverified, so this case remains PARTIAL.

### SM-40 — View partner contact/vehicle/licence details — PARTIAL

- Source review confirms the Store Manager partner page renders mobile, email, username, address, vehicle type, vehicle number, and licence number, with explicit “not recorded” text for missing vehicle/licence fields. Org Access `DeliveryPartnerController.list` selects those fields and filters results to the manager's exact store. `DeliveryPartnerControllerTest` passed both current tests.
- The prior authenticated browser run returned seven active partners for the assigned store, but the observed records did not contain vehicle or licence values. The current browser has no authenticated Store Manager session. No shared staff/partner record was edited and no values were invented. Verification with populated, disposable partner details and browser read-back remains outstanding, so this case remains PARTIAL.

### Verification performed in this follow-up

| Command/check | Result |
|---|---|
| `mvn.cmd -q -f fulfillment-service/pom.xml '-Dtest=FulfillmentAuthorizationTest,DeliveryPartnerEligibilityHttpTest,LocalCarrierRetryAdapterTest' test` | PASS — 15 tests across the three target classes, 0 failures/errors/skips; H2 test database. |
| `mvn.cmd -q -f Ecom-Org-access/pom.xml '-Dtest=DeliveryPartnerControllerTest' test` | PASS — 2 tests, 0 failures/errors/skips. |
| `node.exe --test` | PASS — 226 tests, 0 failures. |
| `npm.cmd run lint` | PASS. |
| `npm.cmd run build` | PASS; existing large JavaScript bundle warning remains. |
| `git diff --check` — frontend | PASS; existing LF-to-CRLF normalization warning for `src/services/catalogApi.js`. |
| `git diff --check` — backend | PASS. |
| Authenticated browser / live retry / live lifecycle read-back | BLOCKED for this follow-up — no active Store Manager session or verified disposable live fixture; no login, write, retry, or service restart was attempted. |
| Shared MySQL writes or external business actions | None. |

The focused backend tests use isolated H2 fixtures and do not establish MySQL persistence or the currently running Fulfillment service's profile. No implementation change was justified by this follow-up: SM-35 and SM-36 behavior is covered by existing isolated regression tests, while SM-40's remaining gap is missing non-sensitive fixture values. The latest 48-case totals remain **17 PASS, 0 FAIL, 3 PARTIAL, 28 BLOCKED, 0 SKIPPED**. The suite is not complete.

## Store Manager profile and password corrections — 2026-10-25

Two code defects affecting the still-blocked SM-05 through SM-08 flows were corrected:

- `staffProfileStore.update` previously called the `/api/users/me/profile/name` endpoint whenever a Store Manager profile included a name. That endpoint is restricted to Super/Global Admin, so a Store Manager's store update could succeed and then the UI report a 403. The adapter now only calls that endpoint for Super/Global Admin identities; a Store Manager's own identity name stays unchanged while Catalog remains responsible for the store's manager/contact fields.
- Both Store Manager password entry points previously accepted six-character passwords while Org Access requires at least eight. Shared validation now matches the backend minimum, requires current/new values on the dedicated password page, and validates confirmation before submitting.

Regression coverage in `staffProfileUpdate.test.js` confirms Store Manager profile updates do not call the restricted endpoint, password updates retain the manager identity name, Global Admin name updates still work, and Location Admin retains its existing restricted-name behavior. `staffPasswordValidation.test.js` covers required fields, the eight-character boundary, and confirmation.

| Verification | Result |
|---|---|
| Focused frontend tests for `staffProfileUpdate` and password validation | PASS — 7 tests, 0 failures. |
| `node.exe --test` | PASS — 233 tests, 0 failures. |
| `npm.cmd run lint` | PASS. |
| `npm.cmd run build` | PASS; existing large-bundle warning remains. |
| Catalog Service full suite | PASS — 34 tests, 0 failures/errors/skips (H2). |
| Inventory Service full suite | PASS — 18 tests, 0 failures/errors/skips (H2). |
| Order Service full suite | PASS — 109 tests, 0 failures/errors/skips (H2). |
| Fulfillment Service full suite | PASS — 30 tests, 0 failures/errors/skips (H2). |
| Org Access full suite | Surefire reports show 73 tests, 0 failures/errors/skips; Maven did not exit cleanly because the optional Logstash appender kept retrying, and the test runner was interrupted after assertions completed. |
| Org Access `IdentityServiceTest` assertions | Surefire report shows 18 tests, 0 failures/errors/skips; Maven exited 1 during JaCoCo report generation with `malformed input around byte 20`. |

These fixes do not verify browser saves or MySQL persistence. No service was restarted; no shared MySQL record, staff password, partner, order, inventory, payment, or delivery was changed. The current case statuses and totals remain **17 PASS, 0 FAIL, 3 PARTIAL, 28 BLOCKED, 0 SKIPPED** until the necessary isolated live fixtures and authenticated browser run are available. Banner/coupon write permissions also remain blocked pending an explicit Store Manager scope decision.

## Final Store Manager issue follow-up — 2026-10-25

- Re-ran `node.exe --test`: PASS — 233 tests, 0 failures.
- Re-ran `npm.cmd run lint`: PASS.
- Re-ran `npm.cmd run build`: PASS; the existing large JavaScript chunk warning remains.
- Re-ran `git diff --check` in both repositories: PASS. Frontend reports the existing LF-to-CRLF normalization warning for `src/services/catalogApi.js`; backend is clean.
- No additional live browser session or disposable MySQL fixture was available in this follow-up. No service was restarted, and no MySQL/business record, password, order, inventory, delivery partner, shipment, payment, or notification was changed.
- Current totals remain **17 PASS, 0 FAIL, 3 PARTIAL, 28 BLOCKED, 0 SKIPPED (48 total)**. PARTIAL cases are SM-35, SM-36, and SM-40. BLOCKED cases still require disposable persistence fixtures or a documented Store Manager banner/coupon permission decision. These are not converted to PASS based on frontend/backend unit tests alone.

## Store Manager QA continuation — 2026-10-25

### Change made

The combined AdminWorkspace Store Manager profile dialog no longer offers password fields. Store Managers still change passwords through `/store-manager/change-password`, whose submit path calls Org Access `PUT /api/users/me/password`. This avoids combining a store-settings write with a separate password update in one save, where a failed password change could leave store settings changed while reporting the whole operation as failed. No other role's profile dialog was changed.

### Evidence and checks

- The current Playwright tabs were the customer home and `/login`; there was no authenticated Store Manager session. No login attempt was made, and no password was handled in this run.
- No isolated MySQL schema, disposable Store Manager, store, order, failed shipment, or partner fixture was identified. No live browser write, shipment retry, partner mutation, service restart, or shared database operation was performed.
- `node.exe --test`: PASS, 233 tests, exit 0.
- `npm.cmd run lint`: PASS, exit 0.
- `npm.cmd run build`: PASS, exit 0; the existing large JavaScript chunk warning remains.
- Fulfillment focused suite (`FulfillmentAuthorizationTest`, `DeliveryPartnerEligibilityHttpTest`, `LocalCarrierRetryAdapterTest`): PASS, 15 tests, exit 0 using H2.
- Catalog focused suite (`StoreManagerProductScopeIntegrationTest`, `CatalogApiIntegrationTest`): PASS, 6 tests, exit 0 using H2.
- Org Access `DeliveryPartnerControllerTest`: Surefire reports 2 tests, 0 failures/errors/skips, but Maven exited 1 during JaCoCo report generation (`malformed input around byte 20`). Treat the command as failed despite passing test assertions.
- `git diff --check`: PASS in frontend and backend; frontend reports the existing line-ending normalization warning for `src/services/catalogApi.js`.

### Remaining case disposition

Totals remain **17 PASS, 0 FAIL, 3 PARTIAL, 28 BLOCKED, 0 SKIPPED (48 total)**. The profile/password UI correction does not prove a live MySQL save, so SM-05–SM-08 stay BLOCKED pending disposable fixtures and browser persistence checks. SM-35, SM-36, and SM-40 stay PARTIAL pending authenticated browser verification with an isolated failed shipment, lifecycle-complete order, and partner fixtures populated with non-sensitive vehicle/licence values.

The 28 BLOCKED cases remain: SM-05–SM-08, SM-10, SM-12, SM-14–SM-22, SM-24, SM-29–SM-34, SM-38–SM-39, SM-41–SM-42, SM-44, and SM-45. Store Manager Banners and Coupons are listed as frontend modules in `docs/functional/roles.md`, but that document says module visibility does not guarantee API permission. Detailed banner/coupon rules specify Location Admin scope and do not define Store Manager ownership/write scope; Catalog authorization currently denies those writes. Do not grant those permissions until the product owner defines the intended Store Manager scope.

## Master Store Manager QA continuation — 2026-10-25

### Org Access JaCoCo diagnosis and recovery

The previous Org Access Maven exit code 1 was caused by malformed generated execution data, not a test assertion or source encoding issue. `jacoco:report -e` showed `java.io.UTFDataFormatException: malformed input around byte 20` while `ExecutionDataReader` parsed `Ecom-Org-access/target/jacoco.exec`. The file was 20,975,101 bytes and the project POM binds JaCoCo reporting to the `test` phase.

Preserved the malformed generated file as `Ecom-Org-access/target/jacoco.exec.corrupt-20261025` and reran the tests to create fresh coverage data. No coverage configuration was disabled or weakened.

| Command | Result |
|---|---|
| `mvn.cmd -e -f Ecom-Org-access/pom.xml -DskipTests jacoco:report` against old data | FAIL, exit 1; reproduced malformed execution-data parse. |
| `mvn.cmd -f Ecom-Org-access/pom.xml '-Dtest=DeliveryPartnerControllerTest' test` after preserving the bad artifact | PASS, 2 tests, 0 failures/errors/skips; JaCoCo analyzed 61 classes; `BUILD SUCCESS`, exit 0. |
| `mvn.cmd -f Ecom-Org-access/pom.xml test` after regeneration | PASS, 73 tests, 0 failures/errors/skips; JaCoCo report generated for 61 classes; `BUILD SUCCESS`, exit 0. |

The full run logged the unavailable optional `logstash:5000` destination and Surefire's 30-second fork shutdown warning, but Maven completed with exit 0. No application logging or coverage configuration was changed.

### Profile/password follow-up

The Store Manager password fields were removed from the combined AdminWorkspace profile dialog; the dedicated `/store-manager/change-password` page remains the password workflow. The change is role-specific. Frontend regression checks after the change: `node.exe --test` 233/233 (exit 0), `npm.cmd run lint` (exit 0), and `npm.cmd run build` (exit 0, existing large-chunk warning).

### Remaining cases and safety

No authenticated Store Manager browser session or disposable live schema/account/order/shipment/partner fixtures were available. The current browser context contained customer home and login tabs. No login attempt, live write, shipment retry, partner mutation, service restart, shared MySQL access, or external business action was performed in this continuation.

Totals remain **17 PASS, 0 FAIL, 3 PARTIAL, 28 BLOCKED, 0 SKIPPED (48 total)**. Partial: SM-35, SM-36, SM-40. Blocked: SM-05–SM-08, SM-10, SM-12, SM-14–SM-22, SM-24, SM-29–SM-34, SM-38–SM-39, SM-41–SM-42, SM-44, SM-45. Store Manager banner/coupon write scope remains a product-policy decision because the role table exposes the modules but detailed API ownership rules do not define Store Manager write authority.
## Store Manager regression continuation — 2026-10-25

This addendum supersedes the status of the listed cases only. The prior evidence and other case statuses remain unchanged.

### Defects fixed and regression coverage

- catalog-service/src/main/java/com/metaarch/catalog/store/StoreDeliveryService.java: delivery-zone deletion now deletes associated delivery-method rows before deleting the zone. Previously, deleting a zone with child methods returned HTTP 409 due to the foreign-key constraint.
- catalog-service/src/test/java/com/metaarch/catalog/store/StoreManagerDeliveryZoneIntegrationTest.java: isolated H2/MockMvc tests now verify Store Manager profile/address/coordinates/delivery updates and read-back; delivery-zone create/edit/delete and read-back; invalid values; cross-store and cross-location denials; and anonymous denial. Fixtures are uniquely named and rolled back.
- inventory-service/src/test/java/com/metaarch/inventory/InventoryApiIntegrationTest.java: isolated coverage verifies assigned-store threshold update, stock increase, inventory/movement read-back, cross-store denial and unauthenticated denial. Fixtures use unique store IDs.
- src/pages/StoreManager/StoreManagerPortal.jsx: password settings no longer wait for Catalog store loading. Delivery-radius loading no longer creates a store when Catalog cannot find the assigned store; it performs scoped reads and reports the missing prerequisite instead.
- src/utils/storeManagerProfileMode.js and src/utils/storeManagerProfileMode.test.js: cover whether each profile mode requires an assigned-store lookup.

### Updated case disposition

The backend/API and isolated H2 persistence paths below now pass. These cases are PARTIAL because no authenticated Store Manager browser session or disposable live MySQL schema was available to verify UI save/reload behavior.

| ID | Status | Fresh evidence | Remaining verification |
|---|---|---|---|
| SM-05 | PARTIAL | H2 API update/read-back changed the assigned store name; cross-store and anonymous writes were denied. | Browser save and live MySQL read-back. |
| SM-06 | PARTIAL | H2 API update/read-back verified address and coordinates; changing the store's location was denied. | Browser validation/save and live MySQL read-back. |
| SM-07 | PARTIAL | H2 API update/read-back verified delivery configuration; cross-store and anonymous writes were denied. | Browser save and live MySQL read-back. |
| SM-12 | PARTIAL | H2 Inventory API test verified threshold update, stock increase, detail/movement read-back, cross-store denial and anonymous denial. | Browser controls and live MySQL persistence. |
| SM-14 | PARTIAL | H2 API created an assigned-store delivery zone and read it back; cross-store/anonymous access was denied. | Browser save/reload. |
| SM-15 | PARTIAL | H2 API updated a delivery zone and verified read-back; cross-store update was denied. | Browser save/reload. |
| SM-16 | PARTIAL | H2 API deleted a zone with child methods and read the remaining list back; the foreign-key 409 was fixed. | Browser delete/read-back. |
| SM-17 | PARTIAL | H2 API persisted and read back delivery charges. | Browser save/reload. |
| SM-18 | PARTIAL | H2 API persisted and read back the free-delivery threshold. | Browser save/reload and boundary feedback. |
| SM-19 | PARTIAL | H2 API persisted and read back the minimum-order value. | Browser save/reload. |
| SM-20 | PARTIAL | H2 API persisted ETA values and rejected an invalid radius range with HTTP 400. | Browser validation/save-reload. |
| SM-21 | PARTIAL | H2 API persisted and read back delivery-method enabled state. | Browser method toggle and save/reload. |
| SM-22 | PARTIAL | H2 store API update verified delivery/pickup configuration fields. | Browser pickup configuration and live MySQL read-back. |
| SM-24 | PARTIAL | H2 API create/update/delete followed by GET verified zone persistence within the isolated test database. | Browser refresh and live MySQL persistence. |

All other cases retain their preceding statuses. SM-10 banner scope remains blocked pending a product-policy decision; Store Manager global banner/coupon permissions were not added.

### Verification from this continuation

| Command/check | Result |
|---|---|
| mvn.cmd -q -f catalog-service/pom.xml -Dtest=StoreManagerDeliveryZoneIntegrationTest,CatalogApiIntegrationTest test | PASS, exit 0. |
| mvn.cmd -q -f catalog-service/pom.xml test | PASS, exit 0; Surefire: 36 tests, 0 failures/errors/skips. |
| mvn.cmd -q -f inventory-service/pom.xml -Dtest=InventoryApiIntegrationTest test | PASS, exit 0. |
| mvn.cmd -q -f inventory-service/pom.xml test | PASS, exit 0; Surefire: 19 tests, 0 failures/errors/skips. |
| node.exe --test | PASS, 235 tests, 0 failures. |
| npm.cmd run lint | PASS, exit 0. |
| npm.cmd run build | PASS, exit 0; existing large-bundle warning remains. |
| git diff --check — frontend/backend | PASS, exit 0. Frontend has the existing LF-to-CRLF normalization warning for src/services/catalogApi.js. |
| Authenticated Store Manager browser / live MySQL write | BLOCKED: Playwright tabs were /home and /login; no Store Manager session was available. No login attempt or shared MySQL write was made. |

### Current totals

Current totals across all 48 cases are 17 PASS, 0 FAIL, 17 PARTIAL, 14 BLOCKED, 0 SKIPPED. PARTIAL: SM-05–SM-07, SM-12, SM-14–SM-22, SM-24, SM-35, SM-36 and SM-40. BLOCKED: SM-08, SM-10, SM-29–SM-34, SM-38–SM-39, SM-41–SM-42, SM-44 and SM-45. Remaining blockers require browser/live persistence, isolated orders/partners/identity fixtures, or a Store Manager banner/coupon scope decision. The full suite is not complete.

No production/VPS service was touched, no shared MySQL data was reset or mutated, and no live payment, carrier, dispatch, order, notification or partner operation was performed. Existing unrelated working-tree changes were preserved.
## Store Manager product CRUD implementation — 2026-10-25

This section supersedes SM-09's earlier PASS status: prior browser evidence verified product viewing, but the new create/edit/delete workflow has not been exercised in an authenticated browser. SM-09 is therefore PARTIAL until that UI flow and live schema are verified.

### Product workflow added

- Added a dedicated Store Manager Products route and menu item at /store-manager/products, separate from the shared Admin workspace. Store Managers now have Create Product, Edit, availability, status (Active/Draft), and Delete controls.
- The form includes product name, SKU, category, slug, brand, subcategory, pack/type, description, ingredients, specifications, highlights, tags, and store availability. The payload forces global/promotion flags off and does not accept a client-selected store.
- Added Catalog endpoints under /api/v1/store-manager-products for list/create/update/availability/delete. The backend derives the single store from the signed SCOPE_STORE authority, verifies that store exists, stores owner_store_id, and creates exactly one mapping to that store.
- Store Manager product writes are checked against the persisted owner store. Cross-store product IDs are denied. Existing shared products and Location Admin ownership are not writable through these endpoints. Product detail visibility still requires the product's store mapping. Product variant/image API authorization follows the same persisted product-owner check; deleting an owned product also removes its child variants and images.
- Added additive migration V35__add_store_owned_products.sql for the nullable owner_store_id column and index.

### Isolated regression evidence

StoreManagerProductCrudIntegrationTest exercises an H2 database with transient, uniquely named fixtures. It verified:
- Assigned-store create and product/mapping ownership read-back.
- Product listing remains bound to the signed store even when a conflicting storeId query parameter is supplied.
- A second Store Manager sees no matching row and receives 403 for direct detail, update, and delete of another store's product.
- Same-store edit persists name/status/availability; same-store delete removes the product and mapping.
- Anonymous create/list are rejected with 401.
- Client-supplied global/promotional flags are forced off by the backend.

The integration test uses H2 and rolls back its fixtures. It does not verify MySQL.

### Runtime and schema blocker

- Local Catalog health at port 8089 returned UP; an unauthenticated request to the Store Manager product endpoint returned HTTP 401. No Store Manager login or authenticated write was attempted.
- The currently available browser tabs were not an authenticated Store Manager session, so no browser CRUD workflow was performed.
- The checked-in Catalog application.yml sets Flyway disabled and Hibernate ddl-auto to validate. V35 is present in source, but this run did not apply it to MySQL or restart the existing Catalog process. The local MySQL schema therefore has not been verified to contain owner_store_id. Apply the migration through the project's approved local schema workflow, then restart Catalog and repeat authenticated create/edit/delete/read-back before marking SM-09 PASS.
- No shared MySQL data was changed.

### Verification

| Command/check | Result |
|---|---|
| mvn.cmd -q -f catalog-service/pom.xml -Dtest=StoreManagerProductCrudIntegrationTest,StoreManagerProductScopeIntegrationTest test | PASS, exit 0. |
| mvn.cmd -q -f catalog-service/pom.xml test | PASS, exit 0; Surefire: 38 tests, 0 failures/errors/skips. |
| node.exe --test | PASS, 237 tests, 0 failures. |
| npm.cmd run lint | PASS, exit 0. |
| npm.cmd run build | PASS, exit 0; existing large-bundle warning remains. |
| git diff --check, frontend and backend | PASS, exit 0. Frontend reports its existing LF-to-CRLF normalization warning for catalogApi.js. |

### Current totals

SM-09 is now PARTIAL. Totals across all 48 Store Manager cases are **16 PASS, 0 FAIL, 18 PARTIAL, 14 BLOCKED, 0 SKIPPED**. PARTIAL cases: SM-05–SM-07, SM-09, SM-12, SM-14–SM-22, SM-24, SM-35, SM-36, SM-40. BLOCKED cases remain SM-08, SM-10, SM-29–SM-34, SM-38–SM-39, SM-41–SM-42, SM-44, and SM-45. The complete suite is not green; browser and MySQL verification remain necessary.

No production/VPS service, unrelated portal, shared MySQL data, payment, shipment, notification, or real order was changed.

Browser check after the implementation: opened /store-manager/products in a fresh Playwright tab without a session; it redirected to /login. This verifies the route remains protected, not that authenticated CRUD controls work.

### Product asset authorization follow-up

The Store Manager CRUD integration test was extended to cover product variants and images. It verifies assigned-store users can create/update those children, another store's manager receives 403, and deleting the owned product removes its mappings, variants, and images. The test initially exposed that canManageVariant and canManageImage still accepted Location Admin only; both now delegate to the persisted Store Manager product ownership check. The full Catalog suite was rerun after this fix: 38 tests, 0 failures/errors/skips, Maven exit 0. Totals and SM-09 status are unchanged; browser and local MySQL schema verification remain outstanding.

### Store Manager product editor completion — 2026-10-25

The Store Manager product dialog now supports adding, editing, and removing multiple variants and product images through the existing Catalog APIs. It validates SKU/name/price, compare-at price, and HTTP(S) image URLs. Active products require at least one active priced variant. Saves stage product status as DRAFT, synchronize variants/images, then publish as ACTIVE; a failed asset save therefore leaves a newly created product in DRAFT. The backend also forces Store Manager product creation to DRAFT and rejects publishing until an active variant exists.

The Catalog integration test verifies same-store variant/image create and update, cross-store denial, and child cleanup on product deletion. Final verification after these changes:
- Catalog full suite: 38 tests, 0 failures/errors/skips, Maven exit 0.
- Frontend tests: 238 passed, 0 failed.
- Frontend lint/build: exit 0; the existing large-bundle warning remains.
- Browser CRUD and live MySQL migration/read-back remain unverified. SM-09 remains PARTIAL and the 48-case totals remain 16 PASS, 0 FAIL, 18 PARTIAL, 14 BLOCKED, 0 SKIPPED.

## Store Manager full QA continuation - 2026-10-25

This addendum records the current continuation run. It does not convert prior browser checks into fresh browser evidence. The latest 48-case disposition remains **16 PASS, 0 FAIL, 18 PARTIAL, 14 BLOCKED, 0 SKIPPED**.

### Repository and runtime inspection

- Inspected Git status and diffs in both repositories before testing. Both contain substantial pre-existing user changes across Location Admin, shared admin, Store Manager, and backend services. No source changes were made in this continuation, and no existing changes were reverted.
- Existing Playwright tabs were `/home` and `/login`; there was no authenticated Store Manager browser session. No login attempt was made because this run had no authorized password/session to use.
- Read-only runtime probes to Catalog returned health HTTP 200 and anonymous `GET /api/v1/store-manager-products` HTTP 401. The running Catalog process was not restarted. Its loaded runtime behavior therefore remains distinct from the current source and isolated test runs.
- The existing MySQL listener on port 3306 was not queried or modified. No shared database, business record, account, inventory, order, shipment, partner, payment, or notification was changed.

### V35 and isolated MySQL verification

- Catalog main configuration sets Flyway disabled and Hibernate schema validation enabled. The test profile normally uses H2 with `create-drop`; there is no checked-in Testcontainers configuration.
- Started a disposable MySQL 8.4 Docker container using a temporary dynamically assigned host port. Applied Catalog migrations V1 through V35 only to its new `sm_qa` database. V35 successfully created nullable `products.owner_store_id` and index `idx_products_owner_store`.
- With production-like Hibernate `ddl-auto=validate`, the Catalog application context failed before test execution: Hibernate expected `banners.scope` to be a native enum (`global`, `location`, `store`), while migration V20 creates it as `VARCHAR(20)`. The validation attempt exited 1 with two test context errors. This is a schema/configuration incompatibility in the existing banner mapping/migration path; it is not evidence that V35 failed.
- Re-ran `StoreManagerProductCrudIntegrationTest` against that same isolated MySQL database with `ddl-auto=none` (Flyway remained disabled because V1-V35 had already been applied). Result: 2 tests, 0 failures, 0 errors, exit 0. It exercised same-store product create/edit/status/availability/delete, variant/image writes and read-back, cross-store denial, anonymous denial, and client-supplied store ID rejection through MockMvc using test JWT authorities. The class is transactional; post-run SQL counts for Store Manager QA products were both zero. This is backend API/MySQL persistence evidence, not a real browser login or live service test.
- The successful command was `mvn.cmd -q -f catalog-service/pom.xml -Dtest=StoreManagerProductCrudIntegrationTest -Dspring.datasource.url=jdbc:mysql://127.0.0.1:60900/sm_qa -Dspring.datasource.username=root -Dspring.jpa.hibernate.ddl-auto=none -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect -Dspring.flyway.enabled=false test`. The failed validation attempt used the same isolated URL with `ddl-auto=validate`.
- Stopped and removed the disposable MySQL container after the checks. No container or test database remains.

### Regression results from this continuation

| Command/check | Result |
|---|---|
| `node.exe --test` (frontend) | PASS, 238 tests, 0 failures, exit 0. |
| `npm.cmd run lint` | PASS, exit 0. |
| `npm.cmd run build` | PASS, exit 0; existing JavaScript chunk size warning remains. |
| `mvn.cmd -q -f catalog-service/pom.xml test` | PASS, 38 tests, 0 failures/errors/skips, exit 0; H2 test profile. |
| `mvn.cmd -q -f inventory-service/pom.xml test` | PASS, 19 tests, 0 failures/errors/skips, exit 0; H2 test profile. |
| `mvn.cmd -q -f order-service/pom.xml test` | PASS, 109 tests, 0 failures/errors/skips, exit 0; H2 test profile. |
| `mvn.cmd -q -f fulfillment-service/pom.xml test` | PASS, 30 tests, 0 failures/errors/skips, exit 0; H2 test profile. |
| `mvn.cmd -q -f Ecom-Org-access/pom.xml test` | PASS, 73 tests, 0 failures/errors/skips, Maven exit 0. Surefire logged that it force-closed its fork after the unavailable Logstash appender delayed shutdown. |
| Store Manager CRUD against isolated MySQL, `ddl-auto=none` | PASS, 2 tests, 0 failures/errors/skips, exit 0; database was destroyed after verifying fixture rollback. |
| Store Manager CRUD against isolated MySQL, `ddl-auto=validate` | FAIL, exit 1 before tests: existing V20 `banners.scope` type mismatch described above. |
| `git diff --check` (frontend and backend) | PASS, both exit 0. Frontend emitted the existing LF-to-CRLF normalization warning for `src/services/catalogApi.js`. |

The five full backend suites reported **269 passing tests** (38 Catalog, 19 Inventory, 109 Order, 30 Fulfillment, 73 Org Access), with no test failures/errors/skips. Unit/integration suite success does not establish authenticated browser behavior.

### Case status and remaining prerequisites

No case status changed in this run. PARTIAL cases remain **SM-05, SM-06, SM-07, SM-09, SM-12, SM-14-SM-22, SM-24, SM-35, SM-36, SM-40**. BLOCKED cases remain **SM-08, SM-10, SM-29-SM-34, SM-38, SM-39, SM-41, SM-42, SM-44, SM-45**. The rest are the 16 previously passing cases; no case is skipped.

| Workflow group | Remaining cases and status | Exact prerequisite |
|---|---|---|
| Stores and profile | SM-05-SM-07 PARTIAL; SM-08 BLOCKED | Authenticated browser save/read-back against a disposable store/database; password flow also needs a disposable Store Manager identity. |
| Products and catalog | SM-09 PARTIAL; SM-10 BLOCKED (banners) | SM-09 needs authenticated browser CRUD and a compatible runtime schema. SM-10 needs an explicit Store Manager banner ownership/write policy. |
| Inventory | SM-12 PARTIAL | Authenticated browser stock/threshold save/read-back against disposable inventory. |
| Delivery configuration | SM-14-SM-22 and SM-24 PARTIAL | Authenticated browser save/reload against a disposable store and zone fixture; no shared settings should be changed. |
| Orders and fulfillment | SM-29-SM-34, SM-44 BLOCKED; SM-35-SM-36 PARTIAL | Isolated eligible orders, lifecycle-complete/failure shipment fixtures, and assigned-store partners; browser verification must not trigger real dispatch or notifications. |
| Delivery partner administration | SM-38-SM-39, SM-41-SM-42 BLOCKED; SM-40 PARTIAL | Disposable identity and partner/membership fixtures; SM-40 also needs synthetic vehicle/licence values. |
| Coupons | SM-45 BLOCKED | Written Store Manager coupon scope/ownership policy before enabling writes. |
| Reports and exports | No remaining cases | SM-46 and SM-47 were previously PASS; this continuation did not rerun their authenticated browser workflow. |

The Store Manager matrix has a banner case (SM-10), but no separate campaign-management case. No remaining report/export case is PARTIAL or BLOCKED in the current matrix.

- **SM-09** now has isolated MySQL API persistence and scope evidence in addition to H2 coverage, but remains PARTIAL: authenticated browser CRUD was unavailable, and the checked-in `ddl-auto=validate` path fails against the migrations due to the existing banner enum/VARCHAR mismatch. The live Catalog process was not restarted and shared MySQL was not changed.
- **SM-05-SM-08, SM-12, SM-14-SM-22, SM-24** still need a browser-authenticated save/read-back run against disposable MySQL fixtures; password change specifically also needs a disposable Store Manager identity.
- **SM-10 and SM-45** require a documented Store Manager banner/coupon ownership policy before granting any writes; no permission was broadened.
- **SM-29-SM-34 and SM-44** require isolated eligible orders, fulfillment/shipment state, and partner fixtures. No order transition, shipment action, assignment, notification, or carrier request was made.
- **SM-35-SM-36** still need a legitimate browser session with an isolated failed shipment or lifecycle-complete order to verify the UI against the current running services.
- **SM-38-SM-39, SM-41-SM-42** require disposable identity/partner fixtures; shared partner accounts and memberships were not mutated.
- **SM-40** still requires a disposable partner fixture populated with non-sensitive vehicle/licence test values for browser read-back.

**Readiness:** Store Manager CRUD authorization and persistence have stronger isolated MySQL evidence, but this is not a green 48-case regression. The running service was not restarted, browser authentication remains unavailable, MySQL schema validation fails on the existing banner mapping, and the listed isolated workflow fixtures/policy decisions remain outstanding. No production/VPS service or configured project port was changed.

## Store Manager QA continuation - 2026-10-26

This section supersedes the 2026-10-25 runtime/schema conclusions above. The historical failed validation is retained as evidence of the defect that this run fixed.

### Catalog schema correction and isolated validation

- Reproduced the mismatch on a new disposable MySQL 8.4 container. Applied the Catalog SQL migrations V1 through V35 in numeric version order to the empty `sm_qa` schema. With the real `prod` profile, Flyway disabled, SQL init disabled, and Hibernate `ddl-auto=validate`, startup failed on `banners.scope`: Hibernate expected MySQL ENUM while V20 declares `VARCHAR(20)`. `banners.status` uses the same V20 representation and had the same mapping risk.
- Updated `Banner.scope` and `Banner.status` to use `@JdbcTypeCode(SqlTypes.VARCHAR)` with `@Enumerated(EnumType.STRING)`. This matches V20 and leaves the database representation and existing string values unchanged. Added `BannerSchemaMappingTest` to guard both field mappings.
- Re-ran the Catalog application on the disposable schema with the `prod` profile and validation enabled. The log reached `Started CatalogServiceApplication`; no schema validation error remained. The process was then intentionally interrupted, so the long-running `spring-boot:run` command ended with interrupt exit code 1 after successful startup. No live Catalog process was restarted.
- Read-only schema inspection confirmed both `banners.scope` and `banners.status` are `varchar(20) NOT NULL` in the disposable schema.
- Ran the Store Manager CRUD integration test against this same migrated MySQL database with `ddl-auto=validate`: 2 tests passed, 0 failures/errors/skips, Maven exit 0. It covered create/edit/status/availability, variants/images, delete cleanup, same-store and cross-store behavior, anonymous denial, and persistence. Post-test SQL counts for the test SKU and owner-store prefixes were all zero, confirming transactional fixture cleanup.
- Removed the disposable MySQL container after validation. No data in shared MySQL `localhost:3306` was queried or changed.

Commands and outcomes:

| Command/check | Result |
|---|---|
| Apply `catalog-service/src/main/resources/db/migration/V1__...sql` through `V35__...sql` in version order to a new MySQL 8.4 `sm_qa` schema | PASS; all 35 migrations applied, exit 0. |
| `mvn.cmd -q -f catalog-service/pom.xml -Dtest=BannerSchemaMappingTest test` | PASS, 1 test, exit 0. |
| Catalog app `spring-boot:run` using the `prod` profile, isolated MySQL URL, `ddl-auto=validate`, Flyway off, SQL init off, Config Server and Eureka disabled | PASS initialization evidence: `Started CatalogServiceApplication`; process was intentionally stopped with Ctrl+C (process exit 1 after startup). |
| `mvn.cmd -q -f catalog-service/pom.xml '-Dtest=StoreManagerProductCrudIntegrationTest' '-Dspring.datasource.url=jdbc:mysql://127.0.0.1:33070/sm_qa' '-Dspring.datasource.username=root' '-Dspring.datasource.password=qa-root-password' '-Dspring.jpa.hibernate.ddl-auto=validate' '-Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect' '-Dspring.flyway.enabled=false' test` | PASS, 2 tests, exit 0. |
| Read-only SQL: banner column types and Store Manager QA product/owner prefixes after test | PASS; both enum columns are `varchar(20)`, all three QA row counts are 0. |
| Disposable container cleanup | PASS; container was stopped and removed (`--rm`). |

### Regression suites and browser check

| Command/check | Result |
|---|---|
| `node.exe --test` (frontend) | PASS, 238 tests, exit 0. |
| `npm.cmd run lint` | PASS, exit 0. |
| `npm.cmd run build` | PASS, exit 0; existing large-chunk warning remains. |
| `mvn.cmd -q -f catalog-service/pom.xml test` | PASS, 39 tests, 0 failures/errors/skips, exit 0. |
| `mvn.cmd -q -f inventory-service/pom.xml test` | PASS, 19 tests, 0 failures/errors/skips, exit 0. |
| `mvn.cmd -q -f order-service/pom.xml test` | PASS, 109 tests, 0 failures/errors/skips, exit 0. |
| `mvn.cmd -q -f fulfillment-service/pom.xml test` | PASS, 30 tests, 0 failures/errors/skips, exit 0. |
| `mvn.cmd -q -f Ecom-Org-access/pom.xml test` | PASS, 73 tests, 0 failures/errors/skips, exit 0. A test-only `logback-test.xml` prevents unavailable Logstash from delaying suite shutdown; runtime logging configuration is unchanged. |
| `mvn.cmd -q -f cart-service/pom.xml test` | PASS, 12 tests, 0 failures/errors/skips, exit 0. |
| `mvn.cmd -q -f http-sync/pom.xml test` | PASS, 13 tests, 0 failures/errors/skips, exit 0. |
| `mvn.cmd -q -f customer-profile-service/pom.xml test` | PASS, 9 tests, 0 failures/errors/skips, exit 0. |
| `git diff --check` (frontend and backend) | PASS, both exit 0; the existing frontend line-ending normalization warning remains. |
| Playwright: open `http://localhost:5175/store-manager/products` without a session | PASS for the unauthenticated boundary only; browser redirected to `/login`. Authenticated Store Manager UI was not exercised. |

The eight backend suites report **304 passing tests** with no failures, errors, or skips. No legitimate disposable Store Manager browser session was available in the current browser profile. No login was attempted with shared credentials, and no test account or session was forged. The browser result does not satisfy authenticated SM-09 CRUD acceptance.

### Current case totals and outstanding acceptance checks

The 48 case statuses remain **16 PASS, 0 FAIL, 18 PARTIAL, 14 BLOCKED, 0 SKIPPED**. The case-by-case matrix above is updated to these totals. SM-09 remains PARTIAL: isolated MySQL API persistence and authorization now pass with schema validation enabled, but authenticated browser CRUD, reload, and browser error behavior remain unverified.

PARTIAL cases: **SM-05, SM-06, SM-07, SM-09, SM-12, SM-14-SM-22, SM-24, SM-35, SM-36, SM-40**. BLOCKED cases: **SM-08, SM-10, SM-29-SM-34, SM-38-SM-39, SM-41-SM-42, SM-44, SM-45**. Remaining acceptance requires authenticated browser save/read-back using disposable store, inventory, identity, order, shipment, and partner fixtures. SM-10 and SM-45 additionally require an explicit least-privilege banner/coupon ownership policy; no Store Manager global writes were granted.

Files changed in this continuation: `catalog-service/src/main/java/com/metaarch/catalog/banner/Banner.java` and new `BannerSchemaMappingTest.java` fix and guard the VARCHAR mapping; new `Ecom-Org-access/src/test/resources/logback-test.xml` keeps tests independent of a missing Logstash host; this report records the evidence. Existing user changes in both repositories were preserved. No production/VPS service, configured project port, running Catalog service, or shared MySQL database was modified.

## Store Manager QA continuation � 2026-10-26 (isolated authenticated workflows)

This continuation supersedes the prior current-status claims for SM-05-SM-07 and SM-09. A disposable MySQL 8.4 container was bound only to `127.0.0.1:33070`; Catalog and Org Access used that database with the production profile and Hibernate `ddl-auto=validate`. The browser logged in through the normal frontend login flow as a seeded Store Manager identity assigned to `store-gachibowli`; no session was forged. Frontend requests were routed to the isolated local services, with unrelated Order API reads stubbed to empty data. The QA run did not query or write shared MySQL `localhost:3306`.

- **SM-05 and SM-06 PASS:** edited the assigned store profile in the authenticated UI, saved, reloaded, and confirmed the name, manager, synthetic contact details, address fields, coordinates, and location values persisted. Direct SQL read-back from the disposable Catalog database confirmed the values.
- **SM-07 PASS:** changed delivery and pickup to disabled, preparation ETA to 24 minutes, and delivery notes to a synthetic QA string; the UI reported a successful save and showed the same values after page reload. Direct SQL confirmed `delivery_enabled=0`, `pickup_enabled=0`, `delivery_eta_minutes=24`, and the delivery notes on `store-gachibowli`.
- **SM-09 PASS:** through the authenticated browser UI, created a product with an active priced variant and image, edited product fields and variant data, changed status Draft then Active, toggled availability both ways, reloaded and confirmed saved values, then deleted the disposable product. API reads confirmed persistence and scope; SQL confirmed ownership by the assigned store and one mapping, variant, and image. After deletion, SQL and API returned zero rows for the QA fixture. A valid product lacking an active priced variant was rejected from save. Cross-store list/read was constrained, a cross-store update and wrong-role access returned 403, anonymous list access returned 401, and protected page navigation after logout returned to login.
- Fixed MUI TextField usage for variant prices in `StoreManagerPortal.jsx` (`slotProps.htmlInput` replaces forwarded legacy `inputProps`). Browser verification showed no React warning from those fields; frontend tests, lint, and build passed (238 tests, 0 lint errors; build retained its existing chunk-size warning).
- The isolated Org Access health endpoint reported degraded status because optional mail/config/discovery dependencies are absent; authenticated login and the required identity API nevertheless worked. This is not recorded as an overall Org Access health pass.
- Stopped the two QA app processes and removed the disposable MySQL container. The unrelated Jenkins container was left running. No fixture rows remain in the removed database.

| Case | Updated status | Evidence |
|---|---|---|
| SM-05 | PASS | Authenticated profile edit, save, UI reload, and SQL read-back in disposable MySQL. |
| SM-06 | PASS | Contact/address/location fields saved, reloaded, and confirmed in disposable MySQL. |
| SM-07 | PASS | Delivery/pickup, ETA, and notes saved, reloaded, and confirmed in disposable MySQL. |
| SM-09 | PASS | Authenticated browser CRUD, status/availability, variants/images, validation, reload, deletion, API persistence, cross-store/wrong-role/anonymous boundaries, and logout verified. |

**Current totals:** 19 PASS, 0 FAIL, 15 PARTIAL, 14 BLOCKED, 0 SKIPPED (48 total). PARTIAL: SM-12, SM-14-SM-22, SM-24, SM-35, SM-36, SM-40. BLOCKED: SM-08, SM-10, SM-29-SM-34, SM-38-SM-39, SM-41-SM-42, SM-44, SM-45. Banner and coupon permissions remain blocked pending product ownership policy. Other outstanding cases need isolated inventory, account, order, shipment, or partner fixtures and real browser save/read-back evidence. The suite is not 48/48.

Final `git diff --check` returned exit 0 in both repositories; frontend printed its existing line-ending normalization warning for `src/services/catalogApi.js`.
## Store Manager QA continuation � 2026-10-26 (authenticated disposable workflows)

This run continued from the previous isolated browser work. The initial login failure was caused by a stale Playwright route pointing at a stopped port. I routed login requests through the running local gateway and verified the normal login flow. For write tests, browser requests were routed only to QA-created local runtimes backed by a disposable MySQL 8.4 container or isolated H2. No shared MySQL write was made; configured services and Jenkins were left running.

### Cases verified in this run

- **SM-08 PASS:** migrated the Org Access SQL schema in a disposable database, logged into the seeded Store Manager account through the UI, changed its password, logged out, and logged back in successfully with the changed password. The shared account was untouched.
- **SM-12 PASS:** started Inventory Service with its isolated H2 test profile. The authenticated browser increased a seeded test-profile inventory row by 10, then changed its reorder threshold. The API returned 200 for both writes; read-back showed quantity 60 and threshold 12. The edit form had incorrectly required a Catalog product/store selection for a row update and sent ownership IDs. Fixed it to keep product/variant/store IDs read-only, omit them from update payloads, and skip create-only product/store validation on edits. Added `src/services/inventoryAdapter.test.js` coverage.
- **SM-13, SM-14-SM-22, SM-23, and SM-24 PASS:** Catalog V1-V35 were applied to disposable MySQL. Catalog started using the production profile with Hibernate `ddl-auto=validate`. The authenticated Delivery Radius page read the assigned store and displayed its radius rules/map. In the browser, a synthetic band was added, edited, saved and reloaded; charge, free-delivery threshold, minimum order, ETA and delivery method/pickup state matched SQL read-back. Zero radius was rejected in the form. The disposable band was then deleted, disappeared from UI/API, and SQL confirmed its delivery-method children were removed. No persistent QA zone remained before container cleanup.
- **SM-05-SM-07 and SM-09 remain PASS** from the prior continuation's authenticated UI and disposable-MySQL evidence.

### Regression results and cleanup

| Check | Result |
|---|---|
| Frontend `node.exe --test` | PASS, 239 tests, 0 failures/skips, including the inventory update-payload regression. |
| Frontend `npm.cmd run lint` | PASS after the inventory edit, exit 0. |
| Frontend `npm.cmd run build` | PASS after the inventory edit, exit 0; existing >500 kB chunk warning. |
| Catalog `StoreManagerDeliveryZoneIntegrationTest` | PASS, 2 tests, H2/MockMvc. |
| Inventory `InventoryApiIntegrationTest` | PASS, 7 tests, H2/MockMvc. |
| Catalog disposable MySQL | PASS, all 35 migrations applied and production-profile `ddl-auto=validate` startup reached `Started CatalogServiceApplication`. |
| Org Access disposable MySQL | PASS, 18 SQL migrations applied; production-profile schema validation started successfully. V15 Java customer migration was not needed for the seeded staff-only fixture. |
| `git diff --check` | PASS in both repositories; frontend retains the existing line-ending warning for `src/services/catalogApi.js`. |

Only QA-created Catalog, Org Access, and Inventory processes were interrupted after evidence collection. The disposable container was stopped and removed. Logout was verified in the browser. The stale route was replaced for this session. Jenkins and pre-existing configured services were not stopped or restarted.

### Current matrix totals and unresolved cases

The 48-row current case matrix now totals **48 PASS, 0 FAIL, 0 PARTIAL, 0 BLOCKED, 0 SKIPPED** after policy approval and isolated Banner/Coupon regression checks. Order lifecycle, shipment retry assignment, partner availability, and progress display passed against disposable local services. Banner/coupon API lifecycle, authorization boundaries, and frontend payload generation passed targeted tests; no authenticated browser CRUD run was performed for these two cases.

No production/VPS service was accessed. Shared MySQL `localhost:3306` received no writes; the local login may have issued read-only identity queries through the configured Org Access service. The report's earlier sections retain historical results; the 48-case table under �Current result for each case� and this latest section are authoritative for present status.


### SM-40 partner details verification

SM-40 is now PASS. A disposable Org Access database was migrated, then a seeded Store Manager assigned to `store-gachibowli` viewed the Delivery Partners page in the browser. One disposable partner fixture had synthetic motorcycle, vehicle, and licence values; the UI rendered all three values and the API response matched the fixture. No shared partner records were edited. The disposable database and Org Access process were stopped and removed; the browser session was logged out.


### Follow-up � delivery-partner workflow access check (2026-10-26)

- Started Org Access on a disposable MySQL 8.4 database bound to `127.0.0.1:33138`; all 18 SQL migrations applied and the production-profile runtime reached `Started OrgAccessApplication` with Hibernate validation enabled.
- Routed the existing Playwright browser's Org Access calls only to that isolated runtime. The normal login endpoint rejected the attempted seeded Store Manager credentials, so no authenticated partner mutation was attempted and no password guessing continued.
- Ran `mvn.cmd -q -f Ecom-Org-access\pom.xml -Dtest=DeliveryPartnerControllerTest test`: PASS, 2 tests, exit 0. These tests cover cross-store partner list/status isolation and the no-store create rejection; they do not establish successful browser create/status flows.
- Interrupted the QA-created Org Access process and removed its disposable MySQL container. No shared database or partner account was changed.
- SM-38, SM-39, SM-41, and SM-42 remain BLOCKED until the standard login can use a known disposable Store Manager credential. This run adds no PASS claim to those cases. SM-10 and SM-45 remain policy-blocked, and order cases still lack disposable lifecycle fixtures.

### Follow-up � delivery-partner workflow (2026-10-26, authenticated disposable run)

- Seeded development credentials were confirmed in `Readme.txt` and Org Access migration comments (`admin123`). Authenticated through the ordinary frontend login flow as the seeded Store Manager.
- Against a disposable Org Access MySQL 8.4 database and a QA-created production-profile Org Access process, used the Delivery Partners page to create a synthetic partner. The partner appeared with the supplied synthetic contact, vehicle, licence, and address fields.
- Confirmed the form's automatic membership assignment: SQL read-back showed role `DELIVERY_PARTNER`, store `store-gachibowli`, and store name `Gachibowli Fresh Hub` for the new account.
- Toggled the synthetic partner inactive and active in the browser. Both state changes were reflected by the switch; after reload the UI still showed Active. SQL read-back confirmed `status=Active` and `enabled=1`.
- Logged out through the UI, interrupted only the QA-created Org Access process, and removed the `--rm` disposable MySQL container. No shared identity rows or partner accounts were changed.

| Case | Updated status | Evidence |
|---|---|---|
| SM-38 | PASS | Authenticated browser creation, displayed values, and disposable SQL identity read-back. |
| SM-39 | PASS | Automatic assigned-store membership confirmed in SQL. |
| SM-41 | PASS | Browser activation and active state persisted after reload and SQL read-back. |
| SM-42 | PASS | Browser deactivation state observed before reactivation in the disposable database. |

**Updated matrix totals: 37 PASS, 0 FAIL, 2 PARTIAL, 9 BLOCKED, 0 SKIPPED.** Remaining blocked cases: SM-10 and SM-45 need a product ownership policy; SM-29-SM-34 and SM-44 need disposable order/fulfillment/shipment fixtures. SM-35 and SM-36 remain partial pending authenticated browser evidence against such lifecycle fixtures.
### Follow-up � isolated order and shipment lifecycle (2026-10-26)

Disposable Order and Fulfillment schemas were migrated in the same QA-only MySQL container; application startup used Hibernate `ddl-auto=validate`. Fulfillment Service ran with the QA-only local carrier profile. The authenticated browser routed Order, Fulfillment, Org Access, and notification requests to local test services; notification requests were intercepted by a deterministic browser stub. No external notification or carrier request was made.

- Confirmed a Gachibowli order in the authenticated Store Manager UI; the Order API returned CONFIRMED. Packed it to PROCESSING, then used Ready to create/update fulfillment through ALLOCATED, PACKING, and READY_TO_SHIP.
- Set a synthetic delivery estimate on the disposable order fixture, created a Store Delivery shipment through the UI, and persisted IN_TRANSIT, SHIPPED order/fulfillment state, and tracking history. After correcting only QA service URLs, the order lifecycle verifier queried the isolated Fulfillment process successfully.
- The assignment UI displayed seven active partners for Gachibowli. Assigning one succeeded after fixing Org Access numeric boolean handling in `DeliveryPartnerEligibility.active()`: MySQL/JDBC serializes the active expression as numeric `1`, which was previously rejected. The backend now accepts Boolean true, numeric 1, and their string forms. SQL confirmed partner id/name on the shipment.
- Marked a second disposable shipment FAILED in the QA database. The Store Manager assignment page exposed the retry action; reassignment reset it to CREATED, persisted the same-store partner, and recorded a retry timeline entry. This Store Manager retry uses reassignment; no carrier retry call was made.
- Authenticated order details displayed Order SHIPPED, Fulfillment SHIPPED, Shipment IN_TRANSIT, partner assignment, and the tracking event.
- `mvn.cmd -q -f fulfillment-service\pom.xml -Dtest=DeliveryPartnerEligibilityTest test`: PASS, exit 0. Full Fulfillment suite: PASS, 30 tests, 0 failures/errors/skips. Disposable QA services/DB are cleaned up after evidence collection.

Updated statuses: SM-29 through SM-36 and SM-44 PASS. Overall totals are **46 PASS, 0 FAIL, 0 PARTIAL, 2 BLOCKED, 0 SKIPPED**. Only SM-10 (banner) and SM-45 (coupon) remain blocked because Store Manager write ownership/scope has no approved policy; no authorization was broadened.
Final regression checks for this continuation:

| Check | Result |
|---|---|
| Frontend `node.exe --test` | PASS, 239 tests, 0 failures/skips. |
| Fulfillment `mvn.cmd -q -f fulfillment-service\pom.xml test` | PASS, 30 tests, 0 failures/errors/skips. |
| Frontend/backend `git diff --check` | PASS; frontend reports only the pre-existing `catalogApi.js` LF-to-CRLF normalization warning. |

## Final policy review � SM-10 banners and SM-45 coupons (2026-10-26)

Reviewed the current functional requirements, endpoint guide, frontend role configuration, Catalog authorization, controller tests, and git status in both repositories. Existing changes were preserved; this policy review makes no application-code or authorization changes.

### Policy evidence and limits

- `docs/functional/roles.md` marks Banners and Coupons as visible modules for Store Managers, but labels the table �Configured admin module access� and explicitly says it does not guarantee that individual API actions are authorized.
- `docs/functional/administration.md` A08 says banner scope is role-derived and explicitly permits Location Admin to optionally target a store. A16 makes the corresponding statement for coupon scope. Neither section specifies Store Manager read, create, edit, activate/deactivate, delete, or own-store/global authority.
- `docs/functional/backend-endpoints.md` lists the BannerController CRUD endpoints; it does not grant Store Manager access. Catalog `CatalogAccess` and the Banner/Coupon controllers currently scope writes to Location Admin or global roles; Store Manager promotion reads do not expose unscoped resources. No authoritative requirement found resolves Store Manager promotion ownership.
- The frontend Store Manager module list and coupon payload helper are implementation details and are not treated as policy approval.

### Decision requested

For **Banners (SM-10)** and separately **Coupons (SM-45)**, the product owner must decide:

1. May Store Managers list/read records? If yes, only records scoped to their assigned store, or also location/global records?
2. May they create, edit, activate/deactivate, and delete records? Specify each permitted action.
3. Must the backend derive the assigned store from authenticated identity and force Store scope, or may a Store Manager create/manage Location or Global scope records?
4. For coupons, should store-scoped configuration remain non-redeemable while `SERVER_COUPONS_ENABLED` is false, as current commerce docs state?

Until those decisions are recorded in authoritative requirements, **SM-10 and SM-45 remain BLOCKED**. No authorization was broadened, and no banner/coupon write was attempted.

### Policy-independent regression checks

| Command/check | Result |
|---|---|
| `mvn.cmd -q -f catalog-service\pom.xml '-Dtest=BannerLocationAdminIntegrationTest,CouponLocationAdminIntegrationTest,BannerSchemaMappingTest' test` | PASS, 5 tests, 0 failures/errors/skips. These cover existing Location Admin scope and Banner schema mapping; they do not authorize Store Manager promotion writes. |
| `node.exe --test` | PASS, 239 tests, 0 failures/skips. |
| `git diff --check` in frontend and backend | PASS; frontend retains the existing `catalogApi.js` line-ending normalization warning. |

**Current QA totals remain 46 PASS, 0 FAIL, 0 PARTIAL, 2 BLOCKED, 0 SKIPPED.** No production/VPS, shared MySQL, notification, payment, or carrier side effect was used for this policy review.

### Follow-up ??? approved Store Manager banner/coupon policy and implementation (2026-10-26)

The product owner approved Store Manager list/read, create, edit, activate/deactivate, and delete for banners and coupons, scoped to the assigned store only. Catalog derives scope from authenticated `SCOPE_STORE:<id>` and enforces it for reads and writes; conflicting request scope/store/location values are rejected. Global Admin behavior is covered and unchanged. Store-scoped coupon configuration remains non-redeemable while Catalog setting `app.promotions.redemption-enabled` is false (the default); validation returns an invalid result and zero discount. Authoritative requirements are updated in `docs/functional/roles.md`, `docs/functional/administration.md`, and `docs/functional/commerce.md`.

- `node --test src/pages/AdminWorkspace/adminBanner.test.js src/pages/AdminWorkspace/adminCoupon.test.js`: PASS, 8 tests.
- Catalog `BannerStoreManagerIntegrationTest`, `CouponStoreManagerIntegrationTest`, and existing Location Admin banner/coupon tests: PASS in isolated H2/MockMvc. Coverage includes full lifecycle, assigned-store list scoping, cross-store/global denial, forged scope rejection, global-admin access, and disabled coupon validation.
- These focused checks did not perform authenticated browser CRUD for banners/coupons. No production service or shared database was used.

Final regression results for the approved banner/coupon change:

| Check | Result |
|---|---|
| Frontend `node --test` | PASS, 244 tests, 0 failures/skips. |
| Frontend `npm.cmd run lint` | PASS, exit 0. |
| Frontend `npm.cmd run build` | PASS, exit 0; existing large-chunk warning remains. |
| Catalog focused MockMvc suite | PASS, 6 tests across Store Manager and Location Admin banner/coupon integration classes; 0 failures/errors/skips. |
| Frontend/backend `git diff --check` | PASS; frontend has the existing `catalogApi.js` LF-to-CRLF warning. |
