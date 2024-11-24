// components/FullScreenLayout.js
import styles from './index.module.css';

export default function FullScreenLayout({ children }) {
    return <div className={styles.container}>{children}</div>;
}