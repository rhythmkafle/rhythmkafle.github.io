(function () {
  const contentEl = document.getElementById("postContent");
  const titleEl = document.getElementById("pageTitle");

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseInline(text) {
    const safe = escapeHtml(text);
    return safe
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
        const url = href.trim();
        if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
          return label;
        }
        return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
      });
  }

  function resolveImagePath(src) {
    const cleaned = src.trim().replace(/^<|>$/g, "");
    if (!cleaned) return "";
    if (/^(https?:\/\/|\/)/i.test(cleaned)) return cleaned;
    return cleaned;
  }

  function parseImageLine(line) {
    const obsidian = line.match(/^!\[\[([^\]]+)\]\]$/);
    if (obsidian) {
      const url = resolveImagePath(obsidian[1]);
      if (!url) return "";
      return `<p><img src="${escapeHtml(url)}" alt="" loading="lazy" /></p>`;
    }
    const markdown = line.match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (markdown) {
      const alt = markdown[1] || "";
      const url = resolveImagePath(markdown[2]);
      if (!url) return "";
      return `<p><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" /></p>`;
    }
    return "";
  }

  function markdownToHtml(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inList = false;
    let inOrderedList = false;
    let inCode = false;
    let inBlockquote = false;
    let paragraph = [];

    function closeParagraph() {
      if (paragraph.length > 0) {
        html += `<p>${parseInline(paragraph.join(" "))}</p>`;
        paragraph = [];
      }
    }

    function closeListsAndQuote() {
      closeParagraph();
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (inOrderedList) {
        html += "</ol>";
        inOrderedList = false;
      }
      if (inBlockquote) {
        html += "</blockquote>";
        inBlockquote = false;
      }
    }

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (trimmed.startsWith("```") && !inCode) {
        closeListsAndQuote();
        inCode = true;
        html += "<pre><code>";
        continue;
      }

      if (trimmed.startsWith("```") && inCode) {
        inCode = false;
        html += "</code></pre>";
        continue;
      }

      if (inCode) {
        html += `${escapeHtml(rawLine)}\n`;
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        closeListsAndQuote();
        html += "<hr />";
      } else if (/^###\s+/.test(trimmed)) {
        closeListsAndQuote();
        html += `<h3>${parseInline(trimmed.replace(/^###\s+/, ""))}</h3>`;
      } else if (/^##\s+/.test(trimmed)) {
        closeListsAndQuote();
        html += `<h2>${parseInline(trimmed.replace(/^##\s+/, ""))}</h2>`;
      } else if (/^#\s+/.test(trimmed)) {
        closeListsAndQuote();
        html += `<h1>${parseInline(trimmed.replace(/^#\s+/, ""))}</h1>`;
      } else if (/^>\s?/.test(trimmed)) {
        closeParagraph();
        if (!inBlockquote) {
          html += "<blockquote>";
          inBlockquote = true;
        }
        html += `<p>${parseInline(trimmed.replace(/^>\s?/, ""))}</p>`;
      } else if (parseImageLine(trimmed)) {
        closeListsAndQuote();
        html += parseImageLine(trimmed);
      } else if (/^-\s+/.test(trimmed)) {
        closeParagraph();
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${parseInline(trimmed.replace(/^-\s+/, ""))}</li>`;
      } else if (/^\d+\.\s+/.test(trimmed)) {
        closeParagraph();
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (!inOrderedList) {
          html += "<ol>";
          inOrderedList = true;
        }
        html += `<li>${parseInline(trimmed.replace(/^\d+\.\s+/, ""))}</li>`;
      } else if (trimmed === "") {
        closeListsAndQuote();
      } else {
        if (inList || inOrderedList) {
          closeListsAndQuote();
        }
        paragraph.push(trimmed);
      }
    }

    closeListsAndQuote();
    if (inCode) html += "</code></pre>";

    return html;
  }

  function getCurrentSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }

  async function init() {
    if (!contentEl) return;

    if (window.location.protocol === "file:") {
      contentEl.innerHTML = "<h1>Blog needs a local server</h1><p>Run <code>python3 -m http.server 8080</code> from project root.</p>";
      return;
    }

    const slug = getCurrentSlug();

    try {
      const manifestRes = await fetch("../manifest.json", { cache: "no-store" });
      if (!manifestRes.ok) throw new Error("Manifest not found.");
      const manifest = await manifestRes.json();
      const posts = Array.isArray(manifest.posts) ? manifest.posts : [];
      const post = posts.find((p) => p.slug === slug);
      if (!post) throw new Error("Post not found.");

      document.title = `${post.title} | Buddha404`;
      if (titleEl) titleEl.textContent = document.title;

      const filePath = post.file || `${slug}/${slug}.md`;
      const postRes = await fetch(`../${filePath}`, { cache: "no-store" });
      if (!postRes.ok) throw new Error("Markdown file missing.");
      const md = await postRes.text();
      contentEl.innerHTML = markdownToHtml(md);
    } catch (err) {
      contentEl.innerHTML = `<h1>Could not load post</h1><p>${escapeHtml(err.message)}</p><p><a href="../index.html">Back to Blog Index</a></p>`;
    }
  }

  init();
})();
