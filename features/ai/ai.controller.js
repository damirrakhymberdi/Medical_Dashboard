import { renderAiPage, renderAiPatientRow } from "./ai.view.js";
import { searchPatients, getPatientById } from "../../core/api.js";
import { openModal } from "../../ui/modal.js";

export async function mountAiPage() {
  const page = document.getElementById("page-content");
  page.innerHTML = '<div style="padding: 20px;">Загрузка...</div>';
  
  // URL-дан пациенттің ID-ін оқу (мысалы: #ai?patient=p1)
  const hashParts = window.location.hash.split("?patient=");
  const patientId = hashParts.length > 1 ? hashParts[1] : null;
  
  let patientData = null;
  let allPatients = [];

  if (patientId) {
    try {
      patientData = await getPatientById(patientId);
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      allPatients = await searchPatients();
    } catch(e) {
      console.error(e);
    }
  }
  
  page.innerHTML = renderAiPage({ patientId, patientData, allPatients });

  // Запись түймесіне кішкене интерактив (тоқтату/қосу)
  const recordBtn = document.getElementById("startRecordingBtn");
  const aiSpinner = document.getElementById("aiSpinner");
  const aiStatus = document.getElementById("aiStatus");
  
  if (recordBtn) {
    let isRecording = true;
    recordBtn.addEventListener("click", () => {
      isRecording = !isRecording;
      if (isRecording) {
        recordBtn.innerHTML = '<span style="width: 10px; height: 10px; background: white; border-radius: 50%; display: inline-block; animation: pulse-red 2s infinite;"></span> Слушать прием (Запись голоса)';
        recordBtn.style.background = "#ef4444";
        if (aiSpinner) aiSpinner.style.display = "inline-block";
        if (aiStatus) aiStatus.textContent = "Слушаю...";
      } else {
        recordBtn.innerHTML = '▶️ Продолжить запись';
        recordBtn.style.background = "var(--primary)";
        if (aiSpinner) aiSpinner.style.display = "none";
        if (aiStatus) aiStatus.textContent = "На паузе";
      }
    });
  }

  // Поиск пациенттерді фильтрлеу (card markup from view)
  const searchInput = page.querySelector('#aiPatientSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const listContainer = page.querySelector('#aiPatientList');
      if (listContainer) {
        const filtered = allPatients.filter(
          p => !q || p.name.toLowerCase().includes(q) || String(p.phone || '').includes(q)
        );
        listContainer.innerHTML = filtered.length
          ? filtered.map(p => renderAiPatientRow(p)).join('')
          : '<div class="ai-patient-list-empty">Пациенты не найдены</div>';
      }
    });
  }

  // PDF & eGov Sign logic
  const generatePdfBtn = document.getElementById("generatePdfBtn");
  const egovSignBtn = document.getElementById("egovSignBtn");
  const finishVisitBtn = document.getElementById("finishVisitBtn");

  if (generatePdfBtn) {
    generatePdfBtn.addEventListener("click", () => {
      openModal({
        title: "Экспорт в PDF",
        content: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 40px; margin-bottom: 16px;">📄</div>
            <h3 style="margin-bottom: 12px; font-weight: 600;">Амбулаторная карта формируется...</h3>
            <p style="color: var(--muted); font-size: 13px; margin-bottom: 24px;">AI собирает все данные, протоколы и диагнозы в официальный формат Минздрава РК (Форма №043/у).</p>
            <div class="spinner" style="margin: 0 auto 20px auto; width: 24px; height: 24px; border-color: var(--primary); border-right-color: transparent;"></div>
          </div>
        `
      });

      // Имитация загрузки и скачивания
      setTimeout(() => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
          modalBody.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 40px; margin-bottom: 16px; color: var(--success);">✅</div>
              <h3 style="margin-bottom: 12px; font-weight: 600;">PDF успешно сформирован</h3>
              <p style="color: var(--muted); font-size: 13px; margin-bottom: 24px;">Документ автоматически сохранен в карту пациента и скачан на ваше устройство.</p>
              <button class="btn btn-secondary modal-close-btn" style="width: 100%;">Закрыть</button>
            </div>
          `;
          modalBody.querySelector('.modal-close-btn').addEventListener('click', () => {
            document.querySelector('.modal-close').click();
          });
        }
      }, 2000);
    });
  }

  if (egovSignBtn) {
    egovSignBtn.addEventListener("click", () => {
      openModal({
        title: "Подписание через eGov (ЭЦП)",
        content: `
          <div style="padding: 10px;">
            <p style="color: var(--muted); font-size: 13px; margin-bottom: 16px;">Пожалуйста, выберите ваш сертификат ЭЦП (GOST) для подписания амбулаторной карты.</p>
            <div style="border: 1px dashed var(--border-strong); border-radius: var(--radius); padding: 30px; text-align: center; cursor: pointer; background: var(--surface-2); margin-bottom: 20px;" id="selectEcpArea">
               <div style="font-size: 24px; margin-bottom: 8px;">🔑</div>
               <div style="font-weight: 600; font-size: 14px; color: var(--primary);">Выбрать файл ЭЦП</div>
               <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">.p12 или .cer</div>
            </div>
            <div id="ecpPasswordArea" style="display: none;">
              <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 8px;">Пароль от хранилища ключей:</label>
              <input type="password" class="input" placeholder="Введите пароль..." style="width: 100%; margin-bottom: 16px;" value="123456" />
              <button class="btn" id="signDocumentBtn" style="width: 100%; background: var(--primary); color: white;">Подписать документ</button>
            </div>
          </div>
        `
      });

      const selectEcpArea = document.getElementById("selectEcpArea");
      const ecpPasswordArea = document.getElementById("ecpPasswordArea");

      selectEcpArea?.addEventListener("click", () => {
        selectEcpArea.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span style="color: var(--success);">✔️</span>
            <span style="font-weight: 600; font-size: 13px;">GOSTKNCA_xxxxxxxx.p12 выбран</span>
          </div>
        `;
        selectEcpArea.style.borderColor = "var(--success)";
        selectEcpArea.style.background = "rgba(16, 185, 129, 0.05)";
        ecpPasswordArea.style.display = "block";
      });

      document.getElementById("signDocumentBtn")?.addEventListener("click", () => {
        const signBtn = document.getElementById("signDocumentBtn");
        signBtn.innerHTML = '<div class="spinner" style="width: 14px; height: 14px; border-color: white; border-right-color: transparent;"></div> Подписание...';
        signBtn.style.opacity = "0.7";
        
        setTimeout(() => {
          const modalBody = document.querySelector('.modal-body');
          if (modalBody) {
            modalBody.innerHTML = `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 40px; margin-bottom: 16px; color: var(--success);">📜✅</div>
                <h3 style="margin-bottom: 12px; font-weight: 600;">Документ подписан (eGov)</h3>
                <p style="color: var(--muted); font-size: 13px; margin-bottom: 24px;">Юридическая сила документа подтверждена. Хэш подписи: <b>a8f5...e9b1</b></p>
                <button class="btn btn-secondary modal-close-btn" style="width: 100%;">Готово</button>
              </div>
            `;
            modalBody.querySelector('.modal-close-btn').addEventListener('click', () => {
              document.querySelector('.modal-close').click();
              
              // Обновляем кнопку на главном экране
              const mainEgovBtn = document.getElementById("egovSignBtn");
              if (mainEgovBtn) {
                mainEgovBtn.innerHTML = "✅ Подписано ЭЦП";
                mainEgovBtn.style.background = "rgba(16, 185, 129, 0.1)";
                mainEgovBtn.style.borderColor = "var(--success)";
                mainEgovBtn.style.color = "var(--success)";
                mainEgovBtn.style.pointerEvents = "none";
              }
            });
          }
        }, 1500);
      });
    });
  }

  if (finishVisitBtn) {
    finishVisitBtn.addEventListener("click", () => {
      finishVisitBtn.innerHTML = '<div class="spinner" style="width: 14px; height: 14px; border-color: white; border-right-color: transparent;"></div> Сохранение...';
      
      setTimeout(() => {
        finishVisitBtn.innerHTML = "✅ Прием завершен и материалы списаны";
        finishVisitBtn.style.background = "var(--success)";
        finishVisitBtn.style.opacity = "0.8";
        finishVisitBtn.style.pointerEvents = "none";
        
        // Показываем небольшое уведомление снизу
        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.background = "var(--surface)";
        toast.style.border = "1px solid var(--border)";
        toast.style.boxShadow = "var(--shadow-lg)";
        toast.style.padding = "16px";
        toast.style.borderRadius = "var(--radius)";
        toast.style.zIndex = "9999";
        toast.style.display = "flex";
        toast.style.alignItems = "center";
        toast.style.gap = "12px";
        toast.innerHTML = `
          <div style="font-size: 24px;">📦</div>
          <div>
            <div style="font-weight: 600; font-size: 14px;">Автосписание со склада</div>
            <div style="font-size: 12px; color: var(--muted);">Списано: Ultracain (1), Filtek Z250 (1)</div>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 4000);
        
      }, 1000);
    });
  }
}
