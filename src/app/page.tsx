'use client';

import Image from "next/image";
import {useEffect, useState} from "react";
import {useSpring, animated} from '@react-spring/web';
import FullScreenLayout from "@/app/components/full-screen-layout";
import Snowfall from "@/app/components/snow-fall";

export default function Home() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/hello');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('data.message', data.message)
                setMessage(data.message);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const styles = useSpring({
        from: {opacity: 0},
        to: {opacity: 1},
        config: {duration: 1000}, // 动画持续时间为 1000 毫秒
    });


    return (
        <FullScreenLayout>
            <Snowfall/>
            <h1 style={{fontSize: '88px'}}>Hello
                <animated.div style={styles}>
                    <div>Hooke!</div>
                </animated.div>
            </h1>
        </FullScreenLayout>
    );
}
