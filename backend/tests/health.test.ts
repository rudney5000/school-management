import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app';

const app = createApp();

describe('GET /health', () => {
  it('reports the test environment', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok', env: 'test' });
  });
});
