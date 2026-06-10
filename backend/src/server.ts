import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from '../lib/db';
import { hashPassword, signToken, verifyPassword, verifyToken } from '../lib/security/auth';
import { registerSchema, loginSchema } from '../lib/validators/auth';
import { rateLimit } from '../lib/security/rate-limit';
import { carbonInputSchema } from '../lib/validators/carbon';
import { CarbonService } from '../services/carbonService';
import { AIService } from '../services/aiService';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Setup Routes
const apiRouter = express.Router();

// Auth Routes
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const ip = req.ip || "unknown";
    const rl = rateLimit(`register_${ip}`, 5, 3600000); 
    if (!rl.success) {
      return res.status(429).json({ error: "Too many registration attempts" });
    }

    const validatedData = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
      },
    });

    const token = await signToken({ userId: user.id, email: user.email });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // For cross-domain
      path: "/",
      maxAge: 60 * 60 * 24 * 1000, 
    });

    res.status(201).json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const ip = req.ip || "unknown";
    const rl = rateLimit(`login_${ip}`, 10, 300000); 
    if (!rl.success) {
      return res.status(429).json({ error: "Too many login attempts" });
    }

    const validatedData = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = await signToken({ userId: user.id, email: user.email });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000, 
    });

    res.status(200).json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Middleware for protected routes
const requireAuth = async (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = await verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

apiRouter.post('/carbon', requireAuth, async (req: any, res: any) => {
  try {
    const ip = req.ip || "unknown";
    const rl = rateLimit(`carbon_post_${ip}`, 20, 60000); 
    if (!rl.success) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const validatedData = carbonInputSchema.parse(req.body);
    const footprint = await CarbonService.submitFootprint(req.userId, validatedData);

    res.status(201).json({ success: true, footprint });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

apiRouter.get('/carbon', requireAuth, async (req: any, res: any) => {
  try {
    const history = await CarbonService.getUserHistory(req.userId);
    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const coachRequestSchema = z.object({ footprintId: z.string().uuid() });

apiRouter.post('/ai-coach', requireAuth, async (req: any, res: any) => {
  try {
    const validatedData = coachRequestSchema.parse(req.body);
    const recommendation = await AIService.getRecommendations(req.userId, validatedData.footprintId);

    res.status(200).json({ success: true, recommendation });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message && error.message.includes("Rate limit")) {
      return res.status(429).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
