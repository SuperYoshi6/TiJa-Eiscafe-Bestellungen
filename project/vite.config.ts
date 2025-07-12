import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/TiJa-Eiscafe-Bestellungen/', // <-- GANZ WICHTIG!
  plugins: [react()],
});
