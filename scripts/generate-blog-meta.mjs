import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogsDir = path.join(root, 'src', 'blogs');
const distDir = path.join(root, 'dist');
const templatePath = path.join(distDir, 'index.html');
const siteUrl = normalizeSiteUrl(
  process.env.SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_URL ||
    process.env.DEPLOY_PRIME_URL ||
    'https://404buddha.com'
);

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, '');
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseFrontmatter(source) {
  if (!source.startsWith('---')) {
    return { attributes: {}, content: source.trim() };
  }

  const closing = source.indexOf('\n---', 3);
  if (closing === -1) {
    return { attributes: {}, content: source.trim() };
  }

  const frontmatter = source.slice(3, closing).trim();
  const content = source.slice(closing + 4).trim();
  const attributes = frontmatter.split('\n').reduce((values, line) => {
    const separator = line.indexOf(':');
    if (separator === -1) {
      return values;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    return key ? { ...values, [key]: value } : values;
  }, {});

  return { attributes, content };
}

function excerptFromContent(content) {
  return (
    content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[#>*_`[\]()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180) || 'Open the full note.'
  );
}

function firstImageFromContent(content) {
  return content.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/)?.[1];
}

function absoluteUrl(value) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, `${siteUrl}/`).toString();
  } catch {
    return undefined;
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function upsertMeta(html, post) {
  const meta = [
    ['name', 'description', post.description],
    ['property', 'og:title', post.title],
    ['property', 'og:description', post.description],
    ['property', 'og:type', 'article'],
    ['property', 'og:url', post.url],
    ['property', 'og:image', post.image],
    ['property', 'og:image:alt', post.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', post.title],
    ['name', 'twitter:description', post.description],
    ['name', 'twitter:image', post.image]
  ].filter(([, , value]) => value);

  const headExtras = [
    `<title>${escapeHtml(post.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(post.url)}" />`,
    ...meta.map(
      ([attribute, key, value]) =>
        `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`
    )
  ].join('\n    ');

  return html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<link rel="canonical"[\s\S]*?>/g, '')
    .replace(/\s*<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[\s\S]*?>/g, '')
    .replace(/((?:src|href)=")\.\/assets\//g, '$1/assets/')
    .replace('</head>', `    ${headExtras}\n  </head>`);
}

const template = await readFile(templatePath, 'utf8');
const folders = await readdir(blogsDir, { withFileTypes: true });
let generated = 0;

for (const folder of folders) {
  if (!folder.isDirectory()) {
    continue;
  }

  const slug = folder.name;
  const sourcePath = path.join(blogsDir, slug, 'blog.md');
  const source = await readFile(sourcePath, 'utf8');
  const { attributes, content } = parseFrontmatter(source);
  const title = attributes.title || content.match(/^#\s+(.+)$/m)?.[1] || titleFromSlug(slug);
  const description = attributes.excerpt || excerptFromContent(content);
  const image = absoluteUrl(attributes.image || firstImageFromContent(content));
  const imageAlt = content.match(/!\[([^\]]*)]/)?.[1] || title;
  const url = absoluteUrl(`/blog/${encodeURIComponent(slug)}`);
  const outputDir = path.join(distDir, 'blog', slug);

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, 'index.html'),
    upsertMeta(template, { title, description, image, imageAlt, url }),
    'utf8'
  );
  generated += 1;
}

console.log(`Generated metadata HTML for ${generated} blog post${generated === 1 ? '' : 's'}.`);
