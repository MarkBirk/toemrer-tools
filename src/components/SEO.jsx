import { Helmet } from 'react-helmet-async';
import { getAdminSeoOverride, getAdminSiteName, getAdminBaseUrl } from '../utils/storage';

const DEFAULT_SITE_NAME = 'Tømrer Tools';
const DEFAULT_BASE_URL = 'https://toemrer-tools.netlify.app';

export default function SEO({ title, description, path }) {
  // Tjek admin-overrides fra localStorage
  const override = path ? getAdminSeoOverride(path) : null;
  const siteName = getAdminSiteName() || DEFAULT_SITE_NAME;
  const baseUrl = getAdminBaseUrl() || DEFAULT_BASE_URL;

  // Brug override hvis sat, ellers fallback til hardcoded props
  const effectiveTitle = override?.title || title;
  const effectiveDesc = override?.description || description;

  const fullTitle = effectiveTitle
    ? `${effectiveTitle} | ${siteName}`
    : `${siteName} – Beregningsværktøjer til tømrere`;
  const url = path ? `${baseUrl}${path}` : baseUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={effectiveDesc || ''} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={effectiveDesc || ''} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="da_DK" />
    </Helmet>
  );
}
