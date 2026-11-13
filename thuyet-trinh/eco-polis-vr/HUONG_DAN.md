# Eco-Polis VR: xem bản đồ Living City bằng kính VR Box

Trang web hiển thị bản đồ `EcoPolis_Project_LivingCity_1.json` (4002 công trình, 65 mô hình, chế độ hang động) dưới dạng hai hình cạnh nhau cho kính VR Box. Quay đầu là nhìn quanh nhờ cảm biến xoay của điện thoại.

## Cách xem nhanh nhất (link có sẵn)
Mở link này trên điện thoại bằng Chrome (Android) hoặc Safari (iPhone):

https://raw.githack.com/HiroKasumi-bit/chatbox-bi-n-o/ccr-32dbab14-4ki8g2/thuyet-trinh/eco-polis-vr/index.html

Lần đầu mở, trang githack hiện một trang thông báo "External Content Notice": bấm nút **Open the page** để vào. Link chạy bằng HTTPS nên được dùng cảm biến xoay. Cần mạng, tải khoảng 9 MB.

## Tự chạy trên điện thoại (không cần mạng)
Cảm biến xoay chỉ hoạt động khi trang mở bằng `https://` hoặc `http://localhost`. Mở thẳng file `index.html` sẽ không tải được mô hình.

**Android**
1. Tải `thuyet-trinh/eco-polis-vr_offline.zip` về máy và giải nén.
2. Cài một ứng dụng máy chủ web cục bộ trên Play Store (tìm "HTTP server"), chọn thư mục `eco-polis-vr` vừa giải nén làm thư mục gốc.
3. Mở Chrome trên **chính điện thoại đó**, vào `http://localhost:<cổng>/index.html`. Cổng do ứng dụng hiển thị, ví dụ 8080.

Không dùng địa chỉ dạng `http://192.168…` vì trình duyệt sẽ chặn cảm biến xoay.

**iPhone**: không có cách chạy máy chủ cục bộ đơn giản, nên dùng link có sẵn ở trên.

**Máy tính**: trong thư mục `eco-polis-vr`, chạy `python -m http.server 8000`, rồi mở `http://localhost:8000`. Kéo chuột để nhìn; W A S D để đi, Q và E để hạ hoặc nâng độ cao, giữ Shift để đi nhanh.

## Cách dùng với kính
1. Xoay ngang điện thoại, bấm **Đeo kính VR**. Trên iPhone, bấm **Cho phép** khi được hỏi quyền chuyển động.
2. Đặt máy vào kính, vạch đen nằm giữa hai tròng.
3. Nếu hai hình bị lệch, khó nhìn thành một (hay gặp ở điện thoại to), thoát ra và kéo thanh **Khoảng cách hai hình** sang phải một chút.
4. Khi đeo kính:
   - **Quay đầu** để nhìn xung quanh.
   - **Cúi nhìn xuống chân** để hiện vòng 9 điểm đến. Giữ dấu ngắm trên một thẻ khoảng 1,5 giây là bay tới đó.
   - **Chạm màn hình** hoặc bấm nút trên kính để bay tới trước 6 đơn vị theo hướng đang nhìn.
   - **Nhìn vào một công trình** để hiện tên và chức năng của nó, lấy từ mục `details` trong file JSON và giữ nguyên tiếng Anh.
5. Nút góc trên bên phải:
   - ⟲: đặt lại hướng nhìn.
   - ◫: đổi giữa 1 hình và 2 hình.
   - ✕: thoát.

9 điểm đến:
1. Toàn cảnh
2. Đại lộ vành đai (tầng 0)
3. Công viên
4. Ngước nhìn lục địa trên trời
5. Lục địa trên trời (+28)
6. Phố ngầm (−9)
7. Khu nhà ngầm (−18)
8. Lõi sâu nhất (−27)
9. Mặt cắt các tầng

## Ghi chú kỹ thuật
- Vị trí, góc xoay và tỉ lệ từng vật lấy đúng theo JSON. Hai hàm chỉnh tâm và màu mô hình (`builder_fns.js`) chép nguyên từ trang builder Eco-Polis, nên màu giống bản gốc.
- Mô hình `.glb` và ảnh nền hang `cave.jpg` tải từ `ecopolis3d.netlify.app`. Ảnh nền gốc chỉ 391×260 nên đã được phóng to và làm mịn thành `cave_smooth.jpg`.
- Để điện thoại chạy nhẹ:
  - Mỗi loại mô hình được vẽ một lần cho mọi bản sao (InstancedMesh).
  - Phần bản đồ nằm sau lưng không được vẽ.
  - Nếu máy bị giật, trang tự giảm độ nét.
- Thư viện: three.js r160 (`vendor/`).
- Muốn thay bản đồ khác: thay file `city.json` bằng file xuất từ builder có cùng cấu trúc.
