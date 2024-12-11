'use client';

import React from "react";
import styles from "./index.module.css";

interface LoaderProps {
  color?: string; // 支持自定义颜色
}

const Loader: React.FC<LoaderProps> = ({ color }) => {
  return (
    <div
      className={styles.loader}
      style={{ '--loader-color': color } as React.CSSProperties} // 动态设置颜色
    ></div>
  );
};

export default Loader;
