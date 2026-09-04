import { createContext, useContext, type ReactNode } from 'react';

/**
 * Sesión del cliente B2B.
 *
 * En la fase 1 no hay autenticación: el proveedor devuelve siempre una sesión
 * anónima. Existe igual para que los puntos donde el portal va a bifurcar
 * —precio, disponibilidad, recompra— se escriban una sola vez y ahora, en
 * lugar de tener que buscarlos después.
 *
 * La fase 2 reemplaza el cuerpo de este archivo. Sus consumidores no cambian.
 */
export interface Account {
  id: string;
  razonSocial: string;
  nit: string;
}

export interface AuthState {
  account: Account | null;
  isAuthenticated: boolean;
}

const ANONYMOUS: AuthState = { account: null, isAuthenticated: false };

const AuthContext = createContext<AuthState>(ANONYMOUS);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={ANONYMOUS}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
