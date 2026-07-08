import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

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
  login: (token: string, user: User) => void;
  logout: () => void;
  setActivePatient: (patient: Patient | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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
      }
      setIsLoading(false);
    }

    loadStoredData();
  }, []);

  const login = async (token: string, userData: User) => {
    localStorage.setItem('@agendaMed:token', token);
    localStorage.setItem('@agendaMed:user', JSON.stringify(userData));
    setUser(userData);

    // Busca o paciente assim que loga (para não ter que dar F5)
    try {
      const patients = await api.get(`/api/users/${userData.id}/patients`);
      if (patients && patients.length > 0) {
        setActivePatient(patients[0]);
      } else {
        console.warn('Nenhum paciente encontrado para o usuário no login.');
      }
    } catch (err) {
      console.error('Erro ao buscar pacientes no login:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('@agendaMed:token');
    localStorage.removeItem('@agendaMed:user');
    setUser(null);
    setActivePatient(null);
  };

  return (
    <AuthContext.Provider value={{ user, activePatient, isAuthenticated: !!user, login, logout, setActivePatient, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
