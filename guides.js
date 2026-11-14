/**
 * 9 Separate Gameplay Guides ("Hướng Dẫn Cách Chơi") for the 9 VantaLumen Minigames
 */

window.GAME_GUIDES = [
  {
    id: 'under-the-dust',
    number: '01 / 09',
    title: 'UNDER THE DUST — Nhịp Tim Dưới Lớp Bụi',
    hardware: 'Trạm đổ bộ NASA InSight & Pin mặt trời UltraFlex',
    goal: 'Quét sạch lớp bụi Sao Hỏa để khôi phục năng lượng và đánh thức nhịp tim địa chấn của InSight.',
    controls: [
      {
        gesture: 'Chạm hoặc Vuốt qua mặt pin',
        action: 'Quét luồng gió vàng thổi bay bụi cam và thắp sáng các ô pin UltraFlex.',
        svg: `<svg viewBox="0 0 48 48"><path d="M8 26 C18 16, 28 32, 40 20" stroke="#fcd34d" stroke-width="2.5" fill="none" stroke-linecap="round"/><polyline points="34,18 40,20 38,26" stroke="#fcd34d" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
      },
      {
        gesture: 'Nhấn giữ để tạo xoáy cát',
        action: 'Kích hoạt xoáy cát (saltation) quay quanh ngón tay / con trỏ để làm sạch nhanh diện rộng.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="2" fill="rgba(245,158,11,0.16)"/><circle cx="24" cy="24" r="5" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm, vuốt hoặc nhấn giữ trên mặt pin hình thập giác để thổi bay lớp bụi đỏ.',
      'Khi vòng năng lượng vàng ở tâm đầy, trạm InSight sẽ thức giấc và mở Thẻ Ký Ức.'
    ],
    tip: 'Nhịp tim địa chấn sẽ đập rõ và ấm dần theo lượng ánh sáng mặt trời thu được.'
  },
  {
    id: 'still-there',
    number: '02 / 09',
    title: 'STILL THERE — Vẫn Còn Ở Đó',
    hardware: 'Gương phản xạ Laser Apollo 11, 14, 15 trên Mặt Trăng',
    goal: 'Bắn tia laser từ Trái Đất tới 3 gương phản xạ Apollo trên Mặt Trăng để ghép thành tam giác chòm sao.',
    controls: [
      {
        gesture: 'Chạm / Đưa tâm ngắm vào 3 điểm sáng',
        action: 'Tâm ngắm tự hút nam châm và đổi sang màu vàng khi khóa trúng vị trí gương Apollo.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="1.8" fill="none"/><line x1="24" y1="6" x2="24" y2="14" stroke="#fcd34d" stroke-width="1.8"/><line x1="24" y1="34" x2="24" y2="42" stroke="#fcd34d" stroke-width="1.8"/><circle cx="24" cy="24" r="3" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Chạm màn hình / Click / Space',
        action: 'Phóng xung laser xanh lên Mặt Trăng và đón hạt photon phản xạ bay ngược về.',
        svg: `<svg viewBox="0 0 48 48"><line x1="10" y1="40" x2="36" y2="12" stroke="#38bdf8" stroke-width="2.5"/><circle cx="36" cy="12" r="4" fill="#fef3c7"/></svg>`
      }
    ],
    steps: [
      'Chạm trực tiếp vào 3 điểm sáng nhấp nháy trên Mặt Trăng (Apollo 11, 14 và 15).',
      'Đón đủ 3 xung ánh sáng phản hồi về đài quan sát để hoàn thành tam giác Apollo.'
    ],
    tip: 'Khoảng cách thực là 384.400 km — ánh sáng mất 2,56 giây để đi từ Trái Đất lên Mặt Trăng và quay về.'
  },
  {
    id: 'one-wheel-left',
    number: '03 / 09',
    title: 'ONE WHEEL LEFT — Một Bánh Còn Lại',
    hardware: 'Xe tự hành NASA Spirit (MER-A) tại Gusev Crater',
    goal: 'Lái rover Spirit tiến về Đỉnh Silica Hoàng Hôn (ánh sáng xanh ngọc bên phải) để cày lộ lớp đất quý.',
    controls: [
      {
        gesture: 'Chạm / Giữ bên phải (›) hoặc Phím → / D / Space',
        action: 'Chạm 1 lần để xe tự lăn mượt (Tap-to-Cruise) hoặc nhấn giữ để tăng tốc về phía trước.',
        svg: `<svg viewBox="0 0 48 48"><rect x="10" y="18" width="28" height="12" rx="6" fill="rgba(245,158,11,0.2)" stroke="#fcd34d" stroke-width="2"/><polygon points="22,20 30,24 22,28" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Chạm bên trái (‹) hoặc Phím ← / A',
        action: 'Lùi xe nhẹ nhàng qua các triền cát Gusev Crater.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#38bdf8" stroke-width="2" fill="none"/><polygon points="21,18 31,24 21,30" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Chạm vào nửa phải màn hình (hoặc phím mũi tên phải) để Spirit kéo chiếc bánh kẹt cày lộ vệt Silica xanh ngọc.',
      'Chạm tới cột sáng Silica trên đỉnh đồi phía phải để hoàn tất hành trình.'
    ],
    tip: 'Chính chiếc bánh bị kẹt của Spirit năm 2006 đã vô tình cày lộ lớp đất >90% Silica của suối nước nóng cổ đại!'
  },
  {
    id: 'unsent',
    number: '04 / 09',
    title: 'UNSENT — Những Điều Chưa Kịp Gửi',
    hardware: 'Xe tự hành NASA Opportunity (MER-B) & Bộ nhớ RAM tạm thời',
    goal: 'Chọn 3 tấm ảnh Polaroid kỷ niệm để truyền lên vệ tinh MRO trước khi màn đêm Sao Hỏa buông xuống.',
    controls: [
      {
        gesture: 'Chạm 1 lần (hoặc Vuốt lên / Kéo thả)',
        action: 'Chạm trực tiếp vào tấm ảnh Polaroid bất kỳ để phóng thẳng vào chùm sóng ăng-ten.',
        svg: `<svg viewBox="0 0 48 48"><rect x="14" y="10" width="20" height="26" rx="2" fill="none" stroke="#fcd34d" stroke-width="2"/><rect x="17" y="13" width="14" height="13" fill="rgba(245,158,11,0.35)"/></svg>`
      },
      {
        gesture: 'Đồng bộ 3/3 gói ký ức',
        action: '3 khe sáng trên ăng-ten đầy sẽ kết thành bản nhạc ru riêng cho Opportunity.',
        svg: `<svg viewBox="0 0 48 48"><path d="M24 36 L24 14" stroke="#fcd34d" stroke-width="2.5"/><polyline points="17,20 24,13 31,20" stroke="#fcd34d" stroke-width="2.5" fill="none"/><circle cx="24" cy="10" r="3" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Chạm vào 3 bức ảnh Polaroid bạn muốn giữ lại nhất trước khi vệ tinh bay qua.',
      'Lắng nghe giai điệu ngũ cung kết từ 3 bức ảnh đã gửi về Trái Đất.'
    ],
    tip: 'Khi bộ nhớ Flash bị lão hóa, Opportunity phải lưu ảnh vào RAM tạm thời trước khi tắt nguồn mỗi tối.'
  },
  {
    id: 'moon-still-rings',
    number: '05 / 09',
    title: 'MOON STILL RINGS — Mặt Trăng Vẫn Ngân',
    hardware: 'Trạm Địa chấn Thụ động Apollo 12 (PSE)',
    goal: 'Kích hoạt 5 điểm cộng hưởng quanh vành Mặt Trăng và so sánh độ ngân địa chấn với Trái Đất.',
    controls: [
      {
        gesture: 'Chạm 5 nút sáng quanh vành tròn',
        action: 'Thả tầng tàu tạo sóng địa chấn ngân vang và giao thoa bên trong lòng Mặt Trăng.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke="#fcd34d" stroke-width="2" fill="none"/><circle cx="34" cy="14" r="4" fill="#fcd34d"/><circle cx="34" cy="14" r="9" stroke="#fcd34d" stroke-width="1.2" fill="none" opacity="0.6"/></svg>`
      },
      {
        gesture: 'Chạm nút Mặt Trăng ☾ / Trái Đất ⊕ ở đáy',
        action: 'Chuyển đổi để thấy sóng trên Mặt Trăng ngân rất lâu, còn Trái Đất tắt sóng nhanh.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="17" cy="24" r="6" fill="#fcd34d"/><circle cx="31" cy="24" r="6" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Chạm vào 5 nút sáng quanh vành thiên thể để kích hoạt sóng địa chấn.',
      'Thử chuyển nút Mặt Trăng / Trái Đất ở đáy màn hình để so sánh trực quan.'
    ],
    tip: 'Lớp vỏ Mặt Trăng khô và không có nước nên rung ngân suốt gần 1 giờ sau va chạm tàu Apollo 12 (1969).'
  },
  {
    id: 'eternal-footprint',
    number: '06 / 09',
    title: 'ETERNAL FOOTPRINT — Dấu Chân Bất Tận',
    hardware: 'Dấu giày Apollo trên lớp đất Regolith & Tàu quỹ đạo LRO',
    goal: 'In 5 bước chân lên bụi Mặt Trăng và kéo thanh góc nắng để quan sát bóng đổ qua hàng triệu năm.',
    controls: [
      {
        gesture: 'Chạm lên nền đất Mặt Trăng (5 lần)',
        action: 'Mỗi cú chạm in một dấu giày Apollo kèm hạt bụi văng theo quỹ đạo parabol chân không.',
        svg: `<svg viewBox="0 0 48 48"><rect x="17" y="10" width="14" height="28" rx="7" fill="rgba(245,158,11,0.25)" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="18" x2="29" y2="18" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="24" x2="29" y2="24" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="30" x2="29" y2="30" stroke="#fcd34d" stroke-width="2"/></svg>`
      },
      {
        gesture: 'Kéo thanh góc nắng ở phía dưới',
        action: 'Thay đổi góc chiếu Mặt Trời để thấy độ nổi khối của dấu chân.',
        svg: `<svg viewBox="0 0 48 48"><line x1="8" y1="28" x2="40" y2="28" stroke="#94a3b8" stroke-width="2.5"/><circle cx="28" cy="28" r="6" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm 5 điểm trên mặt đất để tạo chuỗi bước chân định danh của bạn.',
      'Camera sẽ bay lên quỹ đạo LRO, kết nối bước chân bạn với hàng trăm dấu chân lịch sử.'
    ],
    tip: 'Không có gió hay mưa, dấu chân trên Mặt Trăng tồn tại từ 1 đến 10 triệu năm.'
  },
  {
    id: 'rise-zero-g',
    number: '07 / 08 ★',
    title: 'RISE — Vật Chỉ Thị Không Trọng Lực (Artemis II)',
    hardware: 'Tàu Orion • NASA Artemis II (2026) • Thiết kế bởi Lucas Ye (8 tuổi)',
    goal: 'Thu thập đủ 7 Ngôi Sao quanh cửa sổ tàu Orion cùng linh vật Rise.',
    controls: [
      {
        gesture: 'Chạm hoặc Kéo thả Rise',
        action: 'Chạm trực tiếp vào Rise để thu sao tự động hoặc kéo Rise bay trong môi trường 0-G.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.15)"/><circle cx="19" cy="22" r="2.2" fill="#fcd34d"/><circle cx="29" cy="22" r="2.2" fill="#fcd34d"/><path d="M20 27 Q24 31 28 27" stroke="#fcd34d" stroke-width="2" fill="none"/></svg>`
      },
      {
        gesture: 'Chạm vào 7 Ngôi Sao (★)',
        action: 'Chạm thẳng vào 7 ngôi sao phát sáng quanh cửa sổ Orion để Rise bay tới thu thập.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke="#fcd34d" stroke-width="1.8" stroke-dasharray="4 3" fill="none"/><text x="24" y="29" text-anchor="middle" fill="#fef3c7" font-size="16">★</text></svg>`
      }
    ],
    steps: [
      'Chạm vào Rise hoặc 7 ngôi sao quanh cửa sổ tàu Orion để kích hoạt giai điệu 0-G.',
      'Thu thập đủ 7/7 ngôi sao để mở khóa Thẻ Ký Ức & Infographic chính thức của Rise.'
    ],
    tip: '4 biểu tượng của Rise: Thân Mặt Trăng • Mũ Trái Đất • 7 Sao & 2 Tên Lửa • Dấu chân Apollo 11.'
  },
  {
    id: 'spirit-rescue',
    number: '08 / 08 ★',
    title: 'SPIRIT RESCUE — Giải Cứu Rover Spirit (Fictional)',
    hardware: 'Tàu SpaceX Starship & Xe tự hành NASA Spirit (MER-A)',
    goal: 'Bay tàu SpaceX lên Sao Hỏa bế rover Spirit về Trái Đất để thay motor bánh xe và sạc đầy 100% pin.',
    controls: [
      {
        gesture: 'Nhấn giữ (hoặc Space)',
        action: 'Đốt động cơ Raptor phóng tàu SpaceX lên Sao Hỏa, bế Spirit vào khoang và bay về Trái Đất.',
        svg: `<svg viewBox="0 0 48 48"><path d="M24 8 L30 22 L30 34 L18 34 L18 22 Z" stroke="#e2e8f0" stroke-width="2" fill="rgba(56,189,248,0.18)"/><path d="M20 34 L24 42 L28 34" stroke="#60a5fa" stroke-width="2" fill="none"/></svg>`
      },
      {
        gesture: 'Chạm để sửa chữa tại Trái Đất',
        action: 'Chạm tháo motor cũ ở bánh xe hỏng, chạm lắp motor titan mới, rồi nhấn giữ nút tia sét để sạc pin 100%.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="2" fill="none"/><path d="M26 14 L18 25 H25 L22 34 L30 23 H23 Z" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Giai đoạn 1–3: Nhấn giữ để bay lên Sao Hỏa, bế Spirit lên tàu SpaceX rồi bay về Trái Đất.',
      'Giai đoạn 4–5: Chạm tháo motor cũ, lắp motor mới và nhấn giữ biểu tượng sét để sạc đầy 100% pin Spirit.'
    ],
    tip: 'Ngoài đời thật, bánh trước bên phải của Spirit bị kẹt từ năm 2006 và kẹt cát hoàn toàn năm 2009 — màn chơi này là lời tri ân giả tưởng đưa Spirit về nhà!'
  }
];
