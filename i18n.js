/**
 * VantaLumen Bilingual Engine (Vietnamese <-> English)
 * Persists user preference in localStorage ('vantalumen_lang').
 */
(function () {
  let saved = 'vi';
  try {
    const v = localStorage.getItem('vantalumen_lang');
    if (v === 'en' || v === 'vi') saved = v;
  } catch {}

  const UI_EN = {
    'whisper-pill': 'NASA SPACE APPS • THE NEXT FRONTIER • TEAM VANTALUMEN',
    'whisper-sub': 'Storytelling Odyssey — Tap, swipe, or press any key to awaken Cosmic Audio & step onto the Next Frontier',
    'btn-guide-tip': 'Guides (H)',
    'btn-quiz-tip': 'Space Quiz (Q)',
    'btn-shard-tip': 'Memory Shard (I)',
    'btn-gallery-tip': 'Memory Archive',
    'btn-lang-tip': 'Tiếng Việt (L)',
    'btn-audio-tip': 'Sound (M)',
    'btn-rise-tip': 'RISE • Artemis II 0-G (R)',
    'btn-spirit-tip': 'SPIRIT • Mars Rescue (S)',
    'btn-close': 'Close ✕',
    'tab-diagram': 'Hardware Blueprint',
    'tab-nasa-photo': 'Real NASA Photo (API)',
    'shard-meta-label': 'NASA Scientific Reference:',
    'btn-export-card': 'Save Card PNG ↓',
    'btn-replay': 'Replay',
    'btn-next-shard': 'Next Memory →',
    'btn-prev-quiz': '← Previous',
    'btn-next-quiz': 'Next Question →',
    'gal-pill': 'TEAM VANTALUMEN • ANTHOLOGY ARCHIVE',
    'gal-title': 'Memory Shard Archive',
    'gal-sub': '8 space exploration stories — from Apollo & Mars rovers to Artemis II & Spirit Rescue',
    'btn-cert': 'Certificate PNG ↓',
    'btn-gal-quiz': 'VantaLumen Space Quiz ★',
    'btn-gal-dossier': 'Mission Dossier',
    'gal-lbl-shards': 'AWAKENED MEMORY SHARDS',
    'gal-lbl-quiz': 'VANTALUMEN COSMIC KNOWLEDGE',
    'gal-lbl-rank': 'MISSION RANK',
    'guide-pill': 'VANTALUMEN • HOW TO PLAY',
    'guide-title': '8 Space Minigame Guides',
    'guide-sub': 'Core goals & controls for each NASA & SpaceX mission',
    'dossier-pill': 'THE NEXT FRONTIER • STORYTELLING TRACK • TEAM VANTALUMEN',
    'dossier-title': 'VANTALUMEN — Echoes in the Dust',
    'dossier-sub': 'The Next Frontier Storytelling: From cosmic dust darkness (Vanta) to human memory light (Lumen)',
    'btn-close-dossier': 'Back to Experience ✕',
    'btn-dossier-guide': '8 Minigame Guides',
    'btn-dossier-quiz': '8 Space Quiz Cards',
    'btn-unlock-all': 'Unlock All 8 Memories ★',
    'kpi-missions': 'STORY CHAPTERS',
    'kpi-audio': 'WEB AUDIO FM SYNTH',
    'kpi-quiz': 'BILINGUAL QUIZ CARDS',
    'kpi-hud': 'CLUTTER DURING PLAY',
    'judge-title': 'Judge & Presentation Mode • The Next Frontier',
    'judge-desc': 'Keys 1–8 / ‹ › switch chapters · R Rise 0-G · S Spirit Rescue · L Language · H Guides · I Shards · Q Quiz',
    'act-1-title': 'ACT I · ECHOES IN THE DUST',
    'act-1-desc': 'InSight, Apollo LRRR, Spirit & Opportunity — silent listeners sending humanity’s first whispers across worlds.',
    'act-2-title': 'ACT II · PLANETARY RESONANCE',
    'act-2-desc': 'Apollo 12 PSE & LRO Tranquility — decoding how worlds ring and preserving our footprints in windless ash.',
    'act-3-title': 'ACT III · THE NEXT FRONTIER',
    'act-3-desc': 'RISE (Artemis II, 2026) & Spirit Rescue — carrying human warmth forward and bringing lost explorers home.',
    'cert-pill': '★ MISSION ACCOMPLISHED • THE NEXT FRONTIER (8 / 8)',
    'cert-title': 'VantaLumen Storytelling Completion Certificate',
    'cert-sub': 'Congratulations on completing all 8 chapters of Team VantaLumen’s The Next Frontier odyssey!',
    'btn-cert-view-shard': 'View Final Shard',
    'btn-cert-open-gallery': 'Memory Archive',
    'btn-download-cert-modal': 'Download Certificate PNG ↓'
  };

  const SHARDS_EN = {
    'under-the-dust': {
      title: 'UNDER THE DUST — Heartbeat Beneath the Sand',
      subtitle: 'NASA InSight Lander • Elysium Planitia, Mars',
      mission: 'NASA Discovery Program (2018–2022)',
      defaultStatLabel: 'Final Dust Removal',
      story:
        'After 4 years on Mars, red iron-oxide dust blanketed InSight’s twin solar arrays. Clear the sand to awaken its solar power and SEIS seismometer—which recorded 1,319 marsquakes before falling silent in Dec 2022.',
      specs: [
        { label: 'Hardware', value: 'UltraFlex Solar Arrays + SEIS' },
        { label: 'Landing Site', value: 'Elysium Planitia (4.5°N)' },
        { label: 'Quakes Recorded', value: '1,319 Marsquakes' }
      ]
    },
    'still-there': {
      title: 'STILL THERE — Light Across 384,400 km',
      subtitle: 'Apollo 11, 14 & 15 Lunar Laser Retroreflectors',
      mission: 'Apollo Lunar Ranging (1969–Present)',
      defaultStatLabel: 'Constellation Lock',
      story:
        'Apollo astronauts left corner-cube mirror arrays on the Moon. Even today, Earth observatories bounce laser pulses off them in 2.562 seconds—proving humans walked there and measuring the Moon drifting 3.8 cm/year.',
      specs: [
        { label: 'Hardware', value: 'Fused Silica Corner-Cube LRRR' },
        { label: 'Round-Trip Light', value: '2.562 Seconds (384,400 km)' },
        { label: 'Lunar Drift', value: '+3.8 cm / year' }
      ]
    },
    'one-wheel-left': {
      title: 'ONE WHEEL LEFT — Driving Backwards on Mars',
      subtitle: 'NASA Mars Exploration Rover Spirit (MER-A)',
      mission: 'NASA MER-A (2004–2010)',
      defaultStatLabel: 'Silica Discovered',
      story:
        'When Spirit’s right-front wheel seized in 2006, engineers drove it backwards across Gusev Crater. That dragging wheel accidentally scraped open >90% pure silica—evidence of ancient Martian hot springs.',
      specs: [
        { label: 'Hardware', value: 'Spirit Rover (6-Wheel Rocker-Bogie)' },
        { label: 'Design Life', value: '90 Sols → Lasted 2,208 Sols' },
        { label: 'Discovery', value: '>90% Pure Hydrothermal Silica' }
      ]
    },
    'unsent': {
      title: 'UNSENT — "My Battery Is Low and It’s Getting Dark"',
      subtitle: 'NASA Mars Exploration Rover Opportunity (MER-B)',
      mission: 'NASA MER-B (2004–2018)',
      defaultStatLabel: 'Beacon Strength',
      story:
        'Built for 90 days, Opportunity roved Mars for nearly 15 years (45.16 km). In June 2018, a planet-encircling dust storm blocked the Sun and silenced its final transmission.',
      specs: [
        { label: 'Hardware', value: 'Opportunity (High-Gain Dish)' },
        { label: 'Endurance', value: '5,111 Sols (56.8× Design)' },
        { label: 'Distance Driven', value: '45.16 km (Marathon)' }
      ]
    },
    'moon-still-rings': {
      title: 'MOON STILL RINGS — A Bell in the Vacuum',
      subtitle: 'Apollo 12 Passive Seismic Experiment',
      mission: 'Apollo 12 ALSEP (1969)',
      defaultStatLabel: 'Resonance Comparison',
      story:
        'When NASA intentionally crashed the Apollo 12 ascent stage into the Moon, it rang like a bell for nearly an hour! Dry, fractured lunar crust has almost zero water to damp seismic waves.',
      specs: [
        { label: 'Hardware', value: 'Apollo 12 PSE Seismometer' },
        { label: 'Ring Duration', value: '>55 Minutes (Nov 20, 1969)' },
        { label: 'Quality Factor', value: 'Q ≈ 3,000–5,000 (vs Earth ~200)' }
      ]
    },
    'eternal-footprint': {
      title: 'ETERNAL FOOTPRINT — Unchanged for Millions of Years',
      subtitle: 'Apollo 11 Bootprints in Tranquility Base',
      mission: 'Apollo 11 / LRO Surveillance',
      defaultStatLabel: 'Solar Azimuth',
      story:
        'With no wind, rain, or flowing water on the Moon, astronaut bootprints from July 1969 remain crisp—eroded only by micrometeorites at ~1–2 mm per million years.',
      specs: [
        { label: 'Hardware', value: 'A7L Lunar Overshoe Tread' },
        { label: 'Site', value: 'Mare Tranquillitatis (0.67°N)' },
        { label: 'Preservation', value: '10+ Million Years' }
      ]
    },
    'rise-zero-g': {
      title: 'RISE — A Little Moon With a Big Dream',
      subtitle: 'NASA Artemis II Zero-Gravity Indicator • Space Apps 2026',
      mission: 'NASA Artemis II (Orion) • Designed by Lucas Ye (Age 8)',
      defaultStatLabel: '7 Stars on Rise’s Cap Brim',
      story:
        'Official Zero-G Indicator aboard Orion for Artemis II (2026), designed by 8-year-old Lucas Ye from the iconic 1968 Apollo 8 Earthrise photo. Four symbols: Moon body, Earth cap, 7 stars & 2 rockets brim, and Apollo 11 footprint on the back.',
      specs: [
        { label: 'Young Designer', value: 'Lucas Ye (Age 8 • Artemis II)' },
        { label: '4 Design Symbols', value: 'Earth Cap • 7 Stars • 2 Rockets • Footprint' },
        { label: 'Timeline', value: '1968 Apollo 8 → 1969 Apollo 11 → 2026 Artemis II' }
      ]
    },
    'spirit-rescue': {
      title: 'SPIRIT RESCUE — Bringing Spirit Home (Fictional)',
      subtitle: 'SpaceX Starship Mars Rescue • Wheel Motor & 100% Battery Overhaul',
      mission: 'Fictional SpaceX Starship × NASA MER-A Spirit',
      defaultStatLabel: 'Rescue & Overhaul Status',
      story:
        'A heartfelt fictional tribute: fly SpaceX Starship 225 million km to Gusev Crater, lift stranded rover Spirit into the cargo bay, return to Earth, replace its seized 2006 wheel motor, and super-charge its battery to 100%.',
      specs: [
        { label: 'Rescue Vehicle', value: 'SpaceX Starship (Raptor Methalox)' },
        { label: 'Repair Work', value: 'Wheel #1 Motor + 100% Battery' },
        { label: 'Mission Result', value: '225M km × 2 • Spirit Restored' }
      ]
    }
  };

  const GUIDES_EN = {
    'under-the-dust': {
      title: 'UNDER THE DUST — Heartbeat Beneath the Sand',
      hardware: 'NASA InSight Lander & UltraFlex Solar Arrays',
      goal: 'Brush away Martian dust to restore solar power and awaken InSight’s seismic heartbeat.',
      controls: [
        { gesture: 'Tap or Swipe solar panels', action: 'Sweep golden wind across the decagonal wings to blow away red dust.' },
        { gesture: 'Press & Hold for dust devil', action: 'Create a mini vortex around your finger/cursor for faster clearing.' }
      ],
      steps: [
        'Swipe or hold over the decagonal solar wings until the dust clears.',
        'When the central energy ring fills, InSight awakens and unlocks its Memory Shard.'
      ],
      tip: 'Listen closely: the seismic heartbeat grows warmer and clearer as solar power rises.'
    },
    'still-there': {
      title: 'STILL THERE — Light Across 384,400 km',
      hardware: 'Apollo 11, 14 & 15 Lunar Laser Retroreflectors',
      goal: 'Fire laser pulses from Earth to hit all 3 Apollo retroreflectors on the Moon.',
      controls: [
        { gesture: 'Aim / Tap the 3 beacons', action: 'The reticle magnetically snaps to each Apollo mirror site.' },
        { gesture: 'Tap / Click / Space', action: 'Launch a cyan laser pulse and catch the returning photon echo.' }
      ],
      steps: [
        'Tap the 3 blinking target beacons on the Moon (Apollo 11, 14, and 15).',
        'Receive all 3 returning photon echoes to complete the Apollo triangle.'
      ],
      tip: 'Real distance: 384,400 km — light takes 2.56 seconds for the round trip.'
    },
    'one-wheel-left': {
      title: 'ONE WHEEL LEFT — Driving Backwards',
      hardware: 'NASA Spirit Rover (MER-A) at Gusev Crater',
      goal: 'Drive Spirit backwards toward the cyan Silica Ridge on the right to uncover ancient hot-spring soil.',
      controls: [
        { gesture: 'Hold Right side / ArrowRight / D', action: 'Drive Spirit forward-in-reverse, dragging its seized wheel.' },
        { gesture: 'Tap the glowing Silica Ridge', action: 'Auto-drive toward the bright cyan-white silica deposit.' }
      ],
      steps: [
        'Hold the right half of the screen (or ArrowRight) to drag the stuck wheel across the sand.',
        'Reach the Silica Ridge to reveal the >90% pure silica trail.'
      ],
      tip: 'In 2006, Spirit’s seized front-right wheel accidentally uncovered evidence of ancient water.'
    },
    'unsent': {
      title: 'UNSENT — "My Battery Is Low"',
      hardware: 'NASA Opportunity Rover (MER-B) High-Gain Antenna',
      goal: 'Tune the orbital receiver dish to catch Opportunity’s 3 final fading echoes during the dust storm.',
      controls: [
        { gesture: 'Drag / Tap on the frequency arc', action: 'Align the golden receiver dial with the glowing cyan signal bursts.' },
        { gesture: 'ArrowLeft / ArrowRight', action: 'Fine-tune dish azimuth on desktop.' }
      ],
      steps: [
        'Track the glowing cyan signal pulse along the horizon arc.',
        'Lock onto 3 transmissions before the global dust storm blocks all sunlight.'
      ],
      tip: 'Opportunity survived 5,111 Sols — 56.8 times longer than its 90-day warranty.'
    },
    'moon-still-rings': {
      title: 'MOON STILL RINGS — Seismic Bell',
      hardware: 'Apollo 12 Passive Seismic Experiment (PSE)',
      goal: 'Strike the Moon’s resonant nodes and toggle Earth vs. Moon to compare how long vibrations last.',
      controls: [
        { gesture: 'Tap the 5 lunar ring nodes', action: 'Send seismic ripples echoing across the dry, resonant lunar crust.' },
        { gesture: 'Tap Moon / Earth toggle pill', action: 'Compare Earth’s rapid damping with the Moon’s 55-minute bell ring.' }
      ],
      steps: [
        'Tap all 5 glowing resonance nodes on the lunar cutaway.',
        'Feel how dry lunar rock rings far longer than water-rich Earth crust.'
      ],
      tip: 'On Nov 20, 1969, the Apollo 12 ascent stage impact made the Moon ring for >55 minutes.'
    },
    'eternal-footprint': {
      title: 'ETERNAL FOOTPRINT — Tranquility Base',
      hardware: 'Apollo 11 Bootprints & LRO Lunar Reconnaissance Orbiter',
      goal: 'Sweep the Sun’s angle across Tranquility Base to inspect the crisp 1969 astronaut bootprints.',
      controls: [
        { gesture: 'Drag across screen / Slider', action: 'Shift solar azimuth from dawn to dusk to cast dramatic crater shadows.' },
        { gesture: 'ArrowLeft / ArrowRight', action: 'Sweep sunlight angle smoothly.' }
      ],
      steps: [
        'Drag the Sun slider (or swipe left/right) to illuminate the bootprints.',
        'Scan across the regolith to awaken the Tranquility Base Memory Shard.'
      ],
      tip: 'With zero wind or rain, Apollo 11 footprints will remain visible for millions of years.'
    },
    'rise-zero-g': {
      title: 'RISE — Artemis II Zero-G Indicator',
      hardware: 'Orion Spacecraft • NASA Artemis II (2026) • By Lucas Ye (Age 8)',
      goal: 'Float in zero gravity with Rise and collect all 7 golden stars around the Orion window.',
      controls: [
        { gesture: 'Tap or Drag Rise', action: 'Nudge or fling Rise gently through the 0-G cupola.' },
        { gesture: 'Tap any of the 7 Stars (★)', action: 'Guide Rise directly toward that star to collect its chime.' }
      ],
      steps: [
        'Tap Rise or the 7 orbiting stars around the Orion Cupola window.',
        'Collect all 7/7 stars to unlock Rise’s Memory Shard & official infographic.'
      ],
      tip: 'Rise’s 4 symbols: Moon body • Earth cap • 7 Stars & 2 Rockets • Apollo 11 footprint.'
    },
    'spirit-rescue': {
      title: 'SPIRIT RESCUE — SpaceX Mars Rescue (Fictional)',
      hardware: 'SpaceX Starship & NASA Spirit Rover (MER-A)',
      goal: 'Fly Starship to Mars, lift Spirit aboard, fly back to Earth, replace its wheel motor & charge to 100%.',
      controls: [
        { gesture: 'Press & Hold (or Space)', action: 'Fire Raptor engines to Mars, lift Spirit into cargo bay, and fly back to Earth.' },
        { gesture: 'Tap in Earth Repair Bay', action: 'Tap seized wheel to remove old motor, tap new motor to install, then hold lightning pad to charge 100%.' }
      ],
      steps: [
        'Phases 1–3: Hold to fly to Mars, scoop Spirit into Starship, and return to Earth.',
        'Phases 4–5: Swap the seized wheel motor for a new titanium one and charge battery to 100%.'
      ],
      tip: 'In real life, Spirit’s right-front wheel seized in 2006 — this mission brings Spirit home!'
    }
  };

  const QUIZ_EXPLANATIONS_EN = {
    'q1-red-planet': 'Mars gets its iconic rusty red-orange hue from iron-oxide dust blanketing the surface—the very dust that covered InSight’s solar panels.',
    'q2-what-is-sun': 'The Sun is a G-type main-sequence yellow dwarf star at the center of our Solar System, powering spacecraft and illuminating the Moon.',
    'q3-largest-volcano': 'Mars hosts Olympus Mons (~21.9 km tall, nearly 2.5× Everest). Ancient Martian volcanism also fueled the hot springs behind Spirit’s silica discovery.',
    'q6-mars-rover': 'NASA’s Curiosity (and twin rovers Spirit & Opportunity, plus Perseverance) explore Mars to uncover its watery past.',
    'q5-first-human-moon': 'Neil Armstrong stepped onto the Moon on July 20, 1969 (Apollo 11), leaving bootprints that can last millions of years.',
    'q4-hottest-planet': 'Venus is the hottest planet (~465 °C) due to its dense CO₂ runaway greenhouse atmosphere.',
    'q9-rise-artemis-ii': 'Rise was inspired by Apollo 8’s 1968 Earthrise photo, combining a Moon body, Earth cap, 7 stars & 2 rockets, and Apollo 11’s footprint.',
    'q10-spirit-rescue': 'Spirit’s right-front wheel motor seized in 2006, forcing it to drive backwards and accidentally plow open >90% pure silica soil!'
  };

  function applyDOM() {
    const en = saved === 'en';
    document.documentElement.lang = en ? 'en' : 'vi';

    const setText = (sel, viText, enKey) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (!el.dataset.viText) el.dataset.viText = el.textContent;
      el.textContent = en ? UI_EN[enKey] : el.dataset.viText;
    };

    const setTip = (sel, enKey) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (!el.dataset.viTip) el.dataset.viTip = el.getAttribute('data-tooltip') || '';
      el.setAttribute('data-tooltip', en ? UI_EN[enKey] : el.dataset.viTip);
    };

    setText('.whisper-pill', null, 'whisper-pill');
    setText('.whisper-sub', null, 'whisper-sub');
    setTip('#btn-guide', 'btn-guide-tip');
    setTip('#btn-quiz-deck', 'btn-quiz-tip');
    setTip('#btn-instant-shard', 'btn-shard-tip');
    setTip('#btn-gallery', 'btn-gallery-tip');
    setTip('#btn-lang', 'btn-lang-tip');
    setTip('#btn-audio', 'btn-audio-tip');
    setTip('#btn-rise-mascot', 'btn-rise-tip');
    setTip('#btn-spirit-mascot', 'btn-spirit-tip');

    setText('#btn-close-shard', null, 'btn-close');
    setText('#tab-shard-diagram', null, 'tab-diagram');
    setText('#tab-shard-nasa-photo', null, 'tab-nasa-photo');
    setText('.shard-meta span', null, 'shard-meta-label');
    setText('#btn-export-card', null, 'btn-export-card');
    setText('#btn-replay', null, 'btn-replay');
    setText('#btn-next', null, 'btn-next-shard');

    setText('#btn-close-quiz-deck', null, 'btn-close');
    setText('#btn-prev-quiz', null, 'btn-prev-quiz');
    setText('#btn-next-quiz', null, 'btn-next-quiz');

    setText('#gallery-modal .vantalumen-pill', null, 'gal-pill');
    setText('#gallery-modal .gallery-title', null, 'gal-title');
    setText('#gallery-modal .gallery-subtitle', null, 'gal-sub');
    setText('#btn-export-certificate', null, 'btn-cert');
    setText('#btn-open-quiz-from-gallery', null, 'btn-gal-quiz');
    setText('#btn-open-dossier-from-gallery', null, 'btn-gal-dossier');
    setText('#btn-close-gallery', null, 'btn-close');

    const galLabels = document.querySelectorAll('#gallery-telemetry .telemetry-label');
    if (galLabels[0]) {
      if (!galLabels[0].dataset.viText) galLabels[0].dataset.viText = galLabels[0].textContent;
      galLabels[0].textContent = en ? UI_EN['gal-lbl-shards'] : galLabels[0].dataset.viText;
    }
    if (galLabels[1]) {
      if (!galLabels[1].dataset.viText) galLabels[1].dataset.viText = galLabels[1].textContent;
      galLabels[1].textContent = en ? UI_EN['gal-lbl-quiz'] : galLabels[1].dataset.viText;
    }
    if (galLabels[2]) {
      if (!galLabels[2].dataset.viText) galLabels[2].dataset.viText = galLabels[2].textContent;
      galLabels[2].textContent = en ? UI_EN['gal-lbl-rank'] : galLabels[2].dataset.viText;
    }

    setText('#guide-modal .vantalumen-pill', null, 'guide-pill');
    setText('#guide-modal .gallery-title', null, 'guide-title');
    setText('#guide-modal .gallery-subtitle', null, 'guide-sub');
    setText('#btn-close-guide', null, 'btn-close');

    setText('#dossier-modal .vantalumen-pill', null, 'dossier-pill');
    setText('#dossier-modal .gallery-title', null, 'dossier-title');
    setText('#dossier-modal .gallery-subtitle', null, 'dossier-sub');
    setText('#btn-close-dossier', null, 'btn-close-dossier');
    setText('#btn-open-guide-from-dossier', null, 'btn-dossier-guide');
    setText('#btn-open-quiz-from-dossier', null, 'btn-dossier-quiz');
    setText('#btn-unlock-all', null, 'btn-unlock-all');
    setText('#act-1-title', null, 'act-1-title');
    setText('#act-1-desc', null, 'act-1-desc');
    setText('#act-2-title', null, 'act-2-title');
    setText('#act-2-desc', null, 'act-2-desc');
    setText('#act-3-title', null, 'act-3-title');
    setText('#act-3-desc', null, 'act-3-desc');

    setText('#certificate-modal .vantalumen-pill', null, 'cert-pill');
    setText('#cert-modal-title', null, 'cert-title');
    setText('#cert-modal-subtitle', null, 'cert-sub');
    setText('#btn-close-cert-modal', null, 'btn-close');
    setText('#btn-cert-view-shard', null, 'btn-cert-view-shard');
    setText('#btn-cert-open-gallery', null, 'btn-cert-open-gallery');
    setText('#btn-download-cert-modal', null, 'btn-download-cert-modal');
    const kpis = document.querySelectorAll('#dossier-modal .kpi-lbl');
    ['kpi-missions', 'kpi-audio', 'kpi-quiz', 'kpi-hud'].forEach((k, idx) => {
      if (kpis[idx]) {
        if (!kpis[idx].dataset.viText) kpis[idx].dataset.viText = kpis[idx].textContent;
        kpis[idx].textContent = en ? UI_EN[k] : kpis[idx].dataset.viText;
      }
    });
    setText('.judge-bar-text h4', null, 'judge-title');
    setText('.judge-bar-text p', null, 'judge-desc');

    const langBtn = document.getElementById('btn-lang');
    if (langBtn) langBtn.classList.toggle('active-lang-en', en);
  }

  const CHAPTER_STORIES = [
    {
      actVi: 'HỒI I · DƯ ÂM TRONG BỤI',
      actEn: 'ACT I · ECHOES IN THE DUST',
      titleVi: '01 · InSight — Nhịp Đập Dưới Lớp Cát Đỏ',
      titleEn: '01 · InSight — Heartbeat Beneath Red Sand',
      quoteVi: '“Bốn năm phủ kín bụi sắt, tôi vẫn lắng nghe 1.319 nhịp đập thầm kín từ trái tim Sao Hỏa.”',
      quoteEn: '“Beneath four years of iron dust, I kept listening to 1,319 quiet heartbeats deep inside Mars.”'
    },
    {
      actVi: 'HỒI I · DƯ ÂM TRONG BỤI',
      actEn: 'ACT I · ECHOES IN THE DUST',
      titleVi: '02 · Apollo LRRR — Tia Sáng Vượt 384.400 km',
      titleEn: '02 · Apollo LRRR — Light Across 384,400 km',
      quoteVi: '“Tấm gương thạch anh nhỏ bé giữa Biển Tĩnh Lặng vẫn dội về Trái Đất lời khẳng định: chúng tôi đã ở đây.”',
      quoteEn: '“A quiet quartz mirror on the Sea of Tranquility still bounces Earth’s laser home in 2.562 seconds.”'
    },
    {
      actVi: 'HỒI I · DƯ ÂM TRONG BỤI',
      actEn: 'ACT I · ECHOES IN THE DUST',
      titleVi: '03 · Spirit Rover — Bước Lùi Mở Biên Giới',
      titleEn: '03 · Spirit Rover — Stepping Backward Forward',
      quoteVi: '“Khi bánh trước kẹt cứng giữa hố Gusev, tôi đi lùi—và vô tình cày lộ lớp silica tinh khiết của dòng suối cổ.”',
      quoteEn: '“With my front wheel locked, I drove backwards—and uncovered pure silica from ancient Martian hot springs.”'
    },
    {
      actVi: 'HỒI I · DƯ ÂM TRONG BỤI',
      actEn: 'ACT I · ECHOES IN THE DUST',
      titleVi: '04 · Opportunity — Tín Hiệu Cuối Về Nhà Xanh',
      titleEn: '04 · Opportunity — Final Signal Home',
      quoteVi: '“Pin đang cạn và bầu trời tối dần… nhưng tôi kịp gửi ba bức ảnh ký ức qua vệ tinh MRO về Trái Đất.”',
      quoteEn: '“My battery is low and it’s getting dark… yet these three memories will still relay through MRO home to Earth.”'
    },
    {
      actVi: 'HỒI II · CỘNG HƯỞNG HÀNH TINH',
      actEn: 'ACT II · PLANETARY RESONANCE',
      titleVi: '05 · Apollo 12 PSE — Mặt Trăng Ngân Như Chuông',
      titleEn: '05 · Apollo 12 PSE — The Moon Rings Like a Bell',
      quoteVi: '“Khi tầng đổ bộ chạm bề mặt năm 1969, cả Mặt Trăng rung lên hàng giờ như một chiếc chuông đồng ngân dài.”',
      quoteEn: '“When the ascent stage struck in 1969, the Moon rang softly for nearly an hour like an ancient bronze bell.”'
    },
    {
      actVi: 'HỒI II · CỘNG HƯỞNG HÀNH TINH',
      actEn: 'ACT II · PLANETARY RESONANCE',
      titleVi: '06 · LRO Tranquility — Dấu Chân Không Phai',
      titleEn: '06 · LRO Tranquility — Windless Footprints',
      quoteVi: '“Trên lớp tro bụi không một ngọn gió, từng bước chân đầu tiên năm 1969 vẫn nguyên vẹn chờ thế hệ kế tiếp.”',
      quoteEn: '“Upon airless volcanic ash, our very first steps in 1969 wait untouched for the next generation of explorers.”'
    },
    {
      actVi: 'HỒI III · BIÊN GIỚI KẾ TIẾP',
      actEn: 'ACT III · THE NEXT FRONTIER',
      titleVi: '07 · RISE · Artemis II — Nhịp Cầu Trở Lại Mặt Trăng',
      titleEn: '07 · RISE · Artemis II — Beyond Earth’s Cradle',
      quoteVi: '“Khi tôi nhẹ bẫng lơ lửng trong khoang tàu Orion năm 2026, nhân loại chính thức mở cánh cửa biên giới kế tiếp.”',
      quoteEn: '“The moment I float free inside Orion in 2026, humanity steps back out toward the Next Frontier.”'
    },
    {
      actVi: 'HỒI III · BIÊN GIỚI KẾ TIẾP',
      actEn: 'ACT III · THE NEXT FRONTIER',
      titleVi: '08 · Spirit Rescue — Đưa Người Tiên Phong Trở Về',
      titleEn: '08 · Spirit Rescue — Bringing Pioneers Home',
      quoteVi: '“Biên giới mới không bỏ lại ai phía sau: tàu Starship đáp xuống đón Spirit hồi sinh dưới bầu trời Trái Đất.”',
      quoteEn: '“No pioneer is left behind on the Next Frontier: Starship descends to bring Spirit home to Earth.”'
    }
  ];

  window.VantaI18n = {
    get lang() {
      return saved;
    },
    isEn() {
      return saved === 'en';
    },
    t(vi, en) {
      return saved === 'en' ? en : vi;
    },
    getChapterStory(index) {
      const s = CHAPTER_STORIES[index] || CHAPTER_STORIES[0];
      const en = saved === 'en';
      return {
        act: en ? s.actEn : s.actVi,
        title: en ? s.titleEn : s.titleVi,
        quote: en ? s.quoteEn : s.quoteVi
      };
    },
    setLang(next) {
      saved = next === 'en' ? 'en' : 'vi';
      try {
        localStorage.setItem('vantalumen_lang', saved);
      } catch {}
      applyDOM();
    },
    toggle() {
      this.setLang(saved === 'en' ? 'vi' : 'en');
      return saved;
    },
    applyDOM,
    getShard(shard) {
      if (saved !== 'en' || !shard) return shard;
      const tr = SHARDS_EN[shard.id];
      return tr ? { ...shard, ...tr } : shard;
    },
    getGuide(guide) {
      if (saved !== 'en' || !guide) return guide;
      const tr = GUIDES_EN[guide.id];
      if (!tr) return guide;
      return {
        ...guide,
        ...tr,
        controls: (guide.controls || []).map((c, i) => ({
          ...c,
          ...(tr.controls && tr.controls[i] ? tr.controls[i] : {})
        }))
      };
    },
    getQuizExplanation(quiz) {
      if (saved !== 'en' || !quiz) return quiz ? quiz.explanation : '';
      return QUIZ_EXPLANATIONS_EN[quiz.id] || quiz.explanation;
    }
  };
})();
