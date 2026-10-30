import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const DIST = path.join(ROOT, 'dist');

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const files = fs.readdirSync(CONTENT).filter(f => f.endsWith('.md'));
const notes: any[] = [];
const links: Record<string, string[]> = {};

for (const file of files) {
  const raw = fs.readFileSync(path.join(CONTENT, file), 'utf8');
  const { data, content } = matter(raw);
  const id = data.id || path.basename(file, '.md');
  const title = data.title || id;
  const html = marked.parse(content) as string;
  // extract internal links /n/<id>/
  const found = [...html.matchAll(/href="\/n\/([^/]+)\//g)].map(m => m[1]);
  links[id] = found;
  notes.push({ id, title, html });
  const dir = path.join(DIST, 'n', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><link rel="stylesheet" href="/styles.css"></head><body><main class="note">${html}</main><script src="/app.js"></script></body></html>`);
}

// backlinks
const backlinks: Record<string, string[]> = {};
for (const id of Object.keys(links)) backlinks[id] = [];
for (const [src, targets] of Object.entries(links)) {
  for (const t of targets) (backlinks[t] ||= []).push(src);
}

fs.writeFileSync(path.join(DIST, 'index.json'), JSON.stringify({ notes, backlinks }, null, 2));
fs.copyFileSync(path.join(ROOT, 'styles.css'), path.join(DIST, 'styles.css'));
fs.writeFileSync(path.join(DIST, 'index.html'), '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Notes</title><link rel="stylesheet" href="/styles.css"></head><body><main id="stack"></main><script src="/app.js"></script></body></html>');
console.log('Built', notes.length, 'notes');
