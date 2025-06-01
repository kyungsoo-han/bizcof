// /static/js/common/modal-helper.js

/**
 * 공통 모달 로더
 * @param {string} url - 모달 HTML 경로
 * @param {string} modalId - 모달 ID
 * @param {function} onResult - 콜백 함수 (결과 데이터 반환)
 * @param {string} containerId - 모달 삽입 위치
 * @param {object} options - 추가 옵션 (onShown, triggerSelector 등)
 */
export async function ModalLoader(url, modalId, onResult, containerId = "commonModalContainer", options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Modal container #${containerId} not found.`);
    return;
  }

  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    $(`#${modalId}`).modal("hide");
    return;
  }

  try {
    const modalHtml = await fetch(url).then(res => res.text());
    container.innerHTML = modalHtml;

    const $modal = $(`#${modalId}`);

    const modalDialog = $modal.find(".modal-dialog")[0];  // 모달창 사이즈 동적 조정
    if (modalDialog && options.modalWidth) {
      modalDialog.style.maxWidth = options.modalWidth;
    }

    const $parentModal = $(".modal.show").last();

    if ($parentModal.length > 0) {
      $parentModal.addClass("modal-static modal-faded");
    }

    $modal.css("display", "block").css("visibility", "hidden");

    const modalScope = { onResult }; // ✅ 전역이 아닌 로컬 스코프 콜백 저장

    if (typeof options.onShown === "function") {
      options.onShown(modalScope); // onShown에 scope 전달
    }

    setTimeout(() => {
      $modal.css("visibility", "visible");
      //$modal.modal("show");
      let backdropOption = options.backdrop;
      let keyboardOption = options.keyboard;

      if (backdropOption === true) {
        backdropOption = 'static';
        keyboardOption = false;
      }

      // 🧩 모달 실행
      $modal.modal({
        backdrop: backdropOption ?? true,
        keyboard: keyboardOption ?? true
      });
    }, 0);

    $modal.on("hide.bs.modal", () => {
      document.activeElement.blur();
      document.body.focus();
    });

    $modal.on("hidden.bs.modal", () => {
      container.innerHTML = "";

      if ($parentModal.length > 0) {
        $parentModal.removeClass("modal-static modal-faded");

        // 🔽 상위 모달이 열려있다면 다시 modal-open 추가
        if (!$(".modal.show").length) {
          document.body.classList.remove("modal-open");
        } else {
          document.body.classList.add("modal-open");
        }
      }
    });

    const triggerSelector = options.triggerSelector || "#btnConfirm";
    const triggerBtn = document.querySelector(`#${modalId} ${triggerSelector}`);
    if (triggerBtn && typeof onResult === "function") {
      triggerBtn.addEventListener("click", async () => {
        const result = await onResult();
        if (result) {
          $modal.modal("hide");
          if (typeof options.onResult === "function") {
            options.onResult(result);
          }
        }
      });
    }

    $(document).on("click", `#${modalId} #btnModalClose`, function () {
      $modal.modal("hide");
    });

  } catch (e) {
    console.error("Modal load failed:", e);
  }
}

/**
 * API 호출 함수 (POST)
 * @param {string} url - 요청 URL
 * @param {object} data - 전송할 JSON 데이터
 * @returns {Promise<object>} - 응답 JSON
 */
export async function ModalPostApi(url, data) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error("API 호출 실패:", err);
    throw err;
  }
}
