/**
 * front/FrontPage.tsx
 *
 * Unified public-facing storefront — merges what was previously split into
 * two separate utilities ("store_page" and "stay_page") into one cohesive
 * "front" feature.
 *
 * Handles all three public URL patterns:
 *   /front/:slug  → hospitality / stay listing (default)
 *   /shop/:slug   → retail / shop mode (isShopMode=true)
 *   /store/:slug  → retail / store mode (isShopMode=true)
 */
export { default } from '../StayPage';
