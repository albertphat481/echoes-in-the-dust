/**
 * VantaLumen Official Space Quiz Deck ("Keeping Space Exploration Stories Alive")
 * Integrates the 7 official illustrated VantaLumen question cards into the
 * "Tell After" Memory Shards and the standalone VantaLumen Quiz Deck modal.
 */

window.VANTALUMEN_QUIZZES = [
  {
    id: 'q1-red-planet',
    linkedShardId: 'under-the-dust', // Game 1: InSight on Mars
    image: 'assets/quiz/q1_red_planet.jpg',
    questionEn: 'Which planet is known as the Red Planet?',
    questionVi: 'Hành tinh nào được mệnh danh là Hành Tinh Đỏ?',
    options: [
      { key: 'A', label: 'A) Venus', vi: 'Sao Kim' },
      { key: 'B', label: 'B) Mars', vi: 'Sao Hỏa' },
      { key: 'C', label: 'C) Jupiter', vi: 'Sao Mộc' },
      { key: 'D', label: 'D) Mercury', vi: 'Sao Thủy' }
    ],
    correctKey: 'B',
    explanation:
      'Sao Hỏa (Mars) có màu đỏ cam đặc trưng do lớp bụi sắt oxit (gỉ sắt) phủ khắp bề mặt — chính là lớp bụi đã phủ lên hai cánh pin mặt trời của trạm đổ bộ InSight trong màn chơi Under the Dust.'
  },
  {
    id: 'q2-what-is-sun',
    linkedShardId: 'still-there', // Game 2: Light & Lunar Retroreflectors
    image: 'assets/quiz/q2_what_is_sun.jpg',
    questionEn: 'What is the Sun?',
    questionVi: 'Mặt Trời thực chất là thiên thể gì?',
    options: [
      { key: 'A', label: 'A) A planet', vi: 'Một hành tinh' },
      { key: 'B', label: 'B) A star', vi: 'Một ngôi sao' },
      { key: 'C', label: 'C) A moon', vi: 'Một mặt trăng' },
      { key: 'D', label: 'D) An asteroid', vi: 'Một tiểu hành tinh' }
    ],
    correctKey: 'B',
    explanation:
      'Mặt Trời là một ngôi sao lùn vàng (G-type main-sequence star) ở trung tâm Hệ Mặt Trời, cung cấp ánh sáng và nguồn năng lượng cho các trạm thăm dò vũ trụ cũng như chiếu sáng bề mặt Mặt Trăng.'
  },
  {
    id: 'q3-largest-volcano',
    linkedShardId: 'one-wheel-left', // Game 3: Spirit Rover & Volcanic Hydrothermal Silica on Mars
    image: 'assets/quiz/q3_largest_volcano.jpg',
    questionEn: 'Which planet has the largest volcano in our Solar System?',
    questionVi: 'Hành tinh nào sở hữu ngọn núi lửa lớn nhất Hệ Mặt Trời?',
    options: [
      { key: 'A', label: 'A) Earth', vi: 'Trái Đất' },
      { key: 'B', label: 'B) Venus', vi: 'Sao Kim' },
      { key: 'C', label: 'C) Mars', vi: 'Sao Hỏa' },
      { key: 'D', label: 'D) Mercury', vi: 'Sao Thủy' }
    ],
    correctKey: 'C',
    explanation:
      'Sao Hỏa (Mars) sở hữu núi lửa Olympus Mons cao khoảng 21,9 km (gấp gần 2,5 lần đỉnh Everest). Hoạt động núi lửa cổ đại trên Sao Hỏa cũng chính là nguồn nhiệt tạo nên lớp đất >90% Silica mà chiếc bánh hỏng của rover Spirit đã cày lộ ra!'
  },
  {
    id: 'q6-mars-rover',
    linkedShardId: 'unsent', // Game 4: Mars Rovers (Spirit, Opportunity, Curiosity, Perseverance)
    image: 'assets/quiz/q6_mars_rover.jpg',
    questionEn: "What is the name of NASA's famous rover exploring Mars?",
    questionVi: 'Đâu là tên chiếc rover nổi tiếng của NASA đang thám hiểm Sao Hỏa?',
    options: [
      { key: 'A', label: 'A) Curiosity', vi: 'Rover Curiosity' },
      { key: 'B', label: 'B) Voyager', vi: 'Tàu thăm dò Voyager' },
      { key: 'C', label: 'C) Hubble', vi: 'Kính thiên văn Hubble' },
      { key: 'D', label: 'D) Apollo', vi: 'Tàu đổ bộ Apollo' }
    ],
    correctKey: 'A',
    explanation:
      'Curiosity (cùng thế hệ tiền nhiệm Spirit, Opportunity và hậu bối Perseverance) là dòng xe tự hành 6 bánh nổi tiếng của NASA trên Sao Hỏa; trong khi Voyager thám hiểm rìa Hệ Mặt Trời, Hubble là kính thiên văn quỹ đạo và Apollo là chương trình đổ bộ Mặt Trăng.'
  },
  {
    id: 'q5-shield-earth',
    linkedShardId: 'moon-still-rings', // Game 5: Earth vs Moon interior comparison
    image: 'assets/quiz/q5_shield_earth.jpg',
    questionEn: 'What helps shield Earth from many charged particles from the Sun?',
    questionVi: 'Điều gì giúp bảo vệ Trái Đất khỏi các hạt mang điện từ Mặt Trời?',
    options: [
      { key: 'A', label: "A) Earth's magnetic field", vi: 'Từ trường Trái Đất' },
      { key: 'B', label: "B) The Moon's gravity", vi: 'Lực hấp dẫn Mặt Trăng' },
      { key: 'C', label: "C) Earth's oceans", vi: 'Đại dương Trái Đất' },
      { key: 'D', label: 'D) The clouds', vi: 'Các đám mây' }
    ],
    correctKey: 'A',
    explanation:
      'Từ trường Trái Đất (sinh ra từ lõi sắt lỏng đối lưu bên trong) tạo thành lá chắn từ quyển làm lệch hướng gió Mặt Trời. Ngược lại, Mặt Trăng ngày nay gần như không còn từ trường toàn cầu và có lớp vỏ khô nứt nẻ khiến sóng địa chấn ngân vang rất lâu.'
  },
  {
    id: 'q4-hottest-layer',
    linkedShardId: 'eternal-footprint', // Game 6: Solar radiation, Sun angle & space weathering
    image: 'assets/quiz/q4_hottest_layer.jpg',
    questionEn: "What is the hottest layer of the Sun's atmosphere?",
    questionVi: 'Lớp nào nóng nhất trong bầu khí quyển của Mặt Trời?',
    options: [
      { key: 'A', label: 'A) Photosphere', vi: 'Quang quyển' },
      { key: 'B', label: 'B) Chromosphere', vi: 'Sắc quyển' },
      { key: 'C', label: 'C) Corona', vi: 'Nhật hoa (Corona)' },
      { key: 'D', label: 'D) Core', vi: 'Lõi (không thuộc khí quyển)' }
    ],
    correctKey: 'C',
    explanation:
      'Vành Nhật hoa (Corona) là lớp ngoài cùng của khí quyển Mặt Trời, có nhiệt độ lên tới 1–3 triệu độ C (nóng hơn gấp hàng trăm lần bề mặt Quang quyển bên dưới) và phóng ra dòng hạt bức xạ tác động trực tiếp lên bề mặt Mặt Trăng không có khí quyển.'
  },
  {
    id: 'q7-great-red-spot',
    linkedShardId: 'pale-blue-dot', // Game 7: Voyager 1 Family Portrait & Outer Planets
    image: 'assets/quiz/q7_great_red_spot.jpg',
    questionEn: 'Which planet has the famous Great Red Spot?',
    questionVi: 'Hành tinh nào nổi tiếng với cơn bão Vết Đỏ Lớn (Great Red Spot)?',
    options: [
      { key: 'A', label: 'A) Jupiter', vi: 'Sao Mộc' },
      { key: 'B', label: 'B) Mars', vi: 'Sao Hỏa' },
      { key: 'C', label: 'C) Neptune', vi: 'Sao Hải Vương' },
      { key: 'D', label: 'D) Venus', vi: 'Sao Kim' }
    ],
    correctKey: 'A',
    explanation:
      'Sao Mộc (Jupiter) có Vết Đỏ Lớn — một siêu bão xoáy nghịch khổng lồ lớn hơn cả Trái Đất đã tồn tại hàng trăm năm, được các tàu thăm dò Voyager, Galileo, Cassini và Juno của NASA ghi hình chi tiết.'
  },
  {
    id: 'q8-cassini-saturn',
    linkedShardId: 'grand-finale', // Game 8: Cassini Grand Finale at Saturn & Enceladus
    image: 'https://images-assets.nasa.gov/image/PIA21889/PIA21889~medium.jpg',
    questionEn: 'Why did NASA intentionally plunge the Cassini spacecraft into Saturn in 2017?',
    questionVi: 'Vì sao năm 2017 NASA chủ động cho tàu Cassini lao vào bầu khí quyển Sao Thổ?',
    options: [
      { key: 'A', label: 'A) Protect icy moons (Enceladus)', vi: 'Bảo vệ mặt trăng băng (Enceladus)' },
      { key: 'B', label: 'B) Land on a solid surface', vi: 'Đổ bộ lên bề mặt rắn' },
      { key: 'C', label: 'C) Refuel with hydrogen', vi: 'Tiếp nhiên liệu khí hydro' },
      { key: 'D', label: 'D) Return samples to Earth', vi: 'Đưa mẫu vật về Trái Đất' }
    ],
    correctKey: 'A',
    explanation:
      'Khi sắp cạn nhiên liệu, NASA cho Cassini lao vào Sao Thổ ở tốc độ 113.000 km/h để tránh nguy cơ tàu va chạm và làm nhiễm bẩn đại dương ngầm có khả năng nuôi dưỡng sự sống trên mặt trăng Enceladus và Titan.'
  }
];
