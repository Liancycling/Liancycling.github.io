// Firebase SDK 配置與初始化
// 貼心提醒：此 config 項目可安全地放在前端，但實際安全規則需要在 Firebase 控制台設置好。

const firebaseConfig = {
  // 請在此填入您的 Firebase 專案設定網頁應用程式配置項目 (Web App Config)
  apiKey: "YOUR_API_KEY",
  authDomain: "dalab-ae4d7.firebaseapp.com",
  projectId: "dalab-ae4d7",
  storageBucket: "dalab-ae4d7.appspot.com",
  messagingSenderId: "1030780337201",
  appId: "YOUR_APP_ID"
};

// 檢測是否已配置真實金鑰，否則在 dashboard.html 中自動走展示/本地 LocalStorage 模擬模式
let isFirebaseInitialized = false;
let auth = null;
let db = null;

if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    isFirebaseInitialized = true;
    console.log("Firebase App initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
  }
} else {
  console.log("Using Mock/LocalStorage mode for local testing. Define Firebase config when deploying to production.");
}
