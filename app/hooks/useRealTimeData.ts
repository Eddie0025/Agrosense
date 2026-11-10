import { useState, useEffect, useRef } from "react";

interface RealTimeDataOptions<T> {
    key: string;
    fetcher: () => Promise<T>;
    refreshInterval?: number; // ms
}

export function useRealTimeData<T>({ key, fetcher, refreshInterval = 300000 }: RealTimeDataOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    // Use a ref to store the latest fetcher to avoid useEffect loops
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    useEffect(() => {
        // Load cached data first
        const cached = localStorage.getItem(`agrosense_cache_${key}`);
        if (cached) {
            try {
                setData(JSON.parse(cached));
                setLoading(false);
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOffline(!navigator.onLine);

        const updateData = async () => {
            try {
                if (!navigator.onLine) return;

                const result = await fetcherRef.current();
                setData(result);
                localStorage.setItem(`agrosense_cache_${key}`, JSON.stringify(result));
                setError(null);
            } catch (err) {
                console.error(`Error fetching real-time data for ${key}:`, err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        updateData();

        const interval = setInterval(updateData, refreshInterval);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [key, refreshInterval]); // Removed fetcher from dependencies

    return { data, loading, error, isOffline };
}
