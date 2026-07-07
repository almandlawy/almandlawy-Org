/**
 * Facebook launch — UTM links & WhatsApp CTAs (compliance-safe).
 */

export const FACEBOOK_PAGE_URL =
  "https://www.facebook.com/profile.php?id=61587414407931";

const SITE = "https://www.pgruae.com";

export const FACEBOOK_UTM = {
  pageAbout: `${SITE}/?utm_source=facebook&utm_medium=organic_social&utm_campaign=page_about`,
  pageBio: `${SITE}/facebook?utm_source=facebook&utm_medium=organic_social&utm_campaign=page_bio`,
  launchPost: `${SITE}/facebook?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_launch&utm_content=post_intro`,
  iraqOffer: `${SITE}/iraq-bullion-quote?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_launch&utm_content=post_iraq`,
  requestQuote: `${SITE}/request-quote?utm_source=facebook&utm_medium=paid_social&utm_campaign=fb_ctwa&utm_content=ad_general`,
  catalog: `${SITE}/?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_launch&utm_content=post_catalog#catalog`,
} as const;

export const FACEBOOK_WHATSAPP = {
  general:
    "https://wa.me/971559688837?text=Hello%2C%20I%20would%20like%20to%20request%20a%20firm%20quote%20from%20PGR%20UAE%20for%20physical%20gold%20or%20silver.%20(ref%3A%20facebook)",
  palm1kg:
    "https://wa.me/971559688837?text=Hello%2C%20I%20would%20like%20a%20desk-confirmed%20quote%20for%20PALM%20Silver%201kg.%20(ref%3A%20facebook)",
  iraq:
    "https://wa.me/971559688837?text=Hello%2C%20I%20need%20a%20firm%20bullion%20quote%20for%20Iraq%20delivery.%20(ref%3A%20facebook)",
  arGeneral:
    "https://wa.me/971559688837?text=%D9%85%D8%B1%D8%AD%D8%A7%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%B7%D9%84%D8%A8%20%D8%B9%D8%B1%D8%B6%20%D8%B3%D8%B9%D8%B1%20%D9%85%D8%B9%D8%AA%D9%85%D8%AF%20%D9%85%D9%86%20PGR%20UAE.%20(ref%3A%20facebook)",
} as const;
