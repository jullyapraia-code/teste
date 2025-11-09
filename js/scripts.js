const DEFAULT_DOLLAR_RATE = 5.0;
const PLATFORM_FEE_RATE = 0.015;
const AUTO_UPDATE_MS = 30 * 60 * 1000;
const API_PRIMARY =
    "https://api.exchangerate.host/latest?base=USD&symbols=BRL";
const API_FALLBACK = "https://api.frankfurter.app/latest?from=USD&to=BRL";

let currentDollarRate = DEFAULT_DOLLAR_RATE;
const cotacaoElement = document.getElementById("cotacao-dolar");
const descontoUsdEl = document.getElementById("desconto-usd");
const brutoUsdEl = document.getElementById("total-bruto-usd");
const liquidoBrlEl = document.getElementById("total-liquido-brl");
const btnRefresh = document.getElementById("btn-refresh");
const iconRefresh = document.getElementById("icon-refresh");

function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
function formatUSD(value) {
    return value.toFixed(2).replace(".", ",");
}

function calculateMetrics(totalBrutoAntesTaxa = 10.0) {
    const descontoUSD = totalBrutoAntesTaxa * PLATFORM_FEE_RATE;
    const totalLiquidoUSD = totalBrutoAntesTaxa - descontoUSD;
    const totalLiquidoBRL = totalLiquidoUSD * currentDollarRate;

    descontoUsdEl.textContent = `US$ ${formatUSD(descontoUSD)}`;
    brutoUsdEl.textContent = `US$ ${formatUSD(totalLiquidoUSD)}`;
    liquidoBrlEl.textContent = `R$ ${formatBRL(totalLiquidoBRL)}`;
}

async function fetchJson(url) {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error("Erro HTTP: " + resp.status);
    return resp.json();
}

async function getDollarRate() {
    try {
        const data = await fetchJson(API_PRIMARY);
        if (data?.rates?.BRL) return data.rates.BRL;
        throw new Error("Formato inesperado (primária)");
    } catch {
        const data2 = await fetchJson(API_FALLBACK);
        if (data2?.rates?.BRL) return data2.rates.BRL;
        throw new Error("Formato inesperado (fallback)");
    }
}

async function updateDollarRate(showSpinner = false) {
    if (showSpinner) iconRefresh.classList.add("spinning");
    try {
        const rate = await getDollarRate();
        currentDollarRate = Math.round(rate * 100) / 100;
        cotacaoElement.textContent = `R$ ${formatBRL(currentDollarRate)}`;
        cotacaoElement.classList.remove("text-red-400", "text-yellow-400");
        cotacaoElement.classList.add("text-green-300");
        calculateMetrics();
    } catch (err) {
        console.error("Erro ao buscar cotação:", err);
        cotacaoElement.textContent = `R$ ${formatBRL(
            currentDollarRate
        )} (erro)`;
        cotacaoElement.classList.remove("text-green-300", "text-yellow-400");
        cotacaoElement.classList.add("text-red-400");
    } finally {
        if (showSpinner) iconRefresh.classList.remove("spinning");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    calculateMetrics();
    updateDollarRate(false);
    setInterval(() => updateDollarRate(false), AUTO_UPDATE_MS);
    btnRefresh.addEventListener("click", () => updateDollarRate(true));

    // Garante que os ícones e a lógica inicial sejam carregados
    lucide.createIcons();
    carregarDashboard();

    console.log("---------------------------------------");
    console.log("LOG: Lógica de Risco Atualizada:");
    console.log("  - Ausente: 1 a 30 dias (Amarelo)");
    console.log("  - Risco Crítico: 31 a 90 dias (Vermelho)");
    console.log("  - Desistente: 91+ dias (Cinza)");
    console.log("---------------------------------------");
});

// Função para carregar um arquivo HTML
async function carregarHTML(url, elementoId) {
    const response = await fetch(url); // Busca o conteúdo do arquivo
    const html = await response.text(); // Converte a resposta para texto (HTML)
    document.getElementById(elementoId).innerHTML = html; // Insere na div
    // ⚡ Re-renderiza os ícones Lucide dentro do conteúdo carregado
    lucide.createIcons();
    carregarDashboard();
}

// =================================================================
// 1. MODELO DE DADOS E ESTADO DA APLICAÇÃO
// =================================================================
// Dados de Exemplo Ajustados para testar os novos limites de 31-90 e 91+
let alunosData = [
    { id: 101, nome: "Ana Silva", pais: "Brasil", aulasTotal: 25, nivelCEFR: "C2", descNivel: "(Proficiência)", ultimaAulaDias: 5, rankPontos: 950, status: "Ativo" },
    { id: 102, nome: "João Melo", pais: "EUA", aulasTotal: 22, nivelCEFR: "B2", descNivel: "(Interm. Superior)", ultimaAulaDias: 10, rankPontos: 880, status: "Ativo" },
    { id: 103, nome: "Juliana Santos", pais: "Canadá", aulasTotal: 18, nivelCEFR: "C1", descNivel: "(Avançado)", ultimaAulaDias: 15, rankPontos: 820, status: "Ativo" },
    { id: 104, nome: "Joyce Souza", pais: "Japão", aulasTotal: 15, nivelCEFR: "A2", descNivel: "(Básico)", ultimaAulaDias: 20, rankPontos: 750, status: "Ausente" }, // 20 dias (Ausente: 1-30)
    { id: 105, nome: "Júnior Pereira", pais: "Brasil", aulasTotal: 14, nivelCEFR: "B1", descNivel: "(Intermediário)", ultimaAulaDias: 25, rankPontos: 680, status: "Ausente" }, // 25 dias (Ausente: 1-30)
    { id: 106, nome: "Jamile Costa", pais: "Portugal", aulasTotal: 12, nivelCEFR: "B2", descNivel: "(Interm. Superior)", ultimaAulaDias: 30, rankPontos: 610, status: "Ausente" }, // 30 dias (Ausente: 1-30)

    // Novos limites de Risco Crítico (31-90 dias)
    { id: 107, nome: "Ricardo L.", pais: "Espanha", aulasTotal: 10, nivelCEFR: "C1", descNivel: "(Avançado)", ultimaAulaDias: 35, rankPontos: 480, status: "Critico" }, // 35 dias (Critico: 31-90)
    { id: 108, nome: "Beatriz M.", pais: "Itália", aulasTotal: 9, nivelCEFR: "A2", descNivel: "(Básico)", ultimaAulaDias: 40, rankPontos: 450, status: "Critico" }, // 40 dias (Critico: 31-90)
    { id: 109, nome: "Cássio N.", pais: "Alemanha", aulasTotal: 8, nivelCEFR: "B1", descNivel: "(Intermediário)", ultimaAulaDias: 50, rankPontos: 400, status: "Critico" }, // 50 dias (Critico: 31-90)
    { id: 110, nome: "Thiago A.", pais: "Chile", aulasTotal: 7, nivelCEFR: "A2", descNivel: "(Básico)", ultimaAulaDias: 70, rankPontos: 350, status: "Critico" }, // 70 dias (Critico: 31-90)
    { id: 124, nome: "Úrsula A.", pais: "Costa Rica", aulasTotal: 12, nivelCEFR: "C1", descNivel: "(Avançado)", ultimaAulaDias: 90, rankPontos: 550, status: "Critico" }, // 90 dias (Critico: 31-90)

    // Novos limites de Desistente (91+ dias)
    { id: 125, nome: "Vinicius B.", pais: "Honduras", aulasTotal: 10, nivelCEFR: "A2", descNivel: "(Básico)", ultimaAulaDias: 95, rankPontos: 250, status: "Desistente" }, // 95 dias (Desistente: 91+)
    { id: 126, nome: "Wallace C.", pais: "Nicarágua", aulasTotal: 8, nivelCEFR: "B1", descNivel: "(Intermediário)", ultimaAulaDias: 100, rankPontos: 180, status: "Desistente" }, // 100 dias (Desistente: 91+)

    // Outros alunos ativos/ausentes para preencher as listas
    { id: 111, nome: "Felipe Gama", pais: "México", aulasTotal: 3, nivelCEFR: "A1", descNivel: "(Iniciante)", ultimaAulaDias: 10, rankPontos: 150, status: "Ativo" },
    { id: 112, nome: "Gustavo O.", pais: "Itália", aulasTotal: 1, nivelCEFR: "A1", descNivel: "(Iniciante)", ultimaAulaDias: 5, rankPontos: 100, status: "Ativo" },
    { id: 113, nome: "Helena P.", pais: "Alemanha", aulasTotal: 30, nivelCEFR: "B2", descNivel: "(Interm. Superior)", ultimaAulaDias: 12, rankPontos: 990, status: "Ativo" },
    { id: 114, nome: "Igor Q.", pais: "França", aulasTotal: 17, nivelCEFR: "C1", descNivel: "(Avançado)", ultimaAulaDias: 18, rankPontos: 800, status: "Ausente" }, // 18 dias
    { id: 115, nome: "Larissa R.", pais: "Argentina", aulasTotal: 13, nivelCEFR: "A2", descNivel: "(Básico)", ultimaAulaDias: 22, rankPontos: 700, status: "Ausente" }, // 22 dias
    { id: 116, nome: "Matheus S.", pais: "Colômbia", aulasTotal: 11, nivelCEFR: "B1", descNivel: "(Intermediário)", ultimaAulaDias: 27, rankPontos: 600, status: "Ausente" }, // 27 dias
];

const RANKS = ["Challenger", "Grandmaster", "Master", "Diamond", "Emerald", "Platinum", "Gold", "Silver", "Bronze", "Iron"];
const CEFR_DESCRIPTIONS = { "C2": "Proficiência", "C1": "Avançado", "B2": "Interm. Superior", "B1": "Intermediário", "A2": "Básico", "A1": "Iniciante" };

let currentAlunoId = null; // Armazena o ID do aluno atualmente visualizado
let currentFilterTerm = ''; // Armazena o termo de busca atual

// =================================================================
// 2. FUNÇÕES DE RENDERIZAÇÃO E CLASSIFICAÇÃO
// =================================================================

function getRankClass(index) {
    const rankName = RANKS[index];
    if (!rankName) return 'rank-iron';
    return `rank-${rankName.toLowerCase()}`;
}

function createStudentListItemHTML(aluno, index, isRanked = false) {
    const rankName = isRanked ? RANKS[index] : '';
    const rankClass = isRanked ? `rank-badge ${getRankClass(index)}` : 'hidden';

    // Ícone e cor de status na lista geral
    let statusIconHTML = '';
    let statusColor = 'text-white';
    let subtitle = `${aluno.aulasTotal} Aulas | ${aluno.pais}`;

    if (aluno.status === 'Ausente') {
        // Ausentes (1-30 dias) - AMARAELO
        statusIconHTML = '<i data-lucide="mail-plus" class="w-4 h-4 ml-2 text-yellow-400"></i>';
        statusColor = 'text-yellow-400';
        subtitle += ` | Ausente há ${aluno.ultimaAulaDias} dias`;
    } else if (aluno.status === 'Critico') {
        // Risco Crítico (31-90 dias) - VERMELHO
        statusIconHTML = '<i data-lucide="alert-octagon" class="w-4 h-4 ml-2 text-red-500"></i>';
        statusColor = 'text-red-500';
        subtitle += ` | Risco Crítico (${aluno.ultimaAulaDias} dias)`;
    } else if (aluno.status === 'Desistente') {
        // Desistentes (91+ dias) - CINZA
        statusIconHTML = '<i data-lucide="archive" class="w-4 h-4 ml-2 text-slate-400"></i>';
        statusColor = 'text-slate-400';
        subtitle += ` | Desistente (${aluno.ultimaAulaDias} dias)`;
    }

    return `
                <a href="#" onclick="openStudentProfile(${aluno.id}); return false;" class="p-2 flex justify-between items-center bg-slate-700/50 hover:bg-slate-700 rounded-md transition duration-150">
                    <div class="flex flex-col leading-snug">
                        <span class="truncate font-semibold ${statusColor} flex items-center">
                            ${isRanked ? `${index + 1}. ` : ''}${aluno.nome} 
                            ${statusIconHTML}
                        </span>
                        <span class="text-xs text-slate-400">${subtitle}</span>
                    </div>
                    <span class="text-xs font-bold text-indigo-300">Nível ${aluno.nivelCEFR}</span>
                </a>
            `;
}


/**
 * FUNÇÃO PRINCIPAL: RECARREGA TODO O DASHBOARD
 */
function carregarDashboard() {
    // Recálculo de Status e Ranks
    const dadosClassificados = classificarAlunos();

    // Renderização de Colunas
    renderizarColunaEsquerda(alunosData); // Renderiza a lista completa, que será filtrada
    renderizarColunaCentral(alunosData, dadosClassificados.top10.length);
    renderizarColunaDireita(dadosClassificados);

    lucide.createIcons();
    console.log("-> Dashboard Recarregado e Classificado.");
}


/**
 * Renderiza a Coluna Esquerda (Lista Geral e Busca)
 */
function renderizarColunaEsquerda(dataToRender) {
    const listContainer = document.getElementById('lista-alunos-geral');
    const totalMetrics = document.getElementById('total-alunos-aulas');

    const totalAlunos = alunosData.length;
    const totalAulas = alunosData.reduce((sum, aluno) => sum + aluno.aulasTotal, 0);

    // 1. Métrica Total de Alunos e Aulas
    totalMetrics.innerHTML = `
                 <span class="text-indigo-300 flex items-center">
                     <i data-lucide="users" class="w-4 h-4 mr-1"></i> ${totalAlunos} Alunos
                 </span>
                 <span class="text-yellow-300 flex items-center">
                     <i data-lucide="award" class="w-4 h-4 mr-1"></i> ${totalAulas} Aulas
                 </span>
             `;

    // 2. Renderiza a Lista (Filtrada ou Completa)
    listContainer.innerHTML = '';
    if (dataToRender.length === 0) {
        listContainer.innerHTML = `<p class="placeholder-text">Nenhum aluno encontrado com o termo: "${currentFilterTerm}"</p>`;
        return;
    }

    dataToRender.forEach(aluno => {
        listContainer.innerHTML += createStudentListItemHTML(aluno);
    });
    lucide.createIcons();
}

/**
 * Renderiza a Coluna Central (Gráficos e Últimas Aulas)
 */
function renderizarColunaCentral(alunos, totalTop10) {
    // Placeholder para Gráficos
    document.getElementById('metricas-e-graficos').querySelector('.placeholder-text').innerText =
        `Gráficos Donut (Engajamento e Nível). Top 10 Alunos: ${totalTop10}.`;

    // Últimas Aulas Registradas
    // Filtra por alunos ativos ou ausentes (para não mostrar desistentes nesta lista)
    const ultimasAulas = alunos
        .filter(a => a.ultimaAulaDias <= 30)
        .sort((a, b) => b.ultimaAulaDias - a.ultimaAulaDias)
        .slice(0, 5);

    const ultimasAulasList = document.getElementById('ultimas-aulas-list');
    ultimasAulasList.innerHTML = '';

    if (ultimasAulas.length === 0) {
        ultimasAulasList.innerHTML = '<li class="text-slate-400">Nenhuma aula recente nos últimos 30 dias.</li>';
    } else {
        ultimasAulas.forEach(aluno => {
            ultimasAulasList.innerHTML += `
                        <li class="flex justify-between items-center p-1 rounded-sm bg-slate-700/30">
                            <span class="font-medium text-slate-200">${aluno.nome}</span>
                            <span class="text-xs text-green-400">Inativo há ${aluno.ultimaAulaDias} dias</span>
                        </li>
                    `;
        });
    }
}

/**
 * Renderiza a Coluna Direita (Rankings) - Aplicando Limites de 6 Alunos
 */
function renderizarColunaDireita(dadosClassificados) {
    // TOP 10 (Limite de 10)
    const top10List = document.getElementById('top-10-alunos-list');
    top10List.innerHTML = '';
    dadosClassificados.top10.forEach((aluno, index) => {
        top10List.innerHTML += createStudentListItemHTML(aluno, index, true);
    });

    // AUSENTES (Limite de 6)
    const ausentesList = document.getElementById('ausentes-alunos-list');
    ausentesList.innerHTML = dadosClassificados.ausentes.slice(0, 6).map(a => createStudentListItemHTML(a)).join('');

    // RISCO CRÍTICO (Limite de 6)
    const riscoList = document.getElementById('risco-alunos-list');
    riscoList.innerHTML = dadosClassificados.riscoCritico.slice(0, 6).map(a => createStudentListItemHTML(a)).join('');

    // DESISTENTES (Limite de 6)
    const desistentesList = document.getElementById('desistentes-alunos-list');
    desistentesList.innerHTML = dadosClassificados.desistentes.slice(0, 6).map(a => createStudentListItemHTML(a)).join('');

    lucide.createIcons();
}

/**
 * Lógica de Classificação (Calcula Risco e Rank) - AJUSTADA CONFORME NOVO REQUISITO
 */
function classificarAlunos() {
    alunosData.forEach(aluno => {
        // Alunos que abandonaram (desistentes) são 91+ dias
        if (aluno.ultimaAulaDias >= 91) {
            aluno.status = 'Desistente';
        }
        // Alunos em risco crítico são 31 a 90 dias
        else if (aluno.ultimaAulaDias >= 31 && aluno.ultimaAulaDias <= 90) {
            aluno.status = 'Critico';
        }
        // Alunos ausentes são 1 a 30 dias
        else if (aluno.ultimaAulaDias >= 1 && aluno.ultimaAulaDias <= 30) {
            aluno.status = 'Ausente';
        } else {
            aluno.status = 'Ativo';
        }
    });

    // Classifica Top 10 (excluindo Desistentes)
    const top10 = alunosData
        .filter(a => a.status !== 'Desistente')
        .sort((a, b) => b.rankPontos - a.rankPontos)
        .slice(0, 10); // Mantém o limite de 10

    // Classifica os grupos de Risco/Ausência
    const ausentes = alunosData.filter(a => a.status === 'Ausente');
    const riscoCritico = alunosData.filter(a => a.status === 'Critico');
    const desistentes = alunosData.filter(a => a.status === 'Desistente');

    // Importante: A limitação de .slice(0, 6) é feita na função renderizarColunaDireita()
    // para que a classificação completa permaneça aqui para fins de referência.

    return { top10, ausentes, riscoCritico, desistentes };
}


// =================================================================
// 3. FUNÇÕES DE FLUXO E PERFIL (ABRIR/FECHAR)
// =================================================================

/**
 * Abre a tela de perfil do aluno (Substitui a Dashboard)
 * @param {number} id - ID do aluno clicado
 */
function openStudentProfile(id) {
    const aluno = alunosData.find(a => a.id === id);
    if (!aluno) return;

    currentAlunoId = id;

    // Esconde Dashboard, Mostra Perfil
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('profile-view').classList.remove('hidden');

    // Preenche o Perfil
    document.getElementById('profile-name-header').innerText = `Perfil de ${aluno.nome}`;

    // Simulação da estrutura de blocos A, B, C, D, E
    document.getElementById('profile-content').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Bloco A: Informações Principais -->
                    <div class="panel bg-slate-700 p-4">
                        <h4 class="text-lg font-semibold text-indigo-300 border-b border-indigo-600 mb-2">Bloco A: Básico</h4>
                        <p><strong>ID:</strong> ${aluno.id}</p>
                        <p><strong>Nome:</strong> ${aluno.nome}</p>
                        <p><strong>País:</strong> ${aluno.pais}</p>
                        <p><strong>Status Atual:</strong> <span class="font-bold text-green-400">${aluno.status}</span></p>
                    </div>
                    <!-- Bloco B: Performance e Rank -->
                    <div class="panel bg-slate-700 p-4">
                        <h4 class="text-lg font-semibold text-yellow-300 border-b border-yellow-600 mb-2">Bloco B: Performance</h4>
                        <p><strong>Aulas Concluídas:</strong> ${aluno.aulasTotal}</p>
                        <p><strong>Pontuação Rank:</strong> ${aluno.rankPontos}</p>
                        <p><strong>Última Aula:</strong> ${aluno.ultimaAulaDias} dias atrás</p>
                    </div>
                </div>
                <!-- Blocos C, D, E... (Placeholder) -->
                <div class="panel bg-slate-700 p-4">
                    <h4 class="text-lg font-semibold text-slate-300 border-b border-slate-600 mb-2">Blocos C, D, E: Detalhes do Questionário</h4>
                    <p class="text-sm">Aqui seriam exibidos os dados detalhados de nível, objetivo, histórico e filhos (vindos do questionário.html).</p>
                    <p class="text-sm mt-2 text-indigo-400">Nível CEFR: ${aluno.nivelCEFR} (${aluno.descNivel})</p>
                </div>
            `;
    lucide.createIcons();
}

/**
 * Volta para a tela principal (Dashboard)
 */
function voltarParaDashboard() {
    document.getElementById('profile-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    currentAlunoId = null;
    carregarDashboard(); // Recarrega para garantir que os dados estejam atualizados
}

// =================================================================
// 4. FUNÇÕES DE AÇÃO (Botões do Perfil)
// =================================================================

/**
 * Registra uma nova aula a partir da tela de Perfil.
 */
function registrarNovaAulaFromProfile() {
    if (!currentAlunoId) return;

    const aluno = alunosData.find(a => a.id === currentAlunoId);
    if (aluno) {
        aluno.aulasTotal += 1;
        aluno.rankPontos += 100; // Pontuação maior para aula
        aluno.ultimaAulaDias = 0;

        // Não usamos alert(), mas simulamos uma notificação
        const notificationMessage = `Aula registrada com sucesso para ${aluno.nome}! Pontos atualizados.`;
        console.log(notificationMessage);

        // Recarrega o perfil para refletir a mudança
        openStudentProfile(currentAlunoId);
        carregarDashboard();
    }
}

/**
 * Simulação da função Editar (Placeholder)
 */
function editarAlunoProfile() {
    console.log("Funcionalidade de Edição ativada. Você poderia abrir um formulário pré-preenchido aqui.");
}


/**
 * Abre o modal customizado para confirmar exclusão.
 */
function confirmarExclusao() {
    const aluno = alunosData.find(a => a.id === currentAlunoId);
    if (!aluno) return;

    document.getElementById('modal-message').innerHTML = `Tem certeza que deseja excluir o aluno <span class="font-bold text-red-400">${aluno.nome}</span>? Esta ação é irreversível e o rank será recalculado.`;
    document.getElementById('custom-modal').classList.add('flex');
    document.getElementById('custom-modal').classList.remove('hidden');
}

/**
 * Executa a ação de exclusão (chamada pelo botão do modal)
 */
function executeModalAction() {
    closeModal();
    excluirAluno(currentAlunoId);
    voltarParaDashboard();
}

/**
 * Fecha o modal customizado.
 */
function closeModal() {
    document.getElementById('custom-modal').classList.remove('flex');
    document.getElementById('custom-modal').classList.add('hidden');
}

/**
 * Remove o aluno do array (Lógica principal de exclusão).
 * @param {number} alunoId - ID do aluno a ser removido.
 */
function excluirAluno(alunoId) {
    const alunoIndex = alunosData.findIndex(a => a.id === alunoId);
    if (alunoIndex !== -1) {
        const alunoExcluido = alunosData[alunoIndex].nome;
        alunosData.splice(alunoIndex, 1);
        console.log(`-> FUNCIONALIDADE: Aluno ${alunoExcluido} EXCLUÍDO. Recalculando Rank...`);
        // O carregarDashboard() é chamado ao voltar, garantindo o recálculo
        return true;
    }
    return false;
}

/**
 * Filtra a lista de alunos (Busca Inteligente).
 */
function filtrarAlunos(termo) {
    currentFilterTerm = termo.trim();
    const lowerCaseTermo = currentFilterTerm.toLowerCase();

    const filteredData = alunosData.filter(aluno =>
        aluno.nome.toLowerCase().includes(lowerCaseTermo)
    );

    // Se o usuário apagar tudo, a lista volta a ser completa
    if (currentFilterTerm === '') {
        renderizarColunaEsquerda(alunosData);
    } else {
        renderizarColunaEsquerda(filteredData);
    }
}

// =================================================================
// 5. FUNÇÕES DE IMPORTAÇÃO/EXPORTAÇÃO (JSON)
// =================================================================

/**
 * Exporta os dados atuais para um arquivo JSON.
 */
function exportData() {
    const dataStr = JSON.stringify(alunosData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'alunos_dashboard.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    console.log("Dados exportados com sucesso para 'alunos_dashboard.json'!");
}

/**
 * Importa dados de um arquivo JSON.
 */
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                alunosData = importedData;
                console.log(`Sucesso! ${importedData.length} alunos importados.`);
                carregarDashboard();
            } else {
                console.error("Erro: O arquivo JSON não contém uma lista válida de alunos.");
            }
        } catch (error) {
            console.error("Erro ao ler o arquivo JSON: " + error.message);
        }
    };
    reader.readAsText(file);
}


// Chama a função para carregar o cabeçalho
carregarHTML('coluna_esquerda.html', 'coluna_esquerda');
carregarHTML('coluna_centro.html', 'coluna_centro');

carregarHTML('coluna_direita.html', 'top10alunos');
carregarHTML('cabecalho.html', 'cabecalho');