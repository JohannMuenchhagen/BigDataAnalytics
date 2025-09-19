import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: true, // Macht den Server im Netzwerk erreichbar (ersetzt --host)
        https: true // Aktiviert HTTPS (ersetzt --https)
    },
    plugins: [
        mkcert() // Nutzt das Plugin für die automatische Zertifikat-Erstellung
    ]
});