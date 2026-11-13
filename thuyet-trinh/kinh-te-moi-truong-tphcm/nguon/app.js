/* Economy & environment in Ho Chi Minh City — cinematic deck. One click = one slide.
   Transitions: tunnel (fly through layered rings), bands (diagonal sweep), window (zoom into a frame),
   flip (cube turn), leaves (foliage parts), flash (sunrise). Text is verbatim from the group's document. */
(() => {
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const stage = $('#stage');
  const fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; };
  addEventListener('resize', fit); fit();
  gsap.ticker.lagSmoothing(0);

  // ---------- content ----------
  const H2 = '2. Tác động của các hoạt động kinh tế đến môi trường tự nhiên';
  const bl = (items, a = 'left') => `<div class="bl">${items.map((t, i) => `<div class="b" data-a="${a}"><i>0${i + 1}</i><p>${t}</p></div>`).join('')}</div>`;
  const sector = (o) => `<section class="S sector" data-tr="${o.tr}" data-air="${o.air}" data-sec="Tác động · ${o.short}" data-bands="${o.bands}" style="--bg:${o.bg};--ac:${o.ac}">
    <div class="stripes"></div><div class="giant z" style="--k:-.7" data-a="word" data-d=".15">${o.word}</div>${o.obj}
    <div class="col"><div class="kick" data-a="up">${H2}</div><h2 data-a="up"><em>${o.l}</em> ${o.title}</h2>${bl(o.items)}</div>
    <div class="cred">${o.cred}</div></section>`;
  const caseS = (o) => `<section class="S case" data-tr="${o.tr}" data-air="${o.air}" data-sec="Dẫn chứng · ${o.n}/04" style="--ac:#ffd27a">
    <div class="bgimg z" style="--k:-.6;background-image:url(img/${o.img});background-position:${o.pos || 'center'}"></div>
    <div class="shade" style="background:linear-gradient(90deg,rgba(5,9,14,.82),rgba(5,9,14,.35) 55%,rgba(5,9,14,.1)),linear-gradient(0deg,rgba(5,9,14,.75),transparent 55%)"></div>
    <div class="where"><div class="kick" data-a="up">4. Một số dẫn chứng thực tế tại TP.HCM</div></div><div class="idx z" style="--k:.9" data-a="zoom">0${o.n}</div>
    <div class="place z chars" style="--k:.5;font-size:${o.fs || 150}px" data-a="chars">${o.place}</div><div class="txt glass" data-a="up">${o.txt}</div>
    <div class="cred">${o.cred}</div></section>`;
  const sol = (o) => `<section class="S sol" data-tr="${o.tr}" data-air="g" data-sec="Giải pháp · ${o.short}" style="--bg:${o.bg};--ac:#b9f27c">
    <div class="bgimg z" style="--k:-.5;background-image:url(img/${o.bgimg});opacity:.28"></div><div class="shade" style="background:linear-gradient(90deg,${o.bg} 20%,transparent)"></div>
    <div class="pic z" style="--k:1.1;background-image:url(img/${o.pic})" data-a="card3d"></div>
    <div class="col"><div class="kick" data-a="up">6. Giải pháp hạn chế tác động tiêu cực và bảo vệ môi trường</div><div class="who" data-a="up">${o.who}</div>
    <div class="grid2">${o.items.map((t, i) => `<div class="cell glass" data-a="zoom"><i>0${i + 1}</i><p>${t}</p></div>`).join('')}</div></div>
    <div class="cred">${o.cred}</div></section>`;

  const HTML = [
    // 0 · cover
    `<section class="S cover" data-tr="fade" data-air="0" data-sec="Nhóm 7 · Giáo dục địa phương" style="--ac:#ffb36b">
      <div class="bgimg z" style="--k:-.6;background-image:url(img/skyline.jpg)"></div>
      <div class="shade" style="background:linear-gradient(180deg,rgba(4,8,14,.7),rgba(4,8,14,.2) 42%,rgba(4,8,14,.88))"></div>
      <div class="tag z" style="--k:1" data-a="zoom" data-d="1.5">TP.HCM</div>
      <div class="cv"><div class="kick" data-a="up" data-d="1.2">Giáo dục địa phương · Nhóm 7</div>
      <h1 class="chars" data-a="chars" data-d="1.4">Tác động của các hoạt động kinh tế<br><b>đến môi trường tự nhiên</b><br>ở Thành phố Hồ Chí Minh</h1></div>
      <div class="cred">Ảnh: lumoplank · CC0 (Wikimedia Commons)</div></section>`,
    // 1 · overview
    `<section class="S ov" data-tr="tunnel" data-air=".1" data-sec="Khái quát" style="--ac:#ffb36b">
      <div class="bgimg z" style="--k:-.6;background-image:url(img/river3.jpg)"></div><div class="shade" style="background:linear-gradient(180deg,rgba(5,10,16,.88),rgba(5,10,16,.72))"></div>
      <div class="head"><div class="kick" data-a="up">Phần 1</div><h2 data-a="up">1. Khái quát về các hoạt động kinh tế ở TP.HCM</h2>
      <p class="lead" data-a="up">TP.HCM là một trong những trung tâm kinh tế lớn nhất cả nước, với nhiều hoạt động kinh tế đa dạng:</p></div>
      <div class="fan">${[
        ['factory2.jpg', 'Công nghiệp', 'Sản xuất, chế biến, chế tạo tại các khu công nghiệp, khu chế xuất.'],
        ['traffic2.jpg', 'Giao thông vận tải', 'Giao thông đường bộ, đường thủy, hoạt động cảng biển và logistics.'],
        ['market.jpg', 'Thương mại – dịch vụ', 'Kinh doanh, mua bán, nhà hàng, khách sạn và du lịch.'],
        ['d_build.jpg', 'Xây dựng và đô thị hóa', 'Xây dựng nhà ở, khu đô thị, đường sá và các công trình hạ tầng.'],
        ['d_agri.jpg', 'Nông nghiệp', 'Trồng trọt, chăn nuôi và nuôi trồng thủy sản.'],
      ].map((c, i) => `<div class="card" data-a="card3d"><div class="ph" style="background-image:url(img/${c[0]})"></div><div class="in"><div class="n">0${i + 1}</div><div class="t">${c[1]}</div><div class="d">${c[2]}</div></div></div>`).join('')}</div>
      <div class="cred">Ảnh nền: Gary Todd · CC0</div></section>`,
    // 2a–2e · impacts
    sector({ tr: 'tunnel', air: .45, short: 'Công nghiệp', bands: '#ff9a52,#2a0f07,#5e2413', bg: '#5e2413', ac: '#ffb07a', word: 'Công nghiệp', l: 'a.', title: 'Hoạt động công nghiệp',
      obj: `<img class="obj z" style="--k:1.3;right:60px;bottom:0;width:760px" data-a="obj" src="img/c_factory.png" alt="Ống khói nhà máy">`,
      items: ['Khí thải từ các nhà máy làm gia tăng ô nhiễm không khí.', 'Nước thải công nghiệp chưa qua xử lí đạt chuẩn gây ô nhiễm sông, kênh rạch.', 'Chất thải rắn và hóa chất có nguy cơ làm suy thoái, ô nhiễm đất.', 'Khai thác và sử dụng nhiều nguyên liệu, nhiên liệu làm suy giảm tài nguyên thiên nhiên.'],
      cred: 'Ảnh minh họa: Alfred T. Palmer · phạm vi công cộng' }),
    sector({ tr: 'bands', air: .6, short: 'Giao thông vận tải', bands: '#ffd166,#0d1420,#1f2a3c', bg: '#1f2a3c', ac: '#ffd166', word: 'Giao thông', l: 'b.', title: 'Hoạt động giao thông vận tải',
      obj: `<img class="obj z" style="--k:1.3;right:-40px;bottom:0;width:940px" data-a="obj" src="img/c_traffic.png" alt="Người đi xe máy đeo khẩu trang ở TP.HCM">`,
      items: ['Khí thải từ phương tiện giao thông làm gia tăng bụi mịn và các chất gây ô nhiễm không khí.', 'Tiếng ồn từ xe cộ ảnh hưởng đến môi trường sống.', 'Tiêu thụ lượng lớn nhiên liệu hóa thạch, góp phần làm gia tăng phát thải khí nhà kính.', 'Hoạt động vận tải đường thủy có nguy cơ gây ô nhiễm nguồn nước do dầu và chất thải.'],
      cred: 'Ảnh: Vyacheslav Argenberg · CC BY 4.0' }),
    sector({ tr: 'bands', air: .7, short: 'Xây dựng và đô thị hóa', bands: '#f2d08a,#241d0d,#5c4d2a', bg: '#5c4d2a', ac: '#f6d99a', word: 'Xây dựng', l: 'c.', title: 'Hoạt động xây dựng và đô thị hóa',
      obj: `<div class="shape z" style="--k:1.2;right:70px;top:300px;width:800px;height:560px;clip-path:polygon(16% 0,100% 0,84% 100%,0 100%);background-image:url(img/d_build.jpg)" data-a="obj"></div>`,
      items: ['Bụi và tiếng ồn từ các công trình xây dựng gây ô nhiễm môi trường.', 'Thu hẹp diện tích cây xanh và các khu vực tự nhiên.', 'Bê tông hóa bề mặt đất làm giảm khả năng thấm nước, tăng nguy cơ ngập úng.', 'Làm thay đổi cảnh quan và ảnh hưởng đến môi trường sống của sinh vật.'],
      cred: 'Ảnh: tài liệu của nhóm' }),
    sector({ tr: 'bands', air: .6, short: 'Thương mại – dịch vụ', bands: '#ff8fb8,#1f0914,#571d3a', bg: '#571d3a', ac: '#ffa9c8', word: 'Thương mại', l: 'd.', title: 'Hoạt động thương mại – dịch vụ và du lịch',
      obj: `<img class="obj z" style="--k:1.3;right:120px;bottom:-30px;width:560px" data-a="obj" src="img/c_market.png" alt="Chợ Bến Thành">`,
      items: ['Gia tăng lượng rác thải nhựa, túi nilon và bao bì dùng một lần.', 'Nước thải từ nhà hàng, khách sạn và cơ sở kinh doanh gây áp lực lên hệ thống xử lí nước thải.', 'Tiêu thụ nhiều điện, nước và tài nguyên.', 'Hoạt động du lịch thiếu kiểm soát có thể ảnh hưởng đến cảnh quan và hệ sinh thái tự nhiên.'],
      cred: 'Ảnh: Diego Delso · CC BY-SA 3.0' }),
    sector({ tr: 'bands', air: .5, short: 'Nông nghiệp', bands: '#cfe88a,#101a08,#2f4a1e', bg: '#2f4a1e', ac: '#d6ee92', word: 'Nông nghiệp', l: 'e.', title: 'Hoạt động nông nghiệp và nuôi trồng thủy sản',
      obj: `<div class="shape z" style="--k:1.2;right:90px;top:330px;width:740px;height:528px;border:10px solid #f3eee2;border-radius:10px;rotate:3deg;background-image:url(img/d_agri.jpg)" data-a="obj"></div>`,
      items: ['Phân bón hóa học và thuốc bảo vệ thực vật có thể gây ô nhiễm đất, nước.', 'Chất thải từ chăn nuôi gây ô nhiễm nguồn nước nếu không được xử lí.', 'Việc khai thác tài nguyên nước phục vụ sản xuất tạo áp lực lên nguồn nước tự nhiên.', 'Hoạt động nuôi trồng thủy sản thiếu kiểm soát có thể làm suy giảm chất lượng môi trường nước.'],
      cred: 'Ảnh: tài liệu của nhóm' }),
    // 3 · summary
    `<section class="S sum" data-tr="tunnel" data-air=".85" data-fx="iso" data-sec="Tác động tổng hợp" style="--ac:#ffcf8a">
      <div class="bgimg z" style="--k:-.6;background-image:url(img/river2.jpg)"></div><div class="shade" style="background:linear-gradient(180deg,rgba(14,12,10,.8),rgba(14,12,10,.62))"></div>
      <div class="head"><div class="kick" data-a="up">Phần 3</div><h2 data-a="up">3. Tác động tổng hợp đến các thành phần môi trường tự nhiên</h2></div>
      <div class="isoWrap"><div class="iso">${[
        ['Không khí', 'Gia tăng bụi mịn, khí thải và khí nhà kính; suy giảm chất lượng không khí.'],
        ['Nước', 'Ô nhiễm sông, kênh rạch do nước thải sinh hoạt, công nghiệp và sản xuất.'],
        ['Đất', 'Ô nhiễm do hóa chất, chất thải rắn; thu hẹp diện tích đất tự nhiên.'],
        ['Hệ sinh thái', 'Suy giảm diện tích sinh cảnh, ảnh hưởng đến đa dạng sinh học và các loài sinh vật.'],
        ['Cảnh quan tự nhiên', 'Thay đổi do đô thị hóa, xây dựng và gia tăng chất thải.'],
      ].map((c, i) => `<div class="tile glass"><div class="n">0${i + 1}</div><div class="t">${c[0]}</div><div class="k">Tác động</div><div class="d">${c[1]}</div></div>`).join('')}</div></div>
      <div class="cred">Ảnh nền: Gary Todd · CC0</div></section>`,
    // 4 · case studies
    caseS({ tr: 'tunnel', air: .5, n: 1, img: 'catlai.jpg', place: 'Cảng Cát Lái', txt: 'Hoạt động vận tải, bốc dỡ và logistics phát triển mạnh, góp phần thúc đẩy kinh tế nhưng cũng làm gia tăng áp lực về khí thải, tiếng ồn và chất thải.', cred: 'Ảnh: Bem photography · CC BY 2.0' }),
    caseS({ tr: 'window', air: .4, n: 2, img: 'canal.jpg', fs: 124, place: 'Kênh Nhiêu Lộc – Thị Nghè', txt: 'Chịu áp lực từ nước thải đô thị và hoạt động sinh hoạt, kinh doanh của người dân.', cred: 'Ảnh: Sketyl · CC BY 2.0' }),
    caseS({ tr: 'window', air: .2, n: 3, img: 'cangio2.jpg', fs: 124, place: 'Rừng ngập mặn Cần Giờ', txt: 'Có nguy cơ chịu tác động từ hoạt động khai thác tài nguyên, du lịch và phát triển kinh tế ven biển nếu không được quản lí hợp lí.', cred: 'Ảnh: Tho nau · CC BY-SA 3.0' }),
    caseS({ tr: 'window', air: .7, n: 4, img: 'traffic2.jpg', fs: 124, place: 'Các tuyến đường nội đô', txt: 'Mật độ phương tiện lớn gây ô nhiễm không khí, tiếng ồn và ùn tắc giao thông.', cred: 'Ảnh: Huỳnh Thanh Huy · CC BY 4.0' }),
    // 5 · positive
    `<section class="S pos" data-tr="leaves" data-air="g" data-sec="Tác động tích cực" style="--bg:#0f2a1c;--ac:#b9f27c">
      <div class="bgimg z" style="--k:-.5;background-image:url(img/cangio3.jpg);opacity:.3"></div><div class="shade" style="background:linear-gradient(90deg,#0f2a1c 30%,rgba(15,42,28,.4))"></div>
      <div class="stack"><div class="pc z" style="--k:.7;left:120px;top:0;width:520px;height:300px;rotate:4deg;background-image:url(img/d_ecotour.jpg)" data-a="card3d"></div>
        <div class="pc z" style="--k:1.3;left:0;top:250px;width:520px;height:330px;rotate:-5deg;background-image:url(img/metro.jpg)" data-a="card3d"></div>
        <div class="pc z" style="--k:1.9;left:130px;top:520px;width:500px;height:280px;rotate:3deg;background-image:url(img/d_renew.jpg)" data-a="card3d"></div></div>
      <div class="col"><div class="kick" data-a="up">Phần 5</div><h2 data-a="up" style="font-size:58px">5. Những tác động tích cực của hoạt động kinh tế đến môi trường</h2>
      <p class="lead" data-a="up" style="font-size:26px;max-width:960px;margin-top:14px">Bên cạnh những tác động tiêu cực, một số hoạt động kinh tế còn góp phần bảo vệ và cải thiện môi trường:</p>
      ${bl(['Phát triển du lịch sinh thái góp phần nâng cao nhận thức bảo tồn thiên nhiên.', 'Đầu tư công nghệ hiện đại giúp giảm lượng chất thải và tiết kiệm tài nguyên.', 'Phát triển giao thông công cộng giúp hạn chế phương tiện cá nhân và giảm phát thải.', 'Các dự án xử lí nước thải, rác thải góp phần cải thiện chất lượng môi trường.', 'Phát triển năng lượng tái tạo góp phần giảm phụ thuộc vào nhiên liệu hóa thạch.'])}</div>
      <div class="cred">Ảnh: tài liệu của nhóm; tàu metro: Kateru Zakuro · CC BY 4.0; nền: Phương Huy · CC BY-SA 4.0</div></section>`,
    // 6 · solutions
    sol({ tr: 'tunnel', short: 'Chính quyền', bg: '#0e2b24', bgimg: 'canal2.jpg', pic: 'canal2.jpg', who: 'Đối với chính quyền:', cred: 'Ảnh: Magicknight94 · CC BY 4.0',
      items: ['Tăng cường kiểm tra, giám sát và xử lí các hành vi gây ô nhiễm.', 'Đầu tư hệ thống xử lí nước thải, rác thải.', 'Quy hoạch đô thị hợp lí, mở rộng diện tích cây xanh.', 'Bảo vệ các khu vực sinh thái quan trọng như rừng ngập mặn Cần Giờ.'] }),
    sol({ tr: 'flip', short: 'Doanh nghiệp', bg: '#12303a', bgimg: 'd_greencity.jpg', pic: 'd_greencity.jpg', who: 'Đối với doanh nghiệp:', cred: 'Ảnh: tài liệu của nhóm',
      items: ['Áp dụng công nghệ sản xuất sạch và tiết kiệm năng lượng.', 'Xử lí chất thải trước khi thải ra môi trường.', 'Sử dụng nguyên liệu thân thiện với môi trường.', 'Thực hiện các mô hình kinh tế xanh, kinh tế tuần hoàn.'] }),
    sol({ tr: 'flip', short: 'Người dân', bg: '#1d3a1a', bgimg: 'd_ecoware.jpg', pic: 'd_ecoware.jpg', who: 'Đối với người dân:', cred: 'Ảnh: tài liệu của nhóm',
      items: ['Hạn chế sử dụng đồ nhựa dùng một lần.', 'Phân loại rác tại nguồn.', 'Ưu tiên sử dụng phương tiện giao thông công cộng.', 'Tiết kiệm điện, nước và tích cực tham gia các hoạt động bảo vệ môi trường.'] }),
    // 7 · conclusion
    `<section class="S end" data-tr="tunnel" data-air="g" data-sec="Kết luận" style="--ac:#ffd27a">
      <div class="bgimg z" style="--k:-.6;background-image:url(img/river.jpg)"></div><div class="shade" style="background:linear-gradient(90deg,rgba(6,14,12,.92) 35%,rgba(6,14,12,.55))"></div>
      <div class="col"><div class="kick" data-a="up">Phần 7</div><h2 data-a="up">7. Đánh giá chung và kết luận</h2>
      ${bl(['Các hoạt động kinh tế góp phần thúc đẩy tăng trưởng, tạo việc làm và nâng cao chất lượng cuộc sống tại TP.HCM.', 'Tuy nhiên, sự phát triển thiếu bền vững có thể gây ô nhiễm môi trường, suy giảm tài nguyên và ảnh hưởng đến hệ sinh thái tự nhiên.', 'Vì vậy, TP.HCM cần hướng đến mô hình phát triển kinh tế xanh, hiện đại và bền vững, kết hợp hài hòa giữa tăng trưởng kinh tế với bảo vệ môi trường.'], 'up')}</div>
      <div class="cred">Ảnh: Diego Delso · CC BY-SA 3.0</div></section>`,
    // message
    `<section class="S msg" data-tr="flash" data-air="g" data-sec="Thông điệp" style="--ac:#b9f27c">
      <div class="bgimg z" style="--k:-.6;background-image:url(img/canal2.jpg)"></div><div class="shade" style="background:radial-gradient(ellipse at 50% 45%,rgba(6,20,14,.55),rgba(6,20,14,.88))"></div>
      <div class="mid"><div class="kick" data-a="up" data-d=".7">Thông điệp</div>
      <h1 class="chars" data-a="chars" data-d=".9">Phát triển kinh tế không đánh đổi môi trường<br><b>– Vì một TP.HCM xanh, sạch và bền vững.</b></h1>
      <div class="by" data-a="up" data-d="2.4">Nhóm 7 · Giáo dục địa phương</div></div>
      <div class="cred">Ảnh: Magicknight94 · CC BY 4.0</div></section>`,
    // thanks + sources
    `<section class="S thx" data-tr="tunnel" data-air="0" data-sec="Cảm ơn" style="--ac:#ffb36b">
      <div class="bgimg z" style="--k:-.6;background-image:url(img/skyline.jpg)"></div><div class="shade" style="background:rgba(4,8,14,.84)"></div>
      <div class="mid"><h1 class="chars" data-a="chars" data-d=".5">Cảm ơn thầy cô và các bạn đã lắng nghe</h1><div class="by" data-a="up" data-d="1.3">Nhóm 7 · Giáo dục địa phương</div></div>
      <div class="src" data-a="up" data-d="1.6"><b>Nguồn hình ảnh</b> (Wikimedia Commons và tài liệu của nhóm)<br>
        Toàn cảnh TP.HCM về đêm: lumoplank, CC0<br>Sông Sài Gòn nhìn từ trên cao: Gary Todd, CC0; Diego Delso, CC BY-SA 3.0<br>Ống khói nhà máy (ảnh minh họa): Alfred T. Palmer, phạm vi công cộng; Jorge Royan, CC BY-SA 3.0<br>
        Giao thông TP.HCM: Vyacheslav Argenberg, CC BY 4.0; Huỳnh Thanh Huy, CC BY 4.0<br>Chợ Bến Thành: Diego Delso, CC BY-SA 3.0<br>Cảng Cát Lái: Bem photography, CC BY 2.0<br>
        Kênh Nhiêu Lộc – Thị Nghè: Sketyl, CC BY 2.0; Magicknight94, CC BY 4.0<br>Rừng ngập mặn Cần Giờ: Tho nau, CC BY-SA 3.0; Phương Huy, CC BY-SA 4.0<br>Tàu metro số 1: Kateru Zakuro, CC BY 4.0<br>
        Các ảnh xây dựng, nông nghiệp, du lịch sinh thái, năng lượng tái tạo, đô thị xanh, đồ dùng thân thiện môi trường: tài liệu của nhóm</div></section>`,
  ];
  $('#slides').innerHTML = HTML.join('');
  const S = $$('.S');

  // split .chars into letters (text itself unchanged)
  $$('.chars').forEach(el => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(n => { const f = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'wd'; [...t].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); }); f.appendChild(w); });
      n.replaceWith(f); });
  });

  // ---------- entrance of a slide's elements ----------
  const FROM = {
    up: [{ y: 70, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .9, ease: 'expo.out' }],
    left: [{ x: -140, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: 'expo.out' }],
    zoom: [{ scale: .55, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }],
    word: [{ xPercent: 35, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.6, ease: 'expo.out' }],
    obj: [{ x: 1000, rotation: 5, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 1.5, ease: 'expo.out' }],
    card3d: [{ rotationY: -75, z: -500, y: 80, opacity: 0, transformPerspective: 1400 }, { rotationY: 0, z: 0, y: 0, opacity: 1, duration: 1.25, ease: 'expo.out' }],
  };
  const FX = {
    iso(s, tl) { // tiles drop onto an isometric plane, then the plane turns to face the camera
      const iso = $('.iso', s), tiles = $$('.tile', s);
      tl.fromTo(iso, { rotationX: 58, rotationZ: -36, scale: .78, y: 40 }, { rotationX: 58, rotationZ: -36, scale: .78, y: 40, duration: .01 }, 0)
        .fromTo(tiles, { z: 900, opacity: 0 }, { z: 0, opacity: 1, duration: 1, ease: 'bounce.out', stagger: .14 }, .6)
        .to(iso, { rotationX: 0, rotationZ: 0, scale: 1, y: 0, duration: 1.5, ease: 'expo.inOut' }, 2.1);
    },
  };
  function enter(s) {
    const tl = gsap.timeline({ paused: true }); let d = .3;
    $$('[data-a]', s).forEach(el => {
      const a = el.dataset.a, at = el.dataset.d !== undefined ? +el.dataset.d : (d += .1);
      if (a === 'chars') tl.fromTo($$('.ch', el), { opacity: 0, y: 90, rotationX: -90, transformOrigin: '50% 100%' }, { opacity: 1, y: 0, rotationX: 0, duration: 1, ease: 'expo.out', stagger: .022 }, at);
      else tl.fromTo(el, FROM[a][0], { ...FROM[a][1] }, at);
    });
    if (FX[s.dataset.fx]) FX[s.dataset.fx](s, tl);
    tl.progress(0.0001).progress(0); // apply the hidden start states now
    return tl;
  }

  // ---------- transitions ----------
  const rings = $$('#tun .ring').reverse(), bands = $$('#bands i');
  const RC = [['#0d2230', '#4f9fb0'], ['#134a4e', '#6cc9b4'], ['#2a6a45', '#b9f27c']];
  const TR = {
    fade(from, to, reveal, done) { to.style.zIndex = 3; return gsap.timeline().add(() => reveal(), 0).fromTo(to, { opacity: 0 }, { opacity: 1, duration: .5 }, 0).add(() => { done(); to.style.zIndex = ''; }); },
    tunnel(from, to, reveal, done, slow = 1) {
      rings.forEach((r, i) => { r.style.setProperty('--c', RC[i][0]); r.style.setProperty('--rim', RC[i][1]); });
      const tl = gsap.timeline();
      tl.set('#tun', { autoAlpha: 1 }).set(rings, { '--r': '0px', opacity: 0 });
      if (from) tl.to(from, { scale: 2, filter: 'blur(14px)', duration: .7, ease: 'power2.in' }, 0);
      tl.to(rings, { opacity: 1, duration: .4, stagger: -.08 }, .25)
        .add(() => { reveal(.25 * slow); done(); }, .75)
        .fromTo(to, { scale: 1.4 }, { scale: 1, duration: 1.9 * slow, ease: 'expo.out' }, .76)
        .to(rings, { '--r': '1500px', duration: 1.35 * slow, ease: 'power2.inOut', stagger: .24 * slow }, .78)
        .set('#tun', { autoAlpha: 0 });
      return tl;
    },
    bands(from, to, reveal, done) {
      const c = (to.dataset.bands || '#fff,#000,#222').split(','); bands.forEach((b, i) => b.style.background = c[i]);
      return gsap.timeline().set('#bands', { autoAlpha: 1 })
        .fromTo(bands, { x: 2500 }, { x: -4100, duration: 1.2, ease: 'power2.inOut', stagger: .1 }, 0)
        .to(from, { x: -300, duration: .65, ease: 'power2.in' }, 0)
        .add(() => { reveal(.2); done(); }, .1 + .6)
        .set('#bands', { autoAlpha: 0 });
    },
    window(from, to, reveal, done) {
      to.style.zIndex = 3;
      return gsap.timeline().add(() => reveal(.55), 0)
        .fromTo(to, { clipPath: 'inset(34% 37% 34% 37% round 40px)', scale: .92 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, duration: 1.4, ease: 'expo.inOut' }, 0)
        .to(from, { scale: 1.6, filter: 'blur(12px) brightness(.45)', duration: 1.4, ease: 'expo.inOut' }, 0)
        .add(() => { done(); to.style.zIndex = ''; gsap.set(to, { clearProps: 'clipPath' }); });
    },
    flip(from, to, reveal, done) {
      gsap.set([from, to], { transformOrigin: '50% 50% -960px' });
      return gsap.timeline().add(() => reveal(.45), 0)
        .fromTo(to, { rotationY: 90, filter: 'brightness(.4)' }, { rotationY: 0, filter: 'brightness(1)', duration: 1.3, ease: 'power3.inOut' }, 0)
        .to(from, { rotationY: -90, filter: 'brightness(.4)', duration: 1.3, ease: 'power3.inOut' }, 0)
        .add(() => { done(); gsap.set(to, { clearProps: 'transform,transformOrigin,filter' }); });
    },
    leaves(from, to, reveal, done) {
      return gsap.timeline().set('.leafHalf', { autoAlpha: 1 })
        .fromTo('#leafL', { xPercent: -60, scale: 1.2 }, { xPercent: 0, duration: .85, ease: 'power3.inOut' }, 0)
        .fromTo('#leafR', { xPercent: 60, scale: 1.2 }, { xPercent: 0, duration: .85, ease: 'power3.inOut' }, 0)
        .to(from, { scale: 1.15, duration: .85, ease: 'power2.in' }, 0)
        .add(() => { reveal(.5); done(); }, .9)
        .to('#leafL', { xPercent: -62, duration: 1.5, ease: 'expo.inOut' }, 1)
        .to('#leafR', { xPercent: 62, duration: 1.5, ease: 'expo.inOut' }, 1)
        .fromTo(to, { scale: 1.25 }, { scale: 1, duration: 2, ease: 'expo.out' }, 1)
        .set('.leafHalf', { autoAlpha: 0 });
    },
    flash(from, to, reveal, done) {
      return gsap.timeline().to('#flash', { opacity: 1, duration: .5, ease: 'power2.in' }, 0).to(from, { scale: 1.3, duration: .5, ease: 'power2.in' }, 0)
        .add(() => { reveal(); done(); }, .5).to('#flash', { opacity: 0, duration: 1.6, ease: 'power2.out' }, .55)
        .fromTo(to, { scale: 1.3 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, .5);
    },
  };

  // ---------- air: smog / pollen particles + parallax ----------
  const cv = $('#air'), cx = cv.getContext('2d');
  const P = Array.from({ length: 170 }, () => ({ x: Math.random() * 1920, y: Math.random() * 1080, r: .6 + Math.random() * 2.6, s: .3 + Math.random(), a: Math.random() * 6.28 }));
  const air = { smog: 0, green: 0 }; let mx = 0, my = 0, tx = 0, ty = 0, t0 = performance.now();
  addEventListener('mousemove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; });
  gsap.ticker.add(() => {
    const t = (performance.now() - t0) / 1000; mx += (tx - mx) * .05; my += (ty - my) * .05;
    stage.style.setProperty('--px', ((mx + Math.sin(t * .35) * .45) * 16).toFixed(2)); stage.style.setProperty('--py', ((my + Math.cos(t * .27) * .45) * 10).toFixed(2));
    cx.clearRect(0, 0, 1920, 1080);
    const n = Math.round(60 + air.smog * 110), g = air.green;
    for (let i = 0; i < n; i++) { const p = P[i]; p.a += .008;
      p.x += (.25 + air.smog * 1.3) * p.s + Math.sin(p.a) * .3; p.y -= (.12 + g * .5) * p.s - air.smog * .08;
      if (p.x > 1940) p.x = -20; if (p.y < -20) p.y = 1100; if (p.y > 1110) p.y = -10;
      const al = (.16 + air.smog * .2 + g * .12) * (.5 + p.s * .5);
      cx.fillStyle = g > .5 ? `rgba(200,240,150,${al})` : air.smog > .05 ? `rgba(${200 - air.smog * 40},${180 - air.smog * 50},${150 - air.smog * 60},${al})` : `rgba(255,220,170,${al})`;
      cx.beginPath(); cx.arc(p.x, p.y, p.r * (1 + air.smog * .8), 0, 6.28); cx.fill(); }
  });
  const setAir = (s, D) => { const v = s.dataset.air, sm = v === 'g' ? 0 : +v;
    gsap.to(air, { smog: sm, green: v === 'g' ? 1 : 0, duration: 1.6 * D }); gsap.to('#smog', { opacity: Math.min(.42, sm * .5), duration: 1.6 * D }); };

  // ---------- navigation ----------
  let cur = -1, run = null;
  const finish = () => { if (run) { const r = run; run = null; r.master.progress(1); r.etl.progress(1); if (r.intro) $('#intro').style.display = 'none'; } };
  function go(n, instant = false) {
    if (n < 0 || n >= S.length || n === cur) return;
    finish();
    const from = S[cur], to = S[n], fwd = n > cur, etl = enter(to);
    const reveal = (dl = 0) => { to.classList.add('on'); if (dl) gsap.delayedCall(dl, () => etl.play()); else etl.play(); };
    const done = () => { if (from) { from.classList.remove('on'); gsap.set(from, { clearProps: 'transform,transformOrigin,filter,opacity,clipPath' }); } };
    setAir(to, instant ? 0 : 1);
    $('#sec').textContent = to.dataset.sec || ''; $('#cnt').textContent = String(n + 1).padStart(2, '0') + ' / ' + S.length; $('#prog b').style.width = ((n + 1) / S.length * 100) + '%';
    stage.style.setProperty('--ac', getComputedStyle(to).getPropertyValue('--ac'));
    cur = n;
    if (instant) { to.classList.add('on'); etl.progress(1); done(); return; }
    gsap.fromTo('#barT,#barB', { height: 0 }, { height: 46, duration: .4, ease: 'power2.inOut', yoyo: true, repeat: 1, repeatDelay: .55 });
    const master = TR[fwd ? (to.dataset.tr || 'fade') : 'fade'](from, to, reveal, done);
    run = { master, etl }; master.eventCallback('onComplete', () => { if (run && run.master === master && etl.progress() === 1) run = null; });
  }
  function intro() {
    const to = S[0], etl = enter(to); cur = 0; setAir(to, 0);
    $('#sec').textContent = to.dataset.sec; $('#cnt').textContent = '01 / ' + S.length; $('#prog b').style.width = (100 / S.length) + '%';
    rings.forEach((r, i) => { r.style.setProperty('--c', RC[i][0]); r.style.setProperty('--rim', RC[i][1]); });
    gsap.set('#tun', { autoAlpha: 1 }); gsap.set(rings, { '--r': '0px', opacity: 1 });
    const tl = gsap.timeline();
    tl.from('#intro .a', { opacity: 0, letterSpacing: '.9em', filter: 'blur(12px)', duration: 1.3, ease: 'expo.out' }, .2)
      .to('#intro .l', { scaleX: 1, duration: 1, ease: 'expo.inOut' }, .5).to('#intro .c', { opacity: 1, duration: .8 }, 1)
      .to('#intro', { scale: 1.5, opacity: 0, filter: 'blur(12px)', duration: .9, ease: 'power3.in' }, 2.3)
      .add(() => { to.classList.add('on'); etl.play(); }, 3.1)
      .fromTo(to, { scale: 1.7 }, { scale: 1, duration: 3.4, ease: 'expo.out' }, 3.1)
      .to(rings, { '--r': '1500px', duration: 2.1, ease: 'power2.inOut', stagger: .3 }, 3.1)
      .set('#tun', { autoAlpha: 0 }).add(() => { $('#intro').style.display = 'none'; });
    run = { master: tl, etl, intro: true };
    tl.eventCallback('onComplete', () => { if (run && run.master === tl) run = null; });
  }
  const next = () => { if (run && run.intro) { finish(); return; } go(cur + 1); };
  stage.addEventListener('click', next);
  addEventListener('keydown', e => {
    if ([' ', 'ArrowRight', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'f' || e.key === 'F') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (_) { } }
    else if (e.key === 'Home') go(0);
  });
  const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(intro);
  window.__deck = { go, finish, n: S.length, get cur() { return cur; }, get busy() { return !!run; } };
})();
