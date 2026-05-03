import { spawn } from "node:child_process";

const viteArgs = process.argv.slice(2);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = new Set();

function run(command, args, options = {}) {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  children.add(child);
  child.on("exit", () => children.delete(child));
  return child;
}

function runOnce(command, args) {
  return new Promise((resolve, reject) => {
    const child = run(command, args);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with ${signal || code}`));
    });
  });
}

function stopChildren(signal = "SIGTERM") {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

process.on("SIGINT", () => {
  stopChildren("SIGINT");
  process.exit(130);
});

process.on("SIGTERM", () => {
  stopChildren("SIGTERM");
  process.exit(143);
});

try {
  await runOnce(npmCommand, ["run", "build:css"]);
  const cssWatcher = run(npmCommand, ["run", "watch:css"]);
  const vite = run("vite", viteArgs);

  vite.on("exit", (code) => {
    stopChildren();
    process.exit(code || 0);
  });

  cssWatcher.on("exit", (code) => {
    if (code && !vite.killed) {
      stopChildren();
      process.exit(code);
    }
  });
} catch (error) {
  stopChildren();
  console.error(error.message);
  process.exit(1);
}
