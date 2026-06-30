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
  styleModelId: "DV-TSHIRT-008",
  designDraftUrl: "assets/img/feather_tech.png",
  designDraftName: "極地黑拼貼撞色T-Shirt設計圖",
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
            styleModelId: "待指定 (請提交草圖)",
            designDraftUrl: "",
            designDraftName: "尚未上傳正式設計圖",
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

  // ── 合稿連結提交與 AI 檔案上傳 ──
  const fileForm = document.getElementById('file-submit-form');
  const aiFileInput = document.getElementById('ai-file-input');
  const aiFileNameDisplay = document.getElementById('ai-file-name-display');
  const aiFileUploadBtn = document.getElementById('ai-file-upload-btn');

  // 當使用者選擇了 AI 檔案，更新顯示的檔名
  if (aiFileInput && aiFileNameDisplay) {
    aiFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        aiFileNameDisplay.textContent = file.name;
        // 檢查大小
        const maxBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxBytes) {
          alert(`⚠️ 您選擇的檔案「${file.name}」大小約 ${(file.size / 1024 / 1024).toFixed(2)}MB，已超過 5MB 的限制。\n請改用上方的「雲端連結」進行提交！`);
          aiFileInput.value = '';
          aiFileNameDisplay.textContent = "超過 5MB 限制，請清除";
        }
      } else {
        aiFileNameDisplay.textContent = "未選擇任何檔案";
      }
    });
  }

  // 共用發送合稿通知信與寫入後端試算表的輔助函式
  async function triggerFileSubmissionEvent(fileName, fileUrlOrData) {
    let email = "guest@davillage.com.tw";
    let name = "會員顧客";
    
    if (isFirebaseInitialized && auth.currentUser) {
      email = auth.currentUser.email;
      try {
        const udoc = await db.collection("users").doc(auth.currentUser.uid).get();
        if (udoc.exists && udoc.data().name) {
          name = udoc.data().name;
        }
      } catch (err) {
        console.error("讀取用戶資訊出錯:", err);
      }
    } else {
      const savedU = JSON.parse(localStorage.getItem('dalab_mock_user') || '{}');
      if (savedU.name) name = savedU.name;
      if (savedU.email) email = savedU.email;
    }

    const scriptUrl = "https://script.google.com/macros/s/AKfycbzz5B_bcg9C-hXvfnxRS3ZLQhkDE-69EKO-3Zy5LyePzfMYpc9RR2AH0TXE_oJgDbEC-g/exec";
    
    // 組裝上傳日誌荷載
    const payload = {
      action: "submitDesignFile",
      email: email,
      name: name,
      fileName: fileName,
      fileUrl: fileUrlOrData,
      timestamp: new Date().toISOString()
    };

    console.log("[API 請求] 送出合稿提交通知...", payload);

    try {
      // 呼叫 Google Apps Script 完成試算表寫入與雙向發信
      fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors", // 避免 CORS 阻擋
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("發送後台通知信出錯: ", error);
    }
  }

  if (fileForm) {
    fileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const linkInput = document.getElementById('cloud-link');
      if (!linkInput || !linkInput.value.trim()) return;

      const urlValue = linkInput.value.trim();
      const newFile = {
        name: "雲端審稿連結 (已提交)",
        url: urlValue,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      // 觸發通知
      await triggerFileSubmissionEvent("雲端審稿連結", urlValue);

      if (isFirebaseInitialized && auth.currentUser) {
        const user = auth.currentUser;
        db.collection("orders").where("ownerUid", "==", user.uid).get()
          .then(qs => {
            if (!qs.empty) {
              const docRef = qs.docs[0].ref;
              const curFiles = qs.docs[0].data().files || [];
              curFiles.push(newFile);
              docRef.update({ files: curFiles }).then(() => {
                alert('雲端連結提交成功！系統已將資訊同步寫入後端，並寄信通知雙方！');
                location.reload();
              });
            }
          });
      } else {
        MOCK_ORDER.files.push(newFile);
        alert('【模擬模式】雲端連結提交成功！系統已將資訊同步寫入後端，並寄信通知雙方！');
        renderFileList(MOCK_ORDER.files);
        linkInput.value = '';
      }
    });
  }

  // 處理直接上傳 AI 檔案
  if (aiFileUploadBtn) {
    aiFileUploadBtn.addEventListener('click', async () => {
      if (!aiFileInput || !aiFileInput.files[0]) {
        alert("請先選擇要上傳的 .ai 檔案！");
        return;
      }
      const file = aiFileInput.files[0];
      const maxBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxBytes) {
        alert("⚠️ 檔案大小超過 5MB，無法直接上傳，請使用上方的雲端連結提交！");
        return;
      }

      // 將 AI 檔案轉為 Base64 模擬上傳與記錄，並發信
      const base64Data = await fileToBase64(file);
      const newFile = {
        name: `AI 檔案: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        url: "#", // 線上直接記錄
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      // 觸發信件通知與試算表寫入
      await triggerFileSubmissionEvent(`AI設計檔: ${file.name}`, `基於瀏覽器上傳。大小: ${(file.size / 1024).toFixed(1)} KB`);

      if (isFirebaseInitialized && auth.currentUser) {
        const user = auth.currentUser;
        db.collection("orders").where("ownerUid", "==", user.uid).get()
          .then(qs => {
            if (!qs.empty) {
              const docRef = qs.docs[0].ref;
              const curFiles = qs.docs[0].data().files || [];
              curFiles.push(newFile);
              docRef.update({ files: curFiles }).then(() => {
                alert('AI 檔案上傳完成！系統已將資訊同步寫入後端，並發送電子郵件確認信給您與規劃師！');
                location.reload();
              });
            }
          });
      } else {
        MOCK_ORDER.files.push(newFile);
        alert('【模擬模式】AI 檔案上傳完成！系統已將資訊同步寫入後端，並發送電子郵件確認信給您與規劃師！');
        renderFileList(MOCK_ORDER.files);
        aiFileInput.value = '';
        aiFileNameDisplay.textContent = "未選擇任何檔案";
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
  
  // 隱藏頂部登入狀態
  const statusEl = document.getElementById('nav-user-status');
  if (statusEl) statusEl.classList.add('hidden');
}

function showDashboard(order, userName) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');

  // 顯示頂部登入狀態與名稱
  const statusEl = document.getElementById('nav-user-status');
  const nameEl = document.getElementById('nav-user-name');
  if (statusEl && nameEl) {
    nameEl.textContent = userName || "會員";
    statusEl.classList.remove('hidden');
  }

  document.getElementById('user-display-name').textContent = userName || "球隊聯絡人";
  document.getElementById('display-order-id').textContent = order.orderId;
  document.getElementById('order-date').textContent = order.orderDate;
  document.getElementById('working-days').textContent = order.workingDays + " 工作天";
  document.getElementById('delivery-date').textContent = order.estimatedDelivery;
  document.getElementById('logistics-carrier').textContent = order.logistics.carrier;
  document.getElementById('logistics-number').textContent = order.logistics.trackingNumber;
  document.getElementById('logistics-status').textContent = order.logistics.status;

  // 渲染款式編號與設計圖
  const styleEl = document.getElementById('order-style-id');
  if (styleEl) {
    styleEl.textContent = order.styleModelId || "未指定 (請聯絡客服)";
  }

  const draftPreview = document.getElementById('design-draft-preview');
  const draftPlaceholder = document.getElementById('design-draft-placeholder');
  const draftName = document.getElementById('design-draft-name');

  if (order.designDraftUrl) {
    if (draftPreview) {
      draftPreview.src = order.designDraftUrl;
      draftPreview.classList.remove('hidden');
    }
    if (draftPlaceholder) {
      draftPlaceholder.classList.add('hidden');
    }
    if (draftName) {
      draftName.textContent = order.designDraftName || "設計模擬效果圖";
    }
  } else {
    if (draftPreview) draftPreview.classList.add('hidden');
    if (draftPlaceholder) draftPlaceholder.classList.remove('hidden');
    if (draftName) draftName.textContent = "尚未上傳正式設計圖";
  }

  // 步驟文字內容字典
  const stepDetails = {
    "design": {
      title: "第一步：詢價與建立訂單 (Inquiry & Setup)",
      desc: "【目前進度說明】：我們已收到您的詢價單與客製需求，系統已為您建立了專屬的訂單追蹤碼。設計專員正在整理您的客製細節，將於 1-2 工作天內透過信箱或 LINE 聯繫您，確認下一步的設計細部細節。"
    },
    "design_review": {
      title: "第二步：設計與合稿校對 (Design Review)",
      desc: "【目前進度說明】：設計師已完成款式模擬圖。請在此頁面下方提交您的雲端檔案或連結以核對圖樣細節。我們會多次校正至您滿意並簽署「設計確認書」，隨後將正式進入工廠排單量產。"
    },
    "production": {
      title: "第三步：工廠排產與製造 (Factory Production)",
      desc: "【目前進度說明】：訂單已經排程進入生產線。包含面料裁剪、全彩昇華印刷、精細刺繡等工序正在嚴格品管中進行。此階段約需要 10-14 個工作天，敬請耐心等候。"
    },
    "shipping": {
      title: "第四步：物流快遞配送 (Logistics & Shipping)",
      desc: "【目前進度說明】：您的專屬客製商品已通過出廠品檢，妥善包裝完成！目前包裹已交付黑貓宅急便或專屬快遞安排出貨。您可以在左下方「物流狀態」中檢視快遞單號，隨時追蹤您的包裹路徑。"
    },
    "done": {
      title: "第五步：順利收貨結案 (Completed)",
      desc: "【目前進度說明】：包裹已順利送達您指定的收件地址。感謝您選擇 DALAB 客製化實驗室！我們重視您的滿意度，若商品有任何問題，請於收到貨後 7 日內與客服聯繫；若無誤將自動結案。期待下次為您服務！"
    }
  };

  // 渲染訂單進度條與點擊監聽
  const steps = ["design", "design_review", "production", "shipping", "done"];
  const currentStepIndex = steps.indexOf(order.status);

  // 預設顯示當前進度的詳細內容
  const currentStatus = order.status || "design";
  updateStepDetailPanel(currentStatus);

  steps.forEach((step, idx) => {
    const el = document.getElementById(`step-${step}`);
    if (el) {
      // 點擊事件
      el.onclick = () => {
        updateStepDetailPanel(step);
        // 清除其他步驟的高亮，為當前點擊的步驟加上發光框
        steps.forEach(s => {
          const stepEl = document.getElementById(`step-${s}`);
          if (stepEl) {
            stepEl.querySelector('.step-circle').classList.remove('ring-4', 'ring-dvNeon/50');
          }
        });
        el.querySelector('.step-circle').classList.add('ring-4', 'ring-dvNeon/50');
      };

      if (idx <= currentStepIndex) {
        el.querySelector('.step-circle').className = "step-circle w-10 h-10 rounded-full bg-dvNeon text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all";
        el.querySelector('.step-label').className = "step-label text-sm font-bold text-dvNeon mt-2";
        if (idx < currentStepIndex) {
          const connector = document.getElementById(`connector-${step}`);
          if (connector) connector.className = "step-connector flex-grow h-1 bg-dvNeon";
        }
      } else {
        el.querySelector('.step-circle').className = "step-circle w-10 h-10 rounded-full bg-white/10 text-gray-500 flex items-center justify-center font-bold border border-white/10 transition-all";
        el.querySelector('.step-label').className = "step-label text-sm font-bold text-gray-500 mt-2";
      }
    }
  });

  // 特別高亮當前狀態步驟
  const currentStepEl = document.getElementById(`step-${currentStatus}`);
  if (currentStepEl) {
    currentStepEl.querySelector('.step-circle').classList.add('ring-4', 'ring-dvNeon/50');
  }

  function updateStepDetailPanel(stepKey) {
    const info = stepDetails[stepKey];
    if (info) {
      document.getElementById('step-detail-title').textContent = info.title;
      document.getElementById('step-detail-desc').textContent = info.desc;
    }
  }

  renderFileList(order.files);

  // 初始化 AI 智慧助理互動
  initAiAssistant(order);
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

// ─────────────────────────────────────────────────────
// 🧬 DALAB AI 智慧物流助理實作與工具對話邏輯 (對接 Gemini 規格)
// ─────────────────────────────────────────────────────
function initAiAssistant(currentOrder) {
  const sendBtn = document.getElementById('send-ai-btn');
  const userInput = document.getElementById('ai-user-input');
  const quickMyOrderBtn = document.getElementById('quick-my-order-btn');

  if (sendBtn && userInput) {
    sendBtn.onclick = () => handleAiSubmit();
    userInput.onkeypress = (e) => {
      if (e.key === 'Enter') handleAiSubmit();
    };
  }

  if (quickMyOrderBtn) {
    quickMyOrderBtn.onclick = () => {
      triggerQuickAi(`幫我查詢本筆訂單 ${currentOrder.orderId} 的狀態與最新配送物流`);
    };
  }

  // 1. 本地查單號第三方物流 API 模擬 (如使用者規格 runLogisticsAgent & checkLogisticsStatus)
  async function checkLogisticsStatus(args) {
    appendChatLog("[系統呼叫]", `正在向物流 API 查詢單號: ${args.trackingId}`, "system");
    await new Promise(r => setTimeout(r, 800)); // 模擬 API 動態延遲
    
    // 如果單號符合目前的使用者訂單單號
    if (currentOrder && currentOrder.logistics && (args.trackingId.includes(currentOrder.logistics.trackingNumber) || currentOrder.orderId.includes(args.trackingId))) {
      return {
        status: currentOrder.logistics.status,
        carrier: currentOrder.logistics.carrier,
        trackingId: currentOrder.logistics.trackingNumber,
        estimatedDelivery: currentOrder.estimatedDelivery
      };
    }

    // 預設測試單號 SF987654321 或其他單號模擬
    return {
      status: "運輸中",
      currentLocation: "台北分撥中心",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      carrier: "順豐速運",
      trackingId: args.trackingId
    };
  }

  // 2. 模擬 Gemini-2.5-Flash 工具呼叫與對話 (等同前台 API 流程)
  async function runLogisticsAgentSimulate(userPrompt) {
    appendChatLog("[會員]", userPrompt, "user");
    
    // 解析 prompt 中是否包含單號
    const trackingMatch = userPrompt.match(/(SF\d+|9\d{9}|\d{8,12})/i);
    const orderMatch = userPrompt.match(/DL-\d{4}-\d{4}/i);
    
    await new Promise(r => setTimeout(r, 600)); // AI 思考延遲

    if (trackingMatch || orderMatch || userPrompt.includes("查") || userPrompt.includes("單號") || userPrompt.includes("包裹")) {
      const trackingId = trackingMatch ? trackingMatch[0] : (orderMatch ? orderMatch[0] : (currentOrder.logistics.trackingNumber || "SF987654321"));
      
      // 觸發 Function Call 系統訊息
      const apiResponseData = await checkLogisticsStatus({ trackingId });
      
      await new Promise(r => setTimeout(r, 500));
      
      // 模擬 AI 整理成親切的話語回覆
      let reply = "";
      if (apiResponseData.trackingId === currentOrder.logistics.trackingNumber) {
        reply = `好的！我為您查詢到目前本筆訂單的大貨狀態為：【${apiResponseData.status}】，物流商為【${apiResponseData.carrier}】，預計送達日期是 ${apiResponseData.estimatedDelivery}。請隨時留意您的收件電話。`;
      } else {
        reply = `我已經使用 [checkLogisticsStatus] 幫您查詢了單號【${apiResponseData.trackingId}】。目前狀態為：【${apiResponseData.status}】，包裹最新位置在【${apiResponseData.currentLocation}】，預計會在 ${apiResponseData.estimatedDelivery} 送達。`;
      }
      
      appendChatLog("[AI 助理]", reply, "ai");
    } else {
      // 一般問候與閒聊
      const greetings = [
        "您好！我是您的 DALAB AI 智慧物流助理。您可以輸入物流單號（例如：SF987654321）或詢問訂單狀態，我會即時為您向物流 API 進行查詢！",
        "哈囉！需要我幫您查詢包裹動態或是生產工作天嗎？請隨時告訴我。",
        "嗨！有什麼我可以幫忙的？您可以直接貼上您的快遞託運單號進行查詢。"
      ];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      appendChatLog("[AI 助理]", randomReply, "ai");
    }
  }

  async function handleAiSubmit() {
    const prompt = userInput.value.trim();
    if (!prompt) return;
    userInput.value = '';
    await runLogisticsAgentSimulate(prompt);
  }

  // 暴露快速觸發接口到全域 window
  window.triggerQuickAi = async function(promptText) {
    const chatBox = document.getElementById('ai-chat-box');
    if (chatBox) chatBox.innerHTML = ''; // 清空方便展示
    await runLogisticsAgentSimulate(promptText);
  };
}

function appendChatLog(sender, text, type) {
  const chatBox = document.getElementById('ai-chat-box');
  if (!chatBox) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = "text-left";
  
  if (type === "system") {
    msgDiv.innerHTML = `<span class="text-blue-400 font-bold">${sender}</span> <span class="text-blue-300 italic">${text}</span>`;
  } else if (type === "user") {
    msgDiv.innerHTML = `<span class="text-white/60 font-bold">${sender}</span> <span class="text-white font-mono">${text}</span>`;
  } else if (type === "ai") {
    msgDiv.innerHTML = `<span class="text-dvNeon font-bold">${sender}</span> <span class="text-gray-300 font-sans">${text}</span>`;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

