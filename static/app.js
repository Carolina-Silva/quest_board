let activeMissionName = "";
let activeMissionId = 0;
let globalCurrentLevel = 0;
let globalPlayerLogs = [];
let activeSideQuestName = "";
let questsConfig = { main_quests: [], side_quests: [] };

let globalTeamData = [];

// ── Badge Config ────────────────────────────────────────────
const BADGE_CONFIG = {
    'Conheça uma tecnologia nova 📚': {
        icon: '🔬', title: 'TECH EXPLORER', tagline: 'Mergulhou fundo em uma tecnologia',
        rarity: 'RARO', colorBorder: '#38bdf8', colorBg: 'rgba(14,165,233,0.12)',
        colorGlow: '0 0 22px rgba(56,189,248,0.55), inset 0 0 14px rgba(56,189,248,0.12)',
        colorTitle: '#7dd3fc', colorTagline: '#38bdf870', rarityColor: '#38bdf8', rarityBg: 'rgba(12,74,110,0.7)',
    },
    'A Ideia Maluca 💡': {
        icon: '💡', title: 'INOVADORA', tagline: 'Propôs uma feature que muda tudo',
        rarity: 'ÉPICO', colorBorder: '#fbbf24', colorBg: 'rgba(245,158,11,0.12)',
        colorGlow: '0 0 22px rgba(251,191,36,0.55), inset 0 0 14px rgba(251,191,36,0.12)',
        colorTitle: '#fde68a', colorTagline: '#fbbf2470', rarityColor: '#fbbf24', rarityBg: 'rgba(78,45,0,0.7)',
    },
    'Caça aos detalhes 🎨': {
        icon: '🎯', title: 'OLHO DE ÁGUIA', tagline: 'Detectou o que ninguém mais viu',
        rarity: 'LENDÁRIO', colorBorder: '#e879f9', colorBg: 'rgba(217,70,239,0.12)',
        colorGlow: '0 0 22px rgba(232,121,249,0.55), inset 0 0 14px rgba(232,121,249,0.12)',
        colorTitle: '#f0abfc', colorTagline: '#e879f970', rarityColor: '#e879f9', rarityBg: 'rgba(74,4,78,0.7)',
    },
    'Repatriação de Artefato 📖': {
        icon: '📖', title: 'ARQUEÓLOGO', tagline: 'Resgatou um artefato perdido',
        rarity: 'INCOMUM', colorBorder: '#6366f1', colorBg: 'rgba(99,102,241,0.12)',
        colorGlow: '0 0 22px rgba(99,102,241,0.55), inset 0 0 14px rgba(99,102,241,0.12)',
        colorTitle: '#a5b4fc', colorTagline: '#6366f170', rarityColor: '#6366f1', rarityBg: 'rgba(49,46,129,0.7)',
    },
    'Reconhecimento de Arquivo 📸': {
        icon: '📸', title: 'ARQUIVISTA', tagline: 'Documentou o arquivo central',
        rarity: 'RARO', colorBorder: '#10b981', colorBg: 'rgba(16,185,129,0.12)',
        colorGlow: '0 0 22px rgba(16,185,129,0.55), inset 0 0 14px rgba(16,185,129,0.12)',
        colorTitle: '#6ee7b7', colorTagline: '#10b98170', rarityColor: '#10b981', rarityBg: 'rgba(6,78,59,0.7)',
    },
    'Reconhecimento de Perímetro Externo ☀️': {
        icon: '☀️', title: 'ANDARILHO', tagline: 'Sobreviveu à radiação solar',
        rarity: 'ÉPICO', colorBorder: '#f97316', colorBg: 'rgba(249,115,22,0.12)',
        colorGlow: '0 0 22px rgba(249,115,22,0.55), inset 0 0 14px rgba(249,115,22,0.12)',
        colorTitle: '#fdba74', colorTagline: '#f9731670', rarityColor: '#f97316', rarityBg: 'rgba(124,45,18,0.7)',
    },
    'Transmissão de Código de Conduta 👍': {
        icon: '👍', title: 'É ISSO JOVEM', tagline: 'Validou o código com sucesso',
        rarity: 'LENDÁRIO', colorBorder: '#f43f5e', colorBg: 'rgba(244,63,94,0.12)',
        colorGlow: '0 0 22px rgba(244,63,94,0.55), inset 0 0 14px rgba(244,63,94,0.12)',
        colorTitle: '#fda4af', colorTagline: '#f43f5e70', rarityColor: '#f43f5e', rarityBg: 'rgba(136,19,55,0.7)',
    },
    'Projeto Paralelo: Operação Sirius 🌌': {
        icon: '🌌', title: 'COMANDANTE', tagline: 'Executou a Operação Sirius',
        rarity: 'MÍTICO', colorBorder: '#a855f7', colorBg: 'rgba(168,85,247,0.12)',
        colorGlow: '0 0 22px rgba(168,85,247,0.55), inset 0 0 14px rgba(168,85,247,0.12)',
        colorTitle: '#d8b4fe', colorTagline: '#a855f770', rarityColor: '#a855f7', rarityBg: 'rgba(88,28,135,0.7)',
    },
    'Bisbilhoteiro Profissional 👀': {
        icon: '🕵️', title: 'ESPIÃO', tagline: 'Curioso de plantão',
        rarity: 'SECRETO', colorBorder: '#ef4444', colorBg: 'rgba(239,68,68,0.12)',
        colorGlow: '0 0 22px rgba(239,68,68,0.55), inset 0 0 14px rgba(239,68,68,0.12)',
        colorTitle: '#fca5a5', colorTagline: '#ef444470', rarityColor: '#ef4444', rarityBg: 'rgba(127,29,29,0.7)',
    },
    'Férias Merecidas 🏖️': {
        icon: '🏖️', title: 'DESCANSANDO', tagline: 'Trabalhou sem férias por 3 anos',
        rarity: 'MÍTICO', colorBorder: '#facc15', colorBg: 'rgba(250,204,21,0.12)',
        colorGlow: '0 0 22px rgba(250,204,21,0.55), inset 0 0 14px rgba(250,204,21,0.12)',
        colorTitle: '#fef08a', colorTagline: '#facc1570', rarityColor: '#facc15', rarityBg: 'rgba(113,63,18,0.7)',
    },
};

function getPlayerName() {
    return localStorage.getItem('player_name');
}

function logout() {
    localStorage.removeItem('player_name');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainBoard = document.getElementById('main-board');
    const adminBoard = document.getElementById('admin-board');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (mainBoard) mainBoard.classList.add('hidden');
    if (adminBoard) adminBoard.classList.add('hidden');
    init();
}

let feedInterval = null;

async function init() {
    if (!feedInterval) {
        updateFeed();
        feedInterval = setInterval(updateFeed, 10000);
    }
    const playerName = getPlayerName();

    const welcomeScreen = document.getElementById('welcome-screen');
    const mainBoard = document.getElementById('main-board');
    const adminBoard = document.getElementById('admin-board');

    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (mainBoard) mainBoard.classList.add('hidden');
    if (adminBoard) adminBoard.classList.add('hidden');

    if (!playerName) {
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        return;
    }

    const cfgRes = await fetch(`/api/quests?player_name=${encodeURIComponent(playerName)}`);
    questsConfig = await cfgRes.json();

    if (playerName === 'Carol') {
        if (adminBoard) adminBoard.classList.remove('hidden');
        await renderAdminDashboard();
        return;
    }

    const res = await fetch(`/api/status?player_name=${encodeURIComponent(playerName)}`);

    if (res.status === 404 || res.status === 400) {
        logout();
        return;
    }

    const data = await res.json();

    if (!data.mission_accepted) {
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    } else {
        globalCurrentLevel = data.current_level;
        globalPlayerLogs = data.diario_logs;
        if (mainBoard) mainBoard.classList.remove('hidden');
        document.getElementById('board-title').innerText = `OPERADOR: ${data.player_name}`;

        renderQuests(data);
        updateDashboard(data);
        updateTeamStatus();
    }
}

async function acceptMission() {
    const name = document.getElementById('player-name-input').value.trim();
    if (!name) {
        alert('Por favor, insira seu codinome antes de entrar.');
        return;
    }

    const res = await fetch('/api/accept-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: name })
    });

    if (!res.ok) {
        const err = await res.json();
        alert(err.detail || 'Erro de autenticação.');
        return;
    }

    localStorage.setItem('player_name', name);
    init();
}

function renderQuests(data) {
    const currentLevel = data.current_level;

    // ── Render Main Quests ──────────────────────────────────────
    const mainContainer = document.getElementById('main-quests-container');
    mainContainer.innerHTML = '';

    questsConfig.main_quests.forEach(quest => {
        let cardClass, badgeClass, badgeText, titleClass;

        const totalMainQuests = questsConfig.main_quests ? questsConfig.main_quests.length : 3;
        let isCompleted = quest.id < currentLevel;

        if (quest.id === currentLevel && quest.id === totalMainQuests) {
            if (data.diario_logs.some(l => l.level_name === quest.title)) {
                isCompleted = true;
            }
        }

        if (isCompleted) {
            cardClass = 'quest-card quest-card-done';
            badgeClass = 'quest-badge quest-badge-done';
            badgeText = 'VERIFICADO ✅';
            titleClass = 'quest-title-done';
        } else if (quest.id === currentLevel) {
            cardClass = 'quest-card quest-card-active';
            badgeClass = 'quest-badge quest-badge-active';
            badgeText = 'EM ANDAMENTO ⚡';
            titleClass = 'quest-title-active';
        } else {
            cardClass = 'quest-card quest-card-locked';
            badgeClass = 'quest-badge quest-badge-locked';
            badgeText = 'BLOQUEADA 🔒';
            titleClass = 'quest-title-locked';
        }

        let corners = (!isCompleted && quest.id === currentLevel)
            ? `<div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>`
            : '';

        let deliverablesHtml = '';
        if (quest.deliverables && quest.deliverables.length > 0) {
            deliverablesHtml = `
                <div class="quest-deliverables">
                    <p class="quest-deliverables-title">> ${quest.deliverables_title || 'Parâmetros de Missão:'}</p>
                    <ul>${quest.deliverables.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            `;
        }

        // Button
        let btnHtml = '';
        if (quest.id !== 0 && quest.id <= currentLevel) {
            if (isCompleted) {
                btnHtml = `<button onclick="openDiario('${quest.title}', ${quest.id})" class="btn-quest-secondary">Ver meu envio anterior</button>`;
            } else {
                btnHtml = `<button onclick="openDiario('${quest.title}', ${quest.id})" class="btn-quest-primary">${quest.btn_text || 'Finalizar e Enviar Log'}</button>`;
            }
        }

        mainContainer.innerHTML += `
            <div class="${cardClass}">
                ${corners}
                <div class="quest-card-header">
                    <h3 class="${titleClass}">[SEQ_${quest.id}] ${quest.title}</h3>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
                ${quest.id > currentLevel
                ? `<div class="quest-locked-blur"><p class="quest-locked-msg">[!] Conclua a missão anterior para desbloquear esta fase 🔒</p></div>`
                : `<p class="quest-desc ${quest.id === currentLevel ? 'quest-desc-active' : ''}">${quest.description}</p>${deliverablesHtml}`
            }
                ${btnHtml}
            </div>
        `;
    });

    // ── Render Side Quests ──────────────────────────────────────
    const sideContainer = document.getElementById('side-quests-container');
    sideContainer.innerHTML = '';

    questsConfig.side_quests.forEach(quest => {
        const isCompleted = data.side_quests_completed.includes(quest.name);

        const cardClass = isCompleted ? 'side-card side-card-done' : 'side-card';
        const titleClass = isCompleted ? 'side-card-title side-card-title-done' : 'side-card-title';
        const badgeClass = isCompleted ? 'side-badge side-badge-done' : 'side-badge side-badge-available';
        const badgeText = isCompleted ? 'PROCESSADO ✅' : 'DISPONÍVEL';
        const btnClass = isCompleted ? 'btn-side btn-side-done' : 'btn-side';
        const btnText = isCompleted ? 'Re-processar Dados' : 'Acessar Missão';

        sideContainer.innerHTML += `
            <div class="${cardClass}">
                <div class="side-card-accent"></div>
                <div class="side-card-header">
                    <h3 class="${titleClass}">${quest.name}</h3>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
                <p class="side-card-desc">${quest.description}</p>
                <button onclick="openSideQuest('${quest.name}')" class="${btnClass}">${btnText}</button>
            </div>
        `;
    });
}

function updateDashboard(data) {
    const currentLevel = data.current_level;
    document.getElementById('player-level').innerText = `LVL 0${currentLevel}`;

    const totalMainQuests = questsConfig.main_quests ? questsConfig.main_quests.length : 3;
    let completedQuests = currentLevel - 1;

    if (totalMainQuests > 0) {
        const lastQuest = questsConfig.main_quests[totalMainQuests - 1];
        if (lastQuest && data.diario_logs.some(l => l.level_name === lastQuest.title)) {
            completedQuests = totalMainQuests;
        }
    }

    let progressPercentage = totalMainQuests > 0 ? (completedQuests / totalMainQuests) * 100 : 0;
    progressPercentage = Math.min(100, Math.round(progressPercentage));

    const progressBar = document.getElementById('progress-bar');
    const myGoalText = document.getElementById('my-goal-text');

    const earnedCountForPlat = data.side_quests_completed.length;
    const baseTotalForPlat = questsConfig.side_quests ? questsConfig.side_quests.length : 3;
    const totalBadgesForPlat = Math.max(earnedCountForPlat, baseTotalForPlat);
    const isMainCompleted = progressPercentage === 100;
    const isPlatinado = isMainCompleted && (earnedCountForPlat >= totalBadgesForPlat);

    if (progressBar) progressBar.style.width = `${progressPercentage}%`;

    let platMsgEl = document.getElementById('platina-message-dynamic');
    if (!platMsgEl && progressBar) {
        platMsgEl = document.createElement('div');
        platMsgEl.id = 'platina-message-dynamic';
        platMsgEl.style.cssText = 'text-align: center; font-size: 14px; margin-bottom: 16px; font-weight: bold; margin-top: -8px;';
        progressBar.parentElement.after(platMsgEl);
    }

    if (myGoalText) {
        if (isPlatinado) {
            myGoalText.innerHTML = `100% <span style="color:#fbbf24; text-shadow: 0 0 10px #fbbf24; margin-left: 8px; animation: pulse 2s infinite;">🏆 PLATINADO 🏆</span>`;
            if (progressBar) {
                progressBar.style.background = '#fbbf24';
                progressBar.style.boxShadow = '0 0 15px rgba(251,191,36,0.8)';
            }
            if (platMsgEl) {
                platMsgEl.innerHTML = `<span style="color:#fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.8);">PARABÉNS! VOCÊ COMPLETOU 100% DA TRILHA E PLATINOU! 🏆</span>`;
            }

            const platKey = `plat_shown_${data.player_name}`;
            if (!localStorage.getItem(platKey) && typeof confetti === 'function') {
                localStorage.setItem(platKey, 'true');
                triggerConfettiEffect('platinum');
                fetch('/api/feed-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        player_name: data.player_name,
                        action: 'PLATINOU O SISTEMA! 🏆 Todas as missões concluídas!',
                        type: 'platinum'
                    })
                });
            }
        } else if (isMainCompleted) {
            myGoalText.innerHTML = `100% <span style="color:#22d3ee; margin-left: 8px;">(MISSÕES PRINCIPAIS OK)</span>`;
            if (progressBar) {
                progressBar.style.background = '#22d3ee';
                progressBar.style.boxShadow = '0 0 10px rgba(34,211,238,0.5)';
            }
            if (platMsgEl) {
                platMsgEl.innerHTML = `<span style="color:#e879f9; text-shadow: 0 0 8px rgba(232,121,249,0.8); animation: pulse 2s infinite;">>> VOCÊ CONCLUIU O CORE! COMPLETE AS MISSÕES EXTRAS PARA PLATINAR! 🏆 <<</span>`;
            }

            const mainDoneKey = `main_done_shown_${data.player_name}`;
            if (!localStorage.getItem(mainDoneKey) && typeof confetti === 'function') {
                localStorage.setItem(mainDoneKey, 'true');
                triggerConfettiEffect('main');
                fetch('/api/feed-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        player_name: data.player_name,
                        action: 'CONCLUIU O CORE! 🌟 Missões principais finalizadas!',
                        type: 'core_done'
                    })
                });
            }
        } else {
            myGoalText.innerText = `${progressPercentage}%`;
            if (progressBar) {
                progressBar.style.background = '#22d3ee';
                progressBar.style.boxShadow = '0 0 10px rgba(34,211,238,0.5)';
            }
            if (platMsgEl) platMsgEl.innerHTML = '';
        }
    }

    // ── Render Badges ───────────────────────────────────────────
    const badgesContainer = document.getElementById('badges-container');
    if (badgesContainer) {
        const earnedCount = data.side_quests_completed.length;
        const baseTotal = questsConfig.side_quests ? questsConfig.side_quests.length : 3;
        const totalBadges = Math.max(earnedCount, baseTotal);
        const hexClip = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)';

        let badgesHtml = `
            <div style="width:100%;display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:14px;color:#d946ef;font-family:monospace;text-transform:uppercase;letter-spacing:0.15em;">🏅 Condecorações</span>
                <span style="font-size:16px;font-family:monospace;color:#475569;border:1px solid #1e293b;padding:2px 8px;">${earnedCount}/${totalBadges}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;width:100%;margin-top:12px;">
        `;

        const allSideQuests = questsConfig.side_quests || [];
        allSideQuests.forEach(sq => {
            const isEarned = data.side_quests_completed.includes(sq.name);
            const cfg = BADGE_CONFIG[sq.name];
            if (!cfg) return;

            if (isEarned) {
                badgesHtml += `
                    <div class="badge-card" style="display:flex;flex-direction:column;align-items:center;gap:8px;width:140px;cursor:pointer;" title="${sq.name}">
                        <div class="badge-icon-container" style="width:140px;height:140px;clip-path:${hexClip};background:${cfg.colorBg};display:flex;align-items:center;justify-content:center;box-shadow:${cfg.colorGlow};outline:3px solid ${cfg.colorBorder};outline-offset:-3px;">
                            <span style="font-size:60px;line-height:1;">${cfg.icon}</span>
                        </div>
                        <span style="font-size:16px;font-family:monospace;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:${cfg.colorTitle};text-align:center;line-height:1.2;">${cfg.title}</span>
                        <span style="font-size:12px;font-family:monospace;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:${cfg.rarityColor};background:${cfg.rarityBg};border:1px solid ${cfg.colorBorder}44;padding:2px 8px;">${cfg.rarity}</span>
                        <span style="font-size:12px;font-family:monospace;color:${cfg.colorTagline};text-align:center;line-height:1.3;">${cfg.tagline}</span>
                    </div>
                `;
            } else {
                badgesHtml += `
                    <div class="badge-locked" style="display:flex;flex-direction:column;align-items:center;gap:8px;width:140px;cursor:default;" title="Complete a missão para desbloquear">
                        <div class="badge-icon-container" style="width:140px;height:140px;clip-path:${hexClip};background:rgba(15,23,42,0.8);display:flex;align-items:center;justify-content:center;outline:3px solid #334155;outline-offset:-3px;">
                            <span style="font-size:60px;line-height:1;">🔒</span>
                        </div>
                        <span style="font-size:16px;font-family:monospace;font-weight:bold;letter-spacing:0.12em;color:#334155;text-transform:uppercase;">???</span>
                        <span style="font-size:12px;font-family:monospace;color:#1e293b;border:1px solid #1e293b;padding:2px 8px;text-transform:uppercase;letter-spacing:0.1em;">BLOQUEADA</span>
                    </div>
                `;
            }
        });

        badgesHtml += `</div>`;
        badgesContainer.innerHTML = badgesHtml;
    }

    // ── Render Logs History ─────────────────────────────────────
    const logsContainer = document.getElementById('logs-history');
    logsContainer.innerHTML = '';
    if (data.diario_logs.length === 0) {
        logsContainer.innerHTML = `<p style="font-style:italic;color:#a6bbd8;text-align:center;padding:16px 0;font-size:14px;text-transform:uppercase;letter-spacing:0.2em;">Você ainda não enviou nenhum relatório.</p>`;
    } else {
        [...data.diario_logs].reverse().forEach(log => {
            const isSideQuest = log.level_name.includes("Side Quest");
            const logEl = document.createElement('div');
            logEl.className = `log-item ${isSideQuest ? 'log-item-side' : ''}`;

            let contentHtml = `<p style="margin-top:4px;"><span style="color:#64748b;font-size:14px;">> OUT:</span> <span style="color:#cbd5e1;font-size:0.75rem;">${log.learned}</span></p>`;
            if (log.not_understood !== "N/A") {
                contentHtml = `
                    <div class="log-item-body">
                        <div><span class="log-detail-label" style="color:#06b6d4;">> Atividade:</span><span class="log-detail-val" style="color:#cffafe;">${log.activity_text || ''}</span></div>
                        <div><span class="log-detail-label" style="color:#155e75;">> Adquirido:</span><span class="log-detail-val" style="color:#cbd5e1;">${log.learned}</span></div>
                        <div><span class="log-detail-label" style="color:rgba(127,29,29,0.8);">> Dúvidas:</span><span class="log-detail-val" style="color:#94a3b8;">${log.not_understood}</span></div>
                        <div><span class="log-detail-label" style="color:rgba(6,78,59,0.8);">> Próximos Passos:</span><span class="log-detail-val" style="color:#94a3b8;">${log.explore_more}</span></div>
                    </div>
                `;
            }

            logEl.innerHTML = `
                <div class="log-item-header">
                    <span class="log-item-name ${isSideQuest ? 'log-item-name-fuchsia' : 'log-item-name-cyan'}">${log.level_name}</span>
                    <span class="log-item-time">${log.timestamp || '00:00:00'}</span>
                </div>
                ${contentHtml}
            `;
            logsContainer.appendChild(logEl);
        });
    }
}

function openDiario(missionName, missionId) {
    activeMissionName = missionName;
    activeMissionId = missionId;

    const qConf = questsConfig.main_quests.find(q => q.id === missionId);
    let instrHtml = '';
    if (qConf && qConf.detailed_instructions) {
        let dels = qConf.deliverables
            ? `<ul style="list-style:disc;padding-left:16px;margin-top:8px;">${qConf.deliverables.map(d => `<li>${d}</li>`).join('')}</ul>`
            : '';
        instrHtml = `<p style="font-weight:bold;color:#22d3ee;margin-bottom:4px;">>> 📋 Instruções:</p>
                     <p style="color:#a5f3fc;">${qConf.detailed_instructions}</p>
                     ${dels}`;
    }
    const instContainer = document.getElementById('modal-mission-instructions');
    if (instContainer) {
        instContainer.innerHTML = instrHtml;
        instContainer.style.display = instrHtml ? '' : 'none';
    }

    const pastLogs = globalPlayerLogs.filter(l => l.level_name === missionName);
    const btn = document.getElementById('btn-submit-diario');
    const fields = ['form-activity', 'form-learned', 'form-not-understood', 'form-explore-more'];

    if (pastLogs.length > 0 && missionId < globalCurrentLevel) {
        const latest = pastLogs[pastLogs.length - 1];
        document.getElementById('form-activity').value = latest.activity_text || '';
        document.getElementById('form-learned').value = latest.learned || '';
        document.getElementById('form-not-understood').value = latest.not_understood || '';
        document.getElementById('form-explore-more').value = latest.explore_more || '';

        fields.forEach(f => {
            const el = document.getElementById(f);
            el.setAttribute('readonly', true);
            el.classList.add('modal-textarea-readonly');
        });

        btn.innerText = 'ATUALIZAR MEU RELATÓRIO';
        btn.className = 'btn-modal-submit btn-modal-submit-fuchsia-alt';
        btn.onclick = () => enableDiarioEdit();
    } else {
        fields.forEach(f => {
            const el = document.getElementById(f);
            el.value = '';
            el.removeAttribute('readonly');
            el.classList.remove('modal-textarea-readonly');
        });
        btn.innerText = 'Enviar Relatório';
        btn.className = 'btn-modal-submit btn-modal-submit-cyan';
        btn.onclick = () => submitDiario();
    }

    document.getElementById('modal-target-mission').innerText = `ALVO: ${missionName}`;
    document.getElementById('modal-diario').classList.remove('hidden');
}

function enableDiarioEdit() {
    const fields = ['form-activity', 'form-learned', 'form-not-understood', 'form-explore-more'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        el.removeAttribute('readonly');
        el.classList.remove('modal-textarea-readonly');
    });

    const btn = document.getElementById('btn-submit-diario');
    btn.innerText = 'ENVIAR ATUALIZAÇÃO';
    btn.className = 'btn-modal-submit btn-modal-submit-emerald';
    btn.onclick = () => submitDiario();
}

function closeDiario() {
    document.getElementById('modal-diario').classList.add('hidden');
    ['form-activity', 'form-learned', 'form-not-understood', 'form-explore-more'].forEach(f => {
        document.getElementById(f).value = '';
    });
}

async function submitDiario() {
    const activity = document.getElementById('form-activity').value.trim();
    const learned = document.getElementById('form-learned').value.trim();
    const notUnderstood = document.getElementById('form-not-understood').value.trim();
    const exploreMore = document.getElementById('form-explore-more').value.trim();
    const playerName = getPlayerName();

    if (!activity || !learned || !notUnderstood || !exploreMore) {
        alert('Preencha todos os campos antes de enviar!');
        return;
    }

    await fetch('/api/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player_name: playerName,
            level_name: activeMissionName,
            activity_text: activity,
            learned: learned,
            not_understood: notUnderstood,
            explore_more: exploreMore
        })
    });

    if (activeMissionId === globalCurrentLevel) {
        await fetch('/api/next-level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_name: playerName })
        });
    }

    closeDiario();
    init();
}

function openSideQuest(sideName) {
    activeSideQuestName = sideName;

    const qConf = questsConfig.side_quests.find(q => q.name === sideName);
    let instrHtml = '';
    if (qConf && qConf.detailed_instructions) {
        instrHtml = `<p style="font-weight:bold;color:#e879f9;margin-bottom:4px;">>> 📋 Como fazer:</p>
                     <p style="color:#fae8ff;white-space:pre-line;">${qConf.detailed_instructions}</p>`;
    }
    const instContainer = document.getElementById('modal-side-instructions');
    if (instContainer) {
        instContainer.innerHTML = instrHtml;
        instContainer.style.display = instrHtml ? '' : 'none';
    }

    document.getElementById('modal-side-title').innerText = `MISSÃO EXTRA: ${sideName}`;
    document.getElementById('modal-side').classList.remove('hidden');
}

function closeSideQuest() {
    document.getElementById('modal-side').classList.add('hidden');
    document.getElementById('form-side-text').value = '';
}

async function submitSideQuest() {
    const text = document.getElementById('form-side-text').value.trim();
    const playerName = getPlayerName();

    if (!text) {
        alert('Escreva suas anotações antes de enviar!');
        return;
    }

    await fetch('/api/side-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player_name: playerName,
            quest_name: activeSideQuestName,
            delivery_text: text
        })
    });

    const questNameToShow = activeSideQuestName;
    closeSideQuest();
    showAchievementUnlocked(questNameToShow);
    init();
}

let selectedAdminPlayerName = '';

async function renderAdminDashboard() {
    const adminName = getPlayerName();
    const res = await fetch(`/api/admin/all-players?admin_name=${encodeURIComponent(adminName)}`);
    if (res.status !== 200) {
        alert('Efetue login novamente como Carol.');
        logout();
        return;
    }

    const allData = await res.json();
    const playersList = document.getElementById('admin-players-list');
    playersList.innerHTML = '';

    const playerNames = Object.keys(allData).filter(name => name !== 'Carol');

    if (playerNames.length === 0) {
        playersList.innerHTML = `<p style="font-style:italic;color:#64748b;text-align:center;padding:16px 0;font-size:0.75rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.2em;">Nenhum agente ativo no momento.</p>`;
        document.getElementById('admin-detail-placeholder').classList.remove('hidden');
        document.getElementById('admin-player-detail').classList.add('hidden');
        return;
    }

    playerNames.forEach(name => {
        const pState = allData[name];
        const isActive = name === selectedAdminPlayerName;

        const btn = document.createElement('button');
        btn.className = `admin-player-btn ${isActive ? 'active' : 'inactive'}`;
        btn.innerHTML = `
            ${isActive ? '<div style="position:absolute;top:0;left:0;width:6px;height:6px;border-top:1px solid #22d3ee;border-left:1px solid #22d3ee;"></div>' : ''}
            <div class="admin-player-btn-row">
                <span style="font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;">${name}</span>
                <span class="admin-player-lvl">LVL 0${pState.current_level}</span>
            </div>
        `;
        btn.onclick = () => selectAdminPlayer(name, pState);
        playersList.appendChild(btn);
    });

    if (selectedAdminPlayerName && allData[selectedAdminPlayerName]) {
        selectAdminPlayer(selectedAdminPlayerName, allData[selectedAdminPlayerName]);
    }
}

async function selectAdminPlayer(name, pState) {
    selectedAdminPlayerName = name;

    document.querySelectorAll('.admin-player-btn').forEach(btn => {
        const btnName = btn.querySelector('span').innerText.trim();
        btn.className = `admin-player-btn ${btnName === name ? 'active' : 'inactive'}`;
    });

    document.getElementById('admin-detail-placeholder').classList.add('hidden');
    document.getElementById('admin-player-detail').classList.remove('hidden');

    document.getElementById('admin-detail-name').innerText = `AGENTE: ${name}`;
    document.getElementById('admin-detail-level').innerText = `LVL 0${pState.current_level}`;

    let userQuestsConfig = questsConfig;
    if (getPlayerName() === 'Carol') {
        try {
            const res = await fetch(`/api/quests?player_name=${encodeURIComponent(name)}`);
            if (res.ok) {
                userQuestsConfig = await res.json();
            }
        } catch (e) {
            console.error("Failed to load user quests", e);
        }
    }

    const totalMainQuests = userQuestsConfig.main_quests ? userQuestsConfig.main_quests.length : 3;
    let completedQuests = pState.current_level - 1;
    if (totalMainQuests > 0) {
        const lastQuest = userQuestsConfig.main_quests[totalMainQuests - 1];
        if (lastQuest && pState.diario_logs.some(l => l.level_name === lastQuest.title)) {
            completedQuests = totalMainQuests;
        }
    }
    let pct = totalMainQuests > 0 ? (completedQuests / totalMainQuests) * 100 : 0;
    pct = Math.min(100, Math.round(pct));

    document.getElementById('admin-detail-progress-percent').innerText = `${pct}%`;
    document.getElementById('admin-detail-progress-bar').style.width = `${pct}%`;

    // Render Admin Badges
    const adminBadgesContainer = document.getElementById('admin-detail-badges');
    if (adminBadgesContainer) {
        const hexClip = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)';
        let badgesHtml = `
            <div style="width:100%;display:flex;align-items:center;margin-bottom:12px;">
                <span style="font-size:14px;color:#d946ef;font-family:monospace;text-transform:uppercase;letter-spacing:0.15em;">🏅 Condecorações Recebidas</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;width:100%;">
        `;
        if (pState.side_quests_completed.length === 0) {
            badgesHtml += `<p style="font-style:italic;color:#64748b;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Nenhuma condecoração recebida.</p>`;
        } else {
            pState.side_quests_completed.forEach(sq => {
                const cfg = BADGE_CONFIG[sq];
                if (cfg) {
                    badgesHtml += `
                        <div class="badge-card" style="display:flex;flex-direction:column;align-items:center;gap:8px;width:120px;cursor:default;" title="${sq}">
                            <div class="badge-icon-container" style="width:100px;height:100px;clip-path:${hexClip};background:${cfg.colorBg};display:flex;align-items:center;justify-content:center;box-shadow:${cfg.colorGlow};outline:3px solid ${cfg.colorBorder};outline-offset:-3px;">
                                <span style="font-size:42px;line-height:1;">${cfg.icon}</span>
                            </div>
                            <span style="font-size:12px;font-family:monospace;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:${cfg.colorTitle};text-align:center;line-height:1.2;">${cfg.title}</span>
                            <span style="font-size:10px;font-family:monospace;color:${cfg.colorTagline};text-align:center;line-height:1.3;">${cfg.tagline}</span>
                        </div>
                    `;
                }
            });
        }
        badgesHtml += `</div>`;
        adminBadgesContainer.innerHTML = badgesHtml;
    }

    // Achievements
    const achievementsContainer = document.getElementById('admin-detail-achievements');
    achievementsContainer.innerHTML = '';

    const sideQuestsList = userQuestsConfig.side_quests || [];

    if (sideQuestsList.length === 0) {
        achievementsContainer.innerHTML = `<p style="font-style:italic;color:#64748b;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;padding:16px 0;">Nenhuma missão opcional definida.</p>`;
    } else {
        sideQuestsList.forEach(quest => {
            const isCompleted = pState.side_quests_completed.includes(quest.name);
            const cardClass = isCompleted ? 'admin-achievement-card admin-achievement-done' : 'admin-achievement-card admin-achievement-pending';
            const badgeClass = isCompleted ? 'admin-achievement-badge admin-achievement-badge-done' : 'admin-achievement-badge admin-achievement-badge-pending';
            const badgeText = isCompleted ? 'CONCLUÍDO ✅' : 'EM ANDAMENTO';
            const descClass = isCompleted ? 'admin-achievement-desc admin-achievement-desc-done' : 'admin-achievement-desc admin-achievement-desc-pending';

            achievementsContainer.innerHTML += `
                <div class="${cardClass}">
                    <div class="admin-achievement-header">
                        <span class="admin-achievement-name">${quest.name}</span>
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                    <p class="${descClass}">${quest.description}</p>
                </div>
            `;
        });
    }

    // Logs
    const logsContainer = document.getElementById('admin-detail-logs');
    logsContainer.innerHTML = '';

    if (pState.diario_logs.length === 0) {
        logsContainer.innerHTML = `<p style="font-style:italic;color:#64748b;text-align:center;padding:32px 0;font-family:monospace;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.2em;">Nenhum log enviado por este agente.</p>`;
    } else {
        [...pState.diario_logs].reverse().forEach(log => {
            const isSide = log.level_name.includes("Side Quest");
            const logClass = isSide ? 'admin-log-item admin-log-item-fuchsia' : 'admin-log-item admin-log-item-cyan';
            const nameClass = isSide ? 'admin-log-name-fuchsia' : 'admin-log-name-cyan';

            const safeLog = encodeURIComponent(JSON.stringify(log));
            const detailsHtml = `
                <div style="margin-top: 12px;">
                    <button onclick="openAdminLogModal('${safeLog}')" class="btn-quest-secondary" style="font-size: 0.75rem; padding: 6px 12px; width: 100%;">Ler Relatório Completo</button>
                </div>
            `;
            logsContainer.innerHTML += `
                <div class="${logClass}">
                    <div class="admin-log-header">
                        <span class="${nameClass}">${log.level_name}</span>
                        <span class="admin-log-time">${log.timestamp || '00:00:00'}</span>
                    </div>
                    ${detailsHtml}
                </div>
            `;
        });
    }
}

async function updateTeamStatus() {
    try {
        const res = await fetch('/api/team-status');
        if (!res.ok) return;
        const data = await res.json();
        globalTeamData = data.team;

        const container = document.getElementById('team-players-list');
        if (!container) return;
        container.innerHTML = '';

        let totalCompleted = 0;
        let maxLevelsPossible = 0;

        if (globalTeamData.length === 0) {
            container.innerHTML = `
                <p style="
                    grid-column:1/-1;
                    width:100%;
                    font-size:14px;
                    color:#64748b;
                    font-family:monospace;
                    text-transform:uppercase;
                ">
                    Esquadrão vazio.
                </p>`;
            return;
        }

        globalTeamData.forEach(player => {
            totalCompleted += player.completed || 0;
            maxLevelsPossible += player.max_level || 3;
            const isMe = player.name === getPlayerName();
            const borderColor = isMe ? '1px solid rgba(6,182,212,0.5)' : '1px solid #1e293b';
            const boxShadow = isMe ? '0 0 8px rgba(34,211,238,0.2)' : 'none';
            const opacity = isMe ? '1' : '0.8';
            const lvlBg = isMe ? '#083344' : '#0f172a';
            const lvlColor = isMe ? '#22d3ee' : '#94a3b8';
            const lvlBorder = isMe ? '#155e75' : '#334155';
            const pulse = isMe ? `<span class="animate-pulse" style="display:inline-block;width:6px;height:6px;background:#22d3ee;border-radius:50%;"></span>` : '';
            const spyBtn = !isMe ? `<button onclick="spyOnPlayer('${player.name}')" class="btn-spy" title="Interceptar Sinal">👁️ HACK</button>` : '';

            container.innerHTML += `
                <div style="background:rgba(0,0,0,0.5);padding:8px;border:${borderColor};box-shadow:${boxShadow};display:flex;align-items:center;justify-content:space-between;font-family:monospace;opacity:${opacity};">
                    <span style="font-size:14px;font-weight:bold;color:#cbd5e1;text-transform:uppercase;letter-spacing:0.2em;display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${pulse} ${player.name}
                    </span>
                    <div style="display:flex; gap: 8px; align-items:center;">
                        ${spyBtn}
                        <span style="font-size:16px;padding:2px 4px;border:1px solid ${lvlBorder};background:${lvlBg};color:${lvlColor};">LVL 0${player.level}</span>
                    </div>
                </div>
            `;
        });

        let percent = maxLevelsPossible > 0 ? (totalCompleted / maxLevelsPossible) * 100 : 0;
        percent = Math.min(100, Math.round(percent));

        const progressBar = document.getElementById('team-progress-bar');
        const goalText = document.getElementById('team-goal-text');
        const bonusMsg = document.getElementById('team-bonus-message');

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (goalText) goalText.innerText = `Progresso do time: ${percent}%`;

        if (percent >= 100) {
            if (bonusMsg) bonusMsg.classList.remove('hidden');
        } else {
            if (bonusMsg) bonusMsg.classList.add('hidden');
        }
    } catch (e) {
        console.error("Failed to load team status", e);
    }
}

function switchTab(tabName) {
    const mainContent = document.getElementById('content-main');
    const sideContent = document.getElementById('content-side');
    const tabMain = document.getElementById('tab-main');
    const tabSide = document.getElementById('tab-side');

    if (tabName === 'main') {
        mainContent.classList.remove('hidden');
        sideContent.classList.add('hidden');
        tabMain.className = 'tab-btn active';
        tabSide.className = 'tab-btn inactive';
    } else {
        mainContent.classList.add('hidden');
        sideContent.classList.remove('hidden');
        tabMain.className = 'tab-btn inactive';
        tabSide.className = 'tab-btn active';
    }
}

async function updateFeed() {
    const container = document.getElementById('global-feed-container');
    if (!container) return;

    try {
        const res = await fetch('/api/feed');
        if (!res.ok) return;
        const feed = await res.json();

        if (feed.length === 0) {
            container.innerHTML = '<p style="color:#64748b;font-family:monospace;font-size:0.75rem;">> SINAL NÃO DETECTADO...</p>';
            return;
        }

        container.innerHTML = feed.reverse().map(item => `
            <div class="feed-item feed-type-${item.type}">
                <span class="feed-time">[${item.timestamp.split(' ')[1]}]</span>
                <span class="feed-player">${item.player_name}</span>
                <span class="feed-action">${item.action}</span>
            </div>
        `).join('');
    } catch (e) {
        console.error("Feed error:", e);
    }
}

function showAchievementUnlocked(questName) {
    const toast = document.getElementById('achievement-toast');
    const nameEl = document.getElementById('toast-quest-name');
    if (!toast || !nameEl) return;

    nameEl.innerText = questName;
    toast.classList.remove('hidden');

    // Trigger reflow to restart animation if needed
    void toast.offsetWidth;

    toast.classList.add('show');

    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 500); // wait for transition
    }, 5000);
}

function closeAdminLogModal() {
    document.getElementById('modal-admin-log').classList.add('hidden');
}

function openAdminLogModal(encodedLog) {
    const log = JSON.parse(decodeURIComponent(encodedLog));
    const isSide = log.level_name.includes("Side Quest");

    document.getElementById('modal-admin-log-title').innerText = log.level_name;
    const contentBox = document.getElementById('modal-admin-log-content');

    // Set theme classes based on quest type
    const modalBox = document.getElementById('modal-admin-log-box');
    const modalTitle = document.getElementById('modal-admin-log-h3');
    const modalSubtitle = document.getElementById('modal-admin-log-title');
    const modalBtn = document.getElementById('modal-admin-log-btn');

    if (isSide) {
        modalBox.className = 'modal-box modal-box-fuchsia';
        modalTitle.className = 'modal-title modal-title-fuchsia';
        modalSubtitle.className = 'modal-subtitle modal-subtitle-fuchsia';
        modalBtn.className = 'btn-modal-submit btn-modal-submit-fuchsia';
    } else {
        modalBox.className = 'modal-box modal-box-cyan';
        modalTitle.className = 'modal-title modal-title-cyan';
        modalSubtitle.className = 'modal-subtitle modal-subtitle-cyan';
        modalBtn.className = 'btn-modal-submit btn-modal-submit-cyan';
    }

    if (log.not_understood !== "N/A") {
        const hasDoubt = log.not_understood && log.not_understood.trim() !== ''
            && !['nenhuma', 'nada'].includes(log.not_understood.trim().toLowerCase());
        const doubtClass = hasDoubt ? 'admin-doubt-highlight' : '';

        contentBox.innerHTML = `
            <div class="admin-log-body" style="background:transparent; padding:0; border:none; margin:0;">
                <div style="margin-bottom:16px;">
                    <span class="admin-log-section-label" style="color:${isSide ? '#e879f9' : '#22d3ee'};">> Atividade:</span>
                    <span class="admin-log-section-val" style="color:#f8fafc; font-size:1rem;">${log.activity_text || ''}</span>
                </div>
                <div style="margin-bottom:16px;">
                    <span class="admin-log-section-label" style="color:${isSide ? '#c026d3' : '#155e75'};">> Aprendizado:</span>
                    <span class="admin-log-section-val" style="color:#e2e8f0; font-size:1rem;">${log.learned}</span>
                </div>
                <div style="margin-bottom:16px;">
                    <span class="admin-log-section-label" style="color:rgba(239,68,68,0.8);">> Dúvidas:</span>
                    <div class="${doubtClass} admin-log-section-val" style="font-size:1rem; ${hasDoubt ? '' : 'color:#94a3b8;'}">${log.not_understood}</div>
                </div>
                <div>
                    <span class="admin-log-section-label" style="color:rgba(16,185,129,0.8);">> Próximos Passos:</span>
                    <span class="admin-log-section-val" style="color:#cbd5e1; font-size:1rem;">${log.explore_more}</span>
                </div>
            </div>
        `;
    } else {
        contentBox.innerHTML = `
            <div style="margin-top:8px;">
                <span style="color:#d946ef;font-size:0.75rem;text-transform:uppercase;font-weight:bold;letter-spacing:0.2em;display:block;margin-bottom:8px;">> Conteúdo Interceptado:</span>
                <span style="color:#f8fafc;font-size:1rem;line-height:1.6;">${log.learned}</span>
            </div>
        `;
    }

    document.getElementById('modal-admin-log').classList.remove('hidden');
}

function triggerConfettiEffect(type) {
    if (typeof confetti !== 'function') return;

    if (type === 'main') {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#06b6d4', '#e879f9']
        });
    } else if (type === 'platinum') {
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#fbbf24', '#fde68a', '#d97706', '#22d3ee']
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#fbbf24', '#fde68a', '#d97706', '#22d3ee']
            }));
        }, 250);
    }
}

function showCredits() {
    const listContainer = document.getElementById('credits-team-list');
    listContainer.innerHTML = '';

    globalTeamData.forEach(player => {
        let badgesHtml = '';
        if (player.side_quests && player.side_quests.length > 0) {
            badgesHtml = `<div class="credits-badges-row">`;
            player.side_quests.forEach(sq => {
                const cfg = BADGE_CONFIG[sq];
                if (cfg) {
                    badgesHtml += `
                        <div class="credits-badge">
                            <span class="credits-badge-icon">${cfg.icon}</span>
                            <span class="credits-badge-title">${cfg.title}</span>
                        </div>
                    `;
                }
            });
            badgesHtml += `</div>`;
        }

        listContainer.innerHTML += `
            <div class="credits-agent-block">
                <div class="credits-agent-name">AGENTE: ${player.name}</div>
                <div class="credits-agent-level">LEVEL 0${player.level} ALCANÇADO</div>
                ${badgesHtml}
            </div>
        `;
    });

    const overlay = document.getElementById('credits-overlay');
    const content = document.getElementById('credits-content');
    overlay.classList.remove('hidden');

    // Reset animation
    content.classList.remove('credits-scroll-active');
    void content.offsetWidth; // trigger reflow
    content.classList.add('credits-scroll-active');
}

function closeCredits() {
    const overlay = document.getElementById('credits-overlay');
    overlay.classList.add('hidden');
    document.getElementById('credits-content').classList.remove('credits-scroll-active');
}

function acceptFinalMission() {
    fetch('/api/feed-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player_name: getPlayerName(),
            action: 'ACEITOU A MISSÃO FINAL NÍVEL S! A comemoração vai acontecer!',
            type: 'platinum'
        })
    });
    alert('Missão Final Aceita com Sucesso! 🌟');
    closeCredits();
}

function rejectFinalMission() {
    fetch('/api/feed-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player_name: getPlayerName(),
            action: 'RECUSOU A MISSÃO FINAL... (Isso é sério?! 😱)',
            type: 'core_done'
        })
    });
    alert('Missão Final Recusada. Fim da linha... ou não?');
    closeCredits();
}

async function spyOnPlayer(targetName) {
    try {
        const res = await fetch(`/api/status?player_name=${targetName}`);
        if (!res.ok) return;
        const state = await res.json();

        document.getElementById('modal-spy-title').innerText = `ALVO: AGENTE ${targetName}`;

        const logContainer = document.getElementById('modal-spy-log');
        if (targetName === 'Lina' || targetName === 'Carol') {
            const funLogs = [
                "[ MODO FÉRIAS ATIVADO ] Dormindo profundamente até as 10h da manhã... Zzz...",
                "[ MODO FÉRIAS ATIVADO ] Tomando um solzinho e lendo um livro muito bom ☀️📚",
                "[ MODO FÉRIAS ATIVADO ] Brincando com o gato, não perturbe! 🐈",
                "[ MODO FÉRIAS ATIVADO ] O cérebro está em manutenção. Tente novamente após as férias 🔧",
                "[ MODO FÉRIAS ATIVADO ] Executando script: descansar.py 🐍",
                "[ MODO FÉRIAS ATIVADO ] IA indisponível. Operadora humana curtindo a vida 🤖",
                "[ MODO FÉRIAS ATIVADO ] Trabalhando duro para não fazer absolutamente nada 🏖️",
                "[ MODO FÉRIAS ATIVADO ] Fazendo turismo entre a cama, o sofá e a geladeira 🚶",
                "[ MODO FÉRIAS ATIVADO ] Fora do escritório. Dentro das cobertas. Prioridades. 🛌",
                "[ MODO FÉRIAS ATIVADO ] Fazendo nada. E fazendo muito bem. 🏅",
                "[ MODO FÉRIAS ATIVADO ] Estou vendo você espiando minhas férias 👀",
            ];
            const randomLog = funLogs[Math.floor(Math.random() * funLogs.length)];
            const now = new Date();
            const timeStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            logContainer.innerHTML = `
                <div style="color: #ef4444; font-weight: bold; margin-bottom: 8px;">[${timeStr}] STATUS: SUPERVISÃO</div>
                <div>${randomLog}</div>
            `;
        } else if (state.diario_logs && state.diario_logs.length > 0) {
            const lastLog = state.diario_logs[state.diario_logs.length - 1];
            logContainer.innerHTML = `
                <div style="color: #ef4444; font-weight: bold; margin-bottom: 8px;">[${lastLog.timestamp}] ${lastLog.level_name}</div>
                <div>${lastLog.activity_text || lastLog.learned || 'Sem registro de texto detalhado.'}</div>
            `;
        } else {
            logContainer.innerHTML = '<span style="color:#991b1b; font-style:italic;">Nenhum registro encontrado no diário do alvo.</span>';
        }

        const badgesContainer = document.getElementById('modal-spy-badges');
        badgesContainer.innerHTML = '';
        if (state.side_quests_completed && state.side_quests_completed.length > 0) {
            state.side_quests_completed.forEach(sq => {
                const cfg = BADGE_CONFIG[sq];
                if (cfg) {
                    badgesContainer.innerHTML += `
                        <div class="spy-badge-item">
                            <span style="font-size: 1.2rem;">${cfg.icon}</span>
                            <span style="color: #fca5a5; font-size: 0.75rem;">${cfg.title}</span>
                        </div>
                    `;
                }
            });
        } else {
            badgesContainer.innerHTML = '<span style="color:#991b1b; font-style:italic;">Nenhuma criptografia (condecoração) adicional detectada.</span>';
        }

        document.getElementById('modal-spy').classList.remove('hidden');

        fetch('/api/feed-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_name: getPlayerName(),
                action: `interceptou o sinal e está bisbilhotando o progresso do Agente ${targetName}! 👀`,
                type: 'spy'
            })
        });

        const me = globalTeamData.find(p => p.name === getPlayerName());
        if (me && (!me.side_quests || !me.side_quests.includes('Bisbilhoteiro Profissional 👀'))) {
            fetch('/api/side-quest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_name: getPlayerName(),
                    quest_name: 'Bisbilhoteiro Profissional 👀',
                    delivery_text: 'Descoberta secreta: invadiu o terminal de um colega.'
                })
            }).then(() => {
                // Forçar atualização silenciosa
                updateTeamStatus();
            });
        }

    } catch (e) {
        console.error("Erro ao espionar", e);
    }
}

function closeSpyModal() {
    document.getElementById('modal-spy').classList.add('hidden');
}

window.onload = init;
