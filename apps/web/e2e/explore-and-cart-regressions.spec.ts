import { test, expect, type Page } from "@playwright/test";

type Dish = { id: number; nameEn: string; chefId: number; additions?: { id: number; nameEn: string }[] };

async function firstChefMenu(page: Page) {
  await page.goto("/explore");
  const card = page.locator("a.cc_card").first();
  const chefName = (await card.locator("h3, h2, p").first().innerText()).trim();
  const menuResponse = page.waitForResponse((r) => /\/api\/dish\/\d+\/active/.test(r.url()) && r.ok());
  await card.click();
  await expect(page).toHaveURL(/\/chef\/\d+/);
  const dishes: Dish[] = (await (await menuResponse).json()).dishDtoList;
  return { chefName, dishes };
}

test.describe("Explore and cart regressions", () => {
  // KAN-6: the subtitle count must reflect the search results, not the global total.
  test("explore subtitle shows the number of matching chefs when searching", async ({ page }) => {
    await page.goto("/explore");
    const firstName = (await page.locator("a.cc_card").first().locator("h3, h2, p").first().innerText()).trim();

    await page.goto(`/explore?q=${encodeURIComponent(firstName)}`);
    const cards = page.locator("a.cc_card");
    await expect(cards.first()).toBeVisible();
    const shown = await cards.count();
    await expect(page.locator(".ep_count")).toHaveText(new RegExp(`^${shown} of \\d+ chefs? match$`));

    await page.goto("/explore?q=zzzz-no-such-chef");
    await expect(page.getByText("No chefs match")).toBeVisible();
    await expect(page.locator(".ep_count")).toHaveText(/^0 of \d+ chefs? match$/);
  });

  // KAN-7: searching for a dish finds the chef who serves it.
  test("searching by a dish name lists the chef serving it", async ({ page }) => {
    const { dishes } = await firstChefMenu(page);
    const chefUrl = new URL(page.url()).pathname;
    const dish = dishes.find((d) => /^[\x20-\x7E]{4,}$/.test(d.nameEn.trim()));
    test.skip(!dish, "first chef has no ASCII-named dish to search for");

    await page.goto(`/explore?q=${encodeURIComponent(dish!.nameEn.trim())}`);
    await expect(page.locator(`a.cc_card[href="${chefUrl}"]`)).toBeVisible();
  });

  // KAN-8: the anchor target must not hide under the sticky header.
  test("How it works link scrolls the heading fully below the sticky header", async ({ page }) => {
    await page.setViewportSize({ width: 1150, height: 631 });
    await page.goto("/");
    await page.getByRole("link", { name: "How it works" }).first().click();
    const heading = page.getByRole("heading", { name: /Three steps to your next favourite meal/i });
    await expect(heading).toBeInViewport();
    await page.waitForTimeout(500);
    const headerBox = await page.getByRole("banner").boundingBox();
    const headingBox = await heading.boundingBox();
    expect(headingBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
  });

  // KAN-9: quick-adding a dish must not mark all its available options as selected.
  test("quick add shows no options on the cart line", async ({ page }) => {
    await page.goto("/explore");
    const chefCount = await page.locator("a.cc_card").count();
    let target: Dish | undefined;
    for (let i = 0; i < chefCount && !target; i++) {
      await page.goto("/explore");
      const menuResponse = page.waitForResponse((r) => /\/api\/dish\/\d+\/active/.test(r.url()) && r.ok());
      await page.locator("a.cc_card").nth(i).click();
      const dishes: Dish[] = (await (await menuResponse).json()).dishDtoList;
      target = dishes.find((d) => (d.additions?.length ?? 0) > 0);
    }
    test.skip(!target, "no dish with options in the current data");

    await page.getByRole("button", { name: `Add ${target!.nameEn} to cart` }).click();
    const line = page.locator("aside.uc-panel .cic_root");
    await expect(line).toHaveCount(1);
    await expect(line.getByText(/^\+ /)).toHaveCount(0);
  });
});
