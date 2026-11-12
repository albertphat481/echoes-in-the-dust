/**
 * "Mảnh Vỡ Ký Ức" (Memory Shards) — Tell After Data, Hardware Telemetry & NASA Citations
 * Crafted by Team VANTALUMEN for the NASA Space Apps Challenge.
 */

window.MEMORY_SHARDS = [
  {
    id: 'under-the-dust',
    number: '01 / 06',
    title: 'UNDER THE DUST — Nhịp Tim Dưới Lớp Bụi',
    subtitle: 'Trạm đổ bộ InSight & Máy đo địa chấn SEIS (Elysium Planitia, Sao Hỏa)',
    mission: 'NASA Discovery Program • 2018–2022',
    specs: [
      { label: 'Phần cứng chính', value: 'Pin UltraFlex & SEIS' },
      { label: 'Dữ liệu khoa học', value: '1.319 trận Marsquakes' },
      { label: 'Cơ chế vật lý', value: 'Saltation (Cát nảy cuốn bụi)' }
    ],
    defaultStatLabel: 'Độ sạch năng lượng đạt được',
    story:
      'InSight đã áp tai lên bề mặt Sao Hỏa và lắng nghe được 1.319 trận rung chấn ("marsquakes"), lần đầu tiên đo được kích thước lõi lỏng của hành tinh đỏ. Khi bụi phủ dày hai cánh pin mặt trời vào năm 2021, các kỹ sư NASA JPL đã dùng cánh tay robot xúc cát rải xuống cạnh tấm pin lúc gió thổi — để hạt cát to nảy lên (hiện tượng saltation) và cuốn theo lớp bụi mịn, giúp InSight sống thêm hơn một năm trước khi gửi bức ảnh cuối cùng.',
    sourceLabel: 'NASA JPL — InSight Mars Lander & SEIS Instrument',
    sourceUrl: 'https://science.nasa.gov/mission/insight/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#060913" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="440" height="155" fill="#060913"/>
        <circle cx="220" cy="75" r="72" fill="url(#g1)"/>
        <!-- Left & Right Decagonal UltraFlex Solar Wings -->
        <circle cx="125" cy="75" r="44" fill="#1e293b" stroke="#f59e0b" stroke-width="1.6"/>
        <circle cx="315" cy="75" r="44" fill="#1e293b" stroke="#f59e0b" stroke-width="1.6"/>
        <line x1="81" y1="75" x2="169" y2="75" stroke="#f59e0b" stroke-width="0.7" opacity="0.6"/>
        <line x1="125" y1="31" x2="125" y2="119" stroke="#f59e0b" stroke-width="0.7" opacity="0.6"/>
        <line x1="271" y1="75" x2="359" y2="75" stroke="#f59e0b" stroke-width="0.7" opacity="0.6"/>
        <line x1="315" y1="31" x2="315" y2="119" stroke="#f59e0b" stroke-width="0.7" opacity="0.6"/>
        <!-- Lander Deck, Robotic Arm IDA & SEIS Seismometer Pulse -->
        <rect x="192" y="58" width="56" height="32" rx="4" fill="#334155" stroke="#fcd34d" stroke-width="1.6"/>
        <path d="M 220 58 L 238 30 L 285 45" fill="none" stroke="#fcd34d" stroke-width="2"/>
        <polyline points="165,132 195,132 204,112 212,144 220,116 228,136 236,132 275,132" fill="none" stroke="#fcd34d" stroke-width="2"/>
        <text x="16" y="22" fill="#94a3b8" font-family="monospace" font-size="10">INSIGHT // ULTRA-FLEX 2.15m SOLAR ARRAY</text>
      </svg>
    `
  },
  {
    id: 'still-there',
    number: '02 / 06',
    title: 'STILL THERE — Vẫn Còn Ở Đó',
    subtitle: 'Gương phản xạ Laser Mặt Trăng (LRRR — Apollo 11, 14, 15)',
    mission: 'NASA Apollo Program • 1969–Nay',
    specs: [
      { label: 'Phần cứng chính', value: 'Thấu kính góc thạch anh' },
      { label: 'Độ trễ ánh sáng', value: '2,56 giây (Khứ hồi)' },
      { label: 'Phát hiện vật lý', value: 'Mặt Trăng lùi 3,8 cm/năm' }
    ],
    defaultStatLabel: 'Mạng lưới Kỹ sư Vũ trụ Toàn cầu',
    story:
      'Không cần pin, không cần điện hay máy phát sóng, các mảng gương phản xạ góc (Corner-Cube Prisms) do phi hành gia Apollo 11, 14 và 15 để lại vẫn phản chiếu chính xác các xung laser bắn lên từ Trái Đất suốt hơn 55 năm qua. Phép đo thời gian ánh sáng đi về (~2,56 giây) chứng minh Mặt Trăng có lõi lỏng và đang rời xa Trái Đất 3,8 cm mỗi năm. Chỉ cần nhân loại còn ngước lên gọi, chúng sẽ luôn hồi đáp.',
    sourceLabel: 'NASA Science — Lunar Laser Ranging Retroreflectors',
    sourceUrl: 'https://science.nasa.gov/moon/lunar-highlights/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <rect width="440" height="155" fill="#060913"/>
        <circle cx="85" cy="112" r="30" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.6"/>
        <circle cx="345" cy="48" r="24" fill="#334155" stroke="#fcd34d" stroke-width="1.6"/>
        <line x1="112" y1="98" x2="323" y2="54" stroke="#fcd34d" stroke-width="1.8" stroke-dasharray="5 4"/>
        <circle cx="324" cy="53" r="4.5" fill="#fcd34d"/>
        <circle cx="342" cy="40" r="3.5" fill="#f59e0b"/>
        <circle cx="338" cy="60" r="3.5" fill="#f59e0b"/>
        <text x="172" y="66" fill="#fcd34d" font-family="monospace" font-size="11">2d / c = 2.562 sec</text>
        <text x="16" y="22" fill="#94a3b8" font-family="monospace" font-size="10">APOLLO 11/14/15 // PASSIVE CORNER-CUBE ARRAY</text>
      </svg>
    `
  },
  {
    id: 'one-wheel-left',
    number: '03 / 06',
    title: 'ONE WHEEL LEFT — Một Bánh Còn Lại',
    subtitle: 'Rover tự hành Spirit (MER-A) & Rãnh Silica tại Home Plate',
    mission: 'NASA Mars Exploration Rover • 2004–2010',
    specs: [
      { label: 'Phần cứng chính', value: 'Hệ treo Rocker-Bogie 6 bánh' },
      { label: 'Phát hiện tình cờ', value: '>90% Opaline Silica' },
      { label: 'Ý nghĩa khoa học', value: 'Dấu vết suối nước nóng cổ' }
    ],
    defaultStatLabel: 'Chiều dài rãnh Silica đã mở lộ',
    story:
      'Tháng 3/2006, bánh trước bên phải của rover Spirit ngừng hoạt động, buộc các kỹ sư NASA phải điều khiển nó đi lùi qua vùng Gusev Crater và kéo lê chiếc bánh hỏng phía sau. Chính rãnh cày sâu của chiếc bánh chết ấy đã phơi lộ lớp đất sáng trắng chứa hơn 90% silica tinh khiết — bằng chứng về suối nước nóng hoặc miệng phun hơi nước cổ đại từng có điều kiện lý tưởng cho sự sống vi sinh.',
    sourceLabel: 'NASA JPL — Spirit Rover (MER-A) Silica Discovery',
    sourceUrl: 'https://science.nasa.gov/mission/mer-spirit/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <rect width="440" height="155" fill="#060913"/>
        <path d="M 20 118 Q 160 95 280 112 T 420 96" fill="none" stroke="#334155" stroke-width="3"/>
        <path d="M 35 118 Q 160 96 265 110" fill="none" stroke="#67e8f9" stroke-width="4.5"/>
        <g transform="translate(268, 85)">
          <rect x="-24" y="-8" width="48" height="14" rx="3" fill="#f59e0b"/>
          <line x1="6" y1="-8" x2="12" y2="-28" stroke="#fcd34d" stroke-width="2.5"/>
          <rect x="5" y="-32" width="15" height="7" rx="2" fill="#fcd34d"/>
          <circle cx="-18" cy="14" r="8.5" fill="#1e293b" stroke="#67e8f9" stroke-width="2" stroke-dasharray="3 2"/>
          <circle cx="0" cy="14" r="8.5" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="18" cy="14" r="8.5" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        </g>
        <text x="16" y="22" fill="#94a3b8" font-family="monospace" font-size="10">MER-A SPIRIT // SOL 1187 SILICA TRENCH</text>
      </svg>
    `
  },
  {
    id: 'unsent',
    number: '04 / 06',
    title: 'UNSENT — Những Điều Chưa Kịp Gửi',
    subtitle: 'Rover tự hành Opportunity (MER-B) & Bộ nhớ Flash 256 MB',
    mission: 'NASA Mars Exploration Rover • 2004–2018',
    specs: [
      { label: 'Phần cứng chính', value: 'RAM khả biến & Ăng-ten UHF' },
      { label: 'Tuổi thọ thực tế', value: '5.111 Sols (Gấp 55 lần TK)' },
      { label: 'Tín hiệu cuối', value: '10/06/2018 (Bão bụi toàn cầu)' }
    ],
    defaultStatLabel: 'Gói ký ức đã truyền về Trái Đất',
    story:
      'Được thiết kế chỉ cho 90 ngày nhưng hoạt động gần 15 năm, bộ nhớ flash 256 MB của Opportunity bị hao mòn vào năm 2015. Mỗi chiều trước khi Mặt Trời lặn và nguồn điện tắt, nó phải lưu ảnh trong bộ nhớ RAM tạm thời: chỉ những bức ảnh kịp gửi lên tàu quỹ đạo trung chuyển mới về được Trái Đất, những ký ức còn lại sẽ mất đi khi đêm xuống. Ngày 10/6/2018, giữa cơn bão bụi che khuất Mặt Trời, Opportunity gửi về khung hình cuối cùng trước khi yên nghỉ tại Perseverance Valley.',
    sourceLabel: 'NASA JPL — Opportunity Rover (MER-B) Mission',
    sourceUrl: 'https://science.nasa.gov/mission/mer-opportunity/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <rect width="440" height="155" fill="#060913"/>
        <rect x="85" y="45" width="52" height="64" rx="4" fill="#0f172a" stroke="#475569" stroke-dasharray="4 3"/>
        <rect x="162" y="36" width="56" height="68" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="190" cy="64" r="12" fill="#fcd34d" opacity="0.85"/>
        <rect x="242" y="45" width="52" height="64" rx="4" fill="#0f172a" stroke="#475569" stroke-dasharray="4 3"/>
        <path d="M 190 36 C 215 12, 285 14, 345 26" fill="none" stroke="#fcd34d" stroke-width="1.6" stroke-dasharray="3 3"/>
        <circle cx="352" cy="26" r="5" fill="#fcd34d"/>
        <text x="16" y="22" fill="#94a3b8" font-family="monospace" font-size="10">MER-B OPPORTUNITY // UHF RELAY TELEMETRY</text>
      </svg>
    `
  },
  {
    id: 'moon-still-rings',
    number: '05 / 06',
    title: 'MOON STILL RINGS — Mặt Trăng Vẫn Ngân',
    subtitle: 'Thí nghiệm Địa chấn Thụ động Apollo (PSE) & Tầng tàu va chạm',
    mission: 'NASA Apollo 12, 14, 15, 16 • 1969–1977',
    specs: [
      { label: 'Phần cứng tái dụng', value: 'Tầng thượng LM & S-IVB' },
      { label: 'Thời gian ngân', value: '> 55 phút liên tục' },
      { label: 'Chuyển đổi dữ liệu', value: 'Seismic Sonification' }
    ],
    defaultStatLabel: 'Cộng hưởng địa chấn đã kích hoạt',
    story:
      'Tháng 11/1969, sau khi phi hành đoàn Apollo 12 ghép nối lại với tàu chỉ huy, NASA đã chủ động cho tầng tàu đổ bộ đã hoàn thành nhiệm vụ lao xuống Mặt Trăng để tạo chấn động nhân tạo có kiểm soát. Máy đo địa chấn ghi nhận Mặt Trăng rung ngân gần một giờ đồng hồ — lâu hơn rất nhiều so với Trái Đất vì lớp vỏ Mặt Trăng khô, lạnh và không có nước làm tắt sóng. (Lưu ý khoa học: sóng địa chấn không phải âm thanh trong không khí; âm nhạc bạn nghe là sonification — chuyển hóa dao động địa chấn thành tần số âm thanh).',
    sourceLabel: 'NASA — Moonquakes & Apollo Passive Seismic Network',
    sourceUrl: 'https://science.nasa.gov/moon/moonquakes/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <rect width="440" height="155" fill="#060913"/>
        <circle cx="220" cy="78" r="54" fill="none" stroke="#fcd34d" stroke-width="1.8"/>
        <circle cx="220" cy="78" r="40" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4 3"/>
        <circle cx="220" cy="78" r="24" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.6"/>
        <circle cx="220" cy="24" r="4.5" fill="#fcd34d"/>
        <text x="16" y="22" fill="#94a3b8" font-family="monospace" font-size="10">APOLLO 12 PSE // HIGH-Q LUNAR CRUST SCATTERING</text>
      </svg>
    `
  },
  {
    id: 'eternal-footprint',
    number: '06 / 06',
    title: 'ETERNAL FOOTPRINT — Dấu Chân Bất Tận',
    subtitle: 'Dấu giày trên lớp đất Regolith & Camera tàu quỹ đạo LRO',
    mission: 'NASA Apollo & Lunar Reconnaissance Orbiter • 1969–Nay',
    specs: [
      { label: 'Phần cứng quan sát', value: 'Camera NAC (Tàu LRO)' },
      { label: 'Thời gian lưu dấu', value: '10⁶ – 10⁷ năm' },
      { label: 'Tác nhân phong hóa', value: 'Mưa vi thiên thạch' }
    ],
    defaultStatLabel: 'Mã vân đế giày định danh của bạn',
    story:
      'Vì Mặt Trăng không có khí quyển, gió hay mưa, những hạt bụi khi bước chân văng lên theo quỹ đạo parabol thuần túy và những vết giày Apollo từ năm 1969 vẫn hiện rõ trong ảnh chụp từ tàu quỹ đạo LRO ngày nay. Chúng sẽ tồn tại hàng triệu năm — dù không bất멸 tuyệt đối vì mưa vi thiên thạch siêu nhỏ vẫn chầm chậm san phẳng lớp đất bề mặt. Chúng ta không bất tử vì dấu vết không phai, mà vì luôn có thế hệ tiếp theo quay lại nhìn.',
    sourceLabel: 'NASA Lunar Reconnaissance Orbiter (LRO)',
    sourceUrl: 'https://science.nasa.gov/mission/lro/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <rect width="440" height="155" fill="#060913"/>
        <g transform="translate(220, 78) rotate(-18)">
          <rect x="-26" y="-44" width="52" height="88" rx="24" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <line x1="-20" y1="-26" x2="20" y2="-26" stroke="#fcd34d" stroke-width="3"/>
          <line x1="-22" y1="-10" x2="22" y2="-10" stroke="#fcd34d" stroke-width="3"/>
          <line x1="-22" y1="6" x2="22" y2="6" stroke="#fcd34d" stroke-width="3"/>
          <line x1="-20" y1="22" x2="20" y2="22" stroke="#fcd34d" stroke-width="3"/>
        </g>
        <text x="16" y="22" fill="#94a3b8" font-family="monospace" font-size="10">LRO NAC // REGOLITH NORMAL-RELIEF IMAGING</text>
      </svg>
    `
  }
];
