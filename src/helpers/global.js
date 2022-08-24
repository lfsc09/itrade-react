/**
 * Gera um Hash de tamanho @len
 */
const generateHash = (len) => {
    return Math.random().toString(16).substr(2, len);
};

/**
 * Gera um setTimout de @delay milisegundos (Para simulações apenas)
 */
const sleep = (delay) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
};

/**
 * Verifica se um Object @obj é vazio
 */
const isObjectEmpty = (obj) => {
    for (let key in obj) return false;
    return true;
};

/**
 * Utilizados em @formatValue_fromRaw
 */
const currencyFormatter_toB1 = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
const percentFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    roundingMode: 'trunc',
    maximumFractionDigits: 2,
});
const datetimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
});

/**
 * Formata Dados para Human Read
 *
 * @example currency (4000.65) => (4.000,65)
 * @example percent (0.545) => (54.50%)
 * @example date (2000-00-00) => (00/00/2000)
 * @example datetime (2000-00-00 00:00:00) => (00/00/2000 00:00:00)
 *
 * @param {*} options : Opções para escolha de formatações
 * @param {*} value   : Valor a ser formatado
 */
const formatValue_fromRaw = (options, value) => {
    if (!options.hasOwnProperty('style')) console.error(`formatValue_fromRaw: Opção 'styles' não informado.`);
    if (options.style === 'currency') {
        if (!options.hasOwnProperty('type')) console.error(`formatValue_fromRaw: Opção 'type' não informado para style:'currency'.`);
        // R$ 4.000,00
        if (options.type === 'B1') return currencyFormatter_toB1.format(value);
    }
    // 50%, 50.04%
    if (options.style === 'percent') return percentFormatter.format(value);
    // 00/00/0000
    if (options.style === 'date') {
        if (value === '0000-00-00') return '';
        const fDate = new Date(value);
        if (!options.hasOwnProperty('options')) return fDate.toLocaleDateString('pt-BR');
        return fDate.toLocaleDateString('pt-BR', options.options);
    }
    if (options.style === 'datetime') {
        if (value === '0000-00-00 00:00:00' || value === '0000-00-00T00:00:00Z') return '';
        //Fix para converter do MySql para UTC (0000-00-00 00:00:00) => (0000-00-00T00:00:00Z)
        const fixValue = value.search(/Z$/) === -1 ? value.replace(' ', 'T') + 'Z' : value;
        const fDatetime = new Date(fixValue);
        return datetimeFormatter.format(fDatetime);
    }
};

export { generateHash, sleep, isObjectEmpty, formatValue_fromRaw };
