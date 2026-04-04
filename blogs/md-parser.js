(function () {
  const postListEl = document.getElementById("postList");
  const postContentEl = document.getElementById("postContent");

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

    for (let rawLine of lines) {
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

    if (inList) {
      html += "</ul>";
    }
    if (inOrderedList) {
      html += "</ol>";
    }

    if (inCode) {
      html += "</code></pre>";
    }

    return html;
  }

  function normalizePostName(input) {
    if (!input) return "";
    const clean = input.split("/").pop();
    if (!clean || !clean.endsWith(".md")) return "";
    return clean;
  }

  async function loadManifest() {
    const res = await fetch("manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Manifest not found.");
    return res.json();
  }

  function renderList(posts, activePost) {
    if (!postListEl) return;
    postListEl.innerHTML = posts
      .map((post) => {
        const isActive = post.file === activePost;
        const cls = isActive ? "post-link active" : "post-link";
        return `<a class="${cls}" href="?post=${encodeURIComponent(post.file)}">${post.title}</a>`;
      })
      .join("");
  }

  async function loadPost(postFile) {
    const safeName = normalizePostName(postFile);
    if (!safeName) {
      postContentEl.innerHTML = "<h1>Invalid post name</h1><p>Post must end with <code>.md</code>.</p>";
      return;
    }

    try {
      const res = await fetch(safeName, { cache: "no-store" });
      if (!res.ok) throw new Error("Post not found.");
      const markdown = await res.text();
      postContentEl.innerHTML = markdownToHtml(markdown);
    } catch (err) {
      postContentEl.innerHTML = `<h1>Could not load post</h1><p>${escapeHtml(err.message)}</p>`;
    }
  }

  async function init() {
    if (window.location.protocol === "file:") {
      if (postListEl) {
        postListEl.innerHTML = "<p>Local file mode detected.</p>";
      }
      if (postContentEl) {
        postContentEl.innerHTML =
          "<h1>Blog needs a local server</h1><p>Open this site with HTTP, for example run <code>python3 -m http.server 8080</code> in the project root and visit <code>http://localhost:8080/blogs/</code>.</p>";
      }
      return;
    }

    try {
      const manifest = await loadManifest();
      const posts = Array.isArray(manifest.posts) ? manifest.posts : [];
      if (posts.length === 0) {
        postListEl.innerHTML = "<p>No posts listed yet.</p>";
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const requested = normalizePostName(params.get("post"));
      const firstPost = posts[0].file;
      const active = posts.some((p) => p.file === requested) ? requested : firstPost;

      renderList(posts, active);
      await loadPost(active);
    } catch (err) {
      if (postListEl) postListEl.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
      if (postContentEl) {
        postContentEl.innerHTML = "<h1>Blog setup required</h1><p>Create <code>blogs/manifest.json</code> and list markdown posts.</p>";
      }
    }
  }

  init();
})();
