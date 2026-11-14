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
    'whisper-sub': 'Tap, swipe, or press any key to enable Cosmic Audio & awaken the NASA station',
    'btn-guide-tip': 'Guides (H)',
    'btn-quiz-tip': 'Space Quiz (Q)',
    'btn-shard-tip': 'Memory Shard (I)',
    'btn-gallery-tip': 'Memory Archive',
    'btn-lang-tip': 'Tiếng Việt (L)',
    'btn-audio-tip': 'Sound (M)',
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
    'gal-sub': '8 space exploration stories — from Apollo & Mars rovers to Voyager & Cassini',
    'btn-cert': 'Certificate PNG ↓',
    'btn-gal-quiz': 'VantaLumen Space Quiz ★',
    'btn-gal-dossier': 'Mission Dossier',
    'gal-lbl-shards': 'AWAKENED MEMORY SHARDS',
    'gal-lbl-quiz': 'VANTALUMEN COSMIC KNOWLEDGE',
    'gal-lbl-rank': 'MISSION RANK',
    'guide-pill': 'VANTALUMEN • HOW TO PLAY',
    'guide-title': '8 Space Minigame Guides',
    'guide-sub': 'Core goals & controls for each NASA mission',
    'dossier-title': 'VANTALUMEN — Echoes in the Dust',
    'dossier-sub': 'From cosmic dust darkness (Vanta) to human memory light (Lumen)',
    'btn-close-dossier': 'Back to Experience ✕',
    'kpi-missions': 'SPACE MISSIONS',
    'kpi-audio': 'WEB AUDIO FM SYNTH',
    'kpi-quiz': 'BILINGUAL QUIZ CARDS',
    'kpi-hud': 'CLUTTER DURING PLAY',
    'judge-title': 'Judge & Presentation Mode',
    'judge-desc': 'Keys 1–8 / ‹ › switch stations · L Language · H Guides · I Shards · Q Quiz'
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
    'pale-blue-dot': {
      title: 'PALE BLUE DOT — 0.12 Pixels in a Sunbeam',
      subtitle: 'Voyager 1 Family Portrait (6.05 Billion km Away)',
      mission: 'NASA Voyager Interstellar Mission',
      defaultStatLabel: 'Portraits Captured',
      story:
        'On Feb 14, 1990, Carl Sagan persuaded NASA to turn Voyager 1 backward for one last photo. Caught inside a scattered ray of sunlight, Earth appeared as a 0.12-pixel pale blue dot.',
      specs: [
        { label: 'Hardware', value: 'Voyager 1 Narrow-Angle Camera' },
        { label: 'Distance (1990)', value: '6.05 Billion km (40.5 AU)' },
        { label: 'Earth Size', value: '0.12 Pixels' }
      ]
    },
    'grand-finale': {
      title: 'GRAND FINALE — Diving Into Saturn',
      subtitle: 'NASA Cassini-Huygens • 13 Years at Saturn',
      mission: 'NASA / ESA / ASI Cassini (1997–2017)',
      defaultStatLabel: 'Data Uplinked',
      story:
        'Running low on fuel in Sept 2017, Cassini dove into Saturn at 113,000 km/h—keeping its antenna locked on Earth until the final second to protect Enceladus’s subsurface ocean from contamination.',
      specs: [
        { label: 'Hardware', value: 'Cassini High-Gain Antenna' },
        { label: 'Entry Speed', value: '113,000 km/h (Sept 15, 2017)' },
        { label: 'Protected World', value: 'Enceladus Ocean' }
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
    'pale-blue-dot': {
      title: 'PALE BLUE DOT — 6 Billion km Away',
      hardware: 'Voyager 1 Narrow-Angle Camera (1990)',
      goal: 'Capture Jupiter, Saturn, and the 0.12-pixel Earth inside a sunbeam for the Family Portrait.',
      controls: [
        { gesture: 'Tap / Aim viewfinder at planets', action: 'Magnetically lock onto Jupiter, Saturn, and Pale Blue Dot Earth.' },
        { gesture: 'Tap or Space', action: 'Snap the camera shutter to record each planet frame.' }
      ],
      steps: [
        'Capture all 3 target planets (including tiny blue Earth inside the diagonal sunbeam).',
        'Complete the 3-frame Family Portrait strip to unlock Voyager 1’s Memory Shard.'
      ],
      tip: 'Earth is only 0.12 pixels wide in the original 1990 Voyager 1 photograph.'
    },
    'grand-finale': {
      title: 'GRAND FINALE — Diving Into Saturn',
      hardware: 'NASA Cassini Spacecraft & High-Gain Antenna',
      goal: 'Transmit 5 final ring-science packets to Earth before Cassini enters Saturn’s atmosphere.',
      controls: [
        { gesture: 'Tap the 5 glowing ring nodes', action: 'Immediately uplink each science packet toward the Earth star beacon.' },
        { gesture: 'Aim antenna at Earth beacon', action: 'Hold lock on Earth in the upper-right sky to auto-transmit.' }
      ],
      steps: [
        'Tap the 5 golden orbs along Saturn’s rings (or keep your beam locked on Earth).',
        'Finish 5/5 uplinks to protect Enceladus’s icy ocean.'
      ],
      tip: 'On Sept 15, 2017, Cassini kept pointing at Earth until the end at 113,000 km/h.'
    }
  };

  const QUIZ_EXPLANATIONS_EN = {
    'q1-red-planet': 'Mars gets its iconic rusty red-orange hue from iron-oxide dust blanketing the surface—the very dust that covered InSight’s solar panels.',
    'q2-what-is-sun': 'The Sun is a G-type main-sequence yellow dwarf star at the center of our Solar System, powering spacecraft and illuminating the Moon.',
    'q3-largest-volcano': 'Mars hosts Olympus Mons (~21.9 km tall, nearly 2.5× Everest). Ancient Martian volcanism also fueled the hot springs behind Spirit’s silica discovery.',
    'q6-mars-rover': 'NASA’s Curiosity (and twin rovers Spirit & Opportunity, plus Perseverance) explore Mars to uncover its watery past.',
    'q5-first-human-moon': 'Neil Armstrong stepped onto the Moon on July 20, 1969 (Apollo 11), leaving bootprints that can last millions of years.',
    'q4-hottest-planet': 'Venus is the hottest planet (~465 °C) due to its dense CO₂ runaway greenhouse atmosphere.',
    'q7-jupiter-red-spot': 'Jupiter’s Great Red Spot is a giant anticyclonic storm wider than Earth, imaged by Voyager, Galileo, Cassini, and Juno.',
    'q8-cassini-saturn': 'NASA plunged Cassini into Saturn in 2017 so it could never crash into and contaminate icy ocean moons like Enceladus or Titan.'
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

    setText('.whisper-sub', null, 'whisper-sub');
    setTip('#btn-guide', 'btn-guide-tip');
    setTip('#btn-quiz-deck', 'btn-quiz-tip');
    setTip('#btn-instant-shard', 'btn-shard-tip');
    setTip('#btn-gallery', 'btn-gallery-tip');
    setTip('#btn-lang', 'btn-lang-tip');
    setTip('#btn-audio', 'btn-audio-tip');

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

    setText('#dossier-modal .gallery-title', null, 'dossier-title');
    setText('#btn-close-dossier', null, 'btn-close-dossier');
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
