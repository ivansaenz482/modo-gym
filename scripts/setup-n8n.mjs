#!/usr/bin/env node
/**
 * Puesta a punto automática de N8n para MODO GYM:
 *  1. Comprueba que N8n está corriendo.
 *  2. Crea la cuenta de administrador (owner) si es la primera vez,
 *     o inicia sesión si ya existe.
 *  3. Crea (y guarda en .env) una clave de la API pública de N8n.
 *  4. Importa y ACTIVA el workflow generador de rutinas.
 *  5. Muestra la URL del webhook.
 *
 * Uso:
 *   npm run n8n:setup
 *
 * Requisitos en .env:
 *   N8N_WEBHOOK_URL=http://localhost:5678
 *   N8N_OWNER_EMAIL=admin@modogym.com
 *   N8N_OWNER_PASSWORD=una_contraseña_segura
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");
const workflowPath = join(root, "n8n", "workflow-routine-generator.json");
const workflowName = "Generador de Rutinas MODO GYM";

function loadEnv() {
  if (!existsSync(envPath)) return {};
  return readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .reduce((acc, line) => {
      const i = line.indexOf("=");
      acc[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      return acc;
    }, {});
}

function setEnvVar(name, value) {
  if (!existsSync(envPath)) return;
  let content = readFileSync(envPath, "utf8");
  const re = new RegExp(`^${name}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${name}=${value}`);
  } else {
    content += `\n${name}=${value}`;
  }
  writeFileSync(envPath, content);
}

function fail(message) {
  console.error(`\u274c ${message}`);
  process.exit(1);
}

const WORKFLOW_SCOPES = ["workflow:list", "workflow:read", "workflow:create", "workflow:update", "workflow:delete"];

async function main() {
  const env = loadEnv();
  const base = (env.N8N_WEBHOOK_URL || "http://localhost:5678").replace(/\/+$/, "");
  const apiUrl = `${base}/api/v1`;
  const ownerEmail = env.N8N_OWNER_EMAIL || "admin@modogym.com";
  const ownerPassword = env.N8N_OWNER_PASSWORD;

  console.log(`\n== MODO GYM \u2014 setup de N8n ==\nConectando con ${base} ...`);

  // 1. Salud básica
  try {
    const hz = await fetch(`${base}/healthz`);
    if (!hz.ok) fail(`N8n responde mal (HTTP ${hz.status}).`);
  } catch (err) {
    fail(`No se pudo conectar con N8n: ${err.message}. Ejecuta primero: npm run docker:up`);
  }

  // 2. API key: probar la guardada en .env (si existe)
  let apiKey = env.N8N_API_KEY;
  let keyWorks = false;
  if (apiKey && !apiKey.includes("cambia_por") && !apiKey.includes("tu_clave")) {
    try {
      const res = await fetch(`${apiUrl}/workflows?limit=1`, {
        headers: { "X-N8N-API-KEY": apiKey },
      });
      if (res.ok) {
        keyWorks = true;
        console.log("\u2705 La clave N8N_API_KEY de .env ya funciona.");
      } else {
        console.log("\u2139\ufe0f  La clave N8N_API_KEY de .env no es válida, generando una nueva...");
      }
    } catch {
      keyWorks = false;
    }
  }

  // 3. Obtener una clave válida creando el owner / iniciando sesión
  if (!keyWorks) {
    if (!ownerPassword) {
      fail("Configura N8N_OWNER_PASSWORD en .env (contraseña del owner de N8n).");
    }

    // 3a. Intentar setup del owner (primera ejecución)
    let cookie = null;
    const setup = await fetch(`${base}/rest/owner/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ownerEmail,
        firstName: "Admin",
        lastName: "MODO GYM",
        password: ownerPassword,
      }),
    });
    if (setup.ok) {
      cookie = setup.headers.get("set-cookie")?.split(";")[0];
      console.log(`\u2705 Owner creado: ${ownerEmail}`);
    } else {
      // 3b. Ya existe owner → iniciar sesión
      console.log("\u2139\ufe0f  El owner ya existe, iniciando sesión...");
      const login = await fetch(`${base}/rest/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrLdapLoginId: ownerEmail, password: ownerPassword }),
      });
      if (!login.ok) {
        fail(`No se pudo iniciar sesión en N8n. Revisa N8N_OWNER_EMAIL / N8N_OWNER_PASSWORD en .env (respuesta ${login.status}).`);
      }
      cookie = login.headers.get("set-cookie")?.split(";")[0];
      console.log("\u2705 Sesión iniciada como owner.");
    }

    // 3c. Crear clave de API
    const createKey = await fetch(`${base}/rest/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        label: "modo-gym-local",
        expiresAt: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
        scopes: WORKFLOW_SCOPES,
      }),
    });
    const keyBody = await createKey.text();
    if (!createKey.ok) {
      fail(`No se pudo crear la clave de API de N8n (${createKey.status}): ${keyBody.slice(0, 200)}`);
    }
    apiKey = JSON.parse(keyBody).data.rawApiKey;
    setEnvVar("N8N_API_KEY", apiKey);
    console.log("\u2705 Clave de API creada y guardada en .env");
  }

  // 4. Importar y activar el workflow
  if (!existsSync(workflowPath)) fail(`No se encontró el workflow: ${workflowPath}`);
  const workflow = JSON.parse(readFileSync(workflowPath, "utf8"));
  workflow.name = workflowName;

  const headers = { "Content-Type": "application/json", "X-N8N-API-KEY": apiKey };
  const listRes = await fetch(`${apiUrl}/workflows?limit=100`, { headers });
  if (!listRes.ok) fail(`Error listando workflows (${listRes.status}).`);
  const list = await listRes.json();
  const existing = list.data.find((w) => w.name === workflowName);
  const { active: _omit, ...workflowPayload } = workflow;
  const body = JSON.stringify(workflowPayload);

  let id;
  if (existing) {
    console.log(`\u2699\ufe0f  Actualizando workflow "${workflowName}" (id ${existing.id})...`);
    const res = await fetch(`${apiUrl}/workflows/${existing.id}`, { method: "PUT", headers, body });
    if (!res.ok) fail(`Error actualizando workflow (${res.status}).`);
    id = (await res.json()).id;
  } else {
    console.log(`\u2699\ufe0f  Creando workflow "${workflowName}"...`);
    const res = await fetch(`${apiUrl}/workflows`, { method: "POST", headers, body });
    if (!res.ok) fail(`Error creando workflow (${res.status}): ${(await res.text()).slice(0, 300)}`);
    id = (await res.json()).id;
  }

  // Activar: la API pública no permite activar desde la clave, así que se usa
  // la sesión del owner vía la API interna (endpoint con versionId).
  const act = await fetch(`${apiUrl}/workflows/${id}/activate`, { method: "POST", headers });
  if (act.ok) {
    console.log(`\n\u2705 Workflow "${workflowName}" importado (id ${id}) y activado.`);
  } else {
    if (!ownerPassword) {
      console.warn(`\n\u26a0\ufe0f  Workflow importado (id ${id}) pero no activado. Configura N8N_OWNER_PASSWORD y vuelve a ejecutar: npm run n8n:setup`);
    } else {
      const login = await fetch(`${base}/rest/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrLdapLoginId: ownerEmail, password: ownerPassword }),
      });
      if (!login.ok) fail(`No se pudo iniciar sesión para activar el workflow (${login.status}).`);
      const cookie = login.headers.get("set-cookie")?.split(";")[0];

      const wfDetail = await fetch(`${base}/rest/workflows/${id}`, { headers: { Cookie: cookie } });
      const wfJson = await wfDetail.json();
      const versionId = wfJson.data?.versionId;
      if (!versionId) fail("No se obtuvo versionId del workflow.");
      const act2 = await fetch(`${base}/rest/workflows/${id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ versionId }),
      });
      if (!act2.ok) fail(`No se pudo activar el workflow (${act2.status}): ${(await act2.text()).slice(0, 200)}`);
      console.log(`\n\u2705 Workflow "${workflowName}" importado (id ${id}) y activado.`);
    }
  }
  console.log(`\nWebhook de rutinas:\n  ${base}/webhook/routine-generator`);
  console.log("\nPrueba rápida:");
  console.log(`  curl -X POST ${base}/webhook/routine-generator -H "Content-Type: application/json" -d '{"daysPerWeek":4,"goal":"GANAR_MASA","experience":"INTERMEDIO"}'`);
  console.log("\nNota: el webhook llama a OpenAI. Define OPENAI_API_KEY en N8n (Settings \u2192 Variables) para que la IA responda; mientras tanto la API usa su generador local.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
