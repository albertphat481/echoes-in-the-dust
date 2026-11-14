/**
 * VantaLumen — NASA Open Data API & Real-Time Orbital Ephemeris Engine
 * - Queries official NASA Image & Video Library API (images-api.nasa.gov)
 * - Falls back seamlessly to verified NASA PIA / Apollo archival records
 * - Computes live astronomical telemetry (Earth-Moon LRRR light-time, lunar recession, Earth-Mars light delay)
 */

window.NASA_TELEMETRY = (function () {
  const C_KM_S = 299792.458;

  const CURATED_ARCHIVE = {
    'under-the-dust': {
      query: 'InSight+Robotic+Arm+Solar+Panel+Dust',
      nasaId: 'PIA24664',
      title: "InSight's Robotic Arm Helps Remove Solar Panel Dust",
      date: '2021-06-03',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA24664/PIA24664~small.jpg',
      center: 'NASA/JPL-Caltech'
    },
    'still-there': {
      query: '6900957',
      nasaId: '6900957',
      title: 'Apollo 11 Laser Ranging Retroreflector (LRRR) Deployed on Moon',
      date: '1969-07-20',
      imageUrl: 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
      center: 'NASA/JSC'
    },
    'one-wheel-left': {
      query: 'PIA20276',
      nasaId: 'PIA20276',
      title: 'Alteration Effects & Silica Deposits at Gusev Crater (Spirit)',
      date: '2015-12-17',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA20276/PIA20276~medium.jpg',
      center: 'NASA/JPL-Caltech'
    },
    'unsent': {
      query: 'PIA22909',
      nasaId: 'PIA22909',
      title: 'Opportunity Legacy Panorama (Perseverance Valley, True Color)',
      date: '2019-03-12',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA22909/PIA22909~thumb.jpg',
      center: 'NASA/JPL-Caltech'
    },
    'moon-still-rings': {
      query: 'S69-59547',
      nasaId: 'S69-59547',
      title: 'Apollo 12 Seismometer Recording from Lunar Module Ascent Stage Impact',
      date: '1969-11-20',
      imageUrl: 'https://images-assets.nasa.gov/image/S69-59547/S69-59547~medium.jpg',
      center: 'NASA/JSC'
    },
    'eternal-footprint': {
      query: 'as11-40-5877',
      nasaId: 'as11-40-5877',
      title: 'Apollo 11 Astronaut Bootprint on Lunar Regolith (Mare Tranquillitatis)',
      date: '1969-07-20',
      imageUrl: 'https://images-assets.nasa.gov/image/as11-40-5877/as11-40-5877~medium.jpg',
      center: 'NASA/JSC'
    },
    'pale-blue-dot': {
      query: 'PIA00452',
      nasaId: 'PIA00452',
      title: 'Solar System Portrait - Earth as "Pale Blue Dot" (Voyager 1)',
      date: '1990-02-14',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA00452/PIA00452~medium.jpg',
      center: 'NASA/JPL-Caltech'
    },
    'grand-finale': {
      query: 'PIA21889',
      nasaId: 'PIA21889',
      title: "Cassini's Final View of Saturn Before Atmospheric Entry",
      date: '2017-09-14',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA21889/PIA21889~medium.jpg',
      center: 'NASA/JPL-Caltech'
    },
    'rise-zero-g': {
      localOnly: true,
      query: 'Artemis+II+Orion+Zero+G+Indicator',
      nasaId: 'ARTEMIS-II-RISE',
      title: 'RISE — A Little Moon With a Big Dream (NASA Artemis II Zero-G Indicator by Lucas Ye)',
      date: '2026',
      imageUrl: 'assets/rise_infographic.jpg',
      center: 'NASA Artemis II / Space Apps 2026'
    }
  };

  const liveCache = {};
  let apiStatus = 'checking'; // 'online' | 'cached' | 'checking'

  async function fetchMissionPhoto(shardId) {
    if (liveCache[shardId]) return liveCache[shardId];
    const fallback = CURATED_ARCHIVE[shardId] || CURATED_ARCHIVE['under-the-dust'];
    if (fallback.localOnly) {
      const localRecord = { ...fallback, source: 'OFFICIAL INFOGRAPHIC' };
      liveCache[shardId] = localRecord;
      return localRecord;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const url = `https://images-api.nasa.gov/search?q=${fallback.query}&media_type=image`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const items = (json && json.collection && json.collection.items) || [];
      const pick = items.find(it => it.links && it.links[0] && it.links[0].href) || null;

      if (pick && pick.data && pick.data[0]) {
        const d = pick.data[0];
        const record = {
          nasaId: d.nasa_id || fallback.nasaId,
          title: d.title && d.title !== 'n/a' ? d.title : fallback.title,
          date: (d.date_created || fallback.date).slice(0, 10),
          imageUrl: pick.links[0].href,
          center: d.center || fallback.center,
          source: 'LIVE NASA API'
        };
        liveCache[shardId] = record;
        apiStatus = 'online';
        return record;
      }
    } catch {
      // Offline or file:// fallback
    }

    if (apiStatus === 'checking') apiStatus = 'cached';
    const cachedRecord = { ...fallback, source: 'NASA VERIFIED ARCHIVE' };
    liveCache[shardId] = cachedRecord;
    return cachedRecord;
  }

  // Real-time Astronomical Ephemeris Helpers (J2000 reference)
  function getLiveMissionTelemetry(shardId) {
    const now = Date.now();
    const daysSinceJ2000 = (now - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;

    // Lunar distance (Anomalistic month = 27.55455d, mean = 384,400 km, amplitude ~21,100 km)
    const moonPhase = ((daysSinceJ2000 - 19.8) / 27.55455) * Math.PI * 2;
    const moonDistKm = 384400 - Math.cos(moonPhase) * 21100;
    const moonTwoWaySec = (2 * moonDistKm) / C_KM_S;

    // Years since Apollo 11 (July 20, 1969)
    const yearsSinceApollo11 = (now - Date.UTC(1969, 6, 20, 20, 17, 0)) / (86400000 * 365.2425);
    const lunarRecessionCm = yearsSinceApollo11 * 3.8;

    // Earth-Mars distance approximation (Synodic period = 779.94d, opposition ref Dec 8, 2022)
    const daysSinceOpp = (now - Date.UTC(2022, 11, 8, 0, 0, 0)) / 86400000;
    const marsAngle = (daysSinceOpp / 779.94) * Math.PI * 2;
    const rEarth = 149.6e6;
    const rMars = 227.9e6;
    const marsDistKm = Math.sqrt(rEarth * rEarth + rMars * rMars - 2 * rEarth * rMars * Math.cos(marsAngle));
    const marsLightSec = marsDistKm / C_KM_S;
    const marsMin = Math.floor(marsLightSec / 60);
    const marsSec = Math.round(marsLightSec % 60);

    switch (shardId) {
      case 'under-the-dust':
        return {
          badge: 'MARS EPHEMERIS // ELYSIUM PLANITIA (4.5°N, 135.6°E)',
          line: `Độ trễ tín hiệu Trái Đất ↔ Sao Hỏa hôm nay: ${marsMin} phút ${String(marsSec).padStart(2, '0')} giây (${(marsDistKm / 1e6).toFixed(1)} triệu km)`
        };
      case 'still-there':
        return {
          badge: 'LIVE LRRR LASER EPHEMERIS // MARE TRANQUILLITATIS',
          line: `Khoảng cách Mặt Trăng hiện tại: ${Math.round(moonDistKm).toLocaleString('en-US')} km • Trễ Laser 2 chiều: ${moonTwoWaySec.toFixed(3)}s • Đã lùi +${lunarRecessionCm.toFixed(1)} cm từ 1969`
        };
      case 'one-wheel-left':
        return {
          badge: 'MARS EPHEMERIS // GUSEV CRATER (14.57°S, 175.47°E)',
          line: `Độ trễ lệnh từ JPL tới Spirit hôm nay: ${marsMin}p ${String(marsSec).padStart(2, '0')}s • Silica >90% phát hiện tại Sol 1187`
        };
      case 'unsent':
        return {
          badge: 'MARS EPHEMERIS // PERSEVERANCE VALLEY (1.95°S, 354.47°E)',
          line: `Sống 5.111 Sols (gấp 56,8 lần thiết kế 90 Sol) • Khoảng cách Sao Hỏa hiện tại: ${(marsDistKm / 1e6).toFixed(1)} triệu km`
        };
      case 'moon-still-rings':
        return {
          badge: 'LUNAR SEISMIC NETWORK // OCEANUS PROCELLARUM (3.01°S, 23.42°W)',
          line: `Khoảng cách Mặt Trăng: ${Math.round(moonDistKm).toLocaleString('en-US')} km • Thời gian ngân địa chấn >55 phút (Q ≈ 3.000–5.000)`
        };
      case 'eternal-footprint':
        return {
          badge: 'LRO NAC SURVEILLANCE // TRANQUILITY BASE (0.67°N, 23.47°E)',
          line: `Dấu chân Apollo 11 đã tồn tại ${yearsSinceApollo11.toFixed(2)} năm • Tốc độ phong hóa vi thiên thạch: ~1–2 mm / triệu năm`
        };
      case 'pale-blue-dot': {
        const yearsSinceVoyager = (now - Date.UTC(1977, 8, 5, 12, 56, 0)) / (86400000 * 365.2425);
        const voyagerDistKm = 24.4e9 + yearsSinceVoyager * 0.017e9; // ~165+ AU outward cruise
        const lightHrs = (voyagerDistKm / C_KM_S) / 3600;
        return {
          badge: 'DEEP SPACE NETWORK // VOYAGER 1 INTERSTELLAR (>165 AU)',
          line: `Ảnh Pale Blue Dot chụp cách nhà 6,05 tỷ km (1990) • Nay Voyager 1 cách Trái Đất ~${(voyagerDistKm / 1e9).toFixed(1)} tỷ km (${lightHrs.toFixed(1)} giờ ánh sáng)`
        };
      }
      case 'grand-finale':
        return {
          badge: 'CASSINI GRAND FINALE // SATURN UPPER ATMOSPHERE',
          line: '22 quỹ đạo lặn qua khe vành đai (2017) • Tín hiệu cuối duy trì ăng-ten hướng Trái Đất ở tốc độ 113.000 km/h'
        };
      case 'rise-zero-g':
        return {
          badge: 'NASA ARTEMIS II // ORION ZERO-G INDICATOR "RISE" (2026)',
          line: 'Cảm hứng: Earthrise (Apollo 8, 1968) & Dấu chân Apollo 11 (1969) • Thiết kế bởi Lucas Ye (8 tuổi) • Tàu Orion bay vòng quanh Mặt Trăng'
        };
      default:
        return { badge: 'NASA TELEMETRY', line: '' };
    }
  }

  function getApiStatus() {
    return apiStatus;
  }

  return {
    fetchMissionPhoto,
    getLiveMissionTelemetry,
    getApiStatus
  };
})();
