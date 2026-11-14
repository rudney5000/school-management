import { env } from '@/config/env';

// Origins the EcoLinga desktop app (Tauri) sends its requests from: it serves
// the bundled frontend itself instead of loading the web site. They are always
// allowed, so shipping the desktop app needs no per-environment setting.
export const DESKTOP_ORIGINS = ['tauri://localhost', 'http://tauri.localhost'];

export const allowedOrigins = [...new Set([...env.ALLOWED_ORIGINS, ...DESKTOP_ORIGINS])];
