import React from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  imageUrl?: string;
}

/**
 * Component for adding structured JSON-LD data for SEO
 */
const SEO: React.FC<SEOProps> = ({
  title = "Galbi Creator by Acadewise | AI Art & 3D Model Generator",
  description = "Create stunning AI-generated artwork and 3D models with Galbi Creator by Acadewise. No external APIs, easy-to-use interface, and completely free to start.",
  canonical = "https://acadewise.com/galbi-creator",
  imageUrl = "https://acadewise.com/images/galbi-creator-preview.jpg"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Galbi Creator by Acadewise",
    "applicationCategory": "GraphicsApp",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description,
    "sameAs": [
      "https://acadewise.com",
      "https://twitter.com/acadewise",
      "https://instagram.com/acadewise",
      "https://linkedin.com/company/acadewise"
    ],
    "author": {
      "@type": "Organization",
      "name": "Acadewise Inc.",
      "url": "https://acadewise.com",
      "logo": "https://acadewise.com/logo.png"
    },
    "screenshot": imageUrl,
    "softwareVersion": "1.0.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default SEO;