/**
 * Retorna a quarta-feira do mes mais próxima do dia 15 (Para o WIN)
 * @param int ano
 * @param int mes
 * @returns int
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
 * Constroi a tabela de vencimentos do WIN
 * @param int ano
 */
const winSeries = (ano) => {
    let today = new Date(),
        first_day = null,
        last_day = null,
        periods = [];
    //Dez - Fev
    first_day = winSeries__getQuartas15(ano - 1, 11);
    last_day = winSeries__getQuartas15(ano, 1) - 1;
    data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
        new Date(ano - 1, 11, 1)
    )} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
        new Date(ano, 1, 1)
    )} <span class="daylish">${last_day}</span>`;
    if (today.getFullYear() == ano) {
        serie_class = '';
        //Para segunda parte de Dezembro
        if (today.getMonth() == 11 && today.getDate() >= winSeries__getQuartas15(ano, 11)) serie_class = ' class="table-success"';
        //Para Janeiro
        else if (today.getMonth() == 0) serie_class = ' class="table-success"';
        //Para primeira parte de Fevereiro
        else if (today.getMonth() == 1 && today.getDate() <= last_day) serie_class = ' class="table-success"';
    }
};

export { winSeries };
