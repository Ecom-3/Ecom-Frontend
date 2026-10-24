# Super Admin QA Live Retest — Failed and Blocked Cases

**Run date:** 2026-10-23  
**Frontend:** `http://localhost:5173`  
**Scope:** SA-15, SA-38, SA-39, SA-43, SA-44, SA-45, and SA-46, SA-51  
**Method:** Browser-level retest could not start because this Codex session exposes no browser automation tools. No application credentials were supplied, and no isolated disposable records were identified. No UI mutation was attempted.

## Environment checks

- The frontend root returned HTTP 200.
- Read-only requests through the frontend proxy, without credentials, returned HTTP 403 for `GET /org-access/api/users`, and HTTP 401 for `GET /inventory-service/api/v1/inventories`, `GET /order-api/api/v1/orders`, and `GET /fulfillment-service/api/v1/shipments`.
- These unauthenticated responses do not reproduce the reported authenticated staff-update 403 or establish any authorization defect.
- Local listeners were present on frontend port 5173, gateway port 8082, order service port 3311, inventory service port 8095, and database port 3310. Listener presence does not establish a working authenticated browser flow or a disposable database.
- The configured Playwright MCP server is enabled in Codex configuration, but its browser tools are not available in this session. No browser page, DevTools Network panel, or console was observed.

## Results

| Case ID | Use case | Initial result | Retest result | Evidence | Root cause or blocker | Recommended next action |
|---|---|---|---|---|---|---|
| SA-15 | Edit staff details and assignments | BLOCKED; prior authenticated update was reported as HTTP 403, but the live denial was not corroborated in the prior report. | **BLOCKED** | No authenticated browser request or staff update was made. Unauthenticated `GET /org-access/api/users` returned 403 through the frontend proxy. Earlier isolated controller tests passed, but do not verify live persistence. | Browser tools and an authorized test account with a disposable Global Admin or Location Admin record are unavailable. The unauthenticated GET is not evidence about the authenticated PUT authorization decision. | Expose Playwright tools to the Codex session; provide an authorized test login and disposable staff fixture in an isolated database; then capture sanitized PUT response and fresh read. |
| SA-38 | Create and edit inventory records | Earlier isolated H2 API lifecycle passed; browser save was not performed. | **BLOCKED** | No inventory UI was opened and no write was sent. Unauthenticated inventory GET returned 401. | Requires an authenticated test session plus disposable product/store and inventory data with a cleanup or isolated database. | Prepare isolated product/store/inventory fixtures and repeat through the UI; verify create, update, and fresh read. |
| SA-39 | Adjust inventory quantities | Earlier isolated API operations passed; live/browser quantity adjustment was not performed. | **BLOCKED** | No stock adjustment was submitted. Unauthenticated inventory GET returned 401. | No disposable inventory record is available; changing a shared quantity would be unsafe. | Use a test-owned inventory fixture in an isolated database; verify adjustment, movement history, invalid input, and refreshed quantity. |
| SA-43 | Confirm order | Prior isolated confirmation coverage was for a Store Manager; Super Admin browser flow remained unverified. | **BLOCKED** | No order was confirmed. Unauthenticated Orders GET returned 401. | Requires an authorized Super Admin test session and an eligible test-owned order in an isolated environment. | Seed an isolated order fixture and verify UI transition plus fresh read under the intended role. |
| SA-44 | Progress order processing and packing | BLOCKED in prior report. | **BLOCKED** | No transition was submitted. Unauthenticated Orders GET returned 401. | No test-owned confirmed order or fulfillment fixture is available; existing orders were not changed. | Prepare an isolated order/fulfillment fixture and verify each supported transition and read-back. |
| SA-45 | Mark fulfillment ready to ship | BLOCKED in prior report. | **BLOCKED** | No fulfillment transition was submitted. Unauthenticated Orders GET returned 401. | Requires an isolated eligible packed fulfillment/order with shipping prerequisites satisfied. | Use a disposable fixture and verify READY_TO_SHIP after a fresh read; do not create a real shipment. |
| SA-46 | Progress shipment and order statuses | BLOCKED in prior report. | **BLOCKED** | No shipment or order status was changed. Unauthenticated shipment GET returned 401. | Requires an isolated test-owned shipment and authorized role; live notification/dispatch effects must be disabled or isolated. | Verify valid and invalid transitions, tracking history, and fresh reads using isolated fixtures with external effects disabled. |
| SA-51 | Manage global approval and parcel information | Previously reported as not implemented based on source inspection; no live write was tested. | **BLOCKED** | No browser workflow was opened. Order GET without credentials returned 401. Earlier source review found no independent parcel editor/API; that was not independently retested in a browser during this run. | Browser tools, authenticated session, and a test-owned global order are unavailable. Existing analysis also indicates a product/workflow contract gap for separate approval and parcel editing. | First define the approval and parcel data/API contract; then provide a test-owned global order and repeat a browser test. |

## Summary

- **PASS:** 0
- **FAIL:** 0
- **BLOCKED:** 8
- **NOT TESTED:** 0

No case is marked PASS or FAIL because no authenticated browser workflow was observed in this run. The HTTP 401/403 responses above came from intentionally unauthenticated diagnostic GET requests and are not treated as workflow failures.

## Unresolved defects and next retests

1. **SA-15:** Reproduce the authenticated update request with an authorized disposable staff fixture before attributing the reported 403 to frontend or backend authorization.
2. **SA-51:** Define whether approval is independent of assignment and specify parcel fields/persistence. Existing source inspection indicates those capabilities are absent, but this run did not retest them in a browser.
3. **SA-38/SA-39 and SA-43–SA-46:** Browser persistence and role-specific behavior remain unverified; isolated API evidence is not a substitute for the requested UI retest.

## Missing prerequisites

- Playwright browser tools exposed in the active Codex session. The global MCP entry is enabled, but no browser tools were loaded here.
- Authorized test credentials that are not shared administrator accounts.
- Isolated disposable staff, product, store, inventory, order, fulfillment, and shipment fixtures, with cleanup and external notification/shipping effects controlled.
- A defined SA-51 approval and parcel contract.

## Change and safety record

- No frontend or backend source code was changed.
- No database records were created, edited, deleted, or transitioned.
- Only this QA retest report was added.
- Previously existing worktree changes were preserved.
