'use client';

import React from "react";
import styles from "./index.module.css";

const LoadingPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>Pixel Behind</h1>
                <p className={styles.description}>
                    The pixels drift, like whispers in the wind, <br />
                    Flicker and fade, like memories within. <br />
                    In the haze of a screen, I see you shine, <br />
                    But you&#39;re just a shadow, lost in time.
                </p>
            </div>
        </div>
    );
};

export default LoadingPage;