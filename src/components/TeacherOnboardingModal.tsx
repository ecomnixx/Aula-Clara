import React, { useState } from 'react';
import { GoogleUser, DisciplinaType } from '../types';
import { School, User, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface TeacherOnboardingModalProps {
  googleUser: GoogleUser;
  onComplete: (updatedUser: GoogleUser) => void;
  onSwitchAccount?: () => void;
}

const DISCIPLINA_OPTIONS: DisciplinaType[] = [
  'Educação Física',
  'Língua Portuguesa',
  'Matemática',
  'História',
  'Geografia',
  'Ciências',
  'Arte',
  'Inglês',
  'Física',
  'Química',
  'Biologia',
  'Filosofia',
  'Sociologia',
  'Ensino Religioso',
];

export const TeacherOnboardingModal: React.FC<TeacherOnboardingModalProps> = ({
  googleUser,
  onComplete,
  onSwitchAccount,
}) => {
  const [nome, setNome] = useState(googleUser.name || '');
  const [disciplina, setDisciplina] = useState<string>(
    googleUser.subject || 'Educação Física'
  );
  const [customDisciplina, setCustomDisciplina] = useState('');
  const [colegio, setColegio] = useState(googleUser.school || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalNome = nome.trim() || 'Professor(a)';
    const finalDisciplina =
      disciplina === 'Outra'
        ? customDisciplina.trim() || 'Geral'
        : disciplina;
    const finalColegio = colegio.trim() || 'Escola / Colégio';

    setTimeout(() => {
      const updatedUser: GoogleUser = {
        ...googleUser,
        name: finalNome,
        subject: finalDisciplina,
        school: finalColegio,
        hasCompletedOnboarding: true,
      };

      // 1. Save active user in localStorage
      try {
        localStorage.setItem('aula_clara_google_user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Erro ao salvar usuario no localStorage:', err);
      }

      // 2. Update/Save teacher in teachers list database
      try {
        const saved = localStorage.getItem('aulaclara_teachers_list');
        let teachersList = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(teachersList)) teachersList = [];

        const existingIndex = teachersList.findIndex(
          (t: any) => t.email && t.email.toLowerCase() === googleUser.email.toLowerCase()
        );

        if (existingIndex >= 0) {
          teachersList[existingIndex] = {
            ...teachersList[existingIndex],
            nome: finalNome,
            disciplina: finalDisciplina,
            colegio: finalColegio,
          };
        } else {
          teachersList.push({
            id: Date.now().toString(),
            nome: finalNome,
            email: googleUser.email,
            disciplina: finalDisciplina,
            colegio: finalColegio,
            diasRestantes: 30,
            status: 'Ativo',
            createdAt: new Date().toLocaleDateString('pt-BR'),
          });
        }

        localStorage.setItem('aulaclara_teachers_list', JSON.stringify(teachersList));
      } catch (err) {
        console.error('Erro ao atualizar banco de professores:', err);
      }

      setIsSubmitting(false);
      onComplete(updatedUser);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-xl border border-auguste-sand max-w-lg w-full overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div className="bg-auguste-slate p-6 sm:p-8 text-white relative overflow-hidden border-b border-auguste-sand">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Passo 2 de 2 • Informações Pedagógicas</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dados do Professor e Colégio
            </h2>

            <p className="text-xs text-slate-200 font-medium">
              Configure seus dados para personalizarmos os seus planos de aula, avaliações e o nome do seu colégio no topo do aplicativo e nas impressões.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 bg-white">
          {/* E-mail cadastrado */}
          <div className="p-3 bg-auguste-cream border border-auguste-sand rounded-2xl flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-auguste-text">E-mail Autenticado:</span>
              <span className="text-xs font-black text-auguste-slate bg-white px-2.5 py-1 rounded-lg border border-auguste-sand">
                {googleUser.email}
              </span>
            </div>
            {onSwitchAccount && (
              <button
                type="button"
                onClick={onSwitchAccount}
                className="text-[11px] font-black text-auguste-text bg-white hover:bg-auguste-cream border border-auguste-sand px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Trocar E-mail
              </button>
            )}
          </div>

          {/* Campo 1: Nome do Professor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-auguste-slate uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-auguste-slate" />
              <span>Nome do Professor(a)</span>
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Prof. Lucas Henrique"
              className="w-full px-4 py-3 bg-auguste-cream border border-auguste-sand rounded-2xl text-sm font-bold text-auguste-text focus:border-auguste-slate focus:bg-white focus:outline-none transition-all placeholder:text-auguste-muted"
            />
          </div>

          {/* Campo 2: Disciplina / Conteúdo que leciona */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-auguste-slate uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-auguste-slate" />
              <span>Disciplina / Conteúdo que leciona</span>
            </label>
            <select
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              className="w-full px-4 py-3 bg-auguste-cream border border-auguste-sand rounded-2xl text-sm font-bold text-auguste-text focus:border-auguste-slate focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              {DISCIPLINA_OPTIONS.map((d) => (
                <option key={d} value={d} className="bg-white text-auguste-text">
                  {d}
                </option>
              ))}
              <option value="Outra" className="bg-white text-auguste-text">Outra disciplina...</option>
            </select>

            {disciplina === 'Outra' && (
              <input
                type="text"
                required
                value={customDisciplina}
                onChange={(e) => setCustomDisciplina(e.target.value)}
                placeholder="Digite a disciplina..."
                className="w-full mt-2 px-4 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-sm font-bold text-auguste-text focus:border-auguste-slate focus:bg-white focus:outline-none placeholder:text-auguste-muted"
              />
            )}
          </div>

          {/* Campo 3: Nome do Colégio de Atuação */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-auguste-slate uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-4 h-4 text-auguste-slate" />
              <span>Nome do Colégio que vai atuar</span>
            </label>
            <input
              type="text"
              required
              value={colegio}
              onChange={(e) => setColegio(e.target.value)}
              placeholder="Ex.: Escola de Educação Básica, Colégio Saber..."
              className="w-full px-4 py-3 bg-auguste-cream border border-auguste-sand rounded-2xl text-sm font-bold text-auguste-text focus:border-auguste-slate focus:bg-white focus:outline-none transition-all placeholder:text-auguste-muted"
            />
            <p className="text-[11px] text-auguste-muted font-semibold pt-0.5">
              Este nome aparecerá em destaque no topo do aplicativo e em todos os cabeçalhos de prova e materiais impressos.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-auguste-slate hover:bg-auguste-slate-dark text-white font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Salvando e liberando sistema...</span>
              ) : (
                <>
                  <span>Concluir Cadastro e Acessar App</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 bg-auguste-cream border-t border-auguste-sand text-center text-xs text-auguste-muted font-semibold">
          Você poderá alterar suas informações a qualquer momento na aba "Minha Conta".
        </div>
      </div>
    </div>
  );
};
