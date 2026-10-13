"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./VideoIntro.module.css";

const VIDEO_SRC = "/videos/hero-video.mp4";

export default function VideoIntro() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const nameLineRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    // Ensure autoplay kicks in reliably on all mobile and desktop browsers
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser requires user gesture
        });
      }
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: prefersReducedMotion ? 0 : 0.12,
      });

      tl.to(heroRef.current, {
        opacity: 1,
        duration: prefersReducedMotion ? 0.01 : 1.0,
      })
        .fromTo(
          taglineRef.current,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.8 },
          0.35
        )
        .fromTo(
          nameLineRefs.current,
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: prefersReducedMotion ? 0.01 : 1.1,
            stagger: 0.12,
          },
          0.5
        )
        .fromTo(
          subtitleRef.current,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.9 },
          0.95
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const setNameLineRef = (el: HTMLSpanElement | null, index: number) => {
    if (el) nameLineRefs.current[index] = el;
  };

  return (
    <section className={styles.hero} ref={heroRef} aria-label="Portfolio Intro">
      {/* High-performance single video background */}
      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      {/* Cinematic ambient depth & contrast vignette overlays */}
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.gradientOverlay} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      {/* Overlay Typography */}
      <div className={styles.content}>
        <div className={styles.taglineWrap} ref={taglineRef}>
          <span className={styles.tagline}>
            $ whoami --role=&quot;Backend Developer, GenAI Engineer&quot;
            <span className={styles.taglineCursor} aria-hidden="true" />
          </span>
        </div>

        <h1 className={styles.name}>
          <span className={styles.nameLineMask}>
            <span
              className={styles.nameLine}
              ref={(el) => setNameLineRef(el, 0)}
            >
              Karthic
            </span>
          </span>
          <span className={styles.nameLineMask}>
            <span
              className={styles.nameLine}
              ref={(el) => setNameLineRef(el, 1)}
            >
              N
            </span>
          </span>
        </h1>

        <div className={styles.subtitleWrap} ref={subtitleRef}>
          <p className={styles.subtitle}>
            Java &amp; Spring Boot &middot; Microservices &middot;
            Generative AI Systems — engineering production-grade backends at the
            intersection of enterprise software and applied LLMs.
          </p>
        </div>
      </div>
    </section>
  );
}
