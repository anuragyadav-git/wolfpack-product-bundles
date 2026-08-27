---
schema_version: 1
id: storefront-design-director-master-build-prompt
title: Build the Complete Storefront Design Director Skill
type: prompt-pack
status: active
summary: Defines the complete repository-scoped build contract for the storefront design director skill.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack/01-master-build-prompt.md
related_docs:
  - storefront-design-director-prompt-pack/README.md
tags:
  - prompt
  - skill-build
keywords:
  - storefront-design-director
  - design-job
---

# Prompt 1 — Build the complete `storefront-design-director` skill

Paste this prompt into Codex from the target repository root. Prefer invoking `$skill-creator` first, then provide the content below as the full specification.

---

You are creating a production-quality, repository-scoped OpenAI Agent Skill named `storefront-design-director`.

Do not merely explain what the skill could contain. Create the complete skill on disk, with all instructions, references, templates, scripts, tests, and evaluation fixtures required by this specification.

## 1. Location and scope

Create the skill at:

```text
.agents/skills/storefront-design-director/
```

Before creating files:

1. Read the repository-root `AGENTS.md` and every applicable nested `AGENTS.md`.
2. Inspect existing repository conventions for documentation, tests, scripts, generated artifacts, and temporary files.
3. Inspect any existing `.agents/skills` and reuse established conventions where they are compatible.
4. Do not modify production application code.
5. Do not alter application behavior, dependencies, package scripts, or configuration unless a change is strictly necessary to test the skill itself and is clearly isolated.
6. Do not assume repository paths from this prompt are production paths. Discover the current architecture.
7. Keep generated design jobs out of production asset bundles unless the repository already has an approved design-artifact location.
8. Default to a repository folder named `design-jobs/`, but make that path configurable in a skill-level settings template.

This skill is script-backed. It must not be instruction-only.

## 2. Skill objective

The skill must repeatedly guide a user through the complete design-to-code lifecycle for interactive ecommerce storefront components:

```text
rough request
→ project/component scope
→ screenshot intake
→ reference-quality validation
→ visual decomposition
→ design alternatives
→ selected direction
→ locked design decisions
→ full state system
→ responsive behavior
→ accessibility and interaction contract
→ design tokens and geometry
→ optional standalone prototype
→ Codex-ready implementation handoff
→ implementation return
→ automated Chrome DevTools QA
→ measured remediation loop
→ approval
→ saved visual-regression baselines
```

The skill is a design director and quality controller. It may create design artifacts, generated mockups, standalone prototypes, specifications, and implementation prompts. It must not silently modify production storefront code while operating in design-director mode.

## 3. Triggering metadata

Create a valid `SKILL.md` with YAML front matter containing exactly the required `name` and `description` fields and any other fields supported by the current local skill schema.

Use:

```yaml
name: storefront-design-director
description: Guide ecommerce storefront component design from current and target screenshots through visual analysis, responsive states, accessibility, an approved design contract, a Codex-ready implementation handoff, and Chrome DevTools MCP visual QA. Use for product cards, bundle builders, sidebars, mobile summary trays, footers, selectors, progress indicators, modals, tabs, promotional sections, and other interactive storefront UI. Do not use for backend-only work, general brand illustration with no UI behavior, or direct production implementation without a design handoff.
```

Make the first part of the description highly discriminative because skill discovery may truncate descriptions.

## 4. Required skill directory

Create at least this structure. You may add files where genuinely useful, but do not remove required files.

```text
.agents/skills/storefront-design-director/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── workflow-state-machine.md
│   ├── conversational-guidance.md
│   ├── screenshot-intake-protocol.md
│   ├── visual-analysis-rubric.md
│   ├── ecommerce-component-catalog.md
│   ├── state-coverage-catalog.md
│   ├── responsive-design-contract.md
│   ├── interaction-and-accessibility.md
│   ├── design-token-and-geometry-guide.md
│   ├── prototype-guidance.md
│   ├── code-ownership-and-handoff.md
│   ├── chrome-devtools-test-protocol.md
│   ├── visual-comparison-rubric.md
│   ├── failure-and-recovery.md
│   ├── security-and-privacy.md
│   ├── wolfpack-domain-context.md
│   └── output-contracts.md
├── assets/
│   └── templates/
│       ├── design-job.yaml
│       ├── settings.yaml
│       ├── component-brief.md
│       ├── screenshot-inventory.yaml
│       ├── visual-audit.md
│       ├── direction-comparison.md
│       ├── locked-decisions.yaml
│       ├── component-anatomy.md
│       ├── state-matrix.md
│       ├── responsive-contract.md
│       ├── interaction-contract.md
│       ├── accessibility-checklist.md
│       ├── design-tokens.json
│       ├── content-stress-cases.yaml
│       ├── implementation-handoff.md
│       ├── codex-task.md
│       ├── acceptance-criteria.md
│       ├── browser-test-plan.yaml
│       ├── browser-test-report.md
│       ├── visual-qa-report.md
│       ├── remediation-list.md
│       └── approval-record.yaml
├── scripts/
│   ├── init_design_job.py
│   ├── validate_design_job.py
│   ├── update_job_stage.py
│   ├── inspect_reference_images.py
│   ├── validate_handoff.py
│   ├── package_handoff.py
│   ├── compare_images.py
│   ├── summarize_browser_artifacts.py
│   └── common.py
├── tests/
│   ├── test_init_design_job.py
│   ├── test_validate_design_job.py
│   ├── test_update_job_stage.py
│   ├── test_inspect_reference_images.py
│   ├── test_validate_handoff.py
│   ├── test_package_handoff.py
│   ├── test_compare_images.py
│   └── fixtures/
└── evals/
    ├── invocation-cases.jsonl
    ├── workflow-cases.jsonl
    ├── browser-qa-cases.jsonl
    ├── rubric.md
    └── runbook.md
```

If `agents/openai.yaml` is not supported in the current local schema, do not invent a schema. Document the incompatibility and omit only that file. Otherwise, create it using the current valid schema and declare the Chrome DevTools MCP dependency or setup requirement where the schema supports it.

## 5. Progressive disclosure

Keep `SKILL.md` focused and operational. Put detailed domain guidance, long checklists, examples, and test protocols in `references/`.

`SKILL.md` must:

1. Define when to use and not use the skill.
2. Define the stage machine.
3. Define how to start and resume a design job.
4. Define the mandatory user-facing status block.
5. Define the next-question policy.
6. Define when to read each reference.
7. Define artifact update requirements.
8. Define image-generation and screenshot handling rules.
9. Define the design-approval gate.
10. Define the implementation-handoff gate.
11. Define Chrome DevTools QA as a hard gate.
12. Define stopping criteria.
13. Define failure behavior.
14. Link to all required references using correct relative paths.
15. Avoid duplicating entire reference documents.

Do not create a vague or motivational `SKILL.md`. Every instruction must be actionable.

## 6. Conversational behavior

The skill must feel like a persistent senior product designer and design-operations lead guiding a user through the process.

At the start of every response while the skill is active, show a compact status block in this exact conceptual format:

```text
Design job: <job-id or NEW>
Stage: <current-stage-number>/<total-stages> — <stage-name>
Status: <active | blocked | awaiting-user | ready-for-handoff | qa-running | approved>
Completed: <comma-separated completed stages>
Current objective: <one sentence>
Missing evidence: <none or concise list>
Open decisions: <count>
Locked decisions: <count>
Next gate: <gate name>
```

The wording may be refined, but all fields must remain.

Conversation rules:

1. Ask no more than three questions in one turn.
2. Ask only the highest-value unanswered questions needed for the current gate.
3. Never ask a question whose answer already exists in the current conversation or design-job artifacts.
4. Provide a recommended answer and brief rationale for each real design choice.
5. Allow the user to answer “use your recommendation.”
6. Distinguish:
   - user-provided fact
   - screenshot-observed fact
   - repository-observed fact
   - design recommendation
   - assumption
7. Never present an assumption as a locked decision without recording it as an assumption first.
8. Do not overwhelm the user with the complete workflow at every turn.
9. Do not ask for every screenshot at once. Request the smallest useful next batch.
10. When a non-blocking detail is missing, choose a conservative default, record it, and continue.
11. When a missing detail would change product behavior, accessibility, or data semantics, mark the job blocked rather than guessing.
12. Summarize newly locked decisions after each user answer.
13. Keep a durable manifest; do not rely on chat memory alone.
14. Support `new`, `resume`, `status`, `revise`, `approve`, `package`, `qa`, and `archive` user intents.
15. When the user changes an approved decision, increment the job revision and identify affected downstream artifacts.

## 7. Design-job state machine

Implement and document a strict state machine. Required stages:

1. `DISCOVERY`
2. `SCOPE`
3. `REFERENCE_INTAKE`
4. `REFERENCE_VALIDATION`
5. `VISUAL_ANALYSIS`
6. `DIRECTION_EXPLORATION`
7. `DIRECTION_APPROVAL`
8. `COMPONENT_ANATOMY`
9. `STATE_CONTRACT`
10. `RESPONSIVE_CONTRACT`
11. `INTERACTION_ACCESSIBILITY`
12. `TOKENS_GEOMETRY`
13. `PROTOTYPE_OPTIONAL`
14. `HANDOFF_ASSEMBLY`
15. `HANDOFF_VALIDATION`
16. `IMPLEMENTATION_AWAITED`
17. `CHROME_QA_PREFLIGHT`
18. `CHROME_QA_EXECUTION`
19. `VISUAL_REMEDIATION`
20. `FINAL_APPROVAL`
21. `ARCHIVED`

Also support:

- `PAUSED`
- `BLOCKED`
- `CANCELLED`

For every stage, `workflow-state-machine.md` must define:

- purpose
- entry criteria
- required inputs
- allowed actions
- required output artifacts
- exit criteria
- blocking conditions
- permitted backward transitions
- revision effects
- next stage

The scripts must validate legal stage transitions.

## 8. Design-job manifest

The `design-job.yaml` template must include at least:

```yaml
schema_version:
job:
  id:
  title:
  status:
  stage:
  revision:
  created_at:
  updated_at:
  owner:
  product:
  repository:
  branch:
  artifact_root:

scope:
  product_family:
  template:
  component:
  implementation_mode:
  design_goal:
  user_problem:
  primary_user_action:
  out_of_scope:
  merchant_configurability:
  business_logic_constraints:

viewports:
  reference:
  required:
  edge_cases:
  browser_zoom:
  device_pixel_ratio_policy:
  locale:
  currency:
  color_scheme:
  reduced_motion:

references:
  current:
  target:
  context:
  approved:
  implementation:
  provenance:
  permissions_or_usage_notes:

decisions:
  locked:
  assumptions:
  rejected:
  open:

states:
  required:
  optional:
  not_applicable:
  coverage_status:

responsive:
  contract_status:
  breakpoints:
  transformations:

accessibility:
  requirements:
  known_risks:
  validation_status:

handoff:
  status:
  package_path:
  implementation_owner:
  implementation_branch:
  implementation_commit:

qa:
  chrome_mcp_required:
  preflight_status:
  baseline_status:
  execution_status:
  required_viewports:
  required_states:
  console_status:
  network_status:
  accessibility_status:
  performance_status:
  visual_diff_status:
  artifacts_path:
  blockers:

approvals:
  design:
  handoff:
  implementation:
  final:
```

Use a schema version and validate it.

## 9. Screenshot intake

The skill must classify every uploaded or referenced screenshot into one or more roles:

- `CURRENT`
- `TARGET`
- `INSPIRATION`
- `CONTEXT`
- `STATE`
- `MOBILE`
- `TABLET`
- `DESKTOP`
- `IMPLEMENTATION`
- `APPROVED_BASELINE`
- `REGRESSION_RESULT`

For every screenshot, record:

- stable ID
- original filename
- local artifact path
- role
- component
- state
- viewport width and height, known or estimated
- browser zoom, known or unknown
- pixel dimensions
- crop status
- surrounding context included
- source/provenance
- intended use: exact match, structural reference, or inspiration
- quality issues
- comparable counterparts
- approval status

The skill must evaluate:

- Is the component fully visible?
- Is there enough surrounding context to understand alignment?
- Is the screenshot distorted, scaled, compressed, or inside a device mockup?
- Does it include browser chrome that should be excluded?
- Is browser zoom likely not 100%?
- Are current and target screenshots captured at comparable widths?
- Are fonts and images loaded?
- Is the state identifiable?
- Are overlays, tooltips, sticky bars, and safe-area regions visible where relevant?
- Is the screenshot sufficient for geometry comparison?
- Is copy legible?
- Is the reference an exact target or only inspiration?

When screenshots are incomparable, explain exactly what can and cannot be inferred and request a corrected capture.

The screenshot-capture instructions must request:

- exact viewport dimensions
- browser zoom at 100%
- no DevTools dock reducing the page viewport unless deliberately specified
- stable data and no loading skeleton unless that is the tested state
- full component plus a small amount of page context
- no device-frame mockup
- no cursor covering important content
- one state per image unless creating a deliberate state board
- clear filename convention

Use a filename convention such as:

```text
<job-id>__<role>__<component>__<state>__<width>x<height>__r<revision>.png
```

## 10. Visual decomposition

`visual-analysis-rubric.md` must make the skill analyze all applicable dimensions:

### Layout
- page and component boundaries
- container width
- grid or flex structure
- columns
- rows
- alignment
- stacking
- sticky/fixed behavior
- overflow and scrolling
- whitespace distribution
- visual balance

### Geometry
- widths and heights
- min/max dimensions
- padding
- gaps
- margins
- image ratios
- button and control dimensions
- border widths
- radii
- icon size
- progress-track geometry
- line clamping
- scroll regions

### Typography
- hierarchy
- font family or fallback
- size
- weight
- line height
- letter spacing
- casing
- truncation
- wrapping
- numerical alignment
- price formatting

### Color and surface
- background
- text
- muted text
- border
- selection
- success
- warning
- error
- disabled
- focus
- hover
- shadows
- gradients
- merchant-configurable values

### Content hierarchy
- primary task
- primary action
- secondary action
- progress feedback
- pricing
- variants
- quantity
- empty guidance
- discount messaging
- error recovery

### Interaction
- click/tap targets
- hover
- focus-visible
- selected
- pressed
- disabled
- loading
- expanded/collapsed
- modal open/close
- keyboard behavior
- touch behavior
- scroll behavior
- animation and reduced motion

### Responsiveness
- resize versus reflow
- reorder
- collapse
- replacement component
- horizontal scroll
- content truncation
- fixed/sticky changes
- safe-area behavior
- orientation changes
- narrow-width stress

### Accessibility
- semantic control type
- accessible name
- focus order
- visible focus
- state announcement
- contrast risk
- color-independent state indication
- keyboard completion
- reduced motion
- error identification
- target size project requirement

For each observation, label confidence as `high`, `medium`, or `low`.

## 11. Design exploration and image generation

The skill must not generate final visuals before scope and reference quality are sufficient.

When design exploration is appropriate:

1. Generate two to four clearly differentiated directions unless the user asks for a single controlled revision.
2. Keep functional requirements equivalent across directions.
3. Use exact user-provided copy where available.
4. Use realistic but clearly marked sample data when copy is missing.
5. Include long-title and pricing stress cases in at least one concept.
6. Avoid device mockups and marketing scenes unless the user explicitly requests them.
7. Prefer flat, front-facing component canvases.
8. Preserve requested dimensions.
9. Do not combine desktop and mobile unless creating a labeled comparison board.
10. Explain the trade-offs among directions.
11. Ask the user to approve one direction before expanding states.

After direction approval:

- treat the approved image as the immutable base
- make only requested deltas
- preserve canvas, geometry, typography, spacing, colors, and unaffected content
- assign a revision number to every approved artifact
- record why a new revision was created
- never silently regenerate unrelated areas

When image-generation tools are unavailable, create a precise image-generation prompt and continue with specification work. Do not pretend an image was generated.

## 12. Component anatomy and state coverage

The skill must create a named component tree and ownership model.

At minimum, anatomy must include:

- root component
- regions
- repeated items
- labels and text
- images
- controls
- feedback elements
- overlays
- scrolling containers
- sticky/fixed regions
- desktop/mobile replacements
- optional and conditional elements

`state-coverage-catalog.md` must include a broad ecommerce catalog and instructions to select only applicable states.

Required catalog:

### Universal
- default
- hover
- focus-visible
- pressed
- disabled
- loading
- error
- empty
- populated
- long content
- missing image
- slow image
- high zoom
- reduced motion

### Product card
- unselected
- selected
- quantity one
- quantity greater than one
- maximum quantity
- variant required
- variant selected
- multiple variants
- unavailable variant
- out of stock
- discounted price
- compare-at price
- free gift
- default included
- locked step
- dimmed
- details modal available

### Bundle summary/sidebar/footer
- no selections
- partial
- minimum reached
- between tiers
- tier reached
- final tier reached
- discount applied
- original and final total
- long list
- scrollable list
- product removed
- clear all
- CTA disabled
- CTA enabled
- submitting
- submit failure
- expanded
- collapsed

### Tabs/progress/steps
- inactive
- active
- completed
- locked
- included
- overflow
- one tier
- multiple tiers
- zero progress
- partial progress
- complete progress

### Modal
- closed
- opening
- open
- variant selection
- quantity change
- image carousel
- out of stock
- add success
- add error
- closing
- focus trap
- escape close

Every state must have:

- trigger
- data precondition
- visible result
- interaction availability
- accessibility requirement
- desktop behavior
- mobile behavior
- screenshot requirement
- automated assertion
- approval status

## 13. Responsive contract

The skill must never use “make it responsive” as a complete requirement.

For each component region and breakpoint range, define:

- size behavior
- layout mode
- order
- visibility
- replacement component
- scroll behavior
- sticky/fixed behavior
- text wrapping/clamping
- image fitting
- control sizing
- spacing changes
- safe-area behavior
- orientation behavior
- minimum viable width
- overflow policy

Use required reference widths only when appropriate to the component. Provide a default matrix:

```text
320 × 720   narrow mobile stress
360 × 800   baseline mobile
390 × 844   primary mobile
414 × 896   wide mobile
768 × 1024  tablet portrait
1024 × 768  small desktop/tablet landscape
1280 × 800  desktop
1440 × 900  primary desktop
1536 × 960  wide desktop
```

The skill must allow the project to override this matrix.

Test breakpoint boundaries at one pixel below, at, and one pixel above where a layout transformation is critical.

## 14. Design tokens and geometry

Create `design-tokens.json` with semantic groups:

- color
- typography
- spacing
- size
- radius
- border
- shadow
- z-index
- motion
- breakpoint
- component-specific aliases

Every token must include:

- name
- value
- unit
- source: reference-observed, repository-existing, user-defined, or recommendation
- confidence
- merchant-configurable boolean
- notes

Do not hard-code merchant-configurable values in the implementation handoff.

Geometry must identify exact values where evidence is reliable and ranges or recommendations where it is not.

## 15. Content stress cases

Create deterministic stress fixtures for:

- very long product title
- short product title
- high price
- discounted price
- zero discount
- long variant name
- multiple variant dimensions
- missing image
- portrait image
- landscape image
- quantity 1
- quantity 10+
- zero selected products
- many selected products
- long translated copy
- currency with wider symbol/format
- validation error
- slow-loading state

The handoff must identify which cases are required in browser QA.

## 16. Repository and code-ownership analysis

Before producing a Codex implementation handoff, the skill must inspect the repository and create an ownership map without modifying production code.

It must identify:

- DOM/rendering owner
- business-state owner
- event-handler owner
- shared CSS owner
- template/preset CSS owner
- viewport-specific owner
- runtime-injected style owner
- merchant design-token owner
- test owner
- fixture/demo route owner
- existing visual-regression owner
- likely conflicts and duplicate declarations
- canonical location for each requested change

Classify every requested design change as one of:

- shared component behavior
- shared component presentation
- product-family-specific behavior
- template/preset-specific presentation
- state-specific presentation
- viewport-specific presentation
- merchant-configurable token
- data/content issue
- markup/accessibility issue
- test-only fixture

The handoff must explicitly prohibit a new higher-specificity override when the correct fix is to change the canonical owner.

The skill must detect and call out:

- styles injected from JavaScript
- duplicate selectors
- contradictory media queries
- `!important` escalation
- hard-coded colors that bypass tokens
- same component styled by multiple files
- mobile styles outside mobile media queries
- DOM recreated for presentation-only reasons
- separate implementations with duplicated business logic
- naming tied to a competitor or obsolete template name

## 17. Wolfpack domain context

Create `wolfpack-domain-context.md` as project-specific reference material, not as hard-coded assumptions about current file paths.

Include:

### Product families
- FPB: Standard, Classic, Compact, Horizontal
- PPB: Grid, List, Vertical Slots, Horizontal Slots

### Common component slices
- product cards
- category/step navigation
- summary sidebar
- mobile summary tray/footer
- discount messaging and progress
- variant selection
- quantity controls
- product-details modal
- bundle total
- primary CTA
- empty/loading/error feedback
- promotional banners
- free-gift and default-included states

### Architectural safeguards
- preserve bundle-selection and pricing business logic
- prefer existing semantic markup and classes
- reuse existing variables and token ownership
- no competitor-related naming
- use Wolfpack-oriented naming for unavoidable new identifiers
- do not create parallel component systems
- do not duplicate shared behavior across templates
- scope template-only presentation to the template/preset
- keep mobile-only CSS in appropriate media queries
- verify every affected template after a shared change
- do not use runtime CSS injection for static stylesheet ownership unless architecture requires it
- avoid `!important` except for a documented external storefront conflict
- preserve merchant customization
- no unrelated visual changes

The skill must discover the current repository architecture every time because it may be refactored.

## 18. Codex implementation handoff

The generated `implementation-handoff.md` and `codex-task.md` must contain:

- job ID and revision
- approved references
- source-of-truth priority
- goal
- non-goals
- current architecture map
- exact component anatomy
- required states
- responsive transformations
- interaction contract
- accessibility contract
- tokens and merchant-configurable values
- content fixtures
- allowed production areas
- prohibited changes
- test commands discovered from repository
- Chrome DevTools QA plan
- acceptance criteria
- stopping criteria
- expected final report format
- unresolved risks
- rollback guidance

Source-of-truth priority must be:

1. Existing product/business semantics
2. Repository `AGENTS.md` and architecture
3. Approved interaction, state, responsive, and accessibility contracts
4. Approved standalone prototype, if present
5. Design tokens and geometry
6. Approved reference images for visual nuance

The prompt must instruct Codex to inspect before editing, implement the smallest architecture-correct change, run tests, capture browser evidence, and report remaining differences honestly.

## 19. Chrome DevTools MCP is a hard QA gate

Create a complete `chrome-devtools-test-protocol.md`.

The skill must use Chrome DevTools MCP as the primary browser automation and inspection mechanism. Playwright may be used only as an additional repository test runner if the repository already uses it; it must not replace the required Chrome DevTools MCP QA pass.

The protocol must use the currently exposed Chrome DevTools tools. It must not invent tools. At minimum, account for these tool capabilities where available:

### Browser and navigation
- list/select/new/close pages
- navigate
- wait for content or state

### Input
- click
- hover
- fill or fill form
- type text
- press keys
- drag where relevant
- handle dialogs
- upload files where relevant

### Emulation
- resize page
- emulate device, color scheme, network, CPU, geolocation, or user agent where relevant

### Inspection
- accessibility-tree snapshot
- evaluate JavaScript in the page
- take page or element screenshots
- inspect console messages
- inspect network requests

### Quality
- Lighthouse accessibility, best-practices, SEO, and agentic-browsing audits where applicable
- performance traces and insights for Core Web Vitals when the change can affect loading, layout stability, or interaction responsiveness

The skill must detect tool availability during `CHROME_QA_PREFLIGHT`.

If Chrome DevTools MCP is unavailable:

1. Do not claim QA passed.
2. Mark `qa.preflight_status` as blocked.
3. Provide the exact setup action for the current host.
4. Preserve all other generated artifacts.
5. Resume from preflight after setup.
6. Do not silently substitute a different browser and mark the Chrome gate complete.

## 20. Chrome QA deterministic setup

The protocol must define:

1. Discover the repository’s approved start command.
2. Start the app using existing scripts.
3. Discover or create an approved deterministic preview route/fixture without changing production behavior.
4. Use stable fixture data.
5. Set locale, currency, theme, and feature flags explicitly.
6. Set browser zoom to 100%.
7. Set exact viewport dimensions.
8. Use an isolated Chrome profile for unauthenticated tests.
9. Use a dedicated authenticated test profile when authentication is necessary.
10. Never attach to an unrelated personal profile without explicit user direction.
11. Wait for fonts, images, application hydration, and target state.
12. Disable nonessential animation for static visual capture by injecting a reversible test-only style:
    - `animation: none !important`
    - `transition: none !important`
    - `caret-color: transparent` where useful
13. Do not disable behavior whose animation itself is under test.
14. Normalize the scroll position.
15. Close unrelated tabs or select the intended page.
16. Record Chrome version, viewport, DPR policy, URL, commit, branch, fixture, timestamp, job revision, and state.
17. Save all browser artifacts inside the design job’s QA folder.

## 21. Required Chrome QA sequence

For every required viewport and state:

1. Select or create the test page.
2. Navigate to the deterministic URL.
3. Resize or emulate the required viewport.
4. Wait for the component and stable state.
5. Take a fresh accessibility-tree snapshot.
6. Find controls from the latest snapshot; do not reuse stale element IDs.
7. Drive the interaction using click/fill/hover/keyboard tools.
8. Verify the expected state semantically.
9. Run in-page assertions through script evaluation.
10. Capture an element screenshot where a stable component root exists.
11. Capture a viewport screenshot when surrounding alignment matters.
12. List console messages and fail on new uncaught errors, unhandled promise rejections, severe warnings, or application-specific error logs.
13. List network requests and fail on unexpected failed requests, blocked assets, or missing design resources.
14. Save a state result in the browser test report.
15. Reset the fixture before the next independent case.

At the end of a run:

- run Lighthouse desktop and mobile audits where applicable
- run a performance trace when required by the change
- compare screenshots against approved baselines
- produce diff artifacts
- generate a remediation list
- rerun failed cases after correction
- do not approve until all mandatory cases pass or are explicitly waived with reason and approver

## 22. Automated in-page assertions

The browser test plan must support declarative assertions. Include templates for:

### Existence and visibility
- required element exists
- required control is visible
- hidden element is absent or not exposed
- correct component replacement is used on mobile

### Geometry
- expected bounding box within tolerance
- stable card dimensions across selected/unselected state
- image aspect ratio
- button dimensions
- sidebar/tray width
- expected gap/padding
- sticky/fixed position
- no clipping
- intended scroll container size

### Overflow
- document has no unintended horizontal overflow
- component root has no unintended horizontal overflow
- text is clamped or wraps as specified
- selected indicator remains inside intended bounds
- expanded tray content does not cover the CTA
- safe-area padding is present where required

### Style
- expected computed display/layout mode
- expected font size/weight/line height
- expected border width/radius
- expected focus outline
- expected selection indicator
- expected disabled treatment
- merchant-configurable colors resolve through variables where required

### Interaction
- click changes state once
- repeated click does not duplicate rows
- quantity update changes count and totals
- remove updates summary and total
- clear resets component
- expand/collapse updates visible state and `aria-expanded`
- Escape closes modal where specified
- keyboard reaches every interactive element
- Enter/Space activate appropriate controls
- focus returns correctly after modal close
- focus remains visible
- CTA disabled/enabled state follows business rules

### Accessibility
- control has an accessible name
- button is a button, not a generic clickable element where semantics require it
- current/selected/expanded/disabled state is exposed
- no duplicate IDs in the component subtree
- image alternative text policy is satisfied
- focus order follows visual/task order
- state is not communicated by color alone
- Lighthouse accessibility issues are recorded and triaged

### Content
- exact approved copy
- price and currency formatting
- variant label
- discount tier copy
- long title behavior
- missing image fallback
- zero and many-item states

### Resource health
- all required images load with nonzero natural dimensions
- no failed CSS/JS/image/font requests
- no unexpected duplicate API calls caused by the change

## 23. Visual comparison

Create `compare_images.py` and `visual-comparison-rubric.md`.

The script must:

- accept baseline, actual, optional mask, output diff path, and threshold arguments
- verify dimensions
- create a machine-readable JSON summary
- create a visual diff image when dependencies permit
- report mismatch ratio and bounding region of differences
- return nonzero exit status when configured thresholds fail
- never return pass when a comparison could not run
- provide actionable dependency/setup guidance
- avoid automatically installing dependencies
- use a documented fallback if Pillow is unavailable
- make thresholds configurable per job and state

Use both automated and semantic review:

### Automated
- dimensions
- pixel mismatch ratio
- changed-region bounding box
- masked dynamic regions
- expected tolerance

### Semantic
- hierarchy
- component boundaries
- spacing
- alignment
- text wrapping
- state clarity
- control affordance
- responsive transformation
- visual weight
- unintended changes

Default guidance, configurable by project:

- stable prototype/component with deterministic assets: strict mismatch budget
- storefront with raster product imagery: mask imagery or use a wider image-region tolerance
- major component boundary deviation: approximately 4 CSS px maximum unless approved
- no unexpected text wrapping
- no horizontal overflow
- no clipped state indicators
- no layout shift between ordinary state transitions

Do not reduce a visual review to one global percentage.

## 24. Console, network, accessibility, and performance gates

The test report must separately record:

- functional interaction pass/fail
- visual pass/fail
- geometry pass/fail
- responsive pass/fail
- console pass/fail
- network pass/fail
- accessibility pass/fail
- performance pass/fail or not-applicable
- non-regression pass/fail
- final approval

Performance rules:

- use performance traces, not Lighthouse performance, for Core Web Vitals
- record LCP, CLS, and interaction-related findings when available
- treat local-machine timing as lab evidence, not universal field truth
- compare against a baseline where possible
- mark performance not-applicable only with a reason
- investigate new layout shifts introduced by component loading or state changes
- save trace artifacts when performance is in scope

## 25. Non-regression testing

For shared components, the skill must discover affected siblings and require a non-regression matrix.

For Wolfpack, examples include:

- shared FPB change: verify Standard, Classic, Compact, Horizontal
- shared PPB change: verify Grid, List, Vertical Slots, Horizontal Slots
- shared primitive change: verify both families where applicable
- template-only change: verify the target template plus at least one sibling control baseline
- mobile-only change: verify desktop remains unchanged
- desktop-only change: verify mobile replacement remains unchanged

The skill must not assume that a visual change is isolated merely because the requested screenshot shows one template.

## 26. Failure and recovery

Document and implement behavior for:

- missing screenshots
- unreadable screenshots
- mismatched viewports
- missing repository
- missing AGENTS instructions
- design conflict with business logic
- inaccessible test route
- missing fixture data
- authentication barrier
- Chrome MCP unavailable
- Chrome launch failure
- stale snapshot element IDs
- app startup failure
- console errors
- network errors
- screenshot dimension mismatch
- pixel-diff dependency missing
- dynamic content causing unstable diff
- test flake
- user changes an approved decision
- implementation branch not available
- baseline missing
- unsupported viewport
- inaccessible modal state
- partial implementation
- tool timeout

Rules:

1. Never mark a blocked check as passed.
2. Retry only when the failure is plausibly transient.
3. Record every retry and outcome.
4. Distinguish infrastructure failure from product failure.
5. Preserve partial evidence.
6. Give the next exact recovery action.
7. Resume from the failed gate rather than restarting the design job.
8. Do not erase previous approval history when revising.

## 27. Security and privacy

The skill must explain that Chrome DevTools MCP can inspect and act within the connected browser.

Requirements:

- prefer isolated profiles
- do not inspect unrelated tabs
- do not expose personal email, payment, customer, or admin data in screenshots
- use test stores and fixture accounts
- redact tokens and secrets
- do not save cookies, auth headers, or private response bodies into design artifacts
- do not attach to a personal Chrome profile by default
- do not run destructive merchant/admin actions during design QA
- do not submit real orders
- do not alter production data
- explicitly identify whether testing is local, development, staging, or production
- production testing must be read-only unless separately authorized
- remote-debugging ports must use a dedicated user-data directory
- retain only evidence required for the design job

## 28. Scripts

All Python scripts must:

- support `--help`
- use type hints
- use clear exit codes
- validate inputs
- avoid silent failure
- use the standard library where practical
- avoid network access
- avoid modifying production code
- write deterministic outputs
- be unit-tested
- work on macOS and Linux; document Windows limitations if any
- use atomic writes for manifests
- preserve YAML comments only if the chosen parser supports it; otherwise document behavior
- never overwrite an approved artifact without creating a revision or explicit `--force`

Required behavior:

### `init_design_job.py`
- generate a slugged job ID
- copy templates
- initialize directories
- populate timestamps and repository metadata
- reject collisions unless explicitly resuming
- print the job path

### `validate_design_job.py`
- validate schema and required fields
- validate stage-required artifacts
- validate file references
- return structured JSON optionally
- list blocking and non-blocking issues

### `update_job_stage.py`
- validate legal transitions
- update timestamps/revision
- require gate evidence
- support pause/block/resume
- append immutable transition history

### `inspect_reference_images.py`
- inspect local image existence, dimensions, format, aspect ratio, file size, and hashes
- flag probable mismatch and low-resolution references
- use Pillow when available but retain a dependency-light path for common metadata where practical
- never infer viewport from pixel dimensions as certain; label it estimated

### `validate_handoff.py`
- ensure every required state has design, behavior, accessibility, and test coverage
- ensure source-of-truth priority exists
- ensure no open blocking decisions
- ensure required references exist
- ensure Chrome test plan is complete

### `package_handoff.py`
- create a deterministic handoff directory or archive
- include only approved artifacts
- include a manifest with checksums
- exclude secrets, temp files, failed screenshots, and browser profiles
- never package production credentials

### `compare_images.py`
- implement the visual comparison behavior defined above

### `summarize_browser_artifacts.py`
- consolidate screenshots, console, network, Lighthouse, performance, assertions, and diffs
- generate Markdown and JSON summaries
- identify missing evidence
- never convert missing evidence into pass

## 29. Tests

Use the repository’s existing Python test conventions where present. Otherwise use `unittest` from the standard library.

Tests must cover:

- new job creation
- collision handling
- resume
- valid stage transitions
- invalid stage transitions
- required artifact gates
- revision increments
- atomic write behavior
- malformed manifest
- missing reference files
- image metadata extraction
- mismatched dimensions
- handoff completeness
- package checksums
- secret/temp exclusion
- image comparison pass/fail
- dependency-unavailable behavior
- browser artifact summary with missing evidence
- cross-platform path handling
- deterministic output

Create fixtures representing:

- product card design job
- summary sidebar design job
- mobile tray design job
- incomplete screenshot inventory
- approved direction
- complete handoff
- blocked Chrome QA
- passing Chrome QA
- failed visual diff
- failed console/network check

Run all tests and include the exact command and result in the final response.

## 30. Evals

Create invocation and workflow eval cases that test whether the skill:

- triggers for storefront screenshot-to-component work
- triggers for visual QA after implementation
- does not trigger for backend API design
- does not trigger for a standalone logo illustration
- guides rather than dumping a huge questionnaire
- remembers decisions through artifacts
- resumes correctly
- detects mismatched screenshots
- requires state coverage
- requires responsive behavior
- identifies repository style ownership
- blocks on missing Chrome MCP rather than claiming pass
- creates measured remediation feedback
- avoids production code edits in design-director mode
- requests user approval at the correct gates
- handles interruption and changed decisions

Create an eval rubric with both concrete checks and qualitative criteria.

## 31. Definition of done

The skill is complete only when:

1. The required directory exists.
2. `SKILL.md` has valid metadata and progressive disclosure.
3. Every referenced file exists.
4. Templates are internally consistent.
5. Stage transitions are defined and validated.
6. Scripts are functional and tested.
7. Chrome DevTools QA is mandatory and fully specified.
8. No unsupported Chrome tool name is invented.
9. Missing Chrome tooling produces a blocked state, not a pass.
10. Screenshot intake and comparison are rigorous.
11. Responsive, interaction, accessibility, content, and state coverage are present.
12. Repository ownership analysis is required before implementation handoff.
13. Wolfpack context is included but file paths remain discoverable, not hard-coded.
14. Production application code is unchanged.
15. All tests pass.
16. Eval fixtures and runbook exist.
17. README explains installation, invocation, job lifecycle, Chrome setup, and troubleshooting.
18. There are no TODO, FIXME, placeholder, or “implement later” sections.
19. The final response includes:
    - created file tree
    - tests run and results
    - assumptions
    - dependencies
    - Chrome MCP setup status
    - any limitations
    - example invocation for a new design job
    - example invocation for resume
    - example invocation for QA

Proceed to create and validate the skill now. Do not stop at a plan.

---
