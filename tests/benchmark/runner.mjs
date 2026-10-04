import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));

const server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "error",
    resolve: {
        alias: {
            "@": path.join(root, "src"),
        },
    },
    server: {
        middlewareMode: true,
    },
});

try {
    await server.ssrLoadModule("/tests/benchmark/run.ts");
} finally {
    await server.close();
}
