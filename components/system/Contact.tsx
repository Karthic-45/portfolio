"use client";

import {
  EMAIL,
  GITHUB,
  LINKEDIN,
  PHONE_DISPLAY,
  PHONE_HREF,
  PROFILE,
} from "@/lib/profile";
import styles from "./Contact.module.css";

/** The last node in the system: how to reach the person who built it. */
export default function Contact() {
  const channels = [
    { label: "email", value: EMAIL, href: `mailto:${EMAIL}`, ext: false },
    { label: "phone", value: PHONE_DISPLAY, href: PHONE_HREF, ext: false },
    { label: "github", value: "Karthic-45", href: GITHUB, ext: true },
    { label: "linkedin", value: "in/karthic45", href: LINKEDIN, ext: true },
  ];

  return (
    <section id="contact" className={styles.section}>
      <div className="container">
        <span className={styles.eyebrow}>Endpoint</span>
        <h2 className={styles.heading}>{PROFILE.availability}.</h2>

        <ul className={styles.channels}>
          {channels.map((c) => (
            <li key={c.label} className={styles.channel}>
              <span className={styles.channelLabel}>{c.label}</span>
              <a
                className={styles.channelValue}
                href={c.href}
                {...(c.ext
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {c.value}
                {c.ext && <span aria-hidden="true"> ↗</span>}
              </a>
            </li>
          ))}
        </ul>

        <p className={styles.foot}>
          {PROFILE.location} · &copy; {new Date().getFullYear()} {PROFILE.name}
        </p>
      </div>
    </section>
  );
}
