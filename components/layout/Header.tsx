"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { header } from "@/lib/content";

/**
 * Sticky header: transparent at scroll 0 → navy-900/72% + blur with a bottom
 * hairline after 40px. Anchor nav centre, CTA right, full-screen sheet under
 * 768px (CLAUDE.md §11).
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /**
   * In-sheet links: close the sheet first, then scroll. A plain anchor jump
   * fires while the sheet still has <html> scroll-locked, so the browser
   * lands nowhere and the tap looks dead. scrollIntoView() (no explicit
   * behaviour) defers to the CSS scroll-behaviour, keeping the
   * reduced-motion override intact.
   */
  const goTo =
    (href: string): React.MouseEventHandler<HTMLAnchorElement> =>
    (event) => {
      event.preventDefault();
      setOpen(false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          document.querySelector(href)?.scrollIntoView();
          window.history.replaceState(null, "", href);
        }),
      );
    };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          open
            ? "border-b border-line bg-navy-950"
            : scrolled
              ? "border-b border-line bg-navy-900/72 backdrop-blur-md"
              : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-360 items-center justify-between px-6 md:px-10">
          <a
            href="#hero"
            aria-label="EPINOVA — back to top"
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
          >
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {header.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-secondary transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <Button href={header.cta.href} variant="solid">
              {header.cta.label}
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center text-primary md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {/* inline SVGs so the icon paints before hydration */}
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile sheet — a sibling of <header>, never inside it: the header's
          backdrop-blur makes it a containing block, which would trap this
          fixed panel inside the 64px bar instead of the viewport. */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={`fixed inset-0 top-16 z-40 flex flex-col bg-navy-950 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex-1 px-6 pt-8">
          <ul className="flex flex-col divide-y divide-line">
            {header.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  tabIndex={open ? undefined : -1}
                  onClick={goTo(item.href)}
                  className="type-h3 block py-5 text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-6">
          <Button
            href={header.cta.href}
            variant="solid"
            className="w-full"
            onClick={goTo(header.cta.href)}
          >
            {header.cta.label}
          </Button>
        </div>
      </div>
    </>
  );
}
