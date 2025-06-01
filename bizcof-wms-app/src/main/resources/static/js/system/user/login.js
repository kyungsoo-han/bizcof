import { FetchApi } from "../../common/fetch-api.js";

async function login() {
    const loginId = document.getElementById("loginId").value;
    const password = document.getElementById("password").value;

    try {
        const response = await FetchApi("/api/system/user/login", "POST", { loginId, password });
        if (response) {
            sessionStorage.setItem("accessToken", response.token);
            sessionStorage.setItem("userName", response.data.userName);
            console.log(response);
            console.log(response.data.userName);
            window.location.href = "/";
        } else {
            alert("로그인 실패!");
        }
    } catch (error) {
        alert("로그인 요청 중 오류 발생!");
        console.error("Login Error:", error);
    }
}

// 로그인 폼에서 호출할 수 있도록 전역으로 등록
window.login = login;