// utils/font-preload.ts
const weights = [
  'Thin',
  'UltraLight',
  'Light',
  'Regular',
  'Medium',
  'DemiBold',
  'Bold',
  'ExtraBold',
  'Black',
  'ExtraBlack',
  'Heavy',
] as const;

type Weight = (typeof weights)[number];

export const fontPreloadLinks = weights.flatMap((w) => [
  {
    rel: 'preload' as const,
    href: `/fonts/woff2/IRANSansX-${w}.woff2`,
    as: 'font' as const,
    type: 'font/woff2' as const,
    crossorigin: 'anonymous' as const,
  },
  {
    rel: 'preload' as const,
    href: `/fonts/d4/IRANSansX-${w}D4.ttf`,
    as: 'font' as const,
    type: 'font/ttf' as const,
    crossorigin: 'anonymous' as const,
  },
]);
