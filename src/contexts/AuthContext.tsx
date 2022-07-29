import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { setupAPIClient } from "../pages/services/api";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../pages/services/apiClient";

type SignInCredentials = {
  email: string,
  password: string,
}

type AuthContextData = {
  signIn: (credentials: SignInCredentials)=> Promise<void>;
  signOut: () => void;
  user: User
  isAuthenticated: boolean;
}

type AuthProviderProps = {
  children: ReactNode;
}

type User = {
  email: string;
  permissions: string[];
  roles: string[];
  name: string;
}

export const AuthContext = createContext({} as AuthContextData);

let authChannel : BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'IgAuth.token');
  destroyCookie(undefined, 'IgAuth.refreshToken');

  authChannel.postMessage('signOut');

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()

  const isAuthenticated = !!user;
  

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = (message) => {
      switch (message.data){
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    }

  },[])

  useEffect(() => {
    const { 'IgAuth.token': token } = parseCookies()

    if (token) {
      api.get('/me').then((response => {
        console.log(response)
        const { email, permissions, roles, name } = response.data;

        setUser({ email, permissions, roles, name })
      }

      )).catch(() => {
        signOut();
      });
    }
  }, [])


  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions',
        {
          email,
          password
        })

      const { token, refreshToken, permissions, roles, name } = response.data

      setCookie(undefined, 'IgAuth.token', token, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/'
      })
      setCookie(undefined, 'IgAuth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/'
      })

      setUser({ email, permissions, roles, name })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard');
    } catch (err) {
      console.log(err);
    }


  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }} >
      {children}
    </AuthContext.Provider>
  )
}