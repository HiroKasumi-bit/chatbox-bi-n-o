"""Assemble deck.html: reused CSS + new opening, author/work slides, Câu 1–2 panels, new ending."""
css = open('_css.txt').read()
panels = open('_panels.txt').read()

extra_css = r"""
#nav .links span { cursor: default; }
#nav { transition: opacity .8s; }
#nav.hide { opacity: 0; }
/* opening + ending */
#intro { position: absolute; inset: 0; z-index: 60; background: #030503; display: grid; place-items: center; pointer-events: none; }
#intro .date { font-family: var(--display); font-weight: 500; font-size: 64px; letter-spacing: .12em; color: var(--marble); text-align: center; }
#intro .bar { width: 760px; height: 1.5px; margin: 26px auto; background: linear-gradient(90deg, transparent, var(--gold), transparent); transform: scaleX(0); }
#intro .place { font-size: 24px; letter-spacing: .5em; text-transform: uppercase; color: var(--gold); text-align: center; opacity: 0; }
.ch { display: inline-block; will-change: transform, opacity, filter; }
.wd { display: inline-block; white-space: nowrap; }
.mega { position: relative; display: inline-block; }
.mega .sweep { position: absolute; inset: -10% -5%; pointer-events: none; mix-blend-mode: overlay; opacity: .9;
  background: linear-gradient(100deg, transparent 35%, rgba(255,226,160,.95) 50%, transparent 65%); background-size: 300% 100%; background-position: 120% 0; }
.marq { position: absolute; left: 0; top: 0; white-space: nowrap; font-family: var(--display); font-weight: 800; font-size: 300px; letter-spacing: .04em; line-height: 1;
  color: transparent; -webkit-text-stroke: 1.5px rgba(239,233,221,.16); pointer-events: none; z-index: 14; }
.halo { position: absolute; left: 50%; top: 50%; width: 1100px; height: 1100px; margin: -550px 0 0 -550px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(255,214,150,.22), transparent 60%); opacity: 0; z-index: 15; }
canvas#rays { position: absolute; inset: 0; width: 1920px; height: 1080px; pointer-events: none; z-index: 11; mix-blend-mode: screen; opacity: 0; }
.leafHalf { position: absolute; left: -240px; top: -135px; width: 2400px; height: 1350px; z-index: 16; will-change: transform; pointer-events: none; }
.leafHalf img { width: 2400px; height: 1350px; display: block; max-width: none; }
#leafL img { clip-path: inset(0 50% 0 0); } #leafR img { clip-path: inset(0 0 0 50%); }
/* author timeline */
.tl { position: relative; margin-top: 36px; padding-left: 0; }
.tl .line { position: absolute; left: 13px; top: 18px; bottom: 18px; width: 2px; background: linear-gradient(var(--gold), rgba(210,174,104,.15)); transform-origin: top; }
.tl .row { position: relative; display: grid; grid-template-columns: 28px 120px 1fr; gap: 0 22px; align-items: baseline; padding: 11px 0; }
.tl .dot { width: 14px; height: 14px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 18px var(--gold); margin-left: 7px; align-self: center; }
.tl .yr { font-family: var(--display); font-weight: 700; font-size: 40px; color: var(--gold); font-variant-numeric: tabular-nums; }
.tl .tx { font-size: 29px; line-height: 1.35; }
.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 26px; margin-top: 34px; }
.fact { padding: 22px 28px 24px; }
.fact .k { font-size: 20px; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
.fact .v { font-family: var(--display); font-weight: 600; font-size: 34px; line-height: 1.2; margin-top: 8px; }
.fact .d { font-size: 22px; color: var(--muted); margin-top: 6px; line-height: 1.35; }
.src { font-size: 17px; color: #8f9a83; letter-spacing: .02em; }
.frame { width: min-content; margin: 0; padding: 14px 14px 0; background: #e9e3d6; box-shadow: 0 34px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.4); }
.frame img { display: block; max-width: none; }
.frame figcaption { font-size: 18px; line-height: 1.35; color: #3b3a33; padding: 10px 4px 12px; max-width: 100%; }
.vb { font-family: var(--display); font-style: italic; font-weight: 500; font-size: 44px; color: var(--marble); margin-top: 26px; }
.bl { display: grid; gap: 18px; margin-top: 34px; }
.li { display: grid; grid-template-columns: 34px 1fr; align-items: baseline; }
.li i { width: 22px; height: 2px; background: var(--gold); transform: translateY(-10px); }
.li p { margin: 0; font-size: 32px; line-height: 1.42; }
.htl { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); gap: 26px; margin-top: 80px; }
.hline { position: absolute; left: 0; right: 0; top: 11px; height: 2px; background: linear-gradient(90deg, var(--gold), rgba(210,174,104,.2)); transform-origin: left; }
.hn i { display: block; width: 24px; height: 24px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 0 8px rgba(210,174,104,.18), 0 0 26px var(--gold); }
.hn .yr { font-family: var(--display); font-weight: 800; font-size: 76px; color: var(--marble); margin-top: 30px; line-height: 1; font-variant-numeric: tabular-nums; }
.hn .tx { font-size: 27px; line-height: 1.4; margin-top: 16px; color: var(--ink); }
.parts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 60px; }
.part { padding: 34px 36px 40px; position: relative; overflow: hidden; }
.part .no { position: absolute; right: 18px; top: -26px; font-family: var(--display); font-weight: 800; font-size: 200px; color: rgba(210,174,104,.14); line-height: 1; }
.part .k { font-size: 22px; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
.part .v { font-family: var(--display); font-weight: 600; font-size: 42px; line-height: 1.18; margin-top: 14px; position: relative; }
.vals { display: grid; grid-template-columns: 1.15fr 1fr; gap: 30px; margin-top: 34px; }
.vals .lab { font-size: 24px; }
.pin { position: absolute; display: flex; align-items: center; gap: 14px; font-size: 22px; color: var(--marble); z-index: 21; white-space: nowrap; }
.pin i { width: 16px; height: 16px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 0 6px rgba(210,174,104,.25), 0 0 24px var(--gold); }
.pin b { font-weight: 600; } .pin span { color: var(--muted); }
"""

html = f"""<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tôi có một ước mơ</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500;1,600&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap">
<style>{css}{extra_css}</style></head>
<body>
<div id="viewport"><div id="stage">
  <div class="L" id="bg"><img src="img/memorial.jpg" alt="Đài Tưởng niệm Lincoln, Washington, D.C."></div>
  <div class="L" id="sun"></div>
  <div id="tint" class="night"></div>
  <canvas id="rays" width="1920" height="1080"></canvas>
  <div class="L" id="proc"><img src="img/proclamation.jpg" width="430" alt="Bản Tuyên ngôn giải phóng nô lệ"></div>
  <div class="L" id="cols"><img src="img/columns.png" width="700" alt=""></div>
  <div class="L" id="march"><img class="duo" src="img/march.png" width="1250" alt="Mác-tin Lu-thơ Kinh giữa đoàn tuần hành ngày 28/8/1963"></div>
  <div class="L" id="mlk"><img class="duo" src="img/mlk.png" width="1000" alt="Mác-tin Lu-thơ Kinh đọc diễn văn ngày 28/8/1963"></div>
  <div class="L" id="statue"><img src="img/statue.png" width="820" alt="Tượng Abraham Lincoln trong Đài Tưởng niệm Lincoln"></div>
  <div class="L" id="portrait"><img class="duo" src="img/portrait.png" width="640" alt="Chân dung Mác-tin Lu-thơ Kinh"></div>
  <figure class="L frame" id="phWide"><img class="duo" src="img/ph_wide.jpg" width="560" alt="Đám đông dọc hồ phản chiếu ngày 28/8/1963"><figcaption>Người tuần hành dọc hồ phản chiếu, phía xa là Đài tưởng niệm Washington · 28/8/1963</figcaption></figure>
  <figure class="L frame" id="phFountain"><img class="duo" src="img/ph_fountain.jpg" width="720" alt="Bình nước ghi “Colored” ở Oklahoma City, 1939"><figcaption>Bình nước uống ghi “Colored” (dành cho người da màu) · Oklahoma City, 1939</figcaption></figure>
  <figure class="L frame" id="phVote"><img class="duo" src="img/ph_vote.jpg" width="430" alt="Người tuần hành cầm biển đòi quyền bầu cử, 1963"><figcaption>“Chúng tôi đòi quyền bầu cử ngay bây giờ” · 28/8/1963</figcaption></figure>
  <figure class="L frame" id="phLeaders"><img class="duo" src="img/ph_leaders.jpg" width="740" alt="Các nhà lãnh đạo tuần hành ngày 28/8/1963"><figcaption>Các nhà lãnh đạo tuần hành từ Đài tưởng niệm Washington đến Đài Tưởng niệm Lincoln · 28/8/1963</figcaption></figure>
  <canvas id="dust" width="1920" height="1080"></canvas>
  <div class="L" id="leavesB"><img src="img/leaves_bottom.png" width="2400" alt=""></div>
  <div class="marq" id="marq">I HAVE A DREAM · I HAVE A DREAM · I HAVE A DREAM ·</div>
  <div class="halo" id="halo"></div>
  <div class="leafHalf" id="leafL"><img src="img/leaves_front.png" alt=""></div>
  <div class="leafHalf" id="leafR"><img src="img/leaves_front.png" alt=""></div>
  <div id="scrim"></div>
  <div id="vignette"></div>
  <div id="nav"><div class="links"><span data-s="1">Tác giả</span><span data-s="2">Tác phẩm</span><span data-s="3">Câu 1</span><span data-s="4">Câu 2</span></div></div>

  <!-- opening -->
  <section class="P" id="p0" style="left:0;top:250px;width:1920px;text-align:center">
    <div class="kick split" style="justify-content:center">Ngữ văn 11 · Bài 3: Cấu trúc của văn bản nghị luận</div>
    <div class="vb split">Văn bản 2</div>
    <div class="h mega" style="font-size:168px;margin-top:10px"><span class="split big">Tôi có một ước mơ</span><span class="sweep"></span></div>
    <p class="split auth" style="margin:34px 0 0;font-size:30px;letter-spacing:.3em;text-transform:uppercase;color:var(--marble)">Mác-tin Lu-thơ Kinh</p>
  </section>

  <!-- author 1 -->
  <section class="P" id="pA" style="left:120px;top:190px;width:1040px">
    <div class="kick">Tác giả</div>
    <div class="h sm" style="margin-top:16px">Mác-tin Lu-thơ Kinh</div>
    <p class="t md" style="margin-top:10px;color:var(--muted)">(Martin Luther King Jr., 1929 – 1968)</p>
    <div class="bl">
      <div class="li ex"><i></i><p>Mục sư, nhà hoạt động nhân quyền người Mĩ gốc Phi.</p></div>
      <div class="li ex"><i></i><p>Một trong những nhà lãnh đạo có ảnh hưởng lớn nhất nước Mĩ; lãnh tụ Phong trào Dân quyền Mĩ, đấu tranh bằng con đường bất bạo động.</p></div>
      <div class="li ex"><i></i><p>Nổi tiếng với các bài diễn thuyết về những vấn đề lớn của thế giới, xã hội và con người.</p></div>
      <div class="li ex"><i></i><p>Bài diễn văn nổi tiếng nhất: <q>Tôi có một ước mơ</q>.</p></div>
    </div>
  </section>

  <!-- author 2: life -->
  <section class="P" id="pA2" style="left:120px;top:200px;width:1680px">
    <div class="kick">Tác giả · Cuộc đời</div>
    <div class="h sm" style="margin-top:16px">Những dấu mốc</div>
    <div class="htl"><div class="hline"></div>
      <div class="hn ex"><i></i><div class="yr">1929</div><div class="tx">Sinh ngày 15/1 tại Atlanta, bang Georgia, Hoa Kỳ</div></div>
      <div class="hn ex"><i></i><div class="yr">1955</div><div class="tx">Lãnh đạo cuộc tẩy chay xe buýt ở Montgomery</div></div>
      <div class="hn ex"><i></i><div class="yr">1963</div><div class="tx">Đọc diễn văn <q>Tôi có một ước mơ</q> (28/8)</div></div>
      <div class="hn ex"><i></i><div class="yr">1964</div><div class="tx">Được trao giải Nobel Hòa bình</div></div>
      <div class="hn ex"><i></i><div class="yr">1968</div><div class="tx">Bị ám sát ngày 4/4 tại Memphis, bang Tennessee</div></div>
    </div>
  </section>

  <!-- work 1 -->
  <section class="P" id="pB" style="left:120px;top:170px;width:1120px">
    <div class="kick">Tác phẩm</div>
    <div class="h sm" style="margin-top:16px">Tôi có một ước mơ</div>
    <p class="lead" style="margin-top:8px;font-size:34px;color:var(--muted)">I Have a Dream</p>
    <div class="facts">
      <div class="glass fact ex"><div class="k">Thể loại</div><div class="v">Văn nghị luận</div><div class="d">Bài diễn văn</div></div>
      <div class="glass fact ex"><div class="k">Phương thức biểu đạt</div><div class="v">Nghị luận</div></div>
      <div class="glass fact ex" style="grid-column:1 / -1"><div class="k">Xuất xứ, hoàn cảnh ra đời</div><div class="v" style="font-size:30px">Đọc ngày 28/8/1963 trên bậc thềm Đài Tưởng niệm Lincoln (Washington, D.C.), trong cuộc tuần hành kêu gọi thông qua đạo luật dân quyền, bình đẳng cho người da đen</div><div class="d">Cuộc tuần hành đến Washington vì Việc làm và Tự do · khoảng 250.000 người tham dự</div></div>
    </div>
  </section>
  <div class="pin" id="pinB" style="left:1300px;top:790px;opacity:0"><i></i><div><b>Đài Tưởng niệm Lincoln</b><br><span>nơi bài diễn văn được đọc</span></div></div>

  <!-- work 2: structure -->
  <section class="P" id="pB2" style="left:120px;top:200px;width:1680px">
    <div class="kick">Tác phẩm · Bố cục</div>
    <div class="h sm" style="margin-top:16px">Văn bản gồm 3 phần</div>
    <div class="parts">
      <div class="glass part ex"><div class="no">1</div><div class="k">Phần 1</div><div class="v">Thực trạng cuộc sống của người da đen</div></div>
      <div class="glass part ex"><div class="no">2</div><div class="k">Phần 2</div><div class="v">Cuộc đấu tranh của người da đen</div></div>
      <div class="glass part ex"><div class="no">3</div><div class="k">Phần 3</div><div class="v">Giấc mơ về một nước Mĩ bình đẳng</div></div>
    </div>
  </section>

  <!-- work 3: values -->
  <section class="P" id="pB3" style="left:120px;top:180px;width:1680px">
    <div class="kick">Tác phẩm · Giá trị</div>
    <div class="vals">
      <div class="glass card ex"><div class="lab">Giá trị nội dung</div><p class="t md" style="margin:6px 0 0">Khẳng định quyền bình đẳng của người da đen và kêu gọi người da đen đấu tranh giành quyền bình đẳng.</p></div>
      <div class="glass card ex"><div class="lab">Giá trị nghệ thuật</div><p class="t md" style="margin:6px 0 0">Hình ảnh, câu văn giàu sức truyền cảm.</p><p class="t md" style="margin:8px 0 0">Lập luận chặt chẽ, thuyết phục.</p></div>
    </div>
    <p class="t sm" style="margin-top:34px">Năm 1999, một cuộc khảo sát các học giả về nghệ thuật diễn thuyết xếp bài này đứng đầu các bài diễn văn của nước Mĩ thế kỉ XX.</p>
    <p class="t sm" style="margin-top:6px;color:var(--muted)">SGK Ngữ văn 11, tập 1 · Bài 3: Cấu trúc của văn bản nghị luận</p>
  </section>

{panels}
  <!-- ending -->
  <section class="P" id="pE" style="left:0;top:290px;width:1920px;text-align:center">
    <div class="kick split" style="justify-content:center">Ngữ văn 11 · Văn bản 2</div>
    <div class="h mega" style="font-size:168px;margin-top:26px"><span class="split big">Tôi có một ước mơ</span><span class="sweep"></span></div>
    <p class="split thanks" style="font-family:var(--display);font-style:italic;font-size:46px;margin-top:40px;color:var(--marble)">Cảm ơn thầy cô và các bạn đã lắng nghe</p>
  </section>

  <div id="intro"><div><div class="date split">28 · 8 · 1963</div><div class="bar"></div><div class="place">Washington, D.C.</div></div></div>
  <div class="src" id="src" style="position:absolute;left:120px;bottom:30px;z-index:35;opacity:0">Nguồn: VietJack, VnDoc (bài soạn Ngữ văn 11 Kết nối tri thức); Wikipedia tiếng Việt và tiếng Anh; Cục Lưu trữ Quốc gia Hoa Kỳ; Cục Công viên Quốc gia Hoa Kỳ</div>
  <div id="flash" style="position:absolute;inset:0;background:#fff3d6;opacity:0;pointer-events:none;z-index:70"></div>
  <div id="grain"></div>
  <div id="dots"></div><div id="count"></div>
</div></div>
<script src="vendor/gsap.min.js"></script>
<script src="app.js"></script>
</body></html>
"""
# drop the old start screen + brand styles that are no longer used
open('deck.html', 'w').write(html)
print('ok', len(html))
