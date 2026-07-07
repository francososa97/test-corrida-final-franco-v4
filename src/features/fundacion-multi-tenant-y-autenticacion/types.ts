// =============================================================================
// E1-T1: Tipos del dominio multi-tenant.
//
// Nota: se esperaba reusar src/shared/types/index.ts pero ese modulo no existe
// aun en el repo, por lo que los tipos base se declaran aca. Cuando exista el
// modulo compartido, mover OrganizationId / TenantScoped hacia alla y re-exportar.
// =============================================================================

/** UUID de una organizacion (tenant). Marca nominal para evitar mezclar ids. */
export type OrganizationId = string & { readonly __brand: 'OrganizationId' };

/** Construye un OrganizationId validando que sea un UUID no vacio. */
export function toOrganizationId(value: string): OrganizationId {
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(value)) {
    throw new TenantContextError(`organizationId invalido: ${value}`);
  }
  return value as OrganizationId;
}

/** Toda entidad de negocio pertenece a exactamente una organizacion. */
export interface TenantScoped {
  readonly id: string;
  readonly organization_id: OrganizationId;
}

export interface Organization {
  readonly id: OrganizationId;
  readonly name: string;
  readonly created_at: Date;
}

export interface User extends TenantScoped {
  readonly email: string;
  readonly created_at: Date;
}

export interface Project extends TenantScoped {
  readonly name: string;
  readonly created_at: Date;
}

/** Error de contexto de tenant (org faltante, invalida o fuera de scope). */
export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantContextError';
  }
}
