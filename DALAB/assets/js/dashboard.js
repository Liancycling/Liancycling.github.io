document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

// 模擬訂單數據 (當沒有配置真實 Firebase 時，儲存在 localStorage 供使用者體驗)
const MOCK_ORDER = {
  orderId: "DL-2026-8809",
  orderDate: "2026-06-28",
  workingDays: 14,
  estimatedDelivery: "2026-07-12",
  status: "production", // design, design_review, production, shipping, done
  logistics: {
    carrier: "黑貓宅急便",
    trackingNumber: "9087123456",
    status: "【配送中】包裹已由黑貓新莊營業所收件，預計明日送達。"
  },
  files: [
    {
      name: "DALAB_籃球衣_合稿校對版_v2.zip",
      url: "https://drive.google.com/drive/folders/mock_shared_link",
      uploadedAt: "2026-06-29 09:30"
    }
  ]
};

function initDashboard() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const toggleToRegister = document.getElementById('toggle-to-register');
  const toggleToLogin = document.getElementById('toggle-to-login');
  
  const mockLoginBtn = document.getElementById('mock-login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // 切換註冊/登入介面
  if (toggleToRegister) {
    toggleToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    });
  }
  if (toggleToLogin) {
    toggleToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }

  // 登出按鈕
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (isFirebaseInitialized) {
        auth.signOut().then(() => {
          showAuth();
        });
      } else {
        localStorage.removeItem('dalab_mock_user');
        showAuth();
      }
    });
  }

  // 模擬登入體驗按鈕
  if (mockLoginBtn) {
    mockLoginBtn.addEventListener('click', () => {
      localStorage.setItem('dalab_mock_user', JSON.stringify({ email: "guest@davillage.com.tw", name: "DV 嘉賓聯絡人" }));
      showDashboard(MOCK_ORDER, "DV 嘉賓聯絡人");
    });
  }

  // 真實 Firebase 認證流程監聽
  if (isFirebaseInitialized) {
    auth.onAuthStateChanged(user => {
      if (user) {
        // 從 Firestore 讀取使用者訂單
        db.collection("orders").where("ownerUid", "==", user.uid).get()
          .then(querySnapshot => {
            let orderData = MOCK_ORDER; // 預設使用 Mock 作為範本
            if (!querySnapshot.empty) {
              orderData = querySnapshot.docs[0].data();
            }
            showDashboard(orderData, user.email);
          })
          .catch(err => {
            console.error("Firestore get error:", err);
            showDashboard(MOCK_ORDER, user.email);
          });
      } else {
        showAuth();
      }
    });

    // 註冊表單提交
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        auth.createUserWithEmailAndPassword(email, pass)
          .then(cred => {
            alert('註冊成功！系統已為您建立專屬後台看板。');
            // 初始化一張空訂單在 Firestore
            db.collection("orders").add({
              orderId: "DL-2026-" + Math.floor(1000 + Math.random() * 9000),
              ownerUid: cred.user.uid,
              orderDate: new Date().toISOString().split('T')[0],
              workingDays: 14,
              estimatedDelivery: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
              status: "design",
              logistics: {
                carrier: "黑貓宅急便",
                trackingNumber: "待出貨時填寫",
                status: "訂單建立成功，等待上傳設計圖進行審稿。"
              },
              files: []
            });
          })
          .catch(err => alert(err.message));
      });
    }

    // 登入表單提交
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, pass)
          .catch(err => alert(err.message));
      });
    }
  } else {
    // 沒初始化真實 Firebase 時，檢查 localstorage 模擬登入
    const savedUser = localStorage.getItem('dalab_mock_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      showDashboard(MOCK_ORDER, u.name || u.email);
    } else {
      showAuth();
    }
  }

  // 監聽合稿連結提交
  const fileForm = document.getElementById('file-submit-form');
  if (fileForm) {
    fileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const linkInput = document.getElementById('cloud-link');
      if (!linkInput || !linkInput.value.trim()) return;

      const newFile = {
        name: "雲端審稿連結 (已提交)",
        url: linkInput.value.trim(),
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      if (isFirebaseInitialized && auth.currentUser) {
        // 更新到 Firestore
        const user = auth.currentUser;
        db.collection("orders").where("ownerUid", "==", user.uid).get()
          .then(qs => {
            if (!qs.empty) {
              const docRef = qs.docs[0].ref;
              const curFiles = qs.docs[0].data().files || [];
              curFiles.push(newFile);
              docRef.update({ files: curFiles }).then(() => {
                alert('檔案連結提交成功，設計師將立即進行審查！');
                location.reload();
              });
            }
          });
      } else {
        // 模擬模式更新
        MOCK_ORDER.files.push(newFile);
        alert('【模擬模式】檔案連結提交成功！您可以從下方清單檢視您的歷史連結。');
        renderFileList(MOCK_ORDER.files);
        linkInput.value = '';
      }
    });
  }
}

function showAuth() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('dashboard-section').classList.add('hidden');
}

function showDashboard(order, userName) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');

  // 設定聯絡人名稱
  document.getElementById('user-display-name').textContent = userName || "球隊聯絡人";
  document.getElementById('display-order-id').textContent = order.orderId;

  // 1. 訂單進度資訊
  document.getElementById('order-date').textContent = order.orderDate;
  document.getElementById('working-days').textContent = order.workingDays + " 工作天";
  document.getElementById('delivery-date').textContent = order.estimatedDelivery;

  // 2. 物流串接資訊
  document.getElementById('logistics-carrier').textContent = order.logistics.carrier;
  document.getElementById('logistics-number').textContent = order.logistics.trackingNumber;
  document.getElementById('logistics-status').textContent = order.logistics.status;

  // 3. 渲染進度條 (RWD Timeline)
  const steps = ["design", "design_review", "production", "shipping", "done"];
  const currentStepIndex = steps.indexOf(order.status);
  
  steps.forEach((step, idx) => {
    const el = document.getElementById(`step-${step}`);
    if (el) {
      if (idx <= currentStepIndex) {
        // 已完成或當前步驟
        el.querySelector('.step-circle').className = "step-circle w-10 h-10 rounded-full bg-dvNeon text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(204,255,0,0.4)]";
        el.querySelector('.step-label').className = "step-label text-sm font-bold text-dvNeon mt-2";
        if (idx < currentStepIndex) {
          const connector = document.getElementById(`connector-${step}`);
          if (connector) connector.className = "step-connector flex-grow h-1 bg-dvNeon";
        }
      } else {
        // 未開始步驟
        el.querySelector('.step-circle').className = "step-circle w-10 h-10 rounded-full bg-white/10 text-gray-500 flex items-center justify-center font-bold border border-white/10";
        el.querySelector('.step-label').className = "step-label text-sm font-bold text-gray-500 mt-2";
      }
    }
  });

  // 4. 渲染檔案清單
  renderFileList(order.files);
}

function renderFileList(files) {
  const container = document.getElementById('file-list-container');
  if (!container) return;

  if (!files || files.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-xs">目前尚無上傳或提交的設計檔案。</p>`;
    return;
  }

  container.innerHTML = files.map(file => `
    <div class="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg group hover:border-dvNeon/50 transition">
      <div class="flex items-center gap-2">
        <i data-lucide="file-text" class="w-4 h-4 text-dvNeon"></i>
        <div class="text-left">
          <p class="text-xs font-bold text-white">${file.name}</p>
          <p class="text-[9px] text-gray-500">上傳時間: ${file.uploadedAt}</p>
        </div>
      </div>
      <a href="${file.url}" target="_blank" class="text-xs text-dvNeon hover:underline flex items-center gap-1">
        打開連結 <i data-lucide="external-link" class="w-3 h-3"></i>
      </a>
    </div>
  `).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}
