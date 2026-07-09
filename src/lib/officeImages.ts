/** Dubai office photography — single source for paths. */

export const OFFICE_IMAGE_VERSION = "v2";

export const DUBAI_OFFICE_PHOTOS = [
  {
    id: "exterior",
    src: `/images/office/pgr-uae-dubai-exterior.webp?v=${OFFICE_IMAGE_VERSION}`,
    fallback: `/images/office/pgr-uae-dubai-exterior.png?v=${OFFICE_IMAGE_VERSION}`,
    altEn: "PGR UAE Dubai office building exterior on waterfront promenade",
    altAr: "واجهة مبنى مكتب PGR UAE في دبي على الواجهة المائية",
    captionEn: "PGR UAE · Dubai Office Exterior",
    captionAr: "PGR UAE · واجهة المكتب في دبي",
  },
  {
    id: "reception",
    src: `/images/office/pgr-uae-dubai-reception.webp?v=${OFFICE_IMAGE_VERSION}`,
    fallback: `/images/office/pgr-uae-dubai-reception.png?v=${OFFICE_IMAGE_VERSION}`,
    altEn: "PGR UAE Dubai trading and technical support office reception",
    altAr: "استقبال مكتب PGR UAE للتداول والمساندة الفنية في دبي",
    captionEn: "PGR UAE · Reception · Dubai",
    captionAr: "PGR UAE · الاستقبال · دبي",
  },
] as const;
