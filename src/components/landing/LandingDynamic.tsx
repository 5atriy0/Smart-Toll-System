'use client';

import dynamic from 'next/dynamic';

export const Hero3D = dynamic(() => import('@/components/landing/Hero3D').then(m => m.Hero3D), { ssr: false });
export const LiveStats = dynamic(() => import('@/components/landing/LiveStats').then(m => m.LiveStats), { ssr: false });
