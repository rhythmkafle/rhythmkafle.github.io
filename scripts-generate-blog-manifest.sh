#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOG_DIR="$ROOT_DIR/blogs"
MANIFEST="$BLOG_DIR/manifest.json"

if [[ ! -d "$BLOG_DIR" ]]; then
  echo "blogs/ directory not found" >&2
  exit 1
fi

slugify() {
  local input="$1"
  input="$(printf '%s' "$input" | tr '[:upper:]' '[:lower:]')"
  input="$(printf '%s' "$input" | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"
  if [[ -z "$input" ]]; then
    input="post"
  fi
  printf '%s' "$input"
}

write_post_page() {
  local slug="$1"
  local out_dir="$BLOG_DIR/$slug"
  local out_file="$out_dir/index.html"

  mkdir -p "$out_dir"

  cat > "$out_file" <<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Cybersecurity blog post" />
  <title id="pageTitle">Blog Post | Buddha404</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../style.css" />
</head>
<body>
  <div class="bg-icons" aria-hidden="true"></div>
  <header class="site-header">
    <nav class="nav container">
      <a href="../../index.html" class="logo">Buddha404</a>
      <div class="nav-links">
        <a href="../../sections/about.html">About</a>
        <a href="../../sections/projects.html">Projects</a>
        <a href="../../sections/certifications.html">Certifications</a>
        <a href="../../sections/contact.html">Contact</a>
        <a href="../index.html">Blog</a>
      </div>
    </nav>
  </header>

  <main class="container section page-content">
    <article class="card prose markdown-viewer" id="postContent">
      <h1>Loading post...</h1>
    </article>
  </main>

  <footer class="site-footer container">
    <p>© <span id="year"></span> Buddha404.</p>
  </footer>

  <script src="../../index.js"></script>
  <script src="../blog-post.js"></script>
</body>
</html>
HTML
}

# Step 1: move any root-level markdown files into slug folders.
shopt -s nullglob
root_md=("$BLOG_DIR"/*.md)
for path in "${root_md[@]}"; do
  file="$(basename "$path")"
  base="${file%.md}"
  slug="$(slugify "$base")"
  target_dir="$BLOG_DIR/$slug"
  target_path="$target_dir/$file"
  mkdir -p "$target_dir"

  if [[ "$path" != "$target_path" ]]; then
    mv "$path" "$target_path"
  fi
done

# Step 2: build manifest from markdown files inside post folders.
folder_md=("$BLOG_DIR"/*/*.md)

printf '{\n  "posts": [\n' > "$MANIFEST"

first=1
count=0
for path in "${folder_md[@]}"; do
  slug="$(basename "$(dirname "$path")")"
  file_name="$(basename "$path")"
  file_rel="$slug/$file_name"
  title=""

  while IFS= read -r line; do
    if [[ "$line" =~ ^#\  ]]; then
      title="${line#\# }"
      break
    fi
  done < "$path"

  if [[ -z "$title" ]]; then
    title="${slug//-/ }"
  fi

  esc_title="${title//\\/\\\\}"
  esc_title="${esc_title//\"/\\\"}"

  if [[ $first -eq 0 ]]; then
    printf ',\n' >> "$MANIFEST"
  fi
  first=0
  count=$((count + 1))

  printf '    {\n      "title": "%s",\n      "file": "%s",\n      "slug": "%s"\n    }' "$esc_title" "$file_rel" "$slug" >> "$MANIFEST"

  write_post_page "$slug"
done

printf '\n  ]\n}\n' >> "$MANIFEST"

echo "Updated $MANIFEST with $count posts, moved root .md files into /blogs/{slug}/, and generated post pages."
