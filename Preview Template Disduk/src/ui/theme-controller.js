/**
 * Theme Controller Module (Phase 3.5 — Consistent Theme Engine)
 * Controls Light Mode ☀, Dark Mode 🌙, and System Preference 💻 theme switching.
 * Dynamically updates document root class and manages localStorage persistence.
 */

export class ThemeController {
    constructor(options = {}) {
        this.storageKey = 'disduk_app_theme';
        this.onChange = options.onChange || (() => {});
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Load stored theme or default to 'system'
        this.theme = localStorage.getItem(this.storageKey) || 'system';

        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', () => {
            if (this.theme === 'system') {
                this.applyTheme();
            }
        });

        this.init();
    }

    init() {
        this.attachHeaderEvents();
        this.applyTheme();
    }

    getEffectiveTheme() {
        if (this.theme === 'system') {
            return this.mediaQuery.matches ? 'dark' : 'light';
        }
        return this.theme;
    }

    setTheme(newTheme) {
        if (!['light', 'dark', 'system'].includes(newTheme)) return;
        this.theme = newTheme;
        localStorage.setItem(this.storageKey, newTheme);
        this.applyTheme();
        this.onChange(this.theme, this.getEffectiveTheme());
    }

    attachHeaderEvents() {
        const btnLight = document.querySelector('#btn-theme-light');
        const btnDark = document.querySelector('#btn-theme-dark');
        const btnSystem = document.querySelector('#btn-theme-system');

        if (btnLight) btnLight.addEventListener('click', () => this.setTheme('light'));
        if (btnDark) btnDark.addEventListener('click', () => this.setTheme('dark'));
        if (btnSystem) btnSystem.addEventListener('click', () => this.setTheme('system'));
    }

    updateHeaderButtons() {
        const btnLight = document.querySelector('#btn-theme-light');
        const btnDark = document.querySelector('#btn-theme-dark');
        const btnSystem = document.querySelector('#btn-theme-system');

        if (!btnLight || !btnDark || !btnSystem) return;

        const activeClassLight = 'bg-amber-500 text-white shadow-sm font-bold';
        const activeClassDark = 'bg-indigo-600 text-white shadow-sm font-bold';
        const activeClassSystem = 'bg-emerald-600 text-white shadow-sm font-bold';
        const inactiveClass = 'bg-transparent text-slate-400 hover:text-slate-200 font-semibold';

        btnLight.className = `px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] ${this.theme === 'light' ? activeClassLight : inactiveClass}`;
        btnDark.className = `px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] ${this.theme === 'dark' ? activeClassDark : inactiveClass}`;
        btnSystem.className = `px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] ${this.theme === 'system' ? activeClassSystem : inactiveClass}`;
    }

    applyTheme() {
        const effective = this.getEffectiveTheme();
        const root = document.documentElement;

        if (effective === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        this.updateHeaderButtons();
    }
}
