/**
 * "Mảnh Vỡ Ký Ức" (Memory Shards) — Tell After Data, Hardware Telemetry & NASA Citations
 * Crafted by Team VANTALUMEN for the NASA Space Apps Challenge.
 */

window.MEMORY_SHARDS = [
  {
    id: 'under-the-dust',
    number: '01 / 08',
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
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-01 // INSIGHT ULTRAFLEX 2.15M DECAGONAL ARRAY &amp; SEIS</text>
        <!-- Left & Right Decagonal Solar Wings (Blueprint Wireframe) -->
        <g transform="translate(118, 88)" fill="rgba(30,58,138,0.18)" stroke="#94a3b8" stroke-width="1">
          <polygon points="0,-42 25,-34 40,-13 40,13 25,34 0,42 -25,34 -40,13 -40,-13 -25,-34"/>
          <circle cx="0" cy="0" r="24" fill="none" stroke="rgba(148,163,184,0.35)" stroke-dasharray="2 2"/>
          <line x1="-40" y1="0" x2="40" y2="0" stroke="rgba(251,191,36,0.45)" stroke-width="0.8"/>
          <line x1="0" y1="-42" x2="0" y2="42" stroke="rgba(251,191,36,0.45)" stroke-width="0.8"/>
          <line x1="-25" y1="-34" x2="25" y2="34" stroke="rgba(251,191,36,0.35)" stroke-width="0.7"/>
          <line x1="25" y1="-34" x2="-25" y2="34" stroke="rgba(251,191,36,0.35)" stroke-width="0.7"/>
          <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#fcd34d" stroke-width="1.2"/>
        </g>
        <g transform="translate(322, 88)" fill="rgba(30,58,138,0.18)" stroke="#94a3b8" stroke-width="1">
          <polygon points="0,-42 25,-34 40,-13 40,13 25,34 0,42 -25,34 -40,13 -40,-13 -25,-34"/>
          <circle cx="0" cy="0" r="24" fill="none" stroke="rgba(148,163,184,0.35)" stroke-dasharray="2 2"/>
          <line x1="-40" y1="0" x2="40" y2="0" stroke="rgba(251,191,36,0.45)" stroke-width="0.8"/>
          <line x1="0" y1="-42" x2="0" y2="42" stroke="rgba(251,191,36,0.45)" stroke-width="0.8"/>
          <line x1="-25" y1="-34" x2="25" y2="34" stroke="rgba(251,191,36,0.35)" stroke-width="0.7"/>
          <line x1="25" y1="-34" x2="-25" y2="34" stroke="rgba(251,191,36,0.35)" stroke-width="0.7"/>
          <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#fcd34d" stroke-width="1.2"/>
        </g>
        <!-- Central Lander Bus & IDA Arm -->
        <line x1="158" y1="88" x2="282" y2="88" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="192" y="72" width="56" height="32" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.2"/>
        <line x1="192" y1="82" x2="248" y2="82" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
        <polyline points="172,138 198,138 205,122 211,146 218,118 225,142 232,134 240,138 268,138" fill="none" stroke="#fcd34d" stroke-width="1.2"/>
        <text x="352" y="21" fill="#fcd34d" font-family="monospace" font-size="9">1,319 EVENTS</text>
      </svg>
    `
  },
  {
    id: 'still-there',
    number: '02 / 08',
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
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-02 // APOLLO LRRR CORNER-CUBE RETRO-REFLECTOR OPTICS</text>
        <!-- Earth Observatory Dish -->
        <g transform="translate(68, 108)" fill="none" stroke="#94a3b8" stroke-width="1.1">
          <circle cx="0" cy="0" r="24" fill="rgba(15,23,42,0.8)"/>
          <path d="M -18 -16 A 24 24 0 0 1 18 16" stroke="#7dd3fc" stroke-width="1.4"/>
          <line x1="0" y1="0" x2="18" y2="-10" stroke="#7dd3fc"/>
        </g>
        <!-- Laser Pulse & Return Path -->
        <line x1="92" y1="98" x2="318" y2="58" stroke="#34d399" stroke-width="1.1" stroke-dasharray="4 3"/>
        <line x1="318" y1="64" x2="92" y2="104" stroke="#fcd34d" stroke-width="1.1" stroke-dasharray="2 3"/>
        <text x="162" y="70" fill="#fcd34d" font-family="monospace" font-size="9.5">Δt = 2d/c = 2.562s (384,400 km)</text>
        <!-- Lunar Surface & 100-Prism Array Schematic -->
        <g transform="translate(348, 66)" fill="none" stroke="#cbd5e1" stroke-width="1">
          <rect x="-26" y="-22" width="52" height="44" fill="#0f172a" stroke="#fcd34d" stroke-width="1.1"/>
          <line x1="-26" y1="-7" x2="26" y2="-7" stroke="rgba(255,255,255,0.2)"/>
          <line x1="-26" y1="7" x2="26" y2="7" stroke="rgba(255,255,255,0.2)"/>
          <line x1="-9" y1="-22" x2="-9" y2="22" stroke="rgba(255,255,255,0.2)"/>
          <line x1="9" y1="-22" x2="9" y2="22" stroke="rgba(255,255,255,0.2)"/>
          <circle cx="-17" cy="-14" r="3" stroke="#7dd3fc"/>
          <circle cx="0" cy="-14" r="3" stroke="#7dd3fc"/>
          <circle cx="17" cy="-14" r="3" stroke="#7dd3fc"/>
          <circle cx="-17" cy="0" r="3" stroke="#fcd34d"/>
          <circle cx="0" cy="0" r="3" stroke="#fcd34d"/>
          <circle cx="17" cy="0" r="3" stroke="#fcd34d"/>
        </g>
      </svg>
    `
  },
  {
    id: 'one-wheel-left',
    number: '03 / 08',
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
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-03 // MER-A SPIRIT ROCKER-BOGIE &amp; SOL 1187 SILICA TRENCH</text>
        <!-- Terrain Profile & Excavated Silica Horizon -->
        <path d="M 18 126 Q 150 106 270 118 T 422 108" fill="none" stroke="#475569" stroke-width="1.2"/>
        <path d="M 32 126 Q 150 107 248 117" fill="none" stroke="#7dd3fc" stroke-width="2.2"/>
        <text x="42" y="106" fill="#7dd3fc" font-family="monospace" font-size="9">OPALINE SILICA (&gt;90% SiO₂)</text>
        <!-- Technical CAD Side-Elevation of MER Rover -->
        <g transform="translate(278, 102)" fill="none" stroke="#cbd5e1" stroke-width="1.2">
          <!-- Rocker-bogie linkage -->
          <polyline points="-34,12 -18,0 -2,12"/>
          <polyline points="-18,0 8,-10 30,12"/>
          <!-- WEB Chassis & Solar Deck -->
          <polygon points="-24,-10 22,-10 19,-22 -27,-22" fill="#0f172a" stroke="#fcd34d" stroke-width="1.1"/>
          <line x1="-32" y1="-22" x2="28" y2="-22" stroke="#e2e8f0" stroke-width="1.5"/>
          <!-- PMA Mast & Pancam -->
          <line x1="16" y1="-22" x2="18" y2="-44"/>
          <rect x="12" y="-49" width="12" height="5" fill="#0f172a" stroke="#e2e8f0"/>
          <!-- HGA Dish -->
          <line x1="-16" y1="-22" x2="-20" y2="-32"/>
          <ellipse cx="-21" cy="-33" rx="7" ry="2.2" transform="rotate(-20 -21 -33)" stroke="#fcd34d"/>
          <!-- 3 Wheels (Left Rear Stuck Actuator highlighted) -->
          <circle cx="-34" cy="12" r="8" fill="#090d16" stroke="#7dd3fc" stroke-width="1.4" stroke-dasharray="3 2"/>
          <circle cx="-2" cy="12" r="8" fill="#090d16" stroke="#94a3b8"/>
          <circle cx="30" cy="12" r="8" fill="#090d16" stroke="#94a3b8"/>
        </g>
      </svg>
    `
  },
  {
    id: 'unsent',
    number: '04 / 08',
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
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-04 // MER-B OPPORTUNITY VOLATILE RAM &amp; UHF MRO RELAY</text>
        <!-- RAM Buffer Slots -->
        <g transform="translate(46, 56)" font-family="monospace" font-size="8.5">
          <rect x="0" y="0" width="44" height="54" fill="none" stroke="#475569" stroke-dasharray="3 2"/>
          <text x="8" y="30" fill="#64748b">VOLATILE</text>
          <rect x="56" y="-4" width="48" height="62" fill="rgba(245,158,11,0.08)" stroke="#fcd34d" stroke-width="1.2"/>
          <text x="64" y="26" fill="#fcd34d">PACKET 01</text>
          <text x="64" y="38" fill="#94a3b8">UHF TX</text>
          <rect x="116" y="0" width="44" height="54" fill="none" stroke="#475569" stroke-dasharray="3 2"/>
          <text x="124" y="30" fill="#64748b">VOLATILE</text>
        </g>
        <!-- UHF Telemetry Wavefront -->
        <path d="M 225 78 C 260 78, 275 48, 318 48" fill="none" stroke="#fcd34d" stroke-width="1.2" stroke-dasharray="3 3"/>
        <!-- MRO Relay Orbiter Schematic -->
        <g transform="translate(358, 52)" fill="none" stroke="#cbd5e1" stroke-width="1.1">
          <rect x="-34" y="-4" width="22" height="8" fill="rgba(56,189,248,0.18)" stroke="#7dd3fc"/>
          <rect x="12" y="-4" width="22" height="8" fill="rgba(56,189,248,0.18)" stroke="#7dd3fc"/>
          <rect x="-8" y="-7" width="16" height="14" fill="#0f172a" stroke="#fcd34d"/>
          <ellipse cx="0" cy="-12" rx="11" ry="3.2" stroke="#e2e8f0"/>
        </g>
        <text x="296" y="118" fill="#94a3b8" font-family="monospace" font-size="9">SOL 5111 // TAU = 10.8 DUST OPACITY</text>
      </svg>
    `
  },
  {
    id: 'moon-still-rings',
    number: '05 / 08',
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
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-05 // APOLLO 12 PASSIVE SEISMIC EXPERIMENT (HIGH-Q CRUST)</text>
        <!-- Lunar Interior Cross-Section -->
        <g transform="translate(135, 92)" fill="none">
          <circle cx="0" cy="0" r="46" stroke="#cbd5e1" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="34" stroke="#f59e0b" stroke-width="0.9" stroke-dasharray="3 2"/>
          <circle cx="0" cy="0" r="16" fill="rgba(245,158,11,0.15)" stroke="#fcd34d" stroke-width="1"/>
          <!-- Scattered P/S seismic rays -->
          <path d="M 0 -46 Q 14 -20 34 0 Q 12 18 -24 38" stroke="#7dd3fc" stroke-width="0.9" opacity="0.75"/>
          <path d="M 0 -46 Q -18 -18 -34 4 Q -10 22 28 36" stroke="#fcd34d" stroke-width="0.9" opacity="0.75"/>
          <circle cx="0" cy="-46" r="3" fill="#fcd34d"/>
        </g>
        <!-- Long-Decay Seismogram Envelope -->
        <g transform="translate(222, 92)" fill="none">
          <line x1="0" y1="0" x2="190" y2="0" stroke="rgba(255,255,255,0.15)"/>
          <polyline points="0,0 10,-6 18,9 26,-18 34,24 42,-32 50,30 58,-26 66,23 74,-20 82,17 90,-15 98,13 106,-11 114,9 122,-8 130,6 138,-5 146,4 154,-3 162,2 175,-1 190,0" stroke="#fcd34d" stroke-width="1.1"/>
          <text x="4" y="-36" fill="#94a3b8" font-family="monospace" font-size="8.5">Q-FACTOR &gt; 3000 (55 MIN RESONANCE)</text>
        </g>
      </svg>
    `
  },
  {
    id: 'eternal-footprint',
    number: '06 / 08',
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
      'Vì Mặt Trăng không có khí quyển, gió hay mưa, những hạt bụi khi bước chân văng lên theo quỹ đạo parabol thuần túy và những vết giày Apollo từ năm 1969 vẫn hiện rõ trong ảnh chụp từ tàu quỹ đạo LRO ngày nay. Chúng sẽ tồn tại hàng triệu năm — dù không bất diệt tuyệt đối vì mưa vi thiên thạch siêu nhỏ vẫn chầm chậm san phẳng lớp đất bề mặt. Chúng ta không bất tử vì dấu vết không phai, mà vì luôn có thế hệ tiếp theo quay lại nhìn.',
    sourceLabel: 'NASA Lunar Reconnaissance Orbiter (LRO)',
    sourceUrl: 'https://science.nasa.gov/mission/lro/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-06 // APOLLO A7L OVERSHOE TREAD &amp; LRO NAC PHOTOMETRY</text>
        <!-- A7L Lunar Bootprint Technical Top-View -->
        <g transform="translate(132, 92) rotate(-14)" fill="none" stroke="#cbd5e1" stroke-width="1.1">
          <rect x="-20" y="-36" width="40" height="72" rx="18" fill="#0f172a" stroke="#fcd34d" stroke-width="1.2"/>
          <line x1="-16" y1="-22" x2="16" y2="-22" stroke="#94a3b8" stroke-width="2"/>
          <line x1="-18" y1="-11" x2="18" y2="-11" stroke="#94a3b8" stroke-width="2"/>
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#94a3b8" stroke-width="2"/>
          <line x1="-18" y1="11" x2="18" y2="11" stroke="#94a3b8" stroke-width="2"/>
          <line x1="-16" y1="22" x2="16" y2="22" stroke="#94a3b8" stroke-width="2"/>
        </g>
        <!-- Incidence Angle Photometry Diagram -->
        <g transform="translate(245, 118)" fill="none">
          <polyline points="0,0 35,0 35,10 55,10 55,0 85,0 85,10 105,10 105,0 145,0" stroke="#cbd5e1" stroke-width="1.2"/>
          <line x1="12" y1="-58" x2="52" y2="6" stroke="#fcd34d" stroke-width="1" stroke-dasharray="3 2"/>
          <line x1="62" y1="-58" x2="102" y2="6" stroke="#fcd34d" stroke-width="1" stroke-dasharray="3 2"/>
          <text x="8" y="-64" fill="#fcd34d" font-family="monospace" font-size="8.5">SOLAR INCIDENCE θ (SHADOW RELIEF)</text>
        </g>
      </svg>
    `
  },
  {
    id: 'pale-blue-dot',
    number: '07 / 08',
    title: 'PALE BLUE DOT — Chấm Xanh Mờ',
    subtitle: 'Tàu thăm dò Voyager 1 & Bức ảnh Gia Đình Hệ Mặt Trời (6 tỷ km)',
    mission: 'NASA Voyager Interstellar Mission • 1977–Nay',
    specs: [
      { label: 'Phần cứng chính', value: 'Camera Narrow-Angle ISS' },
      { label: 'Kích thước Trái Đất', value: '0,12 pixel (trong tia nắng)' },
      { label: 'Khoảng cách năm 1990', value: '6,05 tỷ km (40,5 AU)' }
    ],
    defaultStatLabel: 'Bức chân dung gia đình đã chụp',
    story:
      'Ngày 14/02/1990, sau khi hoàn tất hành trình ngang qua Sao Mộc và Sao Thổ, theo đề xuất của nhà thiên văn Carl Sagan, NASA đã ra lệnh cho Voyager 1 xoay ngược camera nhìn lại quê hương lần cuối ở khoảng cách 6,05 tỷ km trước khi tắt vĩnh viễn hệ thống máy ảnh để tiết kiệm điện năng tiến vào không gian liên sao. Trong 60 khung hình "Family Portrait", Trái Đất chỉ hiện ra như một chấm xanh nhỏ bé 0,12 pixel lọt thỏm giữa một tia sáng Mặt Trời tán xạ — nhắc nhở nhân loại về mái nhà mong manh duy nhất của mình.',
    sourceLabel: 'NASA JPL — Voyager 1 Pale Blue Dot & Golden Record',
    sourceUrl: 'https://science.nasa.gov/mission/voyager/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-07 // VOYAGER 1 ISS NARROW-ANGLE OPTICS AT 40.5 AU</text>
        <!-- Scattered Sunlight Ray & Camera Field of View -->
        <polygon points="195,30 235,30 305,155 255,155" fill="rgba(251,191,36,0.12)"/>
        <line x1="195" y1="30" x2="255" y2="155" stroke="rgba(251,191,36,0.35)" stroke-width="0.8" stroke-dasharray="3 3"/>
        <line x1="235" y1="30" x2="305" y2="155" stroke="rgba(251,191,36,0.35)" stroke-width="0.8" stroke-dasharray="3 3"/>
        <!-- Voyager 1 HGA & ISS Camera Boom -->
        <g transform="translate(76, 92)" fill="none" stroke="#cbd5e1" stroke-width="1.1">
          <ellipse cx="0" cy="0" rx="8" ry="24" fill="#0f172a" stroke="#e2e8f0"/>
          <line x1="8" y1="0" x2="48" y2="-18"/>
          <rect x="46" y="-23" width="10" height="8" fill="#0f172a" stroke="#7dd3fc"/>
        </g>
        <line x1="134" y1="72" x2="242" y2="92" stroke="#7dd3fc" stroke-width="0.9" stroke-dasharray="2 3"/>
        <!-- Earth Mote inside Narrow-Angle Reticle -->
        <g transform="translate(248, 92)" fill="none">
          <rect x="-14" y="-14" width="28" height="28" stroke="#7dd3fc" stroke-width="1"/>
          <circle cx="0" cy="0" r="2.2" fill="#bae6fd"/>
          <text x="20" y="4" fill="#7dd3fc" font-family="monospace" font-size="9">EARTH (0.12 PX // 6.05B KM)</text>
        </g>
      </svg>
    `
  },
  {
    id: 'grand-finale',
    number: '08 / 08',
    title: 'GRAND FINALE — Cú Lao Cuối Cùng',
    subtitle: 'Tàu quỹ đạo Cassini & 22 Quỹ Đạo Lặn Vào Sao Thổ',
    mission: 'NASA / ESA / ASI Cassini–Huygens • 1997–2017',
    specs: [
      { label: 'Phần cứng chính', value: 'Ăng-ten High-Gain 4m' },
      { label: 'Vận tốc lao khí quyển', value: '113.000 km/h' },
      { label: 'Mục đích hy sinh', value: 'Bảo vệ đại dương Enceladus' }
    ],
    defaultStatLabel: 'Gói dữ liệu cuối kịp truyền về',
    story:
      'Sau 13 năm khám phá Sao Thổ, phát hiện các mạch nước ngầm ấm áp trên mặt trăng Enceladus và hồ mê-tan trên Titan, nhiên liệu của Cassini dần cạn kiệt vào năm 2017. Để đảm bảo con tàu không bao giờ vô tình va chạm và làm nhiễm vi sinh vật Trái Đất lên Enceladus hay Titan, NASA cho Cassini lặn 22 vòng qua khe hở giữa Sao Thổ và vành đai rồi lao thẳng vào khí quyển hành tinh khí khổng lồ ngày 15/09/2017. Cho tới giây cuối cùng, các động cơ đẩy vẫn cố giữ ăng-ten của Cassini hướng thẳng về Trái Đất để gửi những số liệu khí quyển quý giá nhất.',
    sourceLabel: 'NASA Science — Cassini Grand Finale at Saturn',
    sourceUrl: 'https://science.nasa.gov/mission/cassini/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-08 // CASSINI PROXIMAL ORBIT &amp; HGA EARTH-LOCK GEOMETRY</text>
        <!-- Saturn Limb & Ring Plane -->
        <path d="M 12 155 A 180 95 0 0 1 255 155" fill="rgba(217,119,6,0.14)" stroke="#f59e0b" stroke-width="1.2"/>
        <ellipse cx="132" cy="148" rx="195" ry="44" fill="none" stroke="rgba(253,230,138,0.45)" stroke-width="1.2" transform="rotate(-12 132 148)"/>
        <ellipse cx="132" cy="148" rx="165" ry="36" fill="none" stroke="rgba(253,230,138,0.28)" stroke-width="1" transform="rotate(-12 132 148)"/>
        <!-- Proximal Dive Trajectory & Cassini Spacecraft -->
        <path d="M 165 36 Q 210 72 204 134" fill="none" stroke="#fcd34d" stroke-width="1.2" stroke-dasharray="3 2"/>
        <g transform="translate(200, 84) rotate(-24)" fill="none" stroke="#e2e8f0" stroke-width="1.1">
          <rect x="-6" y="-6" width="12" height="12" fill="#0f172a" stroke="#fcd34d"/>
          <ellipse cx="8" cy="0" rx="3" ry="10" stroke="#7dd3fc"/>
        </g>
        <!-- HGA Telemetry Lock Line to Earth -->
        <line x1="210" y1="80" x2="378" y2="46" stroke="#7dd3fc" stroke-width="1.1" stroke-dasharray="4 3"/>
        <circle cx="382" cy="45" r="3" fill="#7dd3fc"/>
        <text x="278" y="39" fill="#7dd3fc" font-family="monospace" font-size="8.5">EARTH DSN LOCK (83 MIN RTLT)</text>
      </svg>
    `
  },
  {
    id: 'rise-zero-g',
    number: '09 / 09 ★',
    title: 'RISE IN ZERO-G — Linh Vật Không Trọng Lực',
    subtitle: 'Búp bê Plushie Rise & Truyền thống Zero-G Indicator trên tàu vũ trụ',
    mission: 'VantaLumen × NASA Human Spaceflight Tradition • LEO 408 km',
    specs: [
      { label: 'Vai trò trên tàu', value: 'Zero-G Indicator (MECO)' },
      { label: 'Gia tốc vi trọng lực', value: '0,00 G (Rơi tự do quỹ đạo)' },
      { label: 'Vận tốc quỹ đạo ISS', value: '27.600 km/h (7,66 km/s)' }
    ],
    defaultStatLabel: 'Cộng hưởng hộp nhạc Zero-G',
    story:
      'Từ chuyến bay lịch sử của Yuri Gagarin (1961), các sứ mệnh Apollo, tàu con thoi Space Shuttle, trạm vũ trụ ISS cho đến tàu Orion của sứ mệnh mặt trăng Artemis I, các phi hành gia luôn mang theo một chú thú bông nhỏ được buộc dây mảnh trong khoang lái làm "Zero-G Indicator" (Chỉ báo Không Trọng Lực). Khoảnh khắc tầng tên lửa chính ngắt động cơ (MECO) và chú thú bông bắt đầu lơ lửng nhẹ nhàng trước mặt phi hành đoàn chính là tín hiệu trực quan đầu tiên báo rằng con tàu đã thoát khỏi lực hút mặt đất và bước vào quỹ đạo vũ trụ. Plushie "Rise" là linh vật đồng hành của đội VantaLumen — mang nụ cười, hộp nhạc ấm áp và lời nhắc rằng trong vũ trụ lạnh giá, tâm hồn trẻ thơ và niềm hy vọng của con người luôn cùng bay lên.',
    sourceLabel: 'NASA — Artemis & ISS Zero-G Indicator Tradition',
    sourceUrl: 'https://www.nasa.gov/humans-in-space/',
    svgDiagram: `
      <svg viewBox="0 0 440 155" width="100%" height="100%">
        <defs>
          <pattern id="cad-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="0.7"/>
          </pattern>
        </defs>
        <rect width="440" height="155" fill="#060911"/>
        <rect width="440" height="155" fill="url(#cad-grid)"/>
        <line x1="12" y1="30" x2="428" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.5" letter-spacing="1">CAD-09 // ZERO-G INDICATOR PLUSHIE "RISE" (MECO MICROGRAVITY SENSOR)</text>
        <!-- Cupola Octagonal Frame & Tether Schematic -->
        <g transform="translate(152, 92)" fill="none" stroke="#cbd5e1" stroke-width="1.1">
          <circle cx="0" cy="0" r="46" stroke="rgba(148,163,184,0.35)" stroke-dasharray="4 3"/>
          <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#7dd3fc" stroke-width="1.2"/>
          <!-- Rise Cap Visor -->
          <path d="M -26 -12 A 28 24 0 0 1 26 -12" stroke="#38bdf8" stroke-width="2"/>
          <ellipse cx="0" cy="-20" rx="18" ry="8" fill="#090d16" stroke="#fcd34d" stroke-width="1.1"/>
          <!-- Eyes & Smile -->
          <circle cx="-10" cy="-2" r="3.5" fill="#fcd34d"/>
          <circle cx="10" cy="-2" r="3.5" fill="#fcd34d"/>
          <circle cx="-17" cy="5" r="3" fill="rgba(244,114,182,0.55)" stroke="none"/>
          <circle cx="17" cy="5" r="3" fill="rgba(244,114,182,0.55)" stroke="none"/>
          <path d="M -7 6 Q 0 12 7 6" stroke="#fcd34d" stroke-width="1.4"/>
          <!-- Umbilical Tether -->
          <path d="M 0 32 Q 14 44 42 46" stroke="#fcd34d" stroke-width="1.1" stroke-dasharray="3 2"/>
        </g>
        <g font-family="monospace" font-size="8.5" fill="#94a3b8">
          <text x="232" y="64" fill="#fcd34d">PAYLOAD: "RISE" PLUSHIE MASCOT</text>
          <text x="232" y="82">ACCELERATION: a = 0.000 m/s² (LEO)</text>
          <text x="232" y="100" fill="#7dd3fc">AUDIO: PENTATONIC MUSIC-BOX CHIME</text>
          <text x="232" y="118">TETHER: KAPTON BRAIDED UMBILICAL</text>
        </g>
      </svg>
    `
  }
];
