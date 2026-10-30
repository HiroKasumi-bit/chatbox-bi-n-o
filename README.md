# Tạp chí Aurora Haven

Tạp chí khổ A4, 40 trang, viết bằng tiếng Anh, giới thiệu **Aurora Haven**, thành phố vùng cực. Bố cục bám theo hai file hướng dẫn của môn (Magazine guidelines và Report guidelines): đủ các mục bắt buộc, có mã QR tới video phỏng vấn thực tế, có trích nguồn và ghi rõ đâu là số thiết kế, đâu là ước tính, đâu là ý tưởng tương lai.

Mọi hình ảnh trong tạp chí đều do mình tự dựng và tự chụp từ mô hình 3D của thành phố (thư mục `city3d/`, viết bằng three.js), theo phong cách diễn họa kiến trúc:

- mặt tiền có kính phản chiếu, cửa hàng tầng trệt sáng đèn, người đi bộ, xe cộ, đèn đường hắt sáng xuống tuyết;
- bốn kiểu trời: nắng thấp (mặt trời nửa đêm), hoàng hôn vùng cực, đêm cực quang, bão tuyết;
- hai cảnh nội thất: hang Mineral Lake trong núi Mount Aurora và nhà kính Evergreen Greenhouse Dome.

Bốn bản đồ 2D (bản đồ tổng thể, hai khu đặc trưng, các tầng spa) cũng được vẽ từ chính mô hình này.

## Mở tạp chí

| File | Dùng để |
|---|---|
| `output/Aurora_Haven_Magazine.pptx` | Chỉnh sửa được |
| `output/Aurora_Haven_Magazine.pdf` | Xem, in hoặc nộp |
| `output/Aurora_Haven_Magazine_web.pdf` | Bản nhẹ (ảnh 150 dpi) để đưa lên FlipHTML5 |

File `.pptx` mở bằng PowerPoint, hoặc trên Canva chọn **Create a design → Import file** rồi chọn file.

Nên xem file PDF ở chế độ **hai trang** (Two Page View, có trang bìa riêng) để thấy các trang đôi: ảnh trải liền qua các trang đôi 4–5, 8–9, 12–13 và 18–19 (theo số in trên trang).

**Khi in:** in hai mặt, khổ A4, màu. Tờ thứ 2 và tờ thứ 39 trong file là mặt trong của bìa trước và bìa sau nên được để trắng. Nhờ vậy mục lục bắt đầu ở trang bên phải, và bìa sau rơi đúng vào mặt cuối. Tổng 40 trang là bội số của 4, nên cũng in được kiểu gấp đôi đóng ghim giữa.

**Việc nhóm cần làm trước khi nộp:**

1. Tạp chí không còn chỗ trống nào trong ngoặc vuông: tên nhóm (Polar City), 6 thành viên, vai trò, lớp 11A4, trường Lê Quý Đôn, logo trường và phần AI USE đã được điền. File `output/Aurora_Haven_Magazine_text.docx` chứa toàn bộ chữ để nhóm sửa.
2. Đọc lại và viết lại chữ bằng lời của nhóm. Hướng dẫn yêu cầu nội dung là của nhóm, nên phần chữ ở đây chỉ là bản nháp để nhóm sửa.
3. Mở link video (https://youtu.be/QwcP_2Q3Esc) xem video có để chế độ công khai (Public hoặc Unlisted) chưa, rồi quét thử mã QR bằng điện thoại.

**Mã QR:** trang 3 có mã tới video phỏng vấn https://youtu.be/QwcP_2Q3Esc; bìa sau có mã tới bản tạp chí tương tác trên FlipHTML5 (https://online.fliphtml5.com/aidsfjas4239PolarCut/Aurora_Haven_Magazine_web/). Script `magazine/tools/make_graphics.py` vẽ các mã rồi tự đọc lại bằng OpenCV, mã nào đọc không ra thì không được lưu. Trong file .pptx và .pdf, bấm vào mã hoặc dòng link bên cạnh cũng mở được.

**File bản đồ 3D:** `magazine/source/Aurora_Haven.json` mở bằng web Eco-Polis Builder (https://ecopolis3d.netlify.app/, nút 📂 Load). Ảnh chụp mô hình Ecopolis của nhóm nằm trong `magazine/assets/ecopolis/`. Mỗi khi file này thay đổi trên GitHub, workflow `.github/workflows/map-release.yml` tự đăng lại file lên Release `map-v1`, nên link tải https://github.com/HiroKasumi-bit/chatbox-bi-n-o/releases/latest/download/Aurora_Haven.json luôn là bản mới nhất.

## Nội dung

Số trang in trên tạp chí không tính bìa trước và mặt trong của nó: **mục lục là trang 1**. Bìa sau và mặt trong của nó không đánh số.

| Trang | Nội dung | Mục trong hướng dẫn |
|---|---|---|
| Bìa trước | Bìa: ảnh flycam ban đêm như ảnh chụp thật (góc `cover_aerial` của mô hình 3D, làm thật bằng Nano Banana Pro), nhãn chỉ vào 3 đột phá kèm số trang, khẩu hiệu "A polar city that thrives" | Cover |
| (không đánh số) | Để trắng (mặt trong bìa trước) | |
| 1 | Mục lục, chia theo phần: Welcome, The city, The breakthroughs, Invest, Systems & life, The guide | Table of contents |
| 2 | Thư của nhóm sáng lập (phần mở đầu do nhóm viết) | Letter from the Founders |
| 3 | 6 thành viên: ảnh, vai trò; mã QR tới video phỏng vấn | Letter from the Founders |
| 4–5 | Trang đôi: toàn cảnh thành phố, giới thiệu chung; trang 5 tóm tắt 3 tính năng đặc sắc nhất (3 đột phá), kèm số trang | Breakthrough innovations |
| 6 | Thách thức vùng cực, có số liệu thật kèm nguồn | Vision & Crisis |
| 7 | Tầm nhìn, sứ mệnh, ai bị ảnh hưởng, 5 nguyên tắc | Vision & Crisis |
| 8–9 | Trang đôi: Liberty Mall và tượng đài Founding Mayor Monument | Housing & special locations |
| 10 | Bản đồ tổng thể (một trang) | Housing & special locations |
| 11 | 9 ô phố trung tâm | Housing & special locations |
| 12–20 | Ba đột phá: nhà máy nhiệt hạch, nhà máy Snow-to-Food, ngọn núi tuyết có khu giải trí bên trong (trang đôi 12–13 và 18–19). Trang mở đầu mỗi đột phá có khung "In brief" (The problem · The idea · What's new · The impact); mỗi đột phá có ô "Where the world is today" và "Reality check" đặt ngay trên ảnh; trang 14 có ô "Why it's green" | Breakthrough innovations |
| 21 | Built by Us: ảnh thật mô hình Ecopolis của nhóm, 2 mã QR (tải file bản đồ, mở web Eco-Polis) và 5 bước hướng dẫn | Breakthrough innovations |
| 22 | Vòng tuần hoàn giữa ba khu | Infrastructure |
| 23 | Đời sống hằng ngày: trường, y tế, mua sắm, văn hóa | Housing & special locations |
| 24 | Nhà ở: cách nhà chống lạnh, nhà cho mọi lứa tuổi | Transport & Housing |
| 25 | Năng lượng 3 giai đoạn: gió + mặt trời khởi động nhiệt hạch, nhiệt hạch cấp điện, gió + mặt trời làm dự phòng | Infrastructure |
| 26 | Nước và rác | Infrastructure |
| 27 | Hệ sinh thái đô thị | Urban Eco-System |
| 28 | Giao thông | Getting Around |
| 29–30 | Nhà kính trồng rau, an toàn | Infrastructure |
| 31 | Ưu và nhược điểm | Pros & Cons |
| 32 | Gọi vốn | Investment CTA |
| 33–34 | Tham quan 8 điểm, 35 địa điểm | Housing & special locations |
| 35 | Through a Resident's Eyes: một ngày của cư dân (câu chuyện tưởng tượng) | Housing & special locations |
| 36 | Nguồn tham khảo [1]–[20], cách đọc số liệu, khai báo dùng AI | Sources |
| (không đánh số) | Để trắng (mặt trong bìa sau) | |
| Bìa sau | Bìa sau: phần kết do nhóm viết, lời kêu gọi, liên hệ nhóm, logo, mã QR | Back cover |

**Nguồn chữ và số liệu:**

- Thông tin về thành phố lấy từ `magazine/source/Aurora_Haven_Slide_Content.docx` và các thẻ Name/Purpose/Feature trong `magazine/source/Aurora_Haven.json`. Đây là số liệu thiết kế của nhóm.
- Bản đồ và mô hình 3D giữ đúng hướng các khu và địa điểm như trong mô hình Ecopolis của nhóm (file `.json` trên). Riêng khoảng cách thì được giãn rộng ra để các tòa nhà không chồng lên nhau, nên không phải số đo của nhóm. Trong ô phố trung tâm, các góc được xếp đúng như file `.json`: Civic Center ở tây bắc, bệnh viện và trường Northern Lights School ở đông bắc, siêu thị Igloo Fresh và rạp Aurora Cinema ở tây nam.
- Số liệu thế giới thật (Bắc Cực ấm nhanh gần 4 lần, băng vĩnh cửu tan, ITER, Solar Foods, Blue Lagoon…) đều có số trong ngoặc vuông dẫn tới danh sách nguồn ở trang 36.
- Các phép tính kiểm tra (nhiên liệu nhiệt hạch, năng lượng làm tan tuyết, lượng nước mỗi người) nằm trong các ô "Reality check" ở trang 13, 16 và 19, và sức chở của metro ở trang 28, là ước tính của nhóm và được ghi rõ như vậy.
- Biển hiệu cửa hàng trong ảnh (CAFÉ, BOOKS…) chỉ là chi tiết trang trí, không phải tên địa điểm có thật trong thành phố.

## Xem thành phố 3D

Thành phố trong `city3d/` mở được trên trình duyệt để xoay, phóng to, thu nhỏ. Cần Node.js:

```bash
cd city3d && npm install && cd ..
npx serve .                 # mở http://localhost:3000/city3d/
```

## Cấu trúc thư mục

```
output/                       tạp chí đã dựng (.pptx và .pdf)
magazine/
  build_magazine.js           script dựng tạp chí (pptxgenjs)
  assets/renders/             ảnh chụp từ thành phố 3D (ảnh trang đôi được cắt thành nửa _L và _R)
  assets/plans/               4 bản đồ 2D vẽ từ mô hình
  assets/ui/                  lớp tối mờ đặt dưới chữ trên ảnh, mã QR, logo thành phố
  source/                     file nội dung (.docx), file 3D gốc (.json) và 4 bản vẽ gốc của nhóm
  tools/prepare_renders.py    chuyển ảnh chụp thô vào assets (cắt trang đôi, cắt tháp trên bìa)
  tools/make_shades.py        vẽ các lớp tối mờ trong assets/ui
  tools/make_graphics.py      vẽ mã QR tới video phỏng vấn (có quét thử) và logo thành phố
  tools/apply_theme.js        ghi bảng màu của tạp chí vào file PowerPoint
city3d/
  index.html                  mở thành phố 3D trên trình duyệt
  src/layout.js               quy hoạch: vị trí các khu và 35 địa điểm (dùng cho cả 3D và bản đồ)
  src/textures.js             vẽ mặt tiền: kính, khung cửa, phòng sáng đèn, gạch, ván gỗ, cửa hàng
  src/kit.js                  nhà, cửa hàng, cây thông, đèn đường, xe, người
  src/lights.js               vũng sáng dưới đèn đường, ánh đèn cửa hàng, đèn pha xe
  src/interiors.js            hai cảnh nội thất: hang Mineral Lake và nhà kính
  src/night_sky.js            vẽ trời đêm có cực quang
  src/*.js                    địa hình, khu trung tâm, núi và spa, các nhà máy, sân bay, sân vận động
  tools/render.js             chụp ảnh cho tạp chí
  tools/shots.json            góc chụp, kiểu trời và kích thước của từng ảnh
  tools/plans.js              vẽ 4 bản đồ 2D từ mô hình
```

## Dựng lại tạp chí (khi sửa chữ trong script)

Cần Node.js:

```bash
cd magazine
npm install
node build_magazine.js       # → output/Aurora_Haven_Magazine.pptx
```

Tạo lại PDF: mở file .pptx bằng PowerPoint, chọn **File → Export → PDF** (hoặc dùng LibreOffice).

Vẽ lại mã QR và logo (khi đổi link video) cần Python với `pip install segno opencv-python-headless pillow numpy`, rồi sửa `INTERVIEW_URL` trong `tools/make_graphics.py` và chạy `python3 tools/make_graphics.py`. Nhớ sửa cả `INTERVIEW_URL` ở đầu `build_magazine.js`, rồi dựng lại tạp chí.

## Chụp lại ảnh (khi sửa thành phố trong `city3d/src`)

Cần Node.js, Playwright (Chromium) và Python có Pillow. Mỗi ảnh mất khoảng 15–50 giây.

```bash
cd city3d
npm install
node tools/render.js tools/shots.json ../magazine/renders_raw   # ảnh thô
node tools/plans.js ../magazine/assets/plans                     # 4 bản đồ 2D
cd ../magazine
python3 tools/prepare_renders.py renders_raw                     # đưa ảnh vào assets
node build_magazine.js
```

Muốn chụp lại vài ảnh thôi thì thêm tên ảnh vào cuối lệnh render, ví dụ `node tools/render.js tools/shots.json ../magazine/renders_raw cover,spa`.

## Khôi phục

- **Bản 36 trang trước khi thêm trang gọi vốn và trang trắng:** ở commit `091654d`. Lấy lại bằng `git checkout 091654d -- output magazine`.
- **Bản trước khi xếp lại ô phố trung tâm theo file `.json`:** ở commit `5db628b`. Lấy lại bằng `git checkout 5db628b -- output magazine city3d`.
- **Bản 32 trang trước khi bổ sung theo hướng dẫn:** ở commit `6e33615`. Lấy lại bằng `git checkout 6e33615 -- output magazine city3d` (ghi đè ba thư mục này).
- **Bản tạp chí trước nữa (hai bản Eco-Polis và 3D Edition):** vẫn còn trong lịch sử git ở commit `c1ebb81`. Lấy lại bằng `git checkout c1ebb81 -- output magazine` (lệnh này ghi đè thư mục `magazine` và `output` hiện tại).
- **Chatbox cũ:** repo trước đây chứa file `index.html`, là chatbox hỏi đáp luật biển đảo. Khôi phục bằng `git checkout ed4bb0c -- index.html`. Lưu ý: file cũ có một Google API key ghi thẳng trong code. Nên vào Google AI Studio để xóa key đó và tạo key mới nếu còn dùng.
