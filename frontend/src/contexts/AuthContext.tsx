import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import { subscribeToPushNotifications } from '../services/push';

interface User {
  id: string;
  name: string | null;
  phoneWhats: string;
  email: string | null;
  role: string;
}

interface Patient {
  id: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  activePatient: Patient | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { name: string, email: string, phoneWhats: string, password?: string }) => Promise<void>;
  logout: () => void;
  setActivePatient: (patient: Patient | null) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      const storedToken = localStorage.getItem('@agendaMed:token');
      const storedUser = localStorage.getItem('@agendaMed:user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));

        // Tenta carregar o primeiro paciente automaticamente
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Silently refresh user profile to catch Role (Admin) promotions
          api.get(`/api/users/${parsedUser.id}`).then((updatedUser: any) => {
            if (updatedUser && updatedUser.id) {
              const u: User = { 
                id: updatedUser.id, 
                name: updatedUser.name, 
                phoneWhats: updatedUser.phoneWhats, 
                email: updatedUser.email, 
                role: updatedUser.role 
              };
              setUser(u);
              localStorage.setItem('@agendaMed:user', JSON.stringify(u));
            }
          }).catch(console.error);

          const patients = await api.get(`/api/users/${parsedUser.id}/patients`);
          if (patients && patients.length > 0) {
            setActivePatient(patients[0]);
          } else {
            // Se o usuário não tem paciente, ele foi deletado do banco (ex: reset do DB)
            // Mas o token ficou salvo no navegador
            console.warn('Nenhum paciente encontrado para este usuário. Deslogando...');
            localStorage.removeItem('@agendaMed:token');
            localStorage.removeItem('@agendaMed:user');
            setUser(null);
          }
        } catch (error) {
          console.error('Falha ao carregar pacientes no AuthContext', error);
          // Auto-desloga se houver erro (usuário inválido)
          localStorage.removeItem('@agendaMed:token');
          localStorage.removeItem('@agendaMed:user');
          setUser(null);
        }

        // Tenta registrar no push se o usuário estiver válido
        if (localStorage.getItem('@agendaMed:token')) {
          subscribeToPushNotifications();
        }
      }
      setIsLoading(false);
    }

    loadStoredData();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('@agendaMed:token', response.accessToken);
      localStorage.setItem('@agendaMed:user', JSON.stringify(response.user));
      setUser(response.user);

      // Busca o paciente assim que loga
      const patients = await api.get(`/api/patients`);
      if (patients && patients.length > 0) {
        setActivePatient(patients[0]);
      } else {
        console.warn('Nenhum paciente encontrado para o usuário no login.');
        setActivePatient(null);
      }

      subscribeToPushNotifications();
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (data: { name: string, email: string, phoneWhats: string, password?: string }) => {
    try {
      const response = await api.post('/api/auth/register', data);
      
      localStorage.setItem('@agendaMed:token', response.accessToken);
      localStorage.setItem('@agendaMed:user', JSON.stringify(response.user));
      setUser(response.user);
      
      // Como a conta acabou de ser criada, sabemos que não tem paciente
      setActivePatient(null);

      subscribeToPushNotifications();
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('@agendaMed:token');
    localStorage.removeItem('@agendaMed:user');
    setUser(null);
    setActivePatient(null);
  };

  return (
    <AuthContext.Provider value={{ user, activePatient, isAuthenticated: !!user, login, register, logout, setActivePatient, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
