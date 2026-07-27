import VideoIntro from "@/components/VideoIntro/VideoIntro";
import SystemPortfolio from "@/components/system/SystemPortfolio";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <a className="skipLink" href="#main">
        Skip to content
      </a>
      {/* VideoIntro is intentionally left untouched. */}
      <VideoIntro />
      <div className={styles.system}>
        <SystemPortfolio />
      </div>
    </>
  );
}
