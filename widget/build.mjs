import { build, context } from "esbuild"

const isWatch = process.argv.includes("--watch")

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "iife",
  target: "es2015",
  outfile: "dist/widget.js",
  minify: !isWatch,
  sourcemap: isWatch,
  loader: {
    ".css": "text",
  },
  jsxFactory: "h",
  jsxFragment: "Fragment",
  jsx: "transform",
  jsxImportSource: "preact",
  define: {
    "process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
  },
  alias: {
    "react": "preact/compat",
    "react-dom": "preact/compat",
  },
}

if (isWatch) {
  const ctx = await context(buildOptions)
  await ctx.watch()
  console.log("Watching for changes...")
} else {
  const result = await build(buildOptions)
  const fs = await import("fs")
  const stat = fs.statSync("dist/widget.js")
  console.log(`Built widget.js: ${(stat.size / 1024).toFixed(1)} KB`)
}
