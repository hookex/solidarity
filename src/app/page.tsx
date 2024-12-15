'use client';

import FullScreenLayout from "@/app/components/FullScreenLayout/FullScreenLayout";
import AIPage from "@/app/components/AIPage/AIPage";
import "@arco-design/web-react/dist/css/arco.css";
import "./globals.css";

export default function Home() {
  return (
    <FullScreenLayout>
      <AIPage/>
    </FullScreenLayout>
  );
}
