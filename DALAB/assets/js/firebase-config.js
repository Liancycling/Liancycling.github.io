// ================================================================
// Firebase SDK 配置與初始化
// 使用 v8 相容 CDN 格式（適用於純 HTML 靜態網站）
// 此金鑰可安全放在前端，請在 Firebase Console 設置好安全規則。
// ================================================================

const firebaseConfig = {
  apiKey: "AIzaSyB3ldt87CpJLI92m_AQUo2eZT4zQznSM54",
  authDomain: "dalab-ae4d7.firebaseapp.com",
  projectId: "dalab-ae4d7",
  storageBucket: "dalab-ae4d7.firebasestorage.app",
  messagingSenderId: "1030780337201",
  appId: "1:1030780337201:web:2f96e29cc1714b17002910"
};

// ── 初始化 Firebase ──────────────────────────────────────────────
let isFirebaseInitialized = false;
let auth = null;
let db = null;

if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db   = firebase.firestore();
    isFirebaseInitialized = true;
    console.log("✅ Firebase 初始化成功 - 專案：dalab-ae4d7");
  } catch (e) {
    console.error("❌ Firebase 初始化失敗:", e.message);
  }
} else {
  console.warn("⚠️ Firebase SDK 未載入，已切換至 Demo/LocalStorage 模擬模式。");
}
