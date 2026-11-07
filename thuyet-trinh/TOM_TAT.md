# Tóm tắt các bài thuyết trình đã làm (đọc file này thay cho lịch sử chat)

Cập nhật: 07/11/2026. Mọi thứ nằm trên nhánh `ccr-32dbab14-4ki8g2` của repo `hirokasumi-bit/chatbox-bi-n-o`, trong thư mục `thuyet-trinh/`.

## Người dùng
- Sinh viên sư phạm (Khoa Lý – Hoá, ĐHSP – ĐHĐN), trả lời bằng tiếng Việt, muốn giao việc rồi duyệt.
- Thích được hỏi vài câu trước khi làm việc lớn. Đã khen phong cách thiết kế của cả hai bộ slide.
- Luôn kiểm tra kỹ kết quả: phải tự soát hình trước khi giao (lỗi lần trước: vòng khoanh lệch trên bản online).

## 1. Bài 28 – Lipid (KHTN 9) · PowerPoint
- Thư mục: `thuyet-trinh/bai-28-lipid/` → `Bai28_Lipid.pptx` (66 slide, trình chiếu) + `Bai28_Lipid.pdf` (nộp) + `nguon/` (mã sinh slide).
- Dùng cho: thi nghiệp vụ sư phạm. Nhóm báo cáo **26SKT2**, Trường ĐHSP – ĐHĐN, Khoa Lý – Hoá.
- Phong cách: xanh lá đậm + vàng dầu ăn, bong bóng trôi (Morph), chữ Cambria/Calibri, nền tối cho bìa và đầu chương.
- Thứ tự: chào mừng (logo trường + khoa) → trò chơi Tiếp sức đồng đội (chào mừng, luật, 60 s, 120 s, đáp án) → giới thiệu bài → mục tiêu → I. Lipid → II. Chất béo (PHT 2, 3, 4 ngay sau slide mở phần II, rồi học theo trạm, phản ứng xà phòng hoá có Morph) → ứng dụng & sức khoẻ → vận dụng → trò chơi "Hỏi xoay đáp xoáy" 8 câu (bấm chọn đáp án, đồng hồ 15 s) → về nhà → nguồn ảnh → cảm ơn.
- Đã sửa theo ý người dùng: "cồn 90°" ở câu 7; câu 6 và câu 8 chuyển sang trắc nghiệm; bỏ slide video.
- Ảnh: lấy từ file Word/SGK/mẫu; ảnh thiếu tải từ Wikimedia Commons (có slide ghi tác giả + giấy phép).
- Cách dựng: pptxgenjs (`build.js`, `lib.js`) → `apply_theme.js` của skill pptx → `animate.py` chèn Morph, hiệu ứng, nút bấm kích hoạt → kiểm tra bằng `validate.py` + LibreOffice → PDF.

## 2. Eco-Polis · "The Sea God Returns" · slide HTML rối giấy
- Link online: https://claude.ai/artifact/6L8tq68Bwbd33SuXshSmU1 (đang chia sẻ "ai có link cũng xem được").
- Thư mục: `thuyet-trinh/eco-polis-sea-god/` → `The_Sea_God_Returns_offline.zip` (giải nén, mở `index.html`), `The_Sea_God_Returns_slides.pdf` (40 trang), `nguon/` (mã nguồn).
- Bối cảnh: thi pitch thành phố tương lai, nhóm 6 lớp 11A4 THPT Lê Quý Đôn. Thành phố **Eco-Polis – The Cliff City** (tạp chí 21 trang + tờ rời nhà đầu tư). Kịch bản tiếng Anh: Sơn Tinh – Thủy Tinh năm 2050, 6 cảnh, 4 "đòn tấn công" (lũ, mất điện, chặn đường, sạt lở), cuối là làm hoà + kêu gọi đầu tư STEM Dollars, rồi Q&A.
- Vai: Nguyên = Sơn Tinh/Thị trưởng · Huy = Kiến trúc sư · Bách = Kỹ sư năng lượng · Linh = Mỵ Nương (dẫn chuyện) · Hưng = Thủy Tinh · Khang = Chỉ huy an toàn.
- Phong cách (theo yêu cầu): sân khấu kịch đỏ – đen, rèm vén hai bên và phía trên; rối giấy vẽ tay gắn que; nhân vật truyền thuyết vẽ giống hình phổ biến trên mạng; chỉ hiệu ứng âm thanh (không nhạc, không giọng đọc).
- Quy tắc quan trọng: **khi kỹ sư hoặc chỉ huy an toàn nói** → sân khấu mờ, rối người nói hiện to bên trái, bảng bên phải phóng to ảnh mô hình 3D (tạp chí) và khoanh đúng kết cấu đang nói + số liệu.
- 40 nhịp bấm; phím: → / dấu cách / chuột = tiếp, ← lùi, F toàn màn hình, N ai nói, M âm thanh.
- Mã nguồn: `art.js` (vẽ SVG nhân vật, rèm, thành phố), `app.js` (danh sách nhịp `BEATS`, bảng kỹ sư `OV`, âm thanh tổng hợp WebAudio), `deck.html` (bản offline), `sea_god_returns.html` (bản đăng online: không có thẻ html/head/body, GSAP từ cdnjs).
- Toạ độ khoanh trong `OV` là tỉ lệ (0–1) trên ảnh `img/cutaway.jpg` (2048×1530).

## 3. "Tôi có một ước mơ" (Văn bản 2, Ngữ văn) · slide HTML kiểu bảo tàng
- Link: https://claude.ai/artifact/9Z4d3uc4UKNNHKEPVncbz6 · thư mục `thuyet-trinh/toi-co-mot-uoc-mo/` (zip offline, PDF 14 trang, `nguon/`).
- Nội dung = 4 trang vở viết tay của người dùng (Câu 1–3), **giữ y nguyên từng chữ**; chỗ chưa đọc chắc hiện ô vàng có dấu "?" (class `unk` trong `deck.html`).
- Phong cách học từ video TikTok Neu Web Studio (Figma Smart Animate, "history museum"): xanh rêu tối + cẩm thạch, lớp tán lá phía trước, cột Đài Lincoln, tượng Lincoln, ảnh MLK 1963 (tách nền bằng rembg), chuyển sang bình minh ở phần "giấc mơ".
- 14 nhịp; camera mỗi nhịp khai báo trong mảng `B` của `app.js`.

## Bài học kỹ thuật (để không lặp lỗi)
- Trang đăng online tự thêm `img{max-width:100%}` → ảnh trong khung phóng to bị méo. Phải đặt `max-width:none` cho ảnh đó, và khi chạy thử thì chèn quy tắc này vào trang để kiểm tra giống bản online.
- GSAP: bật `gsap.ticker.lagSmoothing(0)` để hiệu ứng kết thúc đúng giờ trên máy yếu.
- Kiểm tra: dùng Playwright bấm qua từng nhịp, chụp màn hình, ghép thành bảng xem nhanh (`qa.js`, `sheet.py`, `ovcheck.js`, `pdfcap.js`).
- Wikimedia Commons: tải qua `Special:FilePath/<tên file>?width=900` với User-Agent riêng, hay bị giới hạn 429 → chờ rồi thử lại; lấy tác giả/giấy phép bằng một lệnh API gộp. Openverse không vào được. TikTok không đọc được (người dùng gửi file mp4 thay thế).
- Link Claude Docs của người dùng phải được chia sẻ mới đọc được; nếu không, nhờ dán nội dung.
- pptxgenjs không cài sẵn toàn cục: `npm install pptxgenjs react-icons react react-dom sharp` trong thư mục làm việc.
- Thư mục scratchpad bị xoá khi phiên kết thúc → mọi thứ cần giữ phải đưa vào repo và push.

## Mẫu tham khảo
- Bộ "Into Aurora Haven" (phiên cũ của người dùng, artifact `KXzbjNYSxJxZgrW3RtH5cK`): slide HTML điện ảnh 1920×1080, 3D three.js + GSAP, trợ lý ảo AURA, có gói offline + PDF + kịch bản.
