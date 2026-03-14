import { AFFILIATE_LINKS } from '../config/affiliate';

export default function AffiliateLinks() {
  if (!AFFILIATE_LINKS.length) return null;

  return (
    <div className="affiliate-section">
      <p className="affiliate-heading">Find materialerne hos:</p>
      <div className="affiliate-links">
        {AFFILIATE_LINKS.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            {link.logo && <img src={link.logo} alt={link.name} style={{ height: 16, width: 'auto' }} />}
            {link.name} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
