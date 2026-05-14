import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

function runCli(args: string[], cwd = ROOT) {
  return spawnSync("pnpm", ["exec", "tsx", "src/cli.ts", ...args], {
    cwd,
    encoding: "utf8"
  });
}

describe("boxpdf CLI", () => {
  it("lists available templates", () => {
    const result = runCli(["list"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("receipt");
    expect(result.stdout).toContain("boarding-pass");
    expect(result.stdout).toContain("order-confirmation");
  });

  it("scaffolds a template for package consumers", () => {
    const dir = mkdtempSync(join(tmpdir(), "boxpdf-cli-"));
    const out = join(dir, "receipt.ts");
    const result = runCli(["init", "receipt", "--out", out]);

    expect(result.status).toBe(0);
    const generated = readFileSync(out, "utf8");
    expect(generated).toContain('from "boxpdf"');
    expect(generated).toContain('new URL("./receipt.pdf", import.meta.url)');
    expect(generated).not.toContain("../src/index.js");
    expect(generated).not.toContain("../fixtures/receipt.pdf");
  });

  it("serves docs and templates as MCP resources", async () => {
    const child = spawn("pnpm", ["exec", "tsx", "src/cli.ts", "mcp"], {
      cwd: ROOT,
      stdio: ["pipe", "pipe", "pipe"]
    });

    const responses: unknown[] = [];
    let buffer = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let index = buffer.indexOf("\n");
      while (index !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        if (line.trim()) responses.push(JSON.parse(line));
        index = buffer.indexOf("\n");
      }
    });

    const request = (id: number, method: string, params?: unknown) => {
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    };

    request(1, "initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test" } });
    request(2, "resources/list");
    request(3, "resources/read", { uri: "boxpdf://templates/receipt" });

    await new Promise<void>((resolvePromise, reject) => {
      const timeout = setTimeout(() => reject(new Error("timed out waiting for MCP responses")), 5_000);
      const interval = setInterval(() => {
        if (responses.length >= 3) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolvePromise();
        }
      }, 25);
    });

    child.kill();

    expect(responses[0]).toMatchObject({
      id: 1,
      result: { capabilities: { resources: {} }, serverInfo: { name: "boxpdf" } }
    });
    expect(JSON.stringify(responses[1])).toContain("boxpdf://guide");
    expect(JSON.stringify(responses[1])).toContain("boxpdf://templates/receipt");
    const readResponse = responses[2] as { result: { contents: Array<{ text: string }> } };
    expect(readResponse.result.contents[0]?.text).toContain('from "boxpdf"');
  });
});
