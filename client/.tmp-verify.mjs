import { chromium } from "playwright";
import path from "node:path";

const outDir = process.argv[2];
const errors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 10000 });
await page.waitForSelector("text=Resumen del servicio");
await page.screenshot({ path: path.join(outDir, "dashboard.png"), fullPage: true });

await page.goto("http://localhost:3000/pedidos", { waitUntil: "networkidle" });
await page.waitForSelector("text=Pedidos");
await page.screenshot({ path: path.join(outDir, "pedidos.png"), fullPage: true });

await page.goto("http://localhost:3000/tickets", { waitUntil: "networkidle" });
await page.waitForSelector("text=Tickets de atención");
await page.screenshot({ path: path.join(outDir, "tickets.png"), fullPage: true });

await browser.close();

console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
console.log("DONE");
