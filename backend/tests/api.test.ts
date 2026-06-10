import request from 'supertest';
import app from '../src/server';
import { prisma } from '../lib/db';
import * as crypto from 'crypto';

// Use a distinct email for tests to avoid collision if database isn't fully cleared
const testEmail = `testuser_${crypto.randomBytes(4).toString('hex')}@example.com`;
const testPassword = 'SecurePassword123!';
let authToken: string;

describe('API Integration Tests', () => {
  
  beforeAll(async () => {
    // Optional: Clean up existing test user if running against a persistent DB
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'testuser_' } }
    });
  });

  afterAll(async () => {
    // Clean up created user
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
    await prisma.$disconnect();
  });

  describe('Auth Routes', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: testEmail, password: testPassword });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testEmail);
      
      // Extract cookie for future requests
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      authToken = cookies.find((c: string) => c.startsWith('auth_token='))!.split(';')[0];
    });

    it('should not register a duplicate user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: testEmail, password: testPassword });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });

    it('should login the user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'WrongPassword123' });
      
      expect(res.status).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    it('should reject unauthorized access to /api/carbon', async () => {
      const res = await request(app).get('/api/carbon');
      expect(res.status).toBe(401);
    });

    it('should submit a carbon footprint successfully', async () => {
      const res = await request(app)
        .post('/api/carbon')
        .set('Cookie', authToken)
        .send({
          travel: { milesDriven: 100, carMpg: 25, flightsTaken: 0, publicTransitMiles: 20 },
          electricity: { kwhUsed: 500, percentageRenewable: 50 },
          food: { beefMealsPerWeek: 2, chickenMealsPerWeek: 5, veganMealsPerWeek: 14 },
          shopping: { newClothesBought: 1, electronicsBought: 0 }
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.footprint).toHaveProperty('id');
      expect(res.body.footprint.totalCo2eKg).toBeGreaterThan(0);
    });

    it('should get user footprint history', async () => {
      const res = await request(app)
        .get('/api/carbon')
        .set('Cookie', authToken);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThan(0);
    });
  });
});
