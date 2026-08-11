import React, { useState, useEffect } from 'react';
import { safeFetchJson } from './utils/api';
import { Header, TabType } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { MaterialResult } from './components/MaterialResult';
import { BnccDatabaseViewer } from './components/BnccDatabaseViewer';
import { HistoryViewer } from './components/HistoryViewer';
import { BnccGuide } from './components/BnccGuide';
import { PrintModal } from './components/PrintModal';
import { UserAccountManagement } from './components/UserAccountManagement';
import { AccessManagement } from './components/AccessManagement';
import { TeacherToolsTab } from './components/TeacherToolsTab';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { TeacherOnboardingModal } from './components/TeacherOnboardingModal';
import {
  GeneratorInput,
  MaterialResultData,
  TipoMaterialType,
  GoogleUser,
  DisciplinaType,
} from './types';
import { Lock, LogOut } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('generator');

  // Google Authentication State with localStorage persistence
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem('aula_clara_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Calculate if 30 days trial period has elapsed
  const isTrialExpired = React.useMemo(() => {
    if (!googleUser) return false;
    if (googleUser.isVitalicio || googleUser.email?.toLowerCase() === 'ecomnixx@gmail.com') {
      return false;
    }
    const createdTime = googleUser.createdAt
      ? new Date(googleUser.createdAt).getTime()
      : new Date().getTime();
    const trialDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 Days in ms
    const now = new Date().getTime();
    return now >= createdTime + trialDurationMs;
  }, [googleUser]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('aula_clara_google_user');
    } catch (e) {
      console.error(e);
    }
    setGoogleUser(null);
  };

  // Generator form state
  const [input, setInput] = useState<GeneratorInput>({
    disciplina: 'História',
    segmento: 'Ensino Fundamental – Anos Finais',
    ano: '8º Ano',
    tipo: 'Plano de Aula',
    texto_ocr: '',
    files: [],
    tipoAulaEdFisica: 'Prática',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<MaterialResultData | null>(null);

  // History state in localStorage
  const [history, setHistory] = useState<MaterialResultData[]>(() => {
    try {
      const saved = localStorage.getItem('bncc_history_materials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Print modal state
  const [printModalData, setPrintModalData] = useState<{
    material: MaterialResultData;
    includeGabarito: boolean;
  } | null>(null);

  // Sync Google User subject to Generator form
  useEffect(() => {
    if (googleUser?.subject) {
      setInput((prev) => ({
        ...prev,
        disciplina: (googleUser.subject as DisciplinaType) || prev.disciplina,
      }));
    }
  }, [googleUser]);

  // Persist history changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bncc_history_materials', JSON.stringify(history));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [history]);

  // Handle generation call
  const handleGenerate = async (selectedTipo?: TipoMaterialType) => {
    setIsLoading(true);
    setErrorMessage(null);

    const tipoToUse = selectedTipo || input.tipo;
    if (selectedTipo) {
      setInput((prev) => ({ ...prev, tipo: selectedTipo }));
    }

    try {
      const imagePayloads = input.files.map((f) => ({
        mimeType: f.type || 'image/jpeg',
        base64: f.base64,
      }));

      const resData = await safeFetchJson('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disciplina: input.disciplina,
          segmento: input.segmento,
          ano: input.ano,
          tipo: tipoToUse,
          texto_ocr: input.texto_ocr,
          images: imagePayloads,
          tipoAulaEdFisica: input.tipoAulaEdFisica,
        }),
      });

      const generatedData: MaterialResultData = {
        ...resData.data,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        disciplina: input.disciplina,
        segmento: input.segmento,
        ano: input.ano,
        tipo: tipoToUse,
      };

      setCurrentResult(generatedData);
      setTimeout(() => {
        document.getElementById('resultado-gerado')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          'Não foi possível identificar uma habilidade BNCC com segurança para este conteúdo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHistory = (materialToSave: MaterialResultData) => {
    if (!materialToSave.id) {
      materialToSave.id = Math.random().toString(36).substring(2, 9);
    }
    setHistory((prev) => {
      const exists = prev.some((item) => item.id === materialToSave.id);
      if (exists) {
        return prev.map((item) => (item.id === materialToSave.id ? materialToSave : item));
      }
      return [materialToSave, ...prev];
    });
  };

  const handleUpdateMaterialFolder = (
    materialId: string,
    turmaNome: string,
    bimestre: '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre'
  ) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === materialId ? { ...item, turmaNome, bimestre } : item
      )
    );
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de materiais?')) {
      setHistory([]);
    }
  };

  const isCurrentSaved = currentResult
    ? history.some((item) => item.id === currentResult.id)
    : false;

  const handleSwitchAccount = () => {
    try {
      localStorage.removeItem('aula_clara_google_user');
    } catch (e) {
      console.error(e);
    }
    setGoogleUser(null);
  };

  return (
    <div className="min-h-screen bg-auguste-cream text-auguste-text font-sans flex flex-col selection:bg-auguste-tan/30 selection:text-auguste-slate">
      {/* First Time Google Login Modal overlay */}
      {!googleUser && (
        <GoogleAuthModal onLoginSuccess={(user) => setGoogleUser(user)} />
      )}

      {/* Expired 30-Day Trial Lockout Overlay */}
      {googleUser && isTrialExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md font-sans animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-md border border-red-200">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-wider inline-block">
                Período de Teste Finalizado
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Seu Teste de 30 Dias Expirou
              </h2>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                A conta <strong className="text-slate-900 font-bold">{googleUser.email}</strong> completou o período de avaliação gratuita de 30 dias na plataforma Aula Clara.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <p className="font-bold text-slate-800 flex justify-between">
                <span>E-mail da conta:</span>
                <span className="truncate max-w-[180px]">{googleUser.email}</span>
              </p>
              <p className="font-bold text-slate-800 flex justify-between">
                <span>Data do cadastro:</span>
                <span>
                  {googleUser.createdAt
                    ? new Date(googleUser.createdAt).toLocaleDateString('pt-BR')
                    : 'Há mais de 30 dias'}
                </span>
              </p>
              <p className="font-bold text-slate-800 flex justify-between">
                <span>Duração do teste:</span>
                <span>30 Dias (Esgotado)</span>
              </p>
              <p className="font-bold text-slate-800 flex justify-between pt-1 border-t border-slate-200">
                <span>Status da sessão:</span>
                <span className="text-red-600 font-black">Bloqueado por término de teste</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar e Entrar com Outra Conta</span>
              </button>

              <a
                href={`https://wa.me/?text=Olá!%20Meu%20período%20de%20teste%20de%2030%20dias%20no%20AulaClara%20expirou%20(${encodeURIComponent(googleUser.email)}).%20Gostaria%20de%20renovar%20meu%20acesso.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Falar com o Suporte para Liberar Acesso</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Cadastro Onboarding Modal overlay after Google Sign-in */}
      {googleUser && !googleUser.hasCompletedOnboarding && (
        <TeacherOnboardingModal
          googleUser={googleUser}
          onComplete={(updatedUser) => setGoogleUser(updatedUser)}
          onSwitchAccount={handleSwitchAccount}
        />
      )}

      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={history.length}
        googleUser={googleUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {(activeTab === 'generator' || activeTab === 'provas' || activeTab === 'bimestral') && (
          <div className="space-y-8">
            {/* Form */}
            <GeneratorForm
              input={input}
              setInput={setInput}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />

            {/* Generated Output Result */}
            {currentResult && (
              <div id="resultado-gerado" className="scroll-mt-6">
                <MaterialResult
                  key={currentResult.id}
                  material={currentResult}
                  onSaveHistory={handleSaveHistory}
                  onOpenPrint={(mat, incGab) =>
                    setPrintModalData({ material: mat, includeGabarito: incGab })
                  }
                  isSaved={isCurrentSaved}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'database' && <BnccDatabaseViewer />}

        {activeTab === 'tools' && <TeacherToolsTab googleUser={googleUser} />}

        {activeTab === 'access_management' && (
          <AccessManagement currentUser={googleUser} />
        )}

        {activeTab === 'account' && <UserAccountManagement />}

        {activeTab === 'history' && (
          <HistoryViewer
            history={history}
            onSelect={(item) => {
              setCurrentResult(item);
              setActiveTab('generator');
            }}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearHistory}
            onUpdateMaterialFolder={handleUpdateMaterialFolder}
            onNavigateToGenerator={(ano) => {
              if (ano) {
                setInput((prev) => ({ ...prev, ano }));
              }
              setActiveTab('generator');
            }}
          />
        )}

        {activeTab === 'guide' && <BnccGuide />}
      </main>

      {/* Print Modal */}
      {printModalData && (
        <PrintModal
          material={printModalData.material}
          includeGabaritoDefault={printModalData.includeGabarito}
          onClose={() => setPrintModalData(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-auguste-sand/60 text-auguste-muted py-6 text-xs text-center font-medium mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-auguste-slate flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-auguste-slate"></span>
            Aula Clara • {googleUser?.school || 'Plataforma Docente IA'}
          </span>
          <span className="text-auguste-muted">
            Da apostila para o bimestre inteiro • Alinhamento automático BNCC
          </span>
        </div>
      </footer>
    </div>
  );
}
