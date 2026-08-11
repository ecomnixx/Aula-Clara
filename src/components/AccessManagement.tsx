import React, { useState, useEffect } from 'react';
import { GoogleUser } from '../types';
import {
  ShieldCheck,
  Search,
  UserCheck,
  Plus,
  Minus,
  Sparkles,
  Lock,
  Unlock,
  Key,
  Mail,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Trash2,
  RefreshCw,
  UserPlus,
  Check,
} from 'lucide-react';

interface AccessManagementProps {
  currentUser?: GoogleUser | null;
}

export interface TeacherAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  school?: string;
  subject?: string;
  createdAt: string;
  trialDaysTotal: number;
  addedDays: number; // Extra days added manually
  isVitalicio: boolean;
  status: 'Ativo' | 'Bloqueado';
  lastMessageSent?: string;
}

export interface TeacherMessage {
  id: string;
  targetEmail: string; // 'ALL' or specific email
  senderName: string;
  title: string;
  content: string;
  createdAt: string;
}

export function AccessManagement({ currentUser }: AccessManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<TeacherAccount[]>([]);
  const [messages, setMessages] = useState<TeacherMessage[]>([]);

  // Modal / Form state for sending a message
  const [selectedTeacherForMessage, setSelectedTeacherForMessage] = useState<TeacherAccount | null>(
    null
  );
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Modal for manual custom days input
  const [customDaysModalTeacher, setCustomDaysModalTeacher] = useState<TeacherAccount | null>(null);
  const [customDaysValue, setCustomDaysValue] = useState<number>(30);

  // Quick feedback toast notice when modifying days
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  // Modal for registering new teacher directly by admin
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSchool, setNewTeacherSchool] = useState('');

  // Load registered accounts from localStorage
  useEffect(() => {
    loadAccounts();
    loadMessages();
  }, []);

  const loadAccounts = () => {
    try {
      const saved = localStorage.getItem('aulaclara_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        const formatted = parsed.map((acc: any, index: number) => ({
          id: acc.id || `acc-${index}-${Math.random().toString(36).substring(2, 7)}`,
          email: acc.email,
          password: acc.password || '123',
          name: acc.name || 'Professor(a)',
          school: acc.school || '',
          subject: acc.subject || 'Educação Geral',
          createdAt: acc.createdAt || new Date().toISOString(),
          trialDaysTotal: acc.trialDaysTotal || 30,
          addedDays: acc.addedDays || 0,
          isVitalicio: acc.isVitalicio || acc.email?.toLowerCase() === 'ecomnixx@gmail.com' || acc.email?.toLowerCase() === 'familiacardoso21@gmail.com',
          status: acc.status || 'Ativo',
        }));
        setAccounts(formatted);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Default Seed Accounts
    const defaultSeed: TeacherAccount[] = [
      {
        id: 'acc-1',
        email: 'familiacardoso21@gmail.com',
        name: 'Prof. Ana Cardoso',
        school: 'Escola Estadual Anísio Teixeira',
        subject: 'História',
        createdAt: new Date().toISOString(),
        trialDaysTotal: 30,
        addedDays: 365,
        isVitalicio: true,
        status: 'Ativo',
      },
      {
        id: 'acc-2',
        email: 'ecomnixx@gmail.com',
        name: 'Prof. Carlos Eduardo',
        school: 'Colégio Futuro Saber',
        subject: 'Matemática',
        createdAt: new Date().toISOString(),
        trialDaysTotal: 30,
        addedDays: 0,
        isVitalicio: true,
        status: 'Ativo',
      },
      {
        id: 'acc-3',
        email: 'maria.silva@escola.edu.br',
        name: 'Profª. Maria Silva',
        school: 'Escola M. Santos Dumont',
        subject: 'Língua Portuguesa',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        trialDaysTotal: 30,
        addedDays: 15,
        isVitalicio: false,
        status: 'Ativo',
      },
      {
        id: 'acc-4',
        email: 'joao.pedro@colegio.com',
        name: 'Prof. João Pedro',
        school: 'Colégio Alfa',
        subject: 'Educação Física',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        trialDaysTotal: 30,
        addedDays: 0,
        isVitalicio: false,
        status: 'Ativo',
      },
    ];

    setAccounts(defaultSeed);
    try {
      localStorage.setItem('aulaclara_registered_accounts', JSON.stringify(defaultSeed));
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = () => {
    try {
      const saved = localStorage.getItem('aulaclara_teacher_messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveAccountsToStorage = (updatedList: TeacherAccount[]) => {
    setAccounts(updatedList);
    try {
      localStorage.setItem('aulaclara_registered_accounts', JSON.stringify(updatedList));
      
      // Also update current session if the active user modified their own account
      if (currentUser?.email) {
        const myAcc = updatedList.find((a) => a.email.toLowerCase() === currentUser.email.toLowerCase());
        if (myAcc) {
          const updatedUser: GoogleUser = {
            ...currentUser,
            isVitalicio: myAcc.isVitalicio,
            status: myAcc.status,
          };
          localStorage.setItem('aula_clara_google_user', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.error('Erro ao salvar contas:', e);
    }
  };

  // Calculate remaining days for a teacher account
  const calculateDaysRemaining = (acc: TeacherAccount) => {
    if (acc.isVitalicio) return Infinity;
    const created = new Date(acc.createdAt).getTime();
    const totalAllowedMs = (acc.trialDaysTotal + acc.addedDays) * 24 * 60 * 60 * 1000;
    const expiryTime = created + totalAllowedMs;
    const now = Date.now();
    const diffMs = expiryTime - now;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  // Add or subtract days from a teacher account (guarantees exact day counting)
  const handleModifyDays = (email: string, daysDelta: number) => {
    let actionNoticeText = '';
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        const currentRemaining = calculateDaysRemaining(acc);
        const baseDays = currentRemaining === Infinity ? 30 : currentRemaining;
        const newTotalDays = Math.max(0, baseDays + daysDelta);

        const deltaFormatted = daysDelta > 0 ? `+${daysDelta}` : `${daysDelta}`;
        actionNoticeText = `Acesso de ${acc.name} atualizado: ${newTotalDays} ${
          newTotalDays === 1 ? 'dia restante' : 'dias restantes'
        } (${deltaFormatted} dias).`;

        return {
          ...acc,
          createdAt: new Date().toISOString(),
          trialDaysTotal: 0,
          addedDays: newTotalDays,
          isVitalicio: false, // Explicitly modifying days sets to dynamic days mode
          status: newTotalDays > 0 ? ('Ativo' as const) : ('Bloqueado' as const),
        };
      }
      return acc;
    });

    saveAccountsToStorage(updated);

    if (actionNoticeText) {
      setLastActionNotice(actionNoticeText);
      setTimeout(() => setLastActionNotice(null), 4000);
    }
  };

  // Toggle Vitalício (Unlimited Lifetime Access)
  const handleToggleVitalicio = (email: string) => {
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        return {
          ...acc,
          isVitalicio: !acc.isVitalicio,
          status: 'Ativo' as const,
        };
      }
      return acc;
    });
    saveAccountsToStorage(updated);
  };

  // Toggle Block / Activate Access
  const handleToggleStatus = (email: string) => {
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        const nextStatus = acc.status === 'Ativo' ? ('Bloqueado' as const) : ('Ativo' as const);
        return {
          ...acc,
          status: nextStatus,
        };
      }
      return acc;
    });
    saveAccountsToStorage(updated);
  };

  // Add new teacher manually
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherEmail.trim() || !newTeacherName.trim()) return;

    const cleanEmail = newTeacherEmail.trim().toLowerCase();
    const exists = accounts.some((a) => a.email.toLowerCase() === cleanEmail);

    if (exists) {
      alert('Já existe um professor cadastrado com este e-mail.');
      return;
    }

    const newAcc: TeacherAccount = {
      id: 'acc-' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: newTeacherName.startsWith('Prof') ? newTeacherName : `Prof. ${newTeacherName}`,
      school: newTeacherSchool || 'Escola Cadastrada',
      subject: 'Educação Geral',
      createdAt: new Date().toISOString(),
      trialDaysTotal: 30,
      addedDays: 30, // Default 60 days total on manual creation
      isVitalicio: false,
      status: 'Ativo',
    };

    const updated = [newAcc, ...accounts];
    saveAccountsToStorage(updated);

    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherSchool('');
    setShowAddTeacherModal(false);
  };

  // Delete account
  const handleDeleteAccount = (email: string) => {
    if (confirm(`Tem certeza que deseja remover o cadastro do professor ${email}?`)) {
      const updated = accounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
      saveAccountsToStorage(updated);
    }
  };

  // Send message or notification
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle.trim() || !messageContent.trim()) return;

    const targetEmail = isBroadcast || !selectedTeacherForMessage ? 'ALL' : selectedTeacherForMessage.email;

    const newMessage: TeacherMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      targetEmail,
      senderName: currentUser?.name || 'Administração Aula Clara',
      title: messageTitle.trim(),
      content: messageContent.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);

    try {
      localStorage.setItem('aulaclara_teacher_messages', JSON.stringify(updatedMessages));
    } catch (e) {
      console.error(e);
    }

    setSendSuccess(
      isBroadcast
        ? 'Aviso enviado com sucesso para TODOS os professores!'
        : `Mensagem enviada com sucesso para ${selectedTeacherForMessage?.name}!`
    );

    setTimeout(() => {
      setSelectedTeacherForMessage(null);
      setMessageTitle('');
      setMessageContent('');
      setSendSuccess(null);
      setIsBroadcast(false);
    }, 1500);
  };

  // Filter accounts by search term (lupa)
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.school && acc.school.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl border border-auguste-sand shadow-lg p-6 sm:p-8 space-y-8 font-sans text-auguste-text">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-auguste-sand pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-auguste-slate text-white text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-auguste-tan" />
            <span>Painel do Administrador & Controle de Licenças</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-auguste-text tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-auguste-slate" />
            <span>Gerenciar Acessos dos Professores</span>
          </h2>
          <p className="text-sm text-auguste-muted font-medium mt-1">
            Pesquise professores, adicione ou remova dias de acesso, conceda acesso vitalício e envie recados ou avisos diretamente para o aplicativo dos professores.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsBroadcast(true);
              setSelectedTeacherForMessage(null);
              setMessageTitle('Aviso Pedagógico - Plataforma Aula Clara');
              setMessageContent('');
            }}
            className="px-4 py-2.5 rounded-2xl bg-auguste-cream text-auguste-slate hover:bg-auguste-sand border border-auguste-sand text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4 text-auguste-slate" />
            <span>Enviar Aviso Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddTeacherModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Cadastrar Novo Professor</span>
          </button>
        </div>
      </div>

      {/* Action Toast Notice */}
      {lastActionNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs sm:text-sm font-black text-emerald-900 flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{lastActionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-extrabold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* SEARCH BAR / LUPA (REQUISITO EXPLÍCITO) */}
      <div className="bg-auguste-cream/80 border-2 border-auguste-sand rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider text-auguste-slate flex items-center gap-2">
          <Search className="w-4 h-4 text-auguste-slate" />
          <span>Pesquisar Professor por Nome ou E-mail (Lupa de Busca):</span>
        </label>
        <div className="relative">
          <Search className="w-5 h-5 text-auguste-slate absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome ou e-mail do professor (ex.: Ana, maria@escola.com)..."
            className="w-full bg-white border-2 border-auguste-sand rounded-2xl pl-12 pr-10 py-3 text-sm font-bold text-auguste-text focus:outline-none focus:border-auguste-slate shadow-2xs placeholder:text-auguste-muted"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3.5 text-xs font-bold text-auguste-muted hover:text-auguste-text"
            >
              Limpar
            </button>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-auguste-muted font-semibold px-1">
          <span>
            Exibindo <strong className="text-auguste-slate font-black">{filteredAccounts.length}</strong> de{' '}
            {accounts.length} professores cadastrados.
          </span>
          <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-md border border-auguste-sand">
            Pesquisa em Tempo Real
          </span>
        </div>
      </div>

      {/* TEACHERS LIST WITH ACCESS CONTROLS */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-auguste-text flex items-center justify-between border-b border-auguste-sand pb-2">
          <span className="flex items-center gap-2">
            <Key className="w-5 h-5 text-auguste-slate" />
            <span>Lista de Licenças e Dias de Acesso</span>
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {filteredAccounts.map((acc) => {
            const daysLeft = calculateDaysRemaining(acc);
            const isBlocked = acc.status === 'Bloqueado' || (daysLeft === 0 && !acc.isVitalicio);

            return (
              <div
                key={acc.id}
                className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                  acc.isVitalicio
                    ? 'bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 border-amber-300 shadow-sm'
                    : isBlocked
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-white border-auguste-sand hover:border-auguste-slate shadow-2xs'
                }`}
              >
                {/* Top User Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-2xs border ${
                        acc.isVitalicio
                          ? 'bg-amber-500 text-white border-amber-600'
                          : isBlocked
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-auguste-slate text-white border-auguste-slate-dark'
                      }`}
                    >
                      {acc.name?.charAt(0) || 'P'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-auguste-text">{acc.name}</h4>
                        {acc.isVitalicio && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                            <Sparkles className="w-3 h-3 fill-white" /> Acesso Vitalício
                          </span>
                        )}
                        {acc.status === 'Bloqueado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Acesso Bloqueado
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-auguste-slate flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-auguste-muted" />
                        <span>{acc.email}</span>
                      </p>

                      {acc.school && (
                        <p className="text-xs text-auguste-muted font-medium">
                          {acc.school} • Disciplina: {acc.subject || 'Geral'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status & Days Left Badge with Direct Steppers */}
                  <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase text-auguste-muted block mb-1">
                        Tempo de Acesso:
                      </span>
                      {acc.isVitalicio ? (
                        <span className="text-sm font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 inline-block shadow-2xs">
                          Ilimitado (Vitalício)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-auguste-sand shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleModifyDays(acc.email, -1)}
                            className="w-7 h-7 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90"
                            title="Subtrair -1 dia"
                          >
                            -1
                          </button>

                          <span
                            className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl border transition-all ${
                              daysLeft <= 5
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {daysLeft} {daysLeft === 1 ? 'Dia Restante' : 'Dias Restantes'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleModifyDays(acc.email, 1)}
                            className="w-7 h-7 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90"
                            title="Adicionar +1 dia"
                          >
                            +1
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTION CONTROLS BAR: ADD/REMOVE DAYS (+30, -30, +50, -50), VITALÍCIO, MESSAGE */}
                <div className="pt-3 border-t border-auguste-sand/70 flex flex-wrap items-center justify-between gap-3 bg-auguste-cream/50 p-3.5 rounded-2xl">
                  {/* Days Modification Preset Buttons: +30, -30, +50, -50 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-auguste-slate mr-1">
                      Ajustar Dias:
                    </span>

                    <button
                      type="button"
                      onClick={() => handleModifyDays(acc.email, 30)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                      title="Adicionar +30 dias de acesso"
                    >
                      <Plus className="w-3.5 h-3.5" /> +30 Dias
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModifyDays(acc.email, -30)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                      title="Retirar -30 dias de acesso"
                    >
                      <Minus className="w-3.5 h-3.5" /> -30 Dias
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModifyDays(acc.email, 50)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                      title="Adicionar +50 dias de acesso"
                    >
                      <Plus className="w-3.5 h-3.5" /> +50 Dias
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModifyDays(acc.email, -50)}
                      className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                      title="Retirar -50 dias de acesso"
                    >
                      <Minus className="w-3.5 h-3.5" /> -50 Dias
                    </button>
                  </div>

                  {/* Secondary Actions: Vitalício, Block/Unblock, Message, Delete */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleVitalicio(acc.email)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                        acc.isVitalicio
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{acc.isVitalicio ? 'Remover Vitalício' : 'Dar Acesso Vitalício'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(acc.email)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                        acc.status === 'Bloqueado'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {acc.status === 'Bloqueado' ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" /> Desbloquear
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Bloquear
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeacherForMessage(acc);
                        setIsBroadcast(false);
                        setMessageTitle(`Aviso de Acesso Pedagógico`);
                        setMessageContent(
                          `Olá ${acc.name}! Seus dias de acesso foram atualizados na plataforma Aula Clara.`
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Recado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.email)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-colors"
                      title="Excluir cadastro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAccounts.length === 0 && (
            <div className="p-10 text-center bg-auguste-cream rounded-3xl border-2 border-dashed border-auguste-sand space-y-2">
              <Search className="w-8 h-8 text-auguste-slate mx-auto" />
              <p className="text-base font-bold text-auguste-text">
                Nenhum professor encontrado para "{searchTerm}"
              </p>
              <p className="text-xs text-auguste-muted">
                Verifique se digitou o e-mail ou nome corretamente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RECADOS E COMUNICAÇÃO COM PROFESSORES */}
      <div className="space-y-4 pt-4 border-t border-auguste-sand">
        <h3 className="text-base font-extrabold text-auguste-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-auguste-slate" />
            <span>Mensagens e Recados Enviados aos Professores</span>
          </span>
          <span className="text-xs text-auguste-muted font-bold">
            {messages.length} recados registrados
          </span>
        </h3>

        <div className="space-y-3">
          {messages.slice(0, 5).map((msg) => (
            <div
              key={msg.id}
              className="p-4 rounded-2xl bg-auguste-cream border border-auguste-sand space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-auguste-slate bg-white px-2.5 py-0.5 rounded-md border border-auguste-sand">
                  Para:{' '}
                  {msg.targetEmail === 'ALL'
                    ? '📢 TODOS OS PROFESSORES (Geral)'
                    : `✉️ ${msg.targetEmail}`}
                </span>
                <span className="text-[11px] text-auguste-muted">
                  {new Date(msg.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <h4 className="text-sm font-bold text-auguste-text">{msg.title}</h4>
              <p className="text-xs text-auguste-muted leading-relaxed">{msg.content}</p>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="p-6 text-center bg-auguste-cream rounded-2xl border border-auguste-sand text-xs text-auguste-muted font-medium">
              Nenhuma mensagem enviada aos professores ainda. Clique em "Enviar Recado" no perfil de qualquer professor para se comunicar.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: SEND MESSAGE TO TEACHER OR ALL */}
      {(selectedTeacherForMessage || isBroadcast) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-auguste-sand max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-auguste-sand pb-3">
              <h3 className="text-base font-black text-auguste-text flex items-center gap-2">
                <Send className="w-5 h-5 text-auguste-slate" />
                <span>
                  {isBroadcast
                    ? 'Enviar Aviso Geral para Todos os Professores'
                    : `Enviar Recado para ${selectedTeacherForMessage?.name}`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedTeacherForMessage(null);
                  setIsBroadcast(false);
                }}
                className="text-auguste-muted hover:text-auguste-text text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{sendSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-auguste-slate mb-1">
                  Título do Aviso / Notificação:
                </label>
                <input
                  type="text"
                  required
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="Ex.: Renovação de Acesso Realizada, Novo Regimento Disponível..."
                  className="w-full px-4 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:outline-none focus:border-auguste-slate"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-auguste-slate mb-1">
                  Conteúdo da Mensagem:
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Escreva a mensagem ou comunicado que aparecerá no aplicativo do professor..."
                  className="w-full px-4 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-medium text-auguste-text focus:outline-none focus:border-auguste-slate resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherForMessage(null);
                    setIsBroadcast(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-auguste-sand text-xs font-bold text-auguste-text hover:bg-auguste-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-extrabold shadow-2xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Recado Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM DAYS INPUT */}
      {customDaysModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-auguste-sand max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-auguste-text border-b border-auguste-sand pb-2">
              Ajustar Dias de Acesso: {customDaysModalTeacher.name}
            </h3>
            <p className="text-xs text-auguste-muted">
              Digite a quantidade exata de dias que deseja adicionar ou subtrair:
            </p>

            <div className="space-y-3">
              <input
                type="number"
                value={customDaysValue}
                onChange={(e) => setCustomDaysValue(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-auguste-cream border-2 border-auguste-sand rounded-xl text-lg font-black text-center text-auguste-slate focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleModifyDays(customDaysModalTeacher.email, Math.abs(customDaysValue));
                    setCustomDaysModalTeacher(null);
                  }}
                  className="py-2.5 px-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  + Adicionar {Math.abs(customDaysValue)} Dias
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleModifyDays(customDaysModalTeacher.email, -Math.abs(customDaysValue));
                    setCustomDaysModalTeacher(null);
                  }}
                  className="py-2.5 px-3 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  - Retirar {Math.abs(customDaysValue)} Dias
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCustomDaysModalTeacher(null)}
              className="w-full py-2 border border-auguste-sand text-xs font-bold text-auguste-muted rounded-xl"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW TEACHER BY ADMIN */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-auguste-sand max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-auguste-sand pb-3">
              <h3 className="text-base font-extrabold text-auguste-text flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-auguste-slate" />
                <span>Cadastrar Novo Professor</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="text-auguste-muted hover:text-auguste-text text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-auguste-slate mb-1">
                  Nome Completo do Professor:
                </label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Ex.: Profª. Juliana Lima"
                  className="w-full px-4 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-auguste-slate mb-1">
                  E-mail do Professor:
                </label>
                <input
                  type="email"
                  required
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  placeholder="juliana.lima@escola.com"
                  className="w-full px-4 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-auguste-slate mb-1">
                  Escola / Instituição:
                </label>
                <input
                  type="text"
                  value={newTeacherSchool}
                  onChange={(e) => setNewTeacherSchool(e.target.value)}
                  placeholder="Ex.: Colégio Objetivo"
                  className="w-full px-4 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl border border-auguste-sand text-xs font-bold text-auguste-text"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-extrabold shadow-2xs"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
