# Global Admin Local QA Report

**Execution date:** 2026-10-23
**Scope:** Local development environment only
**Frontend:** `http://localhost:5173`
**Configured gateway target:** `http://localhost:8082` (Vite proxy; gateway health endpoint did not return a usable response during the initial check)
**Database:** MySQL at `localhost:3306`. The Org Access datasource uses `MYSQL_DB`, which was not set in the backend `.env`; its configured default is `users_roles`.
**Credentials:** The supplied local QA account was used. No password, token, cookie, or authentication payload is recorded here.

## Summary

| Status | Count |
|---|---:|
| PASS | 16 |
| FAIL | 6 |
| BLOCKED | 3 |
| SKIP | 3 |
| PENDING | 0 |
| **Total** | **28** |

## Results

| ID | Use case | Status | Actual result | Issue details | Evidence |
|---|---|---|---|---|---|
| GA-01 | Login through Team Login | PASS | Team Login accepted the supplied local test account and routed to the Global Admin workspace. | — | Browser showed Global Admin Portal after login. |
| GA-02 | Access the Global Admin dashboard | PASS | Dashboard loaded with the Global Admin heading and all-location scope. Global Admin navigation modules were visible. | — | Dashboard view and in-session screenshot. |
| GA-03 | View scoped dashboard metrics | FAIL | Dashboard identified the scope as the full business, but showed 0 for order metrics. The local reports export later contained 14 orders and 2 delivered orders. | Dashboard metric data is inconsistent with the report data; repeated local browser console HTTP 500 errors were observed. See Defect D-01. | Dashboard screenshot; valid report JSON summary (14 orders, 2 delivered). |
| GA-04 | View, create, and edit products | PASS | Created a uniquely tagged inactive QA product, edited it, and verified it remained available after refresh. The disposable product was deleted and verified absent after refresh. | — | Product list, edit dialog, post-refresh search, and cleanup check. |
| GA-05 | Manage product status, variants, and images | PASS | On the disposable QA product, set status to Draft, edited the variant, and used a local frontend image URL. The detail view after refresh showed the Draft status, edited variant, and image value. The product was then removed. | — | Product detail view after refresh; cleanup check. |
| GA-06 | Manage product-to-store mappings | FAIL | Product create/edit and store view/edit screens were inspected. No Global Admin control for managing product-to-store mappings was available in those UI surfaces. | Expected mapping management could not be performed through the Global Admin UI. See Defect D-02. | Product and store screens; no mapping controls present. |
| GA-07 | View, create, and edit banners and campaigns | PASS | Created a clearly tagged inactive banner using a local image asset, edited its description, verified the edit in the detail view, then deleted it and verified it remained absent after refresh. | — | Banner detail view and post-refresh cleanup search. |
| GA-08 | View and manage inventory records | PASS | Inventory list loaded (page 1 of 64); the detail and adjustment forms exposed stock and status fields. No existing inventory was changed. | — | Inventory list, view dialog, and adjustment dialog (canceled without saving). |
| GA-09 | Adjust stock quantities | SKIP | The adjustment form was inspected but not saved. | Existing inventory records were not disposable QA records; changing stock would alter existing business data. | Adjustment form opened and canceled. |
| GA-10 | View global-fulfillment orders | PASS | Orders marked for global fulfillment were listed in the Orders module. | — | Global order list showed global fulfillment labels and statuses. |
| GA-11 | Search and filter global orders | PASS | Searching for a displayed order returned one matching order. Status filter options were available and could be opened without changing any order. | — | Search match count 1; status options included CREATED, CONFIRMED, PROCESSING, SHIPPED, and DELIVERED. |
| GA-12 | Inspect global order details | PASS | An order detail view opened and exposed order status, payment, fulfillment, item, and tracking-related fields. No customer details were copied into this report. | A separate shipped-order detail attempt failed; recorded under GA-17. | Order detail view opened; no sensitive fields captured. |
| GA-13 | Progress permitted order and fulfillment statuses | SKIP | Status options were inspected; no order status was submitted. | The available orders were existing business records, not disposable test orders; changing them would alter operational data. | Status dropdown opened and dismissed without selection. |
| GA-14 | Open global stocked-store assignment | PASS | The stocked-store assignment workflow opened from a global order. | — | Assignment page displayed the order and stocked-store selector. |
| GA-15 | Inspect candidate stores with sufficient stock | PASS | Active store candidates were listed. Selecting one displayed available versus requested quantity and enabled the confirmation control. | — | Selected candidate showed 100 available / 1 needed; assignment was not confirmed. |
| GA-16 | Select a stocked store and approve in the local workflow | SKIP | A stocked store was selected and the confirmation control became enabled; confirmation was intentionally not submitted. | Confirmation would modify an existing order, which was not identified as a disposable QA record. | Assignment workflow showed selected candidate and enabled confirmation button. |
| GA-17 | Inspect or enter carrier and tracking information in the parcel workflow | FAIL | Filtering to SHIPPED returned one order, but opening its details did not produce a detail dialog; local browser events showed HTTP 404 responses. Carrier/tracking inspection could not be completed. | Shipped-order details/parcel information were unavailable for the listed order. See Defect D-03. No shipment or dispatch was created. | SHIPPED filter result; sanitized local HTTP 404 browser errors. |
| GA-18 | View payment records | BLOCKED | Payments screen loaded but contained no payment records. | No local payment fixture was available to exercise record viewing. No payment was initiated. | Payments page empty state. |
| GA-19 | Inspect payment status and transaction details | BLOCKED | No payment record existed to open for status or transaction inspection. | Local payment data dependency unavailable; no sandbox transaction was created. | Payments page had no records. |
| GA-20 | View and manage the general customer collection | FAIL | Customers page showed: “This account does not have permission for this action. Please sign in again.” A local HTTP 403 was observed. | Global Admin UI exposes the Customers module, but its collection request is denied. See Defect D-04. | Customers page error and sanitized HTTP 403. |
| GA-21 | Moderate general reviews | BLOCKED | Reviews page loaded with an empty collection; there were no reviews to moderate. | No local review fixture was available. | Reviews page empty state. |
| GA-22 | Configure coupon records | PASS | Created an inactive QA coupon with valid dates, fixed discount, usage limit, and eligibility. It persisted after refresh, then was deleted and verified absent after refresh. | — | Coupon list after refresh and cleanup search. |
| GA-23 | Create notification records | PASS | Created a QA-only notification record with a clearly marked non-delivery message. The record appeared in the list and persisted after refresh; it was then deleted and verified absent. | The UI record was created locally; no external delivery was triggered. | Notification list, details view, refresh persistence check, and cleanup check. |
| GA-24 | Configure notification audiences | PASS | Selected and saved the All Customers audience for the QA notification and verified it in the details view. No send/delivery action was taken. | — | Notification details displayed the configured audience. |
| GA-25 | View reports and export JSON | PASS | Export started successfully. The captured local download blob parsed as valid JSON and contained `filters`, `summary`, `storePerformance`, and `orders`; it reported 14 orders and 2 delivered orders. The export omitted contact data. | — | Download message named `scoped-report-2026-10-23.json`; JSON parse and shape validation performed in the browser. |
| GA-26 | View local audit logs | FAIL | Audit Logs page displayed an empty state while repeated local HTTP 500 browser errors were recorded. | Audit log data could not be verified because the page’s local requests failed. See Defect D-05. | Audit Logs empty state and sanitized HTTP 500 browser errors. |
| GA-27 | Manage own admin profile through the available dialog | FAIL | Profile dialog opened. Saving the unchanged profile did not complete and displayed “No staff user is signed in.” No profile values were changed. | Profile save handler rejected the authenticated Global Admin session. See Defect D-06. | Profile dialog validation error; no values changed. |
| GA-28 | Logout | PASS | Sign out routed to `/login`. A subsequent attempt to open `/admin/dashboard` redirected to `/login`; the Global Admin Portal was not visible. | — | Post-logout route and protected-route redirect verified. |

## Defects

| ID | Severity | Affected case | Description and reproduction |
|---|---|---|---|
| D-01 | MEDIUM | GA-03 | Dashboard metrics disagree with report data. **Reproduce:** sign in via Team Login, open Dashboard, note order totals show zero; open Reports and export JSON, which reports 14 orders and 2 delivered. Repeated local HTTP 500 console entries occurred during module loads. |
| D-02 | MEDIUM | GA-06 | No Global Admin product-to-store mapping control was found. **Reproduce:** open Products and inspect Create/Edit; open Stores and inspect View/Edit. None exposed a mapping management action. |
| D-03 | HIGH | GA-17 | Shipped order detail could not be opened for carrier/tracking inspection. **Reproduce:** open Orders, select SHIPPED, click View for the listed result. The details view did not open and local HTTP 404 responses appeared. |
| D-04 | HIGH | GA-20 | Global Admin is denied access to the general customer collection. **Reproduce:** open Customers while signed in as Global Admin. The page reports insufficient permission and the local request returns HTTP 403. |
| D-05 | MEDIUM | GA-26 | Audit log page fails to load records. **Reproduce:** open Audit Logs while signed in as Global Admin. The page remains empty and repeated local HTTP 500 console errors appear. |
| D-06 | MEDIUM | GA-27 | Profile save rejects the signed-in test account. **Reproduce:** open the profile menu, choose Profile & Settings, and save without changing values. The form reports “No staff user is signed in” and remains open. |

## Local URLs, API Routing, and Data

- Frontend: `http://localhost:5173`
- Vite proxy target from `vite.config.js`: `http://localhost:8082`
- The frontend calls local proxy paths on `localhost:5173`; configured service prefixes include:
  - Authentication: `POST /org-access/api/auth/login`, `GET /org-access/api/users/me`
  - Catalog: `/catalog-service/api/v1/products`, `/catalog-service/api/v1/banners`, `/catalog-service/api/v1/coupons`
  - Inventory: `/inventory-service/api/v1/inventories`
  - Orders: `/order-api/api/v1/orders`, `/order-api/api/v1/orders/:id`, `/order-api/api/v1/orders/:id/global-store-assignment-options`
  - Payments: `/payment-service/api/v1/payments`
  - Customer collection: `/customer-profile/api/v1/admin/customers`
- Database configuration inspected: MySQL host `localhost`, port `3306`; Org Access uses database `users_roles` by default because no `MYSQL_DB` override was present in the backend `.env`.
- No production, staging, VPS, cloud, real payment, or external notification service was intentionally used.
- The UI referenced remote image/map assets (`source.unsplash.com` and `openstreetmap.org`); browser requests failed/aborted and were not used as API dependencies. No successful remote asset response was relied on.
- Test data created during this run used `QA-LOCAL-GA-20261023` identifiers, was inactive/draft where applicable, and was deleted. Product, banner, coupon, and notification cleanup was verified absent after refresh.

## Sanitized Errors and Evidence

- Local browser console: repeated `Failed to load resource: the server responded with a status of 500 (Internal Server Error)` on module loads.
- Customers collection: HTTP 403 and UI message “This account does not have permission for this action. Please sign in again.”
- Shipped order details: HTTP 404 on the attempted detail view.
- Order-address warning: “Could not load previous order addresses: An unexpected error occurred.”
- Banner/product/coupon test cleanup produced `net::ERR_ABORTED` request events during navigation; each QA record was subsequently absent after refresh.
- Dashboard screenshot was captured in the integrated browser session. The screenshot is available in the session conversation; the screenshot tool did not provide a workspace file path.
- No screenshot or report contains credentials, cookies, tokens, or payment details.

## Commands Used

Browser-based interaction and assertions were performed with the integrated browser automation against `localhost`. No Playwright package or Playwright test script is declared in the frontend `package.json`; no npm test/build/lint command was run.

Local availability checks:

```powershell
$urls=@('http://localhost:5173','http://localhost:8082'); foreach($u in $urls){ try { $r=Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 5 -UseBasicParsing; "$u => $($r.StatusCode)" } catch { "$u => unavailable ($($_.Exception.GetType().Name))" } }
```

```powershell
$ports=8082,8081,3311,3314,3315,3317,3306; foreach($p in $ports){ $x=Test-NetConnection -ComputerName localhost -Port $p -WarningAction SilentlyContinue; "port $p open=$($x.TcpTestSucceeded)" }
```

```powershell
try { $r=Invoke-WebRequest -Uri 'http://localhost:8082/actuator/health' -TimeoutSec 5 -UseBasicParsing; "gateway_health=$($r.StatusCode) body=$($r.Content.Substring(0,[Math]::Min(300,$r.Content.Length)))" } catch { "gateway_health=unavailable" }; foreach($p in 3311,3314,3315,3317){try{$r=Invoke-WebRequest -Uri "http://localhost:$p/actuator/health" -TimeoutSec 4 -UseBasicParsing; "service_$p=$($r.StatusCode)"}catch{"service_$p=unavailable"}}
```

## Readiness Assessment

**Not ready for Global Admin operational use based on this run.** Authentication, dashboard access, catalog CRUD on clearly tagged disposable records, banner/coupon/notification configuration, order browsing/search, stocked-store candidate inspection, report JSON export, and logout were verified. Six cases failed, three were blocked by absent records, and three operational mutations were intentionally skipped to avoid changing existing inventory/orders. Resolve D-01 through D-06 and provide local payment/review fixtures before sign-off. No application code or configuration was changed.

## Global Admin Retest — 2026-10-24

**Environment:** `http://localhost:5173` with local gateway proxy at `http://localhost:8082`
**Authentication:** Reused the already authenticated local Global Admin browser session. This retest did not repeat the login form flow.
**Safety:** Existing orders, inventory, profile, payments, and customer records were not modified. One uniquely tagged disposable product and one inactive disposable coupon were created for UI verification, then deleted. The product's store mapping was also verified absent after product deletion. No order status, assignment, rejection, stock adjustment, payment, or notification delivery was submitted.

### Results

| ID | Retest status | Evidence and limitations |
|---|---|---|
| GA-01 | UNVERIFIED | The authenticated session was already active; sign-in form behavior was not repeated. |
| GA-02 | PASS | Dashboard rendered under the Global Admin session. |
| GA-03 | PARTIAL | Dashboard and Reports agree on 15 orders, 3 delivered, and ₹5,399 revenue. Dashboard shows 8 customers while Reports shows 0; this metric discrepancy remains. |
| GA-04 | PASS | A uniquely tagged product was created, edited, read after refresh, then deleted. The delete returned HTTP 204. |
| GA-05 | PASS | The disposable product's Draft status, variant, and image values were present after reload/edit. Product cleanup was verified; no existing product was changed. |
| GA-06 | PARTIAL | Assigning the disposable product to a local store returned HTTP 201 and read-back showed the mapping. Mapping to the Global Store returned HTTP 409 because global delivery was not enabled. The UI removal attempt did not remove the local mapping; deleting the QA product removed it, and a fresh mapping query returned 0 rows. Standalone unassign behavior remains unverified. |
| GA-07 | UNVERIFIED | Existing banner list rendered. A disposable create attempt was canceled after the form did not submit and exposed no successful POST; existing banners were not changed. |
| GA-08 | PARTIAL | Inventory list rendered on page 1 of 64. Inventory detail was not opened in this retest. |
| GA-09 | SKIP | Stock adjustment form was inspected and canceled without saving. |
| GA-10 | PASS | Global-store orders rendered in the Orders list. |
| GA-11 | PARTIAL | Status filtering to SHIPPED and CREATED rendered matching rows and pagination. A fresh search assertion was not performed. |
| GA-12 | PASS | An existing order detail request and its items request both returned HTTP 200; no order was changed. |
| GA-13 | SKIP | No existing order status transition was submitted. |
| GA-14 | UNVERIFIED | Assignment workflow was not opened during this retest. |
| GA-15 | UNVERIFIED | Candidate store stock was not inspected during this retest. |
| GA-16 | SKIP | No assignment or approval was confirmed for an existing order. |
| GA-17 | FAIL | For the visible SHIPPED order, order and item GETs returned HTTP 200, but `/fulfillment/api/v1/fulfillments/order/{id}` and `/fulfillment/api/v1/shipments/order/{id}` returned HTTP 404. The detail view showed no fulfillment, shipment, or tracking events. No shipment was created. |
| GA-18 | BLOCKED | Payments page rendered an empty state; no payment fixture was available. No payment was initiated. |
| GA-19 | BLOCKED | No payment existed to inspect for status or transaction history. |
| GA-20 | PASS | Customers page rendered two pages (6 rows on page 1 and 2 on page 2); the real collection request returned HTTP 200. Customer personal data is omitted from this report. |
| GA-21 | FAIL | Reviews page showed an error and empty-state message. `GET /order-api/api/v1/reviews/admin?page=0&size=20&status=PENDING` returned HTTP 500 with a generic error response. No review was moderated. |
| GA-22 | PASS | An inactive, uniquely tagged disposable coupon was created (HTTP 201) and deleted through the UI. No existing coupon was changed. |
| GA-23 | UNVERIFIED | The notification form remained open after Save and no notification creation request was observed. No notification was sent. |
| GA-24 | UNVERIFIED | The All Customers audience could be selected in the notification form, but no save persisted it. |
| GA-25 | PASS | Export JSON initiated a real browser download, `scoped-report-2026-10-24.json`. The file parsed as JSON with 15 orders and 3 delivered orders, matching Reports. No personal data is reproduced here. |
| GA-26 | PASS | Audit Logs rendered a paginated list; the audit request returned HTTP 200. |
| GA-27 | PARTIAL | Profile dialog opened with the authenticated account's Name field populated. No save was attempted to avoid changing the existing account; update persistence remains unverified. |
| GA-28 | PASS | Sign out routed to `/login`; opening `/admin/dashboard` afterward redirected back to `/login`. |

### Fulfillment POST follow-up

The earlier fulfillment `POST /fulfillment/api/v1/fulfillments` HTTP 500 was **not safely re-submitted**. The existing orders were not established as disposable, and the retest had no test-owned order for a create request. This browser run therefore does not establish whether the prior POST failure is fixed. Read-only shipment/fulfillment lookups for the shipped order continue to return HTTP 404 as recorded under GA-17.

### Browser diagnostics and cleanup

- The Reviews HTTP 500 and shipped-order fulfillment/shipment HTTP 404 responses were observed during this browser session. The available response bodies were generic; they do not establish the underlying service exceptions.
- The banner form did not produce a create request in the attempted flow. No banner record was created or changed.
- The disposable product's local-store mapping was removed by deleting the QA product; a fresh read returned zero mappings for that product ID.
- The disposable coupon was deleted after verification. No source code, configuration, database schema, or service setting was changed during this browser retest.
- No automated test, lint, or build command was run.

## Global Admin Follow-up — 2026-10-24

**Scope:** Follow-up investigation and targeted fixes for Reviews HTTP 500, missing fulfillment/shipment lifecycle records, customer-count mismatch, and safe fulfillment POST verification.

**Authentication:** The integrated browser was signed out at `/login`. No authorized credentials were available in the session, so authenticated UI verification and the 28-case browser rerun were not performed. No credentials or customer data were recorded.

### Findings and changes

| Area | Evidence and root cause | Change / verification |
|---|---|---|
| Reviews | The prior authenticated `GET /order-api/api/v1/reviews/admin?page=0&size=20&status=PENDING` failed while the running order service had no route mapping; its log recorded `NoResourceFoundException` for that path. The process predated the compiled admin-review controller. The local `order_reviews` table also lacked the moderation/product columns expected by the current implementation and contained 0 rows. | Updated V18 to extend the existing legacy review table, keep old order-level review product fields nullable, and allow per-product reviews. The row mapper now handles legacy rows without a product association. Applied only that additive schema change to local MySQL; review row count remained 0. Restarted only the local order service. The route now returns HTTP 401 without authentication (rather than 500), and no new no-handler error appeared after restart. This confirms the route is loaded; authenticated browser success remains unverified. |
| Fulfillment lifecycle | The order-created consumer records an order snapshot, while the normal admin workflow creates fulfillment and shipment later. The order status endpoint previously allowed direct `SHIPPED`/`DELIVERED` transitions without checking for those persisted records. Read-only aggregate query found 10 shipped orders (2 without fulfillment, 2 without shipment) and 5 delivered orders (4 without fulfillment, 4 without shipment). | Added a fail-closed shipment-state check to order status updates. The UI now marks an order delivered only after the shipment is persisted as delivered. No historical order was changed, and no missing record was backfilled. |
| Customer count | Dashboard used `totalElements` from the paginated backend customer collection; Reports used browser-local customer records. The intended measure is registered customer profiles from the authorized customer collection, independent of date/store report filters. Prior live browser evidence showed 8 profiles. | Added a shared paginated API total helper and used it for both Dashboard and Reports. Reports no longer infer the total from local storage. |
| Fulfillment POST | All 62 local order records are shared existing orders; none was designated disposable. | No live order or fulfillment write was attempted. Added an isolated H2-backed API test that creates a random Global Store fixture, persists fulfillment, advances it to READY_TO_SHIP, creates a shipment, and reads both records back. Live browser POST verification remains BLOCKED. |

### Automated verification

| Check | Result |
|---|---|
| Order-service Maven suite | PASS — 78 tests, 0 failures, 0 errors. |
| Fulfillment-service Maven suite | PASS — 20 tests, 0 failures, 0 errors; includes the isolated fulfillment-to-shipment API lifecycle test. |
| Focused frontend tests | PASS — 16/16 customer API and report tests. |
| Full frontend Node suite | FAIL — 169/172 passed. The three failures are checkout-policy tests: `multi-store carts may reach payment review without enabling order creation`, `mixed and multi-store checkout is blocked before creation`, and `unsupported handling and coupon totals fail closed`. These files are outside this follow-up scope. |
| Focused ESLint | PASS. |
| Frontend production build | PASS; Vite emitted existing dynamic-import and large-chunk warnings. |
| `git diff --check` | PASS; Git reported existing working-copy LF/CRLF normalization warnings only. |

### Browser regression status

The 28 browser cases were **not rerun** because the browser had no authenticated session and no authorized account credentials were available. No login bypass or guessed credential was attempted. Customers, Audit Logs, Reports, Reviews, and order details were not rechecked in the authenticated UI after these changes. The previous observation of 8 customer profiles is historical evidence, not a post-fix browser result. An unauthenticated direct request to the restarted gateway review route returned HTTP 401, which verifies routing only.

### Files changed in this follow-up

- `ecom-backend/order-service/src/main/resources/db/migration/V18__create_moderated_order_reviews.sql`
- `ecom-backend/order-service/src/main/java/com/metaarch/order/order/OrderReviewService.java`
- `ecom-backend/order-service/src/main/java/com/metaarch/order/order/FulfillmentLifecycleVerifier.java`
- `ecom-backend/order-service/src/main/java/com/metaarch/order/order/OrderService.java`
- Order-service tests: `OrderReviewServiceTest.java`, `OrderServiceTest.java`, `GlobalStoreAssignmentTest.java`, `GlobalPickupValidationTest.java`
- Fulfillment-service test: `FulfillmentAuthorizationTest.java`
- Frontend: `AdminWorkspace.jsx`, `AdminReports.jsx`, `adminCustomerApi.js`, `adminCustomerApi.test.js`, `orderServiceWorkflow.js`
- This report.

No existing order, customer, inventory, payment, or profile record was modified. The only live local database change was the additive review-table schema update; its row count remained zero. No production, cloud, or VPS resource was accessed.

## Full Portal Retest - 2026-10-24

**Environment:** Local frontend at http://localhost:5173; authenticated requests were observed through the frontend proxy. No production, cloud, or VPS service was accessed.
**Browser:** Two Playwright tabs were kept open. Tab 1 remained authenticated as Global Admin using the pre-existing browser session. Tab 2 was the Customer portal in guest mode.
**Authentication limitation:** The Customer password was not present in the task or local frontend environment. I did not guess or retrieve credentials. The Global Admin login flow was not repeated because the existing session was already authenticated and its password was not supplied.
**Safety:** No existing customer, order, inventory, payment, review, product, coupon, banner, notification, assignment, or profile record was changed. Product and order dialogs were canceled. Assignment options were inspected without confirmation. No checkout, payment, notification delivery, or logout was submitted.
**Current changes:** This report and two screenshots only; no application source, service configuration, or database data was changed during this retest.

### Global Admin cases

The “Initial” column repeats the starting status in the original results table above. Persistence is PASS only when a fresh persisted read was observed.

| ID | Use case | Initial | Retest | Evidence, root cause, persistence, and fix |
|---|---|---|---|---|
| GA-01 | Login through Team Login | PASS | UNVERIFIED | Reused the authenticated session; login form submission was not repeated. No login write or credential guess. |
| GA-02 | Access the Global Admin dashboard | PASS | PASS | Dashboard rendered for Global Admin. Screenshot: ../.playwright-mcp/ga-qa-2026-10-24-global-admin-dashboard.png. |
| GA-03 | View scoped dashboard metrics | FAIL | PASS | Dashboard and Reports both displayed 15 orders, 3 completed/delivered, INR 5,399 revenue, and 8 customers. Registered-customer total is loaded from the shared backend total API independent of report filters. No mismatch reproduced. |
| GA-04 | View, create, and edit products | PASS | PARTIAL | Product list rendered (page 1 of 4); create and edit dialogs opened. No create/edit was saved in this run, so persistence was not retested. |
| GA-05 | Manage product status, variants, and images | PASS | UNVERIFIED | No status, variant, or image was changed in this run. Prior disposable-product result remains historical evidence only. |
| GA-06 | Manage product-to-store mappings | FAIL | PARTIAL | Create/edit UI exposes Mapped stores and per-store Price override fields. Existing mapped-store values loaded; GET /catalog-service/api/v1/store-products?productId=... returned HTTP 200. Dialog was canceled. Assign/unassign save and refresh persistence were not retested with a disposable product. Historical “controls absent” finding is stale for this build; no code change was needed. |
| GA-07 | View, create, and edit banners and campaigns | PASS | PARTIAL | Banners page rendered (page 1 of 1). Create/edit persistence was not retested. |
| GA-08 | View and manage inventory records | PASS | PARTIAL | Inventory list loaded with pagination (page 1 of 64). No detail view was opened and no stock was changed. |
| GA-09 | Adjust stock quantities | SKIP | SKIP | Existing inventory was not adjusted; no disposable inventory fixture was identified. Adjustment persistence remains unverified. |
| GA-10 | View global-fulfillment orders | PASS | PASS | Orders page rendered and showed global-store orders. No order was changed. |
| GA-11 | Search and filter global orders | PASS | PARTIAL | Status filter to SHIPPED rendered one matching Global Admin list result and pagination. Search behavior was not retested. |
| GA-12 | Inspect global order details | PASS | PASS | A shipped order detail opened and rendered order/item data and explicit fulfillment/shipment/tracking empty states. No order was changed. |
| GA-13 | Progress permitted order and fulfillment statuses | SKIP | SKIP | No status transition was applied to shared orders. |
| GA-14 | Open global stocked-store assignment | PASS | PASS | Assignment options opened for a listed order. |
| GA-15 | Inspect candidate stores with sufficient stock | PASS | PASS | Eligible stores appeared. Selecting a candidate showed 50 available / 1 needed and enabled confirmation. Selection remained unsaved. |
| GA-16 | Select a stocked store and approve in the local workflow | SKIP | SKIP | Confirmation was not submitted because the order was not a disposable test order. |
| GA-17 | Inspect or enter carrier and tracking information in the parcel workflow | FAIL | FAIL | Authenticated read-only check of 62 orders found 10 SHIPPED and 5 DELIVERED. Fulfillment and shipment lookups returned HTTP 404 for 2/10 SHIPPED and 4/5 DELIVERED orders. The detail UI explains missing records; other lifecycle lookups returned 200. The inconsistency is historical persisted data, not a lookup outage. No backfill or existing-order change was made. Future transition safeguards are covered by the passing order/fulfillment automated suites. |
| GA-18 | View payment records | BLOCKED | BLOCKED | Payments page rendered an empty state. No payment fixture was available; no payment was initiated. |
| GA-19 | Inspect payment status and transaction details | BLOCKED | BLOCKED | No payment record was available to inspect; no transaction was initiated. |
| GA-20 | View and manage the general customer collection | FAIL | PASS | Customers page rendered two pages. Authenticated collection requests returned HTTP 200; total registered-customer count shown by Dashboard and Reports is 8. No customer record was opened for reporting or modified. |
| GA-21 | Moderate general reviews | BLOCKED | BLOCKED | Authenticated Reviews UI loaded. GET /order-api/api/v1/reviews/admin?page=0&size=20&status=PENDING returned HTTP 200 with totalElements 0. No review fixture existed for a safe moderation persistence check. |
| GA-22 | Configure coupon records | PASS | PARTIAL | Coupons page rendered (page 1 of 1). No coupon was created, edited, activated, or deleted in this run. |
| GA-23 | Create notification records | PASS | PARTIAL | Notifications page rendered (page 1 of 1). No notification was created and no delivery was triggered. |
| GA-24 | Configure notification audiences | PASS | UNVERIFIED | Audience controls and persistence were not retested. |
| GA-25 | View reports and export JSON | PASS | PARTIAL | Reports displayed the same counts as Dashboard. A new JSON download was not captured in this run; prior successful download remains historical evidence. |
| GA-26 | View local audit logs | FAIL | PASS | Audit Logs rendered two pages. Action filter UPDATE_USER returned a filtered one-page result; audit requests succeeded. No audit record was changed. |
| GA-27 | Manage own admin profile through the available dialog | FAIL | PARTIAL | Profile dialog loaded the signed-in Name field; email/mobile fields were disabled. Save was not attempted on the existing admin account, so persistence remains unverified. |
| GA-28 | Logout | PASS | UNVERIFIED | Logout was not submitted to preserve the authenticated session; a safe re-login credential was unavailable. |

### Customer portal cases

Guest checks were performed in the second tab. Authenticated account workflows are blocked because no authorized Customer password was provided. “Skip” means the action would create an account, order, payment, notification, or account-data change that was not safe to submit.

| ID | Use case | Status | Evidence and limitation |
|---|---|---|---|
| C01 | Introduction, navigation and session | PARTIAL | Customer home and the normal sign-in form rendered in tab 2. Customer authentication/logout was not tested. |
| C02 | Register and verify an account | SKIP | Registration creates a real account and verification challenge; no disposable registration fixture was supplied. |
| C03 | Login, OTP login and password recovery | BLOCKED | Customer password was absent from the task and local frontend environment. No guess, OTP request, or recovery request was made. |
| C04 | Home, categories and campaigns | PARTIAL | Home/catalog content rendered. Some sections showed empty states; catalog API requests succeeded. Remote image hosts returned errors, while local API data remained available. |
| C05 | Store directory and store page | UNVERIFIED | Not opened in this run. |
| C06 | Search and filtering | PASS | Search for “cashew” returned one matching product. |
| C07 | Product details and stock | PASS | Product details, variants, and prices rendered. Stock check correctly required sign-in. No item was added. |
| C08 | Cart and cart drawer | PARTIAL | Cart rendered the empty state. Add, quantity, removal, and checkout mutation flows were not submitted. |
| C09 | Wishlist and saved for later | UNVERIFIED | Not tested. |
| C10 | Location search, map and address form | UNVERIFIED | Not tested; no address or location was saved. |
| C11 | Saved addresses | BLOCKED | No authenticated Customer session; no address was read or changed. |
| C12 | Customer profile and photo | BLOCKED | Protected profile navigation returned to the sign-in flow. No profile data was changed. |
| C13 | Language, currency and timezone | UNVERIFIED | Not tested. |
| C14 | General product reviews | UNVERIFIED | Not tested; no review was created. |
| C15 | Customer notifications | UNVERIFIED | Not tested. |
| C16 | Rewards, referrals and vouchers | UNVERIFIED | Not tested; no points were redeemed. |
| C17 | Help, contact and informational pages | UNVERIFIED | Not tested. |
| C18 | Delete account | SKIP | Destructive account deletion was not attempted. |
| O01 | Review checkout | BLOCKED | Guest checkout redirected to sign-in; cart was empty. No order was submitted. |
| O02 | Delivery quotes and grouping | UNVERIFIED | No authenticated cart/location was available. |
| O03 | Pricing and promotions | UNVERIFIED | No checkout was submitted; server coupon behavior was not retested. |
| O04 | Order creation and retry | SKIP | No disposable test-owned order/cart was available; no order was created. |
| O05 | Multiple stores and checkout groups | UNVERIFIED | Requires an authenticated test cart; not exercised. |
| O06 | Payment options and payment records | SKIP | No payment initiation or refund was attempted. |
| O07 | Order history, detail and cancellation | BLOCKED | Guest order history showed “Log in to view your orders.” No cancellation was attempted. |
| O08 | Tracking, notifications and documents | UNVERIFIED | Customer-owned order data was unavailable. |
| O09 | Delivered-order review | BLOCKED | Requires an authenticated test-owned delivered order; none was available. |

### Automated checks and artifacts

| Check | Result |
|---|---|
| Focused frontend Node tests | PASS - 28/28 across dashboard/report data, order detail/workflow, customer collection, audit, reviews, and order APIs. |
| Full frontend Node suite | FAIL - 169/172 passed. Three failures remain in src/utils/checkoutPolicy.test.js: multi-store review policy, mixed/multi-store pre-creation block, and handling/coupon totals. Checkout code was not changed. |
| Focused ESLint | PASS - touched Admin Workspace, Reports, Reviews, customer, audit, review, and order API/workflow files. |
| Full ESLint | FAIL - 4 errors and 2 warnings in HomeHeaderBanner.jsx, ProductCard.jsx, CartPage.jsx, AppContext.jsx, and OrderDetailViewPage.jsx. These findings are unrelated to the verified Global Admin count fix; no unrelated files were edited. |
| Frontend production build | PASS - Vite build completed with existing dynamic-import and large-chunk warnings. |
| Order Service Maven tests | PASS - 80 tests, 0 failures/errors. |
| Fulfillment Service Maven tests | PASS - 20 tests, 0 failures/errors, including isolated lifecycle coverage. |

Screenshots: ../.playwright-mcp/ga-qa-2026-10-24-global-admin-dashboard.png and ../.playwright-mcp/ga-qa-2026-10-24-customer-home.png. No credentials, tokens, cookies, or Customer personal data are included.

### Retest conclusion

Dashboard customer count and Reports registered-customer count now match (8). Customer collection, Reviews listing, and Audit Logs requests/pages are working in the authenticated Global Admin session. Product-to-store controls and existing mapped-store values are present in the current UI; mapping write/read-back still needs a disposable product. Historical shipped/delivered orders still have missing fulfillment/shipment records; the missing-record totals are confirmed above and no historical order was repaired. Authenticated Customer portal checks and write-path persistence checks remain blocked or unverified for the safety reasons listed above.

No application source code or database records were changed during this retest. The only repository document updated was this report; two screenshots were saved under .playwright-mcp.

## Targeted Fix Follow-up — 2026-10-24

**Scope:** Correct confirmed checkout order-creation validation and clear repository-wide frontend lint errors. Rechecked profile and product-store persistence through isolated tests. No live business data was written.

### Changes

- Multi-store carts can still reach payment review, but `checkoutPolicyError` now blocks order creation until the separate-store checkout service is supported.
- Single-store order creation now rejects handling fees other than the supported ₹5 before the order request is sent. Previously this mismatch could be detected only after order creation.
- Corrected effect/state handling in the notification badge, cart coupon validation, product stock lookup, customer address refresh, and order review prompt. These changes preserve their existing UI behavior and clear full-project ESLint findings.
- Product-to-store mapping deletion and admin profile-name updates already have authenticated backend paths in the current worktree. Their UI workflow needs an isolated disposable product/account to verify through the browser; this follow-up did not use a real product or profile.

### Verification

| Check | Result |
|---|---|
| Frontend Node suite | PASS — 172/172 tests. Checkout tests now cover review access separately from order-creation blocking and reject unsupported handling totals before creation. |
| Full frontend ESLint | PASS — no errors or warnings. |
| Frontend production build | PASS — existing Vite chunk and dynamic-import warnings remain. |
| Catalog API integration | PASS — `CatalogApiIntegrationTest`, 3/3; includes mapping create/read/update/delete and role-guarded writes against the isolated test database. |
| Staff profile persistence | PASS — `StaffProfilePersistenceTest`, 1/1 against its isolated fixture. |
| Browser smoke | PASS after full navigation — Global Admin dashboard and Customer profile/order list rendered in the two existing tabs. Read-only only; no customer details recorded. A transient context error appeared during Vite hot reload and cleared on full navigation. |
| `git diff --check` | PASS — only existing line-ending normalization warnings were reported. |

### Remaining blockers and unverified workflows

- GA-17 historical integrity remains unresolved: 2 shipped and 4 delivered orders still lack fulfillment/shipment rows. No records were fabricated or backfilled. Future status-transition safeguards remain covered by the previously reported order and fulfillment test suites.
- A live browser persistence check for profile-name save and product mapping unassign still needs an approved disposable test account and product. The isolated persistence/CRUD tests passed; no existing user's profile or product was used.
- The browser's empty Reviews collection, Payments collection, and notification data do not provide fixtures for moderation, payment-detail, or complete notification-destination tests. No payment or notification was initiated.
- Banner, coupon, notification configuration, and the full 28 Global Admin cases were not rerun end to end in this follow-up. The Customer tab was read-only; checkout/order submission, account edits, addresses, reviews, and other customer writes were not attempted.

**Files changed in this follow-up:** `src/utils/checkoutPolicy.js`, `src/utils/checkoutPolicy.test.js`, `src/components/HomeHeaderBanner/HomeHeaderBanner.jsx`, `src/components/ProductCard/ProductCard.jsx`, `src/context/AppContext.jsx`, `src/pages/CartPage/CartPage.jsx`, `src/pages/OrderDetailViewPage/OrderDetailViewPage.jsx`, and this report. Existing unrelated worktree changes were preserved.

**Disposition:** Confirmed code/test/lint failures in scope are fixed. The portal cannot be marked fully clear while historical fulfillment data and the listed fixture-dependent browser checks remain unresolved.

## Targeted Local Retest — 2026-10-24

**Scope:** Read-only confirmation of current Dashboard/Reports totals and Reviews route, plus a disposable product-to-store unassign persistence check. No existing customer, order, inventory, payment, or profile records were changed. No MySQL data was purged.

### Results

| Check | Result | Evidence |
|---|---|---|
| Dashboard metrics | PASS | Authenticated Dashboard showed 15 orders, 3 completed, 8 customers, and ₹5,399 revenue. |
| Reports totals | PASS | Reports showed the same 15 orders, 3 delivered, 8 registered customers, and ₹5,399 revenue. |
| Reviews listing | PASS (listing only) | Authenticated `GET /order-api/api/v1/reviews/admin?page=0&size=20&status=PENDING` returned HTTP 200; UI showed 0 pending reviews. Moderation persistence remains untested because there is no review fixture. |
| Product-to-store unassign | PASS | Created a uniquely named Draft QA product and assigned a local store; mapping creation returned HTTP 201. Removed the mapping in Edit; mapping DELETE returned HTTP 204. Reopened Edit and the persisted mapping read returned HTTP 200 with `[]`. |
| QA data cleanup | PASS | Deleted only the QA product created for this test; product DELETE returned HTTP 204 and the unique product name no longer appeared. Its variant, image, and store mapping were associated only with this disposable product. |
| MySQL cleanup | NOT NEEDED | No shared or historical data was deleted. The QA product was removed through the application API after verification. |

### Still unresolved

- Historical order lifecycle integrity remains unresolved: the latest recorded audit found 2 of 10 shipped and 4 of 5 delivered orders without fulfillment/shipment rows. No existing orders were repaired or backfilled. The transition safeguard is verified by the previously reported isolated backend suites, but it does not repair historical rows.
- Payments and moderation-action persistence still lack disposable fixtures; listing an empty Reviews collection does not verify approve/reject writes.
- The full set of 28 Global Admin and Customer portal cases was not repeated in this targeted retest. Customer authenticated workflows and destructive/payment writes remain outside this check.

**Changes this retest:** This report only. No application source/configuration was changed. The only data write was creation and subsequent cleanup of the isolated QA product, variant, image, and mapping in the local application database. No new tests, lint, or build commands were run in this retest; prior automated results are recorded above.

## Historical Order Lifecycle Safeguard Follow-up — 2026-10-24

**Scope:** Harden the order status endpoint for existing SHIPPED/DELIVERED records that are submitted again with the same status. Historical order, fulfillment, and shipment rows were not modified.

### Finding and fix

The order status service checked for a valid persisted shipment only when changing to a new status. Its idempotent early return accepted a repeated SHIPPED or DELIVERED request without checking whether the required shipment record existed. The endpoint now verifies the persisted shipment for repeated SHIPPED and DELIVERED requests too. A SHIPPED order accepts shipment states IN_TRANSIT, OUT_FOR_DELIVERY, or DELIVERED; a DELIVERED order requires a DELIVERED shipment. This closes a validation gap but does not create or repair historical records.

### Verification

| Check | Result |
|---|---|
| Focused OrderServiceTest | PASS — 16/16 tests. |
| Full order-service Maven suite | PASS — 82 tests, 0 failures, 0 errors. |
| Local MySQL records | Unchanged — no historical order/fulfillment/shipment rows were written, deleted, or backfilled. |

**Files changed:** `ecom-backend/order-service/src/main/java/com/metaarch/order/order/FulfillmentLifecycleVerifier.java`, `ecom-backend/order-service/src/main/java/com/metaarch/order/order/OrderService.java`, `ecom-backend/order-service/src/test/java/com/metaarch/order/order/OrderServiceTest.java`, and this report.

**Remaining:** The previously identified 2 shipped and 4 delivered orders still need an individually verified, approved historical repair plan. No fabricated records were added, consistent with the earlier instruction not to backfill existing orders automatically. No authenticated browser workflow or live status write was used to verify this code change.

## Local Seeded Order Correction - 2026-10-24

**Scope:** Corrected two known demo fixtures that were marked SHIPPED/DELIVERED despite having no fulfillment-service records. No order rows were deleted and no shipment or tracking data was fabricated.

### Finding and correction

The order-service seed migration created `DEMO-BLR-2001` as SHIPPED and `DEMO-CHN-3001` as DELIVERED. The fulfillment-service seed migration uses a different order ID, so neither seeded order had a matching fulfillment or shipment. Added order-service migration V19 to move only those exact demo ID/order-number/status pairs to PROCESSING. Applied the same narrow correction to the local MySQL rows; their item and address data remain intact.

### Verification

| Check | Result |
|---|---|
| Demo fixture preflight | PASS - both exact demo order IDs and numbers were present with the expected terminal statuses before the transaction. |
| Local correction | PASS - exactly 2 seeded demo rows changed to PROCESSING in one transaction; no rows were deleted. |
| Lifecycle aggregate after correction | 1 of 9 SHIPPED orders and 3 of 4 DELIVERED orders still lack fulfillment and shipment rows. |
| Existing non-demo orders | Unchanged - the four remaining affected records do not match the known demo seed identifiers; their provenance was not established, so they were not altered. |

**Files changed:** `ecom-backend/order-service/src/main/resources/db/migration/V19__normalize_unfulfilled_demo_order_statuses.sql` and this report.

**Remaining:** The four other orphaned terminal-status orders still need an evidence-based repair decision. The source data does not establish their shipment/tracking details, and deleting or changing them would risk altering real local order history. Future status transitions remain protected by the previously tested fail-closed checks.

**Migration note:** Flyway is disabled in the local order-service `application.yml`, and this database's recorded Flyway history currently ends at version 8. The exact two-row correction above was applied directly in one local MySQL transaction. V19 is committed as the repeatable correction for environments where order-service Flyway migrations are enabled; enabling Flyway locally was avoided because versions 9-19 are pending in this database.

## Seeded Test Order Cleanup - 2026-10-24

**Scope:** Removed only the six explicit order-service seed fixtures (`DEMO-*` and `PKL-ORDER-1001`) and directly linked test history from local MySQL. The 56 unmarked `ORD-*` orders were preserved.

### Removed fixture data

| Data | Deleted |
|---|---:|
| Seeded orders | 6 |
| Order items | 9 |
| Order addresses | 6 |
| Demo payment | 1 |
| Payment transaction rows | 2 |
| Fulfillment snapshot / fulfillment / shipment | 1 each |
| Tracking events | 2 |
| Seed cart and cart items | 1 cart, 3 items |

The cleanup was performed across the local order, payment, fulfillment, and cart schemas in one transaction after verifying exact fixture IDs, order numbers, and expected child counts. No unmarked orders, customer profiles, inventory, or unrelated payment records were touched.

### Post-cleanup verification

| Check | Result |
|---|---|
| Seed fixture orders, payments, fulfillment, tracking and cart | PASS - 0 matching rows remain. |
| Other local orders | PASS - 56 unmarked `ORD-*` rows remain. |
| Shipped/delivered records | 1 of 9 SHIPPED and 3 of 4 DELIVERED orders still lack fulfillment and shipment rows. |
| Automated tests | Not run in this cleanup; verification used direct read-back queries and `git diff --check`. |

The four remaining orphaned orders are not identifiable as the explicit seed fixtures, so they were preserved. The V19 migration remains a guarded status correction for the two demo orders if those seed rows exist in another database.

## Lifecycle Issue Verification - 2026-10-24

**Result: NOT FULLY RESOLVED.** The six seeded test orders and linked fixtures remain deleted, but a fresh local database audit still finds four unmarked orders in terminal states without persisted fulfillment or shipment rows: 1 SHIPPED and 3 DELIVERED. No records were changed during this verification.

| Check | Result |
|---|---|
| Order-service full Maven suite | PASS - 82 tests, 0 failures, 0 errors, 0 skipped. |
| Fulfillment-service full Maven suite | PASS - 20 tests, 0 failures, 0 errors, 0 skipped. |
| Local DB read-only lifecycle audit | FAIL - 1/9 SHIPPED and 3/4 DELIVERED orders lack fulfillment and shipment rows. |
| Seeded fixture cleanup | PASS - 0 of the six explicit seed order IDs remain. |

Automated tests confirm the status-transition safeguards work for new requests, but do not repair the four historical rows. No live order status, fulfillment, shipment, payment, or customer data was modified in this verification.
