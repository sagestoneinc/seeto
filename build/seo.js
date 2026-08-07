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

export function buildRobots(baseUrl, demo = false) {
  // In demo mode there is deliberately no Sitemap: line. Advertising a sitemap while
  // disallowing the whole site is a contradictory signal, and the sitemap would invite
  // crawling of a site carrying a real business's name over sample data.
  if (demo) {
    return [
      '# Pitch demo. Not the live site. Do not index.',
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');
  }

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
