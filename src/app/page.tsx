'use client';

import {useSpring, animated} from '@react-spring/web';
import FullScreenLayout from "@/app/components/full-screen-layout";
import LoadingPage from "@/app/components/loading-page";
import AIPage from "@/app/components/ai";
import "@arco-design/web-react/dist/css/arco.css";
import "./globals.css";

export default function Home() {
  return (
    <FullScreenLayout>
      <AIPage/>
    </FullScreenLayout>
  );
}
