// Writes the magazine's own colour scheme and theme name into a .pptx made by pptxgenjs.
// pptxgenjs sets the theme fonts but keeps Office's default palette, so scheme colours
// (accent1, dk2, ...) would otherwise show as Office blue and orange.
const fs = require('fs');

// jszip ships with pptxgenjs, so load it from there.
const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs')] }));

const KEYS = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
const HEX = /^[0-9A-Fa-f]{6}$/;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function applyTheme(file, theme) {
  KEYS.forEach((k) => {
    if (!HEX.test(theme.colors[k] || '')) throw new Error(`Theme colour ${k} must be six hex digits`);
  });
  const zip = await JSZip.loadAsync(fs.readFileSync(file));

  // A scheme colour passed to an option that only takes hex ends up as an invalid srgbClr.
  for (const p of Object.keys(zip.files).filter((f) => /^ppt\/(slides|slideLayouts|slideMasters)\/[^/]+\.xml$/.test(f))) {
    const xml = await zip.file(p).async('string');
    const bad = [...xml.matchAll(/<a:srgbClr val="([^"]*)"/g)].map((m) => m[1]).filter((v) => !HEX.test(v));
    if (bad.length) throw new Error(`${p} has colours that are not six hex digits: ${[...new Set(bad)].join(', ')}`);
  }

  const scheme = `<a:clrScheme name="${esc(theme.name)}">${KEYS.map((k) => `<a:${k}><a:srgbClr val="${theme.colors[k].toUpperCase()}"/></a:${k}>`).join('')}</a:clrScheme>`;
  for (const p of Object.keys(zip.files).filter((f) => /^ppt\/theme\/theme\d+\.xml$/.test(f))) {
    let xml = await zip.file(p).async('string');
    xml = xml.replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, scheme);
    xml = xml.replace(/(<a:theme\b[^>]*\bname=")[^"]*(")/, `$1${esc(theme.name)}$2`);
    zip.file(p, xml);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

module.exports = { applyTheme };
