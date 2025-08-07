import { Helmet } from 'react-helmet-async';

interface PageMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const PageMetadata = ({
  title = "ibnOrigin - Ibeno Certificate of Origin Portal",
  description = "Official digital certificate of origin verification system for Ibeno Local Government Area, Akwa Ibom State. Secure, verifiable, and instant certificate issuance.",
  keywords = "Ibeno, certificate, origin, verification, government, digital, secure",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = "/logo.png"
}: PageMetadataProps) => {
  const fullTitle = title.includes('ibnOrigin') ? title : `${title} | ibnOrigin`;
  const currentUrl = canonicalUrl || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta property="twitter:description" content={ogDescription || description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Ibeno Local Government" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#059669" />
    </Helmet>
  );
};

export default PageMetadata;