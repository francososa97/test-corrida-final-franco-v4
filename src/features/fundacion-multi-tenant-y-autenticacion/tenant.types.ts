import type { Request, Response, NextFunction } from 'express';

/**
 * Claims esperados dentro de un JWT ya verificado por el middleware de
 * autenticacion previo. `organization_id` es opcional a nivel de tipo porque
 * un token valido puede no incluirlo; justamente ese caso es el que el guard
 * de tenant debe rechazar.
 */
export interface AuthenticatedJwtClaims {
  readonly sub: string;
  readonly organization_id?: string;
  readonly [claim: string]: unknown;
}

/**
 * Contexto de tenant resuelto e inyectado en el request para que los handlers
 * y las queries downstream lo consuman de forma tipada.
 */
export interface TenantContext {
  readonly organizationId: string;
}

/**
 * Request de Express extendido con la informacion que colocan los middlewares
 * de autenticacion (`auth`) y de resolucion de tenant (`tenant`).
 */
export interface TenantAwareRequest extends Request {
  auth?: AuthenticatedJwtClaims;
  tenant?: TenantContext;
}

/**
 * Firma estandar de un middleware de Express fuertemente tipado sobre
 * `TenantAwareRequest`.
 */
export type TenantMiddleware = (
  req: TenantAwareRequest,
  res: Response,
  next: NextFunction,
) => void;

/**
 * Codigo de error estable devuelto en el body de las respuestas 403 para que
 * el cliente pueda diferenciar la causa programaticamente.
 */
export enum TenantResolutionError {
  MISSING_AUTH = 'MISSING_AUTH',
  MISSING_ORGANIZATION = 'MISSING_ORGANIZATION',
  ORGANIZATION_MISMATCH = 'ORGANIZATION_MISMATCH',
}

export interface TenantResolutionErrorBody {
  readonly error: TenantResolutionError;
  readonly message: string;
}
