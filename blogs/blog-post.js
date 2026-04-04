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
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
        const url = href.trim();
        if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
          return label;
        }
        return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
      });
  }

  function markdownToHtml(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inList = false;
    let inOrderedList = false;
    let inCode = false;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      if (line.startsWith("```") && !inCode) {
        inCode = true;
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        html += "<pre><code>";
        continue;
      }

      if (line.startsWith("```") && inCode) {
        inCode = false;
        html += "</code></pre>";
        continue;
      }

      if (inCode) {
        html += `${escapeHtml(rawLine)}\n`;
        continue;
      }

      if (/^###\s+/.test(line)) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        html += `<h3>${parseInline(line.replace(/^###\s+/, ""))}</h3>`;
      } else if (/^##\s+/.test(line)) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        html += `<h2>${parseInline(line.replace(/^##\s+/, ""))}</h2>`;
      } else if (/^#\s+/.test(line)) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        html += `<h1>${parseInline(line.replace(/^#\s+/, ""))}</h1>`;
      } else if (/^-\s+/.test(line)) {
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${parseInline(line.replace(/^-\s+/, ""))}</li>`;
      } else if (/^\d+\.\s+/.test(line)) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (!inOrderedList) {
          html += "<ol>";
          inOrderedList = true;
        }
        html += `<li>${parseInline(line.replace(/^\d+\.\s+/, ""))}</li>`;
      } else if (line === "") {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (inOrderedList) {
          html += "</ol>";
          inOrderedList = false;
        }
        html += `<p>${parseInline(line)}</p>`;
      }
    }

    if (inList) html += "</ul>";
    if (inOrderedList) html += "</ol>";
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

      if (titleEl) titleEl.textContent = `${post.title} | Buddha404`;

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
