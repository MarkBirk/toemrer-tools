import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Tømrer Tools';
const BASE_URL = 'https://toemrer-tools.netlify.app';

export default function SEO({ title, description, path }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Beregningsværktøjer til tømrere`;
  const url = path ? `${BASE_URL}${path}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || ''} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ''} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="da_DK" />
    </Helmet>
  );
}
