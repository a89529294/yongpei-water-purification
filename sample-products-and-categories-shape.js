const categories = [
  { id: 1, name: "立地式" },
  { id: 2, name: "桌上型" },
  { id: 3, name: "開水機" },
  { id: 4, name: "廚下型" },
  { id: 5, name: "廚四寶" },
  { id: 6, name: "濾心耗材" },
];

const products = [
  {
    id: 1,
    name: "智慧熱交換飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/202412494526_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 2,
    name: "智慧熱交換飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/202412495227_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 3,
    name: "數位熱交換飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/20241210142821_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 4,
    name: "商用冰冷熱飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/2024121014308_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 5,
    name: "智慧熱交換飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/20241210143154_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 6,
    name: "數位龍頭式飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/20241210144112_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 7,
    name: "智慧熱交換飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/7/2024-12/20241210144243_0.jpg",
    ],
    category: { id: 1, name: "立地式" },
  },
  {
    id: 8,
    name: "桌上型RO飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/8/2024-12/2024121015429_0.jpg",
    ],
    category: { id: 2, name: "桌上型" },
  },
  {
    id: 9,
    name: "桌上自補式飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/8/2024-12/20241210151228_0.jpg",
    ],
    category: { id: 2, name: "桌上型" },
  },
  {
    id: 10,
    name: "立地型飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/8/2024-12/20241210151451_0.jpg",
    ],
    category: { id: 2, name: "桌上型" },
  },
  {
    id: 11,
    name: "桌上型RO飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/8/2024-12/20241210151547_0.jpg",
    ],
    category: { id: 2, name: "桌上型" },
  },
  {
    id: 12,
    name: "立地式電開水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/9/2024-12/20241210151631_0.jpg",
    ],
    category: { id: 3, name: "開水機" },
  },
  {
    id: 13,
    name: "立地式電開水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/9/2024-12/2024121015170_0.jpg",
    ],
    category: { id: 3, name: "開水機" },
  },
  {
    id: 14,
    name: "立地式電開水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/9/2024-12/20241210151827_0.jpg",
    ],
    category: { id: 3, name: "開水機" },
  },
  {
    id: 15,
    name: "立地式電開水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/9/2024-12/20241210151855_0.jpg",
    ],
    category: { id: 3, name: "開水機" },
  },
  {
    id: 16,
    name: "立地式電開水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/9/2024-12/20241210151938_0.jpg",
    ],
    category: { id: 3, name: "開水機" },
  },
  {
    id: 17,
    name: "618型四道過濾純水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/20241210152036_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 18,
    name: "618型無壓式濾純水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/2024121293831_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 19,
    name: "620型吊片式純水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/2024121293857_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 20,
    name: "620型腳架式純水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/2024121293930_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 21,
    name: "HM-518廚下可調溫飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/202412129407_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 23,
    name: "HM-538廚下型冷熱飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/2024121294126_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 24,
    name: "HS-170廚下型冷熱飲水機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/10/2024-12/2024121294234_0.jpg",
    ],
    category: { id: 4, name: "廚下型" },
  },
  {
    id: 25,
    name: "廚下RO直輸淨水器",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/11/2024-12/20241212121323_0.jpg",
    ],
    category: { id: 5, name: "廚四寶" },
  },
  {
    id: 26,
    name: " 廚下直輸RO淨水器",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/11/2024-12/20241212121436_0.jpg",
    ],
    category: { id: 5, name: "廚四寶" },
  },
  {
    id: 27,
    name: "廚下型溫熱飲水機UV",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/11/2024-12/20241212121713_0.jpg",
    ],
    category: { id: 5, name: "廚四寶" },
  },
  {
    id: 28,
    name: "廚下型冰溫熱飲水機UV",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/11/2024-12/2024121212182_0.jpg",
    ],
    category: { id: 5, name: "廚四寶" },
  },
  {
    id: 29,
    name: "廚下型廚餘處理機",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/11/2024-12/20241212122014_0.jpg",
    ],
    category: { id: 5, name: "廚四寶" },
  },
  {
    id: 30,
    name: "臭氧水殺菌淨化系統",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/11/2024-12/20241212122446_0.jpg",
    ],
    category: { id: 5, name: "廚四寶" },
  },
  {
    id: 31,
    name: "後置活性碳濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212122520_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 32,
    name: "複合濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212122551_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 33,
    name: "逆滲透膜",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212123011_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 34,
    name: "後置活性碳濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212123146_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 35,
    name: "複合濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212135310_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 36,
    name: "離子交換樹脂濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212135350_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 37,
    name: "活性碳濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/20241212135443_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 38,
    name: "活性碳濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121213563_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 39,
    name: "微米PP纖維濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121214332_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 40,
    name: "微米PP纖維濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/202412121440_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 41,
    name: "椰殼顆粒活性碳濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121214429_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 42,
    name: "高效型纖維濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/202412121453_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 43,
    name: "高效複合型微粒碳濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121214555_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 44,
    name: "高阻型纖維濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121214625_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 45,
    name: "複合型中空絲膜濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/202412121472_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 46,
    name: "逆滲透膜",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121214728_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
  {
    id: 47,
    name: "奈米銀抗菌濾芯",
    images: [
      "https://wait.mi-great.com.tw/yp//mediafile/1040/products/12/2024-12/2024121214813_0.jpg",
    ],
    category: { id: 6, name: "濾心耗材" },
  },
];
