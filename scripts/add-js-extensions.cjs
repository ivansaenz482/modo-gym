const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "apps", "api", "src");
let changed = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".ts")) fixFile(full);
  }
}

function fixFile(file) {
  let content = fs.readFileSync(file, "utf8");
  const regex =
    /(from\s+['"])(\.{1,2}\/[^'"]+?)(['"])|(import\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g;
  const next = content.replace(regex, (m, a, spec, c, d, spec2, c2) => {
    if (spec.endsWith(".js") || spec.endsWith("/")) return m;
    if (a) return `${a}${spec}.js${c}`;
    return `${d}${spec2}.js${c2}`;
  });
  if (next !== content) {
    fs.writeFileSync(file, next, "utf8");
    changed++;
  }
}

walk(root);
console.log(`Archivos actualizados: ${changed}`);
