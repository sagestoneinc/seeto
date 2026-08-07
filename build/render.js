const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Single combined pattern walked left-to-right with matchAll so that text
// already emitted by an earlier match is never re-scanned by a later one.
const PATTERN =
  /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}|\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g;

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function lookup(context, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

export function render(template, context) {
  let output = '';
  let lastIndex = 0;

  for (const match of template.matchAll(PATTERN)) {
    const [full, eachPath, body, rawPath, escapedPath] = match;

    output += template.slice(lastIndex, match.index);

    if (eachPath !== undefined) {
      const items = lookup(context, eachPath);
      output += (Array.isArray(items) ? items : [])
        .map((item) => render(body, { ...context, this: item }))
        .join('');
    } else if (rawPath !== undefined) {
      const value = lookup(context, rawPath);
      output += value == null ? '' : String(value);
    } else {
      const value = lookup(context, escapedPath);
      output += value == null ? '' : escapeHtml(value);
    }

    lastIndex = match.index + full.length;
  }

  output += template.slice(lastIndex);
  return output;
}
