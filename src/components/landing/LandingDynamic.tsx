'use client';

import dynamic from 'next/dynamic';

export const Hero3D = dynamic(() => import('@/components/landing/Hero3D'), { ssr: false });
export const LiveStats = dynamic(() => import('@/components/landing/LiveStats'), { ssr: false });
