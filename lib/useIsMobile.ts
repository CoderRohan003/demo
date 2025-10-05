// useIsMobile.ts
'use client';

import { useState, useEffect } from 'react';

const mobileBreakpoint = 768; // You can adjust this value as needed

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= mobileBreakpoint);
        };

        // Set initial state
        checkIsMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIsMobile);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
};