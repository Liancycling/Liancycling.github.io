// Firebase SDK 配置與初始化
// ⚠️ 安全提醒：此 config 可安全地放在前端，但請在 Firebase Console 設置好 Auth/Firestore 安全規則。

const firebaseConfig = {
  apiKey: "AIzaSyB3ldt87CpJLI92m_AQUo2eZT4zQznSM54",
  authDomain: "dalab-ae4d7.firebaseapp.com",
  projectId: "dalab-ae4d7",
  storageBucket: "dalab-ae4d7.appspot.com",
  messagingSenderId: "1030780337201",
  appId: "1:1030780337201:web:2f96e29cc1714b17002910"
};

// 初始化 Firebase
let isFirebaseInitialized = false;
let auth = null;
let db = null;

if (typeof firebase !== 'undefined') {
  try {
    // 避免重複初始化
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
    isFirebaseInitialized = true;
    console.log("✅ Firebase 初始化成功 (dalab-ae4d7)");
  } catch (e) {
    console.error("❌ Firebase 初始化失敗:", e);
  }
} else {
  console.warn("⚠️ Firebase SDK 未載入，切換至 Demo/LocalStorage 模擬模式。");
}
