---
schema_version: 1
id: storefront-design-director-chrome-protocol
title: Chrome DevTools Test Protocol
type: skill-reference
status: active
summary: Defines the mandatory deterministic Chrome DevTools MCP preflight, browser automation, evidence, and remediation gates for storefront implementation QA.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/chrome-devtools-test-protocol.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/browser-test-plan.yaml
  - .agents/skills/storefront-design-director/assets/templates/chrome-preflight-result.yaml
  - .agents/skills/storefront-design-director/references/chrome-flow-recipes.md
tags:
  - chrome-devtools
keywords:
  - visual-qa
  - accessibility-tree
  - performance-trace
---

# Chrome DevTools Test Protocol

Chrome DevTools MCP is the mandatory primary browser QA mechanism. Existing test runners may supplement this protocol, but they cannot complete its preflight, interaction, screenshot, console, network, Lighthouse, or performance gates. Missing Chrome connectivity or evidence is blocked, never inferred from source or replaced with another browser.

## Verified capability inventory

The following capability surface was enumerated from the Chrome DevTools MCP server exposed to Codex on 2026-08-03. Record the exposed inventory again at every preflight because host namespaces and versions can change. Guidance outside this inventory remains capability-oriented; never invent a tool name.

| Capability | Verified exposed tool names |
|---|---|
| Page list, selection, creation, close | `mcp__chrome_devtools__list_pages`, `mcp__chrome_devtools__select_page`, `mcp__chrome_devtools__new_page`, `mcp__chrome_devtools__close_page` |
| Navigation and waiting | `mcp__chrome_devtools__navigate_page`, `mcp__chrome_devtools__wait_for` |
| Resize and emulation | `mcp__chrome_devtools__resize_page`, `mcp__chrome_devtools__emulate` |
| Accessibility-tree snapshot | `mcp__chrome_devtools__take_snapshot` |
| Click, hover, form input, typing, keys, drag | `mcp__chrome_devtools__click`, `mcp__chrome_devtools__hover`, `mcp__chrome_devtools__fill`, `mcp__chrome_devtools__fill_form`, `mcp__chrome_devtools__type_text`, `mcp__chrome_devtools__press_key`, `mcp__chrome_devtools__drag` |
| Dialogs and upload | `mcp__chrome_devtools__handle_dialog`, `mcp__chrome_devtools__upload_file` |
| JavaScript evaluation | `mcp__chrome_devtools__evaluate_script` |
| Screenshots | `mcp__chrome_devtools__take_screenshot` |
| Console | `mcp__chrome_devtools__list_console_messages`, `mcp__chrome_devtools__get_console_message` |
| Network | `mcp__chrome_devtools__list_network_requests`, `mcp__chrome_devtools__get_network_request` |
| Lighthouse accessibility, best practices, SEO, and agentic browsing | `mcp__chrome_devtools__lighthouse_audit` |
| Performance traces and insights | `mcp__chrome_devtools__performance_start_trace`, `mcp__chrome_devtools__performance_stop_trace`, `mcp__chrome_devtools__performance_analyze_insight` |
| Supplementary memory evidence | `mcp__chrome_devtools__take_heapsnapshot` |

`lighthouse_audit` explicitly excludes performance. Use performance tracing for LCP, CLS, interaction findings, long tasks, and loading insights. When `new_page` exposes `isolatedContext`, omit it. When `select_page` exposes `bringToFront`, omit it or set it to `false` in this repository.

The inventory call succeeded, but the connection probe on 2026-08-03 returned `Could not connect to Chrome` because the default profile did not expose `DevToolsActivePort`. That is a connection blocker, not a missing-tool excuse. For the default-profile auto-connect path, follow the [official Chrome DevTools MCP running-browser instructions](https://github.com/ChromeDevTools/chrome-devtools-mcp#automatically-connecting-to-a-running-chrome-instance): open `chrome://inspect/#remote-debugging`, enable remote debugging, approve the incoming connection prompt, and rerun `list_pages`. Do not use the manual remote-debugging-port path because current Chrome requires a non-default user-data directory for it, which this skill forbids.

## Strict preflight

Create `qa/preflight.json` from [chrome-preflight-result.yaml](../assets/templates/chrome-preflight-result.yaml). Every mandatory check records `status`, direct `evidence`, and, when blocked, one exact `blocker` plus `recovery_action`.

Preflight passes only when all of these are directly verified:

1. Chrome DevTools MCP is connected and `list_pages` returns live pages.
2. A supported Chrome or Chrome for Testing instance is available.
3. The intended page is selected; unrelated tabs are not inspected.
4. The repository-approved app server responds.
5. Environment is explicitly local, development, staging, or production.
6. The deterministic fixture route exists.
7. Authentication state is intentional and uses the connected default profile.
8. No unrelated sensitive tab is selected or captured.
9. The page can be resized to every planned viewport.
10. A fresh accessibility-tree snapshot succeeds.
11. A PNG can be saved inside the permitted job QA directory.
12. Console listing and message detail work.
13. Network listing and request detail work without saving secrets.
14. Repository path, branch, and commit are recorded.
15. Design job ID and revision are recorded.
16. Approved baseline ID, revision, and path are recorded.

Fail preflight when any mandatory item is absent. Set `qa.preflight_status` to `blocked`, preserve prior artifacts, give the smallest host-specific recovery action, and remain at CHROME_QA_PREFLIGHT. Never use a different browser to mark this gate passed.

## Deterministic browser setup

1. Use only the currently connected default Chrome profile. Do not create an isolated context, dedicated QA profile, secondary profile, alternate user-data directory, or browser-profile artifact. Authentication, when required, happens intentionally in this default profile.
2. Use the repository-approved server and route. Respect user-owned server, deployment, test-store, cache-bypass, and production-read-only rules.
3. Reset browser zoom to 100 percent with the platform shortcut (`Meta+0` on macOS or `Control+0` elsewhere), then record actual DPR. Do not infer CSS viewport width from screenshot pixels.
4. Resize explicitly. Use a desktop viewport of at least 1280 by 800 and the approved mobile viewport, normally 390 by 844 for Wolfpack storefront proof. Record width, height, DPR, mobile or desktop mode, touch emulation, and orientation.
5. Lock fixture locale, currency, theme or color scheme, feature flags, product inventory, prices, images, and content. Record each value. Do not change merchant or production data to stabilize a test.
6. Use deterministic random or clock hooks only when the application already exposes approved test hooks. Record the hook and restore it. Otherwise exclude timestamps from exact comparison or use an approved narrowly bounded mask.
7. Wait for `document.fonts.ready`, every relevant image to be complete with non-zero natural dimensions, document readiness, application hydration, and the named target state. Use an app-owned ready signal or declarative assertion for hydration; a time delay alone is not proof.
8. Set the intended scroll position before each capture. Record document and component scroll offsets. Restore both after reversible probes.
9. For static captures only, inject the reversible capture style through the assertion dispatcher. It disables nonessential animation and smooth scrolling and hides carets and transient cursors. Remove it immediately after capture. Do not disable motion when motion is the behavior under test.
10. Exclude or mask only approved dynamic regions. The approval records ID, reason, owner, rectangle, and confirmation that the mask does not cover pixels or geometry exercised by the case assertions. A product-image subregion may be masked only when the image itself is outside the tested contract. Never hide a real defect, component boundary, focus indicator, action, error, or layout shift.
11. Take a fresh accessibility snapshot immediately before each interaction. Snapshot UIDs are ephemeral; never reuse a stale UID.
12. Record URL, page ID, environment, fixture, Chrome version, branch, commit, job revision, baseline revision, viewport, DPR, zoom, locale, currency, theme, flags, state, timestamp, and evidence paths for every case.

## Browser test-plan contract

`browser-test-plan.yaml` contains these required top-level fields:

~~~yaml
job_id:
revision:
environment:
base_url:
fixture:
authentication_mode:
setup:
viewports:
states:
interactions:
assertions:
screenshots:
console_policy:
network_policy:
lighthouse:
performance:
visual_diff:
non_regression:
cleanup:
~~~

Every entry in `interactions` is a test case and contains a stable ID, purpose, precondition, viewport ID, state ID, steps, expected semantic result, DOM assertions, style or geometry assertions, screenshot path, baseline path, allowed mask IDs, console expectations, network expectations, cleanup, pass or fail status, and evidence links. The handoff validator rejects missing fields, unsafe paths, unknown states or viewports, missing desktop or mobile coverage, unapproved masks, masks that cover tested assertions, and an unjustified performance exclusion.

Use [browser-case-result.json](../assets/templates/browser-case-result.json) for execution output. Use `summarize_browser_artifacts.py` to independently reconcile declared gates with files, comparison summaries, assertion outcomes, console and network observations, waivers, and retry history. A declared pass cannot override contradictory evidence.

## Per-case execution sequence

1. Confirm precondition, fixture, state, viewport, and cleanup path.
2. Navigate or reset the deterministic fixture.
3. Apply locale, currency, theme, flags, random or time hooks, viewport, and static-capture setup.
4. Wait for fonts, images, hydration, and target state.
5. Normalize scroll and take a fresh accessibility snapshot.
6. Capture the before screenshot for a critical interaction.
7. Locate controls from the fresh snapshot and drive only the planned safe action.
8. Verify the expected semantic result, DOM assertions, geometry assertions, focus, exposed ARIA state, and one-action-to-one-update behavior.
9. Capture after, element, and contextual viewport PNGs. Capture full page only when the contract needs page-level scroll, sticky, or overflow evidence.
10. Inspect console and network. Retrieve message or request detail only when needed and redact secrets and private bodies.
11. Run applicable Lighthouse desktop and mobile audits. Run and save a performance trace when the plan marks performance required.
12. Compare actual and approved baseline with `compare_images.py`; save diff and JSON summary.
13. Record semantic visual review, result gates, evidence links, cleanup, and retry attempt.
14. Restore scroll, reversible styles, test hooks, and safe fixture state before the next independent case.

## Raw evidence reconciliation

Persist sanitized evidence as JSON objects, not placeholder files. Console evidence contains `violations` and optional `messages` lists. Network evidence contains `violations`, `duplicate_requests`, and optional `requests` lists; one user action producing a duplicate mutation is a network failure. Accessibility evidence contains a machine status and findings. Lighthouse evidence preserves the category scores plus `component_findings`; a failed component finding or an accessibility score below 1 fails the accessibility gate unless the exact finding has a complete approved waiver. Invalid or unreadable raw evidence blocks the gate. `summarize_browser_artifacts.py` reconciles these files independently and a declared case pass cannot override them.

## In-page assertion dispatcher

Pass one JSON string as the argument to `evaluate_script`. The dispatcher returns only JSON-serializable values. It does not retain DOM nodes or browser state. `installStaticCaptureCss`, `removeStaticCaptureCss`, `stickyAfterScroll`, and `measureLayoutShift` are explicitly reversible or planned test actions; use them only when the case cleanup restores state.

~~~javascript
async (requestJson) => {
  "use strict";

  const request = JSON.parse(requestJson);
  const args = Array.isArray(request.args) ? request.args : [];
  const rootFor = (selector) => {
    if (!selector || selector === "document") return document;
    const root = document.querySelector(selector);
    if (!root) throw new Error(`Root not found: ${selector}`);
    return root;
  };
  const elementFor = (selector, rootSelector = "document") => {
    const root = rootFor(rootSelector);
    const element = root.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return element;
  };
  const box = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
  };
  const nodeRef = (element) => {
    if (!element) return null;
    if (element.id) return `#${element.id}`;
    const classes = Array.from(element.classList || []).slice(0, 2).join(".");
    return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}`;
  };
  const accessibleName = (element) => {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      return labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() || "")
        .filter(Boolean)
        .join(" ");
    }
    const labels = element.labels ? Array.from(element.labels).map((label) => label.textContent?.trim() || "").filter(Boolean) : [];
    return element.getAttribute("aria-label") || labels.join(" ") || element.getAttribute("alt") || element.getAttribute("title") || element.getAttribute("name") || element.textContent?.trim() || "";
  };
  const roleFor = (element) => {
    const explicit = element.getAttribute("role");
    if (explicit) return explicit;
    const tag = element.tagName.toLowerCase();
    if (tag === "button") return "button";
    if (tag === "a" && element.hasAttribute("href")) return "link";
    if (tag === "select") return "combobox";
    if (tag === "textarea") return "textbox";
    if (tag === "input") return element.type === "checkbox" ? "checkbox" : element.type === "radio" ? "radio" : "textbox";
    if (tag === "img") return "img";
    return "";
  };
  const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const inside = (outer, inner, tolerance = 0) => (
    inner.left >= outer.left - tolerance &&
    inner.top >= outer.top - tolerance &&
    inner.right <= outer.right + tolerance &&
    inner.bottom <= outer.bottom + tolerance
  );

  const methods = {
    boundingBox(selector, rootSelector = "document") {
      return box(elementFor(selector, rootSelector));
    },

    computedStyleSubset(selector, properties, rootSelector = "document") {
      const element = elementFor(selector, rootSelector);
      const style = getComputedStyle(element);
      return Object.fromEntries((properties || []).map((property) => [property, style.getPropertyValue(property)]));
    },

    horizontalOverflow(selector = "html") {
      const element = selector === "html" ? document.documentElement : elementFor(selector);
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowPixels: Math.max(0, element.scrollWidth - element.clientWidth),
        hasOverflow: element.scrollWidth > element.clientWidth + 1,
      };
    },

    clippedDescendants(rootSelector, tolerance = 0) {
      const root = elementFor(rootSelector);
      const rootBox = box(root);
      const rootStyle = getComputedStyle(root);
      const clipped = Array.from(root.querySelectorAll("*"))
        .filter(visible)
        .map((element) => ({element: nodeRef(element), box: box(element)}))
        .filter((entry) => !inside(rootBox, entry.box, tolerance));
      return {
        root: rootBox,
        overflowX: rootStyle.overflowX,
        overflowY: rootStyle.overflowY,
        clipped,
      };
    },

    duplicateIds(rootSelector = "document") {
      const root = rootFor(rootSelector);
      const counts = {};
      for (const element of root.querySelectorAll("[id]")) {
        counts[element.id] = (counts[element.id] || 0) + 1;
      }
      return Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([id, count]) => ({id, count}));
    },

    interactiveElements(rootSelector = "document") {
      const root = rootFor(rootSelector);
      const selector = "a[href],button,input:not([type='hidden']),select,textarea,details>summary,[tabindex],[contenteditable='true'],[role='button'],[role='link'],[role='checkbox'],[role='radio'],[role='tab'],[role='option']";
      return Array.from(root.querySelectorAll(selector))
        .filter(visible)
        .map((element, index) => ({
          index,
          element: nodeRef(element),
          role: roleFor(element),
          name: accessibleName(element),
          tabIndex: element.tabIndex,
          disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
        }));
    },

    accessibleElements(rootSelector = "document") {
      const root = rootFor(rootSelector);
      return Array.from(root.querySelectorAll("[role],[aria-label],[aria-labelledby],a[href],button,input,select,textarea,img"))
        .filter(visible)
        .map((element) => ({
          element: nodeRef(element),
          role: roleFor(element),
          name: accessibleName(element),
          ariaDescription: element.getAttribute("aria-description") || "",
        }));
    },

    imageStatus(rootSelector = "document") {
      const root = rootFor(rootSelector);
      return Array.from(root.querySelectorAll("img")).map((image) => ({
        element: nodeRef(image),
        src: image.currentSrc || image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        loaded: image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        alt: image.alt,
      }));
    },

    customProperties(selector, names, rootSelector = "document") {
      const style = getComputedStyle(elementFor(selector, rootSelector));
      return Object.fromEntries((names || []).map((name) => [name, style.getPropertyValue(name).trim()]));
    },

    focusVisibleStyle(selector) {
      const element = elementFor(selector);
      const style = getComputedStyle(element);
      return {
        isActiveElement: document.activeElement === element,
        matchesFocusVisible: element.matches(":focus-visible"),
        outlineColor: style.outlineColor,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineOffset: style.outlineOffset,
        boxShadow: style.boxShadow,
      };
    },

    ariaState(selector) {
      const element = elementFor(selector);
      return {
        ariaExpanded: element.getAttribute("aria-expanded"),
        ariaSelected: element.getAttribute("aria-selected"),
        ariaCurrent: element.getAttribute("aria-current"),
        ariaDisabled: element.getAttribute("aria-disabled"),
        disabled: Boolean(element.disabled),
      };
    },

    compareGeometry(before, after, tolerance = 0) {
      const keys = ["x", "y", "width", "height", "top", "right", "bottom", "left"];
      const delta = Object.fromEntries(keys.map((key) => [key, Number(after[key] || 0) - Number(before[key] || 0)]));
      return {
        delta,
        tolerance,
        stable: ["x", "y", "width", "height"].every((key) => Math.abs(delta[key]) <= tolerance),
      };
    },

    async measureLayoutShift(selector, action = "click", settleMs = 150) {
      const target = elementFor(selector);
      const shifts = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          shifts.push({
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            sources: Array.from(entry.sources || []).map((source) => ({
              node: nodeRef(source.node),
              previousRect: source.previousRect ? {...source.previousRect.toJSON()} : null,
              currentRect: source.currentRect ? {...source.currentRect.toJSON()} : null,
            })),
          });
        }
      });
      observer.observe({type: "layout-shift", buffered: false});
      if (action === "click") target.click();
      else if (action === "focus") target.focus({preventScroll: true});
      else throw new Error(`Unsupported controlled action: ${action}`);
      await frames();
      await new Promise((resolve) => setTimeout(resolve, settleMs));
      observer.disconnect();
      return {
        shifts,
        total: shifts.reduce((sum, entry) => sum + entry.value, 0),
      };
    },

    outsideViewport(selector, containerSelector = null, tolerance = 0) {
      const targetBox = box(elementFor(selector));
      const containerBox = containerSelector
        ? box(elementFor(containerSelector))
        : {top: 0, left: 0, right: innerWidth, bottom: innerHeight};
      return {
        target: targetBox,
        container: containerBox,
        outside: !inside(containerBox, targetBox, tolerance),
      };
    },

    async stickyAfterScroll(selector, containerSelector = null, delta = 200) {
      const target = elementFor(selector);
      const container = containerSelector ? elementFor(containerSelector) : document.scrollingElement;
      const before = box(target);
      const previous = {left: container.scrollLeft, top: container.scrollTop};
      container.scrollTo({left: previous.left, top: previous.top + delta, behavior: "instant"});
      await frames();
      const after = box(target);
      container.scrollTo({left: previous.left, top: previous.top, behavior: "instant"});
      await frames();
      const position = getComputedStyle(target).position;
      return {
        position,
        before,
        after,
        topDelta: after.top - before.top,
        fixedToViewport: position === "fixed" && Math.abs(after.top - before.top) <= 1,
        stickyCandidate: position === "sticky",
        scrollRestored: container.scrollTop === previous.top && container.scrollLeft === previous.left,
      };
    },

    approximateLineCount(selector) {
      const element = elementFor(selector);
      const style = getComputedStyle(element);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const contentHeight = element.getBoundingClientRect().height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
      return {
        lineHeight: Number.isFinite(lineHeight) ? lineHeight : null,
        contentHeight,
        approximateLines: Number.isFinite(lineHeight) && lineHeight > 0 ? Math.max(1, Math.round(contentHeight / lineHeight)) : null,
      };
    },

    overlappingRectangles(selectors, tolerance = 0) {
      const entries = (selectors || []).map((selector) => ({selector, box: box(elementFor(selector))}));
      const overlaps = [];
      for (let left = 0; left < entries.length; left += 1) {
        for (let right = left + 1; right < entries.length; right += 1) {
          const a = entries[left].box;
          const b = entries[right].box;
          const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (width > tolerance && height > tolerance) {
            overlaps.push({a: entries[left].selector, b: entries[right].selector, width, height, area: width * height});
          }
        }
      }
      return {entries, overlaps};
    },

    async waitForStable(targetSelector = null) {
      if (document.fonts?.ready) await document.fonts.ready;
      const images = Array.from(document.images);
      await Promise.all(images.map((image) => image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            image.addEventListener("load", resolve, {once: true});
            image.addEventListener("error", resolve, {once: true});
          })));
      if (targetSelector) elementFor(targetSelector);
      await frames();
      return {
        readyState: document.readyState,
        fontsReady: document.fonts ? document.fonts.status === "loaded" : null,
        images: images.map((image) => ({src: image.currentSrc || image.src, loaded: image.complete && image.naturalWidth > 0})),
        targetPresent: targetSelector ? Boolean(document.querySelector(targetSelector)) : null,
      };
    },

    installStaticCaptureCss() {
      const id = "sdd-chrome-static-capture";
      if (document.getElementById(id)) return {installed: false, id, reason: "already-present"};
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        html { scroll-behavior: auto !important; }
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-delay: 0ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          transition-delay: 0ms !important;
          caret-color: transparent !important;
        }
        html, body, * { cursor: none !important; }
      `;
      document.head.appendChild(style);
      return {installed: true, id};
    },

    removeStaticCaptureCss() {
      const id = "sdd-chrome-static-capture";
      const style = document.getElementById(id);
      if (style) style.remove();
      return {removed: Boolean(style), id};
    },
  };

  const method = methods[request.method];
  if (!method) return {ok: false, method: request.method, error: "Unknown assertion method"};
  try {
    const value = await method(...args);
    return {ok: true, method: request.method, value};
  } catch (error) {
    return {ok: false, method: request.method, error: String(error?.message || error)};
  }
}
~~~

For geometry-before-and-after checks, call `boundingBox`, run the planned interaction through a fresh snapshot UID, call `boundingBox` again, then pass both plain objects to `compareGeometry`. Use `measureLayoutShift` only for a safe control named in the plan; it performs the specified click or focus action and must be followed by the case cleanup.

## Required flow recipes

Use [chrome-flow-recipes](chrome-flow-recipes.md) for product card, summary sidebar, mobile tray or footer, step or tab progress, and modal cases. Select only states applicable to the approved design contract, but every applicable recipe is mandatory and every exclusion needs a reason.

## Screenshot protocol

- Capture a PNG element screenshot for an isolated component comparison and a PNG viewport screenshot for contextual alignment.
- Capture before and after PNGs around every critical interaction.
- Use full-page capture only for page-level scroll, sticky, fixed, or overflow evidence.
- Use deterministic filenames: `<case-id>--<viewport-id>--<state-id>--<phase>--<kind>.png`.
- Record exact viewport width, height, DPR, zoom, environment, fixture, state, job revision, and baseline revision.
- Store approved reference and actual side by side, then save a diff PNG and JSON comparison summary.
- Every mask is approved by stable ID and rectangle. `compare_images.py` blocks non-zero mask pixels outside approved rectangles.
- Never mask the action, state indicator, error, focus style, defect, or geometry exercised by the case assertions.
- Populate the screenshot index in `browser-test-report.md` and the machine summary.

## Console policy

Fail on uncaught exceptions, unhandled promise rejections, severe application errors, failed resource parsing, newly introduced repeated warnings, accessibility runtime errors, hydration errors, duplicate-key warnings, change-caused CSP violations, and errors attributable to the tested interaction.

An allowlist entry must contain an exact string or bounded pattern, reason, owner, and expiration or review date. Compare against recorded baseline messages. No blanket warning suppression is permitted. Preserve relevant message IDs and sanitized details.

## Network policy

Fail on unexpected 4xx or 5xx responses, blocked required CSS or JavaScript or font or image assets, implementation-caused aborts, CORS errors, duplicate mutation or API calls from one action, missing product media, missing translation resources, production requests from a local fixture, and any attempt to submit a real order or destructive admin action.

Record expected analytics noise separately. Do not save authorization headers, cookies, tokens, credentials, customer data, or private response bodies. A safe read-only request detail may be stored only when necessary for the finding.

## Lighthouse and accessibility

Run `lighthouse_audit` in desktop and mobile modes for relevant pages and save both report paths. Record page-level pre-existing findings separately from component-introduced findings. Fail new serious component-related issues. Lighthouse performance is not available through this tool and must never be claimed.

Combine Lighthouse with fresh accessibility snapshots, keyboard navigation, focus-visible inspection, state attributes, modal focus containment and restoration, labels, roles, names, disabled semantics, and safe interaction proof. Automated scores cannot replace those component-level checks.

## Performance traces

Require a trace when the change affects above-the-fold content, product imagery, loading strategy, large injected CSS, sticky or fixed UI, animation, interaction handlers, layout reflow, component hydration, or long lists.

Save the raw trace and relevant insight output. Record LCP, CLS, interaction findings, long tasks, layout-shift sources, image and font loading findings, baseline comparison, and trace path. Local measurements are lab evidence. Rerun noisy timing under the same setup before classifying a regression. Do not fail solely on one noisy duration; do fail clear new layout shifts, duplicate work, or a supported regression.

## Visual-difference review

After automated comparison, complete this semantic table:

| Region | Reference | Actual | Difference | Severity | Measured evidence | Proposed owner | Required fix |
|---|---|---|---|---|---|---|---|

Severity is `BLOCKER` for unusable, wrong-state, severe-overlap, or missing-action defects; `HIGH` for major geometry, hierarchy, or responsive mismatch; `MEDIUM` for visible spacing, type, or surface mismatch; `LOW` for minor polish or anti-aliasing; and `ACCEPTED` only for an intentional approved deviation. Feedback must name a measured delta. “Make it closer” is not remediation.

## Automated rerun loop

~~~text
run mandatory test
→ collect evidence
→ classify infrastructure or product failure
→ map failure to canonical code owner
→ create measured remediation list
→ implementation agent patches within authorized scope
→ rerun affected fast checks
→ rerun the full mandatory matrix
→ update evidence and retry history
→ approve or continue
~~~

`setup.max_retries` controls retry exhaustion. Preserve every attempt with status and evidence links. When retries are exhausted, mark the case blocked or failed according to the cause and produce an honest remediation report; never convert exhaustion into approval.

## End-of-run gates

Record functional, visual, geometry, responsive, console, network, accessibility, performance or reasoned not-applicable, and non-regression separately. Run `summarize_browser_artifacts.py` and attach its JSON and Markdown outputs. Approval requires preflight passed, every mandatory case passed or carrying a valid approved waiver, all evidence present, cleanup complete, and explicit final approval.
