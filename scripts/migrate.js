#!/usr/bin/env node
/**
 * Migration script: converts existing HTML pages to Eleventy source files.
 * Reads from project root HTML files, writes to src/ with YAML frontmatter.
 *
 * Run: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/dados/projetos/pinhaldorei.net';
const SRC = path.join(ROOT, 'src');

// Pages to migrate (relative to ROOT, ending in index.html)
// Discover all index.html files
function findIndexFiles(dir, results = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === '_site' || item.name === 'src') continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      findIndexFiles(full, results);
    } else if (item.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

function extractTitle(html) {
  const m = html.match(/<h1[^>]*class="[^"]*hestia-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  if (m) return m[1].trim().replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&ouml;/g, 'ö').replace(/&atilde;/g, 'ã').replace(/&ccedil;/g, 'ç').replace(/&oacute;/g, 'ó').replace(/&eacute;/g, 'é').replace(/&aacute;/g, 'á').replace(/&iacute;/g, 'í').replace(/&uacute;/g, 'ú').replace(/&atilde;/g, 'ã').replace(/&otilde;/g, 'õ').replace(/&#\d+;/g, '');
  return null;
}

function extractBgImage(html) {
  // Look for header-filter div with background-image
  const m = html.match(/class="header-filter"[^>]*style="background-image:\s*url\(([^)]+)\)/i);
  if (m) return m[1].trim().replace(/['"]/g, '');
  return null;
}

function extractContent(html) {
  // Extract content inside page-content-wrap div
  const m = html.match(/<div[^>]*class="col-md-8 page-content-wrap[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/i);
  if (m) return m[1].trim();
  return null;
}

function detectLayout(relPath, html) {
  if (relPath === 'index.html') return 'home.njk';
  // Section pages have a child listing (hestia-team-content or cc-child-pages)
  if (html.includes('cc-child-pages') || html.includes('hestia-team-content')) return 'section.njk';
  return 'page.njk';
}

function getParentUrl(relPath) {
  const parts = relPath.split('/');
  if (parts.length <= 2) return null; // top-level section
  return '/' + parts.slice(0, -2).join('/') + '/';
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

const files = findIndexFiles(ROOT);
console.log(`Found ${files.length} index.html files`);

let migrated = 0;
let skipped = 0;
const errors = [];

for (const file of files) {
  const relPath = path.relative(ROOT, file);
  const srcDest = path.join(SRC, relPath);

  // Skip if already migrated
  if (fs.existsSync(srcDest)) {
    skipped++;
    continue;
  }

  try {
    const html = fs.readFileSync(file, 'utf8');
    const layout = detectLayout(relPath, html);

    if (layout === 'home.njk') {
      // Homepage: keep most content but just copy the body section
      // Extract from after </header> to before </footer>
      const bodyMatch = html.match(/<\/header>\s*([\s\S]*?)\s*<footer/i);
      const bodyContent = bodyMatch ? bodyMatch[1].trim() : '';

      const frontmatter = `---
title: Pinhal do Rei
layout: layouts/home.njk
---
`;
      fs.mkdirSync(path.dirname(srcDest), { recursive: true });
      fs.writeFileSync(srcDest, frontmatter + bodyContent);
      migrated++;
      continue;
    }

    const title = extractTitle(html);
    const bgImage = extractBgImage(html);
    const content = extractContent(html);

    if (!content) {
      errors.push(`No content found: ${relPath}`);
      // Copy as-is if we can't parse it
      fs.mkdirSync(path.dirname(srcDest), { recursive: true });
      fs.copyFileSync(file, srcDest);
      skipped++;
      continue;
    }

    const parentUrl = getParentUrl(relPath);

    let frontmatter = `---
title: "${title ? title.replace(/"/g, '\\"') : relPath}"
layout: layouts/${layout}`;
    if (bgImage) frontmatter += `\nbackground_image: "${bgImage}"`;
    if (parentUrl) frontmatter += `\nparent: "${parentUrl}"`;
    frontmatter += `\n---\n`;

    fs.mkdirSync(path.dirname(srcDest), { recursive: true });
    fs.writeFileSync(srcDest, frontmatter + content);
    migrated++;
  } catch (e) {
    errors.push(`Error processing ${relPath}: ${e.message}`);
  }
}

console.log(`Migrated: ${migrated}, Skipped: ${skipped}`);
if (errors.length > 0) {
  console.log('Errors/warnings:');
  errors.forEach(e => console.log(' -', e));
}
console.log('Done!');
