let activeMissionName = "";
let activeMissionId = 0;
let globalCurrentLevel = 0;
let globalPlayerLogs = [];
let activeSideQuestName = "";
let questsConfig = { main_quests: [], side_quests: [] };

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

async function init() {
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
        // Player not found or bad request, reset session
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
        alert('FALHA NA AUTENTICAÇÃO: IDENTIFICAÇÃO NECESSÁRIA.');
        return;
    }

    await fetch('/api/accept-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: name })
    });

    localStorage.setItem('player_name', name);
    init();
}

function renderQuests(data) {
    const currentLevel = data.current_level;

    // Render Main Quests
    const mainContainer = document.getElementById('main-quests-container');
    mainContainer.innerHTML = '';

    questsConfig.main_quests.forEach(quest => {
        let cardClass, badgeClass, badgeText, btnHidden, titleClass;

        if (quest.id < currentLevel) {
            cardClass = "bg-black/60 p-6 border border-emerald-500/30 opacity-75 relative focus-within:opacity-100 hover:opacity-100 transition-opacity";
            badgeClass = "text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/50 uppercase tracking-widest";
            badgeText = "VERIFICADO";
            btnHidden = "";
            titleClass = "text-lg font-mono font-bold text-emerald-500/80 uppercase tracking-wide";
        } else if (quest.id === currentLevel) {
            cardClass = "bg-slate-950/80 p-6 border border-cyan-500/60 neon-box-cyan transition-all relative";
            badgeClass = "text-[10px] font-mono font-bold px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-400 uppercase tracking-widest shadow-[0_0_8px_rgba(34,211,238,0.4)]";
            badgeText = "EM ANDAMENTO";
            btnHidden = "";
            titleClass = "text-lg font-mono font-bold text-cyan-400 uppercase tracking-wide neon-text-cyan";
        } else {
            cardClass = "bg-black p-6 border border-slate-800 text-slate-600 select-none pointer-events-none relative";
            badgeClass = "text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-slate-700 uppercase tracking-widest border border-slate-800";
            badgeText = "ACESSO NEGADO";
            btnHidden = "hidden";
            titleClass = "text-lg font-mono font-bold text-slate-600 uppercase tracking-wide";
        }

        // Add corner accents for active card
        let corners = quest.id === currentLevel ? `
            <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400"></div>
            <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400"></div>
        ` : '';

        let deliverablesHtml = "";
        if (quest.deliverables && quest.deliverables.length > 0) {
            deliverablesHtml = `
                <div class="bg-black/50 p-4 text-xs text-cyan-100/70 space-y-2 mb-6 border-l-2 border-cyan-800 font-mono">
                    <p class="font-bold text-cyan-500 uppercase tracking-wider text-[10px]">> ${quest.deliverables_title || 'Parâmetros de Missão:'}</p>
                    <ul class="list-disc pl-4 space-y-1.5 marker:text-cyan-800">
                        ${quest.deliverables.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        mainContainer.innerHTML += `
            <div class="${cardClass}">
                ${corners}
                <div class="flex justify-between items-start mb-4 gap-2">
                    <h3 class="${titleClass}">[SEQ_${quest.id}] ${quest.title}</h3>
                    <span class="${badgeClass} shrink-0 mt-1">${badgeText}</span>
                </div>
                ${quest.id > currentLevel ?
                `<div class="bg-black/80 border border-red-900/50 p-4 relative overflow-hidden mb-6 filter blur-[1px]">
                         <p class="text-red-500 font-mono text-center text-xs uppercase tracking-widest animate-pulse">[!] DADOS CRIPTOGRAFADOS - NÍVEL DE ACESSO INSUFICIENTE [!]</p>
                     </div>`
                :
                `<p class="text-sm md:text-base mb-6 font-mono leading-relaxed ${quest.id === currentLevel ? 'text-cyan-100/90' : 'text-slate-500'}">${quest.description}</p>
                    ${deliverablesHtml}`
            }
                <button onclick="openDiario('${quest.title}', ${quest.id})" class="${btnHidden} w-full md:w-auto ${quest.id < currentLevel ? 'bg-slate-900/40 text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white' : 'bg-cyan-950 text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]'} border font-mono text-xs md:text-sm font-bold px-8 py-3 transition-all uppercase tracking-widest">
                    ${quest.id < currentLevel ? '[VER SEUS DADOS / NOVA VERSÃO]' : (quest.btn_text || 'Finalizar e Enviar Log')}
                </button>
            </div>
        `;
    });

    // Render Side Quests
    const sideContainer = document.getElementById('side-quests-container');
    sideContainer.innerHTML = '';

    questsConfig.side_quests.forEach(quest => {
        const isCompleted = data.side_quests_completed.includes(quest.name);

        let cardClass = "bg-slate-950/60 p-5 border border-fuchsia-900/50 hover:border-fuchsia-500/50 transition-all group relative";
        let badgeClass = "text-[9px] font-mono bg-fuchsia-950/50 text-fuchsia-500 font-bold px-2 py-0.5 border border-fuchsia-900/50 uppercase tracking-widest";
        let badgeText = "DISPONÍVEL";
        let btnText = "Extrair Dados";
        let titleClass = "text-xs font-mono font-bold text-fuchsia-400 uppercase tracking-widest group-hover:neon-text-fuchsia transition-all";

        if (isCompleted) {
            cardClass = "bg-black/60 p-5 border border-emerald-900/50 opacity-80 relative";
            badgeClass = "text-[9px] font-mono bg-emerald-950 text-emerald-500 font-bold px-2 py-0.5 border border-emerald-900/50 uppercase tracking-widest";
            badgeText = "PROCESSADO";
            btnText = "Re-processar Dados";
            titleClass = "text-xs font-mono font-bold text-emerald-500/80 uppercase tracking-widest";
        }

        sideContainer.innerHTML += `
            <div class="${cardClass}">
                <div class="absolute top-0 left-0 w-1 h-full bg-fuchsia-900/30 group-hover:bg-fuchsia-500/50 transition-colors ${isCompleted ? 'bg-emerald-900/50 group-hover:bg-emerald-900/50' : ''}"></div>
                <div class="flex justify-between items-start mb-3 gap-2 pl-3">
                    <h3 class="${titleClass}">SYS_OPT: ${quest.name}</h3>
                    <span class="${badgeClass} mt-0.5 shrink-0">${badgeText}</span>
                </div>
                <p class="text-[11px] font-mono text-slate-400 leading-relaxed mb-4 pl-3 group-hover:text-fuchsia-100/70 transition-colors ${isCompleted ? 'text-slate-600 group-hover:text-slate-500' : ''}">${quest.description}</p>
                <button onclick="openSideQuest('${quest.name}')" class="w-full ml-3 max-w-[calc(100%-12px)] bg-transparent border border-fuchsia-900/80 hover:border-fuchsia-400 text-fuchsia-500/80 hover:text-fuchsia-300 font-mono text-[10px] font-bold py-1.5 transition-all uppercase tracking-widest hover:shadow-[0_0_8px_rgba(232,121,249,0.3)] ${isCompleted ? 'border-emerald-900/50 text-emerald-600 hover:border-emerald-500 hover:text-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]' : ''}">
                    ${btnText}
                </button>
            </div>
        `;
    });
}

function updateDashboard(data) {
    const currentLevel = data.current_level;
    document.getElementById('player-level').innerText = `LVL 0${currentLevel}`;

    let progressPercentage = 0;
    if (currentLevel === 1) progressPercentage = 15;
    else if (currentLevel === 2) progressPercentage = 50;
    else if (currentLevel === 3) progressPercentage = 85;

    if (data.diario_logs.some(l => l.level_name.includes("Level 3"))) progressPercentage = 100;

    document.getElementById('progress-bar').style.width = `${progressPercentage}%`;

    const logsContainer = document.getElementById('logs-history');
    logsContainer.innerHTML = "";
    if (data.diario_logs.length === 0) {
        logsContainer.innerHTML = "<p class='italic text-slate-600 text-center py-4 text-[10px] uppercase tracking-widest'>Nenhum log registrado na sessão atual.</p>";
    } else {
        [...data.diario_logs].reverse().forEach(log => {
            const logEl = document.createElement('div');
            logEl.className = "bg-black/50 p-3 border-l-2 border-cyan-800 space-y-1 mb-2 hover:bg-slate-900/50 transition-colors";

            let headerColor = "text-cyan-500";
            let isSideQuest = log.level_name.includes("Side Quest");
            if (isSideQuest) {
                headerColor = "text-fuchsia-500";
                logEl.className = "bg-black/50 p-3 border-l-2 border-fuchsia-800 space-y-1 mb-2 hover:bg-slate-900/50 transition-colors";
            }

            let contentHtml = `<p class="mt-1"><span class="text-slate-500 text-[10px]">> OUT:</span> <span class="text-slate-300 text-xs">${log.learned}</span></p>`;
            if (log.not_understood !== "N/A") {
                contentHtml = `
                    <div class="mt-2 space-y-1.5 border-t border-slate-900 pt-2 text-xs">
                        <p><span class="text-cyan-500 text-[10px] uppercase tracking-widest font-bold">> Atividade:</span> <span class="text-cyan-100">${log.activity_text || ''}</span></p>
                        <p><span class="text-cyan-800 text-[10px] uppercase tracking-widest font-bold">> Acquired:</span> <span class="text-slate-300">${log.learned}</span></p>
                        <p><span class="text-red-900/80 text-[10px] uppercase tracking-widest font-bold">> Errors:</span> <span class="text-slate-400">${log.not_understood}</span></p>
                        <p><span class="text-emerald-900/80 text-[10px] uppercase tracking-widest font-bold">> Next_Target:</span> <span class="text-slate-400">${log.explore_more}</span></p>
                    </div>
                `;
            }

            logEl.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="font-bold ${headerColor} text-[10px] uppercase tracking-wider">${log.level_name}</span>
                    <span class="text-[8px] text-slate-600 tracking-widest">${log.timestamp || '00:00:00'}</span>
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

    // search for past log
    const pastLogs = globalPlayerLogs.filter(l => l.level_name === missionName);
    const btn = document.getElementById('btn-submit-diario');
    const fields = ['form-activity', 'form-learned', 'form-not-understood', 'form-explore-more'];

    if (pastLogs.length > 0 && missionId < globalCurrentLevel) {
        const latest = pastLogs[pastLogs.length - 1]; // get most recent submission
        document.getElementById('form-activity').value = latest.activity_text || "";
        document.getElementById('form-learned').value = latest.learned || "";
        document.getElementById('form-not-understood').value = latest.not_understood || "";
        document.getElementById('form-explore-more').value = latest.explore_more || "";

        fields.forEach(f => {
            const el = document.getElementById(f);
            el.setAttribute('readonly', true);
            el.classList.add('bg-black', 'text-slate-500');
            el.classList.remove('bg-black/80', 'text-cyan-100', 'focus:border-cyan-400');
        });

        btn.innerText = "NOVA VERSÃO 2.0";
        btn.className = "flex-1 bg-fuchsia-950 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-black font-mono font-bold py-3 transition-colors uppercase tracking-widest text-xs";
        btn.onclick = () => enableDiarioEdit();
    } else {
        fields.forEach(f => {
            const el = document.getElementById(f);
            el.value = "";
            el.removeAttribute('readonly');
            el.classList.add('bg-black/80', 'text-cyan-100', 'focus:border-cyan-400');
            el.classList.remove('bg-black', 'text-slate-500');
        });
        btn.innerText = "TRANSMISSÃO CRIPTOGRAFADA";
        btn.className = "flex-1 bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono font-bold py-3 transition-colors uppercase tracking-widest text-xs";
        btn.onclick = () => submitDiario();
    }

    document.getElementById('modal-target-mission').innerText = `ALVO DE TRANSMISSÃO: ${missionName}`;
    document.getElementById('modal-diario').classList.remove('hidden');
}

function enableDiarioEdit() {
    const fields = ['form-activity', 'form-learned', 'form-not-understood', 'form-explore-more'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        el.removeAttribute('readonly');
        el.classList.add('bg-black/80', 'text-cyan-100', 'focus:border-cyan-400');
        el.classList.remove('bg-black', 'text-slate-500');
    });

    const btn = document.getElementById('btn-submit-diario');
    btn.innerText = "ENVIAR NOVA VERSÃO";
    btn.className = "flex-1 bg-emerald-950 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-mono font-bold py-3 transition-colors uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    btn.onclick = () => submitDiario();
}

function closeDiario() {
    document.getElementById('modal-diario').classList.add('hidden');
    document.getElementById('form-activity').value = "";
    document.getElementById('form-learned').value = "";
    document.getElementById('form-not-understood').value = "";
    document.getElementById('form-explore-more').value = "";
}

async function submitDiario() {
    const activity = document.getElementById('form-activity').value.trim();
    const learned = document.getElementById('form-learned').value.trim();
    const notUnderstood = document.getElementById('form-not-understood').value.trim();
    const exploreMore = document.getElementById('form-explore-more').value.trim();
    const playerName = getPlayerName();

    if (!activity || !learned || !notUnderstood || !exploreMore) {
        alert('ERRO DE TRANSMISSÃO: PACOTES DE DADOS INCOMPLETOS. PREENCHA TODOS OS CAMPOS.');
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
    init(); // Re-fetch all and render
}

function openSideQuest(sideName) {
    activeSideQuestName = sideName;
    document.getElementById('modal-side-title').innerText = `ALVO DE PROCESSAMENTO: ${sideName}`;
    document.getElementById('modal-side').classList.remove('hidden');
}

function closeSideQuest() {
    document.getElementById('modal-side').classList.add('hidden');
    document.getElementById('form-side-text').value = "";
}

async function submitSideQuest() {
    const text = document.getElementById('form-side-text').value.trim();
    const playerName = getPlayerName();

    if (!text) {
        alert('ERRO DE PROCESSAMENTO: CONTEÚDO VAZIO.');
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

    closeSideQuest();
    init(); // Re-fetch all and render
}

let selectedAdminPlayerName = "";

async function renderAdminDashboard() {
    const adminName = getPlayerName();
    const res = await fetch(`/api/admin/all-players?admin_name=${encodeURIComponent(adminName)}`);
    if (res.status !== 200) {
        alert("Efetue login novamente como Carol.");
        logout();
        return;
    }

    const allData = await res.json();
    const playersList = document.getElementById('admin-players-list');
    playersList.innerHTML = "";

    const playerNames = Object.keys(allData).filter(name => name !== 'Carol');

    if (playerNames.length === 0) {
        playersList.innerHTML = `<p class="italic text-slate-605 text-center py-4 text-xs font-mono uppercase tracking-widest">Nenhum agente ativo no momento.</p>`;
        document.getElementById('admin-detail-placeholder').classList.remove('hidden');
        document.getElementById('admin-player-detail').classList.add('hidden');
        return;
    }

    playerNames.forEach(name => {
        const pState = allData[name];
        const isActive = name === selectedAdminPlayerName;

        let activeClass = isActive
            ? "border-cyan-500/80 bg-cyan-950/30 text-cyan-400 neon-box-cyan"
            : "border-slate-800 bg-black/60 text-slate-400 hover:border-cyan-800 hover:text-cyan-400";

        playersList.innerHTML += `
            <button onclick="selectAdminPlayer('${name}', ${JSON.stringify(pState).replace(/"/g, '&quot;')})" 
                class="w-full text-left p-4 border font-mono text-xs transition-all flex flex-col gap-1 relative ${activeClass}">
                ${isActive ? '<div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400"></div>' : ''}
                <div class="flex justify-between items-center w-full">
                    <span class="font-bold uppercase tracking-wider">${name}</span>
                    <span class="text-[9px] bg-slate-900 px-1.5 py-0.5 border border-slate-800 text-slate-400">LVL 0${pState.current_level}</span>
                </div>
            </button>
        `;
    });

    if (selectedAdminPlayerName && allData[selectedAdminPlayerName]) {
        selectAdminPlayer(selectedAdminPlayerName, allData[selectedAdminPlayerName]);
    }
}

function selectAdminPlayer(name, pState) {
    selectedAdminPlayerName = name;

    const buttons = document.querySelectorAll('#admin-players-list button');
    buttons.forEach(btn => {
        const btnName = btn.querySelector('span').innerText.trim();
        if (btnName === name) {
            btn.className = "w-full text-left p-4 border font-mono text-xs transition-all flex flex-col gap-1 relative border-cyan-500/80 bg-cyan-950/30 text-cyan-400 neon-box-cyan";
            if (!btn.querySelector('.absolute')) {
                btn.insertAdjacentHTML('afterbegin', '<div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400"></div>');
            }
        } else {
            btn.className = "w-full text-left p-4 border font-mono text-xs transition-all flex flex-col gap-1 relative border-slate-800 bg-black/60 text-slate-400 hover:border-cyan-800 hover:text-cyan-400";
            const borderAccent = btn.querySelector('.absolute');
            if (borderAccent) borderAccent.remove();
        }
    });

    document.getElementById('admin-detail-placeholder').classList.add('hidden');
    document.getElementById('admin-player-detail').classList.remove('hidden');

    document.getElementById('admin-detail-name').innerText = `AGENTE: ${name}`;
    document.getElementById('admin-detail-level').innerText = `LVL 0${pState.current_level}`;

    let pct = 0;
    if (pState.current_level === 1) pct = 15;
    else if (pState.current_level === 2) pct = 50;
    else if (pState.current_level === 3) pct = 85;
    if (pState.diario_logs.some(l => l.level_name.includes("Level 3"))) pct = 100;

    document.getElementById('admin-detail-progress-percent').innerText = `${pct}%`;
    document.getElementById('admin-detail-progress-bar').style.width = `${pct}%`;

    const achievementsContainer = document.getElementById('admin-detail-achievements');
    achievementsContainer.innerHTML = "";

    questsConfig.side_quests.forEach(quest => {
        const isCompleted = pState.side_quests_completed.includes(quest.name);

        let cardClass, badgeClass, badgeText, contentColor;
        if (isCompleted) {
            cardClass = "bg-emerald-950/20 border-emerald-500/50 p-4 border relative font-mono text-xs";
            badgeClass = "bg-emerald-950 text-emerald-400 px-2 py-0.5 border border-emerald-500/50 text-[9px] uppercase tracking-widest font-bold";
            badgeText = "CONCLUÍDO";
            contentColor = "text-slate-300";
        } else {
            cardClass = "bg-slate-900/40 border-slate-800 p-4 border opacity-60 relative font-mono text-xs";
            badgeClass = "bg-slate-850 text-slate-500 px-2 py-0.5 border border-slate-800 text-[9px] uppercase tracking-widest";
            badgeText = "EM ANDAMENTO";
            contentColor = "text-slate-500";
        }

        achievementsContainer.innerHTML += `
            <div class="${cardClass}">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-fuchsia-400 uppercase tracking-widest text-[10px]">${quest.name}</span>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
                <p class="${contentColor} text-[11px] leading-relaxed">${quest.description}</p>
            </div>
        `;
    });

    const logsContainer = document.getElementById('admin-detail-logs');
    logsContainer.innerHTML = "";

    if (pState.diario_logs.length === 0) {
        logsContainer.innerHTML = `<p class="italic text-slate-550 text-center py-8 font-mono text-xs uppercase tracking-widest">Nenhum log enviado por este agente.</p>`;
    } else {
        [...pState.diario_logs].reverse().forEach(log => {
            const isSide = log.level_name.includes("Side Quest");
            const headerColor = isSide ? "text-fuchsia-500" : "text-cyan-400";
            const borderColName = isSide ? "border-fuchsia-800" : "border-cyan-800";

            let detailsHtml = "";
            if (log.not_understood !== "N/A") {
                const doubtHighlight = (log.not_understood && log.not_understood.trim() !== "" && log.not_understood.trim().toLowerCase() !== "nenhuma" && log.not_understood.trim().toLowerCase() !== "nada")
                    ? "border border-red-500/30 bg-red-950/20 p-2 text-red-300 font-bold"
                    : "text-slate-400";

                detailsHtml = `
                    <div class="mt-3 space-y-2.5 border-t border-slate-900 pt-3 text-xs">
                        <div>
                            <span class="text-cyan-400 block uppercase font-bold text-[10px]">> Atividade em si:</span>
                            <span class="text-cyan-100">${log.activity_text || ''}</span>
                        </div>
                        <div>
                            <span class="text-cyan-700 block uppercase font-bold text-[10px]">> Aprendizado:</span>
                            <span class="text-slate-300">${log.learned}</span>
                        </div>
                        <div>
                            <span class="text-red-500/80 block uppercase font-bold text-[10px]">> Anomalias (Dúvidas):</span>
                            <div class="${doubtHighlight}">${log.not_understood}</div>
                        </div>
                        <div>
                            <span class="text-emerald-500/80 block uppercase font-bold text-[10px]">> Próximos Passos:</span>
                            <span class="text-slate-400">${log.explore_more}</span>
                        </div>
                    </div>
                `;
            } else {
                detailsHtml = `
                    <div class="mt-2 text-[11px]">
                        <span class="text-fuchsia-600 block uppercase font-bold text-[9px]">> Conteúdo Processado:</span>
                        <span class="text-slate-300">${log.learned}</span>
                    </div>
                `;
            }

            logsContainer.innerHTML += `
                <div class="bg-black/80 border-l-2 ${borderColName} p-4 space-y-1 relative font-mono text-xs">
                    <div class="flex justify-between items-start">
                        <span class="font-bold ${headerColor} uppercase tracking-wider text-[10px]">${log.level_name}</span>
                        <span class="text-[9px] text-slate-600">${log.timestamp || '00:00:00'}</span>
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
        const team = data.team;

        const container = document.getElementById('team-players-list');
        if (!container) return;
        container.innerHTML = '';

        let totalLevels = 0;
        let maxLevelsPossible = team.length * 3;

        if (team.length === 0) {
            container.innerHTML = `<p class="col-span-full text-[10px] text-slate-500 font-mono uppercase">Esquadrão vazio.</p>`;
            return;
        }

        team.forEach(player => {
            totalLevels += player.level;

            // Visual logic for each coworker
            const isMe = player.name === getPlayerName();
            const badgeClass = isMe ? "bg-cyan-950 text-cyan-400 border-cyan-800" : "bg-slate-900 text-slate-400 border-slate-700";
            const borderAccent = isMe ? "border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]" : "border-slate-800 opacity-80";
            const pulse = isMe ? `<span class="animate-pulse w-1.5 h-1.5 bg-cyan-500 inline-block rounded-full"></span>` : ``;

            container.innerHTML += `
                <div class="bg-black/50 p-2 border ${borderAccent} flex items-center justify-between font-mono">
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 truncate">
                        ${pulse} ${player.name}
                    </span>
                    <span class="text-[9px] px-1 py-0.5 border ${badgeClass}">LVL 0${player.level}</span>
                </div>
            `;
        });

        let percent = maxLevelsPossible > 0 ? (totalLevels / maxLevelsPossible) * 100 : 0;
        percent = Math.min(100, Math.round(percent));

        const progressBar = document.getElementById('team-progress-bar');
        const goalText = document.getElementById('team-goal-text');
        const bonusMsg = document.getElementById('team-bonus-message');

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (goalText) goalText.innerText = `META: ${percent}%`;

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
    if (tabName === 'main') {
        document.getElementById('content-main').classList.remove('hidden');
        document.getElementById('content-side').classList.add('hidden');
        document.getElementById('tab-main').className = "bg-cyan-950 text-cyan-400 px-6 py-3 border-t border-l border-r border-cyan-500 font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all";
        document.getElementById('tab-side').className = "bg-black text-slate-500 px-6 py-3 border-t border-l border-r border-slate-800 hover:text-cyan-400 uppercase tracking-widest text-sm font-bold transition-all";
    } else {
        document.getElementById('content-main').classList.add('hidden');
        document.getElementById('content-side').classList.remove('hidden');
        document.getElementById('tab-main').className = "bg-black text-slate-500 px-6 py-3 border-t border-l border-r border-slate-800 hover:text-cyan-400 uppercase tracking-widest text-sm font-bold transition-all";
        document.getElementById('tab-side').className = "bg-cyan-950 text-cyan-400 px-6 py-3 border-t border-l border-r border-cyan-500 font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all";
    }
}

window.onload = init;
