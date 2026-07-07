import { Router, type Request, type Response } from 'express';
import { type AuthService } from './service';
import {
  type LoginRequest,
  type SignupRequest,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from './types';

/**
 * Rutas HTTP de autenticación (E1-T2).
 *  - POST /auth/signup
 *  - POST /auth/login  -> credenciales válidas: token + 200; inválidas: 401
 */
export function createAuthRouter(service: AuthService): Router {
  const router = Router();

  router.post('/auth/signup', async (req: Request, res: Response): Promise<void> => {
    const body = parseSignup(req.body);
    if (!body) {
      res.status(400).json({ error: 'email, password and tenantSlug are required' });
      return;
    }
    try {
      const result = await service.signup(body);
      res.status(201).json(result);
    } catch (err) {
      handleAuthError(err, res);
    }
  });

  router.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
    const body = parseLogin(req.body);
    if (!body) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    try {
      const result = await service.login(body);
      res.status(200).json(result);
    } catch (err) {
      handleAuthError(err, res);
    }
  });

  return router;
}

function parseLogin(body: unknown): LoginRequest | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.email !== 'string' || typeof b.password !== 'string') return null;
  return {
    email: b.email,
    password: b.password,
    tenantSlug: typeof b.tenantSlug === 'string' ? b.tenantSlug : undefined,
  };
}

function parseSignup(body: unknown): SignupRequest | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.email !== 'string' ||
    typeof b.password !== 'string' ||
    typeof b.tenantSlug !== 'string'
  ) {
    return null;
  }
  return { email: b.email, password: b.password, tenantSlug: b.tenantSlug };
}

function handleAuthError(err: unknown, res: Response): void {
  if (err instanceof InvalidCredentialsError) {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err instanceof EmailAlreadyExistsError) {
    res.status(409).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
