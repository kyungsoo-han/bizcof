// /js/common/fetch-api.js

/**
 * 공통 Fetch API 호출 유틸
 * - HTTP 메서드(GET/POST 등)에 따라 쿼리 또는 JSON 바디 구성
 * - 서버 URL을 sessionStorage에서 동적으로 가져옴
 * - API 경로 앞에 '/'가 있든 없든 관계없이 처리
 *
 * @param {string} url - 요청할 API 경로 (예: '/api/item/list' 또는 'api/item/list')
 * @param {string} [method='GET'] - HTTP 메서드 (GET, POST 등)
 * @param {Object|null} [params=null] - 요청 파라미터 (GET: 쿼리스트링, POST: JSON 바디)
 * @returns {Promise<Object>} - JSON 형태의 응답 객체
 */
export async function FetchApi(url, method = "GET", params = null) {
    try {
        // 1. 기본 옵션 설정
        const options = {
            method, headers: {
                "Content-Type": "application/json"
            }
        };

        // 2. 요청 URL 정리
        // - sessionStorage에서 serverUrl을 가져오고, 없으면 현재 도메인 사용
        const baseUrl = "";
        const cleanedBase = baseUrl.replace(/\/+$/, ""); // 끝 슬래시 제거
        const cleanedPath = url.replace(/^\/+/, "");     // 앞 슬래시 제거
        let fullUrl = `${cleanedBase}/${cleanedPath}`;   // 최종 URL 조립

        // 3. 요청 파라미터 처리
        if (method.toUpperCase() === "GET" && params) {
            // GET 요청인 경우: 쿼리 문자열 추가
            const queryString = toQueryString(params);
            fullUrl += `?${queryString}`;
        } else if (params) {
            // POST, PUT 등의 경우: JSON body로 전달
            options.body = JSON.stringify(params);
        }

        // 4. Fetch API 호출
        const response = await fetch(fullUrl, options);

        // 5. 응답 실패 처리
        // if (!response.ok) {
        //     let errorMessage = `HTTP error! status: ${response.status}`;
        //     try {
        //         const errorBody = await response.json();  // JSON 형태로 파싱
        //         errorMessage = errorBody.message || errorMessage;
        //         console.error("서버 응답 에러:", errorBody); // 전체 출력도 가능
        //     } catch (jsonError) {
        //         console.warn("에러 응답 본문을 JSON으로 파싱할 수 없습니다.");
        //     }
        //
        //     throw new Error(errorMessage);  // 사용자 정의 메시지 포함
        // }

        // 6. 결과 반환 (JSON 파싱)
        return await response.json();

    } catch (error) {
        console.error("FetchApi fetch error:", {
            url, method, params, error
        });
        throw error; // 상위 로직에서 처리할 수 있도록 재던짐
    }
}

function toQueryString(params) {
    return Object.keys(params)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
}