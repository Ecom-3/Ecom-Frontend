# Super Admin Unresolved Issues Test Report

- **Run date:** 2026-10-23
- **Frontend:** `http://localhost:5173`
- **Account role:** Super Admin
- **Method:** Manual browser testing plus read-only/API-backed checks, except for reversible test data explicitly identified below.
- **Test framework:** `ecom-frontend/package.json` has build and lint scripts but no configured end-to-end or test script. No source code was changed.
- **Database evidence:** Persistence was checked by fetching the saved records again from the backend APIs after browser reload. No direct SQL query was run against the live database.
- **Safety:** No existing orders or payment records were changed, and no payment was initiated. Temporary mapping and banner records were deleted. The test inventory row remains in the backend with zero stock and `INACTIVE` status because no delete operation is exposed.

## Status summary

| Use case | Status | Outcome |
|---|---|---|
| SA-34 — Product-to-store mapping | NOT IMPLEMENTED | Admin product forms have no mapping controls; the mapping API works and persists. |
| SA-36 — Campaign targeting | NOT IMPLEMENTED | Super Admin banner forms hide scope/location/store fields; the API supports and persists targeting. |
| SA-38 — Inventory creation | FAIL | Create persisted, but the new row was not visible after refresh because the UI loads only one 50-row API page. |
| SA-39 — Stock adjustment | PASS | Increase/decrease, overdraw validation, and movement history worked through the inventory API. |
| SA-43 — Order inspection | PASS | An existing order appeared in the list and its details loaded. No order was changed. |
| SA-44 — Order processing and packing | BLOCKED | No safe test-owned order/customer was available for valid state transitions. |
| SA-45 — Ready-to-ship fulfillment | BLOCKED | No safe test-owned order with shipping-address data was available. |
| SA-46 — Shipment status transitions | BLOCKED | No safe test-owned order/shipment was available. |
| SA-49 — Global stocked-store assignment | FAIL | The assignment route says “Order not found” for an order returned by the order API. |
| SA-50 — Store selection | BLOCKED | The broken SA-49 route never loads the order or eligible-store options. |
| SA-51 — Assignment approval and parcel workflow | NOT IMPLEMENTED | The global assignment screen has no approval or parcel editor/API. |
| SA-52 — Payments collection | FAIL | The Admin collection is empty despite existing payments; the payment service has no collection GET endpoint and the root GET returns 500. |
| SA-53 — Payment transaction details | PASS | A pre-existing `DEMO_CARD` payment and its two transaction rows loaded through the API. |
| SA-54 — Customers collection | FAIL | The Admin collection is empty; tested customer-list paths are forbidden and no admin listing endpoint exists. |
| SA-71 — Admin Name field | FAIL | `/api/users/me` returns a null name and the profile dialog binds that value to a blank input. |

## SA-34 — Product-to-store mapping

- **Status:** NOT IMPLEMENTED.
- **Expected vs actual:** A Super Admin should be able to assign a catalog product to a store and verify the association afterward. The product create form exposed no store/mapping field; the mapping CRUD API is functional.
- **Reproduction:** Open `/admin/products` → **Create**. The form contains product/catalog fields but no store selector or mapping action. Create a temporary mapping through `POST /catalog-service/api/v1/store-products`, reload the browser, and query `GET /catalog-service/api/v1/store-products?productId=...`.
- **Frontend route/component and API:** `/admin/products`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx). Backend endpoints `GET/POST /catalog-service/api/v1/store-products`, `PUT/DELETE /catalog-service/api/v1/store-products/{id}`; [StoreProductController.java](../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/storeproduct/StoreProductController.java).
- **Root cause:** **Confirmed:** the Super Admin product schema has no store-assignment controls or save path. **Confirmed:** backend store-product CRUD exists.
- **Evidence:** A temporary product/store association returned HTTP `201`, remained queryable after a browser reload, and was removed with HTTP `204`; a follow-up query confirmed it was absent. No product/store mapping controls appeared in the form. Screenshot: [sa34-product-create.png](./super-admin-unresolved-evidence/sa34-product-create.png).
- **Recommended fix and regression test:** Add a Super Admin product-to-store mapping control that calls the existing store-product API. Add a UI/API regression test that creates a mapping, reloads, verifies it in the product/store view, and removes the fixture.
- **Missing prerequisites:** None for the API check. UI mapping could not be saved because its controls are absent.

## SA-36 — Campaign targeting

- **Status:** NOT IMPLEMENTED.
- **Expected vs actual:** Super Admin banner/campaign create and edit forms should expose global/location/store targeting and preserve the selected target. Neither form showed scope, location, or store controls.
- **Reproduction:** Open `/admin/banners` → **Create** and inspect the form; repeat by editing a banner. Create an inactive temporary store-targeted banner through the API, edit and save it in the UI without changing visible fields, then query it again.
- **Frontend route/component and API:** `/admin/banners`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx). `POST/GET/PUT/DELETE /catalog-service/api/v1/banners`; [BannerController.java](../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/banner/BannerController.java), [BannerRequest.java](../../ecom-backend/catalog-service/src/main/java/com/metaarch/catalog/banner/BannerRequest.java).
- **Root cause:** **Confirmed:** the Super Admin banner schema explicitly removes `scope`, `location`, and `store` fields even though the payload mapper and backend support them. **Confirmed:** the backend persists `scope`, `locationId`, and `storeId`.
- **Evidence:** Create form screenshot: [sa36-campaign-create.png](./super-admin-unresolved-evidence/sa36-campaign-create.png). An inactive temporary `STORE` campaign was created with `locationId=Hyderabad` and `storeId=store-benzcircle`; create returned `201`. After browser reload, the API returned the same targeting values. UI edit/save preserved them, but the controls remained hidden. Both temporary banners were deleted with `204` and verified absent.
- **Recommended fix and regression test:** Keep role-appropriate targeting fields in the Super Admin schema, wire them to the existing payload, and validate required location/store values for each scope. Test create and edit across GLOBAL, LOCATION, and STORE scopes, including reload persistence.
- **Missing prerequisites:** None for API targeting checks. UI targeting could not be configured because controls are absent.

## SA-38 — Inventory creation

- **Status:** FAIL.
- **Expected vs actual:** A uniquely identifiable record should be created and remain discoverable in the Admin inventory list after refresh. The create request succeeded and the backend returned the saved row, but searching for it after refresh returned “No matching records.”
- **Reproduction:** In `/admin/inventory`, create product-level inventory for Afghan Raisins (`21000000-0000-0000-0000-000000000008`) at Benz Circle Fresh Basket (`store-benzcircle`), initial stock `1`, reserved `0`, reorder level `2`. Refresh and search for inventory ID `d09971a1-328f-492d-84ad-da1650c8744a`.
- **Frontend route/component and API:** `/admin/inventory`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [inventoryApi.js](../src/services/inventoryApi.js), [inventoryAdapter.js](../src/services/inventoryAdapter.js). `POST /inventory-service/api/v1/inventories`; `GET /inventory-service/api/v1/inventories/{id}`.
- **Root cause:** **Confirmed:** the create API persisted the record (POST `201`, subsequent GET `200`). **Confirmed:** inventory list requests omit server `page`/`size`, and the UI paginates only the returned `content`. The default API response contained 50 rows while reporting `totalElements=380`; requesting `size=200` returned 200 of 380. Thus the UI shows 9 client-side pages of the first 50 rows, not all 380, and cannot find records outside that first backend page.
- **Evidence:** The test inventory row was saved with `ACTIVE`, quantity `1`, and ID `d09971a1-328f-492d-84ad-da1650c8744a`. After browser reload, direct GET still returned it, while Admin search showed no matching records. Screenshot: [sa38-inventory-not-listed.png](./super-admin-unresolved-evidence/sa38-inventory-not-listed.png). The final test row is retained with quantity `0` and status `INACTIVE`; the UI/backend expose no inventory delete operation.
- **Recommended fix and regression test:** Implement server-side inventory pagination/search (or deliberately fetch all pages) and use the API's total count for the pager. Add a test creating a record beyond the first server page, then refresh and search for it.
- **Missing prerequisites:** None. A safe product/store combination with no existing product-level inventory was verified by lookup returning `404`.

## SA-39 — Stock adjustment

- **Status:** PASS (API workflow).
- **Expected vs actual:** The test record's stock should adjust, persist, reject an overdraw, and expose adjustment history. All checks passed through the inventory service API; the Admin list hid the record because of SA-38.
- **Reproduction:** On test record `d09971a1-328f-492d-84ad-da1650c8744a`, POST an increase of `10`, then a decrease of `1`; GET the inventory after each. Attempt a decrease of `100`, then GET the movement history.
- **Frontend route/component and API:** `/admin/inventory`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [inventoryApi.js](../src/services/inventoryApi.js). `POST /inventory-service/api/v1/inventories/{id}/stock/increase`, `/stock/decrease`, `GET /inventory-service/api/v1/inventories/{id}/movements`.
- **Root cause:** No stock-service defect reproduced. The UI stock buttons could not be reached for this record because SA-38's list omitted it; API stock operations were tested directly.
- **Evidence:** Increase returned `200` and quantity `11`; decrease returned `200` and quantity `10`. Overdraw returned `409` with `Insufficient available stock`; quantity remained `10`. Movement history contained `INCREASE 10` and `DECREASE 1`, each with the QA reason. For cleanup, the test record was set to `INACTIVE`, quantity `0`; final GET returned `200`. No unrelated inventory row was touched.
- **Recommended fix and regression test:** Preserve stock operation behavior. Add API tests for increase, decrease, insufficient-stock rejection without mutation, and movement history; add an Admin UI test that can find and adjust a record beyond the first API page.
- **Missing prerequisites:** None for API checks. UI adjustment was unavailable for this record due to the SA-38 list defect.

## SA-43 — Order inspection

- **Status:** PASS.
- **Expected vs actual:** An order should appear in the Admin order list and its details should load. An existing global order appeared and its view dialog displayed order, status, amount, items, and fulfillment fields. No order was modified.
- **Reproduction:** Open `/admin/orders`, search for order `efd2c2d9-93f6-4cc7-b163-a71ba0438903` / `ORD-20261022-59323A83`, and click **View**.
- **Frontend route/component and API:** `/admin/orders`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx). `GET /order-api/api/v1/orders` and `GET /order-api/api/v1/orders/{orderId}`.
- **Root cause:** None reproduced for read-only order inspection.
- **Evidence:** The order list API returned HTTP `200` with 59 rows. The selected order was visible in the UI; its details dialog loaded and showed status `CREATED`, fulfillment type `global`, and global approval `Pending`. Direct order lookup returned HTTP `200`. Existing business data was used read-only because no test-owned order was available.
- **Recommended fix and regression test:** Keep list/detail behavior and add a read-only test that verifies a listed order can be opened by its backend ID without exposing sensitive address fields in logs.
- **Missing prerequisites:** None for inspection. A dedicated test order is still required for SA-44 through SA-46.

## SA-44 — Order processing and packing

- **Status:** BLOCKED.
- **Expected vs actual:** A test order should progress through supported processing and packing transitions with persisted status changes. No valid transition was submitted because only existing business orders were available.
- **Reproduction:** Inspect `/admin/orders` and the visible status/workflow actions; do not submit a transition for a non-test order.
- **Frontend route/component and API:** `/admin/orders`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [orderServiceWorkflow.js](../src/services/orderServiceWorkflow.js). Intended APIs include `PATCH /order-api/api/v1/orders/{id}/status` and the fulfillment create/status endpoints under `/fulfillment/api/v1/fulfillments`.
- **Root cause:** No application transition failure was established because the workflow was not exercised. **Confirmed test blocker:** the 59 available orders are existing business data, not a safe test-owned order.
- **Evidence:** Order list and details were readable (SA-43), but no `CONFIRM` or `PACKING` action was submitted; therefore no status or persistence claim is made.
- **Recommended fix and regression test:** Run the workflow against a dedicated test-owned order and verify CREATED → CONFIRMED → PROCESSING plus fulfillment state from a fresh GET. Keep this test isolated from production/customer orders.
- **Missing prerequisites:** A verified test customer account, customer-owned cart/order, valid catalog item, and shipping/billing address. Customer signup requires email OTP to a Gmail address; no controlled QA mailbox/account was available. Using an existing customer's order would alter unrelated data, so test data creation was not attempted.

## SA-45 — Ready-to-ship fulfillment

- **Status:** BLOCKED.
- **Expected vs actual:** An eligible test order should progress fulfillment to `READY_TO_SHIP` and retain that state after reload. No safe eligible order was available, so no transition was submitted.
- **Reproduction:** No safe UI/API mutation was performed. The source workflow indicates that the READY action advances PENDING → ALLOCATED → PACKING → READY_TO_SHIP.
- **Frontend route/component and API:** `/admin/orders`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [orderServiceWorkflow.js](../src/services/orderServiceWorkflow.js), [fulfillmentApi.js](../src/services/fulfillmentApi.js). `PATCH /fulfillment/api/v1/fulfillments/{id}/status`.
- **Root cause:** Not established; runtime behavior was not tested. The blocker is the missing test-owned order and address prerequisite.
- **Evidence:** No fulfillment status was changed; no persistence claim is made.
- **Recommended fix and regression test:** With a dedicated test order, verify the API response and fresh `GET /fulfillment/api/v1/fulfillments/order/{orderId}` after READY, including the expected status progression.
- **Missing prerequisites:** Same test-owned order, customer, and valid shipping address described in SA-44.

## SA-46 — Shipment status transitions

- **Status:** BLOCKED.
- **Expected vs actual:** A test shipment should transition through supported statuses with tracking information persisted. No shipment transition was submitted.
- **Reproduction:** No safe UI/API mutation was performed because no test-owned shipment exists.
- **Frontend route/component and API:** `/admin/orders`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [orderServiceWorkflow.js](../src/services/orderServiceWorkflow.js), [fulfillmentApi.js](../src/services/fulfillmentApi.js). Intended endpoints include `POST /fulfillment/api/v1/shipments`, `PATCH /fulfillment/api/v1/shipments/{shipmentId}/status`, and `GET/POST /fulfillment/api/v1/shipments/{shipmentId}/tracking-events`.
- **Root cause:** Not established; runtime behavior was not tested. The blocker is missing safe test order/fulfillment data.
- **Evidence:** Existing orders were left unchanged; no shipment or tracking row was created.
- **Recommended fix and regression test:** Use a dedicated test order to create a shipment, verify tracking number and each supported status from fresh API reads, and verify the ordered tracking-event history.
- **Missing prerequisites:** Same test-owned order and shipping address described in SA-44, plus an eligible fulfillment.

## SA-49 — Global stocked-store assignment

- **Status:** FAIL.
- **Expected vs actual:** Assigning a listed global order should load its stocked-store assignment screen. Clicking **Assign** navigated to `/admin/orders/assign/efd2c2d9-93f6-4cc7-b163-a71ba0438903`, but the screen displayed “Order not found.”
- **Reproduction:** Open `/admin/orders`, find global order `ORD-20261022-59323A83`, click **Assign**. The route uses the same UUID. Separately request `GET /order-api/api/v1/orders/efd2c2d9-93f6-4cc7-b163-a71ba0438903`.
- **Frontend route/component and API:** `/admin/orders/assign/{orderId}`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [GlobalStoreAssignment.jsx](../src/pages/AdminWorkspace/GlobalStoreAssignment.jsx). Backend lookup: `GET /order-api/api/v1/orders/{orderId}`.
- **Root cause:** **Confirmed:** `GlobalStoreAssignment` searches only `orderStore.list()` in browser-local storage; it does not load the order by ID from the order API. On route load, network requests included the order collection/customer path but no GET-by-ID for the route's order. **Confirmed:** direct backend GET for that same UUID returned HTTP `200`, order number `ORD-20261022-59323A83`, type `global`, status `CREATED`.
- **Evidence:** The UI route returned “Order not found”; the order service returned the matching persisted record. Screenshot: [sa49-order-not-found.png](./super-admin-unresolved-evidence/sa49-order-not-found.png).
- **Recommended fix and regression test:** Load the order and its items from the backend using `orderId`, show explicit API errors, and pass the loaded order to store-option calculation. Add a test where a backend order is absent from local storage but the assignment route still loads it.
- **Missing prerequisites:** None to reproduce the defect. No assignment was submitted.

## SA-50 — Store selection

- **Status:** BLOCKED.
- **Expected vs actual:** Eligible stores should load after SA-49 is resolved, and a selected assignment should persist. The route has no loaded order, so it shows no store selector and cannot reach persistence.
- **Reproduction:** Follow SA-49. The failed route renders “Order not found”; no store selection control is rendered.
- **Frontend route/component and API:** `/admin/orders/assign/{orderId}`; [GlobalStoreAssignment.jsx](../src/pages/AdminWorkspace/GlobalStoreAssignment.jsx). The current code computes options from `orderStore.globalStoreOptions(orderId)` and assigns via `orderStore.assignGlobalStore(...)`, both local-store operations.
- **Root cause:** **Confirmed blocker:** assignment depends on the same missing local order lookup as SA-49. The current implementation also uses browser-local assignment state rather than a server-backed assignment API.
- **Evidence:** No selectable stores were available and no assignment mutation was made. The assignment route is blocked before store eligibility can be evaluated.
- **Recommended fix and regression test:** Resolve SA-49, then load eligible stores and save through a backend assignment endpoint. Verify the selected store with a fresh order GET.
- **Missing prerequisites:** A working backend-backed global assignment screen and eligible store options for the loaded order.

## SA-51 — Assignment approval and parcel workflow

- **Status:** NOT IMPLEMENTED.
- **Expected vs actual:** The global stocked-store workflow should expose supported approval and parcel-edit operations. The route component exposes only store selection/confirmation; no approval or parcel fields/actions are present.
- **Reproduction:** Inspect the global order's **Assign** route. It currently stops at “Order not found”; the component implementation contains no approval or parcel editor.
- **Frontend route/component and API:** `/admin/orders/assign/{orderId}`; [GlobalStoreAssignment.jsx](../src/pages/AdminWorkspace/GlobalStoreAssignment.jsx). The inspected order/fulfillment/shipment controllers expose no global-assignment approval or parcel-edit endpoint.
- **Root cause:** **Confirmed:** the current global assignment component only selects a store and calls the local `orderStore.assignGlobalStore`. No approval/parcel controls or server persistence endpoint were found in the relevant controllers. The SA-49 route failure additionally prevents interaction.
- **Evidence:** No approval or parcel operation could be initiated; no order was changed. This is the global stocked-store workflow, not local delivery-partner assignment.
- **Recommended fix and regression test:** Define server-backed approval and parcel operations for global orders, expose them in the global assignment workflow, and test each mutation with fresh order/parcel reads. Keep it separate from local delivery-partner assignment.
- **Missing prerequisites:** The workflow/API is not implemented; SA-49 must also be resolved before any screen-based test.

## SA-52 — Payments collection

- **Status:** FAIL.
- **Expected vs actual:** The Admin Payments list should return existing records and support search/filter/pagination. The UI showed “No matching records” and page `1 of 1`, although order-specific payment lookups returned existing payments. Direct collection GET returned HTTP `500`.
- **Reproduction:** Open `/admin/payments`; inspect the empty list and controls. Then GET `/payment-service/api/v1/payments`; compare with `GET /payment-service/api/v1/payments/order/{orderId}` for listed orders.
- **Frontend route/component and API:** `/admin/payments`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx), [paymentApi.js](../src/services/paymentApi.js). Payment detail APIs exist, but no collection GET handler exists in [PaymentController.java](../../ecom-backend/payment-service/src/main/java/com/metaarch/payment/payment/PaymentController.java).
- **Root cause:** **Confirmed:** the Admin loader has no payment-service collection branch and falls back to the local `collectionStore`, which is empty. **Confirmed:** `PaymentController` defines no `GET /api/v1/payments` collection method. The root GET returned a generic HTTP `500` response (`An unexpected error occurred`). Search/status/sort/pagination therefore operate only on the empty local collection and do not query server data.
- **Evidence:** UI screenshot: [sa52-empty-payments.png](./super-admin-unresolved-evidence/sa52-empty-payments.png). Collection GET returned `500`; `GET /payments/capabilities` returned `200` with `processingEnabled=false`. For the first 12 orders, all 12 order-specific payment lookups returned `200`, demonstrating that the empty Admin list is not evidence of no payment data.
- **Recommended fix and regression test:** Add an authorized, paginated/filterable admin collection endpoint and wire the Admin page to it. Test non-empty and empty responses, filter/search, pagination, permissions, and distinguish service errors from genuinely empty results.
- **Missing prerequisites:** None; existing payment data was found. No payment was initiated.

## SA-53 — Payment transaction details

- **Status:** PASS (API details; Admin navigation remains blocked by SA-52).
- **Expected vs actual:** An existing sandbox/demo transaction's details and transaction history should load. Both endpoints returned the existing `DEMO_CARD` record and its history.
- **Reproduction:** Use a payment ID obtained from the read-only order-payment lookup, then GET the payment and transaction endpoints. No POST/payment initiation endpoint was called.
- **Frontend route/component and API:** Admin route `/admin/payments` has no accessible detail row because of SA-52. Verified APIs: `GET /payment-service/api/v1/payments/99c4b21e-3e05-42e9-8cd2-23d6f9890459` and `/payments/{paymentId}/transactions`; [paymentApi.js](../src/services/paymentApi.js).
- **Root cause:** No detail endpoint defect reproduced. The Admin UI cannot navigate to the existing transaction while its collection remains empty.
- **Evidence:** Payment detail returned HTTP `200`, status `SUCCESS`, method `DEMO_CARD`, amount `339 INR`. Transaction history returned HTTP `200` with two rows: `CAPTURE/SUCCESS` and `AUTHORIZE/PENDING`. Payment capabilities reported processing disabled. No real payment was initiated.
- **Recommended fix and regression test:** Keep detail/transaction reads and add an Admin detail test after SA-52 is wired, verifying details and history without invoking any payment mutation.
- **Missing prerequisites:** None for API read. Admin UI access to a row depends on resolving SA-52.

## SA-54 — Customers collection

- **Status:** FAIL.
- **Expected vs actual:** The Admin customer collection should retrieve existing customer records and apply its filters/pagination. The UI showed “No matching records” and page `1 of 1`; customer listing paths tested with the Super Admin token returned `403`.
- **Reproduction:** Open `/admin/customers`; try the list/search controls. Read-only API checks: `GET /customer-profile/api/v1/profiles`, `/customer-profile/api/v1/customers`, and `/org-access/api/customers`.
- **Frontend route/component and API:** `/admin/customers`; [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx). The inspected customer controllers are [CustomerProfileController.java](../../ecom-backend/customer-profile-service/src/main/java/com/metaarch/customerprofile/profile/CustomerProfileController.java) and [CustomerAccountController.java](../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/customer/CustomerAccountController.java).
- **Root cause:** **Confirmed:** AdminWorkspace has no backend customer-list branch and falls back to the empty local `collectionStore`. **Confirmed:** Customer Profile exposes a profile-by-user/me API, while Org Access exposes `/api/customers/me` for `CUSTOMER`; no admin collection route is implemented. Tested collection paths returned `403`. **Confirmed data indicator:** the order API returned 59 orders referencing 9 distinct customer IDs, so the empty Admin list cannot be explained by a lack of all customer-linked data.
- **Evidence:** UI screenshot: [sa54-empty-customers.png](./super-admin-unresolved-evidence/sa54-empty-customers.png). API responses: customer/profile collection paths `403`; orders list `200` with 59 rows and 9 distinct customer IDs. Search and status controls had no records to filter; pagination remained `1 of 1`.
- **Recommended fix and regression test:** Add a correctly authorized customer-list API with server-side pagination/search and wire the Admin collection to it. Test retrieval against existing customers, permission rules, search/filter, empty states, and pagination.
- **Missing prerequisites:** None for reproducing the collection failure. No new customer was registered; signup requires a verified Gmail OTP, and no controlled QA mailbox was available.

## SA-71 — Admin Name field

- **Status:** FAIL.
- **Expected vs actual:** The Admin Name field should show the saved Super Admin name. The profile dialog's Name input was blank.
- **Reproduction:** Open the top-right profile menu → **Profile & Settings**. Read `GET /org-access/api/users/me` without modifying or saving the shared profile.
- **Frontend route/component and API:** Profile dialog is rendered by [AdminWorkspace.jsx](../src/pages/AdminWorkspace/AdminWorkspace.jsx); API is `GET /org-access/api/users/me`, implemented by [StaffProfileController.java](../../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/StaffProfileController.java).
- **Root cause:** **Confirmed:** the API response has `role=super-admin` and `name=null`; the dialog initializes the input from `user?.name || ''`, yielding a blank value. The backend query derives name from `COALESCE(c.full_name,u.display_name)`, which returned null. **Confirmed:** the frontend save path calls local `staffProfileStore.update`, which writes local storage; the backend `PUT /api/users/me` profile update is restricted to delivery partners. The shared account was not saved or modified.
- **Evidence:** `/org-access/api/users/me` returned HTTP `200` with `name=null`. The profile dialog showed blank Name and populated email. Screenshot: [sa71-blank-admin-name.png](./super-admin-unresolved-evidence/sa71-blank-admin-name.png).
- **Recommended fix and regression test:** Populate the canonical Super Admin display name in persisted staff data and provide an authorized backend profile update path (or make the field explicitly read-only until one exists). Test API response → UI binding and update → fresh API response, without local-only success.
- **Missing prerequisites:** None for reproduction. Saving was intentionally avoided to protect the shared Super Admin account.

## Prioritized confirmed defects

1. **Inventory list omits most records:** the API reports 380 total rows but the Admin client loads only the first 50 and paginates those locally. Newly created records can persist yet be undiscoverable after refresh. This affects inventory visibility and follow-up stock actions.
2. **Global stocked-store assignment fails for backend orders:** the route resolves its order only from browser-local storage, while the corresponding order API returns the same ID successfully.
3. **Payments collection is not integrated:** Admin reads an empty local collection; the backend has no collection GET method, and the root collection GET returns `500` despite existing payment records being available by order.
4. **Customers collection is not integrated:** Admin reads an empty local collection; tested list paths are denied and the backend has no admin listing endpoint, despite customer IDs in persisted orders.
5. **Super Admin profile name is missing and profile save is local-only:** the profile API returns a null name, and the Admin save path does not persist profile changes to Org Access.
6. **Product-to-store and campaign targeting are unavailable in the Super Admin UI:** backend APIs support both, but the corresponding UI forms omit the controls.
7. **Global approval/parcel editing is not implemented:** the stocked-store component provides only a local store assignment action and no approval or parcel controls/API.
