'use client';

import Image from "next/image";
import {useEffect, useState} from "react";
import {useSpring, animated} from '@react-spring/web';
import {useAsync} from 'react-use';
import { useDebounce } from 'use-debounce';

import FullScreenLayout from "@/app/components/full-screen-layout";
import Snowfall from "@/app/components/snow-fall";
import LoadingPage from "@/app/components/loading-page";
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
    const { loading, error, value } = useAsync<any>(fetchData, []);

    // 使用 useDebounce 控制 loading 最小持续时间为 1 秒
    const [debouncedLoading] = useDebounce(loading, 100000);

    const styles = useSpring({
        from: {opacity: 0},
        to: {opacity: 1},
        config: {duration: 1000}, // 动画持续时间为 1000 毫秒
    });


    if (debouncedLoading) {
        return <LoadingPage/>;  // 显示加载状态
    }

    if (error) {
        return <div>Error: {error.message}</div>;  // 显示错误信息
    }

    return (
        <FullScreenLayout>
            <Snowfall/>
            <h1 style={{fontSize: '88px'}}>
                <animated.div style={styles}>
                    <div>{value.message}</div>
                </animated.div>
            </h1>
        </FullScreenLayout>
    );
}
