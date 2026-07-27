"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import CinematicLayer from "../CinematicLayer/CinematicLayer";
import styles from "./VideoIntro.module.css";

const VIDEO_SRC = "/videos/hero-video.mp4";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 4.5v15l14-7.5-14-7.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="5.5" y="4.5" width="4.5" height="15" rx="1" fill="currentColor" />
      <rect x="14" y="4.5" width="4.5" height="15" rx="1" fill="currentColor" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 9v6h4l5 5V4L8 9H4z"
        fill="currentColor"
      />
      <path
        d="M16.5 9.5l4 4m0-4l-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
      <path
        d="M16.2 8.2a5.2 5.2 0 010 7.6M18.6 5.8a8.6 8.6 0 010 12.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function VideoIntro() {
  const heroRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const fgWrapRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);
  const nameLineRefs = useRef<HTMLSpanElement[]>([]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hintVisible, setHintVisible] = useState(true);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: prefersReducedMotion ? 0 : 0.15,
      });

      tl.to(heroRef.current, {
        opacity: 1,
        duration: prefersReducedMotion ? 0.01 : 1.1,
      })
        .fromTo(
          fgWrapRef.current,
          { scale: 1.08, opacity: 0 },
          { scale: 1, opacity: 1, duration: prefersReducedMotion ? 0.01 : 1.7, ease: "power2.out" },
          0
        )
        .fromTo(
          taglineRef.current,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.8 },
          0.5
        )
        .fromTo(
          nameLineRefs.current,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: prefersReducedMotion ? 0.01 : 1.1,
            stagger: 0.13,
          },
          0.6
        )
        .fromTo(
          subtitleRef.current,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.9 },
          1.05
        )
        .to(controlsRef.current, { opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.7 }, 1.35)
        .to(scrollRef.current, { opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.7 }, 1.5);

      // Scroll-scrubbed 3D exit: the hero tilts back and recedes like a lid
      // closing while the workspace rises over it.
      if (!prefersReducedMotion) {
        // fromTo with an explicit `from` (rather than `to`) so the tween can't
        // capture the entrance fade's in-flight opacity and clobber it, and
        // immediateRender:false so it stays dormant until the user scrolls.
        // The hero must reach opacity 0 — it's fixed, so anything left visible
        // ghosts through the translucent sections below it.
        gsap.fromTo(
          heroRef.current,
          {
            opacity: 1,
            rotateX: 0,
            scale: 1,
            yPercent: 0,
            filter: "blur(0px) brightness(1)",
          },
          {
            opacity: 0,
            rotateX: 12,
            scale: 0.86,
            yPercent: -6,
            filter: "blur(5px) brightness(0.45)",
            ease: "none",
            transformPerspective: 1400,
            transformOrigin: "50% 100%",
            immediateRender: false,
            scrollTrigger: {
              trigger: spacerRef.current,
              start: "top top",
              // Fully gone a little before the spacer ends so nothing bleeds
              // into the first content section.
              end: "bottom 25%",
              scrub: 0.6,
            },
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 4800);
    return () => clearTimeout(timer);
  }, []);

  const togglePlay = () => {
    const fg = fgVideoRef.current;
    const bg = bgVideoRef.current;
    if (!fg || !bg) return;

    if (isPlaying) {
      fg.pause();
      bg.pause();
      setIsPlaying(false);
    } else {
      fg.play().catch(() => {});
      bg.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const fg = fgVideoRef.current;
    if (!fg) return;
    const next = !isMuted;
    fg.muted = next;
    setIsMuted(next);
    if (!next) setHintVisible(false);
  };

  const scrollToNext = () => {
    document
      .getElementById("profile")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const setNameLineRef = (el: HTMLSpanElement | null, index: number) => {
    if (el) nameLineRefs.current[index] = el;
  };

  return (
    <>
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.bgVideoWrap}>
          <video
            ref={bgVideoRef}
            className={styles.bgVideo}
            src={VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        <div className={styles.foregroundVideoWrap} ref={fgWrapRef}>
          <video
            ref={fgVideoRef}
            className={styles.fgVideo}
            src={VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onClick={togglePlay}
          />
        </div>

        <div className={styles.gradientOverlay} />
        <div className={styles.vignette} />

        <CinematicLayer />

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
              Generative AI Systems — engineering production-grade backends at
              the intersection of enterprise software and applied LLMs.
            </p>
          </div>
        </div>

        <div className={styles.controls} ref={controlsRef}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            type="button"
            className={styles.controlBtn}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <MutedIcon /> : <UnmutedIcon />}
            <span
              className={`${styles.soundHint} ${
                !hintVisible ? styles.hintHidden : ""
              }`}
            >
              Tap for sound
            </span>
          </button>
        </div>

        <button
          type="button"
          className={styles.scrollIndicator}
          onClick={scrollToNext}
          ref={scrollRef}
          aria-label="Scroll to next section"
        >
          <span className={styles.scrollLine} aria-hidden="true" />
          <span className={styles.scrollLabel}>Scroll</span>
        </button>
      </section>

      <div className={styles.heroSpacer} ref={spacerRef} aria-hidden="true" />
    </>
  );
}
