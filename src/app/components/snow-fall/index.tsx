// components/Snowfall.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Snowfall: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // 创建场景、相机和渲染器
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff); // 设置背景为浅蓝色，模拟雪地颜色

        // 创建相机
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // 添加平面作为雪地
        // const planeGeometry = new THREE.PlaneGeometry(5000, 5000);
        // const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // plane.rotation.x = -Math.PI / 2;
        // scene.add(plane);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 200, 100);
        directionalLight.position.multiplyScalar(1.3);
        scene.add(directionalLight);


        // 加载雪花纹理
        const loader = new THREE.TextureLoader();
        const snowflakeTexture = loader.load('./snowflake.png');

        // 创建雪花粒子
        const snowflakes: THREE.Sprite[] = [];
        const snowflakeMaterial = new THREE.SpriteMaterial({
            map: snowflakeTexture,
            color: 0x000000, // 设置雪花颜色为黑色
            transparent: true,
        });

        for (let i = 0; i < 1000; i++) {
            const snowflake = new THREE.Sprite(snowflakeMaterial);
            snowflake.scale.set(0.5, 0.5, 1); // 调整雪花大小
            snowflake.position.set(
                (Math.random() - 0.5) * 100,
                Math.random() * 20 + 5,
                (Math.random() - 0.5) * 100
            );
            (snowflake as any).velocityY = 0.01 + Math.random() * 0.02;
            snowflakes.push(snowflake);
            scene.add(snowflake);
        }

        // 渲染循环
        const animate = () => {
            requestAnimationFrame(animate);

            snowflakes.forEach((snowflake) => {
                snowflake.position.y -= (snowflake as any).velocityY;
                if (snowflake.position.y < 0) {
                    snowflake.position.y = Math.random() * 20 + 5;
                    snowflake.position.x = (Math.random() - 0.5) * 100;
                    snowflake.position.z = (Math.random() - 0.5) * 100;
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        // 窗口缩放处理
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize, false);

        // 清理函数
        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
            }}
        />
    );
};

export default Snowfall;