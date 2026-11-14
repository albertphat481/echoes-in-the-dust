/**
 * 9 Separate Gameplay Guides ("Hướng Dẫn Cách Chơi") for the 9 VantaLumen Minigames
 */

window.GAME_GUIDES = [
  {
    id: 'under-the-dust',
    number: '01 / 08',
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
    number: '02 / 08',
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
    number: '03 / 08',
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
    number: '04 / 08',
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
    number: '05 / 08',
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
    number: '06 / 08',
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
    id: 'pale-blue-dot',
    number: '07 / 08',
    title: 'PALE BLUE DOT — Chấm Xanh Mờ',
    hardware: 'Tàu thăm dò Voyager 1 & Camera Góc Hẹp (6,05 tỷ km)',
    goal: 'Chụp đủ 3 thiên thể (Sao Mộc, Sao Thổ và Chấm Xanh Mờ Trái Đất) từ rìa Hệ Mặt Trời.',
    controls: [
      {
        gesture: 'Chạm trực tiếp vào 3 hành tinh',
        action: 'Khung ngắm Voyager 1 tự động khóa nam châm và chụp ngay khi bạn chạm vào hành tinh.',
        svg: `<svg viewBox="0 0 48 48"><path d="M10 18 V10 H18 M30 10 H38 V18 M10 30 V38 H18 M38 30 V38 H30" stroke="#7dd3fc" stroke-width="2.2" fill="none"/><circle cx="24" cy="24" r="3.5" fill="#7dd3fc"/></svg>`
      },
      {
        gesture: 'Rê tâm ngắm + Click / Space',
        action: 'Đưa khung ngắm vào mục tiêu rồi bấm chụp để lưu vào dải 3 khung hình ở đáy.',
        svg: `<svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="20" rx="4" fill="none" stroke="#fcd34d" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="rgba(56,189,248,0.4)" stroke="#7dd3fc" stroke-width="1.8"/></svg>`
      }
    ],
    steps: [
      'Chạm lần lượt vào Sao Mộc, Sao Thổ và chấm xanh Trái Đất nằm giữa tia nắng tán xạ.',
      'Đủ 3/3 khung hình, Voyager 1 sẽ khép ống kính để tiết kiệm điện bay vào không gian liên sao.'
    ],
    tip: 'Ở khoảng cách 6,05 tỷ km năm 1990, toàn bộ Trái Đất chỉ rộng đúng 0,12 pixel.'
  },
  {
    id: 'grand-finale',
    number: '08 / 08',
    title: 'GRAND FINALE — Cú Lao Cuối Cùng',
    hardware: 'Tàu quỹ đạo NASA Cassini & Ăng-ten High-Gain hướng Trái Đất',
    goal: 'Truyền 5 gói dữ liệu vành đai Sao Thổ về Trái Đất trước khi Cassini hòa vào bầu khí quyển.',
    controls: [
      {
        gesture: 'Chạm vào 5 nút sáng (hoặc chấm Trái Đất)',
        action: 'Chạm trực tiếp vào 5 nút vàng trên vành đai để phóng xung dữ liệu về Trái Đất tức thì.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="1.8" fill="none"/><circle cx="24" cy="24" r="5" fill="#fef3c7"/></svg>`
      },
      {
        gesture: 'Giữ hướng ăng-ten về Trái Đất',
        action: 'Rê hướng chùm sóng xanh của Cassini khóa vào ngôi sao Trái Đất ở góc trên phải.',
        svg: `<svg viewBox="0 0 48 48"><line x1="12" y1="36" x2="36" y2="12" stroke="#38bdf8" stroke-width="2.5"/><circle cx="36" cy="12" r="4" fill="#e0f2fe"/><ellipse cx="12" cy="36" rx="8" ry="3.5" transform="rotate(-45 12 36)" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm vào 5 nút dữ liệu quanh vành đai Sao Thổ (hoặc khóa tia ăng-ten vào Trái Đất).',
      'Đủ 5/5 gói tin, Cassini sẽ hoàn thành sứ mệnh bảo vệ đại dương ngầm trên mặt trăng Enceladus.'
    ],
    tip: 'Ngày 15/09/2017, Cassini giữ ăng-ten hướng về Trái Đất tới tận giây cuối cùng ở tốc độ 113.000 km/h.'
  }
];
