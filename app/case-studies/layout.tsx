import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies — GeoRaydar',
  description: 'See how brands have grown their AI presence using GeoRaydar. Real results across ChatGPT, Claude, Gemini, and Perplexity.',
  openGraph: {
    title: 'Case Studies — GeoRaydar',
    description: 'See how brands have grown their AI presence using GeoRaydar. Real results across ChatGPT, Claude, Gemini, and Perplexity.',
    url: 'https://www.georaydar.com/case-studies',
    siteName: 'GeoRaydar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies — GeoRaydar',
    description: 'See how brands have grown their AI presence using GeoRaydar.',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
