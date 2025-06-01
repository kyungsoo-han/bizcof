// search.js

// 객체를 쿼리 문자열로 변환하는 유틸리티 함수


// ajax로 처리
/*
export function Search(apiUrl, params, gridComponent) {
    const { dataProvider, gridView } = gridComponent;

    $.ajax({
        method: "GET",
        url: `${sessionStorage.getItem("serverUrl")}/${apiUrl}`,
        /!*url: `${sessionStorage.getItem("serverUrl")}/${apiUrl}?${queryString}`, // 쿼리 문자열 추가(AZZ001)*!/
        data: params,
        contentType: 'application/json',
        datatype: JSON,
        success: (data) => {
            if (data) {
                dataProvider.fillJsonData(data.data, {}); // 데이터 채우기
                gridView.closeLoading(); // 로딩창 닫기
            } else {
                alert("조회하신 내역이 없습니다.");
            }
        },
        error: () => {
            alert("조회 중 오류가 발생했습니다.");
        },
    });
}
*/

// Search 함수
export async function Search(apiUrl, params, gridComponent) {
    const queryString = params ? `?${toQueryString(params)}` : ''; // 쿼리 문자열 생성
    const { dataProvider, gridView } = gridComponent;

    try {
        // Fetch API 호출
            const response = await fetch(`${apiUrl}${queryString}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 응답 처리
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
            dataProvider.fillJsonData(data.data, {}); // 데이터 채우기
            gridView.closeLoading(); // 로딩창 닫기
        } else {
            alert("조회하신 내역이 없습니다.");
        }
    } catch (error) {
        console.error("Error during fetch:", error);
        alert("조회 중 오류가 발생했습니다.");
    }
}
