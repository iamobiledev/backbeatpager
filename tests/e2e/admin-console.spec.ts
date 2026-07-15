import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { createPrismaClient } from "../../packages/db/src/client.js";

test("admin setup flow and critical views", async ({ page }) => {
  const suffix = Date.now().toString().slice(-8);
  const userName = `E2E Responder ${suffix}`;
  const userEmail = `e2e-${suffix}@example.com`;
  const teamName = `E2E Team ${suffix}`;
  const teamSlug = `e2e-team-${suffix}`;
  const scheduleName = `E2E Primary ${suffix}`;
  const scheduleSlug = `e2e-primary-${suffix}`;
  const policyName = `E2E Policy ${suffix}`;
  const policySlug = `e2e-policy-${suffix}`;
  const serviceName = `E2E Service ${suffix}`;
  const serviceSlug = `e2e-service-${suffix}`;

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Response overview" })
  ).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? "")
    )
  ).toEqual([]);

  await page.getByRole("link", { name: "Users" }).click();
  const addUser = page.getByRole("heading", { name: "Add user" }).locator("..");
  await addUser.getByLabel("Name").fill(userName);
  await addUser.getByLabel("Work email").fill(userEmail);
  await addUser.getByLabel("Timezone").fill("America/New_York");
  await addUser.getByRole("button", { name: "Add user" }).click();
  await expect(page.getByText(userName)).toBeVisible();

  await page.getByRole("link", { name: "Teams" }).click();
  const addTeam = page
    .getByRole("heading", { name: "Create team" })
    .locator("..");
  await addTeam.getByLabel("Name").fill(teamName);
  await addTeam.getByLabel("Slug").fill(teamSlug);
  await addTeam.getByLabel("Timezone").fill("America/New_York");
  await addTeam.getByLabel(userName).check();
  await addTeam.getByRole("button", { name: "Create team" }).click();
  await expect(page.getByRole("heading", { name: teamName })).toBeVisible();

  await page.getByRole("link", { name: "Schedules" }).click();
  const addSchedule = page
    .getByRole("heading", { name: "Create schedule" })
    .locator("..");
  await addSchedule.getByLabel("Name").fill(scheduleName);
  await addSchedule.getByLabel("Slug").fill(scheduleSlug);
  await addSchedule.getByLabel("Team").selectOption({ label: teamName });
  await addSchedule.getByLabel("Timezone").fill("America/New_York");
  await addSchedule.getByLabel(userName).check();
  await addSchedule.getByRole("button", { name: "Create schedule" }).click();
  await expect(page.getByRole("heading", { name: scheduleName })).toBeVisible();
  await expect(page.getByText("14-day rotation calendar")).toBeVisible();

  await page.getByRole("link", { name: "Policies" }).click();
  const addPolicy = page
    .getByRole("heading", { name: "Create policy" })
    .locator("..");
  await addPolicy.getByLabel("Name").fill(policyName);
  await addPolicy.getByLabel("Slug").fill(policySlug);
  await addPolicy.getByLabel("Owning team").selectOption({ label: teamName });
  await addPolicy
    .getByLabel("Target")
    .selectOption({ label: `Schedule · ${teamName} / ${scheduleName}` });
  await addPolicy.getByRole("button", { name: "Create policy" }).click();
  await expect(page.getByRole("heading", { name: policyName })).toBeVisible();

  await page.getByRole("link", { name: "Services" }).click();
  const addService = page
    .getByRole("heading", { name: "Create service" })
    .locator("..");
  await addService.getByLabel("Name").fill(serviceName);
  await addService.getByLabel("Slug").fill(serviceSlug);
  await addService.getByLabel("Team").selectOption({ label: teamName });
  await addService
    .getByLabel("Escalation policy")
    .selectOption({ label: policyName });
  await addService.getByRole("button", { name: "Create service" }).click();
  await expect(
    page.getByText("Copy this routing key now. It will not be shown again.")
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: serviceName })).toBeVisible();

  await page.getByRole("link", { name: "Analytics" }).click();
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await expect(page.getByText("MTTA", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Incidents" }).click();
  const firstIncident = page.locator("tbody a").first();
  if (await firstIncident.isVisible()) {
    await firstIncident.click();
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Alert payloads" })
    ).toBeVisible();
  }
});

test("responder access is read-only for configuration", async ({ page }) => {
  const databaseUrl = process.env.E2E_DATABASE_URL;
  if (!databaseUrl) test.skip();
  const prisma = createPrismaClient(databaseUrl, "pg");
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: "admin@example.com" }
  });

  try {
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: "RESPONDER" }
    });
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Add user" })).toHaveCount(
      0
    );
    await expect(page.getByText("Read only").first()).toBeVisible();
  } finally {
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: "ADMIN" }
    });
    await prisma.$disconnect();
  }
});
