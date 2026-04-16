/**
 * Organ registry — the 28 organs of the DIO ESB.
 *
 * Source of truth: MDvault-LLM-Ops/01-Organs/00-Organ-Registry/organ-registry.md
 * Embedded here so the control surface aggregator can poll each organ's /health
 * without a circular dependency on another organ.
 *
 * `probabilistic: true` marks the 11 organs with LLM agents (MP-CONFIG-1 §4).
 * These are the organs that expose `/introspect.llm` and are polled by the
 * `/api/config/llm-assignments` aggregator (relay l9m-8).
 * TODO: migrate to a services registry when available.
 */

export const ORGANS = [
  { num: 20,  name: 'Spine',        port: 4000, description: 'Message bus + state machine' },
  { num: 30,  name: 'Vectr',        port: 4001, description: 'Vector embeddings (384-dim)' },
  { num: 40,  name: 'Graph',        port: 4020, description: 'Knowledge graph adapter' },
  { num: 50,  name: 'Phi',          port: 4005, description: 'Identity + auth' },
  { num: 60,  name: 'Radiant',      port: 4006, description: 'Platform memory (Monad Leg 1)',   probabilistic: true },
  { num: 70,  name: 'Minder',       port: 4007, description: 'Person memory (Monad Leg 3)',     probabilistic: true },
  { num: 80,  name: 'Hippocampus',  port: 4008, description: 'Conversation memory (Monad Leg 4)', probabilistic: true },
  { num: 90,  name: 'Soul',         port: 4009, description: 'Persona memory (Monad Leg 5)',    probabilistic: true },
  { num: 100, name: 'Lobe',         port: 4010, description: 'Event interpretation',            probabilistic: true },
  { num: 110, name: 'Syntra',       port: 4011, description: 'RAG bridge' },
  { num: 120, name: 'Vigil',        port: 4015, description: 'Continuous verification' },
  { num: 130, name: 'Glia',         port: 4016, description: 'Self-healing pipeline' },
  { num: 140, name: 'SafeVault',    port: 4017, description: 'Backup/restore' },
  { num: 150, name: 'GitSync',      port: 4030, description: 'Dual-remote repo sync' },
  { num: 160, name: 'Promote',      port: 4031, description: 'Promotion pipeline' },
  { num: 170, name: 'Sourcegraph',  port: 4032, description: 'Code search proxy' },
  { num: 180, name: 'Engram',       port: 4035, description: 'KB filing' },
  { num: 190, name: 'Arbiter',      port: 4021, description: 'Bill of Rights guardian',         probabilistic: true },
  { num: 200, name: 'Nomos',        port: 4022, description: 'Judicial authority',              probabilistic: true },
  { num: 210, name: 'Cerberus',     port: 4023, description: 'Execution gateway' },
  { num: 220, name: 'Senate',       port: 4024, description: 'Governance lifecycle',            probabilistic: true },
  { num: 225, name: 'Cortex',       port: 4040, description: 'Strategic brain',                 probabilistic: true },
  { num: 230, name: 'Thalamus',     port: 4041, description: 'Orchestrator',                    probabilistic: true },
  { num: 240, name: 'ModelBroker',  port: 4042, description: 'Inference routing' },
  { num: 250, name: 'Receptor',     port: 4050, description: 'Intent classification',           probabilistic: true },
  { num: 260, name: 'MCP-Router',   port: 4060, description: 'Unified MCP entry' },
  { num: 270, name: 'MCP-Gateway',  port: 4061, description: 'Cross-boundary MCP' },
  { num: 280, name: 'Axon',         port: 4051, description: 'Control surface (UI)' },
];

export const ORGAN_BY_NAME = Object.fromEntries(ORGANS.map(o => [o.name, o]));

export const PROBABILISTIC_ORGANS = ORGANS.filter((o) => o.probabilistic === true);
