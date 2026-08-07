const trimSlash = (url) => url.replace(/\/+$/, '');

export function buildSitemap(entries, baseUrl) {
  const base = trimSlash(baseUrl);
  const urls = entries
    .map(({ loc, priority }) =>
      [
        '  <url>',
        `    <loc>${base}${loc}</loc>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobots(baseUrl) {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${trimSlash(baseUrl)}/sitemap.xml`, ''].join(
    '\n'
  );
}

export function buildLlmsTxt(site, entries) {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.tagline}`,
    '',
    `${site.name} is a real estate brokerage serving the Dallas-Fort Worth and Houston`,
    `metropolitan areas in Texas. Phone: ${site.phone}.`,
    '',
    '## Pages',
    '',
  ];
  for (const { loc, title, summary } of entries) {
    lines.push(`- [${title}](${loc}): ${summary}`);
  }
  lines.push('');
  return lines.join('\n');
}
