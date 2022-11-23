/*
    Gera um Hash de tamanho @len.
*/
const generateHash = (len) => Math.random().toString(16).substr(2, len);

/*
    Verifica se um Objeto @obj é vazio
*/
const isObjectEmpty = (obj) => {
    for (let key in obj) return false;
    return true;
};

/*
    Função de divisão, retornando 0 caso o denominador seja 0.
*/
const divide = (a, b) => (b ? a / b : 0);

/*
    Função para calculo do Desvio Padrão, a partir de uma lista de numeros.
*/
const desvpad = (r_list, type = 'populacao') => {
    let desv_type = type === 'populacao' ? 0 : type === 'amostra' ? 1 : 0,
        media = r_list.reduce((total, valor) => total + valor / r_list.length, 0),
        variancia = r_list.reduce((total, valor) => total + Math.pow(media - valor, 2) / (r_list.length - desv_type), 0);
    return {
        desvpad: Math.sqrt(variancia),
        media: media,
    };
};

/*
    Gera a média móvel simples da lista de entrada 'i_list', para a lista 'mm_list', usando a quantidade de periodos passada.
*/
const SMA = (i_list, mm_list, period = 20, empty_value = NaN) => {
    // Irá percorrer a lista olhando blocos de tamanho 'period'
    for (let index_I = 0 - (period - 1), index_F = 0; index_F < i_list.length; index_I++, index_F++) {
        if (index_I >= 0) {
            let bloco_sum = 0.0;
            // Calcula a média de cada bloco
            for (let subIndex_I = index_I; subIndex_I <= index_F; subIndex_I++) bloco_sum += i_list[subIndex_I];
            mm_list[index_F] = divide(bloco_sum, period);
        } else mm_list[index_F] = empty_value;
    }
    return mm_list;
};

/*
    Gera uma banda de superior e inferior de Desvio Padrao do objeto passado.
    'Obj' deve ter estes inputs:
        - data: Lista dos dados a fazer os calculos.
        - banda_superior: Lista que conterá a banda de 'dist_banda' desvio acima da media.
        - banda_inferior: Lista que conterá a banda de 'dist_banda' desvio abaixo da media.
*/
const BBollinger = (obj, min_period = 1, empty_value = NaN, dist_banda = 1, all_bands = false, which_band = 'all') => {
    let desv_list = [];
    for (let i_data = 0; i_data < obj['data'].length; i_data++) {
        desv_list.push(obj['data'][i_data]);
        if (desv_list.length > min_period) {
            let dp_calc = desvpad(desv_list, 'amostra');
            obj['banda_media'].push(dp_calc['media']);
            if (all_bands) {
                for (let b = 1; b <= dist_banda; b++) {
                    if (which_band === 'all' || which_band === 'sup') obj[`banda_superior${b}`].push(dp_calc['media'] + dp_calc['desvpad'] * b);
                    if (which_band === 'all' || which_band === 'inf') obj[`banda_inferior${b}`].push(dp_calc['media'] - dp_calc['desvpad'] * b);
                }
            } else {
                if (which_band === 'all' || which_band === 'sup') obj['banda_superior'].push(dp_calc['media'] + dp_calc['desvpad'] * dist_banda);
                if (which_band === 'all' || which_band === 'inf') obj['banda_inferior'].push(dp_calc['media'] - dp_calc['desvpad'] * dist_banda);
            }
        } else {
            obj['banda_media'].push(empty_value);
            if (all_bands) {
                for (let b = 1; b <= dist_banda; b++) {
                    if (which_band === 'all' || which_band === 'sup') obj[`banda_superior${b}`].push(empty_value);
                    if (which_band === 'all' || which_band === 'inf') obj[`banda_inferior${b}`].push(empty_value);
                }
            } else {
                if (which_band === 'all' || which_band === 'sup') obj['banda_superior'].push(empty_value);
                if (which_band === 'all' || which_band === 'inf') obj['banda_inferior'].push(empty_value);
            }
        }
    }
};

/*
    Utilizados em @formatValue_fromRaw.
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

/*
    Formata Dados para Human Read.

    currency (4000.65) => (4.000,65)
    percent (0.545) => (54.50%)
    date (2000-00-00) => (00/00/2000)
    datetime (2000-00-00 00:00:00) => (00/00/2000 00:00:00)
    
    @options : Opções para escolha de formatações
    @value   : Valor a ser formatado
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

    // 00/00/0000 00:00:00
    if (options.style === 'datetime') {
        if (value === '0000-00-00 00:00:00' || value === '0000-00-00T00:00:00Z') return '';
        //Fix para converter do MySql para UTC (0000-00-00 00:00:00) => (0000-00-00T00:00:00Z)
        const fixValue = value.search(/Z$/) === -1 ? value.replace(' ', 'T') + 'Z' : value;
        const fDatetime = new Date(fixValue);
        return datetimeFormatter.format(fDatetime);
    }
};

/*
    Mascara de valores, verificando se está correspondendo as condições e auto-preenchendo alguns valores da máscara.
*/
const maskValue = (type, value, finishCallback = null) => {
    let new_value = { value: value.current };
    // Para permitir apenas numeros '\d'
    if (type === 'number') {
        new_value.check = true;
        if (new_value.value !== '' && isNaN(new_value.value)) new_value.check = false;
    }
    // Para permitir e mascarar Datas no formato xx/xx/xxxx
    else if (type === 'date') {
        new_value.check = false;
        if (
            new_value.value === '' ||
            /^([0-3])$/.test(new_value.value) ||
            /^((0[1-9])|([1-2][0-9])|(3[0-1]))\/$/.test(new_value.value) ||
            /^((0[1-9])|([1-2][0-9])|(3[0-1]))\/([0-1])$/.test(new_value.value) ||
            /^((0[1-9])|([1-2][0-9])|(3[0-1]))\/((0[1-9])|(1[0-2]))\/$/.test(new_value.value) ||
            /^((0[1-9])|([1-2][0-9])|(3[0-1]))\/((0[1-9])|(1[0-2]))\/([1-2])$/.test(new_value.value) ||
            /^((0[1-9])|([1-2][0-9])|(3[0-1]))\/((0[1-9])|(1[0-2]))\/((19)|(2[0-9]))$/.test(new_value.value) ||
            /^((0[1-9])|([1-2][0-9])|(3[0-1]))\/((0[1-9])|(1[0-2]))\/((19[0-9])|(2[0-9][0-9]))$/.test(new_value.value)
        )
            new_value.check = true;
        else if (/^((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(new_value.value)) {
            if ((value.old.match(/\//g) || []).length === 0) new_value.value += '/';
            new_value.check = true;
        } else if (/^((0[1-9])|([1-2][0-9])|(3[0-1]))\/((0[1-9])|(1[0-2]))$/.test(new_value.value)) {
            if ((value.old.match(/\//g) || []).length === 1) new_value.value += '/';
            new_value.check = true;
        } else if (/^((0[1-9])|([1-2][0-9])|(3[0-1]))\/((0[1-9])|(1[0-2]))\/((19[0-9][0-9])|(2[0-9][0-9][0-9]))$/.test(new_value.value)) {
            new_value.check = true;
            if (finishCallback !== null && finishCallback instanceof Function) finishCallback();
        }
    }
    // Para permitir e mastacar valores financeiros com decimais (Ex: xxxx.xx)
    else if (type === 'valor_financeiro') {
        new_value.check = true;
        new_value.value = new_value.value.replace(/\,/g, '.').replace(/[.](?=.*[.])/g, '');
        if (new_value.value !== '' && isNaN(new_value.value)) new_value.check = false;
    }
    // Especifico para inputs de Op, para permitir apenas 'c' ou 'v'
    else if (type === 'inputOp') {
        new_value.check = true;
        if (new_value.value !== '' && new_value.value.toLowerCase() !== 'c' && new_value.value.toLowerCase() !== 'v') new_value.check = false;
        if (finishCallback !== null && finishCallback instanceof Function) finishCallback(new_value.value, new_value.check);
    }
    // Especifico para inputs de Observação, permitindo apenas Numeros e Virgulas
    else if (type === 'inputObservacao') {
        new_value.check = false;
        if (new_value.value === '' || /^[\d,]+$/g.test(new_value.value)) new_value.check = true;
    }
    return new_value;
};

export { generateHash, isObjectEmpty, divide, desvpad, SMA, BBollinger, formatValue_fromRaw, maskValue };
