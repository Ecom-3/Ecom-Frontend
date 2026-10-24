# Super Admin QA Retest Report

**Environment:** `http://localhost:5173`  
**Retest date:** 2026-10-23  
**Scope:** SA-12, SA-13, SA-34, SA-36, SA-39, SA-43–46, SA-50–54, SA-65, and SA-71 only.  
**Safety:** No live business records were created, edited, deleted, activated, deactivated, assigned, or otherwise changed. Automated write-path tests ran against their isolated test fixtures. No source code was changed.

## Results at a glance

| Issue | Status | Summary |
|---|---|---|
| SA-12 | BLOCKED | Live account creation was not attempted against shared data; mocked controller coverage is not live persistence evidence. |
| SA-13 | BLOCKED | Same safe-write limitation; the role/authorization path has automated coverage, but no live creation was performed. |
| SA-34 | NOT IMPLEMENTED | Product-to-store mapping controls are absent from the Super Admin product form. |
| SA-36 | NOT IMPLEMENTED | Campaign/banner creation UI has no store/location targeting controls. |
| SA-39 | PASS | Isolated inventory lifecycle integration tests cover creation, persistence, stock movements, validation, and movement history; no live write was made. |
| SA-43 | BLOCKED | Existing orders were inspected read-only; no test-owned order was available for a complete list-to-detail workflow test. |
| SA-44 | BLOCKED | Processing/packing transitions were not applied to shared orders. |
| SA-45 | BLOCKED | No eligible test-owned order was available to verify ready-to-ship persistence safely. |
| SA-46 | BLOCKED | Shipment transitions were not applied to shared orders. |
| SA-50 | FAIL | Global assignment options request returned HTTP 500, preventing store selection. |
| SA-51 | NOT IMPLEMENTED | Store assignment/approval is present, but parcel editing is not exposed in the global workflow. |
| SA-52 | NOT IMPLEMENTED | Payment processing is disabled and the payment collection endpoint is unavailable (HTTP 500). |
| SA-53 | PASS | Existing DEMO_CARD payment and transaction detail APIs returned successfully; no payment was initiated. |
| SA-54 | FAIL | Customer collection is not available to the Super Admin UI; tested collection requests returned HTTP 403 and the UI showed no matching records. |
| SA-65 | FAIL | Reports use only locally stored orders: the report showed 23 while the read-only backend order API returned 59. The download event/file itself was not captured. |
| SA-71 | FAIL | The profile API returned `name: null` for the Super Admin and the UI consequently rendered an empty Admin Name field. |

## Detailed findings

### SA-12 — Admin account creation

- **Status:** BLOCKED
- **Expected:** Super Admin can create the intended admin account and the account is returned by the staff API after saving.
- **Actual:** The create form and staff collection are available. `GET /org-access/api/users` returned HTTP 200 with 14 staff records. Controller tests passed, but no live create was submitted because this environment was not established as disposable and creating an account would persist shared data.
- **Reproduction / route:** Sign in as Super Admin, open the Admin Workspace staff/user creation form, inspect role and location fields. The form's submit action was deliberately not used.
- **Relevant code / API:** `POST /org-access/api/users`; `src/pages/AdminWorkspace/AdminWorkspace.jsx`; `Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/UserController.java`.
- **Root cause:** Not established. Automated controller tests exercise authorization/validation with mocks, not live database persistence or the previously reported live authorization response.
- **Evidence:** `UserControllerTest` passed 14/14 tests; live staff list returned 14 records. No live POST was made.
- **Recommended fix / regression test:** No fix can be recommended from this evidence alone. In an isolated QA environment, create the intended role, assert the success response, then GET the new ID and verify persisted role/location and authorization boundaries.
- **Missing prerequisite:** Disposable QA tenant/database and an explicitly safe test identity.

### SA-13 — Admin account authorization/creation path

- **Status:** BLOCKED
- **Expected:** Super Admin can create the intended account type, while unauthorized roles are denied.
- **Actual:** Mocked controller tests passed, including Super Admin authorization and denial cases. A live account was not created, so end-to-end authorization and persistence remain unverified.
- **Reproduction / route:** Use the same Super Admin staff creation form and `POST /org-access/api/users`; no live submission was made.
- **Relevant code / API:** `src/pages/AdminWorkspace/AdminWorkspace.jsx`; `Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/UserController.java`; `Ecom-Org-access/src/test/java/com/metaarch/orgaccess/identity/UserControllerTest.java`.
- **Root cause:** Not established for the live issue. MockMvc results cannot establish the behavior of the running service/session.
- **Evidence:** 14/14 `UserControllerTest` tests passed. The live collection returned 14 records; no record count change was attempted or expected.
- **Recommended fix / regression test:** No code change is justified by current evidence. Repeat in isolated QA with a Super Admin create/read-back test and a non-Super-Admin forbidden test.
- **Missing prerequisite:** Disposable QA tenant/database and a safe test identity.

### SA-34 — Product-to-store mapping

- **Status:** NOT IMPLEMENTED
- **Expected:** Super Admin can select one or more stores for a product, save the mapping, and see it persist after reopening the product.
- **Actual:** The product create/edit UI has no store-mapping controls. The product-store mapping collection contained 312 records, establishing that mapping data exists, but the Super Admin form does not provide a way to create or edit it.
- **Reproduction / route:** Open the Super Admin product create/edit form and inspect all fields; no store selector or mapping control is present. No product or mapping was saved.
- **Relevant code / API:** Product form in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; product-store collection API was read-only queried (312 records).
- **Root cause:** Confirmed UI capability gap: the form omits mapping controls. Persistence of a new mapping was not tested because there is no UI control and no safe write was authorized.
- **Evidence:** Live form inspection; 312 existing product-store mapping records returned by the read-only collection request.
- **Recommended fix / regression test:** Add store selection to the product form and persist it through the existing mapping API; test create/edit/read-back and verify mappings remain after refresh.
- **Missing prerequisite:** None for confirming the UI gap; safe mapping-persistence verification requires an isolated test product/store.

### SA-36 — Campaign targeting

- **Status:** NOT IMPLEMENTED
- **Expected:** Campaign creation/editing supports store or location targeting and persists the selected audience.
- **Actual:** The Super Admin campaign/banner creation UI exposes no store, location, or scope targeting controls. Three banners were returned by the read-only list request; no campaign was created or changed.
- **Reproduction / route:** Open the campaign/banner create/edit form and inspect the available fields; no store/location targeting selector is present.
- **Relevant code / API:** Campaign/banner form and data loading in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; banner collection read-only request returned 3 records.
- **Root cause:** Confirmed UI capability gap for targeting. Whether a backend targeting field exists is not established by the UI inspection.
- **Evidence:** Live form inspection and three existing banner records. No write was submitted.
- **Recommended fix / regression test:** Define and expose store/location targeting in create/edit, persist the selected scope, and verify audience filtering after refresh using isolated campaign fixtures.
- **Missing prerequisite:** Isolated campaign data and a defined targeting contract if the backend has no targeting model.

### SA-39 — Inventory creation

- **Status:** PASS
- **Expected:** A valid inventory item is created, persisted, returned by the API, and remains readable after a fresh query.
- **Actual:** The isolated inventory integration lifecycle test passed, covering inventory creation and subsequent persisted stock/movement operations. The live inventory collection was not modified.
- **Reproduction / route:** Automated `InventoryApiIntegrationTest.inventoryLifecycleAndStockMovements` exercises the API lifecycle against its test fixture. No live create was submitted.
- **Relevant code / API:** Inventory API integration tests at `inventory-service/src/test/java/com/metaarch/inventory/InventoryApiIntegrationTest.java`; Super Admin inventory UI in `src/pages/AdminWorkspace/AdminWorkspace.jsx`.
- **Root cause:** No defect reproduced in the isolated integration test.
- **Evidence:** Inventory integration suite passed 5/5. This is automated isolated-test evidence, not a live-business-data write.
- **Recommended fix / regression test:** No fix indicated. Keep the create/read-back assertion in the integration suite and retain a UI/API smoke test in an isolated QA tenant.
- **Missing prerequisite:** None for isolated verification; live UI persistence was intentionally not tested.

### SA-43 — Order inspection

- **Status:** BLOCKED
- **Expected:** An order appears in the Super Admin list and its details load accurately.
- **Actual:** The read-only order API returned 59 orders; an existing order and its details could be read. A complete test-owned create/list/detail flow was not run, and no order was created.
- **Reproduction / route:** The Super Admin Orders route loads the list; inspect an existing order without changing it. Do not submit status or assignment controls.
- **Relevant code / API:** Orders UI in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; `GET /order-api/api/v1/orders` and order detail endpoint.
- **Root cause:** No list/detail defect was confirmed. A safe end-to-end test fixture was unavailable.
- **Evidence:** Read-only list response contained 59 orders; existing order detail GET returned HTTP 200. Order service tests passed 10/10 but use test doubles and do not prove live order detail persistence.
- **Recommended fix / regression test:** No code change recommended. Use an isolated test-owned order and assert list inclusion plus detail response after refresh.
- **Missing prerequisite:** Isolated test-owned order.

### SA-44 — Order processing and packing

- **Status:** BLOCKED
- **Expected:** Supported processing and packing actions transition the eligible order status and persist it.
- **Actual:** No live status transition was applied because all available orders were shared business records. The focused order-service tests passed but do not establish live UI-to-database behavior.
- **Reproduction / route:** In the Super Admin Orders UI, open an eligible test-owned order and use the supported processing/packing action; not executed against shared orders.
- **Relevant code / API:** Order workflow handlers in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; order service workflow endpoints.
- **Root cause:** Not established. Live persistence was not tested.
- **Evidence:** `OrderServiceTest` passed 10/10 and `GlobalStoreAssignmentTest` passed 5/5; no live transition was submitted.
- **Recommended fix / regression test:** No fix recommended from this evidence. In isolated QA, transition a test order through processing and packing, then re-fetch it and assert the persisted states and audit/history entries.
- **Missing prerequisite:** Isolated test-owned eligible order.

### SA-45 — Ready-to-ship fulfillment

- **Status:** BLOCKED
- **Expected:** An eligible packed order can be moved to ready-to-ship and the state persists.
- **Actual:** No eligible test-owned order was available. Existing orders were not changed.
- **Reproduction / route:** Use the supported fulfillment action on an isolated eligible order; no shared order was transitioned.
- **Relevant code / API:** Fulfillment workflow handlers in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; order-service workflow API.
- **Root cause:** Not established; the transition was not exercised end-to-end.
- **Evidence:** Read-only order API returned 59 records. Order-service automated tests passed but do not demonstrate a live ready-to-ship write.
- **Recommended fix / regression test:** In isolated QA, progress a fixture through packing, perform ready-to-ship, and verify the fresh order response and shipment/fulfillment record.
- **Missing prerequisite:** Isolated packed test order.

### SA-46 — Shipment status transitions

- **Status:** BLOCKED
- **Expected:** Supported shipment transitions and tracking information are saved and remain visible after refresh.
- **Actual:** No shipment/status mutation was made to shared orders. Tracking persistence was not verified.
- **Reproduction / route:** On a test-owned shipped order, perform each supported transition and re-fetch the order/shipment. Not executed.
- **Relevant code / API:** Shipment workflow handlers in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; order and fulfillment service APIs.
- **Root cause:** Not established because no safe test-owned shipment was available.
- **Evidence:** Read-only order data only; no live shipment mutation or tracking response was captured.
- **Recommended fix / regression test:** No fix recommended without a reproduced defect. Add an isolated shipment lifecycle test asserting status and tracking persistence after each transition.
- **Missing prerequisite:** Isolated shipment fixture with a tracking number.

### SA-50 — Global stocked-store assignment

- **Status:** FAIL
- **Expected:** The existing global order loads eligible stocked stores, and the Super Admin can select and persist an assignment.
- **Actual:** The order detail GET returned HTTP 200 and the active-store list returned 15 stores, but `GET /order-api/api/v1/orders/{id}/global-store-assignment-options` returned HTTP 500. The assignment UI displayed “Unable to load assignment” and no store selector. No assignment was submitted.
- **Reproduction / route:** Open `/admin/orders/assign/{orderId}` for the existing global order and load assignment options; the options request fails and the selector is not rendered.
- **Relevant code / API:** `src/pages/AdminWorkspace/GlobalStoreAssignment.jsx`; `GET /order-api/api/v1/orders/{id}/global-store-assignment-options`; backend `order-service/.../OrderService.java`, `GlobalStoreAssignmentCatalogClient.java`, and `GlobalStoreAssignmentInventoryClient.java`.
- **Root cause:** Confirmed failure point is the assignment-options endpoint returning HTTP 500. The underlying exception is **not confirmed**; service logs/stack trace were unavailable. Do not infer that the order is missing: its detail request returned HTTP 200.
- **Evidence:** Read-only order GET 200; active-store list 200 with 15 records; options GET 500; UI error and absent selector. `GlobalStoreAssignmentTest` passed 5/5 in isolation.
- **Recommended fix / regression test:** Inspect the order-service exception/log for the failing options request, correct the specific failing catalog/inventory dependency handling, and add an integration test that returns eligible stores for an order with a mixed set of in-stock and unavailable stores.
- **Missing prerequisite:** Backend order-service logs for the failing request are needed to confirm the underlying cause.

### SA-51 — Assignment approval and parcel workflow

- **Status:** NOT IMPLEMENTED
- **Expected:** Super Admin can approve assignment and edit parcel details in the global assignment workflow.
- **Actual:** Backend assignment behavior couples store assignment with approval/status updates; no parcel-edit fields or parcel-edit UI/API were identified. No assignment or approval was submitted.
- **Reproduction / route:** Open the global assignment workflow and inspect available actions/fields; parcel editing is absent. Do not confuse this route with local delivery-partner assignment.
- **Relevant code / API:** `src/pages/AdminWorkspace/GlobalStoreAssignment.jsx`; `order-service/.../OrderService.java` and global assignment controller/service endpoints.
- **Root cause:** Confirmed missing parcel workflow surface. Separate approval behavior is coupled to assignment; independent approval persistence was not tested.
- **Evidence:** UI inspection and backend assignment implementation; no parcel editing control/API identified. No live write.
- **Recommended fix / regression test:** Add explicit parcel data and edit operations to the global workflow (separate from local delivery-partner assignment), then test approval and parcel persistence after re-fetch.
- **Missing prerequisite:** A defined parcel data contract if one is not already specified.

### SA-52 — Payments collection

- **Status:** NOT IMPLEMENTED
- **Expected:** Authorized Super Admin can query a payment collection with working filters and pagination.
- **Actual:** Payment capabilities returned `processingEnabled: false`; `GET /payment-service/api/v1/payments` returned HTTP 500. The payment collection is not usable in the Super Admin UI.
- **Reproduction / route:** Open the Super Admin Payments page or request the collection endpoint; the page reports no matching records/error while the API fails.
- **Relevant code / API:** Payment page in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; `GET /payment-service/api/v1/payments`; `payment-service/.../PaymentController.java`.
- **Root cause:** The payment collection capability is unavailable; the observed API response is HTTP 500. The underlying server exception was not available, so the precise cause is unconfirmed.
- **Evidence:** Capabilities response says payment processing is disabled; collection request returned HTTP 500. An order-specific DEMO_CARD payment was available through a different API.
- **Recommended fix / regression test:** Implement/enable an authorized, paginated collection endpoint and connect the page filters to it; test empty/non-empty results, paging, filters, and role denial. Do not enable real processing as part of this QA fix.
- **Missing prerequisite:** Service logs for the 500 and an approved sandbox collection contract.

### SA-53 — Payment transaction details

- **Status:** PASS
- **Expected:** Existing sandbox transaction details load without initiating a payment.
- **Actual:** An existing DEMO_CARD payment and its transaction details loaded successfully. Transaction history contained an AUTHORIZE/PENDING entry. No real or new payment was initiated.
- **Reproduction / route:** Use the existing order-specific payment/detail and transaction endpoints from the payment detail view. This was read-only.
- **Relevant code / API:** Payment detail and transaction handlers in `payment-service/.../PaymentController.java`; payment detail UI in `src/pages/AdminWorkspace/AdminWorkspace.jsx`.
- **Root cause:** No transaction-detail defect reproduced for the existing DEMO_CARD record.
- **Evidence:** Existing payment detail and transaction GET requests returned HTTP 200. Payment processing capability remained disabled.
- **Recommended fix / regression test:** No fix indicated for this detail path. Retain a read-only test asserting transaction details for a seeded sandbox payment while asserting that the test does not call payment initiation.
- **Missing prerequisite:** None for the existing record; broader payment collection remains unavailable under SA-52.

### SA-54 — Customers collection

- **Status:** FAIL
- **Expected:** Super Admin can retrieve customer records with usable filters and pagination.
- **Actual:** The Customers page showed no matching records; tested customer collection requests returned HTTP 403. The 59-order response referenced 9 distinct customer IDs, so an empty local UI collection is not evidence that there are no customer-linked orders.
- **Reproduction / route:** Open the Super Admin Customers page; request the customer collection endpoints; the UI has no matching customer rows and the tested collection API is forbidden.
- **Relevant code / API:** Customers view in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; `customer-profile-service/.../CustomerProfileController.java`.
- **Root cause:** Confirmed access/feature gap: the inspected customer-profile controller exposes profile routes, not an administrative customer collection route. The exact authorization source of the 403 is not confirmed.
- **Evidence:** Customer collection requests returned HTTP 403; orders API returned 59 records and 9 distinct customer IDs; no admin collection endpoint was found in the inspected controller.
- **Recommended fix / regression test:** Add a role-guarded, paginated admin customer collection endpoint and bind the Customers page to it. Test non-empty/empty results, filters, pagination, and non-admin denial.
- **Missing prerequisite:** None to confirm the UI/API gap; a customer-admin endpoint and policy are prerequisites for a complete retest.

### SA-65 — Reports export

- **Status:** FAIL
- **Expected:** JSON export contains the complete report dataset selected by the filters and the browser downloads the file.
- **Actual:** The Reports UI showed 23 orders, while the read-only backend orders API returned 59. The report receives `orders` sourced from `orderStore.list()` rather than the backend-loaded order collection, so its displayed/exported order set omits backend orders. Clicking Export JSON showed a “Download started” toast, but browser automation did not capture a download event or file; the actual file therefore remains unverified.
- **Reproduction / route:** Open `/admin/reports`; compare the displayed order count with `GET /order-api/api/v1/orders`; click Export JSON. The UI showed 23 versus 59 from the API, and no download event was observed by automation.
- **Relevant code / API:** Reports route/component in `src/pages/AdminWorkspace/AdminWorkspace.jsx` and `src/pages/AdminWorkspace/AdminReports.jsx`; JSON builder/downloader in `src/pages/AdminWorkspace/adminReportData.js`; `GET /order-api/api/v1/orders`.
- **Root cause:** Confirmed incomplete data source: `AdminWorkspace.jsx` derives report `orders` from `orderStore.list()` outside the Orders view, rather than the backend order response. Download-file delivery is **not confirmed**; the automation environment emitted no download event, which does not establish whether a normal browser saved a file.
- **Evidence:** Live report count 23; live read-only order API count 59; source binding uses local `orderStore.list()`; export helper tests passed 5/5 and verify payload construction/download initiation, not a real browser file.
- **Recommended fix / regression test:** Load backend orders for Reports and use that complete collection for the report filters/export. Add a test where backend orders are absent from local storage and assert report counts and exported JSON include them; separately verify an actual downloaded file in browser automation.
- **Missing prerequisite:** A browser automation context that exposes downloaded files is needed to verify the physical download artifact.

### SA-71 — Admin Name field

- **Status:** FAIL
- **Expected:** The Admin Name field is populated from the Super Admin profile and can be saved persistently.
- **Actual:** `GET /org-access/api/users/me` returned `name: null` for the Super Admin; frontend binding falls back to an empty string, so the Admin Name field is blank. The profile was not saved.
- **Reproduction / route:** Open the Super Admin profile/settings view and inspect Admin Name; read the current-user profile response. Do not submit profile changes.
- **Relevant code / API:** Profile view/binding in `src/pages/AdminWorkspace/AdminWorkspace.jsx`; `GET /org-access/api/users/me`; `Ecom-Org-access/.../StaffProfileController.java`.
- **Root cause:** Confirmed data/binding outcome: profile API returns a null name and UI renders an empty value. The inspected backend profile update is restricted to delivery partners, so a Super Admin name write path is not established.
- **Evidence:** Current-user API response contained `name: null`; source binding uses `user?.name || ''`; no write was attempted.
- **Recommended fix / regression test:** Provide a Super Admin profile name field/API update path, then test GET → update → fresh GET persistence and ensure other roles retain their existing profile behavior.
- **Missing prerequisite:** None to confirm the blank field; a permitted Super Admin profile update endpoint is needed to verify persistence.

## Automated checks

| Check | Result | Evidence |
|---|---|---|
| Frontend focused tests | PASS | `node --test src/services/inventoryApi.test.js src/pages/AdminWorkspace/adminReportData.test.js`: 10/10 passed. |
| Inventory integration tests | PASS | `InventoryApiIntegrationTest`: 5/5 passed, including lifecycle, validation, authorization, and persistent stock-movement behavior in isolated tests. |
| Order/global assignment tests | PASS | `OrderServiceTest` and `GlobalStoreAssignmentTest`: 15/15 passed. These are not live workflow persistence evidence. |
| Staff controller tests | PASS | `UserControllerTest`: 14/14 passed; mocked/controller-level evidence only. |
| Focused ESLint | PASS | Focused frontend lint completed successfully. |
| Frontend production build | PASS | Build completed successfully; emitted non-fatal Vite dynamic-import/chunk-size warnings. |
| Live browser export download | BLOCKED | “Download started” toast appeared, but no download event/file was captured by browser automation. |

## Prioritized confirmed defects

1. **SA-50 — Global assignment options return HTTP 500.** The assignment UI cannot show eligible stores. The failure point is confirmed; the underlying backend exception still needs logs.
2. **SA-65 — Reports omit backend orders.** Report count was 23 against 59 orders from the read-only backend API; the local-only report data binding is confirmed.
3. **SA-54 — Super Admin customer collection unavailable.** UI is empty and tested collection requests are HTTP 403; no admin collection route was found in the inspected controller.
4. **SA-71 — Admin Name blank.** Profile API returns null and UI binds an empty string; Super Admin profile persistence is not implemented/verified.
5. **SA-34 — Product-store controls absent.** Existing mapping data is present, but the Super Admin product form has no mapping controls.
6. **SA-36 — Campaign targeting controls absent.** Campaign/banner form does not expose store/location targeting.
7. **SA-51 — Global parcel editing absent.** Assignment/approval flow has no parcel editing surface.
8. **SA-52 — Payments collection unavailable.** Processing capability is disabled and the collection request returns HTTP 500; exact server cause is unconfirmed.

## Safety and scope notes

- No live inventory, order, shipment, staff, customer, payment, or product-store mapping was written or changed.
- No payment initiation was performed.
- No excluded QA issue was tested as part of this report.
- Findings that depend on inaccessible logs, isolated fixtures, or unavailable browser download capture are explicitly labeled as unconfirmed or blocked.
