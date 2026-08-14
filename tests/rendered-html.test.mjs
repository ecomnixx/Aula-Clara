import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("a experiência principal oferece captura, OCR, aula, prova e pastas", async () => {
  const page = await read("app/page.tsx");
  for (const label of [
    "Abrir câmera",
    "Escolher arquivos",
    "Limpar material lido",
    "Capturar a tela inteira",
    "Ler imagens",
    "Gerar aula",
    "Gerar prova",
    "Baixar Word",
    "Salvar na pasta",
  ]) assert.match(page, new RegExp(label));
  assert.match(page, /\[\.\.\.mc,\.\.\.disc\]/);
  assert.match(page, /font-family:Arial/);
  assert.match(page, /font-size:11pt/);
  assert.match(page, /line-height:1/);
  assert.match(page, /GABARITO DO PROFESSOR/);
  assert.match(page, /\[1,2,3,4\]/);
  assert.match(page, /foto-camera-/);
  assert.match(page, /cleanOcrText/);
  assert.doesNotMatch(page, /Importação rápida/);
});

test("menu lateral simplificado cobre as áreas essenciais e a área master", async () => {
  const page = await read("app/page.tsx");
  for (const label of [
    "Área inicial",
    "Banco de provas",
    "Materiais e turmas",
    "Arquivos salvos",
    "Minha conta e acessos",
    "Gerenciar acessos",
  ]) assert.match(page, new RegExp(label));
  assert.match(page, /access\.isMaster/);
  assert.match(page, /notification-bell/);
  assert.match(page, /Downloads e atualizações/);
  assert.match(page, /pendingRegistrations/);
});

test("gerenciamento isolado permite pesquisar e controlar dias", async () => {
  const manager = await read("app/access-management/access-manager.tsx");
  const context = await read("app/access-management/access-context.tsx");
  assert.match(manager, /Buscar por nome ou e-mail/);
  assert.match(manager, /Pasta de acessos/);
  assert.match(manager, /Todos/);
  assert.match(manager, /Novos/);
  assert.match(manager, /Restam/);
  assert.match(manager, /Cadastrar e liberar acesso/);
  assert.match(manager, /changeDays\(item, -1\)/);
  assert.match(manager, /changeDays\(item, 1\)/);
  assert.match(manager, /Salvar novo prazo/);
  assert.match(manager, /postgres_changes/);
  assert.match(manager, /Pausar|Reativar/);
  assert.match(manager, /Remover/);
  assert.match(manager, /access_events/);
  assert.match(context, /openAccessManager/);
});

test("PWA está instalável como aplicativo Android", async () => {
  const manifest = JSON.parse(await read("public/manifest.webmanifest"));
  const sw = await read("public/sw.js");
  const auth = await read("app/auth-gate.tsx");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "portrait-primary");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.icons.length, 2);
  assert.ok(manifest.icons.every((icon) => icon.purpose.includes("maskable")));
  assert.match(sw, /skipWaiting/);
  assert.match(sw, /clients\.claim/);
  assert.match(auth, /beforeinstallprompt/);
  assert.match(auth, /Instalar aplicativo neste dispositivo/);
});

test("banco usa RLS e trilha de auditoria para acessos", async () => {
  const migration = await read("supabase/migrations/20260810_access_management.sql");
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /create table if not exists public\.access_events/i);
  assert.match(migration, /is_aula_clara_master/i);
  assert.match(migration, /touch_current_access/i);
  assert.match(migration, /last_seen_at/i);
});
