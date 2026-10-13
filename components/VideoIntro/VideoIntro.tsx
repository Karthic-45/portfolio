"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./VideoIntro.module.css";

const VIDEO_SRC = "/videos/hero-video.mp4";

/* ---------- SVG Icons ---------- */

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg} aria-hidden="true">
      <path d="M7 4.5v15l13-7.5-13-7.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg} aria-hidden="true">
      <rect x="6" y="4.5" width="4" height="15" rx="1.5" fill="currentColor" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg} aria-hidden="true">
      <path
        d="M3.5 9v6h4l5.5 5V4L7.5 9H3.5z"
        fill="currentColor"
      />
      <path
        d="M16.5 9l5 6m0-6l-5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg} aria-hidden="true">
      <path d="M3.5 9v6h4l5.5 5V4L7.5 9H3.5z" fill="currentColor" />
      <path
        d="M16 8.5a4.5 4.5 0 010 7M19 6a8.5 8.5 0 010 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function VolumeDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvgSmall} aria-hidden="true">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function VolumeUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvgSmall} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function VideoIntro() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const nameLineRefs = useRef<HTMLSpanElement[]>([]);

  // Media state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hintVisible, setHintVisible] = useState(true);

  // Apply volume and mute directly to video element
  const updateVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    setVolume(clamped);

    const video = videoRef.current;
    if (!video) return;

    video.volume = clamped;

    if (clamped === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
      setHintVisible(false);
    }
  }, []);

  // Unmute audio helper
  const unmuteAudio = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const targetVol = volume > 0 ? volume : 1;
    video.volume = targetVol;
    video.muted = false;
    setVolume(targetVol);
    setIsMuted(false);
    setHintVisible(false);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If browser policy requires user gesture, temporarily mute
          video.muted = true;
          setIsMuted(true);
        });
    }
  }, [volume]);

  // Toggle mute / unmute
  const toggleMute = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (isMuted) {
        unmuteAudio();
      } else {
        video.muted = true;
        setIsMuted(true);
      }
    },
    [isMuted, unmuteAudio]
  );

  // Toggle play / pause
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle range slider input
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const val = parseFloat(e.target.value);
      updateVolume(val);
    },
    [updateVolume]
  );

  // Volume step adjustments
  const handleVolumeStepDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateVolume(volume - 0.1);
    },
    [volume, updateVolume]
  );

  const handleVolumeStepUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateVolume(volume + 0.1);
    },
    [volume, updateVolume]
  );

  // Cycle volume preset on badge click
  const handleCycleVolume = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isMuted || volume === 0) {
        updateVolume(1);
      } else if (volume > 0.7) {
        updateVolume(0.5);
      } else if (volume > 0.3) {
        updateVolume(0.2);
      } else {
        updateVolume(1);
      }
    },
    [isMuted, volume, updateVolume]
  );

  // Unmute when clicking on hero section if muted
  const handleHeroClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.controls}`)) {
        return;
      }
      if (isMuted) {
        unmuteAudio();
      }
    },
    [isMuted, unmuteAudio]
  );

  // Autoplay attempt on mount + keyboard shortcuts
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = 1;
      video.muted = false;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(false);
            setHintVisible(false);
          })
          .catch(() => {
            // If browser policy blocks unmuted autoplay without gesture
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});

            // Auto-unmute on first user gesture anywhere on window
            const handleFirstGesture = () => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = 1;
                videoRef.current.play().catch(() => {});
              }
              setIsMuted(false);
              setHintVisible(false);
              cleanupGestureListeners();
            };

            const cleanupGestureListeners = () => {
              window.removeEventListener("click", handleFirstGesture);
              window.removeEventListener("touchstart", handleFirstGesture);
              window.removeEventListener("keydown", handleFirstGesture);
              window.removeEventListener("pointerdown", handleFirstGesture);
            };

            window.addEventListener("click", handleFirstGesture, { once: true });
            window.addEventListener("touchstart", handleFirstGesture, { once: true });
            window.addEventListener("keydown", handleFirstGesture, { once: true });
            window.addEventListener("pointerdown", handleFirstGesture, { once: true });
          });
      }
    }

    // Auto-fade tooltip after 6s
    const timer = setTimeout(() => {
      setHintVisible(false);
    }, 6000);

    // Keyboard shortcuts: M = mute/unmute, Space = play/pause, Up/Down = volume
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea") return;

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        updateVolume(volume + 0.1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateVolume(volume - 0.1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // GSAP entrance animation
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
        )
        .fromTo(
          controlsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.8 },
          1.15
        );
    }, heroRef);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      ctx.revert();
    };
  }, [toggleMute, togglePlay, updateVolume, volume]);

  const setNameLineRef = (el: HTMLSpanElement | null, index: number) => {
    if (el) nameLineRefs.current[index] = el;
  };

  return (
    <section
      className={styles.hero}
      ref={heroRef}
      aria-label="Portfolio Intro"
      onClick={handleHeroClick}
    >
      {/* High-performance video background with audio track */}
      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={VIDEO_SRC}
          autoPlay
          loop
          playsInline
          preload="auto"
          muted={isMuted}
          aria-hidden="true"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
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

      {/* Audio & Media Controls Glassmorphism Dock */}
      <div
        className={styles.controls}
        ref={controlsRef}
        data-cursor-hover
      >
        {/* Pulsing Hint Pill when muted */}
        {isMuted && (
          <button
            type="button"
            className={`${styles.soundHint} ${
              !hintVisible ? styles.hintHidden : ""
            }`}
            onClick={toggleMute}
            aria-label="Click to unmute video audio"
            data-cursor-hover
          >
            <span className={styles.soundHintPulse} aria-hidden="true" />
            <span className={styles.soundHintIcon}>🔊</span>
            <span className={styles.soundHintText}>Sound is muted &middot; Tap to hear</span>
          </button>
        )}

        <div className={styles.controlsBar}>
          {/* Play/Pause Button */}
          <button
            type="button"
            className={styles.controlBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            data-cursor-hover
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Sound / Mute Toggle Button */}
          <button
            type="button"
            className={`${styles.controlBtn} ${styles.soundBtn} ${
              !isMuted ? styles.soundBtnActive : ""
            }`}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video audio" : "Mute video audio"}
            title={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}
            data-cursor-hover
          >
            {isMuted ? <MutedIcon /> : <UnmutedIcon />}

            {/* Live animated Equalizer Soundwaves when audio is playing */}
            {!isMuted && isPlaying && (
              <span className={styles.equalizer} aria-hidden="true">
                <span className={styles.equalizerBar} />
                <span className={styles.equalizerBar} />
                <span className={styles.equalizerBar} />
                <span className={styles.equalizerBar} />
              </span>
            )}
          </button>

          {/* Volume Step Down Button (-) */}
          <button
            type="button"
            className={`${styles.controlBtnSmall}`}
            onClick={handleVolumeStepDown}
            aria-label="Decrease volume"
            title="Volume down (Arrow Down)"
            disabled={volume <= 0}
            data-cursor-hover
          >
            <VolumeDownIcon />
          </button>

          {/* Always-visible, easy-to-grab Volume Slider */}
          <div className={styles.volumeContainer}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleSliderChange}
              className={styles.volumeSlider}
              aria-label="Volume level slider"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              data-cursor-hover
            />
          </div>

          {/* Volume Step Up Button (+) */}
          <button
            type="button"
            className={`${styles.controlBtnSmall}`}
            onClick={handleVolumeStepUp}
            aria-label="Increase volume"
            title="Volume up (Arrow Up)"
            disabled={volume >= 1}
            data-cursor-hover
          >
            <VolumeUpIcon />
          </button>

          {/* Interactive Volume Percentage Badge (click to cycle 100% -> 50% -> 20%) */}
          <button
            type="button"
            className={styles.volumeLabelBtn}
            onClick={handleCycleVolume}
            title="Click to cycle volume preset"
            aria-label={`Current volume: ${isMuted ? "Muted" : Math.round(volume * 100) + "%"}. Click to cycle.`}
            data-cursor-hover
          >
            {isMuted ? "MUTE" : `${Math.round(volume * 100)}%`}
          </button>
        </div>
      </div>
    </section>
  );
}
