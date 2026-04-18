import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: "website" | "profile" | "article";
  canonical?: string;
}

const SITE_NAME = "GuidesDirectly";
const SITE_BASE = "https://iguidetours.net";
const DEFAULT_IMAGE = `${SITE_BASE}/og-image.jpg`;

const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  ogType = "website",
  canonical,
}: SEOProps) => {
  const resolvedImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${SITE_BASE}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`
    : DEFAULT_IMAGE;
  const resolvedUrl = ogUrl || canonical || SITE_BASE;
  const resolvedCanonical = canonical || resolvedUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
    </Helmet>
  );
};

export default SEO;
