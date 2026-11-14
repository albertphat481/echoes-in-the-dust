# VantaLumen — Echoes in the Dust

> **NASA Space Apps Challenge 2026 Submission — Team VantaLumen**  
> *Keeping Space Exploration Stories Alive*

**Echoes in the Dust** là bộ sưu tập gồm **9 minigame không lời giàu cảm xúc** (wordless interactive anthology), đưa người chơi bước trực tiếp vào cơ chế vật lý của những thiết bị NASA huyền thoại — từ **Apollo 8 (1968)**, **Apollo 11 (1969)**, **Voyager 1**, **Cassini** cho tới **Artemis II (2026)**.

---

## 3 Quy Tắc Thiết Kế Xuyên Suốt

1. **Show trước, Tell sau**: Trong lúc chơi hoàn toàn không có chữ hay thanh `%` che khuất; sau khi màn chơi khép lại, thẻ **Mảnh Vỡ Ký Ức** mở ra cùng sơ đồ kỹ thuật JPL CAD, ảnh thật từ **NASA Image & Video Library API**, dữ liệu thiên văn trực tiếp (Live Ephemeris) và **Bộ 9 Câu Hỏi Song Ngữ VantaLumen**.
2. **Một ngôn ngữ cảm xúc**: Xám xanh lạnh & bụi (*Vanta*) tượng trưng cho sự lãng quên; vàng hổ phách ấm (*Lumen*) tượng trưng cho sự nhớ đến. Toàn bộ 9 màn dùng chung thang âm ngũ cung, WebGL Nebula Shader và **bộ tổng hợp âm thanh FM Web Audio V3**.
3. **Tối ưu Cảm ứng (Tablets & Phones) & Không có Game Over**: Chỉ chạm, giữ, vuốt trực quan trên màn hình cảm ứng hoặc dùng chuột/bàn phím trên máy tính.

---

## 9 Sứ Mệnh & Biểu Tượng Vũ Trụ NASA

1. **01 / 09 · UNDER THE DUST** — *InSight Mars Lander*: Vuốt tạo gió và giữ rải cát (*saltation*) cuốn bụi khỏi tấm pin mặt trời, lắng nghe 1.319 trận động đất Sao Hỏa (*marsquakes*).
2. **02 / 09 · STILL THERE** — *Apollo 11, 14, 15 Laser Retroreflectors*: Bắn xung laser lên Mặt Trăng và chờ **2,56 giây** thời gian ánh sáng khứ hồi để đo khoảng cách Mặt Trăng lùi xa 3,8 cm/năm.
3. **03 / 09 · ONE WHEEL LEFT** — *Spirit Rover (MER-A)*: Kéo lê chiếc bánh hỏng đi lùi qua Gusev Crater để cày lộ rãnh đất trắng **>90% Opaline Silica** — dấu vết suối nước nóng cổ đại.
4. **04 / 09 · UNSENT** — *Opportunity Rover (MER-B)*: Chọn 3 bức ảnh trong bộ nhớ RAM khả biến để truyền lên vệ tinh trung chuyển trước khi bão bụi toàn cầu năm 2018 buông xuống.
5. **05 / 09 · MOON STILL RINGS** — *Apollo 12 Passive Seismic Experiment*: Kích hoạt sóng địa chấn ngân vang hơn **55 phút** trong lớp vỏ Mặt Trăng khô rạn nứt, đối chiếu trực tiếp với Trái Đất.
6. **06 / 09 · ETERNAL FOOTPRINT** — *Apollo 11 & LRO*: Đóng dấu giày trên lớp bụi Regolith, thay đổi góc chiếu Mặt Trời và tua nhanh hàng triệu năm phong hóa vi thiên thạch.
7. **07 / 09 · PALE BLUE DOT** — *Voyager 1 (40,5 AU)*: Xoay ăng-ten Voyager 1 ở rìa Hệ Mặt Trời (cách nhà 6,05 tỷ km) để khóa nét Trái Đất rộng **0,12 pixel** nằm lơ lửng trong tia nắng tán xạ.
8. **08 / 09 · GRAND FINALE** — *Cassini–Huygens at Saturn*: Giữ hướng ăng-ten Cassini khóa chặt về Trái Đất khi lao vào bầu khí quyển Sao Thổ ở vận tốc **113.000 km/h** nhằm bảo vệ đại dương ngầm trên Enceladus.
9. **09 / 09 ★ · RISE — A LITTLE MOON WITH A BIG DREAM** — *NASA Artemis II Zero-Gravity Indicator (2026)*: Tương tác không trọng lực (0.00 G) trong khoang tàu Orion cùng linh vật **Rise** (do nhà thiết kế nhí 8 tuổi **Lucas Ye** sáng tạo từ cảm hứng bức ảnh *Earthrise* Apollo 8 năm 1968), khám phá 4 biểu tượng: **Thân Mặt Trăng**, **Mũ Trái Đất**, **Vành mũ 7 ngôi sao & 2 tên lửa**, và **Dấu chân Apollo 11 (1969)**.

---

## Phím Tắt & Chế Độ Ban Giám Khảo (Judge / Pitch Mode)

- **`1` – `9`** hoặc **`‹ ›`**: Chuyển nhanh giữa 9 màn chơi.
- **`R`**: Mở nhanh màn **09 · Rise — Artemis II Zero-G Indicator**.
- **`H`**: Cẩm nang hướng dẫn tóm tắt 9 trò chơi.
- **`I`**: Mở ngay thẻ **Mảnh Vỡ Ký Ức** & ảnh tư liệu NASA của màn hiện tại.
- **`Q`**: Mở **Bộ 9 Câu Hỏi Song Ngữ VantaLumen**.
- **`J`**: Mở **Hồ Sơ Dự Án NASA Space Apps (Mission Dossier)** & xuất **Chứng Nhận PNG (Lưới 3×3)**.
- **`M`**: Bật / Tắt âm thanh tổng hợp Web Audio.

## Chạy Độc Lập (Zero-Build)

Chỉ cần mở trực tiếp `index.html` trên trình duyệt bất kỳ (máy tính, iPad/tablet, điện thoại) hoặc triển khai thẳng lên **Vercel / GitHub Pages** mà không cần bước build.
