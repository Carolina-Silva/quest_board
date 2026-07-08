let activeMissionName = "";
let activeSideQuestName = "";
let questsConfig = { main_quests: [], side_quests: [] };

function getPlayerName() {
    return localStorage.getItem('player_name');
}

function logout() {
    localStorage.removeItem('player_name');
    init();
}

async function init() {
    const playerName = getPlayerName();
    
    if (!playerName) {
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('main-board').classList.add('hidden');
        return;
    }

    const cfgRes = await fetch(`/api/quests?player_name=${encodeURIComponent(playerName)}`);
    questsConfig = await cfgRes.json();

    const res = await fetch(`/api/status?player_name=${encodeURIComponent(playerName)}`);
    
    if (res.status === 404 || res.status === 400) {
        // Player not found or bad request, reset session
        logout();
        return;
    }
    
    const data = await res.json();
    
    if (!data.mission_accepted) {
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('main-board').classList.add('hidden');
    } else {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('main-board').classList.remove('hidden');
        document.getElementById('board-title').innerText = `OPERADOR: ${data.player_name}`;
        renderQuests(data);
        updateDashboard(data);
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
        headers: {'Content-Type': 'application/json'},
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
            cardClass = "bg-black/60 p-6 border border-emerald-500/30 opacity-75 relative";
            badgeClass = "text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/50 uppercase tracking-widest";
            badgeText = "VERIFICADO";
            btnHidden = "hidden";
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
                <p class="text-sm mb-6 font-mono leading-relaxed ${quest.id === currentLevel ? 'text-cyan-100/90' : 'text-slate-500'}">${quest.description}</p>
                ${deliverablesHtml}
                <button onclick="openDiario('${quest.title}')" class="${btnHidden} w-full md:w-auto bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono text-xs font-bold px-6 py-2 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] uppercase tracking-widest">
                    ${quest.btn_text || 'Finalizar e Enviar Log'}
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
            if(isSideQuest) {
                headerColor = "text-fuchsia-500";
                logEl.className = "bg-black/50 p-3 border-l-2 border-fuchsia-800 space-y-1 mb-2 hover:bg-slate-900/50 transition-colors";
            }
            
            let contentHtml = `<p class="mt-1"><span class="text-slate-500 text-[10px]">> OUT:</span> <span class="text-slate-300">${log.learned}</span></p>`;
            if (log.not_understood !== "N/A") {
                contentHtml = `
                    <div class="mt-2 space-y-1 border-t border-slate-900 pt-1">
                        <p><span class="text-cyan-800 text-[9px] uppercase tracking-widest">> Acquired:</span> <span class="text-slate-300">${log.learned}</span></p>
                        <p><span class="text-red-900/80 text-[9px] uppercase tracking-widest">> Errors:</span> <span class="text-slate-400">${log.not_understood}</span></p>
                        <p><span class="text-emerald-900/80 text-[9px] uppercase tracking-widest">> Next_Target:</span> <span class="text-slate-400">${log.explore_more}</span></p>
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

function openDiario(missionName) {
    activeMissionName = missionName;
    document.getElementById('modal-target-mission').innerText = `ALVO DE TRANSMISSÃO: ${missionName}`;
    document.getElementById('modal-diario').classList.remove('hidden');
}

function closeDiario() {
    document.getElementById('modal-diario').classList.add('hidden');
    document.getElementById('form-learned').value = "";
    document.getElementById('form-not-understood').value = "";
    document.getElementById('form-explore-more').value = "";
}

async function submitDiario() {
    const learned = document.getElementById('form-learned').value.trim();
    const notUnderstood = document.getElementById('form-not-understood').value.trim();
    const exploreMore = document.getElementById('form-explore-more').value.trim();
    const playerName = getPlayerName();

    if(!learned || !notUnderstood || !exploreMore) {
        alert('ERRO DE TRANSMISSÃO: PACOTES DE DADOS INCOMPLETOS.');
        return;
    }

    await fetch('/api/diario', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            player_name: playerName,
            level_name: activeMissionName,
            learned: learned,
            not_understood: notUnderstood,
            explore_more: exploreMore
        })
    });

    await fetch('/api/next-level', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ player_name: playerName })
    });
    
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

    if(!text) {
        alert('ERRO DE PROCESSAMENTO: CONTEÚDO VAZIO.');
        return;
    }

    await fetch('/api/side-quest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            player_name: playerName,
            quest_name: activeSideQuestName,
            delivery_text: text
        })
    });

    closeSideQuest();
    init(); // Re-fetch all and render
}

window.onload = init;
