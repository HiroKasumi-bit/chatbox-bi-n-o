# Tạp chí Aurora Haven

Tạp chí khổ A4, 32 trang, viết bằng tiếng Anh, giới thiệu **Aurora Haven**, thành phố vùng cực.

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

File `.pptx` mở bằng PowerPoint, hoặc trên Canva chọn **Create a design → Import file** rồi chọn file.

Nên xem file PDF ở chế độ **hai trang** (Two Page View, có trang bìa riêng) để thấy các trang đôi: ảnh trải liền qua trang 4–5, 8–9, 10–11, 14–15 và 20–21.

**Việc bạn cần làm:** điền các chỗ trong ngoặc vuông `[Group name]`, `[Member names]`, `[Class]`, `[Date]` ở trang 3 (lời ban biên tập) và trang 32 (bìa sau).

## Nội dung

| Trang | Nội dung |
|---|---|
| 1 | Bìa: tháp Aurora 81, con phố dẫn tới spa và núi Mount Aurora dưới cực quang |
| 2–3 | Mục lục, lời ban biên tập |
| 4–5 | Trang đôi: toàn cảnh thành phố lúc hoàng hôn, giới thiệu chung |
| 6–7 | Thách thức vùng cực (bão tuyết), 5 nguyên tắc thiết kế |
| 8–9 | Trang đôi: bản đồ tổng thể và các khu |
| 10–13 | Trang đôi Liberty Mall lúc hoàng hôn, 9 ô phố trung tâm, đời sống hằng ngày |
| 14–16 | Khu đặc trưng 1: nhà máy nhiệt hạch (trang đôi ban đêm, bản vẽ và các công đoạn) |
| 17–18 | Khu đặc trưng 2: nhà máy Snow-to-Food |
| 19–22 | Khu đặc trưng 3: spa trong núi Mount Aurora, trang đôi bên trong hang Mineral Lake, các tầng spa |
| 23 | Sơ đồ vòng tuần hoàn giữa ba khu |
| 24–28 | Năng lượng, nước và rác, giao thông, nhà kính trồng rau, an toàn |
| 29–31 | Hướng dẫn tham quan 8 điểm, 35 địa điểm chính, các con số quan trọng |
| 32 | Bìa sau |

Toàn bộ chữ lấy từ file `magazine/source/Aurora_Haven_Slide_Content.docx` và các thẻ Name/Purpose/Feature trong file `magazine/source/Aurora_Haven_v13.json`. Không có số liệu nào được bịa thêm. Riêng biển hiệu cửa hàng trong ảnh (CAFÉ, BOOKS…) chỉ là chi tiết trang trí, không phải tên địa điểm có thật trong thành phố.

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
  assets/ui/                  lớp tối mờ đặt dưới chữ trên ảnh
  source/                     file nội dung (.docx), file 3D gốc (.json) và 4 bản vẽ gốc của nhóm
  tools/prepare_renders.py    chuyển ảnh chụp thô vào assets (cắt trang đôi, cắt tháp trên bìa)
  tools/make_shades.py        vẽ các lớp tối mờ trong assets/ui
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

- **Bản tạp chí trước (hai bản Eco-Polis và 3D Edition):** vẫn còn trong lịch sử git ở commit `c1ebb81`. Lấy lại bằng `git checkout c1ebb81 -- output magazine` (lệnh này ghi đè thư mục `magazine` và `output` hiện tại).
- **Chatbox cũ:** repo trước đây chứa file `index.html`, là chatbox hỏi đáp luật biển đảo. Khôi phục bằng `git checkout ed4bb0c -- index.html`. Lưu ý: file cũ có một Google API key ghi thẳng trong code. Nên vào Google AI Studio để xóa key đó và tạo key mới nếu còn dùng.
