/**
 * 6 Separate Gameplay Guides ("Hướng Dẫn Cách Chơi") for the 6 VantaLumen Minigames
 */

window.GAME_GUIDES = [
  {
    id: 'under-the-dust',
    number: '01 / 06',
    title: 'UNDER THE DUST — Nhịp Tim Dưới Lớp Bụi',
    hardware: 'Trạm đổ bộ NASA InSight & Pin mặt trời UltraFlex',
    goal: 'Thổi bay lớp bụi Sao Hỏa trước khi Mặt Trời lặn để đánh thức nhịp tim địa chấn của hành tinh đỏ.',
    controls: [
      {
        gesture: 'Vuốt / Rê chuột',
        action: 'Tạo luồng gió thổi tan lớp bụi cam mịn trên bề mặt tấm pin.',
        svg: `<svg viewBox="0 0 48 48"><path d="M8 26 C18 16, 28 32, 40 20" stroke="#fcd34d" stroke-width="2.5" fill="none" stroke-linecap="round"/><polyline points="34,18 40,20 38,26" stroke="#fcd34d" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
      },
      {
        gesture: 'Nhấn giữ yên 1 chỗ',
        action: 'Rải các hạt cát vàng thô lên tấm pin (giống cách cánh tay robot InSight xúc cát).',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="20" r="9" stroke="#fcd34d" stroke-width="2" fill="rgba(245,158,11,0.2)"/><circle cx="24" cy="20" r="4" fill="#fcd34d"/><circle cx="18" cy="35" r="2" fill="#fcd34d"/><circle cx="24" cy="38" r="2" fill="#fcd34d"/><circle cx="30" cy="35" r="2" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Vuốt qua đống cát',
        action: 'Gió đẩy hạt cát nảy trên mặt kính (hiện tượng saltation) giúp cạo sạch bụi cứng đầu.',
        svg: `<svg viewBox="0 0 48 48"><path d="M8 34 Q18 18 28 32 T42 20" stroke="#38bdf8" stroke-width="2.2" fill="none" stroke-dasharray="4 3"/><circle cx="28" cy="30" r="3" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm hoặc vuốt lần đầu để thổi mở vệt sáng hổ phách đầu tiên và nghe nhịp tim bắt đầu đập.',
      'Giữ yên một điểm khoảng 0,5 giây để rải hạt cát, rồi vuốt nhanh ngang qua để hạt cát nảy và quét sạch diện tích lớn.',
      'Khi dọn sạch hơn 60% bề mặt pin trước lúc hoàng hôn (28 giây), giai điệu chữ ký 3 nốt nhạc sẽ vang lên và hé lộ chữ ký của kỹ sư NASA dưới lớp bụi.'
    ],
    tip: 'Không có thanh % hay thua cuộc: hãy lắng nghe nhịp tim đập nhanh và ấm dần theo từng ô pin phát sáng!'
  },
  {
    id: 'still-there',
    number: '02 / 06',
    title: 'STILL THERE — Vẫn Còn Ở Đó',
    hardware: 'Gương phản xạ Laser Apollo 11, 14, 15 trên Mặt Trăng',
    goal: 'Ngắm chuẩn vào 3 chấm sáng cực mờ trên Mặt Trăng và chờ tiếng vọng ánh sáng sau 2,5 giây.',
    controls: [
      {
        gesture: 'Di chuyển / Chạm để ngắm',
        action: 'Đưa tâm ngắm vào 3 điểm gương phản xạ sáng mờ nằm trên bề mặt Mặt Trăng.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#fcd34d" stroke-width="1.8" fill="none"/><line x1="24" y1="6" x2="24" y2="14" stroke="#fcd34d" stroke-width="1.8"/><line x1="24" y1="34" x2="24" y2="42" stroke="#fcd34d" stroke-width="1.8"/><circle cx="24" cy="24" r="3" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Nhấn giữ để nạp xung',
        action: 'Vòng sóng năng lượng nở rộng dần từ tâm ngắm — hãy canh lúc vòng sóng chuyển màu vàng rực ở mép ngoài.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" stroke="#fcd34d" stroke-width="2.5" fill="none"/><circle cx="24" cy="24" r="9" stroke="#38bdf8" stroke-width="1.5" fill="none" stroke-dasharray="3 3"/></svg>`
      },
      {
        gesture: 'Thả tay để bắn tia Laser',
        action: 'Tia sáng vút từ đài quan sát lên Mặt Trăng. Giữ im lặng và chờ đúng 2,5 giây để nghe tiếng chuông thủy tinh vọng về!',
        svg: `<svg viewBox="0 0 48 48"><line x1="10" y1="40" x2="36" y2="12" stroke="#fcd34d" stroke-width="2.5"/><circle cx="36" cy="12" r="4" fill="#fef3c7"/></svg>`
      }
    ],
    steps: [
      'Quan sát 3 chấm sáng nhấp nháy yếu ớt trên đĩa Mặt Trăng (tương ứng bãi đáp Apollo 11, 14 và 15).',
      'Đặt tâm ngắm vào một chấm (có lực hút nam châm nhẹ hỗ trợ), nhấn giữ chuột/ngón tay hoặc phím Space cho vòng sóng nở to đến mép vòng tròn.',
      'Thả ra để bắn xung laser và đếm thầm 2,5 giây — khoảng thời gian thật để ánh sáng bay từ Trái Đất tới Mặt Trăng rồi dội ngược lại!'
    ],
    tip: 'Mỗi lần có tiếng chuông thủy tinh đáp lời, một đỉnh của tam giác chòm sao Apollo sẽ bừng sáng và cộng 1 vào bộ đếm Mạng lưới Kỹ sư Toàn cầu.'
  },
  {
    id: 'one-wheel-left',
    number: '03 / 06',
    title: 'ONE WHEEL LEFT — Một Bánh Còn Lại',
    hardware: 'Xe tự hành NASA Spirit (MER-A) tại Gusev Crater',
    goal: 'Điều khiển rover Spirit đi lùi kéo lê chiếc bánh bị kẹt để cày lộ rãnh đất Silica phát sáng trước khi hoàng hôn buông xuống.',
    controls: [
      {
        gesture: 'Nhấn giữ (hoặc giữ Space)',
        action: 'Đẩy rover chạy lùi về phía trước, chiếc bánh hỏng phía sau sẽ cày rãnh xanh ngọc lấp lánh và ngân từng nốt nhạc.',
        svg: `<svg viewBox="0 0 48 48"><rect x="10" y="18" width="28" height="12" rx="6" fill="rgba(245,158,11,0.2)" stroke="#fcd34d" stroke-width="2"/><polygon points="22,20 30,24 22,28" fill="#fcd34d"/></svg>`
      },
      {
        gesture: 'Thả tay / Thả Space',
        action: 'Cho động cơ nghỉ để tránh quá tải và không bị lún vào lớp cát mềm.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" stroke="#94a3b8" stroke-width="2" fill="none"/><rect x="18" y="18" width="4" height="12" fill="#94a3b8"/><rect x="26" y="18" width="4" height="12" fill="#94a3b8"/></svg>`
      },
      {
        gesture: 'Chạm / Nhấp nhịp nhàng khi sa lầy',
        action: 'Nếu giữ quá 4 giây làm bánh lún cát (xe rung lắc), hãy thả ra rồi nhấp đều 3 nhịp để lắc thoát khỏi cát!',
        svg: `<svg viewBox="0 0 48 48"><circle cx="14" cy="24" r="4" fill="#38bdf8"/><circle cx="24" cy="24" r="4" fill="#38bdf8"/><circle cx="34" cy="24" r="4" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Nhấn giữ chuột, chạm màn hình hoặc giữ phím Space để đẩy chú rover Spirit di chuyển.',
      'Hãy giữ theo từng nhịp 2–3 giây rồi thả nghỉ một chút để xe chạy mượt và không bị lún cát.',
      'Nếu xe lỡ bị lún cát và rung lên, đừng lo (không có Game Over!): chỉ cần nhấp đều 3 lần để lắc thoát ra và ngắm camera vút lên quỹ đạo lúc hoàng hôn.'
    ],
    tip: 'Mỗi đoạn rãnh đất Silica (>90% độ tinh khiết) mà bánh xe chết cày lộ ra sẽ ngân lên một nốt hộp nhạc ngũ cung.'
  },
  {
    id: 'unsent',
    number: '04 / 06',
    title: 'UNSENT — Những Điều Chưa Kịp Gửi',
    hardware: 'Xe tự hành NASA Opportunity (MER-B) & Bộ nhớ RAM tạm thời',
    goal: 'Chọn 3 bức ảnh kỷ niệm quý giá nhất để truyền về Trái Đất trước khi vệ tinh trung chuyển bay khuất chân trời.',
    controls: [
      {
        gesture: 'Chạm vào tấm Polaroid',
        action: 'Nghe thử nốt nhạc riêng gắn với từng bức ảnh kỷ niệm của Opportunity (bình minh, lốc bụi, vệt bánh xe, bóng rover...).',
        svg: `<svg viewBox="0 0 48 48"><rect x="14" y="10" width="20" height="26" rx="2" fill="none" stroke="#fcd34d" stroke-width="2"/><rect x="17" y="13" width="14" height="13" fill="rgba(245,158,11,0.35)"/></svg>`
      },
      {
        gesture: 'Kéo thả lên vòng tròn Ăng-ten',
        action: 'Kéo tấm ảnh bạn chọn lên vùng ăng-ten phía trên để biến nó thành gói ánh sáng bay thẳng lên vệ tinh trung chuyển.',
        svg: `<svg viewBox="0 0 48 48"><path d="M24 36 L24 14" stroke="#fcd34d" stroke-width="2.5"/><polyline points="17,20 24,13 31,20" stroke="#fcd34d" stroke-width="2.5" fill="none"/><circle cx="24" cy="10" r="3" fill="#38bdf8"/></svg>`
      }
    ],
    steps: [
      'Nhìn vệt vệ tinh đang trôi ngang bầu trời phía trên và vòng ăng-ten có đúng 3 ô băng thông trống.',
      'Kéo lần lượt tối đa 3 trong 9 tấm Polaroid lơ lửng lên vòng tròn ăng-ten ở nửa trên màn hình trước khi hết thời gian.',
      'Khi đêm xuống, những tấm chưa kịp gửi sẽ chỉ còn là viền ma mờ quanh rover, còn 3 tấm bạn chọn sẽ phát lại thành một bản nhạc ru độc nhất của riêng bạn.'
    ],
    tip: 'Thứ tự 3 bức ảnh bạn chọn gửi sẽ ghép thành giai điệu bài hát ru cuối màn — mỗi người chơi có một bản nhạc khác nhau!'
  },
  {
    id: 'moon-still-rings',
    number: '05 / 06',
    title: 'MOON STILL RINGS — Mặt Trăng Vẫn Ngân',
    hardware: 'Trạm Địa chấn Thụ động Apollo 12 & Tầng tàu đổ bộ tái dụng',
    goal: 'Cảm nhận sự rung ngân kéo dài bất tận của Mặt Trăng như một chiếc bát hát, rồi đối chiếu trực tiếp với Trái Đất.',
    controls: [
      {
        gesture: 'Chạm quanh vành tròn',
        action: 'Thả tầng tàu hết nhiệm vụ xuống điểm đó: vị trí chạm quyết định cao độ nốt nhạc ngũ cung và tạo sóng giao thoa bên trong.',
        svg: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke="#fcd34d" stroke-width="2" fill="none"/><circle cx="34" cy="14" r="4" fill="#fcd34d"/><circle cx="34" cy="14" r="9" stroke="#fcd34d" stroke-width="1.2" fill="none" opacity="0.6"/></svg>`
      },
      {
        gesture: 'Vuốt ngang Trái / Phải',
        action: 'Chuyển đổi qua lại giữa "Bát Mặt Trăng" (vàng hổ phách) và "Bát Trái Đất" (xanh dương) để so sánh độ tắt sóng!',
        svg: `<svg viewBox="0 0 48 48"><line x1="10" y1="24" x2="38" y2="24" stroke="#38bdf8" stroke-width="2.5"/><polyline points="16,18 10,24 16,30" stroke="#38bdf8" stroke-width="2.5" fill="none"/><polyline points="32,18 38,24 32,30" stroke="#38bdf8" stroke-width="2.5" fill="none"/></svg>`
      }
    ],
    steps: [
      'Chạm vào nhiều vị trí khác nhau quanh vành Mặt Trăng để chồng các hợp âm bát hát ngân vang không chịu tắt.',
      'Vuốt ngang màn hình sang chế độ Trái Đất (chấm xanh dương ở đáy) và thử chạm tương tự: âm thanh chỉ vang một tiếng "bịch" ngắn rồi im bặt vì nước và đá ẩm hấp thụ sóng.',
      'Vuốt ngược lại Mặt Trăng — các sóng địa chấn trước đó của bạn vẫn còn đang ngân rung trên đường ghi địa chấn!'
    ],
    tip: 'Đây là thí nghiệm có thật năm 1969: Mặt Trăng rung suốt gần 1 giờ sau khi tầng tàu Apollo 12 rơi xuống.'
  },
  {
    id: 'eternal-footprint',
    number: '06 / 06',
    title: 'ETERNAL FOOTPRINT — Dấu Chân Bất Tận',
    hardware: 'Dấu giày Apollo trên lớp đất Regolith & Tàu quỹ đạo LRO',
    goal: 'Để lại dấu chân định danh duy nhất của riêng bạn trên Mặt Trăng và xoay góc ánh sáng qua hàng triệu năm.',
    controls: [
      {
        gesture: 'Chạm lên bề mặt Mặt Trăng',
        action: 'Đóng dấu giày mang mã hoa văn duy nhất của bạn; bụi văng lên theo quỹ đạo parabol chân không hoàn hảo.',
        svg: `<svg viewBox="0 0 48 48"><rect x="17" y="10" width="14" height="28" rx="7" fill="rgba(245,158,11,0.25)" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="18" x2="29" y2="18" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="24" x2="29" y2="24" stroke="#fcd34d" stroke-width="2"/><line x1="19" y1="30" x2="29" y2="30" stroke="#fcd34d" stroke-width="2"/></svg>`
      },
      {
        gesture: 'Kéo thanh trượt phía dưới',
        action: 'Thay đổi góc Mặt Trời (sáng sớm xiên bóng → giữa trưa → hàng triệu năm bị vi thiên thạch bào mòn).',
        svg: `<svg viewBox="0 0 48 48"><line x1="8" y1="28" x2="40" y2="28" stroke="#94a3b8" stroke-width="2.5"/><circle cx="28" cy="28" r="6" fill="#fcd34d"/></svg>`
      }
    ],
    steps: [
      'Chạm vào lớp đất xám bạc nhiều lần để bước đi và để lại những dấu giày sắc nét kèm tiếng bước chân bên trong mũ bảo hiểm.',
      'Kéo thanh trượt ánh sáng ở mép dưới màn hình: ở hai đầu, bóng đổ xiên làm dấu chân nổi khối rõ rệt; ở giữa trưa bóng gần như biến mất; kéo hết về bên phải sẽ thấy dấu chân mờ dần qua hàng triệu năm.',
      'Sau 4 bước chân, camera sẽ từ từ lùi xa lên không trung, hé lộ dấu chân của bạn hòa cùng lối mòn của hàng nghìn người đi trước.'
    ],
    tip: 'Mã vân đế giày VNTL của bạn được lưu lại riêng trên thiết bị này như một dấu ấn cá nhân trong vũ trụ.'
  }
];
