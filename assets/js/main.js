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
  const widthText = options.width || '50cm';
  const heightText = options.height || '50cm';
  const angleText = options.angle || '0_DEG_FRONT';
  const targetCx = options.targetCx || 50;
  const targetCy = options.targetCy || 50;
  const targetR = options.targetR || 10;
  
  return `
    <g class="hud-overlay-group">
      <!-- Corner brackets -->
      <path d="M 6 14 V 6 H 14 M 94 14 V 6 H 86 M 6 86 V 94 H 14 M 94 86 V 94 H 86" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.3"/>
      
      <!-- Centered Target Lock concentric circles with inline transform-origin -->
      <circle class="hud-spin-cw" cx="${targetCx}" cy="${targetCy}" r="${targetR}" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.8" stroke-dasharray="2 3" style="transform-origin: ${targetCx}px ${targetCy}px;"/>
      <circle class="hud-spin-ccw" cx="${targetCx}" cy="${targetCy}" r="${targetR + 3}" stroke="#00f0ff" stroke-opacity="0.2" stroke-width="0.6" stroke-dasharray="1 2" style="transform-origin: ${targetCx}px ${targetCy}px;"/>
      
      <!-- Center target ticks -->
      <path d="M ${targetCx} ${targetCy - targetR - 6} V ${targetCy - targetR - 3} M ${targetCx} ${targetCy + targetR + 3} V ${targetCy + targetR + 6} M ${targetCx - targetR - 6} ${targetCy} H ${targetCx - targetR - 3} M ${targetCx + targetR + 3} ${targetCy} H ${targetCx + targetR + 6}" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.3"/>
      
      <!-- Blinkers -->
      <circle cx="8" cy="8" r="1.2" fill="#ff0055" class="hud-blink"/>
      <circle cx="92" cy="92" r="1.2" fill="#00f0ff" class="hud-blink" style="animation-delay: 0.8s;"/>
      
      <!-- Waveform decoration -->
      <path d="M 75 8 h 15 M 78 11 h 12 M 82 14 h 8 M 80 17 h 10" stroke="#00f0ff" stroke-width="0.6" stroke-opacity="0.3"/>
      <path d="M 77 8 h 2 M 82 11 h 3 M 85 14 h 1 M 81 17 h 2" stroke="#ff0055" stroke-width="0.8" stroke-opacity="0.5"/>
      
      <!-- Technical Monospace Labels -->
      <text x="10" y="14" font-family="monospace" font-size="3.2" fill="currentColor">DALAB.SYS // ${productCode}</text>
      <text x="10" y="86" font-family="monospace" font-size="2.8" fill="currentColor">ANGLE: ${angleText}</text>
      <text x="74" y="86" font-family="monospace" font-size="2.8" fill="#00f0ff">${scaleText}</text>
      <text x="6" y="44" font-family="monospace" font-size="2.6" fill="currentColor" transform="rotate(-90 6 44)">H_DIM: ${heightText}</text>
      <text x="44" y="94" font-family="monospace" font-size="2.8" fill="currentColor">W_DIM: ${widthText}</text>
      
      <!-- Terminal bootloader readout! -->
      <text x="10" y="19" font-family="monospace" font-size="2.4" fill="#00f0ff" fill-opacity="0.8" class="hud-flicker">SYS_STATUS: ACTIVE [100%]</text>
      <text x="10" y="23" font-family="monospace" font-size="2.2" fill="currentColor" fill-opacity="0.6">GRID_LOCK: ENFORCED</text>
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
  
  // Child 1: Grid helper
  const gridHelper = `<path d="M10 50h80M50 10v80" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="2 2"/>`;
  
  // Child 7: Brand Logo
  let logoGroup = '';
  if (icon === 'truck') {
    logoGroup = `
      <g>
        <path d="M 33 37 Q 35 36 37 36 L 47 37 Q 49 37.5 50 39 L 51 49 Q 51.5 51 50 53 L 40 55 Q 38 55.5 36 55 L 32 45 Q 31 43 33 37 Z" stroke-width="1.2" fill="#0b0f19" stroke-linejoin="round"/>
        <g transform="translate(41.5, 46.5) scale(0.5) translate(-43.5, -46)">
          <path d="M 41.5 39 Q 43 38 44.5 39 L 47.5 41.5 Q 48.5 43 48.5 44.5 L 48.5 47.5 Q 48.5 49 47.5 50.5 L 44.5 53 Q 43 54 41.5 53 L 38.5 50.5 Q 37.5 49 37.5 47.5 L 37.5 44.5 Q 37.5 43 38.5 41.5 Z M 43 42 A 1.8 4 0 1 0 43 50 A 1.8 4 0 1 0 43 42 Z M 46.46 48 A 1.8 4 120 1 0 39.54 44 A 1.8 4 120 1 0 46.46 48 Z M 39.54 48 A 1.8 4 240 1 0 46.46 44 A 1.8 4 240 1 0 39.54 48 Z" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        </g>
      </g>
    `;
  } else {
    const logoX = hudOpts.logoCx || hudOpts.targetCx || 50;
    const logoY = hudOpts.logoCy || hudOpts.targetCy || 50;
    const logoS = hudOpts.logoScale || 0.4;
    logoGroup = `
      <g transform="translate(${logoX}, ${logoY}) scale(${logoS}) translate(-43.5, -46)">
        <path d="M 41.5 39 Q 43 38 44.5 39 L 47.5 41.5 Q 48.5 43 48.5 44.5 L 48.5 47.5 Q 48.5 49 47.5 50.5 L 44.5 53 Q 43 54 41.5 53 L 38.5 50.5 Q 37.5 49 37.5 47.5 L 37.5 44.5 Q 37.5 43 38.5 41.5 Z M 43 42 A 1.8 4 0 1 0 43 50 A 1.8 4 0 1 0 43 42 Z M 46.46 48 A 1.8 4 120 1 0 39.54 44 A 1.8 4 120 1 0 46.46 48 Z M 39.54 48 A 1.8 4 240 1 0 46.46 44 A 1.8 4 240 1 0 39.54 48 Z" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      </g>
    `;
  }
  
  // Child 8: HUD overlays
  const hudGroup = getCyberHudGroup(hudOpts.code, hudOpts.name, hudOpts);
  
  // Child 9: Interactive cursor crosshair
  const crosshairGroup = `
    <g id="hud-crosshair" stroke="#00f0ff" stroke-width="0.4" stroke-opacity="0" style="pointer-events: none;">
      <line id="hud-x-line" x1="0" y1="-10" x2="100" y2="-10" />
      <line id="hud-y-line" x1="-10" y1="0" x2="-10" y2="100" />
      <text id="hud-coord-text" font-family="monospace" font-size="2.2" fill="#00f0ff" fill-opacity="0.8" x="0" y="0"></text>
    </g>
  `;
  
  return `<svg class="${sizeClass} transition-all duration-500 group-hover:scale-150 group-hover:text-dvNeon text-white/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
    ${gridHelper}
    ${shapes[0]}
    ${shapes[1]}
    ${shapes[2]}
    ${shapes[3]}
    ${shapes[4]}
    ${logoGroup}
    ${hudGroup}
    ${crosshairGroup}
  </svg>`;
}

// ========== 客製化 SVG 設計圖示生成庫 (高細節工程製圖/藍圖風格) ==========
function getProductSvg(icon, sizeClass = "w-10 h-10") {
  const hudOptionsMap = {
    'baseball': { code: 'BASEBALL_B01', name: '客製棒球', width: '7.2cm', height: '7.2cm', scale: 'SCALE 1:1', angle: '3D_ROT_35', targetCx: 50, targetCy: 50, targetR: 12, logoScale: 0.4 },
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
      `<circle cx="50" cy="50" r="30" stroke-width="2"/>`,
      `<path d="M27 37c9 4 13 9 13 13s-4 9-13 13" stroke-width="1.5"/>`,
      `<path d="M73 37c-9 4-13 9-13 13s4 9 13 13" stroke-width="1.5"/>`,
      `<path d="M31 39l1.5-2M34 43l1.5-1.5M36 47l1.2-1M36 53l-1.2-1M34 57l-1.5-1.5M31 61l-1.5-2" stroke-width="1" stroke-opacity="0.6"/>`,
      `<path d="M69 39l-1.5-2M66 43l-1.5-1.5M64 47l-1.2-1M64 53l1.2-1M66 57l1.5-1.5M69 61l1.5-2" stroke-width="1" stroke-opacity="0.6"/>`
    ],
    'jersey': [
      `<path d="M30 25h12c1 0 2 .5 2.5 1.5l3.5 6 3.5-6c.5-1 1.5-1.5 2.5-1.5h12l14 8-6 12-8-3v33H36V41l-8 3-6-12 14-8z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M42 25l8 12 8-12" stroke-width="1.5"/>`,
      `<path d="M36 41c2 1 4 0 5-2M64 41c-2 1-4 0-5-2" stroke-width="1"/>`,
      `<path d="M36 71h28" stroke-dasharray="2 2" stroke-width="1"/>`
    ],
    'hat': [
      `<path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2" stroke-linejoin="round"/>`,
      `<circle cx="48" cy="22" r="2.8" stroke-width="1.5" fill="#0b0f19"/>`,
      `<path d="M 48 22 C 46 35, 44 48, 42 60 M 48 22 C 38 31, 31 44, 29 59 M 48 22 C 54 31, 58 44, 61 59 M 48 22 C 63 31, 68 44, 73 58 M 75 56 L 80 47 M 82 29 A 9 9 0 1 1 82 47 A 9 9 0 1 1 82 29 M 75 35 H 80 V 38 H 75 Z M 79 36 H 87 V 39 H 79 Z" stroke-width="1"/>`,
      `<path d="M 25.5 59.5 C 16 63, 11 68.5, 14 72 C 18.5 75.5, 34 75, 48 72 C 57 70.5, 62 64.5, 62 59.5 M 81 37.5 A 0.5 0.5 0 1 1 81 36.5 A 0.5 0.5 0 1 1 81 37.5 M 83 37.5 A 0.5 0.5 0 1 1 83 36.5 A 0.5 0.5 0 1 1 83 37.5 M 85 37.5 A 0.5 0.5 0 1 1 85 36.5 A 0.5 0.5 0 1 1 85 37.5" stroke-width="0.8" stroke-dasharray="2 1.5"/>`
    ],
    'towel': [
      `<rect x="18" y="32" width="64" height="36" rx="2" stroke-width="2"/>`,
      `<rect x="22" y="36" width="56" height="28" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M18 34h-4M18 38h-4M18 42h-4M18 46h-4M18 50h-4M18 54h-4M18 58h-4M18 62h-4M18 66h-4" stroke-width="1"/>`,
      `<path d="M82 34h4M82 38h4M82 42h4M82 46h4M82 50h4M82 54h4M82 58h4M82 62h4M82 66h4" stroke-width="1"/>`
    ],
    'tote': [
      `<path d="M28 42h44l-4 34H32L28 42z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M38 42c0-14 6-18 12-18s12 4 12 18" stroke-width="1.5"/>`,
      `<path d="M38 42c-2-8 2-10 12-10s14 2 12 10" stroke-width="1.2" stroke-dasharray="2 2"/>`,
      `<path d="M34 70h32" stroke-dasharray="2 2" stroke-width="1"/>`
    ],
    'user': [
      `<path d="M30 25h12c1 0 2 .5 2.5 1.5l3.5 6 3.5-6c.5-1 1.5-1.5 2.5-1.5h12l14 8-6 12-8-3v33H36V41l-8 3-6-12 14-8z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M26 33l5-1.5M69 31.5l5 1.5M36 71h28" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M42 25c0 4 16 4 16 0" stroke-width="1.5"/>`,
      `<path d="M36 41c2 1 4 0 5-2M64 41c-2 1-4 0-5-2" stroke-width="1"/>`,
      `<path d="M15 25v49M12 25h6M12 74h6" stroke-width="1"/>`,
      `<path d="M30 83h40M30 80v6M70 80v6" stroke-width="1"/>`
    ],
    'dribbble': [
      `<circle cx="50" cy="50" r="32" stroke-width="2"/>`,
      `<path d="M50 18v64M18 50h64" stroke-width="1.5"/>`,
      `<path d="M27.5 27.5c12 12 12 33 0 45M72.5 27.5c-12 12-12 33 0 45" stroke-width="1.5"/>`,
      `<circle cx="50" cy="50" r="2" fill="currentColor"/>`,
      `<path d="M12 18h76M12 18v6M88 18v6" stroke-width="1"/>`
    ],
    'activity': [
      `<path d="M32 25h11c.5 0 1 .3 1.2.8l5.8 9 5.8-9c.2-.5.7-.8 1.2-.8h11l15 6-12 24-4-2v21H34V51l-4 2-12-24 15-6z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M21 34l-3 6M79 34l3 6M34 71h32" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M42 25c0 4 16 4 16 0" stroke-width="1.5"/>`,
      `<path d="M34 51c4 2 6-1 7-4M66 51c-4 2-6-1-7-4" stroke-width="1"/>`,
      `<path d="M12 25v48M9 25h6M9 73h6" stroke-width="1"/>`
    ],
    'wind': [
      `<path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2" stroke-linejoin="round"/>`,
      `<circle cx="48" cy="22" r="2.8" stroke-width="1.5" fill="#0b0f19"/>`,
      `<path d="M 48 22 C 46 35, 44 48, 42 60 M 48 22 C 38 31, 31 44, 29 59 M 48 22 C 54 31, 58 44, 61 59 M 48 22 C 63 31, 68 44, 73 58 M 75 56 L 80 47 M 82 29 A 9 9 0 1 1 82 47 A 9 9 0 1 1 82 29 M 75 35 H 80 V 38 H 75 Z M 79 36 H 87 V 39 H 79 Z M 54 28 C 58 31, 62 34, 66 37 M 56 35 C 60 38, 64 41, 68 44 M 58 42 C 62 45, 66 48, 70 51 M 60 49 C 64 52, 68 55, 72 57 M 58 26 C 56 32, 54 38, 52 44 M 64 29 C 62 36, 60 43, 58 50 M 70 33 C 68 41, 66 49, 64 56" stroke-width="0.8" stroke-opacity="0.5"/>`,
      `<path d="M 25.5 59.5 C 16 63, 11 68.5, 14 72 C 18.5 75.5, 34 75, 48 72 C 57 70.5, 62 64.5, 62 59.5 M 81 37.5 A 0.5 0.5 0 1 1 81 36.5 A 0.5 0.5 0 1 1 81 37.5 M 83 37.5 A 0.5 0.5 0 1 1 83 36.5 A 0.5 0.5 0 1 1 83 37.5 M 85 37.5 A 0.5 0.5 0 1 1 85 36.5 A 0.5 0.5 0 1 1 85 37.5" stroke-width="0.8" stroke-dasharray="2 1.5"/>`
    ],
    'gift': [
      `<rect x="18" y="32" width="64" height="36" rx="2" stroke-width="2"/>`,
      `<rect x="22" y="36" width="56" height="28" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M18 34h-4M18 38h-4M18 42h-4M18 46h-4M18 50h-4M18 54h-4M18 58h-4M18 62h-4M18 66h-4" stroke-width="1"/>`,
      `<path d="M82 34h4M82 38h4M82 42h4M82 46h4M82 50h4M82 54h4M82 58h4M82 62h4M82 66h4" stroke-width="1"/>`,
      `<path d="M30 44h40M30 50h40M30 56h40" stroke-width="1" stroke-opacity="0.4"/>`
    ],
    'briefcase': [
      `<rect x="30" y="44" width="40" height="36" rx="6" stroke-width="2"/>`,
      `<path d="M30 44c0 12 6 16 20 16s20-4 20-16" stroke-width="1.5" stroke-linejoin="round"/>`,
      `<path d="M30 48c-8-12-8-24 20-28s32 10 20 28" stroke-width="1.5" stroke-dasharray="3 3"/>`,
      `<rect x="47" y="55" width="6" height="8" rx="1" stroke-width="1.5"/>`,
      `<path d="M34 74h32" stroke-dasharray="2 2" stroke-width="1"/>`
    ],
    'heart': [
      `<path d="M32 25h11c.5 0 1 .3 1.2.8l5.8 9 5.8-9c.2-.5.7-.8 1.2-.8h11l15 6-12 24-4-2v21H34V51l-4 2-12-24 15-6z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M42 25c0 4 16 4 16 0" stroke-width="1.5"/>`,
      `<path d="M20 32l-2 5M80 32l2 5M34 71h32" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M34 51c4 2 6-1 7-4M66 51c-4 2-6-1-7-4" stroke-width="1"/>`
    ],
    'volleyball': [
      `<circle cx="50" cy="50" r="32" stroke-width="2"/>`,
      `<path d="M34 22c10 4 18 14 18 28s-4 22-14 28" stroke-width="1.5"/>`,
      `<path d="M66 22c-10 4-18 14-18 28s4 22 14 28" stroke-width="1.5"/>`,
      `<path d="M22 34c8 10 20 14 30 14s22-8 26-16" stroke-width="1.5"/>`,
      `<path d="M22 66c8-10 20-14 30-14s22 8 26 16" stroke-width="1.5"/>`,
      `<path d="M50 18v8M50 74v8M18 50h8M74 50h8" stroke-width="1" stroke-opacity="0.5"/>`
    ],
    'shield': [
      `<path d="M32 28h11l1.5-6h11l1.5 6h11l13 7-10 22-4-2v20H34V53l-4 2-10-22 12-7z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M43 28c0-8 4-10 7-10s7 2 7 10" stroke-width="1.5"/>`,
      `<path d="M50 22v51" stroke-width="1.5"/>`,
      `<path d="M48 28h4M48 34h4M48 40h4M48 46h4M48 52h4M48 58h4M48 64h4" stroke-width="1" stroke-dasharray="1 1"/>`,
      `<path d="M38 58h8v10h-8zM54 58h8v10h-8z" stroke-width="1"/>`
    ],
    'truck': [
      `<path d="M 25 58 C 25 35, 33 22, 48 22 C 63 22, 75 35, 75 58 C 65 60, 35 60, 25 58 Z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M 25 58 C 14 62, 8 68, 12 73 C 17 77, 35 77, 50 74 C 60 72, 65 65, 65 58 C 50 61, 35 61, 25 58 Z" stroke-width="2" stroke-linejoin="round"/>`,
      `<circle cx="48" cy="22" r="2.8" stroke-width="1.5" fill="#0b0f19"/>`,
      `<path d="M 48 22 C 46 35, 44 48, 42 60 M 48 22 C 38 31, 31 44, 29 59 M 48 22 C 54 31, 58 44, 61 59 M 48 22 C 63 31, 68 44, 73 58 M 75 56 L 80 47 M 82 29 A 9 9 0 1 1 82 47 A 9 9 0 1 1 82 29 M 75 35 H 80 V 38 H 75 Z M 79 36 H 87 V 39 H 79 Z M 54 28 H 72 M 56 34 H 74 M 58 40 H 75 M 60 47 H 75 M 62 54 H 75 M 54 24 V 58 M 60 25 V 58 M 66 27 V 58 M 72 30 V 58" stroke-width="0.8" stroke-opacity="0.5"/>`,
      `<path d="M 25.5 59.5 C 16 63, 11 68.5, 14 72 C 18.5 75.5, 34 75, 48 72 C 57 70.5, 62 64.5, 62 59.5 M 81 37.5 A 0.5 0.5 0 1 1 81 36.5 A 0.5 0.5 0 1 1 81 37.5 M 83 37.5 A 0.5 0.5 0 1 1 83 36.5 A 0.5 0.5 0 1 1 83 37.5 M 85 37.5 A 0.5 0.5 0 1 1 85 36.5 A 0.5 0.5 0 1 1 85 37.5" stroke-width="0.8" stroke-dasharray="2 1.5"/>`
    ],
    'droplets': [
      `<rect x="22" y="26" width="56" height="12" rx="2" stroke-width="2"/>`,
      `<rect x="22" y="38" width="56" height="14" rx="2" stroke-width="2"/>`,
      `<rect x="22" y="52" width="56" height="18" rx="2" stroke-width="2"/>`,
      `<path d="M28 32h44M28 45h44M28 61h44" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M84 26v44M81 26h6M81 70h6" stroke-width="1"/>`
    ],
    'archive': [
      `<path d="M30 30c0-6 8-8 20-8s20 2 20 8v44c0 6-6 10-20 10s-20-4-20-10V30z" stroke-width="2"/>`,
      `<rect x="36" y="48" width="28" height="26" rx="4" stroke-width="1.5"/>`,
      `<path d="M36 56h28" stroke-dasharray="2 2" stroke-width="1"/>`,
      `<path d="M42 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke-width="1.5"/>`,
      `<path d="M26 36c-4 6-4 18 0 24M74 36c4 6 4 18 0 24" stroke-width="1" stroke-dasharray="2 2"/>`
    ],
    'zap': [
      `<path d="M24 28h52v8l-6 28h-10l-2-12-2 12H40L30 64l-6-28v-8z" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M24 33h52M24 38h52" stroke-width="1" stroke-opacity="0.5"/>`,
      `<path d="M47 38v8M53 38v8" stroke-width="1.5"/>`,
      `<path d="M30 60h10M60 60h10" stroke-dasharray="2 2" stroke-width="1"/>`
    ],
    'award': [
      `<circle cx="50" cy="50" r="32" stroke-width="2"/>`,
      `<path d="M50 42l8 6-3 10h-10l-3-10z" stroke-width="1.5"/>`,
      `<path d="M50 42V30M58 48l10-4M55 58l6 8M45 58l-6 8M42 48l-10-4" stroke-width="1.5"/>`,
      `<path d="M38 28c8-6 16-6 24 0M68 44c6 8 4 18-2 22M61 66c-8 6-14 6-22 0M32 44c-6 8-4 18 2 22" stroke-width="1" stroke-dasharray="2 2"/>`
    ],
    'check-circle': [
      `<rect x="15" y="15" width="70" height="70" stroke-dasharray="4 4" stroke-opacity="0.2"/>`,
      `<path d="M26 44h10l3-5 3 5h10v18H26V44z" stroke-width="1.5"/>`,
      `<path d="M31 44c0 1.5 1.5 3 3 3s3-1.5 3-3"/>`,
      `<path d="M56 46c0-10 8-16 16-16s16 6 16 16H56z" stroke-width="1.5"/>`,
      `<path d="M56 46c-6 0-8 4-8 4s8 2 16 0" stroke-width="1.5"/>`,
      `<circle cx="54" cy="64" r="14" stroke-width="1.5"/>`,
      `<path d="M46 64h16M54 50v28" stroke-dasharray="2 2" stroke-width="1"/>`
    ]
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
