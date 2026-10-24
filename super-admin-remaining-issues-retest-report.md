# Super Admin QA — Remaining Issues Retest

**Run date:** 2026-10-23  
**Frontend:** `http://localhost:5173`  
**Scope:** SA-12, SA-15, SA-38, SA-39, SA-43, SA-44, SA-45, SA-46, SA-51 only.  
**Exclusions respected:** SA-23, SA-34, SA-36, SA-49, SA-50, SA-54, SA-65, SA-71, and all payment cases were not tested.

## Baseline and live environment

- The Vite frontend was running on port 5173. [vite.config.js](./vite.config.js) proxies service prefixes to `http://localhost:8082`.
- No listener was present on the configured gateway port 8082, or order-service 3311 and inventory-service 8095. Config Server (8888) and MySQL (3306) were listening; they were not used for QA writes.
- Read-only browser requests through the Vite proxy returned **HTTP 502 Bad Gateway** for Org Access (`/org-access/api/auth/validate`, `/api/users/me`, `/api/users`), Orders (`/order-api/api/v1/orders`), and Inventory (`/inventory-service/api/v1/inventories`). The Orders page showed `Request failed (502)` and no orders. Browser console entries for these requests were 502 errors.
- The already-open browser session token contained the `ROLE_SUPER_ADMIN` role claim, but current authentication could not be revalidated because the API gateway was unavailable. No password or token was printed or copied into the report. A new login was not attempted.
- Backend source cannot be compared to a running backend version: no gateway or relevant service process was listening. The checked-out source contains pre-existing local changes, so the tested source tree is not necessarily the revision used by any earlier run.
- The Users and Inventory create dialogs opened in the browser. No save action was submitted. The Orders page rendered its API error and empty-state message; this is not evidence that there are no backend orders.

## Required results table

| Case | Previous status | Current result | Evidence | Root cause | Files changed | Next action |
|---|---|---|---|---|---|---|
| SA-12 — Global Admin creation | Conflicting results reported; saved reports do not contain a corroborated live create/read-back | **BLOCKED** | Browser session role claim was `ROLE_SUPER_ADMIN`; Org Access reads returned 502. `UserControllerTest` includes mocked Super Admin create response 201 and denial cases. No live POST was attempted; no persisted user was verified. | Inconclusive. The runtime authorization decision and discrepancy between earlier runs cannot be identified while Org Access/gateway is unavailable. Stale service code is a possibility, not a confirmed cause. | None in this run. `UserController.java` and `IdentityService.java` already had worktree modifications. | Start the gateway and Org Access from the intended revision; use an isolated disposable database and a uniquely identified Global Admin fixture; verify POST, list/detail persistence, and cleanup. |
| SA-15 — Staff details and assignment updates | HTTP 403 reported by user; not corroborated in a saved live request | **BLOCKED** | Browser staff collection returned 502, so no editable test row or request payload was available. `UserControllerTest` passed mocked Super Admin update and unauthorized-role cases. Two focused `IdentityServiceTest` create/update tests passed. | Not established for live 403s. Current source allows Super Admin through the controller but intentionally restricts targets to organization-owned Global Admin/Location Admin memberships. The failed full service test was due to a malformed test fixture, detailed below. | None in this run. Relevant controller/service/test files already had worktree modifications. | Repeat with a disposable Global Admin or Location Admin membership in an isolated Org Access database; capture sanitized PUT status and fresh list read. Include unauthorized role denial. |
| SA-38 — Inventory create/edit workflow | PASS for the earlier pagination retest; the older report recorded a create/list visibility defect | **PASS** — isolated API lifecycle only | In H2, `InventoryApiIntegrationTest` created inventory (**201**), looked it up, updated it (**200**) and verified values through subsequent operations. Invalid/duplicate requests were rejected. Browser create form opened, but no live save was made. | Create and edit are implemented in the isolated API. Product/store IDs are scalar identifiers; the service does not look up external Catalog product/store existence. The UI obtains product/store choices from Catalog, but external referential validation is not proven. No inventory DELETE endpoint is exposed; UI removal explicitly refuses deletion. | None in this run. `InventoryService.java` and the frontend inventory files were already modified in the worktree. | Keep writes in the H2 test DB. Confirm the contract for external product/store existence before adding server-side Catalog validation. Do not create shared inventory without an approved cleanup or isolated tenant. |
| SA-39 — Inventory quantity adjustment | PASS in previous isolated API testing | **PASS** — isolated API operations only | H2 integration test exercised increase, decrease, reserve, release, manual edit, invalid quantity and insufficient-stock behavior; movement history returned four entries with the expected latest DECREASE. Concurrent increments yielded matching persisted quantity and 12 distinct movement entries. No live inventory was adjusted. | No stock arithmetic or movement-history defect reproduced in the isolated suite. No API idempotency key/deduplication behavior was found; duplicate client retries were not specifically tested. Browser refresh and live record rollback were not tested. | None in this run. | If duplicate retries must be safe, define an idempotency contract and add a focused retry test. Re-run UI-to-API and browser reload against an isolated inventory fixture. |
| SA-43 — Confirm order | PASS for prior order inspection; confirmation was not previously verified | **BLOCKED** — Super Admin workflow not verified | One isolated H2 HTTP integration test created a test order, confirmed it as a Store Manager, verified the database status was `CONFIRMED`, and read that status back as the owner. It does not exercise a Super Admin token. Live Orders page/API returned 502. | No defect reproduced in the Store Manager test. Super Admin confirmation and current UI/API behavior remain unverified due unavailable services and lack of a Super Admin test-owned order. | None in this run. | Use an isolated order fixture and a test Super Admin role; confirm through the supported UI/API, then fresh-GET and reload. |
| SA-44 — Processing and packing | BLOCKED in prior report | **BLOCKED** | Static inspection found Order states `CREATED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`; workflow code maps PACKING to order `PROCESSING` and fulfillment `PACKING`. The selected order tests covered invalid transitions, not a complete processing/packing sequence. Live Orders/fulfillment services were unavailable. | Not established. The order model has no distinct PACKED state; packing is represented on the Fulfillment state. Whether that satisfies the QA workflow contract needs end-to-end verification. | None in this run. | Run a seeded H2/browser workflow with a shipping-address fixture; verify order and fulfillment states independently after each action. |
| SA-45 — Ready to ship | BLOCKED in prior report | **BLOCKED** | Frontend workflow progresses fulfillment through `PENDING → ALLOCATED → PACKING → READY_TO_SHIP`; shipment creation requires fulfillment `READY_TO_SHIP`. No live or existing end-to-end test was run for the complete sequence. | Not established. The intended state is present in Fulfillment, not in the Order status enum. There was no eligible test-owned order/fulfillment available in the live environment. | None in this run. | Use an isolated packed order with shipping address, advance to `READY_TO_SHIP`, create shipment only in that fixture, and verify fresh reads. |
| SA-46 — Shipment status transitions | BLOCKED in prior report | **BLOCKED** | Source exposes shipment status API and transition rules (`CREATED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RETURNED`, `CANCELLED`). Isolated Fulfillment authorization tests passed for read restrictions and customer-denied status writes; they did not verify a successful shipment transition and persisted tracking history. No live shipment was changed. | Not established. Live workflow and tracking persistence were not exercised. Shipment status updates are authorized for store managers managing the shipment or the assigned delivery partner; customer writes are denied in tests. | None in this run. | Add/execute a test-owned shipment lifecycle test covering valid/invalid transitions, tracking events, fresh reads, and role denial; then repeat via browser in isolated QA. |
| SA-51 — Global approval and parcel workflow | NOT IMPLEMENTED in the prior report | **NOT IMPLEMENTED** | Read-only source inspection: the global assignment component displays the approval field and exposes store assignment, but has no independent approval control or parcel fields/editor. Order entity/response has approval and assignment data but no parcel-edit API/model. No assignment-options request or assignment write was made. | Confirmed capability gap for independent approval/parcel editing. The screen’s approval is coupled to the stocked-store assignment behavior; the live route/order lookup was not retested because it would invoke the excluded SA-50 options workflow. | None in this run. | Define a separate global approval/parcel contract and workflow, distinct from SA-50 stocked-store selection. Test it using a global order fixture without changing the assignment-options workflow. |

## Detailed notes and evidence

### SA-12 and SA-15 — Staff administration

- Frontend routes: `/admin/users`; create form supports Global Admin and Location Admin. Existing list-to-edit UI needs the backend staff collection, which returned 502 in this run.
- Create endpoint: `POST /org-access/api/users`. Update endpoint: `PUT /org-access/api/users/{id}`.
- Current source uses `@PreAuthorize("hasRole('SUPER_ADMIN')")` for create, list, and update in [UserController.java](../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/UserController.java).
- `IdentityService.updateStaff` only edits targets with a single Global Admin or Location Admin membership in `metaarch-commerce`; it rejects unsupported roles and outside/inconsistent memberships. `listStaff` filters to those same admin roles in [IdentityService.java](../ecom-backend/Ecom-Org-access/src/main/java/com/metaarch/orgaccess/identity/IdentityService.java).
- `UserControllerTest` passed **16/16**. These are `@WebMvcTest` tests with a mocked `IdentityService`, not live persistence tests. A separate in-memory profile persistence test passed **1/1**, but it concerns the Super Admin's own display name and does not prove staff provisioning persistence.
- Full `IdentityServiceTest` ran **13 tests: 12 passed, 1 failed**. The failure `rejectsOrganizationChangeAndPrivilegeEscalationDuringStaffUpdate` constructed a `Membership` without its required role, causing a `NullPointerException` at the service filter instead of the expected `AccessDeniedException`. The membership entity marks role non-optional, and the migration declares `role_id NOT NULL`; this is a test-fixture defect in a pre-existing modified test file, not evidence that live valid memberships are broken. The two targeted valid create/update tests subsequently passed **2/2**.
- No staff POST or PUT was attempted. Existing role claims and MockMvc behavior do not establish the running service's actual authorization decision.

### SA-38 and SA-39 — Inventory

- Frontend route: `/admin/inventory`. The create dialog was opened without submitting. UI supports POST creation and PUT editing; deletion is explicitly unsupported.
- API: `POST /inventory-service/api/v1/inventories`, `PUT /inventory-service/api/v1/inventories/{id}`, `GET /inventory-service/api/v1/inventories/{id}`, and stock operations under `/inventory-service/api/v1/inventories/{id}/stock/{increase|decrease|reserve|release}`. Movement history is `GET .../{id}/movements`.
- `InventoryApiIntegrationTest` ran against test configuration `jdbc:h2:mem:inventory` with Hibernate `create-drop`; its random test data was isolated and disappeared with the test process. It passed **5/5**.
- Request validation requires a product UUID, nonblank store ID, nonnegative quantities/reorder level; stock adjustments require quantity ≥1 and a nonblank reason. Duplicate product/variant/store combinations return conflict; insufficient stock returns conflict. The service does not validate that product and store identifiers resolve in the separate Catalog service.
- No live inventory was created, edited, or adjusted because the live service gateway returned 502 and the app has no safe deletion route.

### SA-43 to SA-46 — Order and fulfillment

- Order API: `GET /order-api/api/v1/orders`, `GET /order-api/api/v1/orders/{id}`, and `PATCH /order-api/api/v1/orders/{id}/status`.
- Fulfillment API: `GET/POST /fulfillment/api/v1/fulfillments`, `PATCH /fulfillment/api/v1/fulfillments/{id}/status`; shipment API: `GET /fulfillment/api/v1/shipments/order/{orderId}`, `POST /fulfillment/api/v1/shipments`, and `PATCH /fulfillment/api/v1/shipments/{shipmentId}/status`; tracking history is under `/tracking-events`.
- `OrderStatus` has no separate PACKING or READY_TO_SHIP value. Those are represented by the Fulfillment status enum and workflow. Shipment transitions are separately validated by `ShipmentService`.
- The one order HTTP integration test used `jdbc:h2:mem:order_sync_test`, `create-drop`, and disabled external event dispatch. It passed **1/1** for a Store Manager confirmation and database/fresh-read persistence. It does not prove Super Admin authorization, packing, ready-to-ship, or shipment/tracking persistence.
- Selected `OrderServiceTest` invalid-transition checks passed **2/2**. `FulfillmentAuthorizationTest` and `FulfillmentServiceTest` passed **10/10**; these include isolated authorization and fulfillment-state checks, not a complete shipment lifecycle.
- Live Orders UI showed an empty state with `Request failed (502)`; this is an environment failure, not a verified empty order collection.

### SA-51 — Global approval and parcel

- Source route is `/admin/orders/assign/{orderId}` and passes the route ID to `getOrder(orderId)`. The component then also requests assignment options; that adjacent request belongs to excluded SA-50 and was not exercised in this retest.
- The route’s visible workflow is “Assign stocked store” and a “Confirm store assignment” action. It renders `globalApproval` as a read-only chip. No parcel fields, parcel edit endpoint, or separate approval action were found in the inspected UI/backend model.
- No live order ID was read in this run because the order service was unavailable. The earlier “Order not found” report is not reproduced or attributed here; the route/API lookup portion remains blocked and must not be conflated with excluded SA-49.

## Automated checks executed

| Command | Result | Isolation / notes |
|---|---|---|
| `mvn -Dtest=InventoryApiIntegrationTest test` (inventory-service) | **5 passed, 0 failed** | H2 in-memory, `create-drop`; inventory lifecycle/stock API tests. |
| `mvn -Dtest=UserControllerTest,StaffProfilePersistenceTest test` (Ecom-Org-access) | **17 passed, 0 failed** | Controller authorization is mocked; profile persistence uses its own in-memory H2 DB. |
| `mvn -Dtest=IdentityServiceTest` (Ecom-Org-access) | **12 passed, 1 failed** | One malformed `Membership` fixture lacked a required `Role`, causing NPE instead of expected denial. |
| `mvn -Dtest=IdentityServiceTest#persistsLocationAdminAndUsesAuthenticatedActorForMembershipAttribution+updatesLocationAdminWithinOrganizationAndPreservesCredentials test` | **2 passed, 0 failed** | Mocked service-level create/update behavior. |
| `mvn -Dtest=OrderServiceTest#cancelRejectsShippedOrder+updateStatusRejectsDirectDelivery test` | **2 passed, 0 failed** | Unit/mock invalid-transition checks. |
| `mvn -Dtest=PaymentHttpIntegrationTest#managerStatusPersistsAndCustomerReadsItWhileOtherStoreIsDenied test` | **1 passed, 0 failed** | Only the order-status integration method was selected; H2 in-memory. No payment case was tested. |
| `mvn -Dtest=FulfillmentAuthorizationTest,FulfillmentServiceTest test` | **10 passed, 0 failed** | Fulfillment test fixture uses H2; authorization and fulfillment status behavior. |

No frontend end-to-end test framework is configured in [package.json](./package.json). No frontend test, lint, or build command was run for this diagnostic.

## Confirmed defects and gaps

1. **SA-51 feature gap:** No independent global approval action or parcel editing model/API/UI exists in the inspected source. This is confirmed by source inspection; live persistence was not testable.
2. **Staff test-fixture defect:** One pre-existing modified `IdentityServiceTest` fixture omits the required membership role and fails with NPE. This is not a confirmed live staff update defect; recommended smallest correction is to give the fixture its expected `GLOBAL_ADMIN` role.
3. **No confirmed live authorization or order workflow defect:** Relevant live services were unavailable, so earlier 403 reports and current end-to-end behavior remain unresolved.

## Environment and fixture blockers

- Gateway target `localhost:8082` and relevant live service ports were not listening; Vite requests returned 502.
- No disposable Org Access/MySQL database or authorized disposable staff fixture was established. The running MySQL listener was treated as shared/unknown and not written to.
- No live order/fulfillment fixture was available, and shared orders were not changed.
- Inventory API has no delete endpoint. Only the isolated H2 `create-drop` fixture was safe for create/edit/stock testing.
- No live backend binary was available for comparison with the locally modified source.

## Files changed and cleanup

- **Application source changed by this retest:** None.
- **New file created:** This report only.
- Existing worktree modifications were preserved, including pre-existing changes to `UserController.java`, `IdentityService.java`, `IdentityServiceTest.java`, `InventoryService.java`, order-service files, and frontend Admin Workspace/inventory files.
- No live records were created, updated, deleted, or adjusted. Automated inventory/order/fulfillment data lived only in isolated H2 test databases configured with `create-drop`; test JVMs exited. No cleanup against MySQL or shared services was performed.
