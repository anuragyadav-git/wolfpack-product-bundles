import fs from "node:fs";
import path from "node:path";

const workspacePath = (...segments: string[]) =>
  path.join(process.cwd(), ...segments);

describe("Admin Updates and FAQs removal", () => {
  it("removes the Remix route and page-only UI artifacts", () => {
    expect(
      fs.existsSync(workspacePath("app/routes/app/app.events.tsx")),
    ).toBe(false);
    expect(
      fs.existsSync(workspacePath("app/components/AccordionItem.tsx")),
    ).toBe(false);
    expect(
      fs.existsSync(workspacePath("app/components/CartPropertyFixCard.tsx")),
    ).toBe(false);
    expect(
      fs.existsSync(
        workspacePath("app/styles/routes/app-events.module.css"),
      ),
    ).toBe(false);
  });

  it("removes every live Admin navigation target to the retired route", () => {
    const appShell = fs.readFileSync(
      workspacePath("app/routes/app/app.tsx"),
      "utf8",
    );
    const dashboard = fs.readFileSync(
      workspacePath("app/routes/app/app.dashboard/DashboardPage.tsx"),
      "utf8",
    );
    const resources = fs.readFileSync(
      workspacePath(
        "app/routes/app/app.dashboard/DashboardResourcesCard.tsx",
      ),
      "utf8",
    );

    for (const source of [appShell, dashboard, resources]) {
      expect(source).not.toContain("/app/events");
    }
    expect(appShell).not.toContain('t("nav.events")');
    expect(dashboard).not.toContain("dashboard.header.changelog");
    expect(resources).not.toContain("dashboard.resources.exploreUpdate");
  });
});
