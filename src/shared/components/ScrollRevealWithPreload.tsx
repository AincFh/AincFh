"use client";
import { useEffect, useRef, useState } from "react";

interface ScrollRevealWithPreloadProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  preloadDistance?: number; // 提前加载的距离，单位为px
  onPreload?: () => void; // 预加载回调函数
}

export default function ScrollRevealWithPreload({
  children,
  className = "",
  delay = 0,
  direction = "up",
  preloadDistance = 300, // 默认提前300px开始预加载
  onPreload
}: ScrollRevealWithPreloadProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素进入预加载区域时触发预加载
        if (entry.isIntersecting && !isPreloaded) {
          setIsPreloaded(true);
          if (onPreload) {
            onPreload();
          }
        }
      },
      {
        threshold: 0,
        rootMargin: `${preloadDistance}px 0px -50px 0px` // 提前preloadDistance开始加载
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay, preloadDistance, isPreloaded, isVisible, onPreload]);

  const getTransformClass = () => "opacity-100 translate-x-0 translate-y-0";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
}