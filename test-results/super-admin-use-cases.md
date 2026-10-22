# Super Admin QA Results

- **Run date:** 2026-10-22
- **App:** `http://localhost:5173`
- **Test approach:** Inspected `package.json`, routes, and existing test conventions. The project has Vite build/lint scripts and unit-test files, but no configured Playwright dependency or end-to-end test script. Used the available browser automation against visible UI controls; did not install dependencies or change application code.
- **Latest combined outcome:** **54 PASS, 4 FAIL, 15 BLOCKED** (73 cases). This combines the original full run with the targeted re-tests below; cases not re-tested retain their latest previously observed status.
- **Cleanup:** In the targeted re-test, both test-created admin users, the test store, and the test product and its visible duplicate were deleted and checked absent. The duplicate from the initial run, which was not visible at that time, remains unverified. Existing business orders and inventory were not changed.
- **Initial run:** The 73-row table below records the initial statuses; use the targeted re-test table for the latest status of the 30 cases re-tested after the app update.

| ID | Use case | Status | Evidence | Issue |
|---|---|---|---|---|
| SA-01 | Login through Team Login | PASS | Submitted the supplied credentials at `/team-login`; landed on `/admin` as Admin. | — |
| SA-02 | Access Super Admin dashboard | PASS | Dashboard showed “Welcome back, Admin” and the Super Admin portal. | — |
| SA-03 | View platform operational metrics | PASS | Dashboard displayed order, customer, product, low-stock, and revenue metrics (including 23 products and zero orders/revenue). | Order/revenue figures were zero in this environment. |
| SA-04 | Navigate permitted admin modules | PASS | Navigated through the Super Admin sidebar modules, including Locations, Users, Stores, catalog, orders, analytics, Security, and Audit Logs. | — |
| SA-05 | Create location | PASS | Created a uniquely named QA location; UI displayed “Saved successfully.” | — |
| SA-06 | View/search locations | PASS | Search found the test location and its View dialog opened. | — |
| SA-07 | Edit location details | PASS | Edited the test location’s contact number; UI displayed “Saved successfully” and an Updated locations audit entry was visible. | — |
| SA-08 | Activate/deactivate location | PASS | Deactivated the test location; action changed to Activate. | — |
| SA-09 | Delete location record | PASS | Deleted the test location and verified the search returned no matching records. | — |
| SA-10 | Configure location contact/address/coordinates | PASS | View details showed the test address, city, latitude/longitude, phone, and email values entered through the form. | — |
| SA-11 | Assign location administrator information | PASS | View details showed the test Assigned admin value. | — |
| SA-12 | Create Global Admin | FAIL | Submitted a test Global Admin using the Users form. UI reported “This account does not have permission for this action”; browser reported HTTP 403. | Staff creation is rejected for the Super Admin session. No user was created. |
| SA-13 | Create Location Admin | FAIL | Selected `location-admin` and Hyderabad, then submitted. UI again reported the permission error; browser reported HTTP 403. | Same 403 permission failure. No user was created. |
| SA-14 | View/search staff records | PASS | Users collection displayed no records; searching for the attempted test username returned “No matching records.” | Collection was empty. |
| SA-15 | Edit staff details and assignments | BLOCKED | No staff records were available; both test-user creation attempts were rejected with HTTP 403. | No safe staff record to edit. |
| SA-16 | Change active/blocked status through UI | BLOCKED | No staff records were available and test-user creation was denied. | Would require changing an existing account. |
| SA-17 | Delete staff record through available controls | BLOCKED | No staff records were available and test-user creation was denied. | Would require deleting an existing account. |
| SA-18 | View permitted store records | PASS | Store collection showed existing stores; View opened details for Kukatpally Neighbourhood Market. | — |
| SA-19 | Create store | BLOCKED | Opened the create form; it requires store location/map selection and coordinates. No store was submitted. | No safe test store/location fixture was available for map selection. |
| SA-20 | Update store information | BLOCKED | Existing store records were visible, but none were modified. | Only existing business stores were available. |
| SA-21 | Configure store location and map position | BLOCKED | Create form exposed location search and latitude/longitude fields; no test store was saved. | No safe map-selected store fixture. |
| SA-22 | Configure store delivery/pickup properties | BLOCKED | Delivery and pickup controls were visible in the store form; no record was saved. | No test store; existing settings were not changed. |
| SA-23 | Activate/deactivate/temporarily close store | BLOCKED | Existing stores were not status-toggled. | No test-created store was available. |
| SA-24 | Delete store through available controls | BLOCKED | Existing store records were left untouched. | Destructive action limited to test-created records. |
| SA-25 | Create/edit/delete categories | PASS | Created a unique QA category, edited its description, deleted it, and confirmed no matching record after navigation. | — |
| SA-26 | Manage category visibility | PASS | On a test category, changed Active to Inactive; the UI displayed Inactive and an Activate action. Deleted the test category afterward. | — |
| SA-27 | Create products | PASS | Created a test product with a unique SKU; UI displayed “Saved successfully.” | — |
| SA-28 | Edit product details | PASS | Edited the test product description; UI displayed “Saved successfully.” | — |
| SA-29 | Delete products | PASS | Deleted the test product and confirmed its search returned no results after navigation. | — |
| SA-30 | Duplicate product | FAIL | Duplicate action displayed “Duplicated successfully,” but searching for the expected “Copy” product returned no matching records. | Copy was not visible/searchable, preventing verification and UI cleanup. |
| SA-31 | Activate/deactivate/draft product | PASS | Test product was created Active, deactivated (action changed to Activate), and a separate test product’s View details showed status Draft; both were removed. | — |
| SA-32 | Manage product variants and SKUs | PASS | Created a test product with a variant label/SKU/price; the variant entry remained in the Edit form. | — |
| SA-33 | Manage product images | BLOCKED | Product form accepted a main-image URL, but the test URL used the reserved `.invalid` domain and failed DNS resolution. | No reachable product-image URL was used, so image rendering could not be verified. |
| SA-34 | Map products to stores | BLOCKED | Product create/edit controls inspected did not expose a store-mapping action. | No mapping workflow was found in the Super Admin product UI. |
| SA-35 | Create/edit/delete banners | PASS | Created a scheduled test banner using an existing repository image, edited it, deleted it, and verified no matching record after navigation. | — |
| SA-36 | Schedule and target campaigns | BLOCKED | Test banner saved its schedule, Scheduled status, and target URL; create form showed no location/store audience-targeting controls. | Location/store campaign targeting could not be verified. |
| SA-37 | View inventory across permitted stores | PASS | Inventory showed multiple pages of records with product and store information. | — |
| SA-38 | Create/edit inventory records | BLOCKED | Inventory records existed, but no test-created product/store inventory mapping was available. | Avoided creating or changing inventory for existing product/store combinations. |
| SA-39 | Adjust inventory quantities | BLOCKED | Stock adjustment controls were visible, but no existing inventory quantity was changed. | No test-created inventory record was available. |
| SA-40 | Inspect reserved stock/reorder thresholds | PASS | Inventory View details showed available quantity 50, reserved quantity 0, and reorder level 10. | — |
| SA-41 | View/search/filter orders | PASS | Searched the Orders list by order ID; matching global order remained visible. | — |
| SA-42 | Inspect order details | PASS | Opened an order’s View dialog and inspected its order and fulfillment detail fields. | — |
| SA-43 | Confirm order | BLOCKED | Existing orders were present, but no test-created order was available. | Confirmation would alter existing business data. |
| SA-44 | Progress order processing/packing | BLOCKED | Existing order status actions were not used. | No test-created order; existing order data was preserved. |
| SA-45 | Mark fulfillment ready to ship | BLOCKED | No test-created fulfillment/order was available for a status change. | Existing order data was preserved. |
| SA-46 | Progress shipment/order statuses | BLOCKED | No test-created shipment/order was available for a status change. | Existing order data was preserved. |
| SA-47 | Access delivery-partner assignment workflow | FAIL | Clicking Assign on an eligible store order changed the URL to `/admin/orders/delivery/...`, but the Super Admin page remained the order list rather than rendering an assignment workflow. | Assignment route did not render a workflow for the Super Admin session. |
| SA-48 | Review global fulfillment orders | PASS | Orders list showed India-wide Global Store orders and their global delivery label. | — |
| SA-49 | Open stocked-store assignment workflow | BLOCKED | Global-order Assign control was disabled for the inspected global order; no stocked-store workflow opened. | No usable assignment control in the Super Admin view. |
| SA-50 | Select eligible stocked store for global order | BLOCKED | No stocked-store assignment UI was available. | Selection would require a working assignment workflow. |
| SA-51 | Manage global approval/parcel information in available UI | BLOCKED | Global order details were viewable, but no editable approval/parcel workflow was verified. | No safe test global order or applicable editor was available. |
| SA-52 | View payment records and statuses | BLOCKED | Payments module displayed “No matching records.” | No payment records were available. |
| SA-53 | Inspect payment-related transaction details | BLOCKED | Payments collection was empty. | No payment transaction to inspect. |
| SA-54 | View customer records in admin collection | BLOCKED | Customers module displayed “No matching records.” | No customer records were available. |
| SA-55 | Moderate general product reviews | PASS | Created and inspected a temporary review in the Reviews module. | — |
| SA-56 | Approve/reject reviews | PASS | Changed the test review to Approved and then Rejected; each status appeared in the list. | — |
| SA-57 | Respond to reviews | PASS | Saved a temporary reply and verified it in the review View dialog. | — |
| SA-58 | Configure coupon definitions | PASS | Created a test coupon with percentage discount, dates, usage limit, and All customers eligibility. | — |
| SA-59 | Duplicate/edit/disable coupons | PASS | Edited and duplicated the test coupon; copy appeared as inactive, and the original was deactivated. Test records were absent after refresh. | Duplicate cleanup briefly showed “Coupon not found”; refreshed search returned no test coupons. |
| SA-60 | Create notification records | PASS | Created a temporary notification and received “Saved successfully.” | — |
| SA-61 | Configure notification audience and schedule | PASS | View details showed audience All Customers, type Promotion, and the configured schedule. | — |
| SA-62 | View operational reports | PASS | Reports page displayed revenue/order/customer/product/stock metrics and store-performance rows. | — |
| SA-63 | Filter reports by date/location/store | PASS | Set a date range, selected Hyderabad and Hyderabad Main Store; report labels and store rows reflected the selection. | — |
| SA-64 | Review revenue/order/store-performance metrics | PASS | Report showed ₹0 revenue, 0 orders, 23 products, 2710 stock units, and store-performance rows. | Order/revenue metrics were zero in this environment. |
| SA-65 | Export JSON report | FAIL | Clicked Export on Reports and waited for a browser download; no download event or export confirmation occurred. | JSON export could not be verified. |
| SA-66 | View security-settings module | PASS | Security module opened and displayed the local settings collection. | Collection was initially empty. |
| SA-67 | Configure local RBAC/2FA/session/IP-policy records | PASS | Created a temporary RBAC record with a test value; UI displayed it and “Saved successfully.” Deleted it afterward. | Only RBAC was exercised; 2FA/session/IP variants were not separately tested. |
| SA-68 | Activate/deactivate local security-setting records | PASS | Deactivated the test security setting; action changed to Activate. Deleted the test record afterward. | — |
| SA-69 | View local administrative audit entries | PASS | Audit Logs displayed security and location entries, including create, update, and delete actions. | — |
| SA-70 | Inspect create/update/delete activity | PASS | Opened an audit detail and observed operation records for created/updated security and deleted/updated locations. | — |
| SA-71 | Edit staff profile through admin dialog | BLOCKED | Profile dialog opened, but the existing Admin Name field was blank. | Avoided saving changes to the shared Super Admin account. |
| SA-72 | Attempt password update through available UI | PASS | Submitted a short test password; UI rejected it with “New password must contain at least 6 characters.” | A valid password change was not attempted to avoid changing the shared account credential. |
| SA-73 | Logout | PASS | Sign out returned to `/login`; navigating to `/admin` redirected back to `/login`. | — |

## Targeted re-test after app update

Re-tested every case previously marked FAIL or BLOCKED using the running updated app and visible UI controls. Test-created records were removed where the UI allowed; no existing business order or stock quantity was changed.

| ID | Use case | Latest status | Re-test evidence | Issue |
|---|---|---|---|---|
| SA-12 | Create Global Admin | PASS | Created a disposable Global Admin; the Users list showed “Saved successfully” and the new record. Deleted it after testing. | — |
| SA-13 | Create Location Admin | PASS | Created a disposable Location Admin assigned to Hyderabad; the Users list showed “Saved successfully” and the new record. Deleted it after testing. | — |
| SA-15 | Edit staff details and assignments | FAIL | Opened Edit on the disposable Global Admin and submitted a changed name; the UI returned a permission error and the browser recorded HTTP 403. The test user was subsequently deleted. | Staff creation now succeeds, but staff update remains denied. |
| SA-16 | Change active/blocked status through UI | PASS | Toggled the disposable Global Admin to inactive and back; the action changed from Deactivate to Activate and back. | — |
| SA-17 | Delete staff record through available controls | PASS | Deleted both disposable admin records and verified the Users list showed no matching records. | — |
| SA-19 | Create store | PASS | Created a uniquely named test store; the UI displayed “Saved successfully” and the record appeared in search. | — |
| SA-20 | Update store information | PASS | Edited the test store description; the UI displayed “Saved successfully.” | — |
| SA-21 | Configure store location and map position | PASS | Searched for Hyderabad; the map location populated the address and coordinates. Store details showed latitude 17.360589 and longitude 78.4740613. | — |
| SA-22 | Configure store delivery/pickup properties | PASS | Set delivery and pickup to Yes; details showed both enabled, a 5 km radius, and a 30-minute ETA. | — |
| SA-23 | Activate/deactivate/temporarily close store | FAIL | Deactivate changed the test store action to Activate, and reactivation changed it back. Selecting Temporarily Closed and saving showed success, but the details still showed status Active. | Temporary-closure status did not persist as displayed by View details. |
| SA-24 | Delete store through available controls | PASS | Deleted the test store and verified its filtered list showed no matching records. | — |
| SA-30 | Duplicate product | PASS | Duplicating the test product showed the generated copy name and SKU; the copy appeared in the filtered list. Deleted the copy and original test product. | Initial-run invisible duplicate remains unverified; the re-test duplicate was cleaned up. |
| SA-33 | Manage product images | PASS | Created a test product using the repository image at `/src/assets/images/mango_pickle_jar.png`; the rendered image loaded with natural width 1024 and the details retained the URL. Deleted the product afterward. | — |
| SA-34 | Map products to stores | BLOCKED | Re-inspected the product create/edit form; it exposes no store-mapping control. | No product-to-store mapping workflow was available in the Super Admin product UI. |
| SA-36 | Schedule and target campaigns | BLOCKED | Re-inspected the banner form; it supports start/end dates and a target URL but has no location/store audience-targeting control. | Location/store targeting could not be exercised. |
| SA-38 | Create/edit inventory records | BLOCKED | The create form was available, but the list exposes View and stock-adjustment actions without a delete control. No inventory record was submitted because a test-created record could not be safely cleaned up. | No safe create/edit round-trip with cleanup available. |
| SA-39 | Adjust inventory quantities | BLOCKED | Existing inventory entries still exposed Stock +10, Stock -1, and Adjust; no test-created inventory entry was available, so no existing quantity was changed. | Safe quantity-adjustment and rollback require a disposable inventory record. |
| SA-43 | Confirm order | BLOCKED | Orders remained existing business records; no test-created order was available for confirmation. | Avoided changing an existing order. |
| SA-44 | Progress order processing/packing | BLOCKED | No test-created order was available to advance through processing or packing. | Avoided changing existing order status. |
| SA-45 | Mark fulfillment ready to ship | BLOCKED | No test-created fulfillment/order was available for a ready-to-ship transition. | Avoided changing existing order status. |
| SA-46 | Progress shipment/order statuses | BLOCKED | No test-created shipment/order was available for status progression. | Avoided changing existing order status. |
| SA-47 | Access delivery-partner assignment workflow | PASS | Assign on a local store order opened “Assign delivery partner”; the dialog showed 7 active delivery partners. No assignment was submitted. | — |
| SA-49 | Open stocked-store assignment workflow | BLOCKED | Assign on a global order navigated to `/admin/orders/assign/...`, which displayed “Order not found.” | Global stocked-store workflow did not load for the listed order. |
| SA-50 | Select eligible stocked store for global order | BLOCKED | No stocked-store selector was available because the global assignment route showed “Order not found.” | Could not reach a store-selection workflow. |
| SA-51 | Manage global approval/parcel information in available UI | BLOCKED | The global assignment route showed “Order not found”; no approval or parcel editor was available. | No global-order editor could be verified. |
| SA-52 | View payment records and statuses | BLOCKED | Payments still displayed “No matching records.” | No payment records were available. |
| SA-53 | Inspect payment-related transaction details | BLOCKED | Payments remained empty; no transaction detail could be opened. | No payment transaction was available. |
| SA-54 | View customer records in admin collection | BLOCKED | Customers still displayed “No matching records.” | No customer records were available. |
| SA-65 | Export JSON report | FAIL | Export JSON displayed “JSON report downloaded as scoped-report-2026-10-22.json,” but the browser automation recorded no download event after waiting 8 seconds. | UI reports success, but an actual browser download was not confirmed. |
| SA-71 | Edit staff profile through admin dialog | BLOCKED | Reopened Profile & Settings; the Admin Name field was still blank. | Avoided saving changes to the shared Super Admin profile. |

## Follow-up re-test of failed and blocked cases

Re-tested only cases previously marked FAIL or BLOCKED. No existing business orders or inventory quantities were changed. A disposable store created to repeat the temporary-closure check was deleted and no longer appeared in the list. The extra Global Admin creation attempt was part of preparing a disposable fixture for the staff-edit test; it failed before a user was created.

| ID | Use case | Follow-up status | Evidence | Issue |
|---|---|---|---|---|
| SA-12 | Create Global Admin | FAIL | Latest attempt to create a disposable Global Admin returned “This account does not have permission for this action”; browser logged HTTP 403. The dialog was canceled without creating a record. | Contradicts the prior successful targeted run; creation is currently denied again. |
| SA-15 | Edit staff details and assignments | FAIL | The prior edit submission on a disposable staff record returned HTTP 403. In this follow-up, fixture creation failed with HTTP 403, so a fresh edit attempt was not possible. | Staff update remains denied; current test setup also cannot create a disposable user. |
| SA-23 | Activate/deactivate/temporarily close store | FAIL | Re-created a disposable store with status Temporarily Closed. Save showed “Saved successfully,” but the list and View details both reported Active. Deleted the test store afterward. | Temporary-closure status still does not persist/display as selected. |
| SA-34 | Map products to stores | BLOCKED | Re-opened the Product create form; it has no store-mapping control. | No mapping workflow available in the admin product UI. |
| SA-36 | Schedule and target campaigns | BLOCKED | Re-opened the Banner create form; it includes schedule and target URL fields, but no location/store audience selector. | Location/store targeting remains unavailable. |
| SA-38 | Create/edit inventory records | BLOCKED | Inventory Create form remains available, but inventory cards expose View and stock controls without a delete action. No record was created. | No safely cleanable test inventory record. |
| SA-39 | Adjust inventory quantities | BLOCKED | Existing cards expose Stock +10, Stock -1, and Adjust. No quantity action was used. | No disposable inventory record to adjust and roll back. |
| SA-43 | Confirm order | BLOCKED | Existing CREATED orders are listed with order actions; none is a test-created order. No action was submitted. | Confirmation would mutate existing business data. |
| SA-44 | Progress order processing/packing | BLOCKED | Existing orders remain the only available candidates; no status transition was submitted. | No test-created order to safely progress. |
| SA-45 | Mark fulfillment ready to ship | BLOCKED | No test-created fulfillment/order was available; no existing order was changed. | Safe fulfillment status test unavailable. |
| SA-46 | Progress shipment/order statuses | BLOCKED | No test-created shipment/order was available; no existing order was changed. | Safe shipment status test unavailable. |
| SA-49 | Open stocked-store assignment workflow | BLOCKED | Assign on a listed global order routed to `/admin/orders/assign/...`, which displayed “Order not found.” | Global assignment workflow still fails to load the listed order. |
| SA-50 | Select eligible stocked store for global order | BLOCKED | The stocked-store route displayed “Order not found” and no store selector. | Cannot select a store without a functioning workflow. |
| SA-51 | Manage global approval/parcel information in available UI | BLOCKED | The same global assignment route showed “Order not found”; no approval or parcel controls appeared. | No global fulfillment editor available. |
| SA-52 | View payment records and statuses | BLOCKED | Payments collection still displayed “No matching records.” | No payment records available. |
| SA-53 | Inspect payment-related transaction details | BLOCKED | Payments collection remained empty; no transaction detail was available. | No transaction to inspect. |
| SA-54 | View customer records in admin collection | BLOCKED | Customers collection still displayed “No matching records.” | No customer records available. |
| SA-65 | Export JSON report | FAIL | Export showed “JSON report downloaded as scoped-report-2026-10-22.json,” but no browser download event occurred after waiting 7 seconds. | UI success message does not confirm that a file reached the browser. |
| SA-71 | Edit staff profile through admin dialog | BLOCKED | Reopened Profile & Settings; the shared Admin Name field remained blank. | Avoided saving changes to the shared Super Admin profile. |

## Important failures after targeted re-test

1. **Staff actions are inconsistent:** an earlier targeted run created Global and Location Admin records, but the latest Global Admin creation attempt returned HTTP 403; staff editing also returned HTTP 403.
2. **Temporary store closure did not persist:** the form reported success, but store details continued to show Active.
3. **JSON download remains unconfirmed:** the UI displayed a success message, but browser automation did not observe a download event.

Product duplication and local delivery-partner assignment were resolved in the targeted re-test. The global stocked-store assignment route still returns “Order not found” and remains blocked.

## Remediation and verification

The 73-row table above preserves the original browser run. The targeted and follow-up re-test tables record the latest outcomes for failed/blocked cases; all other cases retain their last observed result. The complete 73-case suite has not been rerun end to end.

| Use case | Change made | Verification / remaining work |
|---|---|---|
| SA-12, SA-13 | Staff creation now requires the explicit `SUPER_ADMIN` role. It no longer depends on a supplemental `USER_WRITE` grant that the live service rejected despite the login token containing it. Global Admins and non-admins remain denied. | Controller regression coverage is 6 PASS. An earlier browser re-test created both disposable roles successfully and deleted them, but the latest Global Admin creation attempt returned 403. Staff update separately returned 403 (SA-15). |
| SA-30 | Product duplication now creates a separate Catalog product, generates a new slug/SKU, copies supported variants and image references, reloads the list, and reports success only after receiving a new product ID. | Browser re-test found the generated copy in the product list and deleted it and the test original. The duplicate from the initial run remains unverified. |
| SA-47 | Super Admin and Global Admin assignment actions now route to the existing delivery-partner workflow for local orders; global orders route to stocked-store assignment. | Browser re-test opened the local delivery-partner dialog and showed 7 active partners. A listed global order still produced “Order not found” in the stocked-store route (SA-49–51). |
| SA-65 | Report filters now apply consistently to orders and store performance. JSON download uses a dated filename, keeps the object URL alive for the browser download, reports outcome, and excludes customer contact/address, payment, and item details. | Three focused report-data tests pass. UI reported the dated filename, but browser automation observed no download event; actual file delivery remains unverified. |

### Verification run

- Frontend production build: **PASS** (Vite build completed; existing large-chunk and dynamic-import warnings remain).
- Focused Admin Workspace ESLint: **PASS**.
- Focused report-data tests: **3 PASS**.
- Full frontend Node test run: **126 PASS, 4 FAIL**. Failures are in the pre-existing checkout-policy tests and malformed `src/utils/storeDelivery.test.js`, outside this Admin Workspace change.
- Full frontend lint: **FAIL** on existing errors in `HomeHeaderBanner.jsx`, `ProductCard.jsx`, `CartPage.jsx`, `OrderDetailViewPage.jsx`, and malformed `storeDelivery.test.js`.
- Org Access `UserControllerTest`: **6 PASS** (Super Admin allowed, Global Admin and permission-only ordinary user denied).
- The targeted browser re-tests were performed on the running app. The latest combined tally is **54 PASS, 4 FAIL, 15 BLOCKED**; this is not a complete rerun of all 73 cases.
- Before the update, login produced a Super Admin token with `PERM_USER_WRITE`, but `POST /api/users` returned 403. One targeted browser run created disposable Global Admin and Location Admin records, while the latest Global Admin create attempt and the staff update attempt returned 403.
