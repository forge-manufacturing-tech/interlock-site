import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ControllersAuthService } from '../api/generated';
import { OpenAPI } from '../api/generated/core/OpenAPI';

interface User {
    email: string;
    name: string;
    role?: string;
    pid?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
             const decoded = parseJwt(storedToken);
             return decoded ? {
                 email: decoded.email || '',
                 name: decoded.name || '',
                 role: decoded.role || 'user',
                 pid: decoded.pid || decoded.sub || ''
             } : { email: '', name: '' };
        }
        return null;
    });

    const [isLoading] = useState(false);

    useEffect(() => {
        if (token) {
            OpenAPI.TOKEN = token;
        } else {
            OpenAPI.TOKEN = undefined;
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        const response = await ControllersAuthService.login({ email, password });
        const newToken = response.token;
        const decoded = parseJwt(newToken);

        const newUser = {
            email,
            name: response.name,
            pid: response.pid,
            role: decoded?.role || 'user'
        };

        localStorage.setItem('token', newToken);
        OpenAPI.TOKEN = newToken;

        setUser(newUser);
        setToken(newToken);
    };

    const register = async (email: string, password: string, name: string) => {
        await ControllersAuthService.register({ email, password, name });
        // The new spec implies register does not return a token, so we login.
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        OpenAPI.TOKEN = undefined;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
