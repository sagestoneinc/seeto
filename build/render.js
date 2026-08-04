const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const EACH_BLOCK = /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/;
const RAW_TOKEN = /\{\{\{\s*([\w.]+)\s*\}\}\}/g;
const TOKEN = /\{\{\s*([\w.]+)\s*\}\}/g;

// Guards against a malformed template looping forever.
const MAX_BLOCK_EXPANSIONS = 1000;

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function lookup(context, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

export function render(template, context) {
  let output = template;

  for (let i = 0; i < MAX_BLOCK_EXPANSIONS; i += 1) {
    const match = EACH_BLOCK.exec(output);
    if (match === null) break;

    const [full, path, body] = match;
    const items = lookup(context, path);
    const rendered = (Array.isArray(items) ? items : [])
      .map((item) => render(body, { ...context, this: item }))
      .join('');

    output =
      output.slice(0, match.index) + rendered + output.slice(match.index + full.length);
  }

  output = output.replace(RAW_TOKEN, (_, path) => {
    const value = lookup(context, path);
    return value == null ? '' : String(value);
  });

  return output.replace(TOKEN, (_, path) => {
    const value = lookup(context, path);
    return value == null ? '' : escapeHtml(value);
  });
}
