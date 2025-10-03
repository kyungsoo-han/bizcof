const isLocalhost = window.location.hostname === 'localhost';
const serverUrl = isLocalhost ? 'http://localhost:30011' : 'http://180.69.179.62:30011';

const token = sessionStorage.getItem("accessToken");
const userName = sessionStorage.getItem("userName");
const username = document.getElementById("username");
const logoutStr = document.getElementById("logout-str");
const loginLink = document.getElementById("login-link");
const signupLink = document.getElementById("signup-link");
let loadingTimeout = null;


if (token != null) {
    username.textContent = userName + '님 반갑습니다.';
    logoutStr.textContent = "로그아웃";
} else {
    // loginLink.textContent = "로그인";
    // signupLink.textContent = "회원가입";
    window.location.replace("/login");
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

sessionStorage.setItem("serverUrl", serverUrl);

// 로딩 오버레이 표시 함수
function showGlobalLoading() {
  const overlay = document.getElementById("globalLoadingOverlay");
  if (overlay) overlay.style.display = "block";

    // 기존 타임아웃이 있다면 초기화
  if (loadingTimeout) clearTimeout(loadingTimeout);

  // 5초 후 자동으로 닫히는 타임아웃 설정
  loadingTimeout = setTimeout(() => {
    hideGlobalLoading();
  }, 3000); // 5000ms = 5초
}

function hideGlobalLoading() {
  const overlay = document.getElementById("globalLoadingOverlay");
  if (overlay) overlay.style.display = "none";

    // 닫히면 타임아웃도 제거
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
}

// iframe 메뉴 클릭 시 로딩창 표시
$(document).on("click", "[data-widget='iframe']", function (e) {
  const $link = $(this);
  const href = $link.attr("href");

  if (!href || href === "#") return;

  // 현재 열려있는 iframe 중 동일한 src가 있는지 확인
  const isAlreadyOpen = Array.from(document.querySelectorAll("iframe"))
    .some(iframe => iframe.src.includes(href));

  // 이미 열린게 아니라면 로딩창 표시
  if (!isAlreadyOpen) {
    showGlobalLoading();
  }
});

// iframe 내부에서 postMessage로 메시지 보내면 로딩창 닫기
window.addEventListener("message", function (event) {
  if (event.data === "iframe-loaded") {
    hideGlobalLoading();
  }
});

