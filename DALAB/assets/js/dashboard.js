document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

// ─────────────────────────────────────────────────────
// 模擬訂單數據 (Demo Mode)
// ─────────────────────────────────────────────────────
const MOCK_ORDER = {
  orderId: "DL-2026-8809",
  orderDate: "2026-06-28",
  workingDays: 14,
  estimatedDelivery: "2026-07-12",
  status: "production",
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

// ─────────────────────────────────────────────────────
// 工具函數：生成 8 位英數字隨機密碼
// ─────────────────────────────────────────────────────
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─────────────────────────────────────────────────────
// 工具函數：呼叫 Google Apps Script 發送歡迎信
// 請將 SCRIPT_URL 替換為您自己的 Google Apps Script Web App URL
// ─────────────────────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

async function sendWelcomeEmail(toEmail, toName, tempPassword) {
  // 如果尚未設定 Apps Script，僅在 Console 顯示 (demo 模式)
  if (APPS_SCRIPT_URL.includes("YOUR_SCRIPT_ID")) {
    console.log(`[Demo] 模擬寄信給 ${toEmail}，臨時密碼：${tempPassword}`);
    return true;
  }

  try {
    const payload = {
      action: "sendWelcomeEmail",
      to: toEmail,
      name: toName || "新會員",
      tempPassword: tempPassword
    };
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const json = await resp.json();
    return json.success === true;
  } catch (err) {
    console.error("寄信失敗:", err);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// 工具函數：名片圖片 OCR 解析
// 使用 Google Cloud Vision API；如未設定則走本地模擬解析
// ─────────────────────────────────────────────────────
const VISION_API_KEY = ""; // 留空則走 Demo 模擬解析

async function ocrBusinessCard(imageFile) {
  // Demo 模擬解析（無 API 金鑰時）
  if (!VISION_API_KEY) {
    return simulateOcrParse(imageFile);
  }

  // 轉為 base64
  const base64 = await fileToBase64(imageFile);

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            image: { content: base64.split(",")[1] },
            features: [{ type: "TEXT_DETECTION", maxResults: 1 }]
          }]
        })
      }
    );

    const data = await response.json();
    const rawText = data.responses[0]?.fullTextAnnotation?.text || "";
    return parseCardText(rawText);
  } catch (err) {
    console.error("Vision API 錯誤:", err);
    return simulateOcrParse(imageFile);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 模擬解析（展示用）
function simulateOcrParse(file) {
  return new Promise(resolve => {
    // 以圖片讀取完成後進行模擬解析
    const reader = new FileReader();
    reader.onload = () => {
      // Demo 模擬回傳
      resolve({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        cardImageBase64: reader.result
      });
    };
    reader.readAsDataURL(file);
  });
}

// 從 OCR 原始文字解析欄位
function parseCardText(rawText) {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

  // Email 辨識
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // 電話辨識（台灣格式：09xx、(02)、+886）
  const phoneMatch = rawText.match(/(\+886[-\s]?|0)[0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].replace(/\s/g, "") : "";

  // 地址辨識（包含「縣市區路」等關鍵字）
  const addressMatch = rawText.match(/[台臺][北中南東西]?[市縣][^\n]{5,40}/);
  const address = addressMatch ? addressMatch[0].trim() : "";

  // 姓名：假設第一行或第二行是姓名（排除 Email 和電話所在行）
  const name = lines.find(l =>
    !l.includes("@") &&
    !/\d{4,}/.test(l) &&
    l.length >= 2 &&
    l.length <= 10
  ) || "";

  return { name, email, phone, address, cardImageBase64: "" };
}


// ─────────────────────────────────────────────────────
// 主初始化函數
// ─────────────────────────────────────────────────────
function initDashboard() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleToRegister = document.getElementById('toggle-to-register');
  const toggleToLogin = document.getElementById('toggle-to-login');
  const mockLoginBtn = document.getElementById('mock-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const cameraInput = document.getElementById('camera-ocr-input');

  // ── 切換登入 / 註冊介面 ──
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

  // ── 登出 ──
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (isFirebaseInitialized) {
        auth.signOut().then(showAuth);
      } else {
        localStorage.removeItem('dalab_mock_user');
        showAuth();
      }
    });
  }

  // ── Demo 體驗按鈕 ──
  if (mockLoginBtn) {
    mockLoginBtn.addEventListener('click', () => {
      localStorage.setItem('dalab_mock_user', JSON.stringify({
        email: "guest@davillage.com.tw",
        name: "DV 嘉賓聯絡人"
      }));
      showDashboard(MOCK_ORDER, "DV 嘉賓聯絡人");
    });
  }

  // ── 📸 名片拍照 → OCR → 自動帶入欄位 ──
  if (cameraInput) {
    cameraInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // 顯示掃描中狀態
      showOcrStatus("正在辨識名片中…請稍候", "loading");

      const result = await ocrBusinessCard(file);

      // 帶入欄位
      if (result.name) document.getElementById('reg-name').value = result.name;
      if (result.email) document.getElementById('reg-email').value = result.email;
      if (result.phone) document.getElementById('setting-phone') && (document.getElementById('setting-phone').value = result.phone);

      // 儲存名片圖片到 window 供後續上傳用
      window._cardImageBase64 = result.cardImageBase64 || "";
      window._cardPhone = result.phone || "";
      window._cardAddress = result.address || "";

      // 顯示結果預覽
      const hasData = result.name || result.email;
      if (hasData) {
        showOcrStatus(`✅ 辨識完成！已自動填入：${[result.name, result.email].filter(Boolean).join("、")}。請確認後設定您的密碼即可完成註冊。`, "success");
      } else {
        showOcrStatus("⚠️ 未能自動辨識，請手動填寫以下欄位後完成註冊。", "warn");
      }

      // 顯示名片縮圖
      if (result.cardImageBase64) {
        showCardPreview(result.cardImageBase64);
      }
    });
  }

  // ── Firebase 認證流程 ──
  if (isFirebaseInitialized) {
    auth.onAuthStateChanged(user => {
      if (user) {
        // 讀取 Firestore 訂單
        db.collection("orders").where("ownerUid", "==", user.uid).get()
          .then(qs => {
            const orderData = !qs.empty ? qs.docs[0].data() : MOCK_ORDER;
            // 讀取會員名稱
            db.collection("users").doc(user.uid).get().then(doc => {
              const displayName = doc.exists && doc.data().name ? doc.data().name : user.email;
              showDashboard(orderData, displayName);
            });
          })
          .catch(err => {
            console.error("Firestore:", err);
            showDashboard(MOCK_ORDER, user.email);
          });
      } else {
        showAuth();
      }
    });

    // 一般手動註冊提交
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-password').value;

        if (pass.length < 6) {
          alert("密碼至少需要 6 位！");
          return;
        }

        try {
          const cred = await auth.createUserWithEmailAndPassword(email, pass);
          // 儲存會員資料到 Firestore
          await db.collection("users").doc(cred.user.uid).set({
            name: name,
            email: email,
            phone: window._cardPhone || "",
            address: window._cardAddress || "",
            cardImageUrl: "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          // 建立空訂單
          await db.collection("orders").add({
            orderId: "DL-2026-" + Math.floor(1000 + Math.random() * 9000),
            ownerUid: cred.user.uid,
            orderDate: new Date().toISOString().split('T')[0],
            workingDays: 14,
            estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "design",
            logistics: {
              carrier: "黑貓宅急便",
              trackingNumber: "待出貨時填寫",
              status: "訂單建立成功，等待上傳設計圖進行審稿。"
            },
            files: []
          });
          alert(`🎉 歡迎加入！${name || email}，帳號已成功建立。`);
        } catch (err) {
          alert("註冊失敗：" + err.message);
        }
      });
    }

    // 登入表單提交
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, pass)
          .catch(err => alert("登入失敗：" + err.message));
      });
    }

    // 忘記密碼處理
    const forgotPwdLink = document.getElementById('forgot-password-link');
    if (forgotPwdLink) {
      forgotPwdLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt("請輸入您的註冊信箱以發送密碼重設信件：");
        if (email) {
          auth.sendPasswordResetEmail(email.trim())
            .then(() => {
              alert("✉️ 密碼重設郵件已成功發送！請檢查您的收件匣。");
            })
            .catch(err => {
              alert("發送重設信件失敗：" + err.message);
            });
        }
      });
    }

  } else {
    // Demo / LocalStorage 模式
    const savedUser = localStorage.getItem('dalab_mock_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      showDashboard(MOCK_ORDER, u.name || u.email);
    } else {
      showAuth();
    }

    // Demo 模式 - 名片掃描後自動填入範例並送出臨時密碼信
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-password').value;

        if (!email) { alert("請填寫 Email！"); return; }
        if (pass.length < 6) { alert("密碼至少需要 6 位！"); return; }

        // 若是由名片觸發（無密碼輸入），系統自動生成臨時密碼
        const tempPwd = generateTempPassword();
        const finalPass = pass || tempPwd;
        const isCameraRegister = !!window._cardImageBase64;

        // 模擬建立帳號
        localStorage.setItem('dalab_mock_user', JSON.stringify({
          email: email,
          name: name || email,
          phone: window._cardPhone || "",
          address: window._cardAddress || ""
        }));

        if (isCameraRegister || !pass) {
          // 模擬寄信通知
          const sent = await sendWelcomeEmail(email, name, finalPass);
          alert(
            `✅ 名片掃描註冊成功！\n\n` +
            `歡迎 ${name || email}！\n` +
            `系統已發送臨時密碼到 ${email}\n` +
            `您的臨時密碼：${finalPass}\n\n` +
            `登入後請至「帳號設定」修改您的密碼。`
          );
        } else {
          alert(`✅ 帳號建立成功！歡迎 ${name || email}！`);
        }

        showDashboard(MOCK_ORDER, name || email);
      });
    }

    // Demo 模式 - 忘記密碼處理
    const forgotPwdLink = document.getElementById('forgot-password-link');
    if (forgotPwdLink) {
      forgotPwdLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt("【模擬模式】請輸入您的註冊信箱：");
        if (email) {
          alert(`✉️ 【模擬模式】密碼重設郵件已成功模擬發送至 ${email}！`);
        }
      });
    }
  }

  // ── 合稿連結提交 ──
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
        MOCK_ORDER.files.push(newFile);
        alert('【模擬模式】連結提交成功！');
        renderFileList(MOCK_ORDER.files);
        linkInput.value = '';
      }
    });
  }

  // ── 帳號設定面板開關 ──
  const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
  const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsForm = document.getElementById('settings-form');

  if (toggleSettingsBtn && settingsPanel) {
    toggleSettingsBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
      if (isFirebaseInitialized && auth.currentUser) {
        db.collection("users").doc(auth.currentUser.uid).get().then(doc => {
          if (doc.exists) {
            const d = doc.data();
            document.getElementById('setting-name').value = d.name || "";
            document.getElementById('setting-phone').value = d.phone || "";
            document.getElementById('setting-address').value = d.address || "";
          }
        });
      } else {
        const u = JSON.parse(localStorage.getItem('dalab_mock_user') || '{"name":""}');
        document.getElementById('setting-name').value = u.name || "";
        document.getElementById('setting-phone').value = u.phone || "";
        document.getElementById('setting-address').value = u.address || "";
      }
    });
  }

  if (cancelSettingsBtn && settingsPanel) {
    cancelSettingsBtn.addEventListener('click', () => {
      settingsPanel.classList.add('hidden');
    });
  }

  // ── 設定表單提交（含修改密碼） ──
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('setting-name').value.trim();
      const phone = document.getElementById('setting-phone').value.trim();
      const address = document.getElementById('setting-address').value.trim();
      const newPwd = document.getElementById('setting-new-password').value;
      const confirmPwd = document.getElementById('setting-confirm-password').value;

      // 密碼驗證
      if (newPwd) {
        if (newPwd.length < 6) {
          alert("新密碼長度至少需要 6 位！");
          return;
        }
        if (newPwd !== confirmPwd) {
          alert("兩次密碼不一致，請重新確認！");
          return;
        }
      }

      if (isFirebaseInitialized && auth.currentUser) {
        const user = auth.currentUser;

        // 儲存基本資料
        try {
          await db.collection("users").doc(user.uid).set({
            name, phone, address,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          // 若有新密碼，一併更新
          if (newPwd) {
            await user.updatePassword(newPwd);
            alert("✅ 資料與密碼均已更新成功！");
          } else {
            alert("✅ 會員資料更新成功！");
          }

          document.getElementById('user-display-name').textContent = name;
          settingsPanel.classList.add('hidden');

          // 清空密碼欄位
          document.getElementById('setting-new-password').value = "";
          document.getElementById('setting-confirm-password').value = "";
        } catch (err) {
          // Firebase 密碼更新需要重新登入
          if (err.code === 'auth/requires-recent-login') {
            alert("⚠️ 為安全起見，修改密碼需要重新登入後才能操作。請登出後再嘗試。");
          } else {
            alert("更新失敗：" + err.message);
          }
        }
      } else {
        // Demo 模式
        const mockUser = {
          email: "guest@davillage.com.tw",
          name, phone, address
        };
        localStorage.setItem('dalab_mock_user', JSON.stringify(mockUser));
        if (newPwd) {
          alert(`【模擬模式】✅ 資料與密碼均已更新成功！\n新密碼：${newPwd}`);
        } else {
          alert("【模擬模式】✅ 會員資料更新成功！");
        }
        document.getElementById('user-display-name').textContent = name;
        settingsPanel.classList.add('hidden');
        document.getElementById('setting-new-password').value = "";
        document.getElementById('setting-confirm-password').value = "";
      }
    });
  }
}


// ─────────────────────────────────────────────────────
// OCR 狀態提示框
// ─────────────────────────────────────────────────────
function showOcrStatus(message, type = "loading") {
  let el = document.getElementById('ocr-status-bar');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ocr-status-bar';
    el.className = 'mt-2 text-xs rounded px-3 py-2 font-mono transition-all';
    const cameraBlock = document.getElementById('camera-ocr-input');
    if (cameraBlock && cameraBlock.parentElement) {
      cameraBlock.parentElement.parentElement.insertAdjacentElement('afterend', el);
    }
  }

  const colorMap = {
    loading: 'bg-blue-900/40 border border-blue-500/30 text-blue-300',
    success: 'bg-dvNeon/10 border border-dvNeon/40 text-dvNeon',
    warn: 'bg-yellow-900/40 border border-yellow-500/30 text-yellow-300'
  };
  el.className = `mt-2 text-xs rounded px-3 py-2 font-mono ${colorMap[type] || colorMap.loading}`;
  el.textContent = message;
}

// ─────────────────────────────────────────────────────
// 名片縮圖預覽
// ─────────────────────────────────────────────────────
function showCardPreview(base64) {
  let el = document.getElementById('card-preview-img');
  if (!el) {
    el = document.createElement('img');
    el.id = 'card-preview-img';
    el.className = 'mt-2 w-full rounded border border-white/10 object-cover max-h-36';
    el.alt = '名片預覽';
    const statusBar = document.getElementById('ocr-status-bar');
    if (statusBar) statusBar.insertAdjacentElement('afterend', el);
  }
  el.src = base64;
}


// ─────────────────────────────────────────────────────
// showAuth / showDashboard
// ─────────────────────────────────────────────────────
function showAuth() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('dashboard-section').classList.add('hidden');
}

function showDashboard(order, userName) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');

  document.getElementById('user-display-name').textContent = userName || "球隊聯絡人";
  document.getElementById('display-order-id').textContent = order.orderId;
  document.getElementById('order-date').textContent = order.orderDate;
  document.getElementById('working-days').textContent = order.workingDays + " 工作天";
  document.getElementById('delivery-date').textContent = order.estimatedDelivery;
  document.getElementById('logistics-carrier').textContent = order.logistics.carrier;
  document.getElementById('logistics-number').textContent = order.logistics.trackingNumber;
  document.getElementById('logistics-status').textContent = order.logistics.status;

  // 渲染訂單進度條
  const steps = ["design", "design_review", "production", "shipping", "done"];
  const currentStepIndex = steps.indexOf(order.status);

  steps.forEach((step, idx) => {
    const el = document.getElementById(`step-${step}`);
    if (el) {
      if (idx <= currentStepIndex) {
        el.querySelector('.step-circle').className = "step-circle w-10 h-10 rounded-full bg-dvNeon text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(204,255,0,0.4)]";
        el.querySelector('.step-label').className = "step-label text-sm font-bold text-dvNeon mt-2";
        if (idx < currentStepIndex) {
          const connector = document.getElementById(`connector-${step}`);
          if (connector) connector.className = "step-connector flex-grow h-1 bg-dvNeon";
        }
      } else {
        el.querySelector('.step-circle').className = "step-circle w-10 h-10 rounded-full bg-white/10 text-gray-500 flex items-center justify-center font-bold border border-white/10";
        el.querySelector('.step-label').className = "step-label text-sm font-bold text-gray-500 mt-2";
      }
    }
  });

  renderFileList(order.files);
}


// ─────────────────────────────────────────────────────
// 歷史檔案清單渲染
// ─────────────────────────────────────────────────────
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

  if (window.lucide) lucide.createIcons();
}
