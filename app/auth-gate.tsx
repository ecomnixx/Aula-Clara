"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import AccessManager from "./access-management/access-manager";
import { AccessContext } from "./access-management/access-context";
import { isGrantExpired, remainingDays, type AccessGrant } from "./access-management/types";

const MASTER_EMAIL = "ecomnixx@gmail.com";
const APP_INSTALL_URL = "https://aula-clara-professor-tawny.vercel.app/";
const APP_DOWNLOAD_URL = "https://aula-clara-professor-tawny.vercel.app/baixar.html";
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const SESSION_TIMEOUT_MS = 8000;

async function withTimeout<T>(request: PromiseLike<T>, milliseconds = SESSION_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    Promise.resolve(request),
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("Tempo de conexão excedido")), milliseconds)),
  ]);
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [grant, setGrant] = useState<AccessGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [installLinkMessage, setInstallLinkMessage] = useState("");
  const [connectionError, setConnectionError] = useState(false);

  const loadGrant = useCallback(async (activeSession: Session | null) => {
    if (!activeSession?.user.email) { setGrant(null); setLoading(false); return; }
    try {
      const { data, error } = await withTimeout(supabase.from("access_grants").select("email,display_name,role,status,lifetime,expires_at,created_at,last_seen_at,admin_reviewed_at").eq("email", activeSession.user.email).maybeSingle());
      if (error) throw error;
      setConnectionError(false);
      setGrant((data as AccessGrant | null) ?? null);
      if (data) void supabase.rpc("touch_current_access");
    } catch (error) {
      console.error("[Aula Clara] Falha ao consultar o acesso", error);
      setConnectionError(true);
      setMessage("Não foi possível confirmar seu acesso. Verifique a internet e tente novamente.");
      setGrant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const watchdog = window.setTimeout(() => {
      if (!active) return;
      console.error("[Aula Clara] A abertura excedeu o tempo limite");
      setConnectionError(true);
      setMessage("A conexão demorou mais que o esperado. Tente entrar novamente.");
      setLoading(false);
    }, SESSION_TIMEOUT_MS + 1000);
    void withTimeout(supabase.auth.getSession()).then(({ data }) => {
      if (!active) return;
      window.clearTimeout(watchdog);
      setConnectionError(false);
      setSession(data.session);
      void loadGrant(data.session);
    }).catch(error => {
      if (!active) return;
      window.clearTimeout(watchdog);
      console.error("[Aula Clara] Falha ao restaurar a sessão", error);
      setConnectionError(false);
      setMessage("A sessão anterior não pôde ser restaurada. Entre novamente para continuar.");
      setSession(null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); loadGrant(next); });
    return () => { active = false; window.clearTimeout(watchdog); data.subscription.unsubscribe(); };
  }, [loadGrant]);

  useEffect(() => {
    const activeEmail = session?.user.email;
    if (!activeEmail) return;
    const channel = supabase.channel(`access-live-${session.user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "access_grants", filter: `email=eq.${activeEmail}` }, () => { void loadGrant(session); })
      .subscribe();
    const refreshOnFocus = () => { if (document.visibilityState === "visible") void loadGrant(session); };
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => { document.removeEventListener("visibilitychange", refreshOnFocus); void supabase.removeChannel(channel); };
  }, [loadGrant, session]);

  useEffect(() => {
    const capturePrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const installed = () => { setInstallPrompt(null); setInstallHelp(false); };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", capturePrompt); window.removeEventListener("appinstalled", installed); };
  }, []);

  const daysLeft = useMemo(() => remainingDays(grant), [grant]);
  const expired = isGrantExpired(grant);
  const allowed = grant?.status === "active" && !expired;
  const master = grant?.role === "master" || session?.user.email?.toLowerCase() === MASTER_EMAIL;

  const loadPendingRegistrations = useCallback(async () => {
    if (!master) { setPendingRegistrations(0); return; }
    const { count } = await supabase.from("access_grants").select("email", { count: "exact", head: true }).eq("role", "client").is("admin_reviewed_at", null);
    setPendingRegistrations(count ?? 0);
  }, [master]);

  useEffect(() => {
    if (!master) return;
    const timer = window.setTimeout(() => { void loadPendingRegistrations(); }, 0);
    const channel = supabase.channel("master-new-signups")
      .on("postgres_changes", { event: "*", schema: "public", table: "access_grants" }, () => { void loadPendingRegistrations(); })
      .subscribe();
    return () => { window.clearTimeout(timer); void supabase.removeChannel(channel); };
  }, [loadPendingRegistrations, master]);

  async function submit() {
    setMessage("Processando...");
    if (!email || password.length < 6) { setMessage("Informe o e-mail e uma senha com pelo menos 6 caracteres."); return; }
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (result.error) setMessage(result.error.message);
    else setMessage(mode === "signup" ? "Conta criada com 15 dias de teste. Confira seu e-mail para confirmar o acesso." : "Acesso realizado.");
  }

  async function magicLink() {
    if (!email) { setMessage("Digite seu e-mail primeiro."); return; }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: location.origin } });
    setMessage(error ? error.message : "Enviamos um link de acesso para seu e-mail.");
  }

  async function googleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } });
    if (error) setMessage("O acesso Google ainda precisa ser habilitado pelo administrador. Use e-mail e senha por enquanto.");
  }

  async function installApp() {
    const alreadyInstalled = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (alreadyInstalled || !installPrompt) { setInstallHelp(true); return; }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  async function copyInstallLink() {
    try { await navigator.clipboard.writeText(APP_DOWNLOAD_URL); setInstallLinkMessage("Link de download copiado. Agora você pode enviá-lo ao professor."); }
    catch { setInstallLinkMessage(`Copie este endereço: ${APP_DOWNLOAD_URL}`); }
  }

  async function shareInstallLink() {
    if (navigator.share) await navigator.share({ title: "Baixar Aula Clara", text: "Baixe o aplicativo Aula Clara para Android.", url: APP_DOWNLOAD_URL });
    else await copyInstallLink();
  }

  if (loading) return <div className="auth-loading"><span></span><b>Abrindo Aula Clara...</b></div>;

  if (!session) return <main className="login-page">
    <section className="login-shell">
      <header className="login-brand"><div className="login-logo">A</div><div><span className="eyebrow">PLATAFORMA DOCENTE</span><strong>Aula Clara</strong></div></header>
      <section className="login-card">
      <div className="login-heading"><span>{mode === "login" ? "ACESSO DO PROFESSOR" : "NOVO CADASTRO"}</span><h1>{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</h1><p>{mode === "login" ? "Ainda não possui uma conta?" : "Já possui uma conta?"} <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Criar conta" : "Entrar"}</button></p></div>
      <div className="login-fields">
      {mode === "signup" && <label>Seu nome<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do professor" autoComplete="name" /></label>}
      <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professor@email.com" autoComplete="email" /></label>
      <label>Senha<div className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? "◉" : "◎"}</button></div></label>
      {mode === "login" && <button className="forgot-link" onClick={magicLink}>Esqueci minha senha</button>}
      <button className="login-primary" onClick={submit}>{mode === "login" ? "Entrar" : "Criar minha conta"}</button>
      <button className="google-button" onClick={googleLogin}>
        <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
          <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
        </svg>
        <span>Continuar com Google</span>
      </button>
      </div>
      {message && <div className="auth-message">{message}</div>}
      <small>Sua sessão fica salva neste aparelho para você não precisar entrar novamente.</small>
      </section>
      <footer>Planejamento, avaliações e organização em um só lugar.</footer>
    </section>
  </main>;

  if (connectionError) return <main className="login-page"><section className="login-card access-blocked">
    <div className="login-logo">A</div><h1>Não foi possível conectar</h1>
    <p>O Aula Clara não conseguiu confirmar sua sessão. Verifique se o aparelho está conectado à internet.</p>
    <button className="login-primary" onClick={() => location.reload()}>Tentar novamente</button>
    <button className="link-button" onClick={() => supabase.auth.signOut()}>Entrar com outro e-mail</button>
  </section></main>;

  if (!allowed) return <main className="login-page"><section className="login-card access-blocked">
    <div className="login-logo">A</div><h1>{grant?.status === "blocked" ? "Acesso pausado" : expired ? "Período encerrado" : "Aguardando liberação"}</h1>
    <p>O e-mail <b>{session.user.email}</b> já está conectado, mas ainda não possui um período ativo.</p>
    <p>Solicite ao administrador a liberação ou renovação do acesso.</p>
    <button className="login-primary" onClick={() => supabase.auth.signOut()}>Usar outro e-mail</button>
  </section></main>;

  return <AccessContext.Provider value={{ isMaster: master, openAccessManager: () => setAdminOpen(true), openAccount: () => setAccountOpen(true), openInstall: () => { setInstallHelp(false); setInstallLinkMessage(""); setInstallOpen(true); }, userEmail: session.user.email || "", userName: grant?.display_name || "Professor(a)", pendingRegistrations }}>
    {daysLeft !== null && daysLeft <= 7 && <div className="expiry-banner">Seu acesso termina em <b>{daysLeft} dia(s)</b>. Fale com o administrador para renovar.</div>}
    {children}
    {accountOpen && <div className="admin-backdrop" onClick={() => setAccountOpen(false)}><section className="account-panel" onClick={e => e.stopPropagation()}>
      <button className="panel-close" onClick={() => setAccountOpen(false)}>×</button><h2>Minha conta</h2>
      <p><b>{grant?.display_name || "Professor(a)"}</b><br />{session.user.email}</p>
      <div className="access-status">{grant?.lifetime ? "Acesso vitalício" : `${daysLeft} dia(s) restantes`}</div>
      {master && <button className="login-primary" onClick={() => { setAccountOpen(false); setAdminOpen(true); }}>Gerenciar acessos</button>}
      <button className="link-button" onClick={() => supabase.auth.signOut()}>Sair deste aparelho</button>
    </section></div>}
    {installOpen && <div className="admin-backdrop" onClick={() => setInstallOpen(false)}><section className="account-panel install-panel" onClick={event => event.stopPropagation()}>
      <button className="panel-close" onClick={() => setInstallOpen(false)}>×</button><span className="install-symbol">↓</span><h2>Downloads e atualizações</h2><p>Baixe o aplicativo Android ou instale a versão web diretamente no aparelho.</p>
      <a className="official-app-link" href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">{APP_DOWNLOAD_URL}</a>
      <a className="login-primary install-app-button android-download-button" href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">Baixar aplicativo para Android</a>
      <button className="login-primary" onClick={() => void installApp()}>Instalar versão web neste dispositivo</button>
      <div className="install-link-actions"><a href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">Abrir página de download</a><button onClick={() => void copyInstallLink()}>Copiar link</button><button onClick={() => void shareInstallLink()}>Compartilhar</button></div>
      {installLinkMessage && <div className="auth-message">{installLinkMessage}</div>}
      {installHelp && <div className="install-help">{window.matchMedia("(display-mode: standalone)").matches ? <><b>O aplicativo já está instalado.</b><br/>As atualizações são recebidas automaticamente quando você abrir o Aula Clara.</> : <>Abra este endereço no <b>Google Chrome</b>, toque no menu ⋮ e escolha <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</>}</div>}
      <small>Versão atual: Aula Clara 3.1 · atualização automática</small>
    </section></div>}
    {adminOpen && <AccessManager onClose={() => setAdminOpen(false)} />}
  </AccessContext.Provider>;
}
