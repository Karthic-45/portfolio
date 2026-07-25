import VideoIntro from "@/components/VideoIntro/VideoIntro";
import Workspace from "@/components/Workspace/Workspace";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <VideoIntro />
      <div className={styles.content}>
        <Workspace />
      </div>
    </main>
  );
}
