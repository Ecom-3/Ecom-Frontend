# Customer features

Evidence is code-confirmed unless marked otherwise. The [coverage inventory](coverage.md) maps every customer route to this chapter or [commerce](commerce.md).

## C01 — Introduction, navigation and session

Sources: [router](../../src/router.jsx), [application context](../../src/context/AppContext.jsx), [header](../../src/components/Header/Header.jsx), [bottom navigation](../../src/components/BottomNav/BottomNav.jsx).

Opening `/` redirects to `/home`. `/intro` is the introductory entry page. Header and bottom navigation connect shopping, search, cart and account areas. The header supports location selection and a cart drawer. Product actions can display an added-to-cart popover.

Session token, user and login state use session storage. JWT expiry is checked in the application. Logout clears session authentication and invokes the logout service. Browser-local feature data is not equivalent to an account-wide server record.

Unknown routes display Page not found; role-denied routes display Access denied. API errors are surfaced separately from these navigation states.

## C02 — Register and verify an account

Sources: [login implementation](../../src/pages/Login/Login.jsx), [registration validation](../../src/utils/registrationValidation.js), [customer auth adapter](../../src/services/customerAuthService.js).

Entry: `/register`, implemented by the shared Login component in registration mode.

1. Enter full name, Gmail address, Indian mobile, password and confirmation.
2. Submit registration to the authentication service.
3. Receive a server-issued email verification challenge.
4. Enter the verification code. Resend becomes available after the server's cooldown.
5. Successful signup verification returns to password login with a confirmation message.

Rules: name has at least three letters, no digits, maximum 120 characters; allowed characters include Unicode letters, spaces, apostrophes, periods and hyphens. Registration email is restricted to the implemented `@gmail.com` format, maximum 190 characters. Mobile must normalize to a valid Indian number. Password needs at least eight characters, uppercase, lowercase and a digit, maximum 72 UTF-8 bytes; confirmation must match.

Failures retain a visible error; a failed registration request returns from verification to registration. `/register-otp` is a legacy bookmark that redirects to login and cannot resume an arbitrary old challenge.

## C03 — Login, OTP login and password recovery

Entry: `/login`, `/mobile-login`, `/forgot-password`; email-OTP login is a mode inside Login.

Password login accepts email/mobile for customers. Email/password failure with a 401 may fall through to staff authentication; mobile login failures do not take that fallback. Staff usernames can also be resolved through the shared screen.

Mobile/email OTP login requests a challenge and verifies its code. Password recovery requests an email challenge, exchanges a valid code for a reset token, and submits the new password plus confirmation. Successful reset returns to login.

Customer login loads the customer profile. A missing profile (404) is tolerated; rejected profile authentication (401/403) produces a configuration/session error instead of silently logging in. The token's customer ID is used for the customer identity. Return navigation accepts internal paths and excludes staff areas.

Authentication requests have a 20-second timeout. If a request times out after a code arrived, the error advises requesting a new code. Code expiry, attempt limits and cooldown values are server-owned; do not infer them from the delivery OTP rules.

## C04 — Home, categories and campaigns

Sources: [Home](../../src/pages/Home/Home.jsx), [categories](../../src/pages/CategoriesPage/CategoriesPage.jsx), [banner page](../../src/pages/BannerPage.jsx), [delivery product selection](../../src/utils/storeDelivery.js).

Customers browse product sections, category navigation and campaigns. Catalog loading requests active products, categories, banners, stores and store-product mappings. Location and store eligibility influence the available listings. Categories lead to relevant product selection. Banner detail uses `bannerId`; campaigns can carry target URLs.

Product listings should be understood as store-specific offers, not just unique master products. Availability considers active records, store eligibility and global-product flags. Missing images use image fallback components. Loading, empty and service-error states must be distinguished from a genuinely empty catalog.

## C05 — Store directory and store page

Sources: [directory](../../src/pages/StoresListPage/StoresListPage.jsx), [store page](../../src/pages/StorePage/StorePage.jsx).

`/stores` exposes store discovery; `/stores/:storeId` displays a specific store and its catalog. Customers can inspect store details and delivery/pickup information and open/add products supplied by that store. The selected store identity must survive into cart and checkout.

Store status, delivery flags, delivery radius and the selected location affect serviceability. A visually nearby store is not a substitute for the server's checkout delivery quote.

## C06 — Search and filtering

Source: [Search](../../src/pages/SearchPage/SearchPage.jsx).

Search initializes from URL `q` or the current home query. It loads matching catalog data and applies category, maximum price, rating and availability filters, plus sorting including price and delivery-oriented choices. Customers can clear filters, select recent terms, open product details and add items.

Recent searches are component state, initialized with a sample term and limited to five remembered terms. They are not a server search-history feature. No results, loading and request errors have separate displays.

## C07 — Product details and stock

Sources: [ProductInfo](../../src/components/ProductInfo/ProductInfo.jsx), [stock lookup](../../src/utils/productStock.js), [store resolver](../../src/services/productStoreResolver.js).

Entry: `/product-info/:productId`; `/product-info` also supports selected-product context.

Customers inspect product imagery, description and available descriptive attributes, select a variant where present, inspect price/availability, add to cart and use wishlist actions. A store and variant are part of item identity. Stock lookup must match that identity; unknown or failed inventory verification must not be represented as confirmed available stock.

Variant/catalog data and store mappings can differ from cached selected-product data. Deep-link and refresh behavior should be tested with a real product ID, including missing products, inactive mappings and out-of-stock variants.

## C08 — Cart and cart drawer

Sources: [cart page](../../src/pages/CartPage/CartPage.jsx), [drawer](../../src/components/CartDrawer/CartDrawer.jsx), [context](../../src/context/AppContext.jsx), [cart API](../../src/services/cartApi.js).

Customers add items, increase/decrease quantities, remove items, clear a cart and proceed toward checkout. Product, variant and store distinguish lines. Totals derive from quantity and unit price, with service-calculated cart totals used when available.

Guests have a local cart. Logged-in carts use Cart Service and store scope. Login and refresh load all of the customer's active store carts, independently of the selected browsing store. Guest migration removes each local line only after server acknowledgement and retains unacknowledged lines for retry. Failed reloads preserve the current account's already displayed cart and expose cart errors/unavailable state. Account changes discard stale responses and clear the previous account's displayed cart.

Changing a quantity to a removal condition follows the removal path. Invalid identity, absent store, unavailable cart service and stock changes are relevant failures. Delivery grouping and final price validation occur again during checkout.

## C09 — Wishlist and saved for later

Sources: [wishlist](../../src/pages/WishlistPage/WishlistPage.jsx), [saved items](../../src/pages/SavedForLaterPage/SavedForLaterPage.jsx), [context](../../src/context/AppContext.jsx).

Customers toggle wishlist entries, remove saved entries and move items back to cart. Entries use product/store/variant identity. Guest wishlist entries merge and deduplicate with the account's locally stored list on login.

Wishlist and saved-for-later use browser storage, including account-specific keys. Some generic saved-item keys also exist; do not promise cross-device synchronization or complete isolation merely because a customer is logged in. Cart addition still depends on current catalog and cart behavior.

## C10 — Location search, map and address form

Sources: [search](../../src/pages/AddressSearchPage/AddressSearchPage.jsx), [map](../../src/pages/AddressMapPage/AddressMapPage.jsx), [form](../../src/pages/AddressFormPage/AddressFormPage.jsx), [validation](../../src/utils/addressValidation.js), [location modal](../../src/components/LocationSelectionModal/LocationSelectionModal.jsx).

Customers select a location by search, map/GPS or manual address entry. The chosen address and coordinates feed store discovery and delivery quoting. Address form supports return navigation so login or map selection can return to the task.

Required form inputs: house/building/area, floor, landmark and receiver phone. Manual mode additionally requires street/area, city, state and a six-digit PIN whose first digit is nonzero. Phone is a ten-digit Indian mobile beginning 6–9.

GPS unsupported/denied and geocoding failure must lead to a visible recovery path. A manual address without coordinates may be savable but cannot be assumed eligible for coordinate-based delivery quotes.

## C11 — Saved addresses

Sources: [saved address page](../../src/pages/SavedAddressesPage/SavedAddressesPage.jsx), [profile service](../../src/services/customerProfileService.js).

Customers create, edit, delete and select/default addresses. Backend paths are under `/api/v1/profiles/me/addresses`; setting default uses a dedicated PATCH. Payload carries type, formatted address, receiver phone, house/floor/landmark, optional coordinates and structured manual location.

The context loads server addresses and caches a frontend representation. It also derives address candidates from order history. Historical order address snapshots should not be confused with editable saved-address records.

## C12 — Customer profile and photo

Source: [Profile](../../src/pages/Profile/Profile.jsx).

Login is required by the route guard. Customers view/edit personal information, upload a photo, reach account features, manage addresses and log out. Fields include name, phone, email, gender and date of birth.

Save requires the registration-style valid name, Indian mobile and valid email when supplied. It updates the identity-service name before saving the profile, so these writes are not one transaction. Photo must be an image and at most 2 MB; it is read as a data URL and saved through Profile Service.

Onboarding can direct customers through language/profile/address completion before returning to checkout. Missing addresses produce a completion prompt.

## C13 — Language, currency and timezone

Sources: [language page](../../src/pages/LanguageSelectionPage/LanguageSelectionPage.jsx), [translations](../../src/i18n/index.js), [preferences](../../src/i18n/preferences.js).

`/language` and `/settings/language` share the language page. English, Hindi and Telugu resources are available. Currency choices are INR, USD, AED and GBP; timezone choices include India, UAE, UK, USA and UTC.

Selecting a language updates the interface preference immediately. Save persists local preferences and updates the local profile store when a user exists. Onboarding returns to profile completion. Translation falls back to English for missing keys.

Display currency preferences do not establish foreign-currency payment support: payment creation uses INR. These preferences are not evidence of a live foreign-exchange service.

## C14 — General product reviews

Source: [CustomerFeaturePage](../../src/pages/CustomerFeaturePage/CustomerFeaturePage.jsx).

`/reviews` displays approved reviews, average rating and star distribution. Logged-in customers can submit a rating and text, attach images and mark an approved review helpful once per locally recorded user ID.

Submission requires a positive rating and at least five trimmed text characters; text UI limit is 1,000 characters. Image selection accepts up to four images under 2 MB each. New reviews are Pending; approved active reviews become visible. Admin replies are displayed.

This feature uses local collections. A displayed verification icon is not evidence of a verified purchase. Delivered-order reviews are a separate backend feature, documented as O09.

## C15 — Notifications

Source: [CustomerFeaturePage](../../src/pages/CustomerFeaturePage/CustomerFeaturePage.jsx).

`/notifications` lists local notifications, distinguishes unread items, marks an item read on selection and clears all. This page uses `notificationStore`; it is not itself a server notification inbox.

Order notification history and delivery OTP notifications use backend integrations elsewhere. Do not assume a message saved by Notification Service automatically appears on this local page.

## C16 — Rewards, referrals and vouchers

Sources: [customer page](../../src/pages/CustomerFeaturePage/CustomerFeaturePage.jsx), [loyalty store](../../src/services/localDataService.js).

`/rewards` shows points, a referral code and vouchers. The local default is 100 points and referral code `PICKLES100`. Redeeming 100 points subtracts points and creates a value-10 voucher; insufficient points is rejected.

This is local demonstration behavior. No verified earning, referral attribution, server balance or voucher checkout integration is established by this implementation.

## C17 — Help, contact and informational pages

Sources: [Help Center](../../src/pages/HelpCenterPage/HelpCenterPage.jsx), [legal page](../../src/pages/LegalPolicyPage/LegalPolicyPage.jsx), [customer information](../../src/pages/CustomerFeaturePage/CustomerFeaturePage.jsx).

Help includes FAQ accordions, telephone/email/WhatsApp links, local support tickets and local chat. Ticket text must have at least five trimmed characters; creation produces an Open ticket. Nonempty chat messages receive an automatic local acknowledgement.

These are not verified staffed support channels or a live-agent chat service. Contact destinations and FAQ claims are hard-coded content. The About and Contact routes display informational text. Privacy and Terms routes use the same static component with different titles; they do not load distinct CMS documents.

## C18 — Delete account

Source: [DeleteAccountPage](../../src/pages/DeleteAccountPage/DeleteAccountPage.jsx).

The screen asks for a nonempty email, then accepts a hard-coded demonstration code `1234`. It calls DELETE `/api/v1/profiles/me`, logs out and returns to introduction on success. Errors remain visible.

The entered email is not checked against the account in this UI and no real deletion OTP challenge is sent. The profile deletion call does not establish deletion of authentication identity, orders or sessions on all devices. The screen's broader deletion wording must therefore not be treated as a confirmed system guarantee.
