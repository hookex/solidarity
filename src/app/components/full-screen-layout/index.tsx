// components/FullScreenLayout.js
import styles from './index.module.css';
import {ReactNode} from "react";

interface FullScreenLayoutProps {
    children: ReactNode;
}

export default function FullScreenLayout({ children }: FullScreenLayoutProps) {
    return <div className={styles.container}>{children}</div>;
}