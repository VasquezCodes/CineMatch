'use client';

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

// Definimos el tipo para la data del contexto
type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
};

// Creamos el contexto
const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    refreshUser: async () => { },
});

// Hook para usar el contexto facilmente
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto que envolvera la app
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createBrowserClient();

    const refreshUser = async () => {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
            console.error('Error refreshing session:', error);
            return;
        }
        setSession(session);
        setUser(session?.user ?? null);
    };

    useEffect(() => {
        // 1. Obtener sesión inicial
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error al obtener sesion:', error);
            } finally {
                setIsLoading(false);
            }
        };

        getInitialSession();

        // 2. Escuchar cambios en la autenticación (login, logout, etc)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Limpiar suscripción al desmontar
        return () => subscription.unsubscribe();
    }, [supabase]);

    const value = {
        session,
        user,
        isLoading,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
