import React from 'react';
import Image from 'next/image';

// 定义模型图标映射
const MODEL_ICONS = {
  'douBao': '/icons/doubao.png',
  'Moonshot AI': '/icons/moonshot.png',
  '智谱 AI': '/icons/zhipu.png',
  // 添加默认图标
  'default': '/icons/ai-default.png'
};

interface ModelIconProps {
  modelName: string;
  size?: number;
  className?: string;
}

const ModelIcon: React.FC<ModelIconProps> = ({ 
  modelName, 
  size = 16,
  className = ''
}) => {
  // 获取图标路径，如果没有对应的图标则使用默认图标
  const iconPath = MODEL_ICONS[modelName] || MODEL_ICONS.default;

  return (
    <div className={`relative inline-block ${className} group`}>
      <Image
        src={iconPath}
        alt={modelName}
        width={size}
        height={size}
        className="rounded-full transition-transform duration-200 group-hover:scale-110"
      />
      <div className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export default ModelIcon; 