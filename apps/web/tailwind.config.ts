import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--canvas-default)',
          subtle: 'var(--canvas-subtle)',
          inset: 'var(--canvas-inset)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          muted: 'var(--border-muted)',
          strong: 'var(--border-strong)',
        },
        fg: {
          DEFAULT: 'var(--fg-default)',
          muted: 'var(--fg-muted)',
          subtle: 'var(--fg-subtle)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
        },
        success: 'var(--success)',
        attention: 'var(--attention)',
        danger: 'var(--danger)',
        done: 'var(--done)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
      maxWidth: {
        public: '1120px',
        content: '1200px',
        prose: '68ch',
        chat: '62ch',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      fontSize: {
        label: ['12px', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};

export default config;
