// 合併並整理原本三個 HTML 文件的共用 JS
// 功能：移動端菜單切換、導航欄滾動效果、平滑滾動、FAQ 展開（若存在）、過濾按鈕

(() => {
  // 移動端菜單切換
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 導航欄滾動效果
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScrollNav = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('py-2', 'shadow');
        navbar.classList.remove('py-4');
      } else {
        navbar.classList.add('py-4');
        navbar.classList.remove('py-2', 'shadow');
      }
    };
    window.addEventListener('scroll', onScrollNav);
    // 初始化
    onScrollNav();
  }

  // 平滑滾動（只對存在的 hash 錨點適用）
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      if (!href.startsWith('#')) return; // 外部連結不處理

      const targetEl = document.querySelector(href);
      if (!targetEl) return; // 沒有目標元素就不阻止

      e.preventDefault();

      // 關閉移動端菜單
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }

      targetEl.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // FAQ 展開/收縮功能（若有 .faq-question）
  const faqQuestions = document.querySelectorAll('.faq-question');
  if (faqQuestions.length) {
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('i');
        if (!answer) return;
        answer.classList.toggle('hidden');
        if (icon) {
          if (answer.classList.contains('hidden')) {
            icon.classList.remove('fa-minus');
            icon.classList.add('fa-plus');
          } else {
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-minus');
          }
        }
      });
    });
  }

  // 滾動顯示動畫
  const fadeElements = document.querySelectorAll('.section-fade');
  const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('section-visible');
      }
    });
  };
  window.addEventListener('load', fadeInOnScroll);
  window.addEventListener('scroll', fadeInOnScroll);

  // 案例過濾器按鈕（若存在 #cases）
  const casesSection = document.getElementById('cases');
  if (casesSection) {
    const filterButtons = casesSection.querySelectorAll('button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('bg-gray-100', 'hover:bg-gray-200');
        });
        button.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        button.classList.add('bg-primary', 'text-white');
      });
    });
  }

  // 作品過濾按鈕（gallery 頁面）
  const galleryFilterButtons = document.querySelectorAll('.flex.flex-wrap.justify-center button, .flex.flex-wrap.justify-center .px-5');
  if (galleryFilterButtons.length) {
    galleryFilterButtons.forEach(button => {
      button.addEventListener('click', () => {
        galleryFilterButtons.forEach(btn => {
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('bg-gray-100', 'hover:bg-gray-200');
        });
        button.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        button.classList.add('bg-primary', 'text-white');
      });
    });
  }
})();
