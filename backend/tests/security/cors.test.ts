import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app';

const app = createApp();

describe('CORS', () => {
  it.each(['tauri://localhost', 'http://tauri.localhost'])(
    'allows the desktop app origin %s without any setting',
    async (origin) => {
      const response = await request(app).get('/health').set('Origin', origin).expect(200);

      expect(response.headers['access-control-allow-origin']).toBe(origin);
    },
  );

  it('allows a preflight from the desktop app', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://tauri.localhost')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,authorization')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('http://tauri.localhost');
  });

  it('still allows the configured web origins', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('does not allow an unknown origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://evil.example')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
