document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
});
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
});

// Função para carregar um arquivo HTML
async function carregarHTML(url, elementoId) {
    const response = await fetch(url); // Busca o conteúdo do arquivo
    const html = await response.text(); // Converte a resposta para texto (HTML)
    document.getElementById(elementoId).innerHTML = html; // Insere na div
     // ⚡ Re-renderiza os ícones Lucide dentro do conteúdo carregado
    lucide.createIcons();
}


// Chama a função para carregar o cabeçalho
carregarHTML('coluna_direita.html', 'top10alunos');
carregarHTML('cabecalho.html', 'cabecalho');