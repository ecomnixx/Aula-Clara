"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Grant = {
  email: string;
  display_name: string | null;
  role: "master" | "client";
  status: "active" | "blocked";
  lifetime: boolean;
  expires_at: string | null;
};

const MASTER_EMAIL = "ecomnixx@gmail.com";

function remainingDays(grant: Grant | null) {
  if (!grant || grant.lifetime || !grant.expires_at) return null;
  return Math.max(0, Math.ceil((new Date(grant.expires_at).getTime() - Date.now()) / 86400000));
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [days, setDays] = useState(30);
  const [announcement, setAnnouncement] = useState("");

  const loadGrant = useCallback(async (activeSession: Session | null) => {
    if (!activeSession?.user.email) { setGrant(null); setLoading(false); return; }
    const { data } = await supabase.from("access_grants").select("email,display_name,role,status,lifetime,expires_at").eq("email", activeSession.user.email).maybeSingle();
    setGrant((data as Grant | null) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); loadGrant(data.session); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); loadGrant(next); });
    return () => data.subscription.unsubscribe();
  }, [loadGrant]);

  const daysLeft = useMemo(() => remainingDays(grant), [grant]);
  const expired = grant && !grant.lifetime && (!grant.expires_at || new Date(grant.expires_at).getTime() <= Date.now());
  const allowed = grant?.status === "active" && !expired;
  const master = grant?.role === "master" || session?.user.email?.toLowerCase() === MASTER_EMAIL;

  async function submit() {
    setMessage("Processando...");
    if (!email || password.length < 6) { setMessage("Informe o e-mail e uma senha com pelo menos 6 caracteres."); return; }
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (result.error) setMessage(result.error.message);
    else setMessage(mode === "signup" ? "Conta criada. Confira seu e-mail para confirmar o acesso." : "Acesso realizado.");
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

  async function loadGrants() {
    const { data } = await supabase.from("access_grants").select("email,display_name,role,status,lifetime,expires_at").order("created_at", { ascending: false });
    setGrants((data as Grant[]) || []);
  }

  useEffect(() => { if (master && adminOpen) loadGrants(); }, [master, adminOpen]);

  async function addAccess() {
    if (!newEmail) return;
    const expires = new Date(Date.now() + Math.max(1, days) * 86400000).toISOString();
    const { error } = await supabase.from("access_grants").upsert({ email: newEmail.trim().toLowerCase(), display_name: newName.trim() || null, role: "client", status: "active", lifetime: false, expires_at: expires });
    setMessage(error ? error.message : "Acesso cadastrado.");
    if (!error) { setNewEmail(""); setNewName(""); loadGrants(); }
  }

  async function changeDays(item: Grant, amount: number) {
    const base = item.expires_at && new Date(item.expires_at).getTime() > Date.now() ? new Date(item.expires_at).getTime() : Date.now();
    await supabase.from("access_grants").update({ lifetime: false, status: "active", expires_at: new Date(base + amount * 86400000).toISOString() }).eq("email", item.email);
    loadGrants();
  }

  async function toggleBlock(item: Grant) {
    await supabase.from("access_grants").update({ status: item.status === "active" ? "blocked" : "active" }).eq("email", item.email);
    loadGrants();
  }

  async function sendAnnouncement() {
    if (!announcement.trim()) return;
    const { error } = await supabase.from("announcements").insert({ title: "Aviso do Aula Clara", body: announcement.trim(), created_by_email: MASTER_EMAIL });
    setMessage(error ? error.message : "Aviso enviado aos usuários.");
    if (!error) setAnnouncement("");
  }

  if (loading) return <div className="auth-loading"><span></span><b>Abrindo Aula Clara...</b></div>;

  if (!session) return <main className="login-page">
    <section className="login-card">
      <div className="login-logo">A</div><span className="eyebrow">PLATAFORMA DOCENTE</span>
      <h1>Bem-vindo ao Aula Clara</h1><p>Entre para criar aulas, provas e organizar seus materiais.</p>
      {mode === "signup" && <label>Seu nome<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do professor" /></label>}
      <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professor@email.com" /></label>
      <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" /></label>
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
      <button className="link-button" onClick={magicLink}>Receber link de acesso por e-mail</button>
      <button className="link-button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}</button>
      {message && <div className="auth-message">{message}</div>}
      <small>Sua sessão fica salva neste aparelho para você não precisar entrar novamente.</small>
    </section>
  </main>;

  if (!allowed) return <main className="login-page"><section className="login-card access-blocked">
    <div className="login-logo">A</div><h1>{grant?.status === "blocked" ? "Acesso pausado" : expired ? "Período encerrado" : "Aguardando liberação"}</h1>
    <p>O e-mail <b>{session.user.email}</b> já está conectado, mas ainda não possui um período ativo.</p>
    <p>Solicite ao administrador a liberação ou renovação do acesso.</p>
    <button className="login-primary" onClick={() => supabase.auth.signOut()}>Usar outro e-mail</button>
  </section></main>;

  return <>
    {daysLeft !== null && daysLeft <= 7 && <div className="expiry-banner">Seu acesso termina em <b>{daysLeft} dia(s)</b>. Fale com o administrador para renovar.</div>}
    <div className="account-fab">
      {master && <button onClick={() => setAdminOpen(true)} title="Gerenciar acessos">⚙</button>}
      <button onClick={() => setAccountOpen(true)} title="Minha conta">{(grant?.display_name || session.user.email || "P").slice(0, 1).toUpperCase()}</button>
    </div>
    {children}
    {accountOpen && <div className="admin-backdrop" onClick={() => setAccountOpen(false)}><section className="account-panel" onClick={e => e.stopPropagation()}>
      <button className="panel-close" onClick={() => setAccountOpen(false)}>×</button><h2>Minha conta</h2>
      <p><b>{grant?.display_name || "Professor(a)"}</b><br />{session.user.email}</p>
      <div className="access-status">{grant?.lifetime ? "Acesso vitalício" : `${daysLeft} dia(s) restantes`}</div>
      {master && <button className="login-primary" onClick={() => { setAccountOpen(false); setAdminOpen(true); }}>Gerenciar acessos</button>}
      <button className="link-button" onClick={() => supabase.auth.signOut()}>Sair deste aparelho</button>
    </section></div>}
    {adminOpen && <div className="admin-backdrop"><section className="admin-panel">
      <button className="panel-close" onClick={() => setAdminOpen(false)}>×</button><span className="eyebrow">PAINEL MASTER</span><h2>Gerenciar acessos</h2><p>Cadastre clientes, renove dias ou pause um acesso.</p>
      <div className="admin-form"><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome" /><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="E-mail do cliente" /><input type="number" min="1" value={days} onChange={e => setDays(Number(e.target.value))} /><button onClick={addAccess}>Liberar acesso</button></div>
      <div className="grant-list">{grants.map(item => <article key={item.email}><div><b>{item.display_name || "Professor(a)"}</b><span>{item.email}</span><small>{item.lifetime ? "Vitalício" : `${remainingDays(item)} dia(s)`} · {item.status === "active" ? "Ativo" : "Pausado"}</small></div>{item.role !== "master" && <footer><button onClick={() => changeDays(item, 7)}>+7 dias</button><button onClick={() => changeDays(item, 30)}>+30 dias</button><button onClick={() => toggleBlock(item)}>{item.status === "active" ? "Pausar" : "Reativar"}</button></footer>}</article>)}</div>
      <div className="announcement-form"><h3>Enviar aviso aos usuários</h3><textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Digite uma mensagem..." /><button onClick={sendAnnouncement}>Enviar aviso</button></div>
      {message && <div className="auth-message">{message}</div>}
    </section></div>}
  </>;
}
