{
  "schema_version": "2.0",
  "tasks": [
    /* ─────────────────────────  PHASE 0 • GOVERNANCE  ───────────────────────── */
    {
      "id": "GOV‑001",
      "phase": 0,
      "owner": "Architecture Council",
      "description": "Constitute the Architecture Council as the ultimate authority for SSOT changes and constitutional amendments.",
      "done_when": "Council membership and charter recorded in docs/GOVERNANCE.md"
    },
    {
      "id": "GOV‑002",
      "phase": 0,
      "owner": "Architecture Council",
      "description": "Appoint one **Type Steward** per bounded context (domain directory).",
      "done_when": "Steward list published in docs/TYPE‑STEWARD‑REGISTRY.md"
    },
    {
      "id": "GOV‑003",
      "phase": 0,
      "owner": "Documentation",
      "description": "Publish **CONSTITUTION.md** consolidating Strict Canonical Type Enforcement + Utilities Refactor Directive with all superseded docs archived.",
      "done_when": "CONSTITUTION.md merged to main and legacy constitutions deleted"
    },
    {
      "id": "GOV‑004",
      "phase": 0,
      "owner": "Architecture Council",
      "description": "Define **Canonical Change Proposal (CCP)** workflow for modifying SSOT.",
      "done_when": "ccp-template.md added to .github/ISSUE_TEMPLATE"
    },
    {
      "id": "GOV‑005",
      "phase": 0,
      "owner": "Architecture Council",
      "description": "Ratify sanctions policy for constitutional violations (Refactor Strike & escalation).",
      "done_when": "Section 9 of CONSTITUTION.md references policy"
    },

    /* ─────────────────────────  PHASE 1 • CORE RULES  ───────────────────────── */
    {
      "id": "RULE‑001",
      "phase": 1,
      "owner": "All Teams",
      "description": "Enforce **SSOT‑ONLY**: every type/interface/enum lives in src/types/canonical‑types.ts; utilities cannot declare, alias, or re‑export types.",
      "done_when": "CI detects 0 local type declarations (see ENF‑001/002)"
    },
    {
      "id": "RULE‑002",
      "phase": 1,
      "owner": "Foundation Team",
      "description": "Maintain **Pure Utilities** layer: no React/DOM/env‑specific code inside foundation or core utilities.",
      "done_when": "Foundation folder passes framework‑dependency linter"
    },
    {
      "id": "RULE‑003",
      "phase": 1,
      "owner": "All Teams",
      "description": "Apply **Validation First**: validate every external input with canonical Zod schemas; forbid unchecked `as` casts.",
      "done_when": "All unchecked assertions removed; schema coverage ≥ 95 %"
    },
    {
      "id": "RULE‑004",
      "phase": 1,
      "owner": "API Guild",
      "description": "Standardise responses via `apiUtils.ok/err` and `createApiError` (*Factory Responses*).",
      "done_when": "All utility return types funnel through apiUtils factories"
    },
    {
      "id": "RULE‑005",
      "phase": 1,
      "owner": "Foundation Team",
      "description": "Implement **Environment Detection** before using Node/Browser globals (`typeof fetch === \"function\"`).",
      "done_when": "ESLint rule `no-unsafe-env` reports 0 violations"
    },
    {
      "id": "RULE‑006",
      "phase": 1,
      "owner": "Architecture Council",
      "description": "Lock **@types/** path alias (`@types/*` → canonical‑types.ts) as immutable.",
      "done_when": "tsconfig.json protected by config‑lint in CI"
    },
    {
      "id": "RULE‑007",
      "phase": 1,
      "owner": "All Teams",
      "description": "Ban **compatibility shims**: no adapters/bridges/facades for legacy type names.",
      "done_when": "CI scan shows 0 shim patterns (regex‑based detector)"
    },
    {
      "id": "RULE‑008",
      "phase": 1,
      "owner": "All Teams",
      "description": "Forbid **type aliases / re‑exports** of canonical types.",
      "done_when": "ts‑morph audit (ENF‑002) finds 0 alias nodes"
    },
    {
      "id": "RULE‑009",
      "phase": 1,
      "owner": "All Teams",
      "description": "Disallow extending canonical types inside utilities; use declaration‑merging only in pipeline `*.d.ts` files.",
      "done_when": "CI passes structural‑extend checker"
    },
    {
      "id": "RULE‑010",
      "phase": 1,
      "owner": "Pipeline Owners",
      "description": "Pipeline extensions may _only_ augment `PipelineParamMap` via declaration‑merging and be tagged `/** @internal L2 Pipeline Extension */`.",
      "done_when": "All pipeline param types reside in `pipelines/*.pipeline.d.ts`"
    },

    /* ──────────────────────  PHASE 2 • ENFORCEMENT TOOLS  ───────────────────── */
    {
      "id": "ENF‑001",
      "phase": 2,
      "owner": "DevOps CI",
      "description": "Create ESLint rule **no‑local‑types** to block RULE‑001/008/009.",
      "done_when": "Rule included in shared .eslintrc and CI fails on violation"
    },
    {
      "id": "ENF‑002",
      "phase": 2,
      "owner": "DevOps CI",
      "description": "Add ts‑morph audit to detect duplicate or alias type structures.",
      "done_when": "script `scripts/audit‑duplicate‑types.ts` exits 0"
    },
    {
      "id": "ENF‑003",
      "phase": 2,
      "owner": "DevOps CI",
      "description": "Hook `constitutional‑validator-v2.sh` into **pre‑push** and PR pipelines.",
      "done_when": "Validator blocks any push with rule failures"
    },

    /* ─────────────────────  PHASE 3 • BIG‑BANG MIGRATION  ───────────────────── */
    {
      "id": "MIG‑001",
      "phase": 3,
      "owner": "Type Stewards",
      "description": "Execute **Big Bang Type Migration**: replace all non‑canonical imports with `@types/canonical-types` equivalents.",
      "done_when": "Import‑rewrite script shows 0 remaining legacy paths"
    },
    {
      "id": "MIG‑002",
      "phase": 3,
      "owner": "Type Stewards",
      "description": "Delete legacy type shards (`*.types.ts`, `domain.types.ts`) and tag repo `pre‑ssot`.",
      "done_when": "Legacy files removed and git tag pushed"
    },
    {
      "id": "MIG‑003",
      "phase": 3,
      "owner": "Foundation Team",
      "description": "Integrate `constitutional-validator-v2.sh` into repo root **pre‑push** hook.",
      "done_when": ".husky/pre‑push executes validator script successfully"
    },

    /* ────────────────────  PHASE 4 • VALIDATION & HAND‑OFF  ─────────────────── */
    {
      "id": "VAL‑001",
      "phase": 4,
      "owner": "CI Pipeline",
      "description": "Run full type‑check + lint; ensure all RULE and ENF tasks pass with 0 errors.",
      "done_when": "`npm run type-check && npm run lint` exit with code 0"
    },
    {
      "id": "VAL‑002",
      "phase": 4,
      "owner": "Documentation",
      "description": "Add declaration‑merging guide and validation checklist to CONTRIBUTING.md.",
      "done_when": "Section 'Working with PipelineParamMap' appears in docs"
    }
  ]
}
