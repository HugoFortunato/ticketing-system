import { expect, test } from "@playwright/test";

const ANA = "11111111-1111-4111-a111-111111111111";
const ARENA = "22222222-2222-4222-a222-222222222221";

test.describe("telas", () => {
  test("home mostra a listagem", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Ticketing/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();
    await expect(page.getByPlaceholder(/Pesquisar por nome/)).toBeVisible();
    await expect(page.locator(".event-grid")).toHaveAttribute("aria-busy", "false", {
      timeout: 20_000,
    });
    await expect(page.locator(".event-card, .error").first()).toBeVisible();
  });

  test("detalhe envia x-user-id e o autor vê o evento que criou", async ({ page, request }) => {
    const created = await request.post("http://127.0.0.1:3000/events", {
      data: {
        name: `E2E ${Date.now()}`,
        description: "playwright",
        imageUrl: "https://picsum.photos/800/400",
        category: "music",
        venueId: ARENA,
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const { event } = (await created.json()) as { event: { id: string; name: string } };

    await page.addInitScript((id: string) => {
      localStorage.setItem("ticketing.userId", id);
    }, ANA);

    const headers: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "GET" && req.url().includes(`/events/${event.id}`)) {
        headers.push(req.headers()["x-user-id"] ?? "");
      }
    });

    await page.goto(`/events/${event.id}`);
    await expect(page.getByRole("heading", { name: event.name })).toBeVisible({ timeout: 15_000 });
    expect(headers.some((value) => value === ANA)).toBeTruthy();
  });

  test("detalhe lista a sessão criada", async ({ page, request }) => {
    const created = await request.post("http://127.0.0.1:3000/events", {
      data: {
        name: `E2E sessão ${Date.now()}`,
        description: "playwright session",
        imageUrl: "https://picsum.photos/800/400",
        category: "music",
        venueId: ARENA,
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const { event } = (await created.json()) as { event: { id: string; name: string } };

    const startsAt = new Date(Date.now() + 86_400_000).toISOString();
    const endsAt = new Date(Date.now() + 90_000_000).toISOString();
    const sessionRes = await request.post(`http://127.0.0.1:3000/events/${event.id}/sessions`, {
      data: { startsAt, endsAt },
    });
    expect(sessionRes.ok(), await sessionRes.text()).toBeTruthy();

    const when = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(startsAt));

    await page.addInitScript((id: string) => {
      localStorage.setItem("ticketing.userId", id);
    }, ANA);

    await page.goto(`/events/${event.id}`);
    await expect(page.getByRole("heading", { name: event.name })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(when)).toBeVisible();
  });

  test("detalhe de evento seed (sem autor) mostra erro com header da Ana", async ({ page }) => {
    await page.addInitScript((id: string) => {
      localStorage.setItem("ticketing.userId", id);
    }, ANA);
    await page.goto("/");
    await expect(page.locator(".event-grid")).toHaveAttribute("aria-busy", "false", {
      timeout: 20_000,
    });
    const card = page.locator(".event-card").first();
    if ((await card.count()) === 0) {
      test.skip();
      return;
    }
    await card.click();
    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.locator(".error")).toBeVisible();
  });

  test("assentos, reserva e ingresso renderizam (erro live se a API da rota não existir)", async ({
    page,
  }) => {
    const fakeId = "00000000-0000-4000-8000-000000000001";

    await page.goto(`/sessions/${fakeId}/seats`);
    await expect(
      page.getByText(/Carregando assentos|Erro ao chamar a API|Route GET:/),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto(`/reservations/${fakeId}`);
    await expect(
      page.getByText(/Carregando reserva|Erro ao chamar a API|Route GET:/),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto(`/tickets/${fakeId}`);
    await expect(
      page.getByText(/Carregando ingresso|Erro ao chamar a API|Route GET:/),
    ).toBeVisible({ timeout: 15_000 });
  });
});
