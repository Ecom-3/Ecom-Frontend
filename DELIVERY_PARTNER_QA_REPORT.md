# Delivery Partner Portal QA Report

Date: 2026-10-26  
Scope: DP-01 through DP-40 only. No broader portal suite was started.

The initial environment notes below describe the first DP QA attempt. See the latest three-portal run at the end of this report for current service state and additional read-only inspection.

## Environment inspection and safety blocker (initial DP attempt)

- The Playwright browser connector is available, but its only tab is about:blank. The frontend package has no Playwright/Cypress project or test script; browser control would use the existing connector once a safe local stack exists.
- Docker CLI is installed, but docker info reports that the Docker daemon is unavailable. Local mysqld processes are present, the MySQL client was not on PATH during the initial attempt; its standard install was found later.
- Runtime Org Access configuration defaults to the local MySQL users_roles schema; Fulfillment defaults to local MySQL fulfillment-service. Runtime profiles validate existing tables, disable Flyway, and disable SQL initialization. The repository IsolatedTest runner only binds services to loopback and does not isolate these databases.
- Existing migration seeds include development partner accounts with a common password. They cannot be treated as disposable because the target database is not known to be isolated.
- The notification service has no QA-only local OTP sink selected by default; invoking OTP against the configured runtime could deliver a real message. No OTP or notification request was made.
- During the initial DP attempt no application services were started and no DP account/order writes were made. The runtime configuration and running MySQL processes prevent a safe account-provisioning route in this environment.
- Safe continuation prerequisites: start Docker Desktop (or provide another dedicated disposable database runtime), create fresh QA-only schemas for Org Access and required downstream services, apply only reviewed schema migrations/fixtures to those schemas, configure the services with explicit QA-only datasource URLs and a local notification sink, then start the frontend and services on isolated ports. Do not use the default runtime schemas or legacy seeded accounts.
- No existing command currently performs this isolated provisioning end to end. run-all-services.ps1 -IsolatedTest is insufficient for database isolation. No setup command was run because Docker daemon availability and safe database isolation are prerequisites.

## Results

| ID | User Role | Use Case | Status | Issues | Evidence |
|---|---|---|---|---|---|
| DP-01 | Delivery Partner | Login, invalid credentials, role guard, session redirects | BLOCKED | No disposable Delivery Partner credentials or isolated browser stack were available. | No credentials were submitted. The later three-portal attempt loaded the Team Portal login page only; see run evidence below. |
| DP-02 | Delivery Partner | Dashboard load, loading/empty/error behavior | BLOCKED | Requires authenticated portal and service stack. | No browser/API session; frontend `node --test` does not exercise rendered workflows. |
| DP-03 | Delivery Partner | Assigned, active, completed summary | BLOCKED | No authorized fixture data to reconcile counts. | Dashboard derives counts from `getMyDeliveries`; values not compared against backend records. |
| DP-04 | Delivery Partner | Own profile visibility | BLOCKED | Real authenticated profile ownership flow not exercised. | Org Access controller tests ran, but no claim is made that they cover this portal workflow. |
| DP-05 | Delivery Partner | Contact profile edits and persistence | BLOCKED | No disposable partner record for save/reload or cross-partner mutation checks. | Profile payload is now explicitly allowlisted; browser/API persistence verification not run. |
| DP-06 | Delivery Partner | Vehicle info validation and persistence | BLOCKED | No disposable partner profile to update and reload. | UI payload whitelists vehicle fields; persistence was not verified in this QA run. |
| DP-07 | Delivery Partner | Licence, address, emergency contact | BLOCKED | No isolated partner fixture; policy validation requirements need backend fixture verification. | No browser/API mutation run. |
| DP-08 | Delivery Partner | Authenticated password change | BLOCKED | Would mutate a real account without a disposable account. | Frontend policy tests verify current/new/confirmation length rules; account password change and old/new login were not run. |
| DP-09 | Delivery Partner | Availability persistence and active-delivery constraints | BLOCKED | Business rule for availability during active delivery is not confirmed; no fixture. | No availability API mutation run. |
| DP-10 | Delivery Partner | GPS update and ownership | BLOCKED | Location persistence and cross-partner authorization were not exercised against an isolated backend. | `deliveryNavigation.test.js` covers coordinate validation and rejects unsupported, denied, and invalid GPS results; it does not verify persistence. |
| DP-11 | Delivery Partner | Assigned order list scope and empty/multiple cases | BLOCKED | Needs authenticated partner plus isolated assignment fixtures. | No delivery API request made. |
| DP-12 | Delivery Partner | Order/shipment/assignment detail consistency | BLOCKED | No isolated assigned order fixture. | No API or persistence reconciliation run. |
| DP-13 | Delivery Partner | Assigned customer shipping address | BLOCKED | Cross-order address privacy not exercised. | Navigation helper only selects a shipping address in unit tests; API authorization not exercised. |
| DP-14 | Delivery Partner | Customer contact privacy | BLOCKED | No authorized order fixture to test contact access boundaries. | UI no longer renders customer email; name/phone access remains unverified end to end. |
| DP-15 | Delivery Partner | Items, totals, variant, COD amount | BLOCKED | No backend order fixture to reconcile. | COD display is conditional on payment mode in UI; amount/data accuracy not verified. |
| DP-16 | Delivery Partner | Accept assigned delivery | BLOCKED | Acceptance persistence and assignment conflict behavior not tested through Org Access. | No authenticated Delivery Operations API workflow executed. |
| DP-17 | Delivery Partner | Pickup transition and tracking | BLOCKED | Acceptance-to-pickup lifecycle not exercised end to end. | Backend now requires acceptance after current assignment and CREATED state; no controller integration test verified this path. |
| DP-18 | Delivery Partner | Start delivery transition | BLOCKED | Needs accepted and picked-up isolated shipment and verified persistence. | No Delivery Operations lifecycle test was executed. |
| DP-19 | Delivery Partner | Current status refresh | BLOCKED | Requires a running portal and authorized assignment. | No browser refresh/navigation workflow run. |
| DP-20 | Delivery Partner | Cancel/fail with reason | BLOCKED | Cancellation policy and reason persistence were not tested using an isolated order. | No API mutation run. |
| DP-21 | Delivery Partner | Open navigation for eligible assignment | BLOCKED | No authenticated assignment/browser session. | Navigation page now requires route state with an order id and shipping address; browser behavior not exercised. |
| DP-22 | Delivery Partner | Browser GPS permission, denied/unavailable/timeout | BLOCKED | Actual browser geolocation permission flow not run. | Unit helper covers unsupported, denied, and invalid coordinates; timeout/unavailable browser behavior not verified. |
| DP-23 | Delivery Partner | Map destination and missing/invalid coordinates | BLOCKED | No browser map session or real geocoding call run. | Unit tests cover shipping-address selection; destination geocoding/map rendering was not exercised. |
| DP-24 | Delivery Partner | External directions destination and encoding | BLOCKED | External directions link was not opened. | Unit test verifies URL generation and encoding only. |
| DP-25 | Delivery Partner | Request customer OTP through local notification stub | BLOCKED | No local notification stub or isolated partner/order was established. | No OTP request or external notification was triggered. |
| DP-26 | Delivery Partner | Six-digit OTP input | PASS | Browser rendering/keyboard interaction not covered. | `node --test src/pages/DeliveryWorkspace/deliveryWorkspacePolicy.test.js`: normalization keeps digits only and caps input at six; UI also uses numeric keyboard, one-time-code autocomplete, and Enter handling. |
| DP-27 | Delivery Partner | Correct and incorrect OTP verification | BLOCKED | No legitimate OTP fixture/notification stub; successful verification not tested. | No OTP was generated, read, or submitted. |
| DP-28 | Delivery Partner | Server resend cooldown | BLOCKED | Requires isolated DB and notification stub. | Backend contract has 60-second server cooldown; not exercised. |
| DP-29 | Delivery Partner | Invalid, expired, reused OTP and attempt limit | BLOCKED | Requires isolated OTP rows and controlled clock/notification stub. | Existing backend checks are present; no OTP lifecycle regression was run. |
| DP-30 | Delivery Partner | Complete after OTP, reject bypass | BLOCKED | Direct bypass rejection is covered, but valid OTP completion through Delivery Operations is not. | `FulfillmentAuthorizationTest.assignedPartnerCannotForgeStatusOrTrackingAndOrderBoundProxyCanForwardValidatedActions`: direct partner status/tracking writes are forbidden; order-bound proxy may advance valid shipment states. No Org Access OTP completion test. |
| DP-31 | Delivery Partner | Completion visible in portal/customer tracking | BLOCKED | Requires successful OTP and order/tracking integration fixture. | No delivery completion was performed. |
| DP-32 | Delivery Partner | History ownership, pagination, sorting | BLOCKED | Existing history feed/pagination behavior not queried. | No authorized delivery history API session. |
| DP-33 | Delivery Partner | Search/filter/date/pagination | BLOCKED | No history fixture to check filters and scope. | No browser or API history filter run. |
| DP-34 | Delivery Partner | Completed deliveries and totals | BLOCKED | No completed fixture to reconcile. | No history query or analytics comparison. |
| DP-35 | Delivery Partner | Failed deliveries and reasons | BLOCKED | No failed fixture or reason visibility check. | No browser/API history verification. |
| DP-36 | Delivery Partner | Cancelled deliveries | BLOCKED | No cancelled fixture to compare against failed status. | No browser/API history verification. |
| DP-37 | Delivery Partner | Returned shipment support | BLOCKED | Return behavior/policy was not independently established. | No return workflow or UI record was exercised; no behavior was invented. |
| DP-38 | Delivery Partner | Performance charts and date filters | BLOCKED | No isolated backend history data to reconcile chart totals. | UI derives chart data from delivery feed; no browser/chart fixture verification. |
| DP-39 | Delivery Partner | Historical detail and immutable completed records | BLOCKED | No historical fixture for timeline or mutation checks. | No history API/browser workflow run. |
| DP-40 | Delivery Partner | Logout and protected-route refresh | BLOCKED | Requires authenticated browser session. | Sign-out now navigates to `/team-login`; session clearing/protected refresh/re-login not exercised. |

**Status totals:** PASS 1, FAIL 0, BLOCKED 39, NOT RUN 0 (40 total).

All BLOCKED rows share the environment blocker above; each row also records its case-specific unverified behavior.

## Defects fixed

- Navigation previously substituted hard-coded Hyderabad coordinates when browser GPS or address lookup failed. It now reports the actual failure, validates coordinates, requires an assigned order and shipping address, and enables directions only when both endpoints are real and valid.
- Assigned Delivery Partner credentials could mutate Fulfillment status and tracking directly, bypassing Delivery Operations OTP checks. Direct partner writes are now denied; Delivery Operations forwards validated actions using a short-lived signed credential bound to the assigned partner and order. The token is not returned to the browser.
- Pickup could be repeated or started without accepting the current assignment. It now requires the acceptance event after the current assignment and a CREATED shipment.
- Profile save previously sent password-only fields to the profile API and could change a password before a profile save failed. Profile payloads are allowlisted and profile save occurs before password change, with accurate partial-failure feedback.
- Client profile validation now matches backend password lengths, requires email, and validates phone; OTP input is constrained to digits and six characters; GPS failures are surfaced; unnecessary customer email display was removed.

## Verification and limits

- Frontend unit suite: `node --test` — 250 passed, 0 failed.
- Frontend lint: `npm.cmd run lint` — passed.
- Frontend production build: `npm.cmd run build` — passed. Vite reports the existing large-bundle advisory.
- Org Access targeted Maven tests: `mvn.cmd -q '-Dtest=DeliveryPartnerControllerTest,JwtTokenProviderTest,IdentityServiceTest' test` — rerun this turn: 23 passed, 0 failed (2 + 3 + 18).
- Fulfillment authorization regressions: `mvn.cmd -q '-Dtest=FulfillmentAuthorizationTest,AssignedPartnerAccessTest' test` — rerun this turn: 12 passed, 0 failed (10 + 2). This verifies direct partner status/tracking denial and valid order-bound proxy transitions; it does not verify OTP completion in Org Access.
- Initial browser E2E coverage: 0 of 40. Playwright connector exists, but the only tab is `about:blank`; no frontend/API stack was started because it would reach the unisolated local database defaults. No test account was provisioned. No real OTP/notification, carrier, or payment operation was performed in that initial attempt.
- Test isolation: Fulfillment authorization test uses its configured H2 in-memory database. Frontend tests are local unit tests. No QA-created shared or production data required cleanup.
- Frontend suite rerun this turn: `node --test` — 250 passed, 0 failed. Frontend lint rerun this turn: `npm.cmd run lint` — passed.
- `git diff --check`: passed in both repositories at initial review; rerun after report and final changes below.
- Most end-to-end cases remain blocked/not run. The report does not claim 40/40 completion.

## Three-portal workflow attempt

- **Run ID:** DP-E2E-20261026-01
- **Date:** 2026-10-26
- **Browser:** Existing Playwright browser connector
- **Scope:** Read-only environment and unauthenticated route checks only. No credentials were submitted and no business workflow writes were made.

### Environment evidence

- Frontend http://localhost:5175 is listening. Playwright loaded the Team Portal login page at /team-login and Customer sign-in page at /login.
- Unauthenticated navigation to /store-manager/delivery-partners redirected to /login. Unauthenticated navigation to /delivery/orders also redirected to /login.
- Actuator health returned UP for Gateway (8082), Catalog (8089), Org Access (3310), Customer Profile (8088), Cart (8091), Inventory (8095), Order (3311), Payment (3314), Fulfillment (3315), and Notification (3317).
- Docker daemon remains unavailable. The active local MySQL server is on port 3306. Read-only identity inspection returned local host U-PEN-DRAW; the services are pointed at the normal local schemas, not a disposable QA database.
- Exact read-only counts from the configured local MySQL instance: users_roles.users 105; users_roles.memberships 102; order-service.orders 57; fulfillment-service.shipments 11; catalog_service.banners 3. These existing rows establish that the target schemas are populated business/development data, not empty disposable fixtures.
- Existing dev seed accounts are not disposable accounts. The required isolated test database and QA-only notification sink are unavailable. The configured notification route could cause real notifications.

### Workflow outcome

- No Delivery Partner was created. No customer account or order was created. No existing order was assigned or modified.
- No login was attempted for any seeded account. No password or token was read into the report.
- No OTP was requested or sent. No carrier, payment, email, or SMS operation was triggered.
- No delivery state, tracking event, profile, availability, inventory, or customer record was changed.
- Browser evidence is limited to page rendering and unauthenticated route redirects. It does not verify role authentication, assignment, checkout, OTP, completion, or customer-visible tracking.
- This attempted three-portal E2E run has PASS 0, FAIL 0, BLOCKED 40, NOT RUN 0: safe preparation was blocked before workflow execution. The cumulative DP report remains PASS 1, FAIL 0, BLOCKED 39, NOT RUN 0 because the separate DP-26 input normalization unit test remains passed.
- Playwright snapshots: .playwright-mcp/page-2026-10-26T09-15-53-619Z.yml (Team login), .playwright-mcp/page-2026-10-26T09-17-13-913Z.yml (Customer login), and .playwright-mcp/page-2026-10-26T09-17-24-339Z.yml plus .playwright-mcp/page-2026-10-26T09-17-27-704Z.yml (unauthenticated protected-route redirects). No credentials or customer data were entered.

### Blocker and safe continuation

The running application stack uses populated local databases and the normal service ports. The attachment requires disposable records and says to stop if testing could affect shared records; therefore the partner-creation, checkout, assignment, delivery, OTP, and customer-status workflows were not attempted. A safe rerun requires a dedicated disposable database stack with service-specific datasource configuration and a local notification sink, then the frontend and browser test context must be pointed only at that stack. No supported isolated full-stack provisioning command is currently available in this workspace.

## Code-level continuation — 2026-10-26

- Added the authorized shipment tracking-event history to each Delivery Partner's own assigned-order feed and made expanded history details render events chronologically. The history request uses Fulfillment's existing shipment access check; it does not broaden partner scope.
- Removed customer email from the Delivery Partner feed's customer projection. The UI needs customer name and phone only.
- Updated `docs/functional/operations.md` to match current navigation behavior and document the tracking timeline.
- Added a frontend regression test for chronological tracking-event ordering and non-mutating input handling.
- Verification: frontend `node --test` passed 251/251; `npm run lint` passed; Org Access `JwtTokenProviderTest` passed; Fulfillment `FulfillmentAuthorizationTest,AssignedPartnerAccessTest` passed. These are code/unit/API authorization checks, not browser workflow evidence.
- DP matrix and three-portal browser totals remain unchanged: 1 PASS, 0 FAIL, 39 BLOCKED, 0 NOT RUN; the isolated database, account, and notification-sink blocker remains. No OTP or live notification was sent.

## Delivery Partner retest — DP-RETEST-20261026-02

- Read-only health checks: Gateway, Org Access, Customer Profile, Catalog, Cart, Inventory, Order, Payment, Fulfillment, and Notification reported UP. The PowerShell request to frontend port 5175 failed, while the Playwright browser was able to load `http://localhost:5175/team-login` and render the Team Portal username/password form.
- Browser route guard: unauthenticated navigation to `/delivery/orders` redirected to `/login`. No credentials were entered and no login request was submitted.
- Database safety check: configured MySQL remains the populated local instance; read-only counts were users 105, memberships 102, orders 57, shipments 11. No SQL rows were modified.
- Regression results: frontend `node --test` 251 passed, 0 failed; Org Access `DeliveryPartnerControllerTest,JwtTokenProviderTest` 5 passed, 0 failed; Fulfillment `FulfillmentAuthorizationTest,AssignedPartnerAccessTest` 12 passed, 0 failed. These automated tests do not constitute authenticated portal E2E evidence.
- Retest outcome: no new DP workflow became verifiable. The cumulative matrix remains 1 PASS, 0 FAIL, 39 BLOCKED, 0 NOT RUN. Authenticated flows still need a disposable QA database/account and a local notification sink. No OTP, email, SMS, carrier, or payment action was performed.
- Browser snapshots: `.playwright-mcp/page-2026-10-26T09-40-42-027Z.yml` (Team login) and `.playwright-mcp/page-2026-10-26T09-40-46-581Z.yml` (protected-route redirect).

## Delivery Partner login attempt — 2026-10-26

- The browser initially held an authenticated Delivery Partner session whose token did not match the username supplied for this attempt. That session was signed out.
- A fresh Team Portal login using the user-provided credentials returned HTTP 401 (`Incorrect credentials or account unavailable`). A read-only query found no account matching the supplied username in the configured local `users_roles` database.
- Password was redacted from the saved browser snapshot. No order, shipment, profile, or availability action was submitted. The authenticated DP workflows remain blocked pending valid credentials/account in the intended local environment.

## Authenticated Delivery Partner session retest — DP-E2E-20261026-03

- An already-open browser tab had a valid Delivery Partner session and partner claim. No fresh login was needed for this read-only pass.
- Dashboard rendered one assigned/active delivery and zero completed deliveries in the selected period. Orders displayed the assigned shipment and order details. History rendered its empty state and its sort/filter controls; no terminal deliveries were available to inspect.
- Opened the profile dialog and closed it without saving. No profile, availability, location, order, shipment, or tracking data was changed.
- Direct navigation without an assigned order exposed a UI defect: the page said it was requesting GPS even though no order was present and the GPS request was skipped. Fixed the prerequisite message and added a regression test. Playwright retest showed “Open navigation from an assigned delivery,” disabled navigation controls, and no GPS prompt.
- Verification after the fix: frontend `node --test` 252 passed, 0 failed; `npm run lint` passed; `npm run build` passed; frontend `git diff --check` passed. Build emitted the existing large-chunk warning.
- State-changing cases (accept, pickup, start, cancel, profile/availability/location save, OTP request/verification, and completion) remain untested because the visible assignment is existing customer data and the configured notification path is not an approved QA sink. No OTP or external notification was sent.
- Full DP matrix remains 1 PASS, 0 FAIL, 39 BLOCKED, 0 NOT RUN. The authenticated read-only checks and isolated navigation UI regression do not establish complete browser E2E coverage.
