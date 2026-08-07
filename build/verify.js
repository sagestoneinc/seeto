export const BANNED_STRINGS = ['555-SEETO', '123 Main Street', '456 Market St'];

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const IMG_TAG = /<img\b[^>]*>/g;
const HREF = /<a\b[^>]*\bhref="([^"]*)"/g;
const EXTERNAL = /^(https?:|mailto:|tel:|#|javascript:)/i;

export function verifyPage(html, path) {
  const errors = [];
  const fail = (message) => errors.push(`${path}: ${message}`);

  const title = /<title>([\s\S]*?)<\/title>/.exec(html);
  if (title === null || title[1].trim() === '') {
    fail('missing <title>');
  } else if (title[1].length > 60) {
    fail(`title is ${title[1].length} characters, over the 60 limit`);
  }

  const description = /<meta name="description" content="([^"]*)"/.exec(html);
  if (description === null || description[1].trim() === '') {
    fail('missing meta description');
  } else if (description[1].length > 155) {
    fail(`description is ${description[1].length} characters, over the 155 limit`);
  }

  if (!/<link rel="canonical" href="[^"]+"/.test(html)) {
    fail('missing canonical link');
  }

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) {
    fail(`found ${h1Count} h1 elements, expected exactly 1`);
  }

  for (const tag of html.match(IMG_TAG) || []) {
    if (!/\balt="/.test(tag)) fail(`img missing alt: ${tag.slice(0, 60)}`);
    if (!/\bwidth="/.test(tag)) fail(`img missing width: ${tag.slice(0, 60)}`);
    if (!/\bheight="/.test(tag)) fail(`img missing height: ${tag.slice(0, 60)}`);
  }

  for (const banned of BANNED_STRINGS) {
    if (html.includes(banned)) fail(`contains retired placeholder "${banned}"`);
  }

  if (EMOJI.test(html)) {
    fail('contains an emoji; use an inline SVG icon instead');
  }

  return errors;
}

export function verifyLinks(generated, planned = []) {
  const errors = [];
  const pending = new Set(planned);
  const exists = (target) =>
    generated.has(target) || generated.has(`${target.replace(/\/$/, '')}/index.html`);

  for (const [path, html] of generated) {
    for (const match of html.matchAll(HREF)) {
      const href = match[1];
      if (href === '' || EXTERNAL.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      // '/' is served by index.html but never appears as a generated key under that name.
      if (target === '/' || exists(target) || pending.has(target)) continue;
      errors.push(`${path}: broken internal link to ${target}`);
    }
  }
  return errors;
}
