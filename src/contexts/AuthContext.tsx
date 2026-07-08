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
          } else if (parsedUser.role === 'ADMIN') {
            // Se não tem paciente e é ADMIN, cria o paciente padrão nos bastidores
            try {
              const newPatient = await api.post('/api/patients', {
                name: 'Meu paciente',
                userId: parsedUser.id,
                dateOfBirth: '1980-01-01'
              });
              setActivePatient(newPatient);
            } catch (e) {
              console.error('Falha ao auto-criar paciente', e);
            }
          }
        } catch (error) {
          console.error('Falha ao carregar pacientes no AuthContext', error);
        }
      }
      setIsLoading(false);
    }

    loadStoredData();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('@agendaMed:token', token);
    localStorage.setItem('@agendaMed:user', JSON.stringify(userData));
    setUser(userData);
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
