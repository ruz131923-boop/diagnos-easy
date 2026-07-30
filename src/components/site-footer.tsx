import { Link } from "@tanstack/react-router";
import { Activity, Mail, MapPin, Phone } from "lucide-react";

import { FOOTER_LINKS, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Activity className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-semibold text-foreground">{SITE_NAME}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE_NAME} is a research-oriented clinical decision support prototype built by the
              VitalSense student research group. It combines OCR report reading with machine learning
              models to estimate disease risk. It never replaces a qualified medical professional.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden="true" /> Faculty of Computing,
                Colombo 07
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" aria-hidden="true" /> hello@vitalsense.health
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" aria-hidden="true" /> +94 11 234 5678
              </li>
            </ul>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label + link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME} Research Group. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
            <Link to="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms & Conditions
            </Link>
            <Link to="/cookie-policy" className="transition-colors hover:text-primary">
              Cookie Policy
            </Link>
          </nav>
        </div>
        <p className="mt-6 rounded-lg border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          Medical disclaimer: predictions are statistical estimates produced by machine learning
          models for educational and screening-support purposes only. They are not a diagnosis.
          Always consult a licensed clinician before making any health decision.
        </p>
      </div>
    </footer>
  );
}