/** Dubai office photography — single source for paths. */

export const OFFICE_IMAGE_VERSION = "v1";

export const DUBAI_OFFICE_PHOTOS = [
  {
    id: "reception",
    src: `/images/office/pgr-uae-dubai-reception.webp?v=${OFFICE_IMAGE_VERSION}`,
    fallback: `/images/office/pgr-uae-dubai-reception.png?v=${OFFICE_IMAGE_VERSION}`,
    altEn: "PGR UAE Dubai trading and technical support office reception",
    altAr: "استقبال مكتب PGR UAE للتداول والمساندة الفنية في دبي",
    captionEn: "PGR UAE · Trading & Technical Support Office · Dubai",
    captionAr: "PGR UAE · مكتب التداول والمساندة الفنية · دبي",
  },
] as const;
