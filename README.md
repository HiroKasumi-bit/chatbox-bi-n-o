# Tạp chí Aurora Haven

Tạp chí khổ A4 (24 trang, tiếng Anh) giới thiệu **Aurora Haven**, thành phố vùng cực. Có hai bản, nội dung chữ giống nhau, chỉ khác hình ảnh:

- **Bản 1:** ảnh chụp từ thành phố nhóm dựng trong Eco-Polis 3D Builder (file `.json`).
- **Bản 2 – 3D Edition:** cùng ý tưởng và số liệu, nhưng thành phố được dựng lại từ đầu bằng three.js (thư mục `city3d/`). Bản đồ 2D cũng vẽ mới từ chính mô hình này.

## Mở tạp chí

| File | Dùng để |
|---|---|
| `output/Aurora_Haven_Magazine.pptx` | Bản 1, chỉnh sửa được |
| `output/Aurora_Haven_Magazine.pdf` | Bản 1, để xem, in hoặc nộp |
| `output/Aurora_Haven_Magazine_3D_Edition.pptx` | Bản 2, chỉnh sửa được |
| `output/Aurora_Haven_Magazine_3D_Edition.pdf` | Bản 2, để xem, in hoặc nộp |

File `.pptx` mở bằng PowerPoint, hoặc trên Canva chọn **Create a design → Import file** rồi chọn file.

**Việc bạn cần làm:** điền các chỗ trong ngoặc vuông `[Group name]`, `[Member names]`, `[Class]`, `[Date]`. Các chỗ này nằm ở trang 2 (lời ban biên tập) và trang 24 (bìa sau) của mỗi bản.

## Nội dung

| Trang | Nội dung |
|---|---|
| 1 | Bìa: tháp Aurora 81 và núi Mount Aurora dưới cực quang |
| 2–3 | Mục lục, lời ban biên tập, tổng quan thành phố |
| 4–7 | Thách thức vùng cực, 5 nguyên tắc thiết kế, bản đồ tổng thể, khu trung tâm 9 ô phố |
| 8–13 | Ba khu đặc trưng: nhà máy nhiệt hạch, nhà máy Snow-to-Food, khu spa trong núi Mount Aurora (mỗi khu có ảnh 3D, bản vẽ và các công đoạn) |
| 14 | Sơ đồ vòng tuần hoàn giữa ba khu |
| 15–19 | Năng lượng, nước và rác, giao thông, đời sống, an toàn |
| 20 | Hướng dẫn tham quan 8 điểm |
| 21–23 | 35 địa điểm chính và các con số quan trọng |
| 24 | Bìa sau |

Toàn bộ chữ lấy từ file `magazine/source/Aurora_Haven_Slide_Content.docx` và các thẻ Name/Purpose/Feature trong file 3D `magazine/source/Aurora_Haven_v13.json`. Không có số liệu nào được bịa thêm.

**Ảnh bản 1** chụp từ chính file JSON trên app Eco-Polis 3D. Mình thêm đổ bóng và vẽ bầu trời, còn mô hình thành phố giữ nguyên như trong app.

**Ảnh bản 2** chụp từ thành phố tự dựng trong `city3d/`, với ba kiểu trời:
- **Mặt trời nửa đêm:** ngày vùng cực, nắng thấp và bóng đổ dài.
- **Đêm cực quang:** dùng cho bìa trước, bìa sau và một số trang.
- **Bão tuyết:** dùng cho trang 4.

Trời đêm có cực quang do script `magazine/tools/night_sky.js` tự vẽ, không dùng ảnh có sẵn.

## Xem thành phố 3D của bản 2

Thành phố trong `city3d/` mở được trên trình duyệt để xoay, phóng to, thu nhỏ. Cần Node.js:

```bash
cd city3d && npm install && cd ..
npx serve .                 # mở http://localhost:3000/city3d/
```

## Cấu trúc thư mục

```
output/                      hai bản tạp chí đã dựng (.pptx và .pdf)
magazine/
  build_magazine.js          script dựng tạp chí (pptxgenjs), dùng chung cho hai bản
  editions.js                phần khác nhau giữa bản 1 và bản 2 (ảnh, chú thích, vài dòng chữ)
  assets/                    bản 1: 4 bản vẽ 2D của bạn và ảnh 3D từ Eco-Polis
  assets_v2/                 bản 2: 4 bản đồ vẽ mới và ảnh từ thành phố three.js
  source/                    file 3D (.json) và file nội dung (.docx) gốc
  tools/render_3d.js         chụp lại ảnh bản 1 từ app Eco-Polis (Playwright)
  tools/night_sky.js         vẽ trời đêm có cực quang
  tools/shots.json           góc chụp, ánh sáng và bầu trời của ảnh bản 1
  tools/prepare_renders.py   chuyển ảnh chụp thành file trong assets/renders
  tools/apply_theme.js       ghi bảng màu của tạp chí vào file PowerPoint
city3d/
  index.html                 mở thành phố 3D trên trình duyệt
  src/layout.js              quy hoạch: vị trí các khu và 35 địa điểm (dùng cho cả 3D và bản đồ)
  src/*.js                   dựng địa hình, trung tâm, núi và spa, các nhà máy, sân bay, sân vận động
  tools/render.js            chụp ảnh cho bản 2
  tools/shots.json           góc chụp và kiểu trời của từng ảnh bản 2
  tools/plans.js             vẽ 4 bản đồ 2D của bản 2 từ mô hình
```

## Dựng lại tạp chí (khi sửa chữ trong script)

Cần Node.js:

```bash
cd magazine
npm install
node build_magazine.js       # bản 1 → output/Aurora_Haven_Magazine.pptx
node build_magazine.js v2    # bản 2 → output/Aurora_Haven_Magazine_3D_Edition.pptx
```

Tạo lại PDF: mở file .pptx bằng PowerPoint, chọn **File → Export → PDF** (hoặc dùng LibreOffice).

## Chụp lại ảnh

Cần Node.js, Playwright (Chromium) và Python có Pillow.

Bản 1 (khi file Eco-Polis thay đổi):

```bash
cd magazine
cp <file-json-mới> source/Aurora_Haven_v13.json
npm run render                                 # lưu ảnh PNG vào renders_raw/
python3 tools/prepare_renders.py renders_raw   # cập nhật assets/renders/
node build_magazine.js
```

Bản 2 (khi sửa thành phố trong `city3d/src`):

```bash
cd city3d
node tools/render.js tools/shots.json renders_raw   # ảnh PNG
node tools/plans.js ../magazine/assets_v2/plans     # 4 bản đồ 2D
```

Sau đó chuyển ảnh trong `renders_raw/` sang JPG trong `magazine/assets_v2/renders/`, rồi chạy `node build_magazine.js v2`.

## Khôi phục chatbox cũ

Repo trước đây chứa file `index.html`, là chatbox hỏi đáp luật biển đảo. File này vẫn còn trong lịch sử git, khôi phục bằng:

```bash
git checkout ed4bb0c -- index.html
```

Lưu ý: file cũ có một Google API key ghi thẳng trong code. Nên vào Google AI Studio để xóa key đó và tạo key mới nếu còn dùng.
