// Bundles the game into one HTML file that opens offline with a double-click (and an artifact page).
// node game/build.mjs  → ../output/Aurora_Haven_Explorer.html and game/dist/explorer_artifact.html
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
const D = path.dirname(new URL(import.meta.url).pathname), ROOT = path.join(D, '..');
const r = await esbuild.build({ entryPoints: [path.join(D, 'game.js')], bundle: true, format: 'esm', minify: true, write: false, target: 'es2020', legalComments: 'none' });
let js = r.outputFiles[0].text;
const wn = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'textures/waternormals.jpg')).toString('base64');
if (js.split('textures/waternormals.jpg').length !== 2) throw new Error('water normal path not found once');
js = js.replace('textures/waternormals.jpg', wn).replace(/<\/script/gi, '<\\/script');
let html = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
const a = html.indexOf('<script type="importmap">'), b = html.indexOf('</script>', html.indexOf('src="./game/game.js"')) + 9;
if (a < 0 || b < 9) throw new Error('script tags not found');
html = html.slice(0, a) + '<script type="module">\n' + js + '\n</script>' + html.slice(b);
fs.mkdirSync(path.join(D, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, '..', 'output', 'Aurora_Haven_Explorer.html'), html);
// artifact page: the host adds doctype, head and body
const head = html.slice(html.indexOf('<title>'), html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
fs.writeFileSync(path.join(D, 'dist', 'explorer_artifact.html'), head + body);
console.log('bundle KB', Math.round(js.length / 1024), 'html KB', Math.round(html.length / 1024));
