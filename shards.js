/**
 * "Mảnh Vỡ Ký Ức" (Memory Shards) — Tell After Data, Hardware Telemetry & NASA Citations
 * Crafted by Team VANTALUMEN for the NASA Space Apps Challenge.
 */

window.MEMORY_SHARDS = [
  {
    id: 'under-the-dust',
    number: '01 / 09',
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
      'InSight đã ghi nhận 1.319 trận động đất Sao Hỏa ("marsquakes"), lần đầu đo được kích thước lõi lỏng của Hành tinh Đỏ. Năm 2021, kỹ sư NASA dùng cánh tay robot rải cát xuống cạnh tấm pin lúc gió thổi để hạt cát nảy lên cuốn theo lớp bụi mịn (hiện tượng saltation), giúp trạm hoạt động thêm hơn 1 năm.',
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
    number: '02 / 09',
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
      'Không cần nguồn điện, các mảng gương phản xạ góc (LRRR) của Apollo 11, 14 và 15 vẫn phản chiếu xung laser từ Trái Đất suốt hơn 55 năm qua. Phép đo thời gian ánh sáng khứ hồi (~2,56 giây) chứng minh Mặt Trăng có lõi lỏng và đang lùi xa Trái Đất 3,8 cm/năm.',
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
    number: '03 / 09',
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
      'Năm 2006, bánh trước bên phải của rover Spirit bị kẹt, buộc NASA phải lái xe đi lùi và kéo lê chiếc bánh hỏng qua Gusev Crater. Chính rãnh cày này đã vô tình phơi lộ lớp đất chứa hơn 90% Opaline Silica — bằng chứng trực tiếp về suối nước nóng cổ đại từng thuận lợi cho sự sống vi sinh.',
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
    number: '04 / 09',
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
      'Hoạt động gần 15 năm (gấp 55 lần thiết kế), bộ nhớ Flash của Opportunity bị mòn nên phải lưu ảnh vào RAM tạm thời mỗi chiều: chỉ những bức ảnh kịp truyền lên vệ tinh trước khi tắt điện ban đêm mới về được Trái Đất. Ngày 10/06/2018, giữa bão bụi toàn cầu, Opportunity gửi về bức ảnh cuối cùng trước khi yên nghỉ.',
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
    number: '05 / 09',
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
      'Năm 1969, NASA chủ động cho tầng tàu đổ bộ Apollo 12 lao xuống Mặt Trăng để đo địa chấn. Khác với Trái Đất có nước và đá ẩm làm tắt sóng nhanh, lớp vỏ Mặt Trăng khô, lạnh và rạn nứt khiến sóng địa chấn ngân vang suốt hơn 55 phút như một chiếc chuông khổng lồ.',
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
    number: '06 / 09',
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
      'Vì Mặt Trăng không có khí quyển, gió hay mưa, những dấu giày Apollo từ năm 1969 vẫn hiện rõ qua ống kính tàu quỹ đạo LRO ngày nay. Chúng sẽ lưu lại từ 1 đến 10 triệu năm trước khi mưa vi thiên thạch siêu nhỏ chầm chậm san phẳng lớp bụi bề mặt.',
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
    id: 'rise-zero-g',
    number: '07 / 08 ★',
    title: 'RISE — Giấc Mơ Lớn Từ Mặt Trăng Nhỏ',
    subtitle: 'A Little Moon With a Big Dream • Vật Chỉ Thị Không Trọng Lực NASA Artemis II & NASA Space Apps 2026',
    mission: 'NASA Artemis II (Orion) • Thiết kế bởi Lucas Ye (8 tuổi)',
    specs: [
      { label: 'Nhà thiết kế nhí', value: 'Lucas Ye (8 tuổi • Artemis II)' },
      { label: '4 Biểu tượng thiết kế', value: 'Mũ Trái Đất • 7 Sao • 2 Tên Lửa • Dấu Chân' },
      { label: 'Hành trình lịch sử', value: '1968 Apollo 8 → 1969 Apollo 11 → 2026 Artemis II' }
    ],
    defaultStatLabel: 'Chòm 7 ngôi sao trên vành mũ Rise',
    story:
      'Linh vật chỉ thị không trọng lực (Zero-G Indicator) trên tàu Orion (Artemis II • 2026), do cậu bé 8 tuổi Lucas Ye thiết kế từ cảm hứng bức ảnh Earthrise (Apollo 8, 1968). Bốn biểu tượng cốt lõi của Rise: (1) Thân Mặt Trăng màu kem; (2) Mũ Trái Đất xanh; (3) Vành mũ gắn 7 ngôi sao & 2 tên lửa; (4) Dấu giày Apollo 11 (1969) phía sau lưng.',
    sourceLabel: 'NASA Artemis II — Zero-Gravity Indicator "Rise"',
    sourceUrl: 'https://www.nasa.gov/mission/artemis-ii/',
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
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.2" letter-spacing="0.8">CAD-09 // ARTEMIS II ZERO-G INDICATOR "RISE" (BY LUCAS YE, AGE 8)</text>
        <!-- Front View: Moon Body + Earth Cap + 7 Stars & 2 Rockets Brim -->
        <g transform="translate(88, 95)" fill="none" stroke="#cbd5e1" stroke-width="1.1">
          <circle cx="0" cy="4" r="32" fill="#0f172a" stroke="#fef3c7" stroke-width="1.2"/>
          <!-- Earth Cap Dome (Oceans + Continents) -->
          <path d="M -28 -8 A 28 24 0 0 1 28 -8" fill="rgba(14,165,233,0.22)" stroke="#38bdf8" stroke-width="1.4"/>
          <path d="M -16 -22 Q -6 -26 2 -18 Q -6 -12 -16 -22 Z" fill="rgba(34,197,94,0.45)" stroke="#4ade80" stroke-width="0.9"/>
          <path d="M 8 -20 Q 18 -22 22 -13 Q 12 -11 8 -20 Z" fill="rgba(34,197,94,0.45)" stroke="#4ade80" stroke-width="0.9"/>
          <!-- Cap Brim with 7 Stars & 2 Rockets -->
          <ellipse cx="0" cy="-9" rx="25" ry="7.5" fill="#090d16" stroke="#fcd34d" stroke-width="1.1"/>
          <circle cx="-12" cy="-9" r="1.1" fill="#fcd34d" stroke="none"/>
          <circle cx="-8" cy="-10.5" r="1.1" fill="#fcd34d" stroke="none"/>
          <circle cx="-4" cy="-11" r="1.1" fill="#fcd34d" stroke="none"/>
          <circle cx="0" cy="-11.2" r="1.2" fill="#fcd34d" stroke="none"/>
          <circle cx="4" cy="-11" r="1.1" fill="#fcd34d" stroke="none"/>
          <circle cx="8" cy="-10.5" r="1.1" fill="#fcd34d" stroke="none"/>
          <circle cx="12" cy="-9" r="1.1" fill="#fcd34d" stroke="none"/>
          <!-- Eyes, Cheeks & Smile -->
          <circle cx="-10" cy="4" r="3.2" fill="#fcd34d"/>
          <circle cx="10" cy="4" r="3.2" fill="#fcd34d"/>
          <circle cx="-17" cy="10" r="2.8" fill="rgba(244,114,182,0.55)" stroke="none"/>
          <circle cx="17" cy="10" r="2.8" fill="rgba(244,114,182,0.55)" stroke="none"/>
          <path d="M -6 11 Q 0 16 6 11" stroke="#fcd34d" stroke-width="1.3"/>
        </g>
        <!-- Back View: Apollo 11 Astronaut Footprint on Lunar Body -->
        <g transform="translate(174, 102)" fill="none" stroke="#94a3b8" stroke-width="1">
          <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#cbd5e1"/>
          <rect x="-6" y="-11" width="12" height="22" rx="5" stroke="#fcd34d" stroke-width="1"/>
          <line x1="-4" y1="-6" x2="4" y2="-6" stroke="#94a3b8"/>
          <line x1="-4" y1="-1" x2="4" y2="-1" stroke="#94a3b8"/>
          <line x1="-4" y1="4" x2="4" y2="4" stroke="#94a3b8"/>
          <line x1="-4" y1="8" x2="4" y2="8" stroke="#94a3b8"/>
        </g>
        <!-- 4 Official Design Callouts -->
        <g font-family="monospace" font-size="8.3" fill="#cbd5e1">
          <text x="218" y="54" fill="#38bdf8">01. EARTH CAP: BLUE OCEANS &amp; GREEN CONTINENTS</text>
          <text x="218" y="72" fill="#fcd34d">02. CAP BRIM: 7 STARS &amp; 2 ROCKET MOTIFS</text>
          <text x="218" y="90" fill="#fef3c7">03. MOON BODY: INSPIRED BY APOLLO 8 EARTHRISE</text>
          <text x="218" y="108" fill="#94a3b8">04. BACK TREAD: 1969 APOLLO 11 LUNAR FOOTPRINT</text>
          <text x="218" y="128" fill="#f472b6">TIMELINE: 1968 APOLLO 8 → 1969 APOLLO 11 → 2026 ARTEMIS II</text>
        </g>
      </svg>
    `
  },
  {
    id: 'spirit-rescue',
    number: '08 / 08 ★',
    title: 'SPIRIT RESCUE — Giải Cứu Rover Spirit (Fictional)',
    subtitle: 'SpaceX Starship Mars Rescue • Đưa Spirit về Trái Đất thay motor bánh xe & sạc pin 100%',
    mission: 'Fictional SpaceX Starship × NASA MER-A Spirit',
    specs: [
      { label: 'Phương tiện giải cứu', value: 'SpaceX Starship (Raptor Methalox)' },
      { label: 'Hạng mục sửa chữa', value: 'Thay Motor Bánh #1 & Sạc Pin 100%' },
      { label: 'Kết quả sứ mệnh', value: '225M km × 2 • Spirit hồi sinh' }
    ],
    defaultStatLabel: 'Hành trình giải cứu & phục hồi Spirit',
    story:
      'Sứ mệnh giả tưởng đầy cảm hứng: tàu SpaceX Starship vượt 225 triệu km lên Hố Gusev trên Sao Hỏa để bế rover Spirit trở về Trái Đất. Tại xưởng phục hồi, bạn tháo motor bánh xe bị kẹt từ năm 2006, lắp motor titan mới và sạc đầy 100% pin để Spirit lăn bánh trở lại.',
    sourceLabel: 'NASA Mars Exploration Rover Spirit & SpaceX Starship Concept',
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
        <text x="16" y="21" fill="#94a3b8" font-family="monospace" font-size="9.2" letter-spacing="0.8">CAD-10 // FICTIONAL SPACEX STARSHIP RESCUE &amp; SPIRIT OVERHAUL</text>
        <g transform="translate(76, 94)" fill="none" stroke="#cbd5e1" stroke-width="1.2">
          <path d="M -12 24 L -12 -14 Q -12 -32 0 -40 Q 12 -32 12 -14 L 12 24 Z" fill="#0f172a" stroke="#e2e8f0"/>
          <path d="M -12 8 L -22 22 L -12 24 Z" fill="#1e293b"/>
          <path d="M 12 8 L 22 22 L 12 24 Z" fill="#1e293b"/>
          <rect x="-5" y="-18" width="10" height="10" stroke="#38bdf8"/>
          <path d="M -6 25 Q 0 42 6 25" stroke="#60a5fa" stroke-width="1.4"/>
        </g>
        <path d="M 106 86 Q 152 48 196 88" fill="none" stroke="#fcd34d" stroke-width="1.3" stroke-dasharray="4 3"/>
        <g transform="translate(230, 102)" fill="none" stroke="#94a3b8" stroke-width="1.2">
          <rect x="-24" y="-20" width="48" height="10" fill="#0f172a" stroke="#fcd34d"/>
          <circle cx="-18" cy="4" r="7" stroke="#38bdf8" stroke-width="1.5"/>
          <circle cx="0" cy="4" r="7"/>
          <circle cx="18" cy="4" r="7"/>
          <line x1="12" y1="-20" x2="14" y2="-34" stroke="#cbd5e1"/>
          <rect x="9" y="-38" width="11" height="5" stroke="#38bdf8"/>
        </g>
        <g font-family="monospace" font-size="8.4" fill="#cbd5e1">
          <text x="285" y="60" fill="#38bdf8">01. STARSHIP TRANSIT: 225M KM</text>
          <text x="285" y="78" fill="#fcd34d">02. GUSEV CRATER PICKUP</text>
          <text x="285" y="96" fill="#4ade80">03. NEW WHEEL MOTOR INSTALLED</text>
          <text x="285" y="114" fill="#bae6fd">04. BATTERY SUPER-CHARGE: 100%</text>
        </g>
      </svg>
    `
  }
];
