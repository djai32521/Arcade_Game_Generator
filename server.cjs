"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_config2 = require("dotenv/config");
var import_express2 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_node_path2 = __toESM(require("node:path"), 1);
var import_node_fs2 = __toESM(require("node:fs"), 1);
var import_node_child_process2 = require("node:child_process");

// server/gemini-proxy.ts
var import_express = __toESM(require("express"), 1);
var import_node_crypto = __toESM(require("node:crypto"), 1);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_node_child_process = require("node:child_process");

// src/config.ts
var CONFIG = {
  LIVE: true,
  // false = demo mode (kill switch)
  AGENT_ID: "antigravity-preview-09-2026",
  AGENT_MODEL: "gemini-4-argon",
  GAMESMITH_AGENT: "gamesmith-v1",
  FLASH_MODEL: "gemini-4-argon",
  NANO_BANANA_MODEL: "gemini-3.1-flash-image",
  MAX_AGENT_TOKENS: 4e5,
  AGENT_TIMEOUT_MS: 24e4,
  IMAGE_TIMEOUT_MS: 25e3,
  RUNS_PER_SESSION: 15
  // overridden by ?admin=<token>
};

// src/vendor/managed-agents.js
var BASE_AGENT = "antigravity-preview-09-2026";
var codeExecution = () => ({ type: "code_execution" });
var googleSearch = () => ({ type: "google_search" });
var urlContext = () => ({ type: "url_context" });
var DEFAULT_TOOLS = [codeExecution(), googleSearch(), urlContext()];

// server/gemini-proxy.ts
var rootDir = process.cwd();
var UPSTREAM = (process.env.GEMINI_UPSTREAM || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
var PLACEHOLDER_KEYS = /* @__PURE__ */ new Set([
  "",
  "MY_GEMINI_API_KEY",
  "PLACEHOLDER_API_KEY",
  "YOUR_GEMINI_API_KEY",
  "YOUR_API_KEY",
  "unused"
]);
var EPHEMERAL_DEV_ADMIN_TOKEN = import_node_crypto.default.randomBytes(24).toString("hex");
function getEffectiveAdminToken() {
  if (process.env.ADMIN_TOKEN) {
    return process.env.ADMIN_TOKEN;
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return EPHEMERAL_DEV_ADMIN_TOKEN;
}
function getServerApiKey() {
  const jsonEnvFiles = [
    import_node_path.default.join(rootDir, ".dev.env.json"),
    "/tmp/.dev.env.json",
    "/app/.dev.env.json"
  ];
  for (const file of jsonEnvFiles) {
    try {
      if (import_node_fs.default.existsSync(file)) {
        const parsed = JSON.parse(import_node_fs.default.readFileSync(file, "utf8"));
        const val = parsed?.GEMINI_API_KEY || parsed?.API_KEY;
        if (typeof val === "string" && !PLACEHOLDER_KEYS.has(val.trim())) {
          return val.trim();
        }
      }
    } catch {
    }
  }
  const envCandidates = [process.env.GEMINI_API_KEY, process.env.API_KEY];
  for (const candidate of envCandidates) {
    if (typeof candidate === "string" && !PLACEHOLDER_KEYS.has(candidate.trim())) {
      return candidate.trim();
    }
  }
  return void 0;
}
var bakedForApiKey = null;
var inFlightBakeKey = null;
var activeBakePromise = null;
function invalidateGamesmithBakeCache() {
  bakedForApiKey = null;
  inFlightBakeKey = null;
  activeBakePromise = null;
}
function ensureGamesmithBaked(apiKey) {
  const key = apiKey || getServerApiKey();
  if (!key) return Promise.resolve();
  if ((bakedForApiKey === key || inFlightBakeKey === key) && activeBakePromise) {
    return activeBakePromise;
  }
  const bakeScript = import_node_path.default.join(rootDir, "scripts", "bake-agent.mjs");
  if (!import_node_fs.default.existsSync(bakeScript)) {
    return Promise.resolve();
  }
  inFlightBakeKey = key;
  activeBakePromise = new Promise((resolve) => {
    (0, import_node_child_process.execFile)(
      process.execPath,
      [bakeScript, "--if-missing"],
      { cwd: rootDir, env: { ...process.env, GEMINI_API_KEY: key } },
      (err, stdout) => {
        inFlightBakeKey = null;
        if (err) {
          console.warn("[playglow-server] background bake-agent check warning:", err.message);
          bakedForApiKey = null;
          activeBakePromise = null;
        } else {
          bakedForApiKey = key;
          if (stdout) {
            console.log("[playglow-server] gamesmith-v1 ready on active project key");
          }
        }
        resolve();
      }
    );
  });
  return activeBakePromise;
}
var HOP_REQ_HEADERS = /* @__PURE__ */ new Set([
  "host",
  "content-length",
  "connection",
  "accept-encoding",
  "x-goog-api-key",
  "authorization",
  "x-admin-token",
  "x-guardrail-probe",
  "x-selftest",
  "origin",
  "referer",
  "cookie"
]);
var HOP_RES_HEADERS = /* @__PURE__ */ new Set([
  "content-length",
  "content-encoding",
  "transfer-encoding",
  "connection"
]);
var ipBuildCounters = /* @__PURE__ */ new Map();
var ipImageCounters = /* @__PURE__ */ new Map();
var probeBuildCounters = /* @__PURE__ */ new Map();
var globalBuildCounter = { timestamps: [] };
var ONE_HOUR_MS = 36e5;
var STREAM_HUB_TTL_MS = 15 * 6e4;
var streamHub = /* @__PURE__ */ new Map();
var cancelledInteractions = /* @__PURE__ */ new Map();
function pruneCounterMap(map, now) {
  for (const [k, counter] of map.entries()) {
    counter.timestamps = counter.timestamps.filter((t) => now - t < ONE_HOUR_MS);
    if (counter.timestamps.length === 0) {
      map.delete(k);
    }
  }
}
function pruneHub(now) {
  for (const [id, entry] of streamHub.entries()) {
    if (now - entry.createdAt > STREAM_HUB_TTL_MS) {
      if (!entry.done) {
        try {
          entry.abortController.abort();
        } catch {
        }
      }
      streamHub.delete(id);
    }
  }
  for (const [id, ts] of cancelledInteractions.entries()) {
    if (now - ts > STREAM_HUB_TTL_MS) {
      cancelledInteractions.delete(id);
    }
  }
  pruneCounterMap(ipBuildCounters, now);
  pruneCounterMap(ipImageCounters, now);
  pruneCounterMap(probeBuildCounters, now);
}
var SseNormalizer = class {
  seenCreated = false;
  deltaSeqByStep = /* @__PURE__ */ new Map();
  genericSeq = 0;
  pendingStepStart = null;
  processRawBlock(rawBlock) {
    const out = [];
    const lines = rawBlock.split(/\r?\n/);
    let eventName = "";
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    if (dataLines.length === 0) return out;
    const payload = dataLines.join("\n").trim();
    if (payload === "[DONE]") {
      if (this.pendingStepStart) {
        out.push(this.finalizeObject(this.pendingStepStart.eventName, this.pendingStepStart.obj));
        this.pendingStepStart = null;
      }
      out.push({
        eventId: "__DONE__",
        sseText: `event: done
data: [DONE]

`
      });
      return out;
    }
    let obj;
    try {
      obj = JSON.parse(payload);
    } catch {
      return out;
    }
    if (obj.event_type === "interaction.created") {
      if (this.seenCreated) {
        return out;
      }
      this.seenCreated = true;
    }
    if (this.pendingStepStart) {
      const pendingObj = this.pendingStepStart.obj;
      if (obj.event_type === "step.delta" && obj.index === pendingObj.index && (obj.delta?.type === "code_execution_call" || obj.delta?.type === "code_execution_result")) {
        if (obj.delta.arguments !== void 0) pendingObj.step.arguments = obj.delta.arguments;
        if (obj.delta.result !== void 0) pendingObj.step.result = obj.delta.result;
        if (obj.delta.is_error !== void 0) pendingObj.step.is_error = obj.delta.is_error;
        if (obj.delta.exit_code !== void 0) pendingObj.step.exit_code = obj.delta.exit_code;
        out.push(this.finalizeObject(this.pendingStepStart.eventName, pendingObj));
        this.pendingStepStart = null;
        return out;
      } else {
        out.push(this.finalizeObject(this.pendingStepStart.eventName, pendingObj));
        this.pendingStepStart = null;
      }
    }
    if (obj.event_type === "step.start" && (obj.step?.type === "code_execution_call" && obj.step.arguments === void 0 || obj.step?.type === "code_execution_result" && obj.step.result === void 0)) {
      this.pendingStepStart = { eventName: eventName || "step.start", obj };
      return out;
    }
    out.push(this.finalizeObject(eventName || obj.event_type || "message", obj));
    return out;
  }
  flush() {
    if (!this.pendingStepStart) return [];
    const frame = this.finalizeObject(this.pendingStepStart.eventName, this.pendingStepStart.obj);
    this.pendingStepStart = null;
    return [frame];
  }
  finalizeObject(eventName, obj) {
    if (!obj.event_id) {
      const t = obj.event_type || eventName;
      if (t === "interaction.created") {
        obj.event_id = "evt_created";
      } else if (t === "interaction.status_update") {
        obj.event_id = `evt_status_${obj.status || "update"}`;
      } else if (t === "step.start") {
        obj.event_id = `evt_step_${obj.index ?? 0}_start`;
      } else if (t === "step.delta") {
        const idx = obj.index ?? 0;
        const seq = (this.deltaSeqByStep.get(idx) || 0) + 1;
        this.deltaSeqByStep.set(idx, seq);
        obj.event_id = `evt_step_${idx}_delta_${seq}`;
      } else if (t === "step.stop") {
        obj.event_id = `evt_step_${obj.index ?? 0}_stop`;
      } else if (typeof t === "string" && t.startsWith("interaction.")) {
        obj.event_id = `evt_terminal_${t}`;
      } else {
        this.genericSeq += 1;
        obj.event_id = `evt_${this.genericSeq}`;
      }
    }
    const eventId = String(obj.event_id);
    const sseText = `${eventName ? `event: ${eventName}
` : ""}id: ${eventId}
data: ${JSON.stringify(obj)}

`;
    return { eventId, sseText };
  }
};
function pruneAndCount(counter, now) {
  counter.timestamps = counter.timestamps.filter((t) => now - t < ONE_HOUR_MS);
  return counter.timestamps.length;
}
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}
function isAdmin(req) {
  const adminToken = getEffectiveAdminToken();
  if (!adminToken) return false;
  const headerToken = req.headers["x-admin-token"];
  return typeof headerToken === "string" && headerToken === adminToken;
}
function isSelftestContext(req) {
  if (isAdmin(req)) return true;
  if (req.headers["x-selftest"] === "1" || req.query.selftest !== void 0) return true;
  const ref = req.headers.referer || "";
  return ref.includes("selftest");
}
var ALLOWED_PATTERNS = [
  { method: "POST", regex: /^\/v1beta\/interactions$/ },
  { method: "GET", regex: /^\/v1beta\/interactions\/[^/]+$/ },
  { method: "POST", regex: /^\/v1beta\/interactions\/[^/]+\/cancel$/ },
  { method: "DELETE", regex: /^\/v1beta\/interactions\/[^/]+$/ },
  { method: "GET", regex: /^\/v1beta\/environments\/[^/]+\/files(\/.*)?$/ },
  { method: "DELETE", regex: /^\/v1beta\/environments\/[^/]+$/ },
  { method: "GET", regex: /^\/v1beta\/agents\/[^/]+$/ },
  { method: "POST", regex: /^\/v1beta\/models\/[^/:]+:generateContent$/ },
  { method: "GET", regex: /^\/v1beta\/environments$/, selftestOnly: true }
];
var ALLOWED_BASE_AGENTS = /* @__PURE__ */ new Set([
  BASE_AGENT,
  "antigravity-preview-09-2026"
]);
function checkAllowedPath(req, v1Path) {
  for (const rule of ALLOWED_PATTERNS) {
    if (rule.method === req.method && rule.regex.test(v1Path)) {
      if (rule.selftestOnly && !isSelftestContext(req)) {
        return { ok: false, status: 403, message: "GET /v1beta/environments is only allowed during ?selftest" };
      }
      return { ok: true };
    }
  }
  return { ok: false, status: 403, message: `${req.method} ${v1Path} is not allowlisted on /api/gemini` };
}
function resetProbeCaps() {
  probeBuildCounters.clear();
}
function resetAllCaps() {
  ipBuildCounters.clear();
  ipImageCounters.clear();
  probeBuildCounters.clear();
  globalBuildCounter.timestamps = [];
}
function writeSseHeaders(res) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}
function flushRes(res, chunk) {
  if (res.writableEnded) return;
  res.write(chunk);
  const flushable = res;
  if (typeof flushable.flush === "function") {
    flushable.flush();
  }
}
function attachClientToHubEntry(entry, res, lastEventId) {
  writeSseHeaders(res);
  let startIndex = 0;
  if (lastEventId) {
    const idx = entry.frames.findIndex((f) => f.eventId === lastEventId);
    if (idx !== -1) {
      startIndex = idx + 1;
    }
  }
  for (let i = startIndex; i < entry.frames.length; i++) {
    flushRes(res, entry.frames[i].sseText);
  }
  if (entry.done) {
    res.end();
    return;
  }
  const onFrame = (frame) => {
    if (res.writableEnded) {
      entry.subscribers.delete(onFrame);
      return;
    }
    if (frame === null) {
      entry.subscribers.delete(onFrame);
      res.end();
      return;
    }
    flushRes(res, frame.sseText);
  };
  entry.subscribers.add(onFrame);
  res.on("close", () => {
    entry.subscribers.delete(onFrame);
  });
}
function createGeminiProxyRouter() {
  const router = import_express.default.Router();
  router.use(import_express.default.raw({ type: "*/*", limit: "15mb" }));
  router.use(async (req, res) => {
    const now = Date.now();
    pruneHub(now);
    const subPath = req.path.startsWith("/") ? req.path : `/${req.path}`;
    const v1Match = subPath.match(/\/v1beta\/.*$/);
    const v1Path = v1Match ? v1Match[0] : subPath;
    const allowCheck = checkAllowedPath(req, v1Path);
    if (!allowCheck.ok) {
      res.status(allowCheck.status || 403).json({ error: { message: allowCheck.message } });
      return;
    }
    const admin = isAdmin(req);
    const ip = getClientIp(req);
    const isProbe = req.headers["x-guardrail-probe"] === "1";
    const isAiStudioDev = (process.env.NODE_ENV !== "production" || process.env.DISABLE_HMR === "true" || Boolean(process.env.K_SERVICE)) && !isProbe;
    const capBuildsPerIp = isAiStudioDev ? Number(process.env.CAP_BUILDS_PER_IP_HOUR || 60) : Number(process.env.CAP_BUILDS_PER_IP_HOUR || 3);
    const capBuildsGlobal = Number(process.env.CAP_BUILDS_GLOBAL_HOUR || 60);
    const capImagesPerIp = isAiStudioDev ? Number(process.env.CAP_IMAGES_PER_IP_HOUR || 180) : Number(process.env.CAP_IMAGES_PER_IP_HOUR || 36);
    const cancelMatch = req.method === "POST" ? v1Path.match(/^\/v1beta\/interactions\/([^/]+)\/cancel$/) : null;
    if (cancelMatch) {
      const interactionId = cancelMatch[1];
      cancelledInteractions.set(interactionId, now);
      const hubEntry = streamHub.get(interactionId);
      if (hubEntry && !hubEntry.done) {
        hubEntry.abortController.abort();
        hubEntry.done = true;
        for (const sub of hubEntry.subscribers) sub(null);
        hubEntry.subscribers.clear();
      }
      const apiKey2 = getServerApiKey();
      if (!apiKey2) {
        res.status(503).json({
          error: {
            code: "MISSING_SERVER_GEMINI_KEY",
            message: "Server missing GEMINI_API_KEY"
          }
        });
        return;
      }
      try {
        const cancelRes = await fetch(`${UPSTREAM}/v1beta/interactions/${interactionId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey2 },
          body: "{}"
        });
        if (cancelRes.ok) {
          const data = await cancelRes.json().catch(() => ({}));
          res.status(200).json({ id: interactionId, status: "cancelled", object: "interaction", ...data });
          return;
        }
        await fetch(`${UPSTREAM}/v1beta/interactions/${interactionId}`, {
          method: "DELETE",
          headers: { "x-goog-api-key": apiKey2 }
        }).catch(() => {
        });
        res.status(200).json({ id: interactionId, status: "cancelled", object: "interaction" });
        return;
      } catch {
        res.status(200).json({ id: interactionId, status: "cancelled", object: "interaction" });
        return;
      }
    }
    const getInteractionMatch = req.method === "GET" ? v1Path.match(/^\/v1beta\/interactions\/([^/]+)$/) : null;
    if (getInteractionMatch) {
      const interactionId = getInteractionMatch[1];
      const isStreamReq = req.query.stream === "true" || (req.headers.accept || "").includes("text/event-stream");
      const lastEventId = typeof req.query.last_event_id === "string" ? req.query.last_event_id : null;
      if (!isStreamReq && cancelledInteractions.has(interactionId)) {
        res.status(200).json({ id: interactionId, status: "cancelled", object: "interaction" });
        return;
      }
      if (isStreamReq) {
        const hubEntry = streamHub.get(interactionId);
        if (hubEntry) {
          attachClientToHubEntry(hubEntry, res, lastEventId);
          return;
        }
      }
    }
    let isStreamingCreate = false;
    let isGamesmithRequest = false;
    if (req.method === "POST" && v1Path === "/v1beta/interactions") {
      let bodyJson = null;
      try {
        const text = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : typeof req.body === "string" ? req.body : "";
        bodyJson = text ? JSON.parse(text) : {};
      } catch {
        res.status(400).json({ error: { message: "Invalid JSON body in POST /v1beta/interactions" } });
        return;
      }
      isStreamingCreate = Boolean(bodyJson?.stream);
      const requestedModel = typeof bodyJson?.model === "string" ? bodyJson.model.replace(/^models\//, "") : "";
      const requestedAgent = bodyJson?.agent;
      const isDirectModelInteraction = !requestedAgent && (["gemini-4-argon", "gemini-3.8-flash"].includes(
        requestedModel
      ) || requestedModel.startsWith("gemini-"));
      if (!isDirectModelInteraction) {
        const maxTokens = bodyJson?.agent_config?.max_total_tokens;
        if (typeof maxTokens !== "number" || !Number.isFinite(maxTokens) || maxTokens <= 0 || maxTokens > CONFIG.MAX_AGENT_TOKENS) {
          res.status(400).json({
            error: {
              message: `POST /interactions requires agent_config.max_total_tokens between 1 and ${CONFIG.MAX_AGENT_TOKENS}`
            }
          });
          return;
        }
        const isAllowedAgent = requestedAgent === CONFIG.GAMESMITH_AGENT || ALLOWED_BASE_AGENTS.has(requestedAgent);
        if (!isAllowedAgent) {
          res.status(403).json({
            error: {
              message: `Agent "${requestedAgent}" is not allowed. Only "${CONFIG.GAMESMITH_AGENT}" or "${BASE_AGENT}" is permitted.`
            }
          });
          return;
        }
        isGamesmithRequest = requestedAgent === CONFIG.GAMESMITH_AGENT;
        if (isProbe) {
          if (!admin) {
            let probeCounter = probeBuildCounters.get(ip);
            if (!probeCounter) {
              probeCounter = { timestamps: [] };
              probeBuildCounters.set(ip, probeCounter);
            }
            const probeCount = pruneAndCount(probeCounter, now);
            if (probeCount >= capBuildsPerIp) {
              res.status(429).json({
                error: {
                  message: `Rate limit exceeded: max ${capBuildsPerIp} builds per IP per hour`
                }
              });
              return;
            }
            probeCounter.timestamps.push(now);
          }
          res.status(200).json({ ok: true, probe: true });
          return;
        }
        if (!admin) {
          let ipCounter = ipBuildCounters.get(ip);
          if (!ipCounter) {
            ipCounter = { timestamps: [] };
            ipBuildCounters.set(ip, ipCounter);
          }
          const ipCount = pruneAndCount(ipCounter, now);
          const globalCount = pruneAndCount(globalBuildCounter, now);
          if (ipCount >= capBuildsPerIp) {
            res.status(429).json({
              error: {
                message: `Rate limit exceeded: max ${capBuildsPerIp} builds per IP per hour`
              }
            });
            return;
          }
          if (globalCount >= capBuildsGlobal) {
            res.status(429).json({
              error: {
                message: `Global rate limit exceeded: max ${capBuildsGlobal} builds per hour`
              }
            });
            return;
          }
          ipCounter.timestamps.push(now);
          globalBuildCounter.timestamps.push(now);
        }
        if (ALLOWED_BASE_AGENTS.has(requestedAgent) && bodyJson) {
          bodyJson.agent_config = {
            ...bodyJson.agent_config,
            type: "antigravity",
            model: bodyJson.agent_config?.model || CONFIG.AGENT_MODEL
          };
          req.body = Buffer.from(JSON.stringify(bodyJson), "utf8");
        } else if (bodyJson?.agent_config) {
          delete bodyJson.agent_config;
          req.body = Buffer.from(JSON.stringify(bodyJson), "utf8");
        }
      }
    }
    if (req.method === "POST" && /^\/v1beta\/models\/[^/:]+:generateContent$/.test(v1Path)) {
      let isImageCall = /image|banana|imagen/i.test(v1Path);
      if (!isImageCall && Buffer.isBuffer(req.body)) {
        try {
          const parsed = JSON.parse(req.body.toString("utf8"));
          const modalities = parsed?.generationConfig?.responseModalities || parsed?.config?.responseModalities || [];
          if (Array.isArray(modalities) && modalities.includes("IMAGE")) {
            isImageCall = true;
          }
        } catch {
        }
      }
      if (isImageCall && !admin) {
        let imgCounter = ipImageCounters.get(ip);
        if (!imgCounter) {
          imgCounter = { timestamps: [] };
          ipImageCounters.set(ip, imgCounter);
        }
        const count = pruneAndCount(imgCounter, now);
        if (count >= capImagesPerIp) {
          res.status(429).json({
            error: {
              message: `Image rate limit exceeded: max ${capImagesPerIp} images per IP per hour`
            }
          });
          return;
        }
        imgCounter.timestamps.push(now);
      }
    }
    const apiKey = getServerApiKey();
    if (!apiKey) {
      res.status(503).json({
        error: {
          code: "MISSING_SERVER_GEMINI_KEY",
          message: "Server missing GEMINI_API_KEY"
        }
      });
      return;
    }
    const bakeTask = ensureGamesmithBaked(apiKey);
    if (isGamesmithRequest || v1Path === `/v1beta/agents/${CONFIG.GAMESMITH_AGENT}`) {
      await Promise.race([
        bakeTask,
        new Promise((r) => setTimeout(r, 25e3))
      ]);
    }
    const queryStr = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
    const upstreamParams = new URLSearchParams(queryStr);
    upstreamParams.delete("selftest");
    const requestedLastEventId = upstreamParams.get("last_event_id");
    const qs = upstreamParams.toString();
    const targetUrl = `${UPSTREAM}${subPath}${qs ? `?${qs}` : ""}`;
    const outHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (HOP_REQ_HEADERS.has(k.toLowerCase())) continue;
      if (typeof v === "string") outHeaders[k] = v;
      else if (Array.isArray(v)) outHeaders[k] = v.join(", ");
    }
    outHeaders["x-goog-api-key"] = apiKey;
    const upstreamAbort = new AbortController();
    if (!isStreamingCreate) {
      res.on("close", () => {
        if (!res.writableEnded) {
          upstreamAbort.abort();
        }
      });
    }
    try {
      const hasBody = !["GET", "HEAD"].includes(req.method) && Buffer.isBuffer(req.body) && req.body.length > 0;
      const upstreamRes = await fetch(targetUrl, {
        method: req.method,
        headers: outHeaders,
        body: hasBody ? req.body : void 0,
        signal: upstreamAbort.signal
      });
      if ((upstreamRes.status === 404 || upstreamRes.status === 400) && (isGamesmithRequest || v1Path === `/v1beta/agents/${CONFIG.GAMESMITH_AGENT}`)) {
        invalidateGamesmithBakeCache();
        void ensureGamesmithBaked(apiKey);
      }
      const contentType = upstreamRes.headers.get("content-type") || "";
      const isInteractionSse = upstreamRes.ok && contentType.includes("text/event-stream") && v1Path.startsWith("/v1beta/interactions") && upstreamRes.body;
      if (isInteractionSse && upstreamRes.body) {
        writeSseHeaders(res);
        let hubEntry = null;
        const normalizer = new SseNormalizer();
        const reader2 = upstreamRes.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let skippingUntil = !isStreamingCreate ? requestedLastEventId : null;
        let foundLast = !skippingUntil;
        const handleFrames = (frames) => {
          for (const frame of frames) {
            if (!hubEntry && isStreamingCreate && frame.eventId === "evt_created") {
              const m = frame.sseText.match(/"id"\s*:\s*"(v1_[^"]+)"/);
              if (m) {
                const iid = m[1];
                hubEntry = {
                  interactionId: iid,
                  createdAt: Date.now(),
                  frames: [],
                  done: false,
                  abortController: upstreamAbort,
                  subscribers: /* @__PURE__ */ new Set()
                };
                streamHub.set(iid, hubEntry);
              }
            }
            if (hubEntry) {
              hubEntry.frames.push(frame);
              for (const sub of hubEntry.subscribers) {
                sub(frame);
              }
            }
            if (!foundLast) {
              if (frame.eventId === skippingUntil) {
                foundLast = true;
              }
              continue;
            }
            flushRes(res, frame.sseText);
          }
        };
        try {
          while (true) {
            const { value, done } = await reader2.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let sepIdx;
            while ((sepIdx = buf.indexOf("\n\n")) !== -1) {
              const rawBlock = buf.slice(0, sepIdx);
              buf = buf.slice(sepIdx + 2);
              handleFrames(normalizer.processRawBlock(rawBlock));
            }
          }
          if (buf.trim()) {
            handleFrames(normalizer.processRawBlock(buf));
          }
          handleFrames(normalizer.flush());
        } catch {
        } finally {
          if (hubEntry) {
            hubEntry.done = true;
            for (const sub of hubEntry.subscribers) {
              sub(null);
            }
            hubEntry.subscribers.clear();
          }
          if (!res.writableEnded) {
            res.end();
          }
        }
        return;
      }
      res.status(upstreamRes.status);
      upstreamRes.headers.forEach((val, key) => {
        const lower = key.toLowerCase();
        if (HOP_RES_HEADERS.has(lower)) return;
        if (lower === "location") {
          const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
          const host = req.headers.host || "localhost:8787";
          const base = `${proto}://${host}/api/gemini`;
          res.setHeader("Location", val.replace(UPSTREAM, base));
          return;
        }
        res.setHeader(key, val);
      });
      if (contentType.includes("text/event-stream")) {
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("X-Accel-Buffering", "no");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
      }
      if (!upstreamRes.body) {
        res.end();
        return;
      }
      const reader = upstreamRes.body.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            flushRes(res, Buffer.from(value));
          }
        }
        res.end();
      } catch {
        if (!res.writableEnded) {
          res.end();
        }
      }
    } catch (err) {
      if (upstreamAbort.signal.aborted) {
        if (!res.writableEnded) res.end();
        return;
      }
      if (!res.headersSent) {
        res.status(502).json({ error: { message: `Upstream error: ${err?.message || String(err)}` } });
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  });
  return router;
}

// server/index.ts
var rootDir2 = process.cwd();
function parseCliArg(flag) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1] && !args[i + 1].startsWith("-")) {
      return args[i + 1];
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].slice(flag.length + 1);
    }
  }
  return void 0;
}
function ensureCartHostBuilt() {
  const hostHtmlPath = import_node_path2.default.join(rootDir2, "public", "cart", "host.html");
  const buildCartScript = import_node_path2.default.join(rootDir2, "scripts", "build-cart.mjs");
  if (!import_node_fs2.default.existsSync(hostHtmlPath) && import_node_fs2.default.existsSync(buildCartScript)) {
    try {
      (0, import_node_child_process2.execFileSync)(process.execPath, [buildCartScript], { cwd: rootDir2, stdio: "inherit" });
    } catch (err) {
      console.warn("[playglow-server] build-cart warning:", err?.message || err);
    }
  }
}
async function startServer() {
  ensureCartHostBuilt();
  const app = (0, import_express2.default)();
  app.use((0, import_cors.default)());
  app.get("/api/healthz", (_req, res) => {
    res.json({
      ok: true,
      hasServerApiKey: Boolean(getServerApiKey())
    });
  });
  app.post("/api/admin/reset-caps", (req, res) => {
    const adminToken = getEffectiveAdminToken();
    const provided = req.headers["x-admin-token"];
    const validAdmin = Boolean(adminToken && provided === adminToken);
    const isAiStudioDev = process.env.NODE_ENV !== "production" || process.env.DISABLE_HMR === "true" || Boolean(process.env.K_SERVICE);
    if (validAdmin || isAiStudioDev) {
      resetAllCaps();
      res.json({ ok: true });
      return;
    }
    if (isSelftestContext(req)) {
      resetProbeCaps();
      res.json({ ok: true, probeOnly: true });
      return;
    }
    res.status(401).json({ error: { message: "Unauthorized: invalid or missing x-admin-token" } });
  });
  app.get("/api/admin/selftest-token", (req, res) => {
    const host = req.headers.host || "";
    const hasForwardedFor = Boolean(req.headers["x-forwarded-for"] || req.headers["x-forwarded-host"]);
    const isLocalHostHeader = host === "localhost" || host.startsWith("localhost:") || host === "127.0.0.1" || host.startsWith("127.0.0.1:");
    const isStrictLocalDev = !hasForwardedFor && isLocalHostHeader && process.env.NODE_ENV !== "production" && (req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1");
    const isAiStudioSelftest = (process.env.NODE_ENV !== "production" || process.env.DISABLE_HMR === "true" || Boolean(process.env.K_SERVICE)) && isSelftestContext(req);
    const allowRemoteSelftest = process.env.ALLOW_REMOTE_SELFTEST === "true";
    const adminToken = getEffectiveAdminToken();
    const validHeader = Boolean(adminToken) && req.headers["x-admin-token"] === adminToken;
    if (!isStrictLocalDev && !isAiStudioSelftest && !allowRemoteSelftest && !validHeader) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }
    res.json({ adminToken });
  });
  app.use("/api/gemini", createGeminiProxyRouter());
  const distDir = import_node_path2.default.join(rootDir2, "dist");
  const distIndexHtml = import_node_path2.default.join(distDir, "index.html");
  const isBundledServer = Boolean(process.argv[1]?.endsWith("server.cjs"));
  const hasViteSource = import_node_fs2.default.existsSync(import_node_path2.default.join(rootDir2, "src", "main.tsx"));
  const useStaticDist = (process.env.NODE_ENV === "production" || process.env.USE_DIST === "1" || isBundledServer || !hasViteSource) && import_node_fs2.default.existsSync(distIndexHtml);
  if (useStaticDist) {
    app.use(import_express2.default.static(distDir));
    app.use((_req, res) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: rootDir2,
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (err) {
      if (import_node_fs2.default.existsSync(distIndexHtml)) {
        app.use(import_express2.default.static(distDir));
        app.use((_req, res) => {
          res.sendFile(distIndexHtml);
        });
      } else {
        console.error("[playglow-server] Failed to initialize Vite middleware:", err?.message || err);
      }
    }
  }
  const cliPort = parseCliArg("--port");
  const cliHost = parseCliArg("--host");
  const port = Number(cliPort || process.env.PORT || process.env.API_PORT || 8787);
  const listenHost = cliHost || process.env.HOST || "0.0.0.0";
  app.listen(port, listenHost, () => {
    console.log(`[playglow-server] listening on http://${listenHost}:${port}`);
    void ensureGamesmithBaked();
  });
}
startServer().catch((err) => {
  console.error("[playglow-server] Fatal startup error:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
