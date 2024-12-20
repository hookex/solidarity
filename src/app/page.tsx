'use client';

import Image from "next/image";
import {useEffect, useState} from "react";
import {useSpring, animated} from '@react-spring/web';
import {useAsync} from 'react-use';
import { useDebounce } from 'use-debounce';

import FullScreenLayout from "@/app/components/FullScreenLayout/FullScreenLayout";
import AIPage from "@/app/components/AIPage/AIPage";
import browserClient  from '@apmplus/web'// 配置参数

browserClient('init', {
 aid: 683462, // 应用唯一标识，必填参数
 token:'d3c03edc80dc458a8e6824b451dbb387' // 应用 token,必填参数
})
// 开启上报
browserClient('start')

type Data = { message: string };

const fetchData = async (): Promise<Data> => {
    const response = await fetch('/api/hello');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export default function Home() {
  return (
    <FullScreenLayout>
      <AIPage/>
    </FullScreenLayout>
  );
}
