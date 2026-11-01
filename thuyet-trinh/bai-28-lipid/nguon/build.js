const L = require('./lib');
const { anim, pres, C, SH, HEX, THEME, ANIM, TRANS, newSlide, click, withP, after, trig, stagger, tx, box, circle, line, img, icon, iconDot, prepIcons, bubbles, kicker, title, nm } = L;
const fs = require('fs');

// ================= LAYOUTS =================
const footer = (col) => ([
  { text: { text: 'KHTN 9  ·  Bài 28: Lipid', options: { x: 0.6, y: 7.02, w: 5, h: 0.3, fontSize: 11, color: col, fontFace: 'Calibri', margin: 0 } } },
]);
pres.defineSlideMaster({
  title: 'CONTENT', background: { path: __dirname + '/img/bg_light.jpg' },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.6, w: 11.0, h: 0.85, fontFace: 'Cambria', fontSize: 32, bold: true, color: C.text2, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    ...footer(C.accent2),
  ],
  slideNumber: { x: 12.1, y: 7.02, w: 0.6, h: 0.3, fontSize: 11, color: C.accent2, fontFace: 'Calibri', align: 'right' },
});
pres.defineSlideMaster({
  title: 'CONTENT_DARK', background: { path: __dirname + '/img/bg_dark.jpg' },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.6, w: 11.0, h: 0.85, fontFace: 'Cambria', fontSize: 32, bold: true, color: C.background1, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    ...footer(C.accent6),
  ],
  slideNumber: { x: 12.1, y: 7.02, w: 0.6, h: 0.3, fontSize: 11, color: C.accent6, fontFace: 'Calibri', align: 'right' },
});
pres.defineSlideMaster({
  title: 'SECTION', background: { path: __dirname + '/img/bg_dark.jpg' },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 3.05, w: 8.6, h: 1.3, fontFace: 'Cambria', fontSize: 50, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'sub', type: 'body', x: 0.9, y: 4.45, w: 8.2, h: 1.0, fontFace: 'Calibri', fontSize: 22, color: C.accent6, valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({ title: 'COVER', background: { path: __dirname + '/img/bg_dark.jpg' }, objects: [] });

// ============== ICONS ==============
const ICONS = [];
const need = (n, c) => { ICONS.push([n, c]); return n; };

async function main() {
  // collect icons up-front
  [['FaGamepad', HEX.dk], ['FaUsers', HEX.white], ['FaStopwatch', HEX.white], ['FaRunning', HEX.white], ['FaTrophy', HEX.white],
   ['FaBookOpen', HEX.green], ['FaFlask', HEX.green], ['FaHeartbeat', HEX.green], ['FaLightbulb', HEX.green], ['FaQuestion', HEX.dk],
   ['FaLeaf', HEX.green], ['FaAppleAlt', HEX.green], ['FaFeatherAlt', HEX.green], ['FaArrowUp', HEX.teal], ['FaBan', HEX.coral], ['FaVial', HEX.green],
   ['FaPumpSoap', HEX.dk], ['FaGasPump', HEX.dk], ['FaPills', HEX.dk], ['FaSpa', HEX.dk], ['FaCheck', HEX.white], ['FaTimes', HEX.white],
   ['FaExclamationTriangle', HEX.coral], ['FaHome', HEX.dk], ['FaRecycle', HEX.green], ['FaFire', HEX.coral], ['FaBrain', HEX.green], ['FaShieldAlt', HEX.green],
   ['FaBolt', HEX.green], ['FaCubes', HEX.green], ['FaPlay', HEX.white], ['FaSearch', HEX.green], ['FaTag', HEX.dk], ['FaFish', HEX.green], ['FaSeedling', HEX.green],
   ['FaBalanceScale', HEX.green], ['FaHamburger', HEX.coral], ['FaGlasses', HEX.dk], ['FaHandPaper', HEX.dk], ['FaBlender', HEX.dk], ['FaBox', HEX.dk],
   ['FaThermometerHalf', HEX.coral], ['FaWeight', HEX.coral], ['FaFlask', HEX.white], ['FaMapSigns', HEX.gold], ['FaClipboardList', HEX.green], ['FaUserFriends', HEX.green],
   ['FaQuestion', HEX.gold], ['FaGamepad', HEX.gold], ['FaFlask', HEX.gold], ['FaPuzzlePiece', HEX.gold], ['FaTrophy', HEX.gold], ['FaHandHoldingHeart', HEX.gold],
   ['FaPen', HEX.green], ['FaEye', HEX.green], ['FaTint', HEX.green], ['FaWater', HEX.teal], ['FaMale', HEX.teal], ['FaFemale', HEX.coral], ['FaQuoteLeft', HEX.gold],
   ['FaChild', HEX.green], ['FaVenusMars', HEX.green], ['FaBriefcase', HEX.green], ['FaUtensils', HEX.white], ['FaRunning', HEX.green], ['FaSun', HEX.green],
   ['FaGraduationCap', HEX.gold], ['FaListOl', HEX.green], ['FaHandsWash', HEX.dk], ['FaTint', HEX.white], ['FaHeartbeat', HEX.coral], ['FaCheck', HEX.green], ['FaTimes', HEX.coral],
   ['FaLightbulb', HEX.gold], ['FaBookOpen', HEX.gold], ['FaHome', HEX.gold], ['FaVials', HEX.green], ['FaThermometerHalf', HEX.green],
  ].forEach(([n, c]) => need(n, c));
  const allC=[HEX.dk,HEX.white,HEX.green,HEX.gold,HEX.teal,HEX.coral];
  const names=[...new Set(ICONS.map(i=>i[0]).concat(['FaLeaf','FaHandHoldingHeart','FaPuzzlePiece','FaLightbulb','FaGlasses','FaBlender','FaBox','FaChild','FaVenusMars','FaBriefcase']))];
  await prepIcons(names.flatMap(n=>allC.map(c=>[n,c])));

  let s, n;
  const SEC = { intro: 'Mở đầu', lipid: 'I. Lipid', fat: 'II. Chất béo', use: 'Ứng dụng & sức khoẻ', prac: 'Luyện tập', app: 'Vận dụng', end: 'Tổng kết' };
  pres.addSection({ title: SEC.intro });

  // ---------- 1. COVER ----------
  s = newSlide('COVER', SEC.intro, 'fade');
  bubbles(s, true);
  const c1 = img(s, 's_dau.png', 7.75, 1.05, 4.7, 4.7, { name: '!!c1', alt: 'Dầu thực vật' });
  const c2 = img(s, 's_bo.png', 11.05, 4.55, 1.95, 1.95, { name: '!!c2', alt: 'Bơ' });
  const c3 = img(s, 's_dua.png', 7.1, 5.0, 1.6, 1.6, { name: '!!c3', alt: 'Dầu dừa' });
  const k1 = tx(s, 'KHOA HỌC TỰ NHIÊN 9  ·  CHƯƠNG IX', 0.8, 1.35, 6.5, 0.4, { size: 14, bold: true, color: C.accent1, cs: 3, margin: 0 });
  const p1 = tx(s, 'BÀI 28', 0.8, 1.9, 1.55, 0.5, { size: 18, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent1, r: 0.25, cs: 2, name: '!!badge' });
  const t1 = tx(s, 'LIPID', 0.8, 2.45, 6.6, 1.7, { size: 110, bold: true, font: 'Cambria', color: C.background1, margin: 0, valign: 'middle', name: '!!bigtitle' });
  const st1 = tx(s, 'Chất béo – từ bữa ăn hằng ngày\nđến bánh xà phòng', 0.8, 4.2, 6.4, 1.0, { size: 24, color: C.accent6, margin: 0, italic: true, font: 'Cambria' });
  const i1 = tx(s, 'Giáo viên: [Họ và tên]   ·   [Tên trường]\nThời lượng: 2 tiết', 0.8, 5.65, 6.4, 0.8, { size: 16, color: C.background1, margin: 0 });
  withP(s, t1, 'zoom', { dur: 700 }); after(s, [k1, p1], 'fade'); after(s, st1, 'float'); after(s, i1, 'fade');
  s.addNotes('Giới thiệu bài 28 – Lipid (2 tiết). Điền tên giáo viên và tên trường vào dòng thông tin.');

  // ---------- 2. MỤC TIÊU ----------
  s = newSlide('CONTENT', SEC.intro);
  bubbles(s);
  kicker(s, 'SAU BÀI HỌC, EM CÓ THỂ');
  title(s, 'Mục tiêu bài học');
  const goals = [
    ['FaBookOpen', 'Khái niệm', 'Nêu được khái niệm lipid, chất béo, trạng thái tự nhiên, công thức chung (R–COO)3C3H5 và đặc điểm cấu tạo.'],
    ['FaFlask', 'Tính chất', 'Trình bày tính chất vật lí (trạng thái, tính tan), tính chất hoá học (phản ứng xà phòng hoá); viết được PTHH.'],
    ['FaHeartbeat', 'Vai trò', 'Nêu được vai trò của lipid: tham gia cấu tạo tế bào và tích luỹ năng lượng trong cơ thể.'],
    ['FaLightbulb', 'Ứng dụng & sức khoẻ', 'Trình bày ứng dụng của chất béo; đề xuất cách dùng chất béo hợp lí để khoẻ mạnh, tránh béo phì.'],
  ];
  const gNames = [];
  goals.forEach((g, i) => {
    const x = 0.6 + (i % 2) * 6.2, y = 1.8 + Math.floor(i / 2) * 2.55;
    const cd = box(s, x, y, 5.9, 2.25, { fill: C.background1, shadow: 'soft' });
    const [dc, di] = iconDot(s, g[0], HEX.green, x + 0.35, y + 0.4, 1.0);
    const ttl = tx(s, g[1], x + 1.6, y + 0.32, 4.0, 0.5, { size: 21, bold: true, color: C.text2, font: 'Cambria', margin: 0 });
    const body = tx(s, g[2], x + 1.6, y + 0.85, 4.05, 1.25, { size: 16, margin: 0 });
    gNames.push([cd, dc, di, ttl, body]);
  });
  gNames.forEach((g, i) => anim(s, i === 0 ? 'click' : 'after', g, 'float', { delay: i ? 0 : 0, dur: 600 }));
  s.addNotes('GV giới thiệu 4 mục tiêu của bài học.');

  // ---------- 3. NỘI DUNG BÀI HỌC ----------
  s = newSlide('CONTENT', SEC.intro);
  bubbles(s);
  kicker(s, 'TIẾN TRÌNH BÀI HỌC');
  title(s, 'Hành trình 5 hoạt động');
  const steps = [
    ['01', 'Mở đầu', 'Trò chơi\n“Tiếp sức đồng đội”'],
    ['02', 'Hình thành kiến thức', 'I. Lipid\nII. Chất béo (học theo trạm)\nỨng dụng & sức khoẻ'],
    ['03', 'Luyện tập', '8 câu hỏi\ncá nhân'],
    ['04', 'Vận dụng', 'Tính toán, giải thích,\nlàm xà phòng từ dầu ăn thừa'],
    ['05', 'Về nhà', 'Ôn bài, chuẩn bị\nBài 29'],
  ];
  const tl = line(s, 1.6, 2.85, 11.75, 2.85, { color: C.accent1, width: 3, dash: 'dash' });
  const stepN = [];
  steps.forEach((st, i) => {
    const cx = 1.6 + i * 2.5375;
    const c = circle(s, cx - 0.6, 2.25, 1.2, { fill: i === 1 ? C.accent2 : C.text2, shadow: 'soft' });
    const num = tx(s, st[0], cx - 0.6, 2.25, 1.2, 1.2, { size: 26, bold: true, color: C.background1, align: 'center', valign: 'middle', font: 'Cambria', margin: 0 });
    const hd = tx(s, st[1], cx - 1.2, 3.7, 2.4, 0.8, { size: 19, bold: true, color: C.text2, align: 'center', margin: 0, font: 'Cambria' });
    const bd = tx(s, st[2], cx - 1.2, 4.5, 2.4, 1.6, { size: 15, align: 'center', margin: 0, color: C.text1 });
    stepN.push([c, num, hd, bd]);
  });
  withP(s, tl, 'wipeL', { dur: 900 });
  stepN.forEach((g) => after(s, g, 'zoom', { dur: 350 }));
  s.addNotes('Tổng quan tiến trình: Mở đầu → Hình thành kiến thức → Luyện tập → Vận dụng → Hướng dẫn về nhà.');

  // ---------- 4. SECTION 01 ----------
  const section = (num, kick, ttl, sub, ic, sec) => {
    const s = newSlide('SECTION', sec);
    bubbles(s, true);
    const nn = tx(s, num, 0.85, 0.55, 3.2, 1.9, { size: 120, bold: true, font: 'Cambria', color: C.accent1, margin: 0, valign: 'bottom', name: '!!secnum' });
    const kk = tx(s, kick, 0.9, 2.62, 8, 0.4, { size: 14, bold: true, color: C.accent6, cs: 3, margin: 0 });
    s.addText(runs(ttl), { placeholder: 'title' });
    s.addText(runs(sub), { placeholder: 'sub' });
    const cc = circle(s, 9.55, 1.95, 3.3, { fill: { color: C.accent1, transparency: 12 }, name: '!!secdot', shadow: 'dark' });
    const ii = icon(s, ic, HEX.dk, 10.4, 2.8, 1.6);
    withP(s, nn, 'float', { dur: 800 }); withP(s, ii, 'zoom', { delay: 300, dur: 600 });
    return s;
  };
  const runs = L.runs;
  s = section('01', 'HOẠT ĐỘNG 1', 'Mở đầu', 'Trò chơi “Tiếp sức đồng đội”', 'FaGamepad', SEC.intro);
  s.addNotes('Hoạt động 1 – Mở đầu: tạo hứng thú, giúp HS nhận biết một số lipid trong cuộc sống.');

  // ---------- 5. LUẬT CHƠI ----------
  s = newSlide('CONTENT', SEC.intro);
  bubbles(s);
  kicker(s, 'TRÒ CHƠI · TIẾP SỨC ĐỒNG ĐỘI');
  title(s, 'Luật chơi');
  const rules = [
    ['FaUsers', '4 đội', 'Mỗi đội cử 6 thành viên tham gia.', C.text2],
    ['FaStopwatch', '1 phút', 'Quan sát hình ảnh, ghi nhớ các thực phẩm giàu chất béo.', C.accent2],
    ['FaRunning', '2 phút', 'Lần lượt từng thành viên chạy tiếp sức, viết tên thực phẩm đã thấy.', C.accent3],
    ['FaTrophy', 'Chiến thắng', 'Đội viết đúng nhiều thực phẩm nhất là đội thắng cuộc!', C.accent1],
  ];
  const rN = [];
  rules.forEach((r, i) => {
    const x = 0.6 + i * 3.075, y = 1.85;
    const cd = box(s, x, y, 2.85, 4.75, { fill: r[3], shadow: 'soft', r: 0.2 });
    const ic = icon(s, r[0], HEX.white, x + 0.3, y + 0.4, 0.9);
    const big = tx(s, r[1], x + 0.3, y + 1.55, 2.45, 0.8, { size: i === 3 ? 26 : 32, bold: true, font: 'Cambria', color: i === 3 ? C.text2 : C.background1, margin: 0 });
    const bd = tx(s, r[2], x + 0.3, y + 2.5, 2.3, 2.0, { size: 17, color: i === 3 ? C.text2 : C.background1, margin: 0 });
    rN.push([cd, ic, big, bd]);
  });
  rN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 550 }));
  s.addNotes('Chia lớp 4 đội, mỗi đội 6 thành viên. 1 phút quan sát, 2 phút tiếp sức viết tên thực phẩm.');

  // ---------- timer helper ----------
  function timer(s, x, y, w, secs, label) {
    const btn = tx(s, '▶  Bắt đầu', x, y, 1.75, 0.5, { size: 16, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent4, r: 0.25, shadow: 'soft', nosub: true });
    const trk = box(s, x + 1.95, y + 0.14, w - 1.95 - 1.2, 0.22, { fill: { color: C.accent2, transparency: 82 }, r: 0.11 });
    const bar = box(s, x + 1.95, y + 0.14, w - 1.95 - 1.2, 0.22, { fill: C.accent1, r: 0.11 });
    const lb = tx(s, label, x + w - 1.1, y, 1.1, 0.5, { size: 16, bold: true, color: C.text2, align: 'right', valign: 'middle', margin: 0, nosub: true });
    trig(s, btn, [{ names: bar, eff: 'exitWipe', dur: secs * 1000 }]);
    return { btn, trk, bar, lb };
  }

  // ---------- 6. QUAN SÁT ----------
  const foods = [['f_dua.png', 'Dầu dừa'], ['f_vung.png', 'Dầu vừng (mè), hạt vừng'], ['f_mo.png', 'Mỡ lợn'], ['f_bo.png', 'Bơ'], ['f_mix.png', 'Cá hồi, quả bơ, các loại hạt, dầu ô liu'], ['f_dau.png', 'Dầu thực vật, phô mai, quả bơ']];
  s = newSlide('CONTENT', SEC.intro);
  bubbles(s);
  kicker(s, 'VÒNG 1 · 60 GIÂY');
  title(s, 'Quan sát & ghi nhớ thực phẩm giàu chất béo');
  const fN = [];
  foods.forEach((f, i) => {
    const x = 0.87 + (i % 3) * 4.0, y = 1.6 + Math.floor(i / 3) * 2.45;
    fN.push(img(s, f[0], x, y, 3.6, 2.25, { name: '!!food' + i, alt: f[1] }));
  });
  timer(s, 0.87, 6.38, 11.6, 60, '60 giây');
  fN.forEach((f, i) => anim(s, i ? 'after' : 'with', f, 'zoom', { dur: 350 }));
  s.addNotes('Bấm “Bắt đầu” để chạy đồng hồ 60 giây. HS quan sát và ghi nhớ thực phẩm giàu chất béo.');

  // ---------- 7. TIẾP SỨC ----------
  s = newSlide('CONTENT', SEC.intro);
  bubbles(s);
  kicker(s, 'VÒNG 2 · 120 GIÂY');
  title(s, 'Tiếp sức: viết tên thực phẩm!');
  foods.forEach((f, i) => img(s, f[0], 1.15 + i * 0.08, 1.95 + i * 0.07, 3.6, 2.25, { name: '!!food' + i, rotate: [-10, 6, -4, 9, -7, 3][i], alt: f[1] }));
  box(s, 1.0, 1.85, 4.1, 2.75, { fill: C.text2, shadow: 'dark', rotate: -3, r: 0.2, name: 'cover' });
  tx(s, '?', 1.0, 1.85, 4.1, 2.75, { size: 110, bold: true, font: 'Cambria', color: C.accent1, align: 'center', valign: 'middle', rotate: -3 });
  const rl = [['1', 'Thành viên đầu tiên chạy lên bảng, viết tên một thực phẩm giàu chất béo đã thấy.'], ['2', 'Chạy về, chạm tay người tiếp theo – người đó tiếp tục.'], ['3', 'Không viết trùng. Hết 2 phút, đội nhiều đáp án đúng nhất thắng!']];
  const rlN = rl.map((r, i) => {
    const y = 1.8 + i * 1.3;
    const c = circle(s, 6.0, y, 0.75, { fill: C.accent1 });
    const t = tx(s, r[0], 6.0, y, 0.75, 0.75, { size: 22, bold: true, color: C.text2, align: 'center', valign: 'middle', margin: 0, font: 'Cambria' });
    const b = tx(s, r[1], 7.0, y - 0.05, 5.7, 1.0, { size: 19, valign: 'middle', margin: 0 });
    return [c, t, b];
  });
  timer(s, 6.0, 5.75, 6.7, 120, '120 giây');
  rlN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 500 }));
  s.addNotes('Bấm “Bắt đầu” để chạy đồng hồ 2 phút. Các đội lần lượt chạy tiếp sức viết tên thực phẩm.');

  // ---------- 8. ĐÁP ÁN TRÒ CHƠI ----------
  s = newSlide('CONTENT', SEC.intro);
  bubbles(s);
  kicker(s, 'ĐÁP ÁN');
  title(s, 'Những thực phẩm giàu chất béo');
  const lblN = [];
  foods.forEach((f, i) => {
    const x = 0.75 + (i % 3) * 4.0, y = 1.6 + Math.floor(i / 3) * 2.62;
    img(s, f[0], x + 0.15, y, 3.3, 2.06, { name: '!!food' + i, alt: f[1] });
    lblN.push(tx(s, f[1], x, y + 2.1, 3.6, 0.42, { size: 15, bold: true, color: C.text2, align: 'center', valign: 'middle', margin: 0 }));
  });
  stagger(s, 'click', lblN, 'fade', 0, 300);
  s.addNotes('Chốt: một số thực phẩm giàu chất béo – dầu ăn, mỡ động vật, lạc, vừng, bơ…');

  // ---------- 9. CÂU HỎI DẪN DẮT ----------
  s = newSlide('CONTENT_DARK', SEC.intro);
  bubbles(s, true);
  kicker(s, 'VẤN ĐỀ ĐẶT RA', true);
  title(s, 'Dầu, mỡ quen thuộc – nhưng em đã hiểu chúng?');
  img(s, 'hero.png', 0.6, 1.85, 5.6, 3.73, { name: '!!hero', alt: 'Thực phẩm giàu chất béo' });
  tx(s, 'Dầu thực vật và mỡ động vật là loại lipid được dùng phổ biến hằng ngày để chế biến thực phẩm.', 0.6, 5.75, 5.6, 1.0, { size: 16, italic: true, color: C.accent6, margin: 0 });
  const qs = ['Chất béo là gì?', 'Vai trò của chúng trong cơ thể sinh vật là gì?', 'Vì sao tuỳ độ tuổi, cơ thể cần lượng dầu, mỡ phù hợp?', 'Sử dụng chất béo thế nào để có lợi cho sức khoẻ?', 'Lipid còn có những ứng dụng gì khác?'];
  const qN = qs.map((q, i) => {
    const y = 1.85 + i * 0.98;
    const cd = box(s, 6.7, y, 6.0, 0.8, { fill: { color: C.background1, transparency: 88 }, line: { color: C.accent1, width: 1.25 }, r: 0.4 });
    const ic = icon(s, 'FaQuestion', HEX.gold, 6.95, y + 0.2, 0.4);
    const t = tx(s, q, 7.55, y, 5.0, 0.8, { size: 18, color: C.background1, valign: 'middle', margin: 0 });
    return [cd, ic, t];
  });
  qN.forEach(g => click(s, g, 'float', { dur: 500 }));
  s.addNotes('Đặt vấn đề: Chất béo là gì? Vai trò? Vì sao tuỳ độ tuổi cần lượng dầu mỡ phù hợp? Dùng thế nào có lợi cho sức khoẻ? Ứng dụng khác? → Bài học hôm nay.');

  // ---------- 10. SECTION 02 ----------
  pres.addSection({ title: SEC.lipid });
  s = section('02', 'HOẠT ĐỘNG 2.1 · HÌNH THÀNH KIẾN THỨC', 'I. Lipid', 'Lipid có ở đâu, có tính chất gì và giữ vai trò gì?', 'FaLeaf', SEC.lipid);
  s.addNotes('Hoạt động 2.1 – Tìm hiểu về lipid.');

  // ---------- 11. MỘT SỐ LOẠI LIPID ----------
  s = newSlide('CONTENT', SEC.lipid);
  bubbles(s);
  kicker(s, 'HÌNH 28.1 · SGK TRANG 128');
  title(s, 'Một số loại lipid điển hình');
  const def = tx(s, '==Lipid== là những hợp chất hữu cơ có trong tế bào sống, **không tan trong nước**, nhưng **tan được trong một số dung môi hữu cơ** như xăng, dầu hoả…', 0.6, 1.6, 12.1, 0.8, { size: 19, margin: 0 });
  const pa = box(s, 0.6, 2.6, 7.4, 4.15, { fill: C.background1, shadow: 'soft' });
  const pat = tx(s, 'a) Chất béo', 0.95, 2.8, 4, 0.5, { size: 22, bold: true, font: 'Cambria', color: C.accent2, margin: 0 });
  const fatImgs = [['s_dau.png', 'Dầu thực vật'], ['s_mo.png', 'Mỡ động vật'], ['s_bo.png', 'Bơ']];
  const fi = fatImgs.map((f, i) => {
    const x = 1.0 + i * 2.35;
    return [img(s, f[0], x, 3.45, 2.0, 2.0, { alt: f[1] }), tx(s, f[1], x - 0.2, 5.6, 2.4, 0.45, { size: 16, bold: true, align: 'center', margin: 0, color: C.text2 })];
  });
  const pb = box(s, 8.3, 2.6, 4.4, 4.15, { fill: C.background1, shadow: 'soft' });
  const pbt = tx(s, 'b) Sáp', 8.65, 2.8, 3, 0.5, { size: 22, bold: true, font: 'Cambria', color: C.accent2, margin: 0 });
  const wax = [['FaAppleAlt', 'Vỏ quả bơ'], ['FaLeaf', 'Bề mặt lá cọ']];
  const wi = wax.map((w, i) => {
    const x = 8.75 + i * 2.0;
    return [...iconDot(s, w[0], HEX.green, x, 3.5, 1.5, { tr: 80 }), tx(s, w[1], x - 0.3, 5.15, 2.1, 0.45, { size: 16, bold: true, align: 'center', margin: 0, color: C.text2 })];
  });
  const wnote = tx(s, 'Có trên lá, thân, trái cây; da, lông một số động vật', 8.6, 5.65, 3.85, 0.9, { size: 14, italic: true, align: 'center', margin: 0, color: C.text1 });
  withP(s, def, 'fade');
  click(s, [pa, pat], 'float'); fi.forEach(g => after(s, g, 'zoom', { dur: 400 }));
  click(s, [pb, pbt], 'float'); wi.forEach(g => after(s, g, 'zoom', { dur: 400 })); after(s, wnote, 'fade');
  s.addNotes('Giới thiệu hình 28.1: chất béo (dầu thực vật, mỡ động vật, bơ) và sáp (vỏ quả bơ, bề mặt lá cọ).');

  // ---------- 12. PHT 1 ----------
  s = newSlide('CONTENT', SEC.lipid);
  bubbles(s);
  kicker(s, 'THẢO LUẬN CẶP ĐÔI · ĐỌC SGK TRANG 128–129');
  title(s, 'Phiếu học tập số 1');
  img(s, 'mix_tall.png', 8.85, 1.75, 3.85, 3.08, { name: '!!side', alt: 'Thực phẩm chứa chất béo' });
  tx(s, 'Thời gian gợi ý: 5 phút', 8.85, 5.0, 3.85, 0.45, { size: 15, italic: true, color: C.accent2, align: 'center', margin: 0 });
  const p1q = ['Trong tự nhiên, lipid có ở đâu?', 'Đặc trưng tính chất vật lí của lipid là gì? Lipid tham gia cấu tạo nên bộ phận nào của tế bào?', 'Có những loại lipid điển hình nào? Vai trò của mỗi loại ở sinh vật là gì?'];
  const p1N = p1q.map((q, i) => {
    const y = 1.75 + i * 1.7;
    const cd = box(s, 0.6, y, 7.95, 1.45, { fill: C.background1, shadow: 'soft' });
    const c = circle(s, 0.85, y + 0.32, 0.8, { fill: C.accent1 });
    const nn = tx(s, String(i + 1), 0.85, y + 0.32, 0.8, 0.8, { size: 24, bold: true, font: 'Cambria', color: C.text2, align: 'center', valign: 'middle', margin: 0 });
    const t = tx(s, q, 1.9, y + 0.1, 6.45, 1.25, { size: 19, valign: 'middle', margin: 0 });
    return [cd, c, nn, t];
  });
  p1N.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 500 }));
  s.addNotes('HS đọc SGK trang 128, 129, thảo luận cặp đôi trả lời 3 câu hỏi trong phiếu học tập số 1.');

  // ---------- 13. ĐÁP ÁN PHT1 ----------
  s = newSlide('CONTENT', SEC.lipid);
  bubbles(s);
  kicker(s, 'ĐÁP ÁN · PHIẾU HỌC TẬP SỐ 1');
  title(s, 'Lipid: ở đâu, tính chất gì, vai trò gì?');
  const a1 = [
    ['Lipid có ở đâu?', 'Lipid có trong **tế bào sống**.'],
    ['Tính chất vật lí? Cấu tạo bộ phận nào?', '**Không tan trong nước**, tan trong dung môi hữu cơ (xăng, dầu hoả…). Lipid tham gia cấu tạo tế bào, là **thành phần chính của màng tế bào**.'],
    ['Lipid điển hình và vai trò?', '**Chất béo**: nguồn dự trữ năng lượng chính; thành phần chính của dầu thực vật, mỡ động vật.\n**Sáp**: trên lá, thân, trái cây, da, lông động vật – giúp chống nước và tác động có hại từ môi trường.'],
  ];
  const hs = [1.25, 1.35, 1.95];
  let yy = 1.65;
  a1.forEach((a, i) => {
    const h = hs[i];
    const q = tx(s, a[0], 0.6, yy, 3.9, h, { size: 18, bold: true, color: C.background1, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.text2, r: 0.16, margin: 0.18 });
    const ans = tx(s, a[1], 4.7, yy, 8.0, h, { size: 16, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: { color: C.accent2, transparency: 88 }, r: 0.16, margin: 0.18 });
    withP(s, q, 'fade', { delay: i * 150 });
    click(s, ans, 'wipeL', { dur: 600 });
    yy += h + 0.25;
  });
  s.addNotes('Gọi một số cặp báo cáo; HS khác nhận xét, bổ sung. GV chốt đáp án từng câu (bấm để hiện).');

  // ---------- 14. CHỐT I. LIPID ----------
  s = newSlide('CONTENT', SEC.lipid);
  bubbles(s);
  kicker(s, 'CHỐT KIẾN THỨC');
  title(s, 'I. Lipid');
  const lc = [
    ['Khái niệm', 'Hợp chất hữu cơ có trong tế bào sống; không tan trong nước, tan trong dung môi hữu cơ (xăng, dầu hoả…).', 0.6, 2.75, 4.5, 2.55, 'FaBookOpen'],
    ['Phân loại', 'Chất béo (dầu, mỡ), sáp…', 8.25, 1.7, 4.45, 1.85, 'FaCubes'],
    ['Vai trò', 'Tham gia cấu tạo tế bào, là thành phần chính của màng tế bào. Chất béo tích luỹ trong mô mỡ – nguồn dự trữ năng lượng quan trọng.', 8.25, 3.8, 4.45, 2.95, 'FaBolt'],
  ];
  const lcN = [];
  const ccx = 6.68, ccy = 4.15;
  lc.forEach((c) => {
    const ex = c[2] < 6 ? c[2] + c[4] : c[2], ey = c[3] + c[5] / 2;
    lcN.push(line(s, ccx, ccy, ex, ey, { color: C.accent1, width: 2.5 }));
  });
  const core = circle(s, ccx - 1.15, ccy - 1.15, 2.3, { fill: C.text2, shadow: 'soft' });
  const coreT = tx(s, 'LIPID', ccx - 1.15, ccy - 1.15, 2.3, 2.3, { size: 30, bold: true, font: 'Cambria', color: C.accent1, align: 'center', valign: 'middle', margin: 0 });
  withP(s, [core, coreT], 'zoom', { dur: 600 });
  lc.forEach((c, i) => {
    const cd = box(s, c[2], c[3], c[4], c[5], { fill: C.background1, shadow: 'soft' });
    const [d1, d2] = iconDot(s, c[6], HEX.green, c[2] + 0.25, c[3] + 0.25, 0.7);
    const hd = tx(s, c[0], c[2] + 1.1, c[3] + 0.28, c[4] - 1.3, 0.6, { size: 21, bold: true, font: 'Cambria', color: C.text2, valign: 'middle', margin: 0 });
    const bd = tx(s, c[1], c[2] + 0.3, c[3] + 1.05, c[4] - 0.55, c[5] - 1.2, { size: 16, margin: 0 });
    click(s, lcN[i], 'wipeL', { dur: 400 }); after(s, [cd, d1, d2, hd, bd], 'float', { dur: 500 });
  });
  s.addNotes('GV chốt kiến thức phần I. Lipid; HS ghi vở.');

  // ---------- 15. SECTION II ----------
  pres.addSection({ title: SEC.fat });
  s = section('02', 'HOẠT ĐỘNG 2.2 · HỌC THEO TRẠM', 'II. Chất béo', 'Khái niệm · Tính chất vật lí · Tính chất hoá học', 'FaFlask', SEC.fat);
  s.addNotes('Hoạt động 2.2 – Tìm hiểu khái niệm, tính chất vật lí, tính chất hoá học của chất béo theo hình thức học theo trạm.');

  // ---------- 16. SƠ ĐỒ TRẠM ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, '6 NHÓM · 2 CỤM · 3 TRẠM');
  title(s, 'Sơ đồ học theo trạm');
  const stCol = [C.accent1, C.accent3, C.accent2];
  const clusterN = [];
  [1.0, 4.55].forEach((cx0, k) => {
    const g = [];
    g.push(box(s, cx0, 1.65, 3.3, 4.2, { fill: C.background1, shadow: 'soft' }));
    g.push(tx(s, 'Cụm ' + (k + 1), cx0 + 1.05, 1.85, 1.2, 0.45, { size: 16, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.22, margin: 0 }));
    const P = { 1: [cx0 + 0.3, 2.6], 3: [cx0 + 2.0, 2.6], 2: [cx0 + 1.15, 4.3] };
    const d = 1.0;
    const ctr = (k2) => [P[k2][0] + d / 2, P[k2][1] + d / 2];
    const arr = (a, b) => {
      const [x1, y1] = ctr(a), [x2, y2] = ctr(b);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, off = 0.58;
      return line(s, x1 + ux * off, y1 + uy * off, x2 - ux * off, y2 - uy * off, { color: C.text2, width: 2.25, arrow: true });
    };
    g.push(arr(1, 2), arr(2, 3), arr(3, 1));
    [1, 2, 3].forEach(t => {
      g.push(circle(s, P[t][0], P[t][1], d, { fill: stCol[t - 1], shadow: 'soft' }));
      g.push(tx(s, 'Trạm\n' + t, P[t][0], P[t][1], d, d, { size: 15, bold: true, color: t === 1 ? C.text2 : C.background1, align: 'center', valign: 'middle', margin: 0, psa: 0, lsm: 0.9, nosub: true }));
    });
    clusterN.push(g);
  });
  const stations = [['Trạm 1 · PHT số 2', 'Khái niệm chất béo'], ['Trạm 2 · PHT số 3', 'Trạng thái tự nhiên, tính chất vật lí'], ['Trạm 3 · PHT số 4', 'Tính chất hoá học']];
  const stN = stations.map((st, i) => {
    const y = 1.65 + i * 1.12;
    const c = circle(s, 8.3, y + 0.17, 0.6, { fill: stCol[i] });
    const a = tx(s, st[0], 9.1, y, 3.6, 0.45, { size: 17, bold: true, color: C.text2, margin: 0, nosub: true });
    const b = tx(s, st[1], 9.1, y + 0.45, 3.6, 0.5, { size: 16, margin: 0 });
    return [c, a, b];
  });
  const rot = tx(s, 'Hết mỗi lượt, chuyển phiếu học tập theo chiều mũi tên.', 8.3, 5.05, 4.4, 0.8, { size: 15, italic: true, color: C.accent2, margin: 0 });
  timer(s, 1.0, 6.2, 11.7, 600, '10 phút');
  click(s, clusterN[0], 'zoom', { dur: 450 }); after(s, clusterN[1], 'zoom', { dur: 450 });
  stN.forEach(g => after(s, g, 'float', { dur: 400 })); after(s, rot, 'fade');
  s.addNotes('Chia lớp 6 nhóm, 2 cụm, mỗi cụm 3 trạm. Trạm 1: PHT số 2; Trạm 2: PHT số 3; Trạm 3: PHT số 4. Hết lượt di chuyển PHT theo chiều mũi tên. Bấm “Bắt đầu” để chạy đồng hồ 10 phút.');

  // ---------- 17. TRẠM 1 – KHÁI NIỆM ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 1 · PHIẾU HỌC TẬP SỐ 2 · CÂU 1');
  title(s, 'Khái niệm chất béo');
  img(s, 's_dua.png', 0.75, 1.75, 2.2, 2.2, { alt: 'Dầu dừa' });
  tx(s, 'Dầu dừa', 0.6, 4.0, 2.5, 0.4, { size: 15, bold: true, align: 'center', color: C.text2, margin: 0 });
  img(s, 's_mo.png', 0.75, 4.45, 2.2, 2.2, { alt: 'Mỡ lợn' });
  const t1q = [
    ['a) Kể tên một số chất béo có trong tự nhiên?', 'Dầu ăn, mỡ lợn, mỡ cá, dầu dừa, dầu mè (vừng), lạc, thịt bò…'],
    ['b) Chất béo có cấu tạo như thế nào? Công thức tổng quát?', 'Chất béo là **triester của glycerol với các acid béo**. Chất béo đơn giản: ==(RCOO)3C3H5==.'],
    ['c) Lipid có phải là chất béo không?', '**Không phải mọi lipid đều là chất béo.** Chất béo chỉ là một loại lipid; lipid còn gồm sáp…'],
  ];
  t1q.forEach((q, i) => {
    const y = 1.65 + i * 1.75;
    tx(s, q[0], 3.4, y, 9.3, 0.5, { size: 19, bold: true, color: C.text2, margin: 0 });
    const a = tx(s, q[1], 3.4, y + 0.55, 9.3, 0.95, { size: 17, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: { color: C.accent1, transparency: 82 }, r: 0.14, margin: 0.18 });
    click(s, a, 'wipeL');
  });
  s.addNotes('Trạm 1: quan sát hình, khai thác SGK trang 129, hoàn thành PHT số 2. Bấm để hiện đáp án từng ý.');

  // ---------- 18. TRẠM 1 – BẢNG ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 1 · PHIẾU HỌC TẬP SỐ 2 · CÂU 2');
  title(s, 'Hoàn thành bảng: acid béo → chất béo');
  const cw = [3.9, 4.3, 3.9], cx = [0.6, 4.5, 8.8];
  const hdrs = ['Acid béo', 'Công thức của chất béo', 'Tên của chất béo'];
  hdrs.forEach((h, j) => tx(s, h, cx[j], 1.65, cw[j], 0.65, { size: 18, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.RECTANGLE, fill: C.text2 }));
  const rows = [
    ['Palmitic acid\nC15H31COOH', '(C15H31COO)3C3H5', 'Glyceryl tripalmitate', null],
    ['Stearic acid\n**………………**', '(C17H35COO)3C3H5', 'Glyceryl tristearate', [0, 'Stearic acid\n==C17H35COOH==']],
    ['Oleic acid\nC17H33COOH', '**………………**', 'Glyceryl trioleate', [1, '==(C17H33COO)3C3H5==']],
    ['**………………**\nC17H31COOH', '(C17H31COO)3C3H5', 'Glyceryl trilinoleate', [0, '==Linoleic acid==\nC17H31COOH']],
  ];
  rows.forEach((r, i) => {
    const y = 2.3 + i * 1.08;
    for (let j = 0; j < 3; j++) tx(s, r[j], cx[j], y, cw[j], 1.08, { size: 18, align: 'center', valign: 'middle', shape: SH.RECTANGLE, fill: i % 2 ? C.background1 : { color: C.accent2, transparency: 92 }, line: { color: C.accent2, width: 0.75 } });
    if (r[3]) {
      const j = r[3][0];
      const o = tx(s, r[3][1], cx[j] + 0.08, y + 0.08, cw[j] - 0.16, 0.92, { size: 18, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.12, shadow: 'soft' });
      click(s, o, 'zoom', { dur: 450 });
    }
  });
  s.addNotes('Bấm lần lượt để hiện 3 ô trống: C17H35COOH; (C17H33COO)3C3H5; Linoleic acid.');

  // ---------- 19. TRẠM 1 – CTCT TRIOLEIN ----------
  const struct3 = (s, x, y, lefts, size = 22, col = C.text1, o = {}) => {
    // lefts: 3 strings (acid residues); draws "R–COO – CH2/CH/CH2" with vertical bonds
    const rowH = 0.72, lw = o.lw || 2.6;
    const names = [];
    lefts.forEach((l, i) => {
      names.push(tx(s, l + ' –', x, y + i * rowH, lw, rowH, { size, align: 'right', valign: 'middle', margin: 0, color: col, font: 'Cambria' }));
      names.push(tx(s, ['CH2', 'CH', 'CH2'][i], x + lw + 0.08, y + i * rowH, 0.9, rowH, { size, valign: 'middle', margin: 0, color: col, font: 'Cambria' }));
    });
    const bx = x + lw + 0.08 + size * 0.0105;
    names.push(line(s, bx, y + rowH * 0.78, bx, y + rowH * 1.22, { color: col, width: 1.5 }));
    names.push(line(s, bx, y + rowH * 1.78, bx, y + rowH * 2.22, { color: col, width: 1.5 }));
    return names;
  };
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 1 · PHIẾU HỌC TẬP SỐ 2 · CÂU 3');
  title(s, 'Chất béo tạo từ oleic acid và glycerol');
  const r1 = tx(s, '3 C17H33COOH', 0.6, 1.9, 3.6, 0.7, { size: 24, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.2 });
  tx(s, 'oleic acid', 0.6, 2.65, 3.6, 0.4, { size: 15, italic: true, align: 'center', margin: 0 });
  tx(s, '+', 0.6, 3.05, 3.6, 0.6, { size: 30, bold: true, align: 'center', valign: 'middle', margin: 0, color: C.accent2 });
  tx(s, 'C3H5(OH)3', 0.6, 3.7, 3.6, 0.7, { size: 24, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: { color: C.accent3, transparency: 70 }, r: 0.2 });
  tx(s, 'glycerol', 0.6, 4.45, 3.6, 0.4, { size: 15, italic: true, align: 'center', margin: 0 });
  const arw = line(s, 4.6, 3.35, 5.7, 3.35, { color: C.accent2, width: 3, arrow: true });
  const stBox = box(s, 6.0, 1.75, 6.7, 3.4, { fill: C.background1, shadow: 'soft' });
  const stN3 = struct3(s, 6.6, 2.35, ['C17H33COO', 'C17H33COO', 'C17H33COO'], 26, C.text1, { lw: 3.0 });
  const nm3 = tx(s, 'Glyceryl trioleate · (C17H33COO)3C3H5', 6.0, 5.35, 6.7, 0.55, { size: 19, bold: true, color: C.accent2, align: 'center', margin: 0 });
  const tip = tx(s, 'Mẹo: mỗi nhóm –OH của glycerol kết hợp với một gốc acid béo tạo liên kết ester –COO–.', 0.6, 6.1, 12.1, 0.55, { size: 16, italic: true, margin: 0, color: C.text1 });
  click(s, arw, 'wipeL'); after(s, stBox, 'zoom'); after(s, stN3, 'fade', { dur: 600 }); after(s, nm3, 'float'); click(s, tip, 'fade');
  s.addNotes('Bấm để hiện công thức cấu tạo glyceryl trioleate.');

  // ---------- 20. TRẠM 2 – THÍ NGHIỆM ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 2 · PHIẾU HỌC TẬP SỐ 3');
  title(s, 'Thí nghiệm: tính tan của chất béo');
  const grpLbl = [['TRONG NƯỚC', 0.75, 5.9], ['TRONG XĂNG', 6.75, 5.9]];
  grpLbl.forEach(g => tx(s, g[0], g[1], 1.6, g[2], 0.42, { size: 15, bold: true, cs: 3, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: g[0].includes('NƯỚC') ? C.accent3 : C.accent1, r: 0.21 }));
  const cups = [
    ['Cốc (1): mỡ lợn + nước', 'Mỡ lợn **không tan** trong nước, **nhẹ hơn** nước.', 'mo', 'water'],
    ['Cốc (2): dầu ăn + nước', 'Dầu ăn **không tan** trong nước, **nhẹ hơn** nước.', 'dau', 'water'],
    ['Cốc (3): mỡ lợn + xăng', 'Mỡ lợn **tan** trong xăng.', 'mo', 'xang'],
    ['Cốc (4): dầu ăn + xăng', 'Dầu ăn **tan** trong xăng.', 'dau', 'xang'],
  ];
  const obsN = [];
  cups.forEach((c, i) => {
    const cx0 = 0.75 + i * 3.0, bx = cx0 + 0.6, by = 2.3, bw = 1.7, bh = 2.05;
    if (c[3] === 'water') {
      box(s, bx + 0.06, by + 0.6, bw - 0.12, bh - 0.66, { fill: { color: C.accent3, transparency: 65 }, r: 0.12 });
      if (c[2] === 'dau') box(s, bx + 0.06, by + 0.42, bw - 0.12, 0.3, { fill: C.accent1, r: 0.05 });
      else { box(s, bx + 0.35, by + 0.42, 0.55, 0.3, { fill: C.background1, line: { color: C.accent1, width: 1 }, r: 0.1, rotate: -8 }); box(s, bx + 0.95, by + 0.45, 0.4, 0.25, { fill: C.background1, line: { color: C.accent1, width: 1 }, r: 0.1, rotate: 10 }); }
    } else {
      box(s, bx + 0.06, by + 0.5, bw - 0.12, bh - 0.56, { fill: { color: C.accent1, transparency: c[2] === 'dau' ? 55 : 70 }, r: 0.12 });
    }
    box(s, bx, by, bw, bh, { line: { color: C.text2, width: 2.5 }, r: 0.18 });
    tx(s, c[0], cx0, 4.45, 2.9, 0.45, { size: 16, bold: true, align: 'center', margin: 0, color: C.text2 });
    obsN.push(tx(s, c[1], cx0 + 0.05, 5.0, 2.8, 1.25, { size: 16, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.background1, shadow: 'soft', r: 0.14, margin: 0.12 }));
  });
  click(s, obsN[0], 'float'); after(s, obsN[1], 'float');
  click(s, obsN[2], 'float'); after(s, obsN[3], 'float');
  s.addNotes('Trạm 2: HS tiến hành thí nghiệm với mỡ lợn, dầu ăn trong nước và trong xăng; nhận xét tính tan. Bấm để hiện nhận xét.');

  // ---------- 21. TRẠM 2 – TRẠNG THÁI & TCVL ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 2 · PHIẾU HỌC TẬP SỐ 3 · CÂU 2');
  title(s, 'Trạng thái tự nhiên & tính chất vật lí');
  const stL = box(s, 0.6, 1.7, 5.9, 5.0, { fill: C.background1, shadow: 'soft' });
  const stLt = tx(s, 'Ở điều kiện thường', 0.95, 1.9, 5.2, 0.5, { size: 21, bold: true, font: 'Cambria', color: C.accent2, margin: 0 });
  const liq = [img(s, 's_dau.png', 1.05, 2.65, 2.2, 2.2, { alt: 'Dầu thực vật' }), tx(s, '==THỂ LỎNG==\nDầu thực vật: dầu lạc, dầu hướng dương, dầu cá…', 0.8, 4.95, 2.75, 1.6, { size: 15, align: 'center', margin: 0 })];
  const sol = [img(s, 's_bo.png', 3.85, 2.65, 2.2, 2.2, { alt: 'Bơ' }), tx(s, '==THỂ RẮN==\nMỡ động vật, bơ…', 3.6, 4.95, 2.7, 1.6, { size: 15, align: 'center', margin: 0 })];
  const props = [['FaArrowUp', HEX.teal, 'Nhẹ hơn nước'], ['FaBan', HEX.coral, 'Không tan trong nước'], ['FaVial', HEX.green, 'Tan trong một số dung môi hữu cơ: xăng, benzene, chloroform…']];
  const prN = props.map((p, i) => {
    const y = 1.75 + i * 1.65;
    const cd = box(s, 6.85, y, 5.85, 1.4, { fill: C.background1, shadow: 'soft' });
    const [d1, d2] = iconDot(s, p[0], p[1], 7.1, y + 0.25, 0.9, { tint: i === 0 ? C.accent3 : i === 1 ? C.accent4 : C.accent2 });
    const t = tx(s, p[2], 8.25, y + 0.1, 4.25, 1.2, { size: 19, bold: i < 2, valign: 'middle', margin: 0 });
    return [cd, d1, d2, t];
  });
  click(s, [stL, stLt], 'fade'); after(s, liq, 'zoom'); after(s, sol, 'zoom');
  prN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 500 }));
  s.addNotes('Chốt trạng thái tự nhiên và tính chất vật lí của chất béo.');

  // ---------- 22. TRẠM 3 – NHIỆM VỤ ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 3 · PHIẾU HỌC TẬP SỐ 4');
  title(s, 'Tính chất hoá học của chất béo');
  img(s, 'soap.png', 9.25, 1.65, 3.45, 3.83, { name: '!!side', alt: 'Làm xà phòng thủ công' });
  tx(s, 'Thuỷ phân chất béo trong môi trường kiềm', 9.25, 5.6, 3.45, 0.9, { size: 15, italic: true, align: 'center', margin: 0, color: C.accent2 });
  const badge = tx(s, 'TRỌNG TÂM', 0.6, 1.62, 1.9, 0.42, { size: 14, bold: true, cs: 2, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent4, r: 0.21 });
  const t3 = [
    ['Câu 1', 'Viết PTHH thuỷ phân chất béo trong môi trường kiềm dạng tổng quát.'],
    ['Câu 2', 'Đun nóng (C15H31COO)3C3H5 (tripalmitin) với dung dịch NaOH sẽ thu được những sản phẩm gì?'],
    ['Câu 3', 'Viết PTHH phản ứng xà phòng hoá khi đun nóng dung dịch NaOH với chất béo được tạo bởi 1 gốc oleic và 2 gốc stearic.'],
  ];
  const t3N = t3.map((q, i) => {
    const y = 2.25 + i * 1.5;
    const cd = box(s, 0.6, y, 8.35, 1.3, { fill: C.background1, shadow: 'soft' });
    const lb = tx(s, q[0], 0.8, y + 0.3, 1.1, 0.7, { size: 17, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.2, margin: 0 });
    const t = tx(s, q[1], 2.1, y + 0.08, 6.7, 1.14, { size: 18, valign: 'middle', margin: 0 });
    return [cd, lb, t];
  });
  withP(s, badge, 'zoom');
  t3N.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 500 }));
  s.addNotes('Trạm 3: quan sát thí nghiệm thuỷ phân chất béo trong môi trường kiềm, thảo luận hoàn thành PHT số 4.');

  // ---------- 23–24. MORPH SHOWCASE: XÀ PHÒNG HOÁ ----------
  const reactSlide = (state) => {
    const s = newSlide('CONTENT_DARK', SEC.fat);
    bubbles(s, true);
    kicker(s, state === 'A' ? 'TRẠM 3 · CÂU 1' : 'PHẢN ỨNG ĐẶC TRƯNG CỦA CHẤT BÉO', true);
    title(s, state === 'A' ? 'Đun nóng chất béo với dung dịch NaOH' : 'Phản ứng xà phòng hoá');
    const rows = [1.95, 3.1, 4.25];
    const G = state === 'A' ? 4.35 : 8.2;   // glycerol backbone x
    const R = state === 'A' ? 1.75 : 0.75;  // RCOO x
    rows.forEach((y, i) => {
      tx(s, 'R–COO', R, y, 2.4, 0.85, { size: 22, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent1, r: 0.42, name: '!!r' + i, nosub: true });
      tx(s, ['CH2', 'CH', 'CH2'][i], G, y, 1.3, 0.85, { size: 22, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent2, r: 0.16, name: '!!g' + i });
      const na = state === 'A' ? [7.15, y] : [R + 2.5, y];
      const oh = state === 'A' ? [8.05, y] : [G + 1.4, y];
      tx(s, 'Na', na[0], na[1] + 0.07, 0.85, 0.7, { size: 20, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.OVAL, fill: C.accent3, name: '!!na' + i });
      tx(s, 'OH', oh[0], oh[1] + 0.07, 0.95, 0.7, { size: 20, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.OVAL, fill: C.accent5, name: '!!oh' + i });
    });
    line(s, G + 0.65, 2.8, G + 0.65, 3.1, { color: C.accent2, width: 4, name: '!!gl1' });
    line(s, G + 0.65, 3.95, G + 0.65, 4.25, { color: C.accent2, width: 4, name: '!!gl2' });
    if (state === 'A') {
      tx(s, 'Chất béo (RCOO)3C3H5', 1.75, 1.45, 4.0, 0.45, { size: 16, bold: true, color: C.accent6, margin: 0, name: '!!lblA' });
      tx(s, '+', 6.15, 3.1, 0.8, 0.85, { size: 36, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0 });
      tx(s, '3 NaOH', 7.15, 1.45, 2.0, 0.45, { size: 16, bold: true, color: C.accent6, margin: 0, name: '!!lblB' });
      const ar = line(s, 9.45, 3.52, 10.65, 3.52, { color: C.accent1, width: 3, arrow: true, name: '!!arr' });
      const tt = tx(s, 't°', 9.55, 2.9, 1.0, 0.5, { size: 20, bold: true, color: C.accent1, align: 'center', margin: 0, nosub: true });
      const qm = tx(s, '?', 10.85, 2.6, 1.6, 1.8, { size: 96, bold: true, font: 'Cambria', color: C.accent1, align: 'center', valign: 'middle', margin: 0 });
      const hint = tx(s, 'Liên kết ester bị cắt: gốc R–COO kết hợp với Na, gốc C3H5 kết hợp với OH. Sản phẩm là gì?', 0.6, 5.45, 12.1, 0.9, { size: 18, color: C.accent6, italic: true, margin: 0 });
      click(s, [ar, tt], 'wipeL'); after(s, qm, 'zoom'); click(s, hint, 'fade');
      s.addNotes('Mô hình: chất béo gồm 3 gốc R–COO gắn với khung C3H5 (glycerol). Khi đun với NaOH, liên kết ester bị cắt. Chuyển slide để xem Morph tạo sản phẩm.');
    } else {
      const l1 = tx(s, '3 RCOONa', 0.75, 1.45, 3.6, 0.45, { size: 16, bold: true, color: C.accent6, margin: 0, name: '!!lblA' });
      tx(s, '+', 6.2, 3.1, 0.8, 0.85, { size: 36, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0 });
      const l2 = tx(s, 'C3H5(OH)3', 8.2, 1.45, 3.0, 0.45, { size: 16, bold: true, color: C.accent6, margin: 0, name: '!!lblB' });
      const sp1 = tx(s, 'Muối natri của acid béo\n→ thành phần chính của XÀ PHÒNG', 0.75, 5.2, 4.5, 0.85, { size: 16, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent1, r: 0.16 });
      const sp2 = tx(s, 'Glycerol', 8.2, 5.2, 2.35, 0.85, { size: 16, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent2, r: 0.16 });
      const eq = tx(s, '(RCOO)3C3H5 + 3NaOH  →  3RCOONa + C3H5(OH)3', 0.6, 6.2, 12.1, 0.65, { size: 24, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, font: 'Cambria' });
      after(s, [sp1, sp2], 'zoom', { delay: 300 }); click(s, eq, 'wipeL', { dur: 800 });
      s.addNotes('Morph: 3 gốc R–COO kết hợp Na tạo 3RCOONa (xà phòng); khung C3H5 nhận 3 nhóm OH tạo glycerol. Chốt PTHH tổng quát (điều kiện: đun nóng t°).');
    }
    return s;
  };
  reactSlide('A');
  reactSlide('B');

  // ---------- 25. CÂU 2: TRIPALMITIN ----------
  const eqn = (s, left, right, y, xa, size = 22, col = C.text1, o = {}) => {
    const a = tx(s, left, 0.6, y, xa - 1.4, 0.7, { size, align: 'right', valign: 'middle', margin: 0, color: col, font: 'Cambria', bold: o.bold });
    const ar = line(s, xa - 0.6, y + 0.43, xa + 0.6, y + 0.43, { color: o.arrowCol || C.accent2, width: 2.25, arrow: true });
    const t = tx(s, 't°', xa - 0.5, y - 0.12, 1.0, 0.45, { size: 16, align: 'center', margin: 0, color: o.arrowCol || C.accent2, nosub: true, bold: true });
    const b = tx(s, right, xa + 0.75, y, 12.7 - xa - 0.75, 0.7, { size, align: 'left', valign: 'middle', margin: 0, color: col, font: 'Cambria', bold: o.bold });
    return [a, ar, t, b];
  };
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 3 · CÂU 1 & CÂU 2');
  title(s, 'Viết phương trình xà phòng hoá');
  const g1 = box(s, 0.6, 1.7, 12.1, 1.9, { fill: C.text2, shadow: 'soft' });
  const g1l = tx(s, 'DẠNG TỔNG QUÁT', 0.9, 1.85, 4, 0.4, { size: 14, bold: true, cs: 3, color: C.accent1, margin: 0 });
  const e1 = eqn(s, '(RCOO)3C3H5 + 3NaOH', '3RCOONa + C3H5(OH)3', 2.5, 6.55, 26, C.background1, { arrowCol: C.accent1 });
  const g2 = box(s, 0.6, 3.9, 12.1, 2.85, { fill: C.background1, shadow: 'soft' });
  const g2l = tx(s, 'VÍ DỤ · TRIPALMITIN', 0.9, 4.05, 5, 0.4, { size: 14, bold: true, cs: 3, color: C.accent2, margin: 0 });
  const e2 = eqn(s, '(C15H31COO)3C3H5 + 3NaOH', '3C15H31COONa + C3H5(OH)3', 4.6, 6.55, 24);
  const pr = tx(s, 'Sản phẩm: ==C15H31COONa== (muối natri của acid béo – xà phòng) và ==C3H5(OH)3== (glycerol).', 0.9, 5.55, 11.5, 0.9, { size: 18, margin: 0 });
  withP(s, [g1, g1l], 'fade'); click(s, e1, 'wipeL', { dur: 700 });
  click(s, [g2, g2l], 'float'); click(s, e2, 'wipeL', { dur: 700 }); click(s, pr, 'fade');
  s.addNotes('Câu 1: PTHH tổng quát. Câu 2: tripalmitin + NaOH → C15H31COONa + C3H5(OH)3.');

  // ---------- 26. CÂU 3: CHẤT BÉO HỖN HỢP ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'TRẠM 3 · CÂU 3');
  title(s, 'Xà phòng hoá chất béo có gốc acid khác nhau');
  const sb = box(s, 0.6, 1.75, 5.6, 3.2, { fill: C.background1, shadow: 'soft' });
  const sN = struct3(s, 0.95, 2.25, ['C17H33COO', 'C17H35COO', 'C17H35COO'], 24, C.text1, { lw: 2.85 });
  const plus = tx(s, '+  3NaOH', 6.35, 2.95, 2.0, 0.8, { size: 26, bold: true, font: 'Cambria', align: 'left', valign: 'middle', margin: 0, color: C.text2 });
  const ar3 = line(s, 8.35, 3.35, 9.35, 3.35, { color: C.accent2, width: 3, arrow: true });
  const tt3 = tx(s, 't°', 8.35, 2.8, 1.0, 0.45, { size: 16, bold: true, align: 'center', margin: 0, color: C.accent2, nosub: true });
  const prods = ['C17H33COONa', '2C17H35COONa', 'C3H5(OH)3'];
  const pN = prods.map((p, i) => tx(s, (i ? '+ ' : '') + p, 9.55, 2.2 + i * 0.8, 3.2, 0.7, { size: 22, bold: true, font: 'Cambria', valign: 'middle', margin: 0, color: i === 2 ? C.accent2 : C.text2 }));
  const note = tx(s, '**Nhận xét:** mỗi gốc acid béo tạo một muối natri tương ứng. Chất béo có 1 gốc oleic và 2 gốc stearic → 1 phân tử C17H33COONa và 2 phân tử C17H35COONa, cùng glycerol.', 0.6, 5.25, 12.1, 1.3, { size: 18, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: { color: C.accent1, transparency: 82 }, r: 0.14, margin: 0.2 });
  withP(s, [sb, ...sN], 'fade'); after(s, plus, 'fade');
  click(s, [ar3, tt3], 'wipeL'); pN.forEach(p => after(s, p, 'float', { dur: 450 }));
  click(s, note, 'fade');
  s.addNotes('Câu 3: chất béo (C17H33COO)(C17H35COO)2C3H5 + 3NaOH → C17H33COONa + 2C17H35COONa + C3H5(OH)3.');

  // ---------- 27. CHỐT II.1 KHÁI NIỆM ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'CHỐT KIẾN THỨC · II. CHẤT BÉO');
  title(s, '1. Khái niệm chất béo');
  const dcard = box(s, 0.6, 1.7, 6.6, 5.05, { fill: C.text2, shadow: 'soft' });
  const dtxt = tx(s, 'Chất béo là các **triester** (ester chứa 3 nhóm –COO–) của **glycerol** và **acid béo**.', 0.95, 1.95, 5.95, 1.3, { size: 20, color: C.background1, margin: 0 });
  const dform = tx(s, '(RCOO)3C3H5', 0.95, 3.25, 5.95, 1.1, { size: 48, bold: true, font: 'Cambria', color: C.accent1, margin: 0, valign: 'middle' });
  const dnote = tx(s, 'R có thể giống nhau hoặc khác nhau.\nĐun chất béo với nước, có xúc tác acid hoặc enzyme lipase → glycerol + acid béo.', 0.95, 4.5, 5.95, 2.0, { size: 17, color: C.accent6, margin: 0, psa: 8 });
  const gc = box(s, 7.5, 1.7, 5.2, 2.45, { fill: C.background1, shadow: 'soft' });
  const gct = tx(s, 'Glycerol · C3H5(OH)3', 7.8, 1.85, 4.7, 0.45, { size: 18, bold: true, color: C.accent2, margin: 0 });
  const glyN = [];
  ['CH2', 'CH', 'CH2'].forEach((g, i) => {
    const x = 7.95 + i * 1.5;
    glyN.push(tx(s, g, x, 2.45, 1.1, 0.6, { size: 24, font: 'Cambria', align: 'center', valign: 'middle', margin: 0 }));
    glyN.push(line(s, x + 0.55, 3.05, x + 0.55, 3.3, { color: C.text1, width: 1.5 }));
    glyN.push(tx(s, 'OH', x, 3.3, 1.1, 0.6, { size: 24, font: 'Cambria', align: 'center', valign: 'middle', margin: 0 }));
    if (i < 2) glyN.push(line(s, x + 1.0, 2.75, x + 1.6, 2.75, { color: C.text1, width: 1.5 }));
  });
  const ac = box(s, 7.5, 4.4, 5.2, 2.35, { fill: C.background1, shadow: 'soft' });
  const act = tx(s, 'Acid béo · R–COOH', 7.8, 4.55, 4.7, 0.45, { size: 18, bold: true, color: C.accent2, margin: 0 });
  const acd = tx(s, 'Acid hữu cơ, mạch carbon dài, không phân nhánh. Gốc R thường gặp:', 7.8, 5.0, 4.7, 0.7, { size: 15, margin: 0 });
  const chips = ['C17H35–', 'C15H31–', 'C17H33–', 'C17H31–'].map((c, i) => tx(s, c, 7.8 + i * 1.18, 5.85, 1.08, 0.5, { size: 15, bold: true, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.25, margin: 0, color: C.text2 }));
  withP(s, [dcard, dtxt], 'fade'); after(s, dform, 'zoom'); after(s, dnote, 'fade');
  click(s, [gc, gct, ...glyN], 'float'); click(s, [ac, act, acd], 'float'); stagger(s, 'after', chips, 'zoom', 0, 250);
  s.addNotes('Chốt khái niệm chất béo, công thức glycerol và acid béo.');

  // ---------- 28. CHỐT II.2-3 TÍNH CHẤT ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'CHỐT KIẾN THỨC · II. CHẤT BÉO');
  title(s, '2. Tính chất vật lí  ·  3. Tính chất hoá học');
  const vl = box(s, 0.6, 1.7, 5.3, 5.05, { fill: C.background1, shadow: 'soft' });
  const vlt = tx(s, 'Tính chất vật lí', 0.95, 1.9, 4.6, 0.5, { size: 22, bold: true, font: 'Cambria', color: C.accent2, margin: 0 });
  const vlb = tx(s, '• Ở điều kiện thường: **thể rắn** (mỡ động vật, bơ) hoặc **thể lỏng** (dầu thực vật).\n• **Nhẹ hơn nước**, **không tan** trong nước.\n• **Tan** trong một số dung môi hữu cơ: xăng, chloroform, benzene…', 0.95, 2.55, 4.7, 4.0, { size: 18, margin: 0, psa: 12 });
  const hh = box(s, 6.2, 1.7, 6.5, 5.05, { fill: C.text2, shadow: 'soft' });
  const hht = tx(s, 'Tính chất hoá học', 6.55, 1.9, 5.8, 0.5, { size: 22, bold: true, font: 'Cambria', color: C.accent1, margin: 0 });
  const hhb = tx(s, 'Đun nóng chất béo với dung dịch NaOH (hoặc KOH) → **muối Na (hoặc K) của acid béo** và **glycerol**.', 6.55, 2.55, 5.85, 1.25, { size: 18, color: C.background1, margin: 0 });
  const hheq = tx(s, '(RCOO)3C3H5 + 3NaOH\n→ 3RCOONa + C3H5(OH)3', 6.55, 3.9, 5.85, 1.3, { size: 22, bold: true, font: 'Cambria', color: C.accent6, margin: 0, psa: 2 });
  const hhbad = tx(s, 'Phản ứng xà phòng hoá – phản ứng đặc trưng của chất béo', 6.55, 5.5, 5.85, 0.95, { size: 17, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent1, r: 0.16 });
  withP(s, [vl, vlt], 'fade'); after(s, vlb, 'fade');
  click(s, [hh, hht, hhb], 'float'); after(s, hheq, 'wipeL'); after(s, hhbad, 'zoom');
  s.addNotes('Chốt tính chất vật lí và tính chất hoá học (phản ứng xà phòng hoá) – HS ghi vở. Điều kiện phản ứng: đun nóng.');

  // ---------- 29. NHIỆM VỤ VỀ NHÀ: LÀM XÀ PHÒNG ----------
  s = newSlide('CONTENT', SEC.fat);
  bubbles(s);
  kicker(s, 'GIAO NHIỆM VỤ CHUẨN BỊ CHO TIẾT SAU');
  title(s, 'Dự án nhỏ: tự làm xà phòng từ dầu ăn');
  img(s, 'soap.png', 0.6, 1.7, 4.4, 4.89, { name: '!!side', alt: 'Làm xà phòng' });
  const tasks = [['FaUserFriends', 'Chia lớp thành 4 nhóm', 'Tìm hiểu qua sách, báo, Internet và thảo luận nhóm.'], ['FaRecycle', 'Ưu tiên dầu ăn đã qua sử dụng', 'Tái chế dầu thừa, giảm rác thải – lối sống xanh.'], ['FaFlask', 'Áp dụng phản ứng xà phòng hoá', 'Theo hướng dẫn của giáo viên ở Trạm 3.'], ['FaShieldAlt', 'An toàn là trên hết', 'Đeo găng tay, kính bảo hộ; làm dưới sự giám sát của người lớn.']];
  const tkN = tasks.map((t, i) => {
    const y = 1.7 + i * 1.25;
    const cd = box(s, 5.35, y, 7.35, 1.05, { fill: C.background1, shadow: 'soft' });
    const [d1, d2] = iconDot(s, t[0], HEX.green, 5.55, y + 0.15, 0.75);
    const a = tx(s, t[1], 6.5, y + 0.08, 6.0, 0.45, { size: 18, bold: true, color: C.text2, margin: 0 });
    const b = tx(s, t[2], 6.5, y + 0.52, 6.0, 0.45, { size: 15, margin: 0 });
    return [cd, d1, d2, a, b];
  });
  tkN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 450 }));
  s.addNotes('Giao nhiệm vụ: 4 nhóm áp dụng phản ứng xà phòng hoá tạo sản phẩm xà phòng, khuyến khích dùng dầu ăn đã qua sử dụng. Mang sản phẩm đến tiết sau.');

  // ---------- 30. SECTION ỨNG DỤNG ----------
  pres.addSection({ title: SEC.use });
  s = section('02', 'HOẠT ĐỘNG 2.3', 'Ứng dụng & sức khoẻ', 'Chất béo trong đời sống và cách dùng chất béo đúng cách để hạn chế béo phì', 'FaHandHoldingHeart', SEC.use);
  s.addNotes('Hoạt động 2.3 – Tìm hiểu ứng dụng của chất béo và sử dụng chất béo đúng cách để hạn chế béo phì.');

  // ---------- 31. TRƯNG BÀY ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, 'SẢN PHẨM CỦA CÁC NHÓM');
  title(s, 'Trưng bày xà phòng thủ công tại nhà');
  img(s, 'soap.png', 8.3, 1.65, 4.4, 4.89, { name: '!!side', alt: 'Xà phòng thủ công' });
  const intro31 = tx(s, 'Đại diện 4 tổ trưng bày, giới thiệu sản phẩm. Một nhóm báo cáo về:', 0.6, 1.7, 7.4, 0.8, { size: 19, margin: 0 });
  const rep = [['FaBox', 'Nguyên liệu'], ['FaBlender', 'Dụng cụ'], ['FaListOl', 'Quy trình điều chế'], ['FaSearch', 'Đặc điểm sản phẩm']];
  const repN = rep.map((r, i) => {
    const x = 0.6 + (i % 2) * 3.75, y = 2.75 + Math.floor(i / 2) * 1.95;
    const cd = box(s, x, y, 3.5, 1.7, { fill: i % 3 === 0 ? C.accent6 : { color: C.accent2, transparency: 85 }, shadow: 'soft' });
    const ic = icon(s, r[0], r[0] === 'FaListOl' || r[0] === 'FaSearch' ? HEX.green : HEX.dk, x + 0.3, y + 0.35, 0.7);
    const t = tx(s, r[1], x + 1.2, y + 0.2, 2.15, 1.3, { size: 19, bold: true, color: C.text2, valign: 'middle', margin: 0 });
    return [cd, ic, t];
  });
  withP(s, intro31, 'fade'); repN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'zoom', { dur: 400 }));
  s.addNotes('GV tổ chức cho đại diện 4 tổ trưng bày và giới thiệu sản phẩm xà phòng thủ công.');

  // ---------- 32. KIỂM TRA pH ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, 'ĐÁNH GIÁ TÍNH KIỀM CỦA SẢN PHẨM');
  title(s, 'Kiểm tra pH của xà phòng bằng giấy chỉ thị');
  img(s, 'ph.png', 0.6, 1.8, 5.6, 3.19, { alt: 'Thang pH' });
  tx(s, 'Thang pH: < 7 acid · = 7 trung tính · > 7 base', 0.6, 5.15, 5.6, 0.45, { size: 15, italic: true, align: 'center', margin: 0, color: C.accent2 });
  const ph = ['Lấy một lượng nhỏ xà phòng, hoà tan vào một ít nước sạch để tạo dung dịch thử.', 'Nhúng một đầu giấy pH vào dung dịch, hoặc dùng que sạch nhỏ một giọt lên giấy.', 'Quan sát sự đổi màu của giấy, đối chiếu bảng màu tiêu chuẩn để xác định pH.', 'Ghi lại kết quả đo, nhận xét tính acid – base của sản phẩm.'];
  const phN = ph.map((p, i) => {
    const y = 1.7 + i * 1.27;
    const c = circle(s, 6.6, y + 0.12, 0.75, { fill: i === 3 ? C.accent2 : C.text2 });
    const nn = tx(s, String(i + 1), 6.6, y + 0.12, 0.75, 0.75, { size: 20, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, font: 'Cambria' });
    const lb = tx(s, 'Bước ' + (i + 1), 7.55, y, 5.1, 0.4, { size: 15, bold: true, color: C.accent2, margin: 0, nosub: true });
    const t = tx(s, p, 7.55, y + 0.38, 5.15, 0.8, { size: 16, margin: 0 });
    return [c, nn, lb, t];
  });
  if (true) { line(s, 6.975, 2.6, 6.975, 5.8, { color: C.accent2, width: 1.5, dash: 'dash' }); }
  phN.forEach(g => click(s, g, 'float', { dur: 450 }));
  s.addNotes('Hướng dẫn HS dùng giấy chỉ thị pH kiểm tra độ pH của xà phòng theo 4 bước.');

  // ---------- 33. NHẬN XÉT pH ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, 'NHẬN XÉT KẾT QUẢ');
  title(s, 'Xà phòng có tính kiềm');
  const spec = ['E5302F', 'EE5A2A', 'F48A26', 'F8B421', 'F2D21B', 'B9D531', '7CC242', '3DAE4B', '22A38A', '1A93B8', '2C6FB6', '3F51A3', '58408F', '6B2F7E'];
  const segW = 12.1 / 14;
  const segN = spec.map((c, i) => tx(s, String(i + 1), 0.6 + i * segW, 2.55, segW - 0.04, 0.75, { size: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', shape: SH.RECTANGLE, fill: c, margin: 0, nosub: true }));
  tx(s, 'ACID', 0.6, 3.38, 2, 0.4, { size: 14, bold: true, color: C.accent4, margin: 0, cs: 2 });
  tx(s, 'TRUNG TÍNH', 0.6 + 6 * segW - 0.5, 3.38, segW + 1.0, 0.4, { size: 14, bold: true, color: C.accent2, margin: 0, cs: 2, align: 'center' });
  tx(s, 'BASE (KIỀM)', 10.2, 3.38, 2.5, 0.4, { size: 14, bold: true, color: C.accent5, margin: 0, cs: 2, align: 'right' });
  const brk = box(s, 0.6 + 7 * segW - 0.04, 1.95, 3 * segW + 0.04, 1.43, { line: { color: C.text2, width: 3 }, r: 0.12 });
  const brkT = tx(s, 'Xà phòng: pH 8 – 10', 0.6 + 7 * segW - 0.3, 1.72, 3 * segW + 0.6, 0.45, { size: 17, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.text2, r: 0.2, margin: 0 });
  const tk = [
    ['FaFlask', HEX.green, 'Tạo thành từ phản ứng xà phòng hoá giữa chất béo và kiềm (NaOH/KOH) → sản phẩm thường có **tính kiềm, pH > 7**.'],
    ['FaVials', HEX.green, 'Xà phòng thành phẩm thường có **pH khoảng 8 – 10**, có thể thay đổi tuỳ nguyên liệu và quy trình điều chế.'],
    ['FaExclamationTriangle', HEX.coral, '**pH quá cao** → có thể còn dư kiềm, gây kích ứng da. Không nên chỉ dựa vào pH để kết luận xà phòng an toàn.'],
  ];
  const tkN2 = tk.map((t, i) => {
    const x = 0.6 + i * 4.1;
    const cd = box(s, x, 4.05, 3.9, 2.7, { fill: i === 2 ? { color: C.accent4, transparency: 88 } : C.background1, shadow: 'soft' });
    const ic = icon(s, t[0], t[1], x + 0.3, 4.3, 0.6);
    const b = tx(s, t[2], x + 0.3, 5.0, 3.35, 1.65, { size: 16, margin: 0 });
    return [cd, ic, b];
  });
  stagger(s, 'with', segN, 'fade', 0, 120);
  click(s, [brk, brkT], 'zoom');
  tkN2.forEach(g => click(s, g, 'float', { dur: 450 }));
  s.addNotes('GV hướng dẫn HS nhận xét kết quả đo pH.');

  // ---------- 34. NHIỆM VỤ 4 NHÓM ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, 'THUYẾT TRÌNH · CHUẨN BỊ Ở NHÀ');
  title(s, 'Nhiệm vụ của 4 nhóm');
  const grp = [
    ['Nhóm 1', 'Kể tên thực phẩm chứa chất béo trong bữa ăn hằng ngày. Chất béo có vai trò gì với cơ thể người? Dùng thế nào để có lợi cho sức khoẻ?', C.accent1],
    ['Nhóm 2', 'Chất béo được dùng thế nào trong đời sống, sản xuất? Liệt kê thêm sản phẩm chế biến từ chất béo. Cách lựa chọn, sử dụng chất béo phù hợp.', C.accent2],
    ['Nhóm 3', 'Liệt kê 3 sản phẩm có chứa chất béo (thực phẩm, mĩ phẩm, dược phẩm…). Giải thích vì sao chất béo có trong thành phần các sản phẩm đó.', C.accent3],
    ['Nhóm 4', 'Để có lợi cho sức khoẻ, tránh béo phì, cần chú ý những gì khi sử dụng chất béo trong khẩu phần ăn hằng ngày?', C.accent4],
  ];
  const grN = grp.map((g, i) => {
    const x = 0.6 + (i % 2) * 6.2, y = 1.7 + Math.floor(i / 2) * 2.6;
    const cd = box(s, x, y, 5.9, 2.35, { fill: C.background1, shadow: 'soft' });
    const lb = tx(s, g[0], x + 0.3, y + 0.25, 1.6, 0.5, { size: 17, bold: true, color: i === 0 ? C.text2 : C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: g[2], r: 0.25, margin: 0, nosub: true });
    const t = tx(s, g[1], x + 0.3, y + 0.9, 5.35, 1.35, { size: 16, margin: 0 });
    return [cd, lb, t];
  });
  grN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 450 }));
  s.addNotes('Các nhóm chuẩn bị ở nhà, thuyết trình; nhóm khác nhận xét; GV chốt kiến thức.');

  // ---------- 35. ĐỌC NHÃN ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, 'KĨ NĂNG SỐNG');
  title(s, 'Đọc thông tin chất béo trên bao bì');
  const im1 = img(s, 'lbl_meizan.jpg', 0.6, 1.65, 5.0, 3.52, { alt: 'Nhãn dầu thực vật' });
  const im2 = img(s, 'lbl_oreo.jpg', 6.0, 1.65, 5.81, 3.52, { alt: 'Nhãn thông tin dinh dưỡng' });
  const lb3 = [
    ['Total Fat / Chất béo', 'Tổng lượng chất béo trong một khẩu phần.'],
    ['Saturated · Trans Fat', 'Chất béo bão hoà, chất béo chuyển hoá – nên hạn chế.'],
    ['% Daily Value', 'Phần trăm so với nhu cầu khuyến nghị cả ngày. Ví dụ: 7,9 g chất béo ≈ 12%.'],
  ];
  const lbN = lb3.map((l, i) => {
    const x = 0.6 + i * 4.1;
    return [tx(s, '**' + l[0] + '**\n' + l[1], x, 5.4, 3.9, 1.35, { size: 15, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: { color: C.accent1, transparency: 80 }, r: 0.14, margin: 0.15, nosub: true })];
  });
  withP(s, im1, 'float'); after(s, im2, 'float');
  lbN.forEach(g => click(s, g, 'float', { dur: 450 }));
  s.addNotes('GV hướng dẫn HS đọc thông tin chất béo trên bao bì hộp bánh và chai dầu ăn, ý nghĩa các con số.');

  // ---------- 36. ỨNG DỤNG ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, '4. ỨNG DỤNG');
  title(s, 'Chất béo có mặt khắp nơi');
  const heroI = img(s, 'hero.png', 0.6, 1.7, 5.4, 3.6, { name: '!!hero', alt: 'Thực phẩm giàu chất béo' });
  const heroT = tx(s, '**Thực phẩm**\nThực phẩm thiết yếu: dầu thực vật (hướng dương, đậu nành, lạc…), mỡ động vật (lợn, bò, cá…), bơ, các loại hạt (lạc, vừng, hạnh nhân, óc chó…).', 0.6, 5.45, 5.4, 1.3, { size: 15, margin: 0 });
  const uses = [
    ['FaSpa', 'Mĩ phẩm', 'Chất làm mềm, dưỡng ẩm. Kem dưỡng da chứa ceramide giúp phục hồi hàng rào bảo vệ da.', C.accent6],
    ['FaPills', 'Dược phẩm', 'Giúp hấp thụ các hoạt chất dược phẩm một cách hiệu quả.', { color: C.accent3, transparency: 78 }],
    ['FaGasPump', 'Nhiên liệu', 'Diesel sinh học từ dầu thực vật, mỡ động vật, dầu ăn thải.', { color: C.accent2, transparency: 80 }],
    ['FaPumpSoap', 'Xà phòng', 'Nguyên liệu sản xuất xà phòng nhờ phản ứng xà phòng hoá.', { color: C.accent5, transparency: 82 }],
  ];
  const usN = uses.map((u, i) => {
    const x = 6.3 + (i % 2) * 3.25, y = 1.7 + Math.floor(i / 2) * 2.6;
    const cd = box(s, x, y, 3.05, 2.4, { fill: u[3], shadow: 'soft' });
    const ic = icon(s, u[0], HEX.dk, x + 0.25, y + 0.25, 0.6);
    const hd = tx(s, u[1], x + 1.0, y + 0.25, 1.9, 0.6, { size: 19, bold: true, color: C.text2, valign: 'middle', margin: 0 });
    const bd = tx(s, u[2], x + 0.25, y + 0.95, 2.6, 1.4, { size: 14, margin: 0 });
    return [cd, ic, hd, bd];
  });
  withP(s, heroI, 'fade'); click(s, heroT, 'fade');
  usN.forEach(g => click(s, g, 'zoom', { dur: 400 }));
  s.addNotes('Chốt: chất béo có nhiều ứng dụng trong công nghiệp thực phẩm, mĩ phẩm, dược phẩm, làm nhiên liệu, sản xuất xà phòng.');

  // ---------- 37. CẦN NHƯNG VỪA ĐỦ ----------
  s = newSlide('CONTENT_DARK', SEC.use);
  bubbles(s, true);
  kicker(s, 'NHU CẦU CHẤT BÉO', true);
  title(s, 'Cần thiết – nhưng vừa phải');
  const big = tx(s, '20–25%', 0.6, 1.8, 6.4, 1.9, { size: 110, bold: true, font: 'Cambria', color: C.accent1, margin: 0, valign: 'middle', nosub: true });
  const bigT = tx(s, 'nhu cầu năng lượng hằng ngày là mức chất béo nên chiếm trong khẩu phần.', 0.6, 3.75, 6.0, 1.0, { size: 20, color: C.background1, margin: 0 });
  const fac = [['FaChild', 'Lứa tuổi'], ['FaVenusMars', 'Giới tính'], ['FaBriefcase', 'Đặc thù nghề nghiệp']];
  const facT = tx(s, 'Lượng chất béo cần thiết phù hợp với:', 7.3, 1.85, 5.4, 0.5, { size: 18, bold: true, color: C.accent6, margin: 0 });
  const faN = fac.map((f, i) => {
    const y = 2.5 + i * 1.15;
    const cd = box(s, 7.3, y, 5.4, 0.95, { fill: { color: C.background1, transparency: 88 }, line: { color: C.accent1, width: 1 }, r: 0.47 });
    const [d1, d2] = iconDot(s, f[0], HEX.dk, 7.42, y + 0.1, 0.75, { fill: C.accent1 });
    const t = tx(s, f[1], 8.4, y, 4.1, 0.95, { size: 20, bold: true, color: C.background1, valign: 'middle', margin: 0 });
    return [cd, d1, d2, t];
  });
  const bal = tx(s, 'Cân đối giữa chất béo nguồn gốc **động vật** và **thực vật**.', 0.6, 6.0, 12.1, 0.75, { size: 20, color: C.text2, valign: 'middle', align: 'center', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.2 });
  withP(s, big, 'zoom', { dur: 700 }); after(s, bigT, 'fade');
  click(s, facT, 'fade'); faN.forEach(g => after(s, g, 'float', { dur: 400 }));
  click(s, bal, 'float');
  s.addNotes('Chất béo là nguồn thiết yếu nhưng nhu cầu vừa phải, chỉ nên chiếm 20–25% nhu cầu năng lượng; mỗi độ tuổi có nhu cầu khác nhau.');

  // ---------- 38. BÉO PHÌ ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, '5. SỬ DỤNG CHẤT BÉO ĐÚNG CÁCH ĐỂ HẠN CHẾ BÉO PHÌ');
  title(s, 'Béo phì – khi mỡ tích tụ quá mức');
  const bp = box(s, 0.6, 1.75, 5.2, 5.0, { fill: { color: C.accent4, transparency: 86 }, shadow: 'soft' });
  const bpi = icon(s, 'FaWeight', HEX.coral, 0.95, 2.05, 1.1);
  const bpt = tx(s, '**Béo phì** là tình trạng tích tụ mỡ quá mức trong cơ thể.', 0.95, 3.35, 4.6, 1.2, { size: 20, margin: 0 });
  const bpc = tx(s, 'Một nguyên nhân: chế độ ăn uống có **quá nhiều chất béo**.', 0.95, 4.75, 4.6, 1.2, { size: 18, margin: 0, color: C.text1 });
  const dis = ['Tim mạch', 'Đột quỵ', 'Đái tháo đường', 'Thoái hoá khớp', 'Gan nhiễm mỡ', 'Máu nhiễm mỡ', 'Ung thư'];
  const disT = tx(s, 'Béo phì có thể gây ra nhiều bệnh:', 6.2, 1.8, 6.5, 0.5, { size: 19, bold: true, color: C.text2, margin: 0 });
  const dN = dis.map((d, i) => {
    const x = 6.2 + (i % 2) * 3.3, y = 2.5 + Math.floor(i / 2) * 1.07;
    const cd = tx(s, d, x, y, 3.1, 0.85, { size: 18, bold: true, color: C.text2, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.background1, shadow: 'soft', r: 0.42, margin: 0.25 });
    const ic = icon(s, 'FaHeartbeat', HEX.coral, x + 2.5, y + 0.22, 0.4);
    return [cd, ic];
  });
  withP(s, [bp, bpi, bpt], 'fade'); after(s, bpc, 'fade');
  click(s, disT, 'fade'); dN.forEach(g => after(s, g, 'zoom', { dur: 280 }));
  s.addNotes('Béo phì có thể gây ra các vấn đề nghiêm trọng về sức khoẻ: tim mạch, đột quỵ, đái tháo đường, thoái hoá khớp, gan nhiễm mỡ, máu nhiễm mỡ, ung thư…');

  // ---------- 39. NÊN / HẠN CHẾ ----------
  s = newSlide('CONTENT', SEC.use);
  bubbles(s);
  kicker(s, '5. SỬ DỤNG CHẤT BÉO ĐÚNG CÁCH');
  title(s, 'Ăn uống thông minh với chất béo');
  const colY = 1.7, colH = 5.05;
  const L1 = box(s, 0.6, colY, 5.95, colH, { fill: C.background1, shadow: 'soft' });
  const L1h = tx(s, 'NÊN ƯU TIÊN', 0.6, colY, 5.95, 0.8, { size: 20, bold: true, cs: 2, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent2, r: 0.16 });
  const goodL = [['FaSeedling', 'Chất béo có nguồn gốc thực vật'], ['FaFish', 'Chất béo giàu omega-3 (cá, hải sản)'], ['FaBalanceScale', 'Đủ lượng theo lứa tuổi, giới tính, nghề nghiệp; cân đối động vật – thực vật'], ['FaRunning', 'Vận động, thể dục thể thao phù hợp']];
  const gN = goodL.map((g, i) => {
    const y = colY + 1.05 + i * 0.98;
    return [icon(s, g[0], HEX.green, 0.95, y + 0.08, 0.5), tx(s, g[1], 1.65, y, 4.7, 0.9, { size: 17, valign: 'middle', margin: 0 })];
  });
  const R1 = box(s, 6.75, colY, 5.95, colH, { fill: C.background1, shadow: 'soft' });
  const R1h = tx(s, 'NÊN HẠN CHẾ', 6.75, colY, 5.95, 0.8, { size: 20, bold: true, cs: 2, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent4, r: 0.16 });
  const badL = [['FaBan', 'Chất béo nguồn gốc động vật (mỡ lợn, mỡ bò…)'], ['FaBan', 'Các loại bơ nhân tạo'], ['FaFire', 'Thức ăn có chất béo đã qua chế biến ở nhiệt độ cao'], ['FaHamburger', 'Thức ăn nhanh, đồ chiên, nướng…']];
  const bN = badL.map((g, i) => {
    const y = colY + 1.05 + i * 0.98;
    return [icon(s, g[0], HEX.coral, 7.1, y + 0.08, 0.5), tx(s, g[1], 7.8, y, 4.7, 0.9, { size: 17, valign: 'middle', margin: 0 })];
  });
  click(s, [L1, L1h], 'float'); gN.forEach(g => after(s, g, 'fade', { dur: 300 }));
  click(s, [R1, R1h], 'float'); bN.forEach(g => after(s, g, 'fade', { dur: 300 }));
  s.addNotes('Để có lợi cho sức khoẻ: đảm bảo lượng chất béo phù hợp, cân đối nguồn gốc động vật – thực vật; ưu tiên chất béo thực vật, omega-3; hạn chế mỡ động vật, bơ nhân tạo, đồ chiên nướng; vận động phù hợp.');

  // ---------- 40. SECTION 03 ----------
  pres.addSection({ title: SEC.prac });
  s = section('03', 'HOẠT ĐỘNG 3', 'Luyện tập', 'Làm việc cá nhân · 8 câu hỏi · Bấm vào đáp án để kiểm tra', 'FaPuzzlePiece', SEC.prac);
  s.addNotes('Hoạt động 3 – Luyện tập: HS làm việc cá nhân. Ở các câu trắc nghiệm, bấm trực tiếp vào phương án để kiểm tra đúng/sai.');

  // ---------- 41–45. MCQ ----------
  const mcq = [
    ['Công thức chung của chất béo là', ['RCOOH', 'C3H5(OH)3', '(RCOO)3C3H5', 'RCOONa'], 2],
    ['Trường hợp nào sau đây chứa thành phần chính là chất béo?', ['Trứng gà', 'Tóc', 'Dầu ô liu', 'Dầu hoả'], 2],
    ['Thuỷ phân chất béo trong môi trường kiềm thu được', ['glycerol và muối của một acid béo', 'glycerol và acid béo', 'glycerol và xà phòng', 'glycerol và muối của các acid béo'], 3],
    ['Phản ứng thuỷ phân chất béo trong môi trường kiềm còn gọi là phản ứng', ['thuỷ phân hoá', 'xà phòng hoá', 'ester hoá', 'hydrogen hoá'], 1],
    ['Chất nào sau đây không phải là chất béo?', ['(C17H35COO)3C3H5', '(C15H31COO)3C3H5', '(C17H33COO)3C3H5', '(CH3COO)3C3H5'], 3],
  ];
  mcq.forEach((q, qi) => {
    const s = newSlide('CONTENT', SEC.prac);
    bubbles(s);
    kicker(s, 'TRẮC NGHIỆM · CÂU ' + (qi + 1) + '/8');
    title(s, 'Câu hỏi ' + (qi + 1));
    const qc = tx(s, q[0] + (q[0].endsWith('?') ? '' : '…'), 0.6, 1.65, 12.1, 1.25, { size: 24, bold: true, color: C.background1, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.text2, r: 0.18, margin: 0.3, font: 'Cambria', name: '!!qcard' });
    const LET = ['A', 'B', 'C', 'D'];
    q[1].forEach((opt, i) => {
      const x = 0.6 + (i % 2) * 6.2, y = 3.15 + Math.floor(i / 2) * 1.6;
      const oc = s.addText([{ text: LET[i] + '.   ', options: { bold: true, color: C.accent2 } }, ...runs(opt)], { x, y, w: 5.9, h: 1.3, objectName: 'opt' + i, shape: SH.ROUNDED_RECTANGLE, rectRadius: 0.18, fill: { color: C.background1 }, line: { color: C.accent2, width: 1.25 }, shadow: L.shadow('soft'), fontFace: 'Calibri', fontSize: 22, color: C.text1, valign: 'middle', margin: 22 });
      if (i === q[2]) {
        const hl = box(s, x - 0.05, y - 0.05, 6.0, 1.4, { fill: { color: C.accent2, transparency: 80 }, line: { color: C.accent2, width: 4 }, r: 0.2, name: 'okhl' });
        const bd = tx(s, '✓  Chính xác!', x + 3.75, y - 0.3, 2.05, 0.5, { size: 16, bold: true, color: C.background1, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent2, r: 0.25, margin: 0, name: 'okbadge', nosub: true });
        trig(s, 'opt' + i, [{ names: hl, eff: 'zoom', dur: 400 }, { names: bd, eff: 'zoom', start: 'after', dur: 350 }]);
      } else {
        trig(s, 'opt' + i, [{ names: 'opt' + i, eff: 'teeter', dur: 1000 }]);
      }
    });
    tx(s, 'Bấm vào phương án để kiểm tra · Phương án đúng sẽ sáng xanh, phương án sai sẽ rung lắc', 0.6, 6.4, 12.1, 0.4, { size: 14, italic: true, color: C.accent2, margin: 0, align: 'center' });
    s.addNotes('Đáp án: ' + LET[q[2]] + '. Bấm vào từng phương án để kiểm tra (đúng: sáng xanh + “Chính xác!”, sai: rung lắc).');
  });

  // ---------- 46. CÂU 6 ----------
  s = newSlide('CONTENT', SEC.prac);
  bubbles(s);
  kicker(s, 'ĐIỀN TỪ · CÂU 6/8');
  title(s, 'Câu hỏi 6');
  tx(s, 'Điền từ thích hợp vào chỗ trống:', 0.6, 1.65, 12.1, 1.25, { size: 24, bold: true, color: C.background1, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.text2, r: 0.18, margin: 0.3, font: 'Cambria', name: '!!qcard' });
  tx(s, '“Dầu ăn là hỗn hợp nhiều …(1)… của …(2)… và các acid béo.”', 0.6, 3.2, 12.1, 1.1, { size: 30, italic: true, font: 'Cambria', align: 'center', valign: 'middle', margin: 0, color: C.text2, nosub: true });
  const fb = [['(1)', 'ester'], ['(2)', 'glycerol']].map((f, i) => {
    const x = 2.2 + i * 4.8;
    return [tx(s, f[0] + '  ' + f[1], x, 4.75, 4.1, 1.2, { size: 30, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.2, shadow: 'soft', nosub: true })];
  });
  fb.forEach(g => click(s, g, 'zoom'));
  s.addNotes('Đáp án: Dầu ăn là hỗn hợp nhiều ester của glycerol và các acid béo.');

  // ---------- 47. CÂU 7 ----------
  s = newSlide('CONTENT', SEC.prac);
  bubbles(s);
  kicker(s, 'CHỌN NHIỀU ĐÁP ÁN · CÂU 7/8');
  title(s, 'Câu hỏi 7');
  tx(s, 'Chọn những phương pháp có thể làm sạch vết dầu ăn dính vào quần áo và giải thích.', 0.6, 1.65, 12.1, 1.0, { size: 22, bold: true, color: C.background1, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.text2, r: 0.18, margin: 0.3, font: 'Cambria', name: '!!qcard' });
  const c7 = [['A', 'Giặt bằng nước', false, 'Nước không hoà tan được dầu ăn'], ['B', 'Giặt bằng xà phòng', true, 'Xà phòng hoà tan được dầu ăn'], ['C', 'Tẩy bằng cồn 90°', true, 'Cồn hoà tan được dầu ăn'], ['D', 'Tẩy bằng giấm', false, 'Giấm hoà tan được dầu ăn nhưng làm hỏng quần áo'], ['E', 'Tẩy bằng xăng', true, 'Xăng hoà tan được dầu ăn']];
  c7.forEach((c, i) => {
    const y = 2.85 + i * 0.8;
    s.addText([{ text: c[0] + '.   ', options: { bold: true, color: C.accent2 } }, { text: c[1], options: {} }], { x: 0.6, y, w: 4.9, h: 0.65, objectName: 'opt' + i, shape: SH.ROUNDED_RECTANGLE, rectRadius: 0.16, fill: { color: C.background1 }, line: { color: C.accent2, width: 1.25 }, shadow: L.shadow(), fontFace: 'Calibri', fontSize: 20, color: C.text1, valign: 'middle', margin: 18 });
    const fbk = tx(s, (c[2] ? '✓  ' : '✗  ') + c[3], 5.75, y, 6.95, 0.65, { size: 18, bold: true, color: c[2] ? C.background1 : C.text2, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: c[2] ? C.accent2 : { color: C.accent4, transparency: 75 }, r: 0.16, margin: 0.25, nosub: true });
    const steps = [{ names: fbk, eff: c[2] ? 'zoom' : 'wipeL', dur: 400 }];
    if (!c[2]) steps.push({ names: 'opt' + i, eff: 'teeter', start: 'with', dur: 1000 });
    trig(s, 'opt' + i, steps);
  });
  s.addNotes('Đáp án: B, C, E vì xà phòng, cồn 90°, xăng hoà tan được dầu ăn. Nước không hoà tan được dầu ăn; giấm hoà tan được dầu ăn nhưng làm hỏng quần áo. Bấm từng phương án để hiện giải thích.');

  // ---------- 48. CÂU 8 ----------
  s = newSlide('CONTENT', SEC.prac);
  bubbles(s);
  kicker(s, 'TỰ LUẬN · CÂU 8/8');
  title(s, 'Câu hỏi 8');
  tx(s, 'Vì sao cần đảm bảo đủ lượng lipid cho cơ thể?', 0.6, 1.65, 12.1, 1.0, { size: 24, bold: true, color: C.background1, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.text2, r: 0.18, margin: 0.3, font: 'Cambria', name: '!!qcard' });
  const r8 = [['FaShieldAlt', 'Tham gia cấu tạo màng tế bào'], ['FaBolt', 'Cung cấp năng lượng'], ['FaThermometerHalf', 'Giúp ổn định thân nhiệt'], ['FaBrain', 'Tăng hoạt động trí não'], ['FaTint', 'Hoà tan vitamin A, D, E… giúp cơ thể hấp thụ']];
  const r8N = r8.map((r, i) => {
    const x = 0.6 + i * 2.46;
    const cd = box(s, x, 3.0, 2.26, 3.1, { fill: C.background1, shadow: 'soft' });
    const [d1, d2] = iconDot(s, r[0], HEX.green, x + 0.58, 3.3, 1.1, { tr: 80 });
    const t = tx(s, r[1], x + 0.15, 4.6, 1.96, 1.4, { size: 17, bold: true, align: 'center', margin: 0, color: C.text2 });
    return [cd, d1, d2, t];
  });
  const r8c = tx(s, '→ Cần đảm bảo đủ lượng lipid cho cơ thể.', 0.6, 6.3, 12.1, 0.5, { size: 18, bold: true, italic: true, color: C.accent2, align: 'center', margin: 0 });
  r8N.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 400 }));
  click(s, r8c, 'fade');
  s.addNotes('Lipid giữ vai trò quan trọng: tham gia cấu tạo màng tế bào, cung cấp năng lượng, ổn định thân nhiệt, tăng hoạt động trí não; hoà tan vitamin A, D, E… giúp cơ thể hấp thụ.');

  // ---------- 49. SECTION 04 ----------
  pres.addSection({ title: SEC.app });
  s = section('04', 'HOẠT ĐỘNG 4', 'Vận dụng', 'Chất béo trong cuộc sống quanh em', 'FaLightbulb', SEC.app);
  s.addNotes('Hoạt động 4 – Vận dụng: HS làm bài tập ở nhà, nộp vào tiết sau.');

  // ---------- 50. VẬN DỤNG 1 ----------
  s = newSlide('CONTENT', SEC.app);
  bubbles(s);
  kicker(s, 'VẬN DỤNG · CÂU 1');
  title(s, 'Một tháng em cần bao nhiêu chất béo?');
  const v1 = tx(s, 'Theo khuyến nghị, độ tuổi **15 – 19**, nhu cầu chất béo hằng ngày:\n• Nam: **63 – 94 g**\n• Nữ: **53 – 79 g**\nHãy tính tổng lượng chất béo cần thiết cho bản thân trong **một tháng (30 ngày)**.', 0.6, 1.7, 4.9, 5.0, { size: 19, margin: 0, psa: 10 });
  const sex = [['NAM', 'FaMale', HEX.teal, C.accent3, '63 × 30 = 1 890 g', '94 × 30 = 2 820 g', '1 890 – 2 820 g'], ['NỮ', 'FaFemale', HEX.coral, C.accent4, '53 × 30 = 1 590 g', '79 × 30 = 2 370 g', '1 590 – 2 370 g']];
  sex.forEach((x, i) => {
    const y = 1.7 + i * 2.6;
    const cd = box(s, 5.8, y, 6.9, 2.35, { fill: C.background1, shadow: 'soft' });
    const [d1, d2] = iconDot(s, x[1], x[2], 6.05, y + 0.6, 1.1, { tint: x[3], tr: 82 });
    const hd = tx(s, x[0], 6.05, y + 1.75, 1.1, 0.4, { size: 15, bold: true, align: 'center', margin: 0, color: C.text2, cs: 2 });
    const c1 = tx(s, 'Tối thiểu: ' + x[4] + '\nTối đa: ' + x[5], 7.45, y + 0.2, 5.1, 1.0, { size: 18, margin: 0, nosub: true, psa: 2 });
    const res = tx(s, x[6] + ' / tháng', 7.45, y + 1.3, 5.0, 0.8, { size: 26, bold: true, font: 'Cambria', color: C.text2, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent6, r: 0.2, margin: 0.2, nosub: true });
    click(s, [cd, d1, d2, hd], 'float'); after(s, c1, 'fade'); after(s, res, 'zoom');
  });
  withP(s, v1, 'fade');
  s.addNotes('Nam: 1890–2820 g/tháng; Nữ: 1590–2370 g/tháng.');

  // ---------- 51. VẬN DỤNG 2 ----------
  s = newSlide('CONTENT_DARK', SEC.app);
  bubbles(s, true);
  kicker(s, 'VẬN DỤNG · CÂU 2', true);
  title(s, 'Vì sao thịt mỡ thường ăn kèm dưa hành?');
  const qi2 = icon(s, 'FaQuoteLeft', HEX.gold, 0.6, 1.75, 0.8);
  const poem = tx(s, 'Thịt mỡ, dưa hành, câu đối đỏ\nCây nêu, tràng pháo, bánh chưng xanh.', 1.6, 1.75, 11.0, 1.7, { size: 32, italic: true, font: 'Cambria', color: C.accent6, margin: 0, psa: 6 });
  const ans2 = tx(s, 'Trong dưa hành có một lượng nhỏ **acid**, tạo môi trường **thuỷ phân chất béo** có trong thịt mỡ. Khi đó lượng chất béo trong thịt mỡ giảm đi, ==không gây cảm giác ngán==.', 0.6, 4.0, 12.1, 1.9, { size: 22, color: C.text2, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.background1, r: 0.2, margin: 0.35, shadow: 'dark' });
  withP(s, [qi2, poem], 'fade', { dur: 900 }); click(s, ans2, 'float', { dur: 700 });
  s.addNotes('Giải thích: dưa hành có lượng nhỏ acid tạo môi trường thuỷ phân chất béo trong thịt mỡ, giảm lượng chất béo, không gây ngán.');

  // ---------- 52. VẬN DỤNG 3 – NGUYÊN LIỆU ----------
  s = newSlide('CONTENT', SEC.app);
  bubbles(s);
  kicker(s, 'VẬN DỤNG · CÂU 3a');
  title(s, 'Tái chế dầu ăn thừa thành xà phòng: nguyên liệu');
  img(s, 'soap.png', 9.1, 1.7, 3.6, 4.0, { name: '!!side', alt: 'Làm xà phòng' });
  tx(s, 'Lan toả lối sống xanh', 9.1, 5.85, 3.6, 0.45, { size: 15, italic: true, align: 'center', color: C.accent2, margin: 0 });
  const ing = [['1 kg', 'Dầu ăn thừa', 'Đã lọc bỏ cặn, tạp chất. Có thể dùng 70% dầu thừa + 30% dầu dừa để tẩy rửa tốt hơn.'], ['200 g', 'NaOH', 'Chất kiềm cho phản ứng xà phòng hoá.'], ['400 g', 'Nước cất', 'Hoặc nước tinh khiết, nước chưng cất từ thảo mộc.'], ['5 mL', 'Tinh dầu', 'Sả, chanh, bạc hà (nếu có) – tạo mùi thơm, át mùi dầu cũ.']];
  const ingN = ing.map((g, i) => {
    const x = 0.6 + (i % 2) * 4.2, y = 1.7 + Math.floor(i / 2) * 2.55;
    const cd = box(s, x, y, 4.0, 2.35, { fill: C.background1, shadow: 'soft' });
    const nb = tx(s, g[0], x + 0.25, y + 0.15, 2.0, 0.8, { size: 34, bold: true, font: 'Cambria', color: C.accent1, margin: 0, valign: 'middle', nosub: true });
    const hd = tx(s, g[1], x + 2.1, y + 0.2, 1.75, 0.7, { size: 18, bold: true, color: C.text2, margin: 0, valign: 'middle' });
    const bd = tx(s, g[2], x + 0.25, y + 1.0, 3.55, 1.25, { size: 15, margin: 0 });
    return [cd, nb, hd, bd];
  });
  ingN.forEach(g => click(s, g, 'zoom', { dur: 400 }));
  s.addNotes('Nguyên liệu tái chế mỡ, dầu ăn thừa thành xà phòng.');

  // ---------- 53. VẬN DỤNG 3 – QUY TRÌNH ----------
  s = newSlide('CONTENT', SEC.app);
  bubbles(s);
  kicker(s, 'VẬN DỤNG · CÂU 3b');
  title(s, 'Quy trình làm xà phòng 5 bước');
  const proc = [['FaGlasses', 'Bảo hộ', 'Đeo găng tay, kính mắt bảo hộ.'], ['FaFlask', 'Pha kiềm', 'Cho 200 g NaOH vào 400 g nước cất, khuấy nhẹ. Chờ hạ nhiệt về 40 – 45 °C.'], ['FaTint', 'Trộn dầu', 'Đổ dung dịch kiềm vào 1 kg dầu (dầu ở khoảng 25 – 35 °C).'], ['FaBlender', 'Khuấy đều', 'Khuấy liên tục tới khi hỗn hợp đặc lại (45 – 60 phút; dùng máy đánh trứng: 5 – 10 phút). Thêm tinh dầu.'], ['FaBox', 'Đổ khuôn', 'Đậy kín hoặc bọc giấy nến, để qua đêm cho xà phòng cứng lại.']];
  const pl = line(s, 1.6, 2.35, 11.75, 2.35, { color: C.accent1, width: 3 });
  const prN2 = proc.map((p, i) => {
    const x = 0.6 + i * 2.46;
    const c = circle(s, x + 0.58, 1.75, 1.1, { fill: i % 2 ? C.accent2 : C.text2, shadow: 'soft' });
    const ic = icon(s, p[0], HEX.white, x + 0.86, 2.03, 0.54);
    const hd = tx(s, (i + 1) + '. ' + p[1], x, 3.0, 2.26, 0.45, { size: 18, bold: true, align: 'center', color: C.text2, margin: 0, nosub: true });
    const bd = tx(s, p[2], x + 0.05, 3.5, 2.16, 1.75, { size: 15, align: 'center', margin: 0 });
    return [c, ic, hd, bd];
  });
  const warn = tx(s, '⚠  An toàn: luôn **đổ NaOH vào nước** (không làm ngược lại). NaOH ăn da – làm dưới sự giám sát của người lớn.', 0.6, 5.55, 12.1, 0.95, { size: 18, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: { color: C.accent4, transparency: 82 }, r: 0.16, margin: 0.25, nosub: true });
  withP(s, pl, 'wipeL', { dur: 900 });
  prN2.forEach(g => click(s, g, 'float', { dur: 450 }));
  click(s, warn, 'zoom');
  s.addNotes('Quy trình 5 bước làm xà phòng từ dầu ăn thừa. Nhấn mạnh an toàn: đổ NaOH vào nước, không làm ngược lại.');

  // ---------- 54. EM ĐÃ HỌC ----------
  pres.addSection({ title: SEC.end });
  s = newSlide('CONTENT_DARK', SEC.end);
  bubbles(s, true);
  kicker(s, 'TỔNG KẾT', true);
  title(s, 'Em đã học');
  const sum = [['FaBookOpen', 'Lipid', 'Hợp chất hữu cơ có trong tế bào sống, không tan trong nước, tan trong dung môi hữu cơ (xăng, dầu hoả…). Lipid điển hình: chất béo và sáp.'], ['FaFlask', 'Chất béo', 'Triester của glycerol và các acid béo: (RCOO)3C3H5. Phản ứng đặc trưng: phản ứng xà phòng hoá.'], ['FaHome', 'Ứng dụng', 'Công nghiệp thực phẩm, dược phẩm, làm nhiên liệu, nguyên liệu sản xuất xà phòng…']];
  const smN = sum.map((m, i) => {
    const x = 0.6 + i * 4.1;
    const cd = box(s, x, 1.75, 3.9, 3.75, { fill: { color: C.background1, transparency: 90 }, line: { color: C.accent1, width: 1.25 }, r: 0.2 });
    const [d1, d2] = iconDot(s, m[0], HEX.gold, x + 0.3, 2.0, 0.9, { tint: C.accent1, tr: 80 });
    const hd = tx(s, m[1], x + 1.4, 2.1, 2.3, 0.7, { size: 22, bold: true, font: 'Cambria', color: C.accent1, valign: 'middle', margin: 0 });
    const bd = tx(s, m[2], x + 0.3, 3.1, 3.35, 2.3, { size: 16, color: C.background1, margin: 0 });
    return [cd, d1, d2, hd, bd];
  });
  const can = tx(s, '**EM CÓ THỂ:** biết cách lựa chọn, sử dụng chất béo phù hợp trong ăn uống để có lợi cho sức khoẻ.', 0.6, 5.75, 12.1, 0.95, { size: 19, color: C.text2, valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent1, r: 0.2, margin: 0.3 });
  smN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 500 }));
  click(s, can, 'zoom');
  s.addNotes('Tổng kết bài học theo mục “Em đã học” và “Em có thể” (SGK trang 130).');

  // ---------- 55. HƯỚNG DẪN VỀ NHÀ ----------
  s = newSlide('CONTENT', SEC.end);
  bubbles(s);
  kicker(s, 'HOẠT ĐỘNG 5');
  title(s, 'Hướng dẫn về nhà');
  const hw = [['FaBookOpen', 'Ôn lại kiến thức', 'Khái niệm lipid, chất béo; tính chất vật lí, hoá học; ứng dụng.'], ['FaPen', 'Làm bài tập vận dụng', 'Hoàn thành 3 câu vận dụng, nộp vào tiết sau.'], ['FaEye', 'Chuẩn bị bài mới', 'Đọc và tìm hiểu trước Bài 29 – Glucose và Saccharose.']];
  const hwN = hw.map((h, i) => {
    const x = 0.6 + i * 4.1;
    const cd = box(s, x, 1.85, 3.9, 4.2, { fill: C.background1, shadow: 'soft' });
    const [d1, d2] = iconDot(s, h[0], HEX.green, x + 1.3, 2.2, 1.3, { tr: 82 });
    const hd = tx(s, h[1], x + 0.25, 3.75, 3.4, 0.55, { size: 20, bold: true, font: 'Cambria', align: 'center', color: C.text2, margin: 0 });
    const bd = tx(s, h[2], x + 0.3, 4.35, 3.3, 1.5, { size: 16, align: 'center', margin: 0 });
    return [cd, d1, d2, hd, bd];
  });
  hwN.forEach((g, i) => anim(s, i ? 'after' : 'click', g, 'float', { dur: 450 }));
  s.addNotes('Dặn dò: ôn bài, làm bài tập vận dụng, đọc trước Bài 29 – Glucose và Saccharose.');

  // ---------- 56. CẢM ƠN ----------
  s = newSlide('COVER', SEC.end);
  bubbles(s, true);
  img(s, 's_dau.png', 8.3, 1.4, 3.9, 3.9, { name: '!!c1', alt: 'Dầu thực vật' });
  img(s, 's_bo.png', 11.0, 4.75, 1.7, 1.7, { name: '!!c2', alt: 'Bơ' });
  img(s, 's_dua.png', 7.3, 4.6, 1.9, 1.9, { name: '!!c3', alt: 'Dầu dừa' });
  tx(s, 'BÀI 28', 0.8, 1.9, 1.55, 0.5, { size: 18, bold: true, color: C.text2, align: 'center', valign: 'middle', shape: SH.ROUNDED_RECTANGLE, fill: C.accent1, r: 0.25, cs: 2, name: '!!badge' });
  const ty = tx(s, 'Cảm ơn\ncác em!', 0.8, 2.55, 6.8, 2.6, { size: 72, bold: true, font: 'Cambria', color: C.background1, margin: 0, valign: 'middle', name: '!!bigtitle', psa: 0, lsm: 0.95 });
  const ty2 = tx(s, 'Hẹn gặp lại ở Bài 29 – Glucose và Saccharose', 0.8, 5.3, 6.4, 0.6, { size: 20, italic: true, font: 'Cambria', color: C.accent6, margin: 0 });
  withP(s, ty2, 'float', { delay: 600 });
  s.addNotes('Kết thúc bài học.');

  await pres.writeFile({ fileName: __dirname + '/raw.pptx' });
  fs.writeFileSync(__dirname + '/anim.json', JSON.stringify({ ANIM, TRANS }, null, 1));
  console.log('slides', L.getS());
}
main().catch(e => { console.error(e); process.exit(1); });
