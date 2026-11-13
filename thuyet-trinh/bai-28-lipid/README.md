# Bài 28 – Lipid (KHTN 9) · Slide thuyết trình

- `Bai28_Lipid.pptx`: bản để **trình chiếu** (PowerPoint 365). Có chuyển cảnh Morph, hiệu ứng xuất hiện, đồng hồ đếm ngược và câu hỏi trắc nghiệm bấm để kiểm tra.
- `Bai28_Lipid.pdf`: bản để **nộp**, hiện đầy đủ nội dung và đáp án, không có hiệu ứng.
- `nguon/`: mã nguồn sinh slide (pptxgenjs + Python), dùng khi cần sửa và xuất lại.

Cách xuất lại: `npm install` trong `nguon/`, rồi chạy
`python3 prep.py && node build.js && APPLY_THEME=<skill pptx>/scripts/apply_theme.js node theme.js && python3 animate.py raw.pptx Bai28_Lipid.pptx`.
