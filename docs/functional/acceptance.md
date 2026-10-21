# Functional acceptance scenarios

These are executable manual scenarios, **not claims of passed runtime testing**. All rows are pending authenticated end-to-end execution. Existing automated utility tests are recorded separately in [verification](verification.md).

Use test accounts for each of the six roles, two stores in different locations, active/inactive partners, stocked/out-of-stock variants, a global-eligible/noneligible product pair, and disposable customer addresses. Obtain real service results; do not replace failed calls with assumed success.

| Scenario | Feature | Steps and expected result |
|---|---|---|
| QA01 | C01 | Open root and an unknown path; reach home and Page not found respectively. Expire session and retry protected access; reach login. |
| QA02 | C02 | Register with valid data, verify latest code, then log in. Invalid name/Gmail/mobile/password mismatch is rejected before completion. |
| QA03 | C02–C03 | Resend challenge within cooldown, enter wrong/expired code, then valid current code; respect server rejection and permit only verified completion. |
| QA04 | C03 | Exercise password, mobile OTP and email OTP login; verify customer ID and safe return route. Profile-service 403 must not silently complete login. |
| QA05 | C03 | Reset password through OTP/reset token; mismatch is rejected; confirmed password works afterward. |
| QA06 | C04 | Load home/categories/banner detail with active and inactive catalog records; compare displayed products with eligibility. Distinguish empty result from outage. |
| QA07 | C05 | Open two store pages and add the same product/variant from each; retain distinct supplying-store identity. |
| QA08 | C06 | Search by text; combine category, price, rating, availability and sort; clear filters; confirm no-result state and recent-term limit. |
| QA09 | C07 | Open product by direct URL and refresh; choose variant; verify correct price/stock/store. Missing or unverified inventory must not show confirmed stock. |
| QA10 | C08 | Add as guest, change quantity/remove, sign in and inspect migration. Repeat with multiple stores and a failed cart request; no silent item loss. |
| QA11 | C08 | Change logged-in cart quantities and compare server totals. Test remove/clear and unavailable-service feedback. |
| QA12 | C09 | Wishlist an item, log in to merge/deduplicate, move to cart and remove. Switch accounts/browser to identify actual local persistence boundary. |
| QA13 | C09 | Save a cart item for later and restore it after price/stock changes; cart uses current permitted identity and surfaces failures. |
| QA14 | C10 | Select GPS/map/search location; deny GPS; complete manual form. Missing floor/landmark/phone/PIN yields field-specific errors. |
| QA15 | C11 | Create/edit/default/delete saved address, refresh and inspect service records. Historical order address remains a separate snapshot. |
| QA16 | C12 | Edit profile/name/phone, upload valid image and oversized/nonimage file. Valid save persists; invalid input is rejected; partial service error is visible. |
| QA17 | C13 | Switch all three languages, currency/timezone and reload. Confirm display preference and that payment amounts remain INR. |
| QA18 | C14 | Submit a local review with five-character text and allowed images; approve in admin; verify average, response and one helpful vote per local user. |
| QA19 | C15 | Add/read/clear local notifications; separately generate a backend order message and determine its actual display location. |
| QA20 | C16 | Redeem initial 100 local points, inspect voucher, attempt second redemption; insufficient points rejected. No claim of checkout redemption. |
| QA21 | C17 | Submit a valid local ticket/chat and refresh; inspect local Open ticket and automatic reply. Verify configured external contact destinations separately. |
| QA22 | C17 | Open About, Contact, Privacy and Terms; confirm static content and identify duplicated legal body. |
| QA23 | C18 | With disposable account, inspect deletion email/code steps and Profile Service deletion result; verify which other service records remain. |
| QA24 | O01 | Review empty cart, missing contact/address, loading quote and invalid schedule; each blocks proceeding with explanation. |
| QA25 | O02/S04 | Quote just inside/outside radius, exactly at band boundary, below/at free-delivery and minimum-order thresholds; compare server quote and UI. |
| QA26 | O02 | Mix local delivery and pickup; ensure pickup charge zero. Reject global pickup. |
| QA27 | O03 | Enter advertised and admin-created coupon codes; show unavailable and apply no discount. Reject a nonzero injected review discount. |
| QA28 | O03–O04 | Change catalog price after cart creation; verify backend recalculates. Duplicate product/variant lines are rejected as required. |
| QA29 | O04 | Submit same order intent twice, including simulated lost response; retrieve same result or explicit conflict, not an unrelated duplicate. |
| QA30 | O05 | Submit two-store COD with one child failing; inspect both server carts/orders, UI error and subsequent retry before declaring safe recovery. |
| QA31 | O05 | Exercise persisted checkout group independently; unresolved changed intent must not overwrite attempts; only fully compensated owned failure can reset. |
| QA32 | O05 | Set multistore switch false in a test configuration; multigroup submission is blocked before creating orders. |
| QA33 | O06 | Fetch capabilities; online choices must not create/process payment while disabled. COD success remains pending and is not labelled paid. |
| QA34 | O06 | Inspect saved payment for foreign/mismatched order/customer/amount; ownership/matching controls reject it. |
| QA35 | O07 | Search/filter order history, deep-link to details and refresh; only owned accessible data should load. |
| QA36 | O07 | Cancel CREATED order, repeat cancellation, then try SHIPPED/DELIVERED; first succeeds/idempotently repeats, terminal attempts fail. |
| QA37 | O07 | Reorder multi-item order; record current first-item-only behavior rather than expecting full cart reconstruction. |
| QA38 | O08 | Progress fulfillment and shipment; inspect tracking and notification history. Missing shipment shows appropriate pending/unavailable state. |
| QA39 | O08 | Download invoice PDF and view summary; verify items/totals/payment label and explicit non-tax/non-payment-proof wording. |
| QA40 | O09 | Review delivered order with 1–5 stars and at most three sub-120-KB images; edit and refresh same review. UI blocks undelivered order. |
| QA41 | O09 | Call review save as owner before delivery in a controlled test; record frontend/backend eligibility mismatch. Cross-customer requests must fail. |
| QA42 | A01/A02 | Open each permitted admin module, filter/page/open dialogs; attempt forbidden direct module routes and verify role restriction. |
| QA43 | A03/A04 | Create location and permitted staff role; verify general staff API/module mismatches without interpreting local state as real account creation. |
| QA44 | A05/A06 | Create category/store with required fields; reject malformed URL/missing address/map point/negative radius; verify persisted catalog record. |
| QA45 | A07 | Create product, variants and image, map to store; duplicate/edit/deactivate; inspect uniqueness validation and storefront effect. |
| QA46 | A08 | Create scoped/date-controlled banner; test target store, active/scheduled/inactive and oversized image. |
| QA47 | A09 | Increase/decrease/adjust stock; inspect inventory record and reservations. Wrong-store manager update should be rejected by service controls. |
| QA48 | A10 | Confirm/pack/ready/ship order; reload each service. Simulate downstream failure and distinguish DB state from local fallback. |
| QA49 | A11 | Assign global local order to stocked store; reject insufficient stock/already assigned; inspect whether database state changed. |
| QA50 | A12 | Inspect payment module against saved Payment Service records; do not infer settlement or refund execution from local display. |
| QA51 | A13/A14 | Edit generic partner/customer records and reload another browser; identify local-only writes versus backend partner portal writes. |
| QA52 | A15/A16 | Moderate review and create/duplicate coupon; verify local review visibility while coupon redemption remains disabled. |
| QA53 | A17 | Create scheduled admin notification; inspect actual local/service records instead of assuming recipient dispatch. |
| QA54 | A18 | Filter report by date/store, export JSON, compare every KPI/performance row with source orders including uppercase statuses. |
| QA55 | A19/A20 | Toggle local security setting and inspect audit entry; do not claim backend 2FA/IP enforcement. Confirm hidden CMS/settings have no enabled menu. |
| QA56 | S01/S02 | Login assigned/unassigned manager; edit store profile and password through dedicated screens; verify persistence and errors. |
| QA57 | S03 | Save radii 3/8 km then edit/delete; verify normalized bands. Reject duplicate/nonpositive radius and inspect partial save recovery. |
| QA58 | S05 | Create partner, toggle active, refresh from backend; partner belongs to manager store and inactive partner is not assignable. |
| QA59 | S06 | Assign active same-store partner, reject different-store/finalized shipment, retry FAILED shipment and verify new assignment. |
| QA60 | D01 | Toggle availability, update GPS/profile/password; profile remains accessible when delivery feed fails. |
| QA61 | D02 | Accept → pickup → start; reject wrong partner and out-of-order actions. Cancel with empty reason fails; out-for-delivery cancellation becomes FAILED. |
| QA62 | D03 | Verify correct OTP once; test wrong code, five attempts, expiry, resend before/after 60 seconds and replay after completion. |
| QA63 | D04 | Search/filter delivery history across outcomes and time periods; compare daily/weekly/monthly buckets. |
| QA64 | D05 | Open navigation with valid order and with missing route state/GPS/geocode; confirm estimates and identify fixed-location fallback. |
| QA65 | Roles | Run role/module matrix and cross-customer/store requests. Higher-role access must follow explicit route guards, not assumed inheritance. |

## Release acceptance prerequisites

Agree the expected behavior for gaps before treating discrepancies as test failures or approved exceptions. Use backend records to verify mutation outcomes. Capture scenario, role, record IDs, observed UI, service outcome and result without exporting tokens or personal data.
