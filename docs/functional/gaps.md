# Gaps, disabled behavior and open decisions

These are findings from source analysis, not changes made to application behavior. Severity below indicates documentation/business impact, not a formal security rating.

| ID | Finding | Impact and required decision/evidence |
|---|---|---|
| G01 | Payment capabilities return false; public initiate/process-demo/refund-demo methods denied | Online collection/refunds cannot be represented as operational. Configure and verify a provider before changing that claim. |
| G02 | Coupon engine disabled; lookup returns null despite visible entry/configuration | No redeemable checkout coupons. Remove stale hints or implement server promotions. |
| G03 | New COD branch precedes persisted multistore checkout and creates children concurrently | Partial split success/retry can differ from coordinated group behavior. Test duplicate/partial failure recovery. |
| G04 | Backend charges INR 5 per order; checkout branches aggregate handling/delivery differently | Compare displayed split-cart totals with every saved child total, including multiple products in a single delivery group. |
| G05 | Global stocked-store assignment reads/writes local orders | Database order creation does not prove persisted global approval/assignment. Define the authoritative workflow. |
| G06 | Location Admin manageable-role configuration conflicts with Users module/backend guard | Staff hierarchy is not consistently exposed/enforced. |
| G07 | Global Admin backend user-create permission differs from frontend module/role choices | Confirm intended administrative model. |
| G08 | Store Manager coupons/reports permitted but absent in dedicated sidebar | Decide whether intentional direct-route access or missing navigation. |
| G09 | Admin security settings and audit activity are local records | Do not promise enforced 2FA/IP policy or centralized immutable audit. |
| G10 | Local general reviews and backend order reviews are separate | No unified review moderation/purchase verification established. |
| G11 | Order-review UI requires delivery; backend save only rejects CANCELLED | Direct owner requests can have weaker eligibility than UI. Align backend business rule. |
| G12 | Deletion uses fixed demo code and calls only Profile Service | No proof of identity deletion, order erasure, emailed verification or all-device logout. |
| G13 | Rewards, referrals, vouchers, support tickets and chat are local | No server loyalty accounting, referral attribution or live support delivery. |
| G14 | General notification inbox is local, delivery OTP creation is backend | Verify where customer actually receives the OTP; local inbox alone is insufficient evidence. |
| G15 | Help FAQ advertises payment/timing features beyond verified implementation | Review static product claims against enabled capabilities. |
| G16 | Privacy and Terms use the same static content; CMS/settings schemas not active | No distinct managed legal documents or working CMS established. |
| G17 | Delivery navigation substitutes fixed coordinates on failures | Misleading route risk; verify real coordinates and distinguish estimates. |
| G18 | Report revenue excludes title-case Cancelled only; delivered also title-case | Uppercase service statuses may produce incorrect totals. |
| G19 | Report performance uses unfiltered orders; counts do not all follow date filter | Report sections can represent different scopes. |
| G20 | Report store option uses a different “all” sentinel | Selecting all stores can incorrectly filter results. |
| G21 | REORDER adds first item only | Label may imply a full-order repeat that is not implemented. |
| G22 | Non-manager workflow may fall back to local demo state | UI progress is not always backend progress. |
| G23 | Some store/collection deletion/status actions are generic/local | Verify persistence per action before calling this full remote CRUD. |
| G24 | Locale saved through local profile store; payment remains INR | No cross-device locale guarantee or foreign-currency settlement. |
| G25 | Some customer pages lack router guard; backend owner checks differ by endpoint | Verify actual authorization, especially staff order-items reads and cancellation. |
| G26 | General admin and dedicated Store Manager password logic are local; Delivery Partner uses API | Store Manager UI does not establish a change to the real backend login password. |
| G27 | Guest migration and saved-item persistence use mixed store/account scopes | Test multi-store login migration and shared-browser account switching. |
| G28 | Radius saves are sequential; zone bounds overlap at exact endpoints | Test partial save recovery and exact boundary selection. |
| G29 | Address manual entry may lack map coordinates | Address save success does not guarantee delivery quote eligibility. |
| G30 | Navigation/checkout state is partly passed through route state/session storage | Deep-link refresh and new-tab behavior need runtime verification. |
| G31 | Three existing checkout-policy tests disagree with current policy; one stock/delivery test file is syntactically incomplete | Automated suite is not green; see verification record. No application/test fixes were included in this documentation task. |

## Decisions needed for future specification

1. Which local engagement/admin features are intended as production features?
2. Should global fulfillment be centrally managed, assigned to a stocked store, or both through a persisted workflow?
3. What is the intended refund/return policy and supported operator action? Shipment RETURNED is not a customer returns portal.
4. Is handling charged once per customer checkout or once per child order?
5. Which role should create each staff role, and through which UI/API?
6. Should review eligibility require independently verified delivery in the backend?
7. What does account deletion legally and operationally remove across services?

These questions do not prevent documenting current behavior. Their answers are needed to turn implementation inconsistencies into an agreed future functional specification.
