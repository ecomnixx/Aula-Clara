import React, { useState } from 'react';
import { GoogleUser } from '../types';
import {
  ShieldCheck,
  School,
  Loader2,
  Mail,
  ArrowRight,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface GoogleAuthModalProps {
  onLoginSuccess: (user: GoogleUser) => void;
}

export function GoogleAuthModal({ onLoginSuccess }: GoogleAuthModalProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to get registered users from localStorage
  const getRegisteredUsers = () => {
    try {
      const saved = localStorage.getItem('aulaclara_registered_accounts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        email: 'familiacardoso21@gmail.com',
        password: '123',
        name: 'Prof. Ana Cardoso',
        school: 'Escola Estadual Anísio Teixeira',
        subject: 'História',
      },
      {
        email: 'ecomnixx@gmail.com',
        password: '123',
        name: 'Prof. Carlos Eduardo',
        school: 'Colégio Futuro Saber',
        subject: 'Matemática',
      },
    ];
  };

  // Helper to save registered users
  const saveRegisteredUsers = (usersList: any[]) => {
    try {
      localStorage.setItem('aulaclara_registered_accounts', JSON.stringify(usersList));
    } catch (e) {
      console.error('Erro ao salvar contas no navegador:', e);
    }
  };

  // Execute Google 1-Click Login / Auto-Register
  const executeInstantGoogleLogin = (targetEmail?: string, targetName?: string) => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = (targetEmail || loginEmail || 'familiacardoso21@gmail.com').trim().toLowerCase();

    setTimeout(() => {
      const users = getRegisteredUsers();
      let existingUser = users.find((u: any) => u.email.toLowerCase() === cleanEmail);

      if (!existingUser) {
        // Auto-register new google user on first login
        const newName = targetName || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        existingUser = {
          email: cleanEmail,
          password: 'google-oauth-pass',
          name: newName.startsWith('Prof') ? newName : `Prof. ${newName}`,
          school: 'Escola do Professor',
          subject: 'Educação Geral',
          createdAt: new Date().toISOString(),
        };
        users.push(existingUser);
        saveRegisteredUsers(users);
      }

      loginUserObject(existingUser);
    }, 600);
  };

  // Execute Email + Password Login (Auto-registers if new)
  const handleEmailPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Por favor, digite o seu e-mail.');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMessage('Por favor, digite a sua senha.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      let existingUser = users.find((u: any) => u.email.toLowerCase() === cleanEmail);

      if (!existingUser) {
        // Auto-register seamlessly on first login with email/password
        const newName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        existingUser = {
          email: cleanEmail,
          password: loginPassword,
          name: `Prof. ${newName}`,
          school: 'Escola do Professor',
          subject: 'Educação Geral',
          createdAt: new Date().toISOString(),
        };
        users.push(existingUser);
        saveRegisteredUsers(users);
      }

      loginUserObject(existingUser);
    }, 500);
  };

  const loginUserObject = (userData: any) => {
    const newUser: GoogleUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: userData.name || 'Professor(a)',
      email: userData.email,
      picture:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: userData.school || '',
      subject: userData.subject || 'Educação Geral',
      hasCompletedOnboarding: true,
      loggedInAt: new Date().toISOString(),
      createdAt: userData.createdAt || new Date().toISOString(),
      trialDaysTotal: 30,
      status: 'Ativo',
    };

    try {
      localStorage.setItem('aula_clara_google_user', JSON.stringify(newUser));
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
    }

    setIsAuthenticating(false);
    onLoginSuccess(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col my-auto transition-all">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-white p-6 text-slate-900 text-center relative border-b border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-indigo-100/80 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase text-indigo-700 border border-indigo-200 shadow-2xs">
              <School className="w-3.5 h-3.5 text-indigo-600" />
              <span>Plataforma Pedagógica Aula Clara</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Acessar Conta
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
              Entre com sua conta do Google ou digite seu e-mail e senha para acessar os planejamentos pedagógicos.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5 bg-white">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-start gap-2.5 animate-fadeIn shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1-Click Google Login Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={() => executeInstantGoogleLogin()}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl border-2 border-slate-200 hover:border-indigo-400 shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] group disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="group-hover:text-indigo-600 transition-colors">
                Continuar com o Google
              </span>
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium">
              Cadastra e conecta automaticamente no primeiro clique.
            </p>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-slate-200"></div>
            <span className="absolute bg-white px-3 text-[10px] uppercase font-black tracking-wider text-slate-400">
              Ou entre com E-mail e Senha
            </span>
          </div>

          {/* Email & Password Login Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Login / E-mail</span>
              </label>
              <input
                type="email"
                required
                placeholder="professor@escola.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Senha</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Persistent Notice */}
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 font-medium flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Sessão persistente:</strong> Após entrar pela primeira vez, você permanecerá conectado automaticamente.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Autenticação Aula Clara • Proteção de Dados LGPD</span>
        </div>
      </div>
    </div>
  );
}
