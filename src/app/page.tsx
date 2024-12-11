'use client';

import {useSpring, animated} from '@react-spring/web';
import {useAsync} from 'react-use';
import {useDebounce} from 'use-debounce';

import FullScreenLayout from "@/app/components/full-screen-layout";
import LoadingPage from "@/app/components/loading-page";
import AIPage from "@/app/components/ai";
import "@arco-design/web-react/dist/css/arco.css";

type Data = { message: string };

const fetchData = async (): Promise<Data> => {
  const response = await fetch('/api/hello');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export default function Home() {
  const {loading, error, value} = useAsync<any>(fetchData, []);

  // 使用 useDebounce 控制 loading 最小持续时间为 1 秒
  const [debouncedLoading] = useDebounce(loading, 1000);

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
      <AIPage/>
    </FullScreenLayout>
  );
}
