import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { contact, footer, header } from "@/lib/content";

/**
 * Operator-style bordered grid: logo + descriptor · nav column · contact
 * column · inline CTA cell, then a bottom copyright row.
 */
export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-360 px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="border-t border-line py-10 first:border-t-0 md:pr-8 md:[&:nth-child(2)]:border-t-0 lg:border-t-0">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-secondary">
              {footer.descriptor}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="border-t border-line py-10 md:border-l md:border-t-0 md:px-8"
          >
            <p className="type-label mb-4 text-tertiary">Navigate</p>
            <ul className="space-y-3">
              {header.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-block py-1 text-sm text-secondary transition-colors duration-200 hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-line py-10 md:px-8 lg:border-l lg:border-t-0">
            <p className="type-label mb-4 text-tertiary">Contact</p>
            <ul className="space-y-3 text-sm text-secondary">
              <li>
                <a
                  href={`mailto:${contact.details.email}`}
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {contact.details.email}
                </a>
              </li>
              <li>
                <a
                  href={contact.details.phoneHref}
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {contact.details.phone}
                </a>
              </li>
              <li>
                <a
                  href={contact.details.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start justify-center gap-4 border-t border-line py-10 md:border-l md:px-8 lg:border-t-0">
            <p className="type-h3">{footer.ctaTitle}</p>
            <Button href="#contact" variant="outline">
              {footer.ctaLabel}
            </Button>
          </div>
        </div>

        <div className="border-t border-line py-6 text-center text-xs text-tertiary">
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
