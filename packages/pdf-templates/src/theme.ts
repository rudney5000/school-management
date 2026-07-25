import { Font } from '@react-pdf/renderer';
import path from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Font.register({
    family: 'NotoSans',
    fonts: [
        { src: path.join(__dirname, 'fonts/NotoSans-Regular.ttf'), fontWeight: 'normal' },
        { src: path.join(__dirname, 'fonts/NotoSans-Bold.ttf'), fontWeight: 'bold' },
    ],
});

export const theme = {
    colors: {
        primary: '#1e3a5f',
        primaryLight: '#2d5586',
        accent: '#c9a227',
        text: '#1a1a1a',
        muted: '#6b7280',
        border: '#e5e7eb',
        rowAlt: '#f8f9fb',
        watermark: '#1e3a5f',
    },
    font: 'NotoSans',
};