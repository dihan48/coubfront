import styles from "../styles/admin.module.css";

export default function Page() {
  return (
    <div className={styles.container}>
      <input type="file" />
      <button>Fetch</button>
    </div>
  );
}
