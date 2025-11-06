// Translations Object
const translations = {
    'pt-BR': {
        selectModel: 'Selecione o Modelo do Equipamento',
        maxCapacity: 'Máx',
        channels: 'Canais',
        configuration: 'Configuração de Gravação',
        cardSize: 'Tamanho do Cartão SD',
        numChannels: 'Número de Canais Ativos',
        calculate: 'Calcular',
        reset: 'Limpar',
        results: 'Resultados',
        exportPDF: 'Exportar PDF',
        exportCSV: 'Exportar CSV',
        totalTime: 'Tempo Total',
        dataConsumption: 'Consumo de Dados',
        avgBitrate: 'Taxa Média',
        recordingChart: 'Tempo de Gravação por Canal',
        channelDetails: 'Detalhes por Canal',
        channel: 'Canal',
        resolution: 'Resolução',
        recTime: 'Tempo',
        consumption: 'Consumo',
        deviceCommand: 'Comando do Dispositivo',
        referenceTable: 'Tabela de Referência',
        referenceDesc: 'Valores aproximados baseados no documento oficial da Jimi IoT (v1.1.5)',
        model: 'Modelo',
        estimatedTime: 'Tempo Est.',
        basedOn: 'Baseado em',
        allRights: 'Todos os direitos reservados',
        hours: 'horas',
        days: 'dias',
        day: 'dia',
        selectChannel: 'Selecione configuração do canal',
        codec: 'Codec',
        availableSpace: 'Espaço disponível',
        usableSpace: 'Espaço útil (90%)',
        quickPresets: 'Perfis Pré-Configurados',
        customConfig: 'Ou configure manualmente',
        usePreset: 'Usar este perfil',
        totalBitrate: 'Bitrate Total',
        preset: 'Perfil',
        fixed_configuration: 'Configuração Fixa',
        fps: 'FPS (Quadros/seg)',
        bitrate: 'Bitrate (Mbps)',
        reverseCalc: 'Modo: Calcular Configurações Ideais',
        desiredDays: 'Dias',
        desiredHours: 'Horas',
        reverseCalcHelp: 'Total:',
        suggestedConfig: 'Configurações Sugeridas',
        targetBitrate: 'Bitrate Alvo por Canal',
        quality: 'Qualidade',
        match: 'Compatibilidade',
        desiredRecordingTime: 'Tempo de Gravação Desejado',
        total: 'Total',
        generateConfig: 'Gerar Configurações Automáticas',
        autoConfigApplied: 'Configurações automáticas aplicadas!',
        channelAutoConfig: 'Configuração Automática',
        configSummary: 'Resumo da Configuração',
        cardCapacity: 'Capacidade do Cartão',
        usableCapacity: 'Capacidade Utilizável',
        activeChannelsCount: 'Canais Ativos',
        ignitionNote: '<strong>Importante:</strong> Os dias indicados referem-se ao tempo contínuo com a ignição do veículo ligada. O tempo real pode variar conforme o padrão de uso do veículo.',
        selectCalcMode: 'Escolha o Modo de Cálculo',
        manualMode: 'Configurar Manualmente',
        autoMode: 'Tempo Desejado',
        manualModeDesc: 'Escolha resolução e bitrate',
        autoModeDesc: 'Calcular configurações ideais'
    },
    'en': {
        selectModel: 'Select Equipment Model',
        maxCapacity: 'Max',
        channels: 'Channels',
        configuration: 'Recording Configuration',
        cardSize: 'SD Card Size',
        numChannels: 'Number of Active Channels',
        calculate: 'Calculate',
        reset: 'Clear',
        results: 'Results',
        exportPDF: 'Export PDF',
        exportCSV: 'Export CSV',
        totalTime: 'Total Time',
        dataConsumption: 'Data Consumption',
        avgBitrate: 'Avg Rate',
        recordingChart: 'Recording Time per Channel',
        channelDetails: 'Details per Channel',
        channel: 'Channel',
        resolution: 'Resolution',
        recTime: 'Time',
        consumption: 'Consumption',
        deviceCommand: 'Device Command',
        referenceTable: 'Reference Table',
        referenceDesc: 'Approximate values based on Jimi IoT official document (v1.1.5)',
        model: 'Model',
        estimatedTime: 'Est. Time',
        basedOn: 'Based on',
        allRights: 'All rights reserved',
        hours: 'hours',
        days: 'days',
        day: 'day',
        selectChannel: 'Select channel configuration',
        codec: 'Codec',
        availableSpace: 'Available space',
        usableSpace: 'Usable space (90%)',
        quickPresets: 'Quick Presets',
        customConfig: 'Or configure manually',
        usePreset: 'Use this preset',
        totalBitrate: 'Total Bitrate',
        preset: 'Preset',
        fixed_configuration: 'Fixed Configuration',
        fps: 'FPS (Frames/sec)',
        bitrate: 'Bitrate (Mbps)',
        reverseCalc: 'Mode: Calculate Ideal Settings',
        desiredDays: 'Days',
        desiredHours: 'Hours',
        reverseCalcHelp: 'Total:',
        suggestedConfig: 'Suggested Configurations',
        targetBitrate: 'Target Bitrate per Channel',
        quality: 'Quality',
        match: 'Match',
        desiredRecordingTime: 'Desired Recording Time',
        total: 'Total',
        generateConfig: 'Generate Automatic Configuration',
        autoConfigApplied: 'Auto-configuration applied!',
        channelAutoConfig: 'Auto Configuration',
        configSummary: 'Configuration Summary',
        cardCapacity: 'Card Capacity',
        usableCapacity: 'Usable Capacity',
        activeChannelsCount: 'Active Channels',
        ignitionNote: '<strong>Important:</strong> The indicated days refer to continuous time with the vehicle ignition on. Actual time may vary depending on vehicle usage pattern.',
        selectCalcMode: 'Choose Calculation Mode',
        manualMode: 'Configure Manually',
        autoMode: 'Desired Time',
        manualModeDesc: 'Choose resolution and bitrate',
        autoModeDesc: 'Calculate ideal settings'
    }
};

// Current Language
let currentLang = 'pt-BR';

// Translation Function
function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
    
    // Translate ignition note with HTML
    const ignitionNoteText = document.getElementById('ignitionNoteText');
    if (ignitionNoteText) {
        const pTag = ignitionNoteText.querySelector('p');
        if (pTag) {
            if (currentLang === 'pt-BR') {
                pTag.innerHTML = '<strong>Importante:</strong> Os dias indicados referem-se ao tempo contínuo com a ignição do veículo ligada. O tempo real pode variar conforme o padrão de uso do veículo.';
            } else {
                pTag.innerHTML = '<strong>Important:</strong> The indicated days refer to continuous time with the vehicle ignition on. Actual time may vary depending on vehicle usage pattern.';
            }
        }
    }
}

// Get Translation
function t(key) {
    return translations[currentLang][key] || key;
}

// Toggle Language
function toggleLanguage() {
    currentLang = currentLang === 'pt-BR' ? 'en' : 'pt-BR';
    localStorage.setItem('language', currentLang);
    translatePage();
    document.getElementById('langText').textContent = currentLang === 'pt-BR' ? 'EN' : 'PT';
    
    // Recalculate if results are shown
    if (!document.getElementById('resultsSection').classList.contains('hidden')) {
        calculateRecording();
    }
}

// Initialize Language
function initLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        currentLang = savedLang;
    }
    translatePage();
    document.getElementById('langText').textContent = currentLang === 'pt-BR' ? 'EN' : 'PT';
}
