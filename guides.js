/**
 * 6 Separate Gameplay Guides ("Hướng Dẫn Cách Chơi") for the 6 VantaLumen Minigames
 */

window.GAME_GUIDES = [
  {
    id: 'under-the-dust',
    number: '01 / 06',
    title: 'UNDER THE DUST — Nhịp Tim Dưới Lớp Bụi',
    hardware: 'Trạm đổ bộ NASA InSight & Pin mặt trời UltraFlex',
    goal: 'Thổi tan lớp bụi Sao Hỏa trước khi Mặt Trời lặn để đánh thức nhịp tim địa chấn của hành tinh đỏ.',
    controls: [
      {
        gesture: 'Nhấn / Chạm trực tiếp',
        action: 'Mỗi cú chạm tạo một xung gió mạnh thổi tung bụi trên diện rộng ngay lập tức.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="2" fill="rgba(245,158,11,0.16)"/><circle cx="24" cy="24" r="5" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Vuốt / Rê chuột qua mặt pin',
        action: 'Tạo luồng gió vàng ấm quét sạch bụi cam và thắp sáng từng ô pin UltraFlex.',
        svg: `<svg viewBox="0 0 48 48"><path d="M8 26 C18 16, 28 32, 40 20" stroke="#fcd34d" stroke-width="2.5" fill="none" stroke-linecap="round"/><polyline points="34,18 40,20 38,26" stroke="#fcd34d" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
      },
      {
        gesture: 'Nhấn giữ để tạo xoáy gió',
        action: 'Kích hoạt xoáy cát vàng (saltation) quay quanh con trỏ, tự động đánh bật bụi cứng đầu cực nhanh.',
        svg: `<svg viewBox="0 0 48 48"><path d="M8 34 Q18 18 28 32 T42 20" stroke="#38bdf8" stroke-width="2.2" fill="none" stroke-dasharray="4 3"/><circle cx="28" cy="30" r="3.5" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm hoặc vuốt ngang mặt pin mặt trời hình tròn để thổi mở vệt sáng hổ phách đầu tiên.',
      'Nhấn giữ tại vùng bụi dày để bật xoáy cát vàng quét dọn siêu tốc quanh con trỏ.',
      'Quan sát vòng năng lượng vàng quanh lõi trung tâm — khi đầy vòng (hoặc sau 18 giây), giai điệu chữ ký 3 nốt và bản khắc tên kỹ sư NASA sẽ hiện ra!'
    ],
    tip: 'Không có thanh % hay thua cuộc: nhịp tim địa chấn sẽ đập nhanh và ấm dần theo từng ô pin bừng sáng!'
  },
  {
    id: 'still-there',
    number: '02 / 06',
    title: 'STILL THERE — Vẫn Còn Ở Đó',
    hardware: 'Gương phản xạ Laser Apollo 11, 14, 15 trên Mặt Trăng',
    goal: 'Khóa tâm ngắm vào 3 hải đăng phản xạ phát sáng trên Mặt Trăng để ghép thành tam giác chòm sao Apollo.',
    controls: [
      {
        gesture: 'Rê chuột / Chạm để khóa tâm',
        action: 'Đưa tâm ngắm lại gần 3 điểm sáng nhấp nháy — vòng ngắm sẽ tự hút nam châm và đổi sang màu vàng rực khi khóa chuẩn.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="1.8" fill="none"/><line x1="24" y1="6" x2="24" y2="14" stroke="#fcd34d" stroke-width="1.8"/><line x1="24" y1="34" x2="24" y2="42" stroke="#fcd34d" stroke-width="1.8"/><circle cx="24" cy="24" r="3" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Click / Chạm hoặc nhấn Space',
        action: 'Bắn tia laser xanh từ Trái Đất thẳng tới gương Apollo (hoặc giữ nhẹ rồi thả đều được).',
        svg: `<svg viewBox="0 0 48 48"><line x1="10" y1="40" x2="36" y2="12" stroke="#38bdf8" stroke-width="2.5"/><circle cx="36" cy="12" r="4" fill="#fef3c7"/></svg>`
      },
      {
        gesture: 'Đón xung vọng thủy tinh',
        action: 'Hạt photon phản xạ bay ngược về rất mượt và ngân lên tiếng chuông pha lê khi chạm trạm.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke="#fcd34d" stroke-width="2" fill="none"/><circle cx="24" cy="24" r="6" fill="#fef3c7"/></svg>`
      }
    ],
    steps: [
      'Di chuyển tâm ngắm về phía 3 hải đăng đang tỏa vòng sáng trên đĩa Mặt Trăng (Apollo 11, 14 và 15).',
      'Khi vòng ngắm khóa vàng vào mục tiêu, click chuột / chạm màn hình (hoặc nhấn phím Space) để phóng tia laser.',
      'Chờ tia photon dội ngược về đài quan sát để thắp sáng đủ 3 đỉnh của tam giác vàng Apollo.'
    ],
    tip: 'Khoảng cách thực giữa Trái Đất và Mặt Trăng là 384.400 km — mỗi tiếng chuông vọng là một xác nhận: các gương vẫn còn ở đó!'
  },
  {
    id: 'one-wheel-left',
    number: '03 / 06',
    title: 'ONE WHEEL LEFT — Một Bánh Còn Lại',
    hardware: 'Xe tự hành NASA Spirit (MER-A) tại Gusev Crater',
    goal: 'Lái rover Spirit tiến về phía Đỉnh Silica Hoàng Hôn (vùng sáng ngọc lam bên phải) và cày lộ rãnh đất phát sáng.',
    controls: [
      {
        gesture: 'Phím mũi tên / WASD / Space',
        action: 'Nhấn giữ → / D / W / Space để lái rover tiến mượt về phía trước; nhấn ← / A / S nếu muốn lùi lại.',
        svg: `<svg viewBox="0 0 48 48"><rect x="10" y="18" width="28" height="12" rx="6" fill="rgba(245,158,11,0.2)" stroke="#fcd34d" stroke-width="2"/><polygon points="22,20 30,24 22,28" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Giữ chuột / Chạm màn hình',
        action: 'Chạm phần bên phải màn hình để chạy tới đỉnh Silica; chạm mép trái (25%) để lùi nhẹ.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#38bdf8" stroke-width="2" fill="none"/><polygon points="21,18 31,24 21,30" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Dùng phím mũi tên, WASD, Space hoặc nhấn giữ bên phải màn hình để lái rover Spirit băng qua nền cát Gusev.',
      'Bánh xe bị kẹt của Spirit sẽ tự động cày lộ từng đoạn đất Silica phát sáng xanh ngọc và ngân nốt nhạc ngũ cung.',
      'Chạy tới Đỉnh Silica Hoàng Hôn (hiện rõ trên đường chân trời phía phải) để camera bay vút lên quỹ đạo ngắm toàn bộ vệt rãnh!'
    ],
    tip: 'Không còn bị kẹt hay dừng máy: cứ thong thả lái Spirit và lắng nghe giai điệu Silica dưới ánh hoàng hôn Sao Hỏa.'
  },
  {
    id: 'unsent',
    number: '04 / 06',
    title: 'UNSENT — Những Điều Chưa Kịp Gửi',
    hardware: 'Xe tự hành NASA Opportunity (MER-B) & Bộ nhớ RAM tạm thời',
    goal: 'Chọn 3 tấm ảnh Polaroid kỷ niệm yêu thích để gửi qua chùm sóng lên vệ tinh trung chuyển MRO.',
    controls: [
      {
        gesture: 'Chạm 1 lần vào ảnh (hoặc Kéo thả)',
        action: 'Chỉ cần chạm vào một tấm Polaroid để kích hoạt — bức ảnh sẽ tự phát nốt nhạc và bay thẳng vào ăng-ten!',
        svg: `<svg viewBox="0 0 48 48"><rect x="14" y="10" width="20" height="26" rx="2" fill="none" stroke="#fcd34d" stroke-width="2"/><rect x="17" y="13" width="14" height="13" fill="rgba(245,158,11,0.35)"/></svg>`
      },
      {
        gesture: 'Truyền dữ liệu lên ăng-ten',
        action: 'Chùm sóng parabol thu nhận tối đa 3 tấm ảnh để ghép thành bản nhạc ru riêng cho Opportunity.',
        svg: `<svg viewBox="0 0 48 48"><path d="M24 36 L24 14" stroke="#fcd34d" stroke-width="2.5"/><polyline points="17,20 24,13 31,20" stroke="#fcd34d" stroke-width="2.5" fill="none"/><circle cx="24" cy="10" r="3" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Ngắm những tấm ảnh Polaroid kỷ niệm đang trôi quanh chiếc rover Opportunity (bình minh, lốc bụi, vệt bánh xe...).',
      'Chạm trực tiếp vào 3 tấm ảnh bạn thích nhất (hoặc kéo thả vào vòng sáng ăng-ten phía trên).',
      'Khi đủ 3 tấm được gửi lên vệ tinh, màn đêm buông xuống và chuỗi nốt nhạc của riêng bạn sẽ vang lên!'
    ],
    tip: 'Bạn có thể chạm trực tiếp cực nhanh hoặc kéo thả tự do — cả hai đều hoạt động mượt mà!'
  },
  {
    id: 'moon-still-rings',
    number: '05 / 06',
    title: 'MOON STILL RINGS — Mặt Trăng Vẫn Ngân',
    hardware: 'Trạm Địa chấn Thụ động Apollo 12 & Tầng tàu đổ bộ tái dụng',
    goal: 'Chạm 5 điểm quanh vành thiên thể để tạo bản hòa âm bát hát Mặt Trăng rồi so sánh với Trái Đất.',
    controls: [
      {
        gesture: 'Chạm quanh vành tròn (5 điểm)',
        action: 'Thả tầng tàu xuống 5 nút sáng quanh vành: mỗi điểm tạo một nốt nhạc ngũ cung và sóng giao thoa lấp lánh.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke="#fcd34d" stroke-width="2" fill="none"/><circle cx="34" cy="14" r="4" fill="#fcd34d"/><circle cx="34" cy="14" r="9" stroke="#fcd34d" stroke-width="1.2" fill="none" opacity="0.6"/></svg>`
      },
      {
        gesture: 'Nhấn nút Mặt Trăng ☾ / Trái Đất ⊕ ở đáy',
        action: 'Chuyển nhanh giữa Mặt Trăng (vang ngân bất tận) và Trái Đất (tắt sóng ngay vì có nước và đá ẩm), hoặc vuốt ngang.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="17" cy="24" r="6" fill="#fcd34d"/><circle cx="31" cy="24" r="6" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Chạm vào các nút sáng dọc quanh vành bát để thả xung địa chấn và nghe hợp âm ngũ cung ngân dài.',
      'Nhấn nút chuyển đổi Mặt Trăng ☾ / Trái Đất ⊕ ngay phía dưới màn hình (hoặc vuốt ngang) để nghe sự khác biệt rõ rệt.',
      'Sau 5 lần chạm cộng hưởng, toàn bộ các vòng sóng sẽ hợp nhất rực sáng để khép lại bản giao hưởng địa chấn.'
    ],
    tip: 'Thí nghiệm thật năm 1969: Mặt Trăng khô rỗng như quả chuông nên rung gần 1 giờ sau va chạm tàu Apollo 12.'
  },
  {
    id: 'eternal-footprint',
    number: '06 / 06',
    title: 'ETERNAL FOOTPRINT — Dấu Chân Bất Tận',
    hardware: 'Dấu giày Apollo trên lớp đất Regolith & Tàu quỹ đạo LRO',
    goal: 'In 5 bước chân định danh của bạn lên bụi Mặt Trăng và xoay thanh ánh sáng để ngắm bóng đổ qua hàng triệu năm.',
    controls: [
      {
        gesture: 'Chạm lên mặt đất Mặt Trăng',
        action: 'Mỗi lần chạm để lại một dấu giày mang mã hoa văn riêng kèm tiếng bước chân âm thanh ngũ cung.',
        svg: `<svg viewBox="0 0 48 48"><rect x="17" y="10" width="14" height="28" rx="7" fill="rgba(245,158,11,0.25)" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="18" x2="29" y2="18" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="24" x2="29" y2="24" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="30" x2="29" y2="30" stroke="#fcd34d" stroke-width="2"/></svg>`
      },
      {
        gesture: 'Kéo thanh sáng ở mép dưới',
        action: 'Xoay góc chiếu Mặt Trời từ bình minh xiên bóng đến giữa trưa và hàng triệu năm phong hóa.',
        svg: `<svg viewBox="0 0 48 48"><line x1="8" y1="28" x2="40" y2="28" stroke="#94a3b8" stroke-width="2.5"/><circle cx="28" cy="28" r="6" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm 5 lần vào các vị trí trên nền đất Regolith xám bạc để in dấu chân mang mã định danh VNTL của bạn.',
      'Thử kéo thanh ánh sáng phía dưới để thấy bóng đổ nổi khối sắc nét dưới ánh Mặt Trời xiên.',
      'Ngay khi in đủ 5 bước chân, camera sẽ thu nhỏ lên không trung để hòa dấu chân bạn vào dòng xoắn ốc của cộng đồng!'
    ],
    tip: 'Trên Mặt Trăng không có gió hay mưa — dấu chân thực tế có thể tồn tại nguyên vẹn hàng triệu năm.'
  }
];
