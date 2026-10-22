# Tạp chí Aurora Haven

Tạp chí khổ A4 (24 trang, tiếng Anh) giới thiệu **Aurora Haven**, thành phố vùng cực dựng trong Eco-Polis 3D Builder.

## Mở tạp chí

| File | Dùng để |
|---|---|
| `output/Aurora_Haven_Magazine.pptx` | Bản chỉnh sửa được: mở bằng PowerPoint, hoặc trên Canva chọn **Create a design → Import file** rồi chọn file này |
| `output/Aurora_Haven_Magazine.pdf` | Bản để xem, in hoặc nộp |

**Việc bạn cần làm:** điền các chỗ trong ngoặc vuông `[Group name]`, `[Member names]`, `[Class]`, `[Date]`. Các chỗ này nằm ở trang 2 (lời ban biên tập) và trang 24 (bìa sau).

## Nội dung

| Trang | Nội dung |
|---|---|
| 1 | Bìa: tháp Aurora 81 và núi Mount Aurora dưới cực quang |
| 2–3 | Mục lục, lời ban biên tập, tổng quan thành phố |
| 4–7 | Thách thức vùng cực, 5 nguyên tắc thiết kế, bản đồ tổng thể, khu trung tâm 9 ô phố |
| 8–13 | Ba khu đặc trưng: nhà máy nhiệt hạch, nhà máy Snow-to-Food, khu spa trong núi Mount Aurora (mỗi khu có ảnh 3D, bản vẽ và các công đoạn) |
| 14 | Sơ đồ vòng tuần hoàn giữa ba khu |
| 15–19 | Năng lượng, nước và rác, giao thông, đời sống, an toàn |
| 20 | Hướng dẫn tham quan 8 điểm trong app 3D |
| 21–23 | 35 địa điểm chính và các con số quan trọng |
| 24 | Bìa sau |

Toàn bộ chữ lấy từ file `magazine/source/Aurora_Haven_Slide_Content.docx` và các thẻ Name/Purpose/Feature trong file 3D `magazine/source/Aurora_Haven_v13.json`. Không có số liệu nào được bịa thêm.

Ảnh 3D được chụp từ chính file JSON trên app Eco-Polis 3D. Để ảnh đẹp như tạp chí, mình thêm đổ bóng và vẽ bầu trời. Bìa trước, bìa sau và ảnh hồ ở trang 2 là cảnh đêm vùng cực: trời sao, cực quang, núi xa và cánh đồng tuyết kéo dài tới chân trời. Phần trời đêm do script `tools/night_sky.js` tự vẽ, không dùng ảnh có sẵn. Mô hình thành phố giữ nguyên như trong app.

## Cấu trúc thư mục

```
output/                     tạp chí đã dựng (.pptx và .pdf)
magazine/
  build_magazine.js         script dựng tạp chí (pptxgenjs)
  assets/plans/             4 bản vẽ 2D của bạn
  assets/renders/           ảnh 3D đã chụp
  source/                   file 3D (.json) và file nội dung (.docx) gốc
  tools/render_3d.js        chụp lại ảnh 3D từ app Eco-Polis (Playwright)
  tools/night_sky.js        vẽ trời đêm có cực quang cho các ảnh đêm
  tools/shots.json          vị trí camera, ánh sáng và bầu trời của từng ảnh
  tools/prepare_renders.py  chuyển ảnh chụp thành file trong assets/renders
  tools/apply_theme.js      ghi bảng màu của tạp chí vào file PowerPoint
```

## Dựng lại tạp chí (khi sửa chữ trong script)

Cần Node.js:

```bash
cd magazine
npm install
npm run build        # tạo lại output/Aurora_Haven_Magazine.pptx
```

Tạo lại PDF: mở file .pptx bằng PowerPoint, chọn **File → Export → PDF** (hoặc dùng LibreOffice).

## Chụp lại ảnh 3D (khi thành phố thay đổi)

Cần Node.js, Playwright (Chromium) và Python có Pillow:

```bash
cd magazine
cp <file-json-mới> source/Aurora_Haven_v13.json
npm run render                                 # lưu ảnh PNG vào renders_raw/
python3 tools/prepare_renders.py renders_raw   # cập nhật assets/renders/
npm run build
```

## Khôi phục chatbox cũ

Repo trước đây chứa file `index.html`, là chatbox hỏi đáp luật biển đảo. File này vẫn còn trong lịch sử git, khôi phục bằng:

```bash
git checkout ed4bb0c -- index.html
```

Lưu ý: file cũ có một Google API key ghi thẳng trong code. Nên vào Google AI Studio để xóa key đó và tạo key mới nếu còn dùng.
