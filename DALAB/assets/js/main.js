// 初始化 Lucide 圖標
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // 導航欄滾動效果
  initNavScrollEffect();
  
  // 初始化商品頁的推薦商品與最近瀏覽
  initProductDetailsSections();
  
  // 初始化首頁的推薦商品與最近瀏覽
  initHomepageCarousels();
  
  // 初始化詳情頁主展示區的客製化 SVG
  initDetailMainPlaceholderSvg();
  
  // 初始化商品總覽頁卡的客製化 SVG
  initProductsPagePlaceholderSvgs();
});

// 導航欄滾動隱藏/顯示
function initNavScrollEffect() {
  let lastScrollY = 0;
  const nav = document.getElementById('main-nav');
  
  if (!nav) return;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 80) {
      nav.style.transform = 'translateY(-8px)';
      nav.style.opacity = '0.96';
    } else {
      nav.style.transform = 'translateY(0)';
      nav.style.opacity = '1';
    }
    lastScrollY = currentY;
  }, { passive: true });
}
// ========== 訂製流程頁面專用 JS ==========

// 初始化 Lucide 圖示
document.addEventListener('DOMContentLoaded', function() {
  // 載入 lucide 圖示
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 步驟卡片展開/收起功能
  window.toggleStep = function(el) {
    el.classList.toggle('active');
  };

});

// 手機選單切換功能（全站共用）
function toggleMobileMenu(btn) {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  const icon = btn.querySelector('i');
  const isOpen = !menu.classList.contains('hidden');

  if (isOpen) {
    // 關閉菜單
    menu.classList.add('hidden');
    menu.classList.remove('open');
    btn.classList.remove('open');
    if (icon) icon.setAttribute('data-lucide', 'menu');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    // 打開菜單
    menu.classList.remove('hidden');
    menu.classList.add('open');
    btn.classList.add('open');
    if (icon) icon.setAttribute('data-lucide', 'x');
    btn.setAttribute('aria-expanded', 'true');
  }

  // 重新渲染 Lucide 圖標
  if (window.lucide) {
    lucide.createIcons();
  }
}
// 分頁導航函數
function navigateTo(page) {
  // 隱藏所有分頁
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  // 根據頁面類型處理
  const targetSection = document.getElementById(`view-${page}`);
  if (targetSection) {
    targetSection.classList.add('active');
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // 如果是獨立頁面，跳轉到對應 HTML
    window.location.href = `${page}.html`;
  }
}

// ========== 商品詳情頁 推薦商品與最近瀏覽輪播功能 ==========

const productsData = [
  { link: "detail01.html", name: "【CT】客製棒球", price: "80", image: "assets/img/baseball.jpg", icon: "baseball" },
  { link: "detail02.html", name: "全昇華排汗球衣", price: "350", image: "assets/img/jersey.jpg", icon: "jersey" },
  { link: "detail03.html", name: "客製棒球帽", price: "180", image: "assets/img/hat.jpg", icon: "hat" },
  { link: "detail04.html", name: "運動應援毛巾", price: "120", image: "assets/img/towel.jpg", icon: "towel" },
  { link: "detail05.html", name: "客製棉質托特包", price: "150", image: "assets/img/tote.jpg", icon: "tote" },
  { link: "detail06.html", name: "圓領短袖團服", price: "220", image: null, icon: "user" },
  { link: "detail07.html", name: "客製籃球", price: "280", image: null, icon: "dribbble" },
  { link: "detail08.html", name: "機能長袖球衣", price: "420", image: null, icon: "activity" },
  { link: "detail09.html", name: "網帽 / 透氣涼感帽", price: "200", image: null, icon: "wind" },
  { link: "detail10.html", name: "迷你應援毛巾", price: "65", image: null, icon: "gift" },
  { link: "detail11.html", name: "帆布側背小包", price: "190", image: null, icon: "briefcase" },
  { link: "detail12.html", name: "重磅棉質長袖T", price: "280", image: null, icon: "heart" },
  { link: "detail13.html", name: "客製排球", price: "260", image: null, icon: "volleyball" },
  { link: "detail14.html", name: "防曬冰絲外套", price: "380", image: null, icon: "shield" },
  { link: "detail15.html", name: "工廠棒球帽", price: "150", image: null, icon: "truck" },
  { link: "detail16.html", name: "超細纖維浴巾", price: "180", image: null, icon: "droplets" },
  { link: "detail17.html", name: "大容量帆布後背包", price: "350", image: null, icon: "archive" },
  { link: "detail18.html", name: "機能短褲 / 訓練褲", price: "320", image: null, icon: "zap" },
  { link: "detail19.html", name: "客製紀念足球", price: "240", image: null, icon: "award" },
  { link: "detail20.html", name: "全套客製團隊組合包", price: "990", image: null, icon: "check-circle" }
];

function initProductDetailsSections() {
  const main = document.querySelector('main');
  if (!main) return;
  
  // 檢查目前是否確實在 detail 詳情頁
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  if (!currentFile.startsWith('detail')) return;
  
  const currentProduct = productsData.find(p => p.link === currentFile);
  if (!currentProduct) return;
  
  // 1. 處理「最近瀏覽過的商品」紀錄 (LocalStorage)
  let visited = [];
  try {
    visited = JSON.parse(localStorage.getItem('visited_products') || '[]');
  } catch (e) {
    visited = [];
  }
  
  // 過濾掉目前商品以避免重複顯示，並將目前商品放到最前面
  visited = visited.filter(p => p.link !== currentFile);
  visited.unshift(currentProduct);
  if (visited.length > 8) visited.pop();
  localStorage.setItem('visited_products', JSON.stringify(visited));
  
  // 取得不包含目前商品的其他瀏覽紀錄
  const recentlyViewed = visited.filter(p => p.link !== currentFile);
  
  // 2. 隨機推薦 6 款商品 (排除目前商品)
  const recommended = productsData
    .filter(p => p.link !== currentFile)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);
    
  // 3. 動態注入無捲軸樣式
  if (!document.getElementById('scrollbar-none-style')) {
    const style = document.createElement('style');
    style.id = 'scrollbar-none-style';
    style.textContent = `
      .scrollbar-none::-webkit-scrollbar {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 4. 建立輪播區塊容器並注入
  const container = document.createElement('div');
  container.className = 'border-t border-white/10 pt-16 mt-20';
  
  const recommendedHtml = renderCarouselHtml('推薦商品', recommended);
  const recentlyViewedHtml = renderCarouselHtml('您最近瀏覽過的商品', recentlyViewed);
  
  container.innerHTML = recommendedHtml + recentlyViewedHtml;
  main.appendChild(container);
  
  // 5. 重新初始化 Lucide 圖示，確保 Chevrons 渲染
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderCarouselHtml(title, products) {
  if (products.length === 0) return '';
  
  const carouselId = 'carousel-' + Math.random().toString(36).substring(2, 11);
  
  const cardsHtml = products.map(p => {
    const mediaHtml = p.image 
      ? `<img src="${p.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${p.name}">`
      : getProductSvg(p.icon, 'w-24 h-24');
      
    return `
      <div class="product-card bg-dvGray border border-white/20 rounded overflow-hidden shrink-0 w-64 flex flex-col transition-all duration-300 hover:scale-103 hover:border-dvNeon/50 hover:shadow-lg hover:shadow-dvNeon/5">
        <div class="h-40 bg-dvBlack/50 flex items-center justify-center relative overflow-hidden group">
          ${mediaHtml}
        </div>
        <div class="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-base text-white truncate" title="${p.name}">${p.name}</h4>
            <p class="text-dvNeon font-bold mt-1 text-sm">NT$${p.price}</p>
          </div>
          <a href="${p.link}" class="mt-3 block bg-dvNeon text-black text-center py-2 font-bold text-xs hover:bg-white transition">查看詳情</a>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="mb-16 relative">
      <h3 class="text-2xl font-display font-black italic mb-6 text-white uppercase tracking-wider">${title}</h3>
      <div class="relative group/carousel">
        <!-- 左右滑動按鈕 -->
        <button onclick="document.getElementById('${carouselId}').scrollBy({left: -280, behavior: 'smooth'})" class="absolute left-[-20px] top-[calc(50%-20px)] z-10 bg-dvBlack/90 hover:bg-dvNeon hover:text-black border border-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center transition opacity-0 group-hover/carousel:opacity-100 shadow-lg shadow-black/50 focus:outline-none">
          <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </button>
        <button onclick="document.getElementById('${carouselId}').scrollBy({left: 280, behavior: 'smooth'})" class="absolute right-[-20px] top-[calc(50%-20px)] z-10 bg-dvBlack/90 hover:bg-dvNeon hover:text-black border border-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center transition opacity-0 group-hover/carousel:opacity-100 shadow-lg shadow-black/50 focus:outline-none">
          <i data-lucide="chevron-right" class="w-5 h-5"></i>
        </button>
        
        <!-- 輪播容器 -->
        <div id="${carouselId}" class="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-none" style="-ms-overflow-style: none; scrollbar-width: none;">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;
}

function initHomepageCarousels() {
  const container = document.getElementById('homepage-carousels');
  if (!container) return;
  
  // 1. 取得最近瀏覽過的商品紀錄
  let visited = [];
  try {
    visited = JSON.parse(localStorage.getItem('visited_products') || '[]');
  } catch (e) {
    visited = [];
  }
  
  // 2. 隨機推薦 6 款商品
  const recommended = productsData
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);
    
  // 3. 建立輪播 HTML
  const recommendedHtml = renderCarouselHtml('推薦商品', recommended);
  const recentlyViewedHtml = renderCarouselHtml('最近瀏覽過的商品', visited);
  
  container.innerHTML = recommendedHtml + recentlyViewedHtml;
  
  // 4. 重新初始化 Lucide 圖示，確保 Chevrons 渲染
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Helper to generate tech HUD overlay group
function getCyberHudGroup(productCode, productName, options = {}) {
  const scaleText = options.scale || 'SCALE 1:1';
  const targetCx = options.targetCx || 50;
  const targetCy = options.targetCy || 50;
  const targetR = options.targetR || 10;
  
  return `
    <g class="hud-overlay-group">
      <!-- Corner brackets -->
      <path d="M 8 14 V 8 H 14 M 92 14 V 8 H 86 M 8 86 V 92 H 14 M 92 86 V 92 H 86" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.3"/>
      
      <!-- Centered Target Lock concentric circles with inline transform-origin -->
      <circle class="hud-spin-cw" cx="${targetCx}" cy="${targetCy}" r="${targetR}" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.8" stroke-dasharray="2 3" style="transform-origin: ${targetCx}px ${targetCy}px;"/>
      <circle class="hud-spin-ccw" cx="${targetCx}" cy="${targetCy}" r="${targetR + 3}" stroke="#00f0ff" stroke-opacity="0.2" stroke-width="0.6" stroke-dasharray="1 2" style="transform-origin: ${targetCx}px ${targetCy}px;"/>
      
      <!-- Blinkers -->
      <circle cx="10" cy="10" r="1" fill="#ff0055" class="hud-blink"/>
      <circle cx="90" cy="90" r="1" fill="#00f0ff" class="hud-blink" style="animation-delay: 0.8s;"/>
      
      <!-- Technical Monospace Labels (Simplified) -->
      <text x="12" y="13" font-family="monospace" font-size="3" fill="currentColor">SYS // ${productCode}</text>
      <text x="74" y="90" font-family="monospace" font-size="2.6" fill="#00f0ff">${scaleText}</text>
    </g>
  `;
}


// Master SVG builder to normalize layers to exactly 8 children + interactive 9th child
function buildStructuredSvg(icon, sizeClass, baseElements, hudOpts) {
  // Pad shapes to exactly 5 elements
  const shapes = [...baseElements];
  while (shapes.length < 5) {
    shapes.push('<path d="M0 0" stroke="none" fill="none"/>');
  }
  
  // Dummy empty groups to satisfy the 8+1 child layout requirement for line drawing animation
  const emptyGroup = '<g></g>';
  
  return `<svg class="${sizeClass} transition-all duration-500 group-hover:scale-110 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
    <g stroke="#ffffff" stroke-width="2" class="hud-main-shape-group">
      ${shapes[0]}
      ${shapes[1]}
      ${shapes[2]}
      ${shapes[3]}
      ${shapes[4]}
    </g>
    <!-- Interactive HUD Crosshair Tracking lines and labels -->
    <g id="hud-crosshair" stroke="#00f0ff" stroke-width="0.6" stroke-opacity="0" style="transition: stroke-opacity 0.2s;">
      <line id="hud-x-line" x1="0" y1="0" x2="100" y2="0"/>
      <line id="hud-y-line" x1="0" y1="0" x2="0" y2="100"/>
      <text id="hud-coord-text" x="0" y="0" fill="#00f0ff" font-family="monospace" font-size="3.2" text-anchor="start"></text>
    </g>
    ${emptyGroup}
    ${emptyGroup}
    ${emptyGroup}
    ${emptyGroup}
  </svg>`;
}

// ========== 客製化 SVG 設計圖示生成庫 (高細節工程製圖/藍圖風格) ==========
function getProductSvg(icon, sizeClass = "w-10 h-10") {
  const hudOptionsMap = {
    'baseball': { code: 'BASEBALL_B01', name: '客製棒球', width: '7.2cm', height: '7.2cm', scale: 'SCALE 1:1', angle: '3D_ROT_35', targetCx: 25, targetCy: 25, targetR: 12, logoScale: 0.4 },
    'jersey': { code: 'JERSEY_J02', name: '全昇華排汗球衣', width: '56cm', height: '72cm', scale: 'SCALE 1:10', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 42, targetR: 8, logoScale: 0.35 },
    'hat': { code: 'BASEBALL_CAP_H03', name: '客製棒球帽', width: '28cm', height: '12.5cm', scale: 'SCALE 1:1.5', angle: '45_DEG_L', targetCx: 43, targetCy: 46, targetR: 10, logoScale: 0.55 },
    'towel': { code: 'TOWEL_T04', name: '運動應援毛巾', width: '100cm', height: '35cm', scale: 'SCALE 1:5', angle: 'FLAT_VIEW', targetCx: 50, targetCy: 50, targetR: 10, logoScale: 0.5 },
    'tote': { code: 'TOTE_BAG_T05', name: '客製棉質托特包', width: '36cm', height: '40cm', scale: 'SCALE 1:4', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 56, targetR: 9, logoScale: 0.45 },
    'user': { code: 'TEE_SHIRT_U06', name: '圓領短袖團服', width: '52cm', height: '68cm', scale: 'SCALE 1:10', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 40, targetR: 8, logoScale: 0.35 },
    'dribbble': { code: 'BASKETBALL_D07', name: '客製籃球', width: '24cm', height: '24cm', scale: 'SCALE 1:1', angle: '3D_ROT_15', targetCx: 50, targetCy: 50, targetR: 12, logoScale: 0.4 },
    'activity': { code: 'LONG_JERSEY_A08', name: '機能長袖球衣', width: '54cm', height: '70cm', scale: 'SCALE 1:10', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 40, targetR: 8, logoScale: 0.35 },
    'wind': { code: 'MESH_COOLING_W09', name: '網帽 / 透氣涼感帽', width: '28cm', height: '12.5cm', scale: 'SCALE 1:1.5', angle: '45_DEG_L', targetCx: 43, targetCy: 46, targetR: 10, logoScale: 0.55 },
    'gift': { code: 'MINI_TOWEL_G10', name: '迷你應援毛巾', width: '30cm', height: '30cm', scale: 'SCALE 1:3', angle: 'FLAT_VIEW', targetCx: 50, targetCy: 50, targetR: 10, logoScale: 0.45 },
    'briefcase': { code: 'SMALL_BAG_B11', name: '帆布側背小包', width: '22cm', height: '18cm', scale: 'SCALE 1:2', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 58, targetR: 8, logoScale: 0.4 },
    'heart': { code: 'HEAVY_TEE_H12', name: '重磅棉質長袖T', width: '50cm', height: '66cm', scale: 'SCALE 1:10', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 40, targetR: 8, logoScale: 0.35 },
    'volleyball': { code: 'VOLLEYBALL_V13', name: '客製排球', width: '21cm', height: '21cm', scale: 'SCALE 1:1', angle: '3D_ROT_45', targetCx: 50, targetCy: 50, targetR: 12, logoScale: 0.4 },
    'shield': { code: 'SUN_JACKET_S14', name: '防曬冰絲外套', width: '56cm', height: '74cm', scale: 'SCALE 1:10', angle: 'FRONT_VIEW', targetCx: 43, targetCy: 40, targetR: 6, logoScale: 0.28 },
    'truck': { code: 'TRUCKER_CAP_T15', name: '工廠棒球帽', width: '28cm', height: '12.5cm', scale: 'SCALE 1:1.5', angle: '45_DEG_L', targetCx: 41, targetCy: 47, targetR: 10, logoScale: 0.5 },
    'droplets': { code: 'BATH_TOWEL_D16', name: '超細纖維浴巾', width: '140cm', height: '70cm', scale: 'SCALE 1:8', angle: 'FLAT_VIEW', targetCx: 50, targetCy: 48, targetR: 10, logoScale: 0.5 },
    'archive': { code: 'BACKPACK_A17', name: '大容量帆布後背包', width: '32cm', height: '46cm', scale: 'SCALE 1:5', angle: 'FRONT_VIEW', targetCx: 50, targetCy: 61, targetR: 8, logoScale: 0.4 },
    'zap': { code: 'SHORTS_Z18', name: '機能短褲 / 訓練褲', width: '48cm', height: '42cm', scale: 'SCALE 1:5', angle: 'FRONT_VIEW', targetCx: 35, targetCy: 54, targetR: 6, logoScale: 0.3 },
    'award': { code: 'SOCCER_BALL_A19', name: '客製紀念足球', width: '22cm', height: '22cm', scale: 'SCALE 1:1', angle: '3D_ROT_0', targetCx: 50, targetCy: 50, targetR: 12, logoScale: 0.4 },
    'check-circle': { code: 'BUNDLE_PACK_C20', name: '全套客製團隊組合包', width: '60cm', height: '60cm', scale: 'SCALE 1:6', angle: 'BUNDLE_VIEW', targetCx: 54, targetCy: 64, targetR: 8, logoScale: 0.35 }
  };

  const hudOpts = hudOptionsMap[icon] || { code: 'DALAB_ITEM', name: '客製化周邊', width: '50cm', height: '50cm', scale: 'SCALE 1:1', angle: '0_DEG_FRONT', targetCx: 50, targetCy: 50, targetR: 10, logoScale: 0.4 };

  const rawShapes = {
    'baseball': [
      `<g transform="scale(2)" stroke="#ffffff" stroke-width="0.8">
        <path d="M89.862,125.614c-.022.209-.068.411-.094.619-.085.65-.174,1.3-.308,1.933-.04.189-.1.371-.144.558-.153.647-.313,1.291-.516,1.917-.044.138-.1.27-.149.407-.229.67-.474,1.332-.757,1.975-.037.083-.081.162-.118.245-.313.69-.649,1.368-1.022,2.023-.02.036-.044.07-.064.105-.4.7-.83,1.374-1.293,2.025l-.008.011a25.313,25.313,0,0,1-3.266,3.748c-.463.436-.933.865-1.428,1.265a25.189,25.189,0,0,1-2.835,1.963c-.227.137-.448.283-.679.413-.361.2-.737.383-1.109.568-.31.154-.619.31-.937.451-.351.156-.71.3-1.069.438s-.727.277-1.1.4q-.511.173-1.032.324c-.416.12-.837.226-1.262.324-.322.075-.642.152-.968.214-.5.094-1,.165-1.5.229-.271.035-.539.081-.813.107-.788.075-1.584.121-2.391.121s-1.627-.046-2.426-.122c-.3-.029-.583-.082-.876-.12-.492-.065-.985-.131-1.468-.224-.363-.071-.718-.162-1.076-.249-.393-.094-.786-.189-1.172-.3s-.79-.25-1.18-.387c-.322-.112-.644-.227-.96-.351q-.635-.251-1.251-.536-.388-.178-.768-.37c-.443-.223-.88-.454-1.307-.7-.195-.113-.385-.232-.577-.35-.462-.285-.919-.576-1.361-.889-.122-.086-.238-.179-.358-.268-.49-.361-.974-.73-1.436-1.124-.49-.419-.974-.845-1.43-1.3a25.053,25.053,0,0,1-5.337-7.866c-.013-.031-.031-.06-.044-.091-.284-.668-.528-1.357-.754-2.053-.027-.084-.065-.164-.091-.249-.2-.648-.362-1.313-.511-1.982-.032-.141-.078-.276-.108-.419-.132-.643-.219-1.3-.3-1.963-.022-.176-.062-.347-.08-.524a25.34,25.34,0,0,1,0-5.119c.018-.177.058-.348.08-.524.081-.66.168-1.319.3-1.963.029-.142.076-.277.108-.419.149-.669.309-1.335.511-1.982.026-.085.064-.165.091-.249.226-.7.47-1.385.754-2.053.013-.031.031-.06.044-.091a25.05,25.05,0,0,1,5.337-7.866c.456-.455.94-.881,1.43-1.3.462-.395.946-.763,1.436-1.124.12-.088.236-.181.358-.268.441-.313.9-.6,1.361-.889.192-.118.382-.237.577-.35.427-.248.865-.479,1.307-.7q.381-.191.768-.37.617-.284,1.251-.536c.316-.125.638-.239.96-.351.39-.136.781-.27,1.18-.386s.779-.207,1.172-.3c.357-.086.713-.178,1.076-.248.483-.093.975-.159,1.468-.224.292-.039.58-.092.876-.12C63.373,98.046,64.181,98,65,98s1.634.045,2.436.123c.312.03.616.087.925.129.477.064.954.126,1.422.217.393.077.776.177,1.162.272.363.089.728.174,1.084.279.439.13.87.279,1.3.431.28.1.56.2.835.306.473.188.938.392,1.4.607.207.1.413.195.616.3.5.251.99.517,1.47.8.139.082.276.167.413.251.52.321,1.03.654,1.524,1.011.073.053.143.108.216.161.538.4,1.064.81,1.568,1.248s.974.86,1.43,1.322a25.124,25.124,0,0,1,4.235,5.731l.012.024q.559,1.042,1.022,2.14c.034.08.057.165.09.246.27.663.522,1.337.736,2.027.061.2.1.405.156.605.165.584.329,1.168.451,1.768.077.379.117.771.176,1.156.068.435.153.865.2,1.307a25.044,25.044,0,0,1-.009,5.155Zm-40.02-18.533a21.939,21.939,0,0,0,0,31.838c.268-.245.527-.508.779-.781l-1.439-.958c-.244-.162-.237-.508.015-.773a.748.748,0,0,1,.9-.185l1.375.915a18.841,18.841,0,0,0,1.406-2.108l-1.56-.283a.5.5,0,0,1-.315-.712.725.725,0,0,1,.742-.52l1.78.323a21.977,21.977,0,0,0,1.053-2.5l-1.266.091c-.3.021-.518-.252-.5-.609a.706.706,0,0,1,.576-.686l1.6-.115a24.978,24.978,0,0,0,.6-2.628l-1.25.09c-.3.021-.518-.251-.5-.609a.706.706,0,0,1,.576-.686l1.377-.1c.091-.787.15-1.589.171-2.4l-1.448.486a.525.525,0,0,1-.644-.465.688.688,0,0,1,.372-.806l1.72-.577c-.021-.814-.093-1.607-.189-2.388l-1.379.311c-.285.064-.525-.225-.536-.647a.855.855,0,0,1,.5-.879l1.193-.269c-.14-.767-.3-1.522-.5-2.253l-1.458.5a.521.521,0,0,1-.65-.46.706.706,0,0,1,.389-.814l1.363-.465a22.133,22.133,0,0,0-.969-2.451l-.7.678a.71.71,0,0,1-.958-.087.637.637,0,0,1-.1-.914l1.061-1.025c-.261-.459-.535-.9-.825-1.324l-1.02,1.021a.676.676,0,0,1-.935-.088.659.659,0,0,1-.1-.924l1.173-1.174A15.22,15.22,0,0,0,49.842,107.081ZM65,101a21.894,21.894,0,0,0-13.764,4.852,17.629,17.629,0,0,1,1.44,1.513l1.93-.375a.71.71,0,0,1,.743.516.519.519,0,0,1-.329.724l-1.47.286a21.179,21.179,0,0,1,1.442,2.321l1.772-.344a.71.71,0,0,1,.743.516.519.519,0,0,1-.329.725l-1.578.306a24.4,24.4,0,0,1,1.108,2.884l1.653-.239a.919.919,0,0,1,.88.631c.152.4,0,.758-.329.806l-1.783.258c.195.759.352,1.54.483,2.333l1.661.1a.691.691,0,0,1,.579.683.531.531,0,0,1-.513.618l-1.543-.092c.088.759.153,1.528.172,2.315l1.67.56a.688.688,0,0,1,.372.806.525.525,0,0,1-.644.465l-1.4-.47c-.023.895-.093,1.773-.2,2.636a.39.39,0,0,1,.079.027l1.778,1.162a.677.677,0,0,1,.141.871.536.536,0,0,1-.747.29l-1.476-.964a26.292,26.292,0,0,1-.623,2.657l1.675,1.095a.677.677,0,0,1,.141.871.536.536,0,0,1-.747.29l-1.466-.958a23.7,23.7,0,0,1-1.21,2.856l1.371,1a.876.876,0,0,1,.153,1.045c-.18.385-.541.54-.806.348l-1.445-1.051a21.34,21.34,0,0,1-1.409,2.106l1.211.792a.677.677,0,0,1,.141.871.536.536,0,0,1-.747.29l-1.434-.938a16,16,0,0,1-1.114,1.161,21.919,21.919,0,0,0,27.088.329,18.2,18.2,0,0,1-1.507-1.741l-1.407.274a.709.709,0,0,1-.741-.516A.52.52,0,0,1,75,137.77l1-.195a22,22,0,0,1-1.329-2.342l-1.411.275a.709.709,0,0,1-.741-.516.52.52,0,0,1,.328-.724l1.263-.246a25.356,25.356,0,0,1-1.016-2.913l-1.428.207a.917.917,0,0,1-.877-.631c-.152-.4,0-.758.328-.806l1.6-.232c-.176-.771-.315-1.563-.429-2.367l-1.529-.091a.691.691,0,0,1-.577-.683.531.531,0,0,1,.512-.618l1.442.086c-.071-.764-.121-1.536-.125-2.326l-1.615-.543a.689.689,0,0,1-.371-.806.524.524,0,0,1,.642-.465l1.393.469c.037-.891.119-1.765.235-2.623a.4.4,0,0,1-.115-.039L70.4,118.477a.679.679,0,0,1-.141-.871.534.534,0,0,1,.745-.29l1.522,1a26.912,26.912,0,0,1,.645-2.641l-1.745-1.144a.679.679,0,0,1-.141-.871.534.534,0,0,1,.745-.29l1.547,1.014a23.942,23.942,0,0,1,1.222-2.838l-1.467-1.07a.878.878,0,0,1-.152-1.045c.18-.384.54-.54.8-.348l1.55,1.131a21.155,21.155,0,0,1,1.424-2.1l-1.335-.875a.679.679,0,0,1-.141-.871.534.534,0,0,1,.745-.29L77.8,107.1a15.547,15.547,0,0,1,1.114-1.141A21.9,21.9,0,0,0,65,101Zm15.268,6.181c-.266.236-.523.49-.774.755l1.325.884c.243.162.237.508-.015.773a.745.745,0,0,1-.9.185l-1.275-.851a18.449,18.449,0,0,0-1.4,2.061l1.461.266a.5.5,0,0,1,.314.712.723.723,0,0,1-.74.52l-1.695-.309a22.076,22.076,0,0,0-1.071,2.482l1.2-.087c.3-.021.517.251.495.609a.705.705,0,0,1-.575.686l-1.549.111a25.608,25.608,0,0,0-.635,2.63l1.238-.089c.3-.021.517.251.495.609a.705.705,0,0,1-.575.686l-1.382.1c-.1.791-.175,1.6-.21,2.42l1.492-.5a.524.524,0,0,1,.642.465.689.689,0,0,1-.371.806l-1.807.608c.006.813.062,1.606.141,2.388l1.513-.342c.284-.064.523.225.534.647a.856.856,0,0,1-.494.879l-1.362.308c.123.779.269,1.546.452,2.289l1.675-.573a.519.519,0,0,1,.648.46.706.706,0,0,1-.388.814l-1.608.549a23.064,23.064,0,0,0,.95,2.622l.964-.934a.707.707,0,0,1,.955.087.638.638,0,0,1,.1.914l-1.352,1.311c.251.472.515.928.794,1.363l1.34-1.345a.673.673,0,0,1,.932.088.66.66,0,0,1,.1.924l-1.526,1.532a15.546,15.546,0,0,0,1.4,1.612,21.937,21.937,0,0,0,.535-32.124Z" transform="translate(-40 -98)"/>
      </g>`
    ],
    'jersey': [
      `<!-- Main vest body contour -->
       <path d="M 31 10 L 38 10 Q 38 23, 50 23 Q 62 23, 62 10 L 69 10 Q 71 27, 81 30 L 81 90 L 19 90 L 19 30 Q 29 27, 31 10 Z" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`,
      `<!-- V-Neck neckline border trim -->
       <path d="M 38 10 C 38 21, 62 21, 62 10 M 41 10 H 59" stroke-width="2" stroke-linecap="round"/>`,
      `<!-- Side panels cutting lines -->
       <path d="M 26 30 L 26 90 M 74 30 L 74 90" stroke-width="2" stroke-linecap="round"/>`,
      `<!-- Center circular cross target badge -->
       <circle cx="50" cy="42" r="13" stroke-width="2.5" fill="none"/>
       <circle cx="50" cy="42" r="10" stroke-width="1.8" fill="none"/>
       <path d="M 46 38 L 54 46 M 54 38 L 46 46" stroke-width="2" stroke-linecap="round"/>`,
      `<!-- Lower tag decoration -->
       <rect x="33" y="78" width="12" height="8" stroke-width="1.8" fill="none"/>
       <rect x="35" y="81" width="8" height="2" stroke-width="1.2" fill="none"/>`
    ],
    'hat': [
      `<path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<circle cx="48" cy="22" r="2.8" stroke-width="1.5" fill="#ffffff"/>`,
      `<path d="M 48 22 C 46 35, 44 48, 42 60 M 48 22 C 38 31, 31 44, 29 59 M 48 22 C 54 31, 58 44, 61 59 M 48 22 C 63 31, 68 44, 73 58" stroke-width="1.5"/>`
    ],
    'towel': [
      `<rect x="18" y="32" width="64" height="36" rx="2" stroke-width="2.5"/>`,
      `<rect x="22" y="36" width="56" height="28" stroke-dasharray="2 2" stroke-width="1.2"/>`
    ],
    'tote': [
      `<path d="M28 42h44l-4 34H32L28 42z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M38 42c0-14 6-18 12-18s12 4 12 18" stroke-width="2"/>`
    ],
    'user': [
      `<g transform="scale(0.21)" stroke="#ffffff" stroke-width="6" fill="none"><path d="M449.962,173.343L373.338,56.434c-0.521-0.796-1.26-1.427-2.128-1.817c0,0-108.317-49.534-113.373-47.804l-0.604,0.205 c-20.534,6.962-43.152,6.962-63.698-0.004l-0.593-0.201c-5.054-1.73-113.374,47.804-113.374,47.804 c-0.868,0.391-1.606,1.021-2.128,1.817L0.818,173.343c-1.286,1.962-1.035,4.553,0.602,6.231c1.3,1.334,32.496,32.807,89.373,45.624 c2.037,0.453,4.146-0.397,5.287-2.146l14.618-22.415l1.472,226.004c0.015,2.312,1.612,4.312,3.863,4.837 c35.771,8.355,72.564,12.533,109.357,12.533c36.793,0,73.586-4.178,109.357-12.533c2.25-0.525,3.848-2.525,3.863-4.837 l1.472-226.004l14.618,22.415c1.141,1.748,3.251,2.605,5.287,2.146c56.877-12.817,88.073-44.29,89.373-45.624 C450.997,177.896,451.247,175.305,449.962,173.343z M372.299,73.091l57.714,88.058c-14.914,10.884-41.974,28.08-77.646,40.02 l-11.193-17.162C358.297,156.778,368.417,99.246,372.299,73.091z M174.936,24.448c4.307,13.438,16.556,29.459,50.454,29.459 c33.897,0,46.147-16.021,50.454-29.459c0.174-0.542,0.307-1.09,0.414-1.639l5.578,2.513c-0.086,0.318-0.176,0.636-0.278,0.951 c-9.386,29.258-39.216,33.627-56.163,33.627c-16.951,0-46.788-4.368-56.174-33.63c-0.101-0.314-0.191-0.63-0.277-0.947l5.578-2.513 C174.629,23.357,174.762,23.905,174.936,24.448z M185.488,17.226c0.419-0.411,1.404-1.193,2.826-1.193 c0.426,0,0.891,0.07,1.392,0.241l0.63,0.215c22.605,7.663,47.503,7.663,70.098,0.004l0.642-0.219 c2.171-0.741,3.672,0.417,4.217,0.952c0.541,0.53,1.725,1.999,1.029,4.169c-4.787,14.938-18.559,22.512-40.931,22.512 c-22.373,0-36.145-7.574-40.932-22.512C183.763,19.225,184.947,17.756,185.488,17.226z M109.606,184.006l-11.193,17.162 c-35.672-11.94-62.732-29.136-77.646-40.02l57.714-88.058C82.363,99.246,92.483,156.778,109.606,184.006z M89.62,214.652 c-42.411-10.338-69.562-31.8-78.124-39.356l3.781-5.77c17.296,12.609,43.516,28.592,77.499,40.286L89.62,214.652z M328.636,422.619 c-67.635,15.191-138.855,15.191-206.492,0l-1.554-238.667c-0.002-0.315-0.086-0.698-0.201-1.08 c-0.285-0.938-0.748-1.804-1.299-2.616c-19.039-28.074-29.739-100.95-32.032-118.045l72.689-32.746 c4.906,15.168,19.949,40.434,65.649,40.434c45.692,0,60.733-25.268,65.638-40.434l72.689,32.746 c-2.294,17.095-12.994,89.971-32.032,118.045c-0.55,0.811-1.014,1.677-1.299,2.616c-0.116,0.382-0.199,0.765-0.201,1.08 L328.636,422.619z M361.16,214.652l-3.157-4.84c33.984-11.693,60.204-27.676,77.5-40.286l3.781,5.769 C430.717,182.855,403.568,204.315,361.16,214.652z"/></g>`
    ],
    'dribbble': [
      `<circle cx="50" cy="50" r="32" stroke-width="3"/>`,
      `<path d="M50 18v64M18 50h64" stroke-width="2"/>`,
      `<path d="M27.5 27.5c12 12 12 33 0 45M72.5 27.5c-12 12-12 33 0 45" stroke-width="2"/>`
    ],
    'activity': [
      `<path d="M32 25h11c.5 0 1 .3 1.2.8l5.8 9 5.8-9c.2-.5.7-.8 1.2-.8h11l15 6-12 24-4-2v21H34V51l-4 2-12-24 15-6z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M42 25c0 4 16 4 16 0" stroke-width="2"/>`,
      `<path d="M34 51c4 2 6-1 7-4M66 51c-4 2-6-1-7-4" stroke-width="1.5"/>`
    ],
    'wind': [
      `<path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<circle cx="48" cy="22" r="2.8" stroke-width="1.5" fill="#ffffff"/>`,
      `<path d="M 48 22 C 46 35, 44 48, 42 60 M 48 22 C 38 31, 31 44, 29 59 M 48 22 C 54 31, 58 44, 61 59 M 48 22 C 63 31, 68 44, 73 58" stroke-width="1.5"/>`
    ],
    'gift': [
      `<rect x="18" y="32" width="64" height="36" rx="2" stroke-width="2.5"/>`,
      `<rect x="22" y="36" width="56" height="28" stroke-dasharray="2 2" stroke-width="1.2"/>`
    ],
    'briefcase': [
      `<rect x="30" y="44" width="40" height="36" rx="6" stroke-width="2.5"/>`,
      `<path d="M30 44c0 12 6 16 20 16s20-4 20-16" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M30 48c-8-12-8-24 20-28s32 10 20 28" stroke-width="2" stroke-dasharray="3 3"/>`,
      `<rect x="47" y="55" width="6" height="8" rx="1" stroke-width="2"/>`
    ],
    'heart': [
      `<path d="M32 25h11c.5 0 1 .3 1.2.8l5.8 9 5.8-9c.2-.5.7-.8 1.2-.8h11l15 6-12 24-4-2v21H34V51l-4 2-12-24 15-6z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M42 25c0 4 16 4 16 0" stroke-width="2"/>`,
      `<path d="M34 51c4 2 6-1 7-4M66 51c-4 2-6-1-7-4" stroke-width="1.5"/>`
    ],
    'volleyball': [
      `<circle cx="50" cy="50" r="32" stroke-width="3"/>`,
      `<path d="M34 22c10 4 18 14 18 28s-4 22-14 28" stroke-width="2"/>`,
      `<path d="M66 22c-10 4-18 14-18 28s4 22 14 28" stroke-width="2"/>`,
      `<path d="M22 34c8 10 20 14 30 14s22-8 26-16" stroke-width="2"/>`,
      `<path d="M22 66c8-10 20-14 30-14s22 8 26 16" stroke-width="2"/>`
    ],
    'shield': [
      `<path d="M32 28h11l1.5-6h11l1.5 6h11l13 7-10 22-4-2v20H34V53l-4 2-10-22 12-7z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M43 28c0-8 4-10 7-10s7 2 7 10" stroke-width="2"/>`,
      `<path d="M50 22v51" stroke-width="2"/>`
    ],
    'truck': [
      `<path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<circle cx="48" cy="22" r="2.8" stroke-width="1.5" fill="#ffffff"/>`,
      `<path d="M 48 22 C 46 35, 44 48, 42 60 M 48 22 C 38 31, 31 44, 29 59 M 48 22 C 54 31, 58 44, 61 59 M 48 22 C 63 31, 68 44, 73 58" stroke-width="1.5"/>`
    ],
    'droplets': [
      `<rect x="22" y="26" width="56" height="12" rx="2" stroke-width="2.5"/>`,
      `<rect x="22" y="38" width="56" height="14" rx="2" stroke-width="2.5"/>`,
      `<rect x="22" y="52" width="56" height="18" rx="2" stroke-width="2.5"/>`
    ],
    'archive': [
      `<path d="M30 30c0-6 8-8 20-8s20 2 20 8v44c0 6-6 10-20 10s-20-4-20-10V30z" stroke-width="2.5"/>`,
      `<rect x="36" y="48" width="28" height="26" rx="4" stroke-width="2"/>`,
      `<path d="M42 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke-width="2"/>`
    ],
    'zap': [
      `<path d="M24 28h52v8l-6 28h-10l-2-12-2 12H40L30 64l-6-28v-8z" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M47 38v8M53 38v8" stroke-width="2"/>`
    ],
    'award': [
      `<circle cx="50" cy="50" r="32" stroke-width="3"/>`,
      `<path d="M50 42l8 6-3 10h-10l-3-10z" stroke-width="2"/>`,
      `<path d="M50 42V30M58 48l10-4M55 58l6 8M45 58l-6 8M42 48l-10-4" stroke-width="2"/>`
    ],
    'check-circle': [
      `<!-- Top-Left: Jersey -->
       <g transform="translate(15, 10) scale(0.55)">
         <path d="M30 25h12c1 0 2 .5 2.5 1.5l3.5 6 3.5-6c.5-1 1.5-1.5 2.5-1.5h12l14 8-6 12-8-3v33H36V41l-8 3-6-12 14-8z" stroke-width="2.5" stroke-linejoin="round"/>
         <path d="M42 25l8 12 8-12" stroke-width="2"/>
       </g>`,
      `<!-- Top-Right: Hat -->
       <g transform="translate(52, 12) scale(0.6)">
         <path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>
         <path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2.5" stroke-linejoin="round"/>
         <circle cx="48" cy="22" r="2" stroke-width="1" fill="#ffffff"/>
       </g>`,
      `<!-- Bottom-Left: Shorts -->
       <g transform="translate(14, 52) scale(0.58)">
         <path d="M24 28h52v8l-6 28h-10l-2-12-2 12H40L30 64l-6-28v-8z" stroke-width="2.5" stroke-linejoin="round"/>
         <path d="M47 38v8M53 38v8" stroke-width="2"/>
       </g>`,
      `<!-- Bottom-Right: Basketball -->
       <g transform="translate(54, 50) scale(0.55)">
         <circle cx="50" cy="50" r="30" stroke-width="3"/>
         <path d="M50 20v60M20 50h60" stroke-width="2"/>
         <path d="M28.5 28.5c11 11 11 31 0 43M71.5 28.5c-11 11-11 31 0 43" stroke-width="2"/>
       </g>`
    ],
  };

  const baseElements = rawShapes[icon];
  if (!baseElements) {
    return `<i data-lucide="${icon}" class="${sizeClass} text-white/20"></i>`;
  }

  return buildStructuredSvg(icon, sizeClass, baseElements, hudOpts);
}

// 初始化詳情頁主展示區的客製化 SVG 與圖片/設計圖切換功能
function initDetailMainPlaceholderSvg() {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  if (!currentFile.startsWith('detail')) return;
  
  const currentProduct = productsData.find(p => p.link === currentFile);
  if (!currentProduct || !currentProduct.icon) return;
  
  const showcaseContainer = document.querySelector('.aspect-video');
  if (!showcaseContainer) return;
  
  if (currentProduct.image) {
    // 該商品有圖片 (detail01 - detail05)
    // 建立一個互動切換視圖
    showcaseContainer.classList.add('relative', 'flex', 'items-center', 'justify-center');
    
    // 備份原有的 HTML (圖片)
    const imgHtml = showcaseContainer.innerHTML;
    
    // 建立雙重檢視結構
    showcaseContainer.innerHTML = `
      <div id="detail-photo-view" class="w-full h-full flex items-center justify-center transition-opacity duration-300">
        ${imgHtml}
      </div>
      <div id="detail-svg-view" class="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 blueprint-grid">
        ${getProductSvg(currentProduct.icon, 'w-32 h-32 md:w-56 md:h-56')}
      </div>
      <!-- 切換按鈕組 -->
      <div class="absolute bottom-4 right-4 z-20 flex bg-black/85 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-lg">
        <button id="btn-show-photo" class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-dvNeon text-black shadow-inner">
          實物照片
        </button>
        <button id="btn-show-svg" class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white">
          設計藍圖
        </button>
      </div>
    `;
    
    const photoView = showcaseContainer.querySelector('#detail-photo-view');
    const svgView = showcaseContainer.querySelector('#detail-svg-view');
    const btnPhoto = showcaseContainer.querySelector('#btn-show-photo');
    const btnSvg = showcaseContainer.querySelector('#btn-show-svg');
    
    btnPhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      photoView.classList.remove('opacity-0', 'pointer-events-none');
      svgView.classList.add('opacity-0', 'pointer-events-none');
      svgView.classList.remove('blueprint-active'); // 移除動畫類別以重設動畫
      btnPhoto.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-dvNeon text-black shadow-inner';
      btnSvg.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white';
    });
    
    btnSvg.addEventListener('click', (e) => {
      e.stopPropagation();
      photoView.classList.add('opacity-0', 'pointer-events-none');
      svgView.classList.remove('opacity-0', 'pointer-events-none');
      svgView.classList.add('blueprint-active'); // 增加動畫類別觸發一筆一筆畫線
      btnSvg.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-dvNeon text-black shadow-inner';
      btnPhoto.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white';
    });
    
    // 綁定 SVG 互動十字座標線與雷達掃描
    bindSvgHoverEffects(svgView);
  } else {
    // 該商品沒有圖片 (detail06 - detail20)
    // 直接顯示藍圖 SVG 並放大 (w-32 h-32 md:w-56 md:h-56 - 放大2倍以上)
    showcaseContainer.className = 'bg-dvGray aspect-video border border-white/20 overflow-hidden flex items-center justify-center group blueprint-grid relative blueprint-active';
    showcaseContainer.innerHTML = getProductSvg(currentProduct.icon, 'w-32 h-32 md:w-56 md:h-56');
    
    // 綁定 SVG 互動十字座標線與雷達掃描
    bindSvgHoverEffects(showcaseContainer);
  }
}

// 初始化商品總覽頁卡片的客製化 SVG 與實物圖
function initProductsPagePlaceholderSvgs() {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  if (currentFile !== 'products.html') return;
  
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    card.classList.add('group'); // 確保整個卡片有 group 類別，使 hover 動畫正常運作
    const linkElement = card.querySelector('a[href^="detail"]');
    if (!linkElement) return;
    
    const href = linkElement.getAttribute('href');
    const product = productsData.find(p => p.link === href);
    if (product) {
      const iconContainer = card.querySelector('.h-48, .h-40');
      if (iconContainer) {
        if (product.image) {
          // 替換商品卡中的預設 shopping-bag 圖標為商品實物圖片，並帶有懸停縮放效果
          iconContainer.innerHTML = `<img src="${product.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${product.name}">`;
        } else {
          // 替換商品卡中的預設 shopping-bag 圖標為專屬客製商品 SVG，並放大至 w-28 h-28 (2倍以上放大)
          iconContainer.innerHTML = getProductSvg(product.icon, 'w-28 h-28');
          iconContainer.classList.add('blueprint-grid');
        }
      }
    }
  });
}

// 綁定科技藍圖 HUD 互動效果：即時游標座標追蹤、輔助十字線定位與雷達水平掃描
function bindSvgHoverEffects(container) {
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;
  
  // 動態建立水平雷達雷射掃描線 (若不存在)
  if (!container.querySelector('.hud-scanner-line')) {
    const scanner = document.createElement('div');
    scanner.className = 'hud-scanner-line';
    container.appendChild(scanner);
  }
  
  const crosshair = svg.querySelector('#hud-crosshair');
  const xLine = svg.querySelector('#hud-x-line');
  const yLine = svg.querySelector('#hud-y-line');
  const coordText = svg.querySelector('#hud-coord-text');
  
  if (!crosshair || !xLine || !yLine || !coordText) return;
  
  const onMouseMove = (e) => {
    const rect = svg.getBoundingClientRect();
    // 根據 SVG 的實際寬高計算 0-100 的 viewBox 相對座標
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      crosshair.style.strokeOpacity = '0.7';
      xLine.setAttribute('y1', y);
      xLine.setAttribute('y2', y);
      yLine.setAttribute('x1', x);
      yLine.setAttribute('x2', x);
      
      // 避免座標文字超出 SVG 右側/上方邊界
      const textX = x + 3 > 75 ? x - 20 : x + 3;
      const textY = y - 3 < 10 ? y + 8 : y - 3;
      
      coordText.setAttribute('x', textX);
      coordText.setAttribute('y', textY);
      coordText.textContent = `LOC: [${Math.round(x)}, ${Math.round(y)}]`;
    }
  };
  
  const onMouseLeave = () => {
    crosshair.style.strokeOpacity = '0';
    coordText.textContent = '';
  };
  
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseleave', onMouseLeave);
}
