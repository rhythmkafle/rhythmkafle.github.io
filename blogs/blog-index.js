(function () {
  const postListEl = document.getElementById("postList");
  const articleListEl = document.getElementById("articleList");
  const searchEl = document.getElementById("postSearch");

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizePost(post) {
    const title = post.title || post.slug || post.file || "Untitled";
    const slug = post.slug || "";
    const file = post.file || (slug ? `${slug}/${slug}.md` : "");
    return {
      title,
      slug,
      file,
      description: "Read this blog post.",
      href: `./${encodeURIComponent(slug)}/`
    };
  }

  function extractDescription(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (/^#/.test(line)) continue;
      if (/^```/.test(line)) continue;
      if (/^[-*]\s+/.test(line)) continue;
      if (/^\d+\.\s+/.test(line)) continue;
      return line.replace(/[*_`>#-]/g, "").trim();
    }
    return "Read this blog post.";
  }

  function render(posts) {
    if (!postListEl || !articleListEl) return;

    if (posts.length === 0) {
      postListEl.innerHTML = "<p>No matching posts.</p>";
      articleListEl.innerHTML = "<p>No matching blogs found.</p>";
      return;
    }

    postListEl.innerHTML = posts
      .map((post) => `<a class="post-link" href="${post.href}">${escapeHtml(post.title)}</a>`)
      .join("");

    articleListEl.innerHTML = posts
      .map(
        (post) =>
          `<a class="article-item" href="${post.href}"><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.description)}</p></a>`
      )
      .join("");
  }

  async function init() {
    if (!postListEl || !articleListEl) return;

    if (window.location.protocol === "file:") {
      postListEl.innerHTML = "<p>Run a local HTTP server to open blog posts.</p>";
      articleListEl.innerHTML = "<p>Run <code>python3 -m http.server 8080</code>, then open <code>/blogs/</code>.</p>";
      return;
    }

    try {
      const res = await fetch("manifest.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load blog manifest.");
      const manifest = await res.json();
      const rawPosts = Array.isArray(manifest.posts) ? manifest.posts : [];
      const posts = rawPosts.map(normalizePost).filter((p) => p.slug);

      if (posts.length === 0) {
        postListEl.innerHTML = "<p>No posts listed yet.</p>";
        articleListEl.innerHTML = "<p>No blogs available yet.</p>";
        return;
      }

      await Promise.all(
        posts.map(async (post) => {
          try {
            const postRes = await fetch(post.file, { cache: "no-store" });
            if (!postRes.ok) return;
            const md = await postRes.text();
            post.description = extractDescription(md);
          } catch (e) {
            post.description = "Read this blog post.";
          }
        })
      );

      render(posts);

      if (searchEl) {
        searchEl.addEventListener("input", function () {
          const term = searchEl.value.trim().toLowerCase();
          if (!term) {
            render(posts);
            return;
          }
          const filtered = posts.filter((post) => post.title.toLowerCase().includes(term) || post.slug.toLowerCase().includes(term));
          render(filtered);
        });
      }
    } catch (err) {
      postListEl.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
      articleListEl.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
    }
  }

  init();
})();
