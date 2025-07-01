// Configuration file for API keys and external services
const CONFIG = {
  // Kakao Share API
  KAKAO_APP_KEY: "ffedd29f24efc642832be656deca1820",

  // Google AdSense
  GOOGLE_ADSENSE_CLIENT: "ca-pub-5063634047102858",
  GOOGLE_ADSENSE_SLOT: "your-ad-slot-id",

  // App Settings
  APP_NAME: "직장 성향 테스트",
  APP_URL: window.location.origin,

  // Social Share Settings
  SHARE_TITLE: "회사에서 나의 모습은? - 직장 성향 테스트",
  SHARE_DESCRIPTION: "12가지 일상 속 상황으로 알아보는 나의 직장 캐릭터!",
  SHARE_IMAGE: "/images/share-image.jpg", // Add your share image path

  // Chart Colors
  CHART_COLORS: {
    primary: "#007bff",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
    info: "#17a2b8",
  },
};

// Initialize Kakao SDK
if (
  typeof Kakao !== "undefined" &&
  CONFIG.KAKAO_APP_KEY !== "47b7488df68269cfbaa50c50b8d332bc"
) {
  Kakao.init(CONFIG.KAKAO_APP_KEY);
}

// Initialize Google AdSense
if (CONFIG.GOOGLE_ADSENSE_CLIENT !== "ca-pub-5063634047102858") {
  window.addEventListener("load", function () {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: CONFIG.GOOGLE_ADSENSE_CLIENT,
        enable_page_level_ads: true,
      });
    } catch (e) {
      console.log("AdSense not loaded:", e);
    }
  });
}
