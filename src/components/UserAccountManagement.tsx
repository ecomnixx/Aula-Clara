import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Shield,
  Calendar,
  School,
  Mail,
  User,
  LogOut,
  Save,
  Plus,
  Minus,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';

export interface RegisteredUser {
  id: string;
  nome: string;
  email: string;
  disciplina: string;
  colegio: string;
  diasRestantes: number;
  isVitalicio?: boolean;
  status: 'Ativo' | 'Bloqueado';
  createdAt: string;
}

export const UserAccountManagement: React.FC = () => {
  // Current active Google account
  const [googleUser, setGoogleUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aula_clara_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Master profile state
  const [masterProfile, setMasterProfile] = useState(() => {
    return {
      nome: googleUser?.name || 'Lucas',
      email: googleUser?.email || 'ecomnixx@gmail.com',
      disciplina: googleUser?.subject || 'educação física',
      colegio: googleUser?.school || 'Escola / Colégio',
    };
  });

  // Registration Form State
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDisciplina, setNewDisciplina] = useState('');
  const [newColegio, setNewColegio] = useState('');
  const [newDias, setNewDias] = useState('30');

  // Search & Toast
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-user adjustment inputs: { [userId]: numberString }
  const [userDayInputs, setUserDayInputs] = useState<{ [key: string]: string }>({});

  // Editing teacher modal or inline state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<RegisteredUser>>({});

  // Registered Teachers list in localStorage
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    try {
      const saved = localStorage.getItem('aulaclara_teachers_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: '1',
        nome: 'Lucas',
        email: 'ecomnixx@gmail.com',
        disciplina: 'educação física',
        colegio: 'Escola / Colégio',
        diasRestantes: 36500, // Vitalício
        isVitalicio: true,
        status: 'Ativo',
        createdAt: '01/08/2026',
      },
      {
        id: '2',
        nome: 'Gildinha',
        email: 'Gildam.farias04@gmail.com',
        disciplina: 'Química',
        colegio: 'Casa da vó',
        diasRestantes: 30,
        isVitalicio: false,
        status: 'Ativo',
        createdAt: '09/08/2026',
      },
    ];
  });

  // Save users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aulaclara_teachers_list', JSON.stringify(users));
    } catch (e) {
      console.error('Erro ao salvar professores:', e);
    }
  }, [users]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Save Master Account Data
  const handleSaveMasterProfile = () => {
    const updatedGoogleUser = {
      ...(googleUser || {}),
      name: masterProfile.nome,
      email: masterProfile.email,
      school: masterProfile.colegio,
      subject: masterProfile.disciplina,
    };
    try {
      localStorage.setItem('aula_clara_google_user', JSON.stringify(updatedGoogleUser));
    } catch (e) {
      console.error(e);
    }
    setGoogleUser(updatedGoogleUser);
    showToast('Dados da sua conta salvos com sucesso!');
  };

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('aula_clara_google_user');
    } catch (e) {
      console.error(e);
    }
    setGoogleUser(null);
    window.location.reload();
  };

  // 2. Register New User
  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newNome) {
      showToast('Por favor, informe pelo menos o nome e o e-mail do professor.');
      return;
    }

    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      nome: newNome,
      email: newEmail.trim().toLowerCase(),
      disciplina: newDisciplina || 'Geral',
      colegio: newColegio || 'Escola Padrão',
      diasRestantes: parseInt(newDias) || 30,
      isVitalicio: false,
      status: 'Ativo',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    setUsers((prev) => [newUser, ...prev]);
    showToast(`Acesso liberado com sucesso para ${newNome}!`);

    // Reset inputs
    setNewNome('');
    setNewEmail('');
    setNewDisciplina('');
    setNewColegio('');
    setNewDias('30');
  };

  // 3. Add 30 Days to Master Access
  const handleAdd30DaysToMaster = () => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === (googleUser?.email || 'ecomnixx@gmail.com').toLowerCase()) {
          return { ...u, diasRestantes: u.diasRestantes + 30 };
        }
        return u;
      })
    );
    showToast('+30 dias adicionados ao seu acesso Master!');
  };

  // 4. Adjust Teacher Days (+ / - / set exact)
  const handleModifyUserDays = (userId: string, action: 'add' | 'subtract' | 'set') => {
    const inputVal = parseInt(userDayInputs[userId] || '0');
    if (isNaN(inputVal) && action !== 'set') {
      showToast('Digite uma quantidade válida de dias.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          let currentDays = u.diasRestantes || 0;
          let newTotal = currentDays;

          if (action === 'add') {
            newTotal = currentDays + inputVal;
          } else if (action === 'subtract') {
            newTotal = Math.max(0, currentDays - inputVal);
          } else if (action === 'set') {
            newTotal = Math.max(0, inputVal);
          }

          return { ...u, diasRestantes: newTotal, isVitalicio: false };
        }
        return u;
      })
    );

    setUserDayInputs((prev) => ({ ...prev, [userId]: '' }));
    showToast('Prazo de acesso atualizado com sucesso!');
  };

  // 5. Toggle Block / Unblock Access
  const handleToggleBlockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'Ativo' ? 'Bloqueado' : 'Ativo';
          showToast(
            newStatus === 'Bloqueado'
              ? `Acesso de ${u.nome} bloqueado!`
              : `Acesso de ${u.nome} reativado!`
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // 6. Delete User
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este professor do sistema?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('Professor removido com sucesso!');
    }
  };

  // 7. Save Edited User
  const handleSaveEditedUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            ...editUserData,
          };
        }
        return u;
      })
    );
    setEditingUserId(null);
    setEditUserData({});
    showToast('Dados do professor salvos!');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.colegio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans text-slate-800">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION 1: MINHA CONTA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Minha conta
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Administre os professores do AulaClara.
          </p>
        </div>

        {/* Master User Card */}
        <div className="p-5 rounded-2xl border border-auguste-sand bg-auguste-cream space-y-1 shadow-2xs">
          <h2 className="text-lg font-black text-auguste-text leading-tight">
            {masterProfile.nome}
          </h2>
          <p className="text-sm font-bold text-auguste-muted">{masterProfile.disciplina}</p>
          <p className="text-sm font-bold text-auguste-muted">{masterProfile.colegio}</p>
          <p className="text-sm font-bold text-auguste-muted">{masterProfile.email}</p>
          <p className="text-xs font-black text-auguste-slate pt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-auguste-slate"></span>
            <span>Administrador • acesso vitalício</span>
          </p>
        </div>

        {/* Editable Fields for Master Profile */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-black text-auguste-text mb-1">
              Editar nome
            </label>
            <input
              type="text"
              value={masterProfile.nome}
              onChange={(e) => setMasterProfile({ ...masterProfile, nome: e.target.value })}
              className="w-full py-2.5 border-b-2 border-auguste-sand focus:border-auguste-slate bg-transparent text-base font-bold text-auguste-text outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-auguste-text mb-1">
              Editar disciplina
            </label>
            <input
              type="text"
              value={masterProfile.disciplina}
              onChange={(e) => setMasterProfile({ ...masterProfile, disciplina: e.target.value })}
              className="w-full py-2.5 border-b-2 border-auguste-sand focus:border-auguste-slate bg-transparent text-base font-bold text-auguste-text outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-auguste-text mb-1">
              Editar colégio
            </label>
            <input
              type="text"
              value={masterProfile.colegio}
              onChange={(e) => setMasterProfile({ ...masterProfile, colegio: e.target.value })}
              className="w-full py-2.5 border-b-2 border-auguste-sand focus:border-auguste-slate bg-transparent text-base font-bold text-auguste-text outline-none transition-colors"
            />
          </div>

          {/* Master Buttons */}
          <div className="space-y-3 pt-4">
            <button
              type="button"
              onClick={handleSaveMasterProfile}
              className="w-full py-3.5 px-4 bg-auguste-slate hover:bg-auguste-slate-dark text-white rounded-2xl font-black text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Salvar meus dados</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-black text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sair desta conta</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: CADASTRAR NOVO USUÁRIO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Cadastrar novo usuário
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            O e-mail deve ser o mesmo que o professor usará para entrar com o Google.
          </p>
        </div>

        <form onSubmit={handleRegisterUser} className="space-y-4">
          <div>
            <input
              type="text"
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Nome do professor"
              className="w-full py-2.5 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>

          <div>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="E-mail Google"
              className="w-full py-2.5 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>

          <div>
            <input
              type="text"
              value={newDisciplina}
              onChange={(e) => setNewDisciplina(e.target.value)}
              placeholder="Disciplina"
              className="w-full py-2.5 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>

          <div>
            <input
              type="text"
              value={newColegio}
              onChange={(e) => setNewColegio(e.target.value)}
              placeholder="Nome do colégio"
              className="w-full py-2.5 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>

          <div>
            <input
              type="number"
              value={newDias}
              onChange={(e) => setNewDias(e.target.value)}
              placeholder="Dias de acesso. Ex.: 30"
              className="w-full py-2.5 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <UserPlus className="w-5 h-5 text-white" />
              <span>Cadastrar e liberar acesso</span>
            </button>

            <button
              type="button"
              onClick={handleAdd30DaysToMaster}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-2xl font-black text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Adicionar 30 dias ao meu acesso</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: BUSCAR E EDITAR PROFESSORES CADASTRADOS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Buscar professores</span>
            <span className="text-lg">🔍</span>
          </h2>

          <div className="mt-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, disciplina ou colégio"
              className="w-full py-2.5 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>
        </div>

        {/* List of Registered Teachers */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-black text-slate-900">Professores cadastrados</h3>

          {filteredUsers.map((usr) => {
            const isEditing = editingUserId === usr.id;
            const currentDayInput = userDayInputs[usr.id] || '';

            return (
              <div
                key={usr.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 shadow-2xs"
              >
                {isEditing ? (
                  /* Edit Mode Form for Teacher */
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-indigo-200">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                      Editar dados do professor
                    </h4>
                    <div>
                      <label className="text-xs font-bold text-slate-600">Nome:</label>
                      <input
                        type="text"
                        value={editUserData.nome ?? usr.nome}
                        onChange={(e) => setEditUserData({ ...editUserData, nome: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">E-mail:</label>
                      <input
                        type="email"
                        value={editUserData.email ?? usr.email}
                        onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Disciplina:</label>
                        <input
                          type="text"
                          value={editUserData.disciplina ?? usr.disciplina}
                          onChange={(e) => setEditUserData({ ...editUserData, disciplina: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Colégio:</label>
                        <input
                          type="text"
                          value={editUserData.colegio ?? usr.colegio}
                          onChange={(e) => setEditUserData({ ...editUserData, colegio: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEditedUser(usr.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black"
                      >
                        Salvar Alterações
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUserId(null);
                          setEditUserData({});
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight">
                        {usr.nome}
                      </h4>
                      <p className="text-sm font-bold text-indigo-600 font-mono mt-0.5">
                        {usr.email}
                      </p>
                      <p className="text-sm font-bold text-slate-600 mt-0.5">
                        {usr.disciplina} • {usr.colegio}
                      </p>
                      <p className="text-xs font-black text-slate-700 mt-1 flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            usr.status === 'Bloqueado'
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                        ></span>
                        <span>
                          {usr.status === 'Bloqueado'
                            ? 'Acesso Bloqueado'
                            : usr.isVitalicio
                            ? 'Ativo • Vitalício'
                            : `Ativo • ${usr.diasRestantes} dias de acesso`}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        title="Editar dados"
                        onClick={() => {
                          setEditingUserId(usr.id);
                          setEditUserData({
                            nome: usr.nome,
                            email: usr.email,
                            disciplina: usr.disciplina,
                            colegio: usr.colegio,
                          });
                        }}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Excluir professor"
                        onClick={() => handleDeleteUser(usr.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Days modification controls */}
                <div className="space-y-3 pt-1 border-t border-slate-200">
                  {/* Quantity input */}
                  <div>
                    <input
                      type="number"
                      value={currentDayInput}
                      onChange={(e) =>
                        setUserDayInputs({ ...userDayInputs, [usr.id]: e.target.value })
                      }
                      placeholder="Quantidade exata de dias"
                      className="w-full py-2 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                  </div>

                  {/* Retirar / Adicionar Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModifyUserDays(usr.id, 'subtract')}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                    >
                      <Minus className="w-4 h-4 text-rose-600" />
                      <span>Retirar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModifyUserDays(usr.id, 'add')}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {/* Salvar novo prazo Button */}
                  <button
                    type="button"
                    onClick={() => handleModifyUserDays(usr.id, 'set')}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar novo prazo</span>
                  </button>

                  {/* Bloquear / Reativar acesso Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleBlockUser(usr.id)}
                    className="w-full py-3 px-4 bg-[#080d1a] hover:bg-[#131f3b] text-white border border-cyan-500/30 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {usr.status === 'Bloqueado' ? (
                      <>
                        <Unlock className="w-4 h-4 text-cyan-400" />
                        <span>Desbloquear e reativar acesso</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Bloquear acesso</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <p className="text-sm font-semibold text-slate-400 text-center py-6">
              Nenhum professor encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
