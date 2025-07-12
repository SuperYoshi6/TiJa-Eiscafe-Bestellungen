import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dein GitHub Pages Pfad hier ↓
export default defineConfig({
  base: '/TiJa-Eiscafe-Bestellungen/',
  plugins: [react()],
});
