function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** One patient row for the select list (used in view and controller) */
export function renderAiPatientRow(p) {
  return `
    <div class="ai-patient-card" data-patient-id="${escapeHtml(p.id)}" onclick="window.location.hash='#ai?patient=${escapeHtml(p.id)}'">
      <div class="ai-patient-card-main">
        <div class="ai-patient-card-name">${escapeHtml(p.name)}</div>
        <div class="ai-patient-card-meta">Зарегистрирован: ${escapeHtml(p.createdAt || "—")} • ${escapeHtml(p.phone)}</div>
      </div>
      <button type="button" class="ai-patient-card-btn" onclick="event.stopPropagation(); window.location.hash='#ai?patient=${escapeHtml(p.id)}'">Выбрать</button>
    </div>
  `;
}

export function renderAiPage({ patientId, patientData, allPatients = [] } = {}) {
  // Нағыз жүйеге ұқсату үшін, егер patientId берілмесе (дәрігер тікелей мәзірден кірсе),
  // біз оған "Пациентті таңдаңыз" деген бетті көрсетеміз.
  if (!patientId) {
    const patientsListHtml = allPatients.length
      ? allPatients.map(p => renderAiPatientRow(p)).join('')
      : '<div class="ai-patient-list-empty">Пациенты не найдены</div>';

    return `
      <div class="ai-select-page">
        <header class="ai-select-page-header">
          <h1 class="ai-select-page-title">AI Clinical Assistant</h1>
          <p class="ai-select-page-subtitle">Автопротоколирование, МКБ-10 и анализ истории</p>
        </header>
        <!-- Hero: strong hierarchy, left-aligned -->
        <div class="ai-select-hero">
          <div class="ai-select-hero-icon" aria-hidden="true"></div>
          <div class="ai-select-hero-text">
            <h1 class="ai-select-hero-title">Выберите пациента для приема</h1>
            <p class="ai-select-hero-desc">Чтобы AI-ассистент начал слушать и писать протокол, выберите пациента из базы.</p>
          </div>
        </div>

        <!-- Search: full width, large, modern -->
        <div class="ai-select-search-wrap">
          <svg class="ai-select-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="aiPatientSearch" class="ai-select-search-input" placeholder="Поиск по имени или телефону..." autocomplete="off" />
        </div>

        <!-- Patient list: card-style rows -->
        <div class="ai-select-list-section">
          <h2 class="ai-select-list-title">Найденные пациенты</h2>
          <div id="aiPatientList" class="ai-patient-list">
            ${patientsListHtml}
          </div>
        </div>
      </div>
    `;
  }

  // Егер пациент таңдалған болса
  const patientName = patientData ? patientData.name : "Неизвестный пациент";
  const patientPhone = patientData ? patientData.phone : "Нет телефона";
  
  return `
    <div class="report-container" style="padding: 20px; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
      
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
            <img src="/assets/images/Medimetricslogotype.png" alt="MediMetrics" style="width: 40px; height: 40px;"> <span style="font-size: 21px;">AI Clinical Assistant</span>
          </h1>
          <p style="color: var(--muted); margin: 0; font-size: 14px;">Автопротоколирование, МКБ-10 и анализ истории</p>
        </div>
        <div style="display: flex; gap: 12px;">
           <button class="btn btn-secondary" onclick="window.location.hash='#ai'" style="display: flex; align-items: center; gap: 6px;">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
             Сменить пациента
           </button>
           <button class="btn" id="startRecordingBtn" style="background: #ef4444; color: white; display: flex; align-items: center; gap: 8px; border: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
             <span style="width: 10px; height: 10px; background: white; border-radius: 50%; display: inline-block; animation: pulse-red 2s infinite;"></span>
             Слушать прием (Запись голоса)
           </button>
        </div>
      </div>

      <style>
        @keyframes pulse-red {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; align-items: start;">
        
        <!-- LEFT: Patient & Tooth -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Patient Summary -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-weight: 700; font-size: 16px;">${patientName}</div>
                <div style="font-size: 12px; color: var(--muted);">Взрослый • ${patientPhone}</div>
              </div>
              <div class="badge" style="background: var(--primary-100); color: var(--primary-700);">Риск: Низкий</div>
            </div>
            
            <div style="background: var(--surface-2); padding: 12px; border-radius: 8px; font-size: 13px; color: var(--text); line-height: 1.5; margin-bottom: 12px; border: 1px solid var(--border);">
              <div style="font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 4px;">✨ AI-Summary пациента</div>
              Аллергий нет. Последний визит 6 месяцев назад (чистка). В прошлом лечился пульпит зуба 46. Возможна чувствительность эмали.
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
               <span class="badge" style="background: rgba(245, 158, 11, 0.1); color: #d97706; border-color: rgba(245, 158, 11, 0.2);">⚠️ Жалоба: боль в 1.6</span>
               <span class="badge" style="background: rgba(14, 165, 233, 0.1); color: #0ea5e9; border-color: rgba(14, 165, 233, 0.2);">ℹ️ МКБ-10: K02.1</span>
            </div>
          </div>

          <!-- Tooth Formula & 3D Model -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm);">
            
            <!-- 3D Model Mini Widget -->
            <div style="margin-bottom: 16px; background: #111; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <div style="position: absolute; bottom: 8px; left: 8px; display: flex; gap: 4px;">
                <span class="badge" style="background: rgba(255,255,255,0.2); color: white; font-size: 10px; border: none;">3D-Снимок</span>
                <span class="badge" style="background: rgba(255,255,255,0.2); color: white; font-size: 10px; border: none;">ОПТГ</span>
              </div>
            </div>

            <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px;">Зубная формула</div>
            <div style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 2px; text-align: center;">
               <!-- 18 to 28 -->
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">18</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">17</div>
               <div style="padding: 6px 2px; background: rgba(220, 38, 38, 0.1); border: 1px solid #fca5a5; color: #dc2626; font-weight: 700; font-size: 10px; border-radius: 3px;">16</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">15</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">14</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">13</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">12</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">11</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">21</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">22</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">23</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">24</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">25</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">26</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">27</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px;">28</div>
               
               <!-- 48 to 38 -->
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">48</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">47</div>
               <div style="padding: 6px 2px; background: rgba(59, 130, 246, 0.1); border: 1px solid #93c5fd; color: #2563eb; font-weight: 700; font-size: 10px; border-radius: 3px; margin-top: 4px;">46</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">45</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">44</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">43</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">42</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">41</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">31</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">32</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">33</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">34</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">35</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">36</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">37</div>
               <div style="padding: 6px 2px; background: var(--surface-2); font-size: 10px; border-radius: 3px; margin-top: 4px;">38</div>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 16px; font-size: 11px; color: var(--muted); align-items: center; justify-content: center;">
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 10px; height: 10px; background: rgba(220, 38, 38, 0.1); border: 1px solid #fca5a5; border-radius: 2px;"></div> Кариес</div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 10px; height: 10px; background: rgba(59, 130, 246, 0.1); border: 1px solid #93c5fd; border-radius: 2px;"></div> Пломба</div>
            </div>
          </div>

        </div>

        <!-- RIGHT: AI Auto Protocol -->
        <div style="background: var(--surface); border: 2px solid var(--primary-100); border-radius: var(--radius); padding: 20px; box-shadow: 0 8px 30px rgba(37, 99, 235, 0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
             <div style="display: flex; align-items: center; gap: 8px;">
               <div class="spinner" id="aiSpinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
               <span style="font-weight: 700; color: var(--primary); font-size: 15px;">AI-Автопротокол</span>
             </div>
             <span id="aiStatus" style="font-size: 11px; color: var(--muted); background: var(--surface-2); padding: 4px 8px; border-radius: 4px;">Слушаю...</span>
          </div>
          
          <div class="visit-form" style="gap: 12px;">
            <div>
              <label style="font-size: 11px; color: var(--muted); text-transform: uppercase;">Жалобы (Из аудио)</label>
              <textarea class="input" style="min-height: 50px; font-size: 13px; margin-top: 4px;">Боль в верхней челюсти справа при приеме холодной пищи. Ноет со вчерашнего дня.</textarea>
            </div>
            <div>
              <label style="font-size: 11px; color: var(--muted); text-transform: uppercase;">Объективно</label>
              <textarea class="input" style="min-height: 50px; font-size: 13px; margin-top: 4px;">Глубокая кариозная полость в зубе 1.6, размягченный дентин, зондирование болезненно.</textarea>
            </div>
            <div>
              <label style="font-size: 11px; color: var(--muted); text-transform: uppercase;">Диагноз</label>
              <input class="input" type="text" style="font-size: 13px; margin-top: 4px; font-weight: 600; color: var(--text);" value="К02.1 Кариес дентина (1.6)" />
              
              <!-- AI Scientific Articles Suggestion -->
              <div style="margin-top: 8px; background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 6px; padding: 10px 12px; display: flex; gap: 8px; align-items: flex-start;">
                <div style="font-size: 16px;">💡</div>
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 2px;">AI Подсказка (Протоколы 2024)</div>
                  <div style="font-size: 11px; color: var(--muted); line-height: 1.4;">
                    Для К02.1 рекомендовано применение биоактивных прокладок (MTA) при глубоком кариесе. <a href="#" style="color: var(--primary); text-decoration: underline;">Читать статью PubMed</a>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label style="font-size: 11px; color: var(--muted); text-transform: uppercase;">Лечение</label>
              <textarea class="input" style="min-height: 80px; font-size: 13px; margin-top: 4px;">Анестезия инфильтрационная Ultracain 1.7ml, препарирование полости, медикаментозная обработка хлоргексидином 2%, постановка световой пломбы Filtek Z250.</textarea>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
              <button class="btn" id="finishVisitBtn" style="width: 100%; background: var(--success); color: white; justify-content: center;">
                Завершить прием и списать материалы
              </button>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button class="btn btn-secondary" id="generatePdfBtn" style="width: 100%; border-color: var(--primary); color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 6px;">
                  📄 Экспорт PDF
                </button>
                <button class="btn btn-secondary" id="egovSignBtn" style="width: 100%; border-color: var(--primary); color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <span id="egovIcon">🔑</span> <span id="egovText">Подпись eGov</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}
