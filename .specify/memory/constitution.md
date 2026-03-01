<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Code Quality (new)
  - [PRINCIPLE_2_NAME] → II. API Testing (new)
  - [PRINCIPLE_3_NAME] → III. End-to-End Testing (new)
  - [PRINCIPLE_4_NAME] → IV. User Experience Consistency (new)
  - [PRINCIPLE_5_NAME] → V. Simplicity (new)

Added sections:
  - Core Principles (5 principles, all new)
  - Quality Gates (new)
  - Development Workflow (new)
  - Governance (new)

Removed sections:
  - None (first ratification)

Templates updated:
  ✅ .specify/memory/constitution.md (this file)
  ✅ .specify/templates/tasks-template.md (updated test optionality note to reflect
     mandatory API and E2E testing per Principles II and III)
  ⚠  .specify/templates/plan-template.md (Constitution Check placeholder is a runtime
     token intentionally left for /speckit.plan to fill — no structural change needed)
  ⚠  .specify/templates/spec-template.md (already requires User Scenarios & Testing
     as mandatory — fully aligned with Principles II and III)

Deferred TODOs:
  - TODO(PROJECT_NAME): Inferred as "Form" from repository directory name.
    Update if the project has a different official name.
  - TODO(RATIFICATION_DATE): Set to 2026-03-01 (today, first governance adoption).
    Update to official ratification date if a prior date applies.
-->

# Form Constitution

## Core Principles

### I. Code Quality

All production code MUST be clean, readable, and maintainable by any team member.

- Code MUST pass configured linting and static analysis checks before merging.
- Every function or method MUST have a single, clearly stated responsibility.
- Dead code MUST be removed; commented-out code is not acceptable in merged branches.
- Cyclomatic complexity above an agreed threshold MUST be justified in the PR description
  with a documented reason and an accepted simpler alternative rejected.
- Dependencies MUST be explicit; implicit global state is prohibited unless unavoidable
  and documented.

**Rationale**: Unmaintainable code is a liability that compounds over time.
Consistent quality standards reduce cognitive load, lower defect rates,
and enable the team to move faster with confidence.

### II. API Testing (NON-NEGOTIABLE)

API contract tests MUST be authored before or alongside implementation — never after.

- Every public API endpoint MUST have at least one contract test covering:
  - The happy-path request/response shape.
  - Representative error responses (4xx, 5xx).
  - Authentication/authorization boundaries.
- API contracts MUST be versioned; breaking changes MUST increment the API major version.
- Contract tests MUST run in CI on every pull request and MUST NOT be skipped.
- Changes to a contract (request shape, response shape, status codes) MUST be
  accompanied by updated contract tests in the same commit.

**Rationale**: APIs are the primary integration surface between systems and consumers.
Verifying contracts automatically prevents regressions and documents intent
more reliably than prose.

### III. End-to-End Testing (NON-NEGOTIABLE)

Every critical user journey defined in a feature spec MUST have automated E2E test
coverage before the feature is considered complete.

- E2E tests MUST be written for every P1 (highest priority) user story.
- E2E tests MUST exercise the full stack from the UI or API entry point down to
  persistent storage (or clearly documented test doubles when infrastructure access
  is restricted).
- E2E tests MUST be integrated into the CI/CD pipeline and MUST pass before a release
  is promoted to production.
- Flaky E2E tests MUST be triaged and fixed or quarantined within one sprint of
  being identified; they MUST NOT remain flaky and untracked.

**Rationale**: Unit and integration tests verify isolated components.
Only E2E tests confirm the system works as a whole from the user's perspective.
Automating these journeys prevents regressions and builds release confidence.

### IV. User Experience Consistency

UI patterns, language, and interaction behaviours MUST be consistent across all
features and surfaces of the product.

- Design tokens (colours, spacing, typography) MUST be sourced from the shared
  design system; one-off overrides require explicit approval.
- All user-facing error messages MUST be actionable: state what went wrong,
  why it happened, and what the user can do next.
- Every interactive state MUST be handled: loading, success, empty, and error.
  Partial state handling is not acceptable in merged features.
- Terminology used in the UI MUST match the terminology used in the spec, API, and
  documentation — no synonyms for the same concept across surfaces.

**Rationale**: Inconsistency erodes user trust and increases support burden.
A coherent experience signals quality and reduces the mental overhead users carry
when learning or re-engaging with the product.

### V. Simplicity

The simplest solution that satisfies the spec MUST be chosen over a more
sophisticated one.

- YAGNI (You Aren't Gonna Need It) is enforced: no code for hypothetical future
  requirements unless explicitly scoped in the current spec.
- Abstractions MUST serve at least two concrete use cases at the time of introduction;
  premature abstraction is treated as a code quality violation (Principle I).
- Performance optimisations MUST be backed by a measured baseline; speculative
  optimisation is prohibited.
- New dependencies MUST be weighed against the cost of maintaining them; prefer
  standard library or existing approved dependencies where sufficient.

**Rationale**: Simple systems are easier to test, debug, and extend.
Complexity is a cost that must be justified; simplicity is the default.

## Quality Gates

Every feature MUST clear all of the following gates before it is considered shippable:

- **Gate 1 — Lint & Static Analysis**: All linting and type-checking rules pass with
  zero suppression annotations added without justification.
- **Gate 2 — API Contract Tests**: All contract tests for affected endpoints pass in CI.
- **Gate 3 — E2E Tests**: All E2E tests for P1 user stories pass in CI.
- **Gate 4 — UX Review**: Loading, success, error, and empty states verified in a
  browser or device; terminology cross-checked against spec and API.
- **Gate 5 — Code Review**: At least one peer review approval required; reviewer MUST
  verify compliance with Principles I–V.

Bypassing any gate MUST be documented with an incident or exception ticket and
approved by the project lead.

## Development Workflow

- Features MUST have a spec (`spec.md`) and implementation plan (`plan.md`) before
  development begins.
- API contract tests (Principle II) MUST be committed before or in the same PR as
  the endpoint implementation.
- E2E tests (Principle III) MUST be committed in the same PR as the feature that
  closes the user story.
- The Constitution Check in `plan.md` MUST be completed and signed off before Phase 0
  research begins and re-verified after Phase 1 design.
- Complexity exceptions (Complexity Tracking table in `plan.md`) MUST be filled for
  any constitution violation, even minor ones, before the plan is approved.

## Governance

This constitution supersedes all other documented or informal project practices.
Any practice not addressed here defaults to the principle of Simplicity (Principle V).

- **Amendment procedure**: Amendments require a written proposal referencing the
  affected principle(s), a documented rationale, and approval from the project lead.
  All amendments MUST be reflected in this file with an updated version and
  `LAST_AMENDED_DATE`.
- **Versioning policy**: MAJOR — backward-incompatible principle removal or redefinition;
  MINOR — new principle or materially expanded guidance; PATCH — clarifications,
  wording, non-semantic refinements.
- **Compliance review**: Constitution compliance MUST be verified in every PR review
  (Gate 5). A quarterly audit of all active features against the constitution is
  RECOMMENDED.
- **Deferred placeholders**: Any `TODO(<FIELD>)` entry in this file MUST be resolved
  before the constitution advances to v1.1.0.

**Version**: 1.0.0 | **Ratified**: 2026-03-01 | **Last Amended**: 2026-03-01
