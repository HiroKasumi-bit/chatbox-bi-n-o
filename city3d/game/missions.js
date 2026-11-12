// What the game says. Every fact comes from the Aurora Haven magazine (output/Aurora_Haven_Magazine.pdf);
// the page is noted next to each card. en / vi for the two languages.
// Positions are in metres on the city plan (src/layout.js): x east, z south. The game moves each
// object to the nearest open ground, so a spot inside a building is fine as a starting point.

export const SPAWN = { x: 0, z: 22, yaw: Math.PI }; // Liberty Mall, facing north to the monument

export const MISSIONS = [
  {
    id: 'downtown',
    title: { en: 'Welcome to Aurora Haven', vi: 'Chào mừng đến Aurora Haven' },
    area: { en: 'Liberty Mall · downtown', vi: 'Liberty Mall · trung tâm' },
    intro: {
      en: 'Welcome, traveller. I am AURA, the voice of Aurora Core. Find the three glowing data cards around Liberty Mall, then answer my question at the terminal by the Founding Mayor Monument.',
      vi: 'Chào mừng lữ khách. Tôi là AURA, giọng nói của Aurora Core. Hãy tìm 3 thẻ dữ liệu phát sáng quanh Liberty Mall, rồi trả lời câu hỏi của tôi ở trạm bên Tượng đài Thị trưởng Sáng lập.',
    },
    terminal: { x: 0, z: 8 },
    cards: [
      { x: -14, z: -18, title: { en: 'A city of 45,000', vi: 'Thành phố 45.000 người' },
        text: { en: 'Aurora Haven is a zero-carbon city for about 45,000 people on the Arctic tundra, at about 70° North. Winter falls to −45 °C, and the sun stays down for about two months.', vi: 'Aurora Haven là thành phố không phát thải carbon cho khoảng 45.000 người trên lãnh nguyên Bắc Cực, ở khoảng 70° Bắc. Mùa đông xuống tới −45 °C, và mặt trời không mọc trong khoảng hai tháng.' }, page: 4 },
      { x: 17, z: -22, title: { en: 'Nine blocks, one short walk', vi: '9 khu phố, chỉ vài bước chân' },
        text: { en: 'Downtown is nine blocks around the Founding Mayor Monument. Shops, schools, healthcare and homes are all a short walk away. Snowflake General Hospital is open around the clock.', vi: 'Trung tâm gồm 9 khu phố quanh Tượng đài Thị trưởng Sáng lập. Cửa hàng, trường học, bệnh viện và nhà ở đều chỉ cách vài bước chân. Bệnh viện Snowflake mở cửa suốt ngày đêm.' }, page: 8 },
      { x: 0, z: -26, title: { en: 'Metro and shelters', vi: 'Tàu điện ngầm và hầm trú ẩn' },
        text: { en: 'Two driverless metro lines meet under Liberty Mall, deep below the blizzards. Under the mall, four shelters hold 30 days of supplies for every resident.', vi: 'Hai tuyến tàu điện ngầm không người lái gặp nhau dưới Liberty Mall, sâu bên dưới bão tuyết. Dưới khu phố này có 4 hầm trú ẩn, dự trữ đủ 30 ngày cho mỗi người dân.' }, page: 28 },
    ],
    quiz: {
      q: { en: 'How long does the polar night last in Aurora Haven?', vi: 'Đêm vùng cực ở Aurora Haven kéo dài bao lâu?' },
      options: [{ en: 'About two weeks', vi: 'Khoảng hai tuần' }, { en: 'About two months', vi: 'Khoảng hai tháng' }, { en: 'Half a year', vi: 'Nửa năm' }],
      answer: 1,
      hint: { en: 'Look again at the card "A city of 45,000".', vi: 'Đọc lại thẻ "Thành phố 45.000 người".' },
    },
    done: { en: 'Correct. The metro is now open: stand in a glowing metro pavilion and press E to ride. Next, the city\'s own sun, to the south-east.', vi: 'Chính xác. Tàu điện ngầm đã mở: đứng trong nhà ga phát sáng và nhấn E để đi. Tiếp theo: mặt trời riêng của thành phố, ở phía đông nam.' },
  },
  {
    id: 'fusion',
    title: { en: 'The City\'s Own Sun', vi: 'Mặt trời riêng của thành phố' },
    area: { en: 'Fusion Power Station', vi: 'Nhà máy điện nhiệt hạch' },
    intro: {
      en: 'Breakthrough one: a fusion reactor inside the city that powers and heats every home. Collect the three cards at the Fusion Power Station.',
      vi: 'Đột phá thứ nhất: một lò phản ứng nhiệt hạch ngay trong thành phố, cấp điện và sưởi ấm mọi ngôi nhà. Hãy thu 3 thẻ ở Nhà máy điện nhiệt hạch.',
    },
    terminal: { x: 172, z: 235 },
    cards: [
      { x: 290, z: 172, title: { en: 'Fuel from snow', vi: 'Nhiên liệu từ tuyết' },
        text: { en: 'Deuterium comes from snowmelt; tritium is made from lithium in the reactor wall. Our estimate: about 0.2 kg of fuel runs the city for a full day.', vi: 'Deuterium lấy từ nước tuyết tan; tritium được tạo ra từ lithium trong thành lò. Ước tính của nhóm: khoảng 0,2 kg nhiên liệu đủ cho thành phố trong cả một ngày.' }, page: 13 },
      { x: 240, z: 222, title: { en: 'A star in a magnetic bottle', vi: 'Ngôi sao trong chai từ trường' },
        text: { en: 'The Fusion Core makes the city\'s electricity and heat. Nothing burns, so there is no CO₂. If anything goes wrong, the plasma cools in seconds and the reaction simply stops.', vi: 'Lõi nhiệt hạch tạo ra điện và nhiệt cho thành phố. Không có gì bị đốt cháy nên không có CO₂. Nếu có sự cố, plasma nguội đi trong vài giây và phản ứng tự dừng.' }, page: 14 },
      { x: 300, z: 225, title: { en: 'Where the world is today', vi: 'Thế giới hiện nay' },
        text: { en: 'No fusion plant sells power yet: ITER plans to burn fusion fuel in 2039. So Aurora Haven is built in stages, and wind, sun and geothermal run the city until fusion is proven.', vi: 'Chưa nhà máy nhiệt hạch nào bán điện: ITER dự kiến đốt nhiên liệu nhiệt hạch năm 2039. Vì vậy Aurora Haven xây theo từng giai đoạn; gió, mặt trời và địa nhiệt vận hành thành phố cho tới khi nhiệt hạch được chứng minh.' }, page: 13 },
    ],
    quiz: {
      q: { en: 'Where does the reactor\'s deuterium fuel come from?', vi: 'Nhiên liệu deuterium của lò lấy từ đâu?' },
      options: [{ en: 'Oil shipped in by air', vi: 'Dầu chở tới bằng máy bay' }, { en: 'Coal from a mine', vi: 'Than từ mỏ' }, { en: 'Snowmelt water', vi: 'Nước tuyết tan' }],
      answer: 2,
      hint: { en: 'The card "Fuel from snow" tells you.', vi: 'Thẻ "Nhiên liệu từ tuyết" có câu trả lời.' },
    },
    done: { en: 'Correct. The reactor\'s spare heat melts the snow we drink. Follow it next door, to the Snow-to-Food & Water Plant to the north.', vi: 'Chính xác. Nhiệt thừa của lò làm tan tuyết để uống. Hãy sang nhà máy bên cạnh: Nhà máy Thực phẩm & Nước từ tuyết, ở phía bắc.' },
  },
  {
    id: 'food',
    title: { en: 'Bread and Water from Snow and Air', vi: 'Bánh mì và nước từ tuyết và không khí' },
    area: { en: 'Snow-to-Food & Water Plant', vi: 'Nhà máy Thực phẩm & Nước từ tuyết' },
    intro: {
      en: 'Breakthrough two: a plant that makes water and food from snow and air. Follow the line of halls and collect the three cards.',
      vi: 'Đột phá thứ hai: nhà máy làm ra nước và thực phẩm từ tuyết và không khí. Đi dọc dãy nhà xưởng và thu 3 thẻ.',
    },
    terminal: { x: 152, z: 100 },
    cards: [
      { x: 305, z: 75, title: { en: 'Snow Harvest & Melt Hall', vi: 'Xưởng thu gom & làm tan tuyết' },
        text: { en: 'Spare heat from the Fusion Core melts snow into drinking water for every tap. Snow does not fall all year, so winter snow and ice are stored for summer, and most water is recycled.', vi: 'Nhiệt thừa từ lõi nhiệt hạch làm tan tuyết thành nước uống cho mọi vòi nước. Tuyết không rơi quanh năm nên tuyết và băng mùa đông được trữ cho mùa hè, và phần lớn nước được tái sử dụng.' }, page: 16 },
      { x: 240, z: 75, title: { en: 'Splitting water', vi: 'Tách nước' },
        text: { en: 'Electrolysis splits water with fusion power. The hydrogen goes to the microbes; the oxygen and deuterium-rich water go to the hospital and the Fusion Core.', vi: 'Điện phân tách nước bằng điện nhiệt hạch. Hydro được đưa cho vi sinh vật; oxy và nước giàu deuterium được đưa tới bệnh viện và lõi nhiệt hạch.' }, page: 16 },
      { x: 178, z: 75, title: { en: 'Bioreactor Silos', vi: 'Tháp lên men sinh học' },
        text: { en: 'Microbes in the bioreactor silos turn hydrogen and CO₂ into protein flour, for bread, noodles and drinks. In Finland, Solar Foods already makes Solein protein from air and electricity.', vi: 'Vi sinh vật trong các tháp lên men biến hydro và CO₂ thành bột protein để làm bánh mì, mì và đồ uống. Ở Phần Lan, Solar Foods đã làm ra protein Solein từ không khí và điện.' }, page: 16 },
    ],
    quiz: {
      q: { en: 'What do the microbes in the Bioreactor Silos turn into protein flour?', vi: 'Vi sinh vật trong tháp lên men biến thứ gì thành bột protein?' },
      options: [{ en: 'Hydrogen and CO₂', vi: 'Hydro và CO₂' }, { en: 'Sand and salt', vi: 'Cát và muối' }, { en: 'Plastic waste', vi: 'Rác nhựa' }],
      answer: 0,
      hint: { en: 'Read the card at the Bioreactor Silos again.', vi: 'Đọc lại thẻ ở Tháp lên men sinh học.' },
    },
    done: { en: 'Correct. Fresh salad grows here too. Head north to the Evergreen Greenhouse Dome.', vi: 'Chính xác. Rau tươi cũng được trồng ở đây. Đi lên phía bắc tới Nhà kính Evergreen.' },
  },
  {
    id: 'greenhouse',
    title: { en: 'Nothing Is Wasted', vi: 'Không gì bị lãng phí' },
    area: { en: 'Evergreen Greenhouse Dome', vi: 'Nhà kính Evergreen' },
    intro: {
      en: 'Salad under the northern lights, and water and waste that go round. Find the three cards around the greenhouse dome and the recycling center.',
      vi: 'Rau xanh dưới cực quang, và nước, rác được quay vòng. Tìm 3 thẻ quanh mái vòm nhà kính và trung tâm tái chế.',
    },
    terminal: { x: 150, z: -55 },
    cards: [
      { x: 160, z: -75, title: { en: 'Salad all year', vi: 'Rau xanh quanh năm' },
        text: { en: 'The clear roof catches the midnight sun in summer. In the polar night, LEDs take over and thermal curtains keep the heat in, warmed by the heating loop and Mount Aurora\'s spa water. It uses about 90% less water than field farming.', vi: 'Mái trong suốt đón mặt trời nửa đêm vào mùa hè. Trong đêm vùng cực, đèn LED thay thế và rèm giữ nhiệt giữ hơi ấm, được sưởi bằng vòng nhiệt và nước khoáng của núi Aurora. Cách trồng này dùng ít hơn khoảng 90% nước so với trồng ngoài đồng.' }, page: 29 },
      { x: 165, z: -35, title: { en: 'Circular Recycling Center', vi: 'Trung tâm tái chế tuần hoàn' },
        text: { en: 'The center sorts and repairs materials. Food scraps become biogas, and a plasma converter turns the rest into gas and building blocks. Almost nothing goes to landfill in the permafrost.', vi: 'Trung tâm phân loại và sửa chữa vật liệu. Rác thức ăn thành khí sinh học, còn lò chuyển hóa plasma biến phần còn lại thành khí và vật liệu xây dựng. Gần như không gì bị chôn lấp trong đất đóng băng.' }, page: 26 },
      { x: 190, z: -95, title: { en: 'Water used again', vi: 'Nước được dùng lại' },
        text: { en: 'Water from sinks and showers is cleaned in six steps and reused in toilets, laundries and greenhouses. 95% of the city\'s water is used again.', vi: 'Nước từ bồn rửa và vòi sen được làm sạch qua 6 bước rồi dùng lại cho nhà vệ sinh, giặt là và nhà kính. 95% nước của thành phố được dùng lại.' }, page: 26 },
    ],
    quiz: {
      q: { en: 'How much of the city\'s water is used again?', vi: 'Bao nhiêu phần trăm nước của thành phố được dùng lại?' },
      options: [{ en: '25%', vi: '25%' }, { en: '50%', vi: '50%' }, { en: '95%', vi: '95%' }],
      answer: 2,
      hint: { en: 'The card "Water used again" has the number.', vi: 'Thẻ "Nước được dùng lại" có con số này.' },
    },
    done: { en: 'Correct. Now go north, past the stadium and the airport, to the wind and solar farms. The metro\'s North station is close to them.', vi: 'Chính xác. Giờ đi lên phía bắc tới trang trại gió và điện mặt trời. Ga tàu North ở ngay gần đó.' },
  },
  {
    id: 'north',
    title: { en: 'Energy and Safety for the Polar Night', vi: 'Năng lượng và an toàn cho đêm vùng cực' },
    area: { en: 'Northern Renewable Park', vi: 'Công viên năng lượng tái tạo phía Bắc' },
    intro: {
      en: 'Wind and sun start the city\'s own sun, and the rescue station keeps everyone safe. Find the three cards in the north of the city.',
      vi: 'Gió và nắng khởi động "mặt trời riêng" của thành phố, còn trạm cứu hộ giữ an toàn cho mọi người. Tìm 3 thẻ ở phía bắc thành phố.',
    },
    terminal: { x: 0, z: -205 },
    cards: [
      { x: -20, z: -240, title: { en: 'Start-up', vi: 'Khởi động' },
        text: { en: 'The wind and solar farms charge a battery bank that starts the reactor. Once fusion runs, it powers and heats the whole city, day and night.', vi: 'Trang trại gió và điện mặt trời sạc một dãy pin để khởi động lò phản ứng. Khi nhiệt hạch đã chạy, nó cấp điện và nhiệt cho cả thành phố, ngày lẫn đêm.' }, page: 25 },
      { x: -120, z: -300, title: { en: 'Backup', vi: 'Dự phòng' },
        text: { en: 'If the reactor stops, wind, sun, geothermal and stored heat keep basic heating, the hospital and the shelters going.', vi: 'Nếu lò phản ứng dừng, gió, mặt trời, địa nhiệt và nhiệt dự trữ vẫn duy trì sưởi ấm cơ bản, bệnh viện và các hầm trú ẩn.' }, page: 25 },
      { x: 45, z: -165, title: { en: 'Polar Rescue and Resilience Station', vi: 'Trạm cứu hộ vùng cực' },
        text: { en: 'The fire brigade, ambulances, ice rescue and the 112 emergency centre, with a helicopter ready day and night. Aurora Core sends blizzard warnings to every phone 48 hours ahead.', vi: 'Đội cứu hỏa, xe cứu thương, cứu hộ trên băng và trung tâm khẩn cấp 112, với trực thăng sẵn sàng ngày đêm. Aurora Core gửi cảnh báo bão tuyết tới mọi điện thoại trước 48 giờ.' }, page: 30 },
    ],
    quiz: {
      q: { en: 'What starts the fusion reactor?', vi: 'Thứ gì khởi động lò phản ứng nhiệt hạch?' },
      options: [{ en: 'A battery bank charged by wind and sun', vi: 'Dãy pin được sạc bằng gió và nắng' }, { en: 'Diesel generators', vi: 'Máy phát điện chạy dầu' }, { en: 'Power bought from another country', vi: 'Điện mua từ nước khác' }],
      answer: 0,
      hint: { en: 'The card "Start-up" explains it.', vi: 'Thẻ "Khởi động" giải thích điều này.' },
    },
    done: { en: 'Correct. One breakthrough left: the mountain in the south. Take the metro to Mount Aurora, the fastest way across the city.', vi: 'Chính xác. Còn một đột phá: ngọn núi ở phía nam. Đi tàu điện ngầm tới ga Mount Aurora cho nhanh.' },
  },
  {
    id: 'mountain',
    title: { en: 'A Snow Mountain You Can Walk Inside', vi: 'Ngọn núi tuyết có thể đi vào bên trong' },
    area: { en: 'Mount Aurora', vi: 'Núi Aurora' },
    intro: {
      en: 'Breakthrough three: warm pools and saunas inside a snow peak. One card waits by the lagoon, one inside the mountain: walk in through the North Portal. The last one is on the summit. Climb!',
      vi: 'Đột phá thứ ba: hồ nước ấm và phòng xông hơi bên trong một đỉnh núi tuyết. Một thẻ ở bên hồ Lagoon, một thẻ ở bên trong núi: hãy đi vào qua cổng North Portal. Thẻ cuối cùng ở trên đỉnh núi. Leo lên nào!',
    },
    terminal: { x: 0, z: 186 },
    cards: [
      { x: 34, z: 196, title: { en: 'Aurora Lagoon', vi: 'Hồ Aurora Lagoon' },
        text: { en: 'An open-air mineral pool at the foot of Mount Aurora, heated by a hot spring. Iceland\'s Blue Lagoon already bathes visitors in water from a geothermal power plant.', vi: 'Hồ khoáng ngoài trời dưới chân núi Aurora, được làm ấm bằng suối nước nóng. Ở Iceland, Blue Lagoon đã cho du khách tắm bằng nước từ nhà máy điện địa nhiệt.' }, page: 19 },
      { x: -3.5, z: -9, inside: true, title: { en: 'Four floors of warmth', vi: 'Bốn tầng ấm áp' },
        text: { en: 'Four warm spa levels sit inside an insulated snow peak. An insulated rock shell keeps it at 28 °C inside while it is −45 °C outside. In a blizzard or a power cut, its heat comes from the ground: it is also a shelter.', vi: 'Bốn tầng spa ấm nằm trong một đỉnh núi tuyết được cách nhiệt. Lớp vỏ đá cách nhiệt giữ bên trong ở 28 °C trong khi bên ngoài là −45 °C. Khi bão tuyết hay mất điện, nhiệt lấy từ lòng đất: núi cũng là nơi trú ẩn.' }, page: 19 },
      { x: 0, z: 259, summit: true, title: { en: 'Summit Sanctuary', vi: 'Đỉnh núi' },
        text: { en: 'You made it to the top of Mount Aurora, 35 m above the city. The glass Aurora Eye crowns the spa inside. Long dark winters are linked to winter depression, so the city gives people a warm, bright place to meet.', vi: 'Bạn đã lên tới đỉnh núi Aurora, cao 35 m so với thành phố. Mái kính Aurora Eye nằm trên cùng khu spa bên trong. Mùa đông dài và tối dễ gây trầm cảm mùa đông, nên thành phố cho mọi người một nơi ấm áp và sáng để gặp nhau.' }, page: 17 },
    ],
    quiz: {
      q: { en: 'How warm is it inside Mount Aurora when it is −45 °C outside?', vi: 'Bên trong núi Aurora ấm bao nhiêu khi bên ngoài là −45 °C?' },
      options: [{ en: '−10 °C', vi: '−10 °C' }, { en: '28 °C', vi: '28 °C' }, { en: '60 °C', vi: '60 °C' }],
      answer: 1,
      hint: { en: 'The card "Four floors of warmth" has the number.', vi: 'Thẻ "Bốn tầng ấm áp" có con số này.' },
    },
    done: { en: 'Correct. You have seen all three breakthroughs. But wait…', vi: 'Chính xác. Bạn đã xem cả 3 đột phá. Nhưng khoan đã…' },
  },
];

export const FINALE = {
  title: { en: 'Blizzard Drill', vi: 'Diễn tập bão tuyết' },
  area: { en: 'Metro shelters · Liberty Mall', vi: 'Hầm trú ẩn · Liberty Mall' },
  intro: {
    en: 'Attention. This is a blizzard drill. Visibility is dropping fast. Reach the emergency shelter under Liberty Mall before the timer runs out. Follow the beacon!',
    vi: 'Chú ý. Đây là buổi diễn tập bão tuyết. Tầm nhìn đang giảm nhanh. Hãy tới hầm trú ẩn dưới Liberty Mall trước khi hết giờ. Đi theo cột sáng!',
  },
  target: { x: 0, z: -26 },
  seconds: 90,
  win: { en: 'You are safe in the shelter. In a real storm, every resident gets this warning 48 hours ahead. Welcome home, polar citizen.', vi: 'Bạn đã an toàn trong hầm trú ẩn. Khi có bão thật, mọi người dân đều nhận cảnh báo này trước 48 giờ. Chào mừng về nhà, công dân vùng cực.' },
  late: { en: 'The drill timer ran out, but you made it to the shelter. In a real storm you would have had a 48-hour warning.', vi: 'Hết giờ diễn tập, nhưng bạn vẫn tới được hầm trú ẩn. Khi có bão thật, bạn sẽ được báo trước 48 giờ.' },
};

// Metro pavilions: the Aurora Line runs north–south, the Glacier Line east–west, and they meet under Liberty Mall (magazine p. 28).
// The station spots are placed for the game; the magazine names only the lines and the Central Interchange.
export const STATIONS = [
  { id: 'central', x: 10, z: -34, name: { en: 'Central Interchange · Liberty Mall', vi: 'Ga trung tâm · Liberty Mall' } },
  { id: 'north', x: 20, z: -195, name: { en: 'North · Renewable Park', vi: 'Ga Bắc · Năng lượng tái tạo' } },
  { id: 'east', x: 150, z: 135, name: { en: 'East · Fusion & Food', vi: 'Ga Đông · Nhiệt hạch & Thực phẩm' } },
  { id: 'south', x: 20, z: 175, name: { en: 'South · Mount Aurora', vi: 'Ga Nam · Núi Aurora' } },
  { id: 'west', x: -140, z: 0, name: { en: 'West · Eco-Homes', vi: 'Ga Tây · Nhà sinh thái' } },
];

export const UI = {
  play: { en: 'Play', vi: 'Chơi' },
  loading: { en: 'Building the city', vi: 'Đang dựng thành phố' },
  mission: { en: 'MISSION', vi: 'NHIỆM VỤ' },
  cards: { en: 'Data cards', vi: 'Thẻ dữ liệu' },
  answer: { en: 'Answer AURA at the terminal', vi: 'Trả lời AURA ở trạm' },
  reach: { en: 'Reach the shelter', vi: 'Tới hầm trú ẩn' },
  readCard: { en: 'Read the data card', vi: 'Đọc thẻ dữ liệu' },
  talk: { en: 'Answer AURA', vi: 'Trả lời AURA' },
  ride: { en: 'Ride the metro', vi: 'Đi tàu điện ngầm' },
  metroLocked: { en: 'The metro opens after the first mission', vi: 'Tàu mở sau nhiệm vụ đầu tiên' },
  needCards: { en: 'Collect all the data cards first', vi: 'Hãy thu đủ thẻ dữ liệu trước' },
  close: { en: 'Continue', vi: 'Tiếp tục' },
  pageRef: { en: 'Magazine page', vi: 'Tạp chí trang' },
  correct: { en: 'Correct!', vi: 'Chính xác!' },
  wrong: { en: 'Not quite.', vi: 'Chưa đúng.' },
  places: { en: 'Places', vi: 'Địa điểm' },
  score: { en: 'Score', vi: 'Điểm' },
  time: { en: 'Time', vi: 'Thời gian' },
  discovered: { en: 'Discovered', vi: 'Đã khám phá' },
  metroTitle: { en: 'Metro · choose a station', vi: 'Tàu điện ngầm · chọn ga' },
  here: { en: 'you are here', vi: 'bạn đang ở đây' },
  cancel: { en: 'Cancel', vi: 'Hủy' },
  map: { en: 'City map', vi: 'Bản đồ thành phố' },
  endTitle: { en: 'Mission complete', vi: 'Hoàn thành' },
  again: { en: 'Explore freely', vi: 'Khám phá tự do' },
  restart: { en: 'Play again', vi: 'Chơi lại' },
  freeRoam: { en: 'Free exploring: find all 35 places', vi: 'Khám phá tự do: tìm đủ 35 địa điểm' },
  allCards: { en: 'All cards collected. Come to the terminal and answer my question.', vi: 'Đã đủ thẻ. Hãy tới trạm và trả lời câu hỏi của tôi.' },
  enterMountain: { en: 'Enter Mount Aurora', vi: 'Đi vào núi Aurora' },
  exitMountain: { en: 'Go back outside', vi: 'Ra ngoài' },
  inside: { en: 'Inside Mount Aurora · Mineral Lake Grotto', vi: 'Bên trong núi Aurora · Hang hồ khoáng' },
  welcomeInside: { en: 'Welcome to Level 1 of the spa: the Mineral Lake Grotto. The rock and snow hold the warmth in, like an igloo.', vi: 'Chào mừng tới tầng 1 của khu spa: Hang hồ khoáng. Đá và tuyết giữ hơi ấm bên trong, giống như một chiếc lều tuyết.' },
  ranks: [
    { min: 0, en: 'Polar Visitor', vi: 'Du khách vùng cực' },
    { min: 1300, en: 'Polar Explorer', vi: 'Nhà thám hiểm vùng cực' },
    { min: 1800, en: 'Polar Citizen', vi: 'Công dân vùng cực' },
    { min: 2300, en: 'Aurora Haven Guide', vi: 'Hướng dẫn viên Aurora Haven' },
  ],
};
