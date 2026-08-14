"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { accessTimestamp, remainingDays, type AccessGrant } from "./types";

type Props = { onClose: () => void };
type Drafts = Record<string, { amount: number; exactDays: number }>;

function formatDeadline(value: string | null) {
  if (!value) return "Sem prazo definido";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function AccessManager({ onClose }: Props) {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [search, setSearch] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [days, setDays] = useState(15);
  const [drafts, setDrafts] = useState<Drafts>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadGrants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_grants")
      .select("email,display_name,role,status,lifetime,expires_at,created_at,last_seen_at,admin_reviewed_at")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    const loaded = (data as AccessGrant[]) || [];
    setGrants(loaded);
    setDrafts(current => {
      const next = { ...current };
      for (const item of loaded) next[item.email] ??= { amount: 1, exactDays: remainingDays(item) ?? 30 };
      return next;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadGrants(); }, 0);
    const channel = supabase.channel("master-access-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "access_grants" }, () => { void loadGrants(); })
      .subscribe();
    return () => { window.clearTimeout(timer); void supabase.removeChannel(channel); };
  }, [loadGrants]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return grants;
    return grants.filter(item => `${item.display_name ?? ""} ${item.email}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [grants, search]);

  async function audit(email: string, action: string, delta = 0) {
    await supabase.from("access_events").insert({ access_email: email, action, days_delta: delta });
  }

  async function addAccess() {
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) { setMessage("Informe um e-mail válido."); return; }
    const safeDays = Math.max(1, Math.floor(days || 1));
    const expiresAt = new Date(Date.now() + safeDays * 86400000).toISOString();
    const { error } = await supabase.from("access_grants").upsert({ email: normalizedEmail, display_name: newName.trim() || null, role: "client", status: "active", lifetime: false, expires_at: expiresAt, admin_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    if (error) { setMessage(error.message); return; }
    await audit(normalizedEmail, "access_created", safeDays);
    setMessage(`Acesso liberado por ${safeDays} dias.`);
    setNewEmail(""); setNewName("");
    await loadGrants();
  }

  function setDraft(email: string, field: "amount" | "exactDays", value: number) {
    setDrafts(current => ({ ...current, [email]: { amount: current[email]?.amount ?? 1, exactDays: current[email]?.exactDays ?? 30, [field]: Math.max(1, Math.floor(value || 1)) } }));
  }

  async function changeDays(item: AccessGrant, direction: 1 | -1) {
    const amount = drafts[item.email]?.amount ?? 1;
    const now = accessTimestamp();
    const current = item.expires_at ? new Date(item.expires_at).getTime() : now;
    const base = direction > 0 ? Math.max(current, now) : current;
    const expiresAt = new Date(Math.max(now, base + direction * amount * 86400000)).toISOString();
    const { error } = await supabase.from("access_grants").update({ lifetime: false, status: "active", expires_at: expiresAt, admin_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("email", item.email);
    if (error) { setMessage(error.message); return; }
    await audit(item.email, direction > 0 ? "days_added" : "days_removed", direction * amount);
    setMessage(`${amount} dia(s) ${direction > 0 ? "adicionado(s)" : "retirado(s)"} de ${item.display_name || item.email}.`);
    await loadGrants();
  }

  async function saveExactDeadline(item: AccessGrant) {
    const exactDays = drafts[item.email]?.exactDays ?? 1;
    const expiresAt = new Date(Date.now() + exactDays * 86400000).toISOString();
    const { error } = await supabase.from("access_grants").update({ lifetime: false, status: "active", expires_at: expiresAt, admin_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("email", item.email);
    if (error) { setMessage(error.message); return; }
    await audit(item.email, "deadline_replaced", exactDays);
    setMessage(`Novo prazo de ${exactDays} dia(s) salvo.`);
    await loadGrants();
  }

  async function toggleBlock(item: AccessGrant) {
    const nextStatus = item.status === "active" ? "blocked" : "active";
    const { error } = await supabase.from("access_grants").update({ status: nextStatus, admin_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("email", item.email);
    if (error) { setMessage(error.message); return; }
    await audit(item.email, nextStatus === "active" ? "access_reactivated" : "access_paused");
    await loadGrants();
  }

  async function removeAccess(item: AccessGrant) {
    if (!window.confirm(`Remover o acesso de ${item.email}?`)) return;
    await audit(item.email, "access_removed");
    const { error } = await supabase.from("access_grants").delete().eq("email", item.email);
    if (error) { setMessage(error.message); return; }
    setMessage("Acesso removido.");
    await loadGrants();
  }

  async function keepTrial(item: AccessGrant) {
    const { error } = await supabase.from("access_grants").update({ admin_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("email", item.email);
    if (error) { setMessage(error.message); return; }
    await audit(item.email, "trial_reviewed");
    setMessage(`Teste de ${item.display_name || item.email} mantido.`);
    await loadGrants();
  }

  return <div className="admin-backdrop access-page" role="presentation">
    <section className="admin-panel access-manager" role="dialog" aria-modal="true" aria-labelledby="access-manager-title">
      <button className="panel-close" onClick={onClose} aria-label="Fechar">×</button>
      <span className="eyebrow">ÁREA EXCLUSIVA DA CONTA MASTER</span>
      <h2 id="access-manager-title">Gerenciar acessos</h2>
      <p>Cadastre professores, defina prazos e acompanhe cada acesso. As alterações chegam automaticamente ao aplicativo do usuário.</p>

      <section className="new-access-card" aria-labelledby="new-access-title">
        <div><span className="section-icon">＋</span><div><h3 id="new-access-title">Cadastrar novo usuário</h3><p>Use o mesmo e-mail que a pessoa utilizará para entrar com o Google.</p></div></div>
        <div className="admin-form">
          <input value={newName} onChange={event => setNewName(event.target.value)} placeholder="Nome do usuário (opcional)" aria-label="Nome do usuário" />
          <input type="email" value={newEmail} onChange={event => setNewEmail(event.target.value)} placeholder="E-mail Google" aria-label="E-mail Google" />
          <label><span>Dias de acesso</span><input type="number" min="1" value={days} onChange={event => setDays(Number(event.target.value))} /></label>
          <button onClick={addAccess}>Cadastrar e liberar acesso</button>
        </div>
      </section>

      <div className="access-tools">
        <label className="access-search"><span aria-hidden="true">⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" aria-label="Buscar por nome ou e-mail" /></label>
        <button className="refresh-access" onClick={() => void loadGrants()} disabled={loading}><span aria-hidden="true">↻</span>{loading ? "Atualizando..." : "Atualizar usuários"}</button>
      </div>

      <div className="access-summary"><b>{filtered.length}</b> e-mail(s) encontrado(s)<span>{grants.filter(item => item.status === "active").length} ativos</span></div>
      <div className="grant-list">
        {loading && grants.length === 0 && <div className="access-empty">Carregando usuários...</div>}
        {!loading && filtered.map(item => <article key={item.email} className={`${item.status === "blocked" ? "grant-paused" : ""} ${!item.admin_reviewed_at && item.role !== "master" ? "grant-new" : ""}`}>
          {!item.admin_reviewed_at && item.role !== "master" && <div className="new-registration-label">● Novo cadastro · teste automático de 15 dias</div>}
          <div className="grant-person"><span className="grant-avatar">{(item.display_name || item.email).slice(0, 1).toUpperCase()}</span><div><b>{item.display_name || "Professor(a)"}</b><span>{item.email}</span><small>{item.lifetime ? "✓ Acesso master vitalício" : `${item.status === "active" ? "✓ Ativo" : "Pausado"} até ${formatDeadline(item.expires_at)}`}</small>{item.last_seen_at && <small>Último acesso: {formatDeadline(item.last_seen_at)}</small>}</div></div>
          {item.role !== "master" && <div className="grant-controls">
            <div className="days-remaining">Restam <b>{remainingDays(item) ?? 0} dias</b></div>
            <label className="control-input"><span>Quantidade para adicionar ou retirar</span><input type="number" min="1" value={drafts[item.email]?.amount ?? 1} onChange={event => setDraft(item.email, "amount", Number(event.target.value))} /></label>
            <div className="adjust-buttons"><button onClick={() => void changeDays(item, -1)}>− Retirar</button><button className="add-days" onClick={() => void changeDays(item, 1)}>＋ Adicionar</button></div>
            <label className="control-input exact-days"><span>Definir prazo exato em dias</span><input type="number" min="1" value={drafts[item.email]?.exactDays ?? 1} onChange={event => setDraft(item.email, "exactDays", Number(event.target.value))} /></label>
            <button className="save-deadline" onClick={() => void saveExactDeadline(item)}>Salvar novo prazo</button>
            <div className="secondary-actions"><button onClick={() => void toggleBlock(item)}>{item.status === "active" ? "Pausar acesso" : "Reativar acesso"}</button><button className="danger" onClick={() => void removeAccess(item)}>Remover</button></div>
            {!item.admin_reviewed_at && <button className="keep-trial" onClick={() => void keepTrial(item)}>Manter teste de 15 dias</button>}
          </div>}
        </article>)}
        {!loading && filtered.length === 0 && <div className="access-empty"><span>⌕</span><b>Nenhum acesso encontrado</b><small>Revise o nome ou e-mail pesquisado.</small></div>}
      </div>
      {message && <div className="auth-message floating-message" role="status">{message}</div>}
    </section>
  </div>;
}
