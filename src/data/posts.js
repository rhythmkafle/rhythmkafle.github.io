const modules = import.meta.glob('../blogs/*/*.md', {
  eager: true,
  import: 'default',
  query: '?raw'
});

function slugFromPath(path) {
  const [, folder] = path.match(/\/blogs\/([^/]+)\//) || [];
  return folder || '';
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
      .replace(/<[^>]+>/g, '')
      .replace(/[#>*_`[\]()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180) || 'Open the full note.'
  );
}

function readTimeFromContent(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export const posts = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = slugFromPath(path);
    const { attributes, content } = parseFrontmatter(raw);
    const firstHeading = content.match(/^#\s+(.+)$/m)?.[1];

    return {
      slug,
      title: attributes.title || firstHeading || titleFromSlug(slug),
      excerpt: attributes.excerpt || excerptFromContent(content),
      category: attributes.category || 'Notes',
      date: attributes.date || 'Undated',
      readTime: attributes.readTime || readTimeFromContent(content),
      content
    };
  })
  .filter((post) => post.slug)
  .sort((a, b) => {
    if (a.date === 'Undated') return 1;
    if (b.date === 'Undated') return -1;
    return b.date.localeCompare(a.date);
  });

export const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category)))];
