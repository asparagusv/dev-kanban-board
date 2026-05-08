import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            darkMode: true,
            toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        }),
        {
            name: 'kanban-dark-mode',
        }
    )
);
