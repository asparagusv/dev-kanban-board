import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, isValid?: (value: unknown) => value is T) {
    const [value, setValue] = useState<T>(() => {
        const stored = localStorage.getItem(key);

        if (!stored) return initialValue;

        try {
            const parsed = JSON.parse(stored);

            if (isValid && !isValid(parsed)) {
                return initialValue;
            }

            return parsed as T;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}