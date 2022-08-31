/**
 * Retorna a quarta-feira do mes mais próxima do dia 15 (Para o WIN)
 */
const winSeries__getQuartas15 = (ano, mes) => {
    let d = new Date(ano, mes, 1),
        wednesdays = [],
        choosen_wed = null;
    // Get the first Wednesday in the month
    while (d.getDay() !== 3) d.setDate(d.getDate() + 1);
    // Get all the other Wednesdays in the month
    while (d.getMonth() === mes) {
        let day = new Date(d.getTime()).getDate();
        wednesdays.push({
            day: day,
            diff: Math.abs(day - 15),
        });
        d.setDate(d.getDate() + 7);
    }
    for (let q in wednesdays) {
        if (choosen_wed === null) choosen_wed = wednesdays[q];
        else if (wednesdays[q].diff < choosen_wed.diff) choosen_wed = wednesdays[q];
    }
    return choosen_wed.day;
};

/**
 * Gera os contratos de vencimentos do WIN para o @ano
 */
const winSeries = (ano) => {
    let today = new Date(),
        p = {},
        periods = [];

    p = { start: {}, end: {}, isCurrent: false, letter: 'G' };
    p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(today.getMonth() === 11 ? ano : ano - 1, 11, 1));
    p.start.d = winSeries__getQuartas15(today.getMonth() === 11 ? ano : ano - 1, 11);
    p.end.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(today.getMonth() === 11 ? ano + 1 : ano, 1, 1));
    p.end.d = winSeries__getQuartas15(today.getMonth() === 11 ? ano + 1 : ano, 1) - 1;
    // Para segunda parte de Dezembro OU Para Janeiro OU Para primeira parte de Fevereiro
    if (today.getFullYear() === ano)
        p.isCurrent = (today.getMonth() === 11 && today.getDate() >= p.start.d) || today.getMonth() === 0 || (today.getMonth() === 1 && today.getDate() <= p.end.d);
    periods.push(p);
    //Fev - Abr
    p = { start: {}, end: {}, isCurrent: false, letter: 'J' };
    p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 1, 1));
    p.start.d = winSeries__getQuartas15(ano, 1);
    p.end.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 3, 1));
    p.end.d = winSeries__getQuartas15(ano, 3) - 1;
    // Para segunda parte de Fevereiro OU Para Março OU Para primeira parte de Abril
    if (today.getFullYear() === ano)
        p.isCurrent = (today.getMonth() === 1 && today.getDate() >= p.start.d) || today.getMonth() === 2 || (today.getMonth() === 3 && today.getDate() <= p.end.d);
    periods.push(p);
    //Abr - Jun
    p = { start: {}, end: {}, isCurrent: false, letter: 'M' };
    p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 3, 1));
    p.start.d = winSeries__getQuartas15(ano, 3);
    p.end.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 5, 1));
    p.end.d = winSeries__getQuartas15(ano, 5) - 1;
    // Para segunda parte de Abril OU Para Maio OU Para primeira parte de Junho
    if (today.getFullYear() === ano)
        p.isCurrent = (today.getMonth() === 3 && today.getDate() >= p.start.d) || today.getMonth() === 4 || (today.getMonth() === 5 && today.getDate() <= p.end.d);
    periods.push(p);
    //Jun - Ago
    p = { start: {}, end: {}, isCurrent: false, letter: 'Q' };
    p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 5, 1));
    p.start.d = winSeries__getQuartas15(ano, 5);
    p.end.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 7, 1));
    p.end.d = winSeries__getQuartas15(ano, 7) - 1;
    // Para segunda parte de Junho OU Para Julho OU Para primeira parte de Agosto
    if (today.getFullYear() === ano)
        p.isCurrent = (today.getMonth() === 5 && today.getDate() >= p.start.d) || today.getMonth() === 6 || (today.getMonth() === 7 && today.getDate() <= p.end.d);
    periods.push(p);
    //Ago - Out
    p = { start: {}, end: {}, isCurrent: false, letter: 'V' };
    p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 7, 1));
    p.start.d = winSeries__getQuartas15(ano, 7);
    p.end.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 9, 1));
    p.end.d = winSeries__getQuartas15(ano, 9) - 1;
    // Para segunda parte de Agosto OU Para Setembro OU Para primeira parte de Outubro
    if (today.getFullYear() === ano)
        p.isCurrent = (today.getMonth() === 7 && today.getDate() >= p.start.d) || today.getMonth() === 8 || (today.getMonth() === 9 && today.getDate() <= p.end.d);
    periods.push(p);
    //Out - Dez
    p = { start: {}, end: {}, isCurrent: false, letter: 'Z' };
    p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 9, 1));
    p.start.d = winSeries__getQuartas15(ano, 9);
    p.end.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, 11, 1));
    p.end.d = winSeries__getQuartas15(ano, 11) - 1;
    // Para segunda parte de Outubro OU Para Novembro OU Para primeira parte de Dezembro
    if (today.getFullYear() === ano)
        p.isCurrent = (today.getMonth() === 9 && today.getDate() >= p.start.d) || today.getMonth() === 10 || (today.getMonth() === 11 && today.getDate() <= p.end.d);
    periods.push(p);
    return periods;
};

/**
 * Gera os contratos de vencimentos do WDO para o @ano
 */
const wdoSeries = (ano) => {
    let today = new Date(),
        p = {},
        periods = [],
        series = ['G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z', 'F'];

    for (let m = 0; m < 12; m++) {
        p = { start: {}, end: {}, isCurrent: false, letter: series[m] };
        p.start.m = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ano, m, 1));
        p.start.d = new Date(ano, m, 1).getDate();
        p.end.m = p.start.m;
        p.end.d = new Date(ano, m + 1, 0).getDate();
        p.isCurrent = today.getFullYear() === ano && today.getMonth() === m;
        periods.push(p);
    }
    return periods;
};

export { winSeries, wdoSeries };
