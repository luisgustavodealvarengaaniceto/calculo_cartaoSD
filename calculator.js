// Calculator Module - Precise DVR Recording Time Calculator (CBR Only)
class DVRCalculator {
    constructor() {
        // Configuration
        this.config = {
            usableSpacePercent: 0.90,          // 90% of total capacity
            MB_PER_HOUR_PER_MBPS: 428.22265625,// 1 Mbps = 428.22265625 MiB/h
            MB_PER_GB: 1024,                   // Binary units (MiB)
            useDecimalUnits: true,             // true = GB (1000) for SD cards
            toleranceOK: 5,                    // 5% tolerance for OK
            toleranceWarn: 15,                 // 15% tolerance for WARNING
            variationMargin: 0.10              // ±10% variation range
        };
    }

    /**
     * 🎯 FUNÇÃO UNIVERSAL - FONTE DA VERDADE
     * Calcula o tempo de gravação (Pior Caso / CBR) em horas.
     * Esta é a ÚNICA função no app que deve fazer este cálculo.
     * 
     * @param {number} total_bitrate_mbps - O bitrate nominal total (ex: 4.5).
     * @param {number} espaco_disponivel_mb - O espaço utilizável no cartão (ex: 57600).
     * @returns {number} O total de horas de gravação.
     */
    calcularHorasCBR(total_bitrate_mbps, espaco_disponivel_mb) {
        console.log(`[CBR] Cálculo: ${espaco_disponivel_mb.toFixed(0)} MB ÷ (${total_bitrate_mbps.toFixed(2)} Mbps × ${this.config.MB_PER_HOUR_PER_MBPS} MB/h/Mbps)`);
        
        // Se não houver bitrate ou espaço, retorna 0 para evitar divisão por zero
        if (total_bitrate_mbps <= 0 || espaco_disponivel_mb <= 0) {
            return 0;
        }

        // A FÓRMULA PADRÃO (Constante de 428.22265625)
        const MB_POR_HORA_POR_MBPS = this.config.MB_PER_HOUR_PER_MBPS;
        const consumo_mb_por_hora = total_bitrate_mbps * MB_POR_HORA_POR_MBPS;
        const horas = espaco_disponivel_mb / consumo_mb_por_hora;
        
        console.log(`[CBR] Resultado: ${horas.toFixed(2)} horas`);
        return horas;
    }

    /**
     * Update calculator configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Calculate variation range (±10%)
     */
    getVariationRange(baseTimeHours) {
        const margin = this.config.variationMargin;
        return {
            min: baseTimeHours * (1 - margin),
            max: baseTimeHours * (1 + margin),
            marginPercent: margin * 100
        };
    }

    /**
     * Calculate total recording time for all models EXCEPT JC450
     * Uses strict CBR calculation (no calibration, no corrections)
     */
    calculateTotal(cardSizeGB, channels, dualCard = false, options = {}) {
        const MB_PER_GB = this.config.useDecimalUnits ? 1000 : 1024;
        
        console.log('========================================');
        console.log(`[CALC] Modelo: ${options.modelId || 'Unknown'}`);
        console.log(`[CALC] Cartão: ${cardSizeGB} GB (dual: ${dualCard})`);
        console.log(`[CALC] Canais: ${channels.length}`);
        
        // Calculate effective card size
        const effectiveCardSize = dualCard ? cardSizeGB * 2 : cardSizeGB;
        const totalSpaceMB = effectiveCardSize * MB_PER_GB;
        const availableSpaceMB = totalSpaceMB * this.config.usableSpacePercent;
        
        console.log(`[CALC] Espaço disponível: ${availableSpaceMB.toFixed(0)} MB`);
        
        // Sum all nominal bitrates (CBR worst-case)
        let totalNominalMbps = 0;
        const channelResults = [];

        channels.forEach((channel, index) => {
            if (!channel.active) return;
            
            const nominalMbps = Number(channel.bitrate) || 0;
            const rateMBh = nominalMbps * this.config.MB_PER_HOUR_PER_MBPS;
            const timeHours = rateMBh > 0 ? (availableSpaceMB / rateMBh) : Infinity;

            console.log(`[CALC] ${channel.channelId}: ${nominalMbps} Mbps → ${rateMBh.toFixed(1)} MB/h`);

            channelResults.push({
                channelId: channel.channelId || `CH${index+1}`,
                channelName: channel.channelName || `CH${index+1}`,
                resolution: channel.resolution || null,
                fps: channel.fps || null,
                bitrate: nominalMbps,
                codec: channel.codec || 'H.264',
                codecMultiplier: 1.0,
                correctionFactor: 1.0,
                correctionBreakdown: { base: 1.0 },
                effectiveBitrate: nominalMbps,
                timeHours: timeHours,
                timeDays: isFinite(timeHours) ? timeHours / 24 : null,
                rateMBh: rateMBh,
                rateGBh: rateMBh / MB_PER_GB,
                rateGBday: (rateMBh * 24) / MB_PER_GB,
                rateMBs: rateMBh / 3600,
                outputMultiplier: 1,
                multiplierEstimated: false,
                multiplierReason: 'nominal-cbr'
            });

            totalNominalMbps += nominalMbps;
        });

        console.log(`[CALC] Bitrate total: ${totalNominalMbps.toFixed(2)} Mbps`);

        // Use a função universal
        const totalTimeHours = this.calcularHorasCBR(totalNominalMbps, availableSpaceMB);
        const totalTimeDays = totalTimeHours / 24;
        const totalRateMBh = totalNominalMbps * this.config.MB_PER_HOUR_PER_MBPS;
        const totalRateGBh = totalRateMBh / MB_PER_GB;

        const variationRange = this.getVariationRange(totalTimeHours);

        console.log(`[CALC] ✅ Tempo total: ${totalTimeHours.toFixed(2)} horas (${totalTimeDays.toFixed(2)} dias)`);
        console.log('========================================');

        return {
            cardSizeGB,
            totalSpaceMB,
            availableSpaceMB,
            usablePercentage: this.config.usableSpacePercent * 100,
            totalTimeHours,
            totalTimeDays,
            totalRateMBh,
            totalRateGBh,
            totalRateGBday: totalRateGBh * 24,
            totalRateMBs: totalRateMBh / 3600,
            channelResults,
            activeChannels: channelResults.length,
            unitsUsed: this.config.useDecimalUnits ? 'GB (decimal)' : 'GiB (binary)',
            realisticCorrections: false,
            variationRange,
            estimatedTimeRange: {
                min: variationRange.min,
                max: variationRange.max,
                minDays: variationRange.min / 24,
                maxDays: variationRange.max / 24
            },
            totalBitrate: totalNominalMbps,
            note: `CBR nominal calculation (no calibration or correction factors).`
        };
    }

    /**
     * Calculate JC450 dual card recording time
     * Uses strict CBR calculation (no calibration, no corrections)
     */
    calculateJC450DualCard(cardSizeGB, channels, useOneCard = false) {
        const MB_PER_GB = this.config.useDecimalUnits ? 1000 : 1024;
        const MAX_TOTAL_BITRATE = 20; // 20 Mbps hardware limit
        
        console.log('========================================');
        console.log('[JC450] Modo:', useOneCard ? 'SINGLE CARD' : 'DUAL CARD (Mirror)');
        console.log('[JC450] Cartão:', cardSizeGB, 'GB cada');
        console.log('[JC450] Canais recebidos:', channels.length);
        
        // Filter active channels
        const activeChannels = channels.filter(ch => ch.active);
        console.log('[JC450] Canais ativos:', activeChannels.length);
        
        // Calculate available space
        const availablePerCardMB = cardSizeGB * MB_PER_GB * this.config.usableSpacePercent;
        
        console.log('[JC450] Espaço por cartão:', availablePerCardMB.toFixed(0), 'MB');
        
        // Divisão física das câmeras no JC450 Dual Card (não-Mirror):
        // Cartão 1 (SD1): Câmeras 1, 2, 4
        // Cartão 2 (SD2): Câmeras 3, 5
        const card1Channels = []; // CH1, CH2, CH4
        const card2Channels = []; // CH3, CH5
        
        let card1Bitrate = 0;
        let card2Bitrate = 0;
        let totalNominalMbps = 0;
        const channelResults = [];
        
        activeChannels.forEach((channel, index) => {
            const nominalMbps = Number(channel.bitrate) || 0;
            const rateMBh = nominalMbps * this.config.MB_PER_HOUR_PER_MBPS;
            
            // Determinar qual cartão grava este canal (baseado no channelId)
            let cardAssignment = 'SD1';
            const channelNum = parseInt(channel.channelId.replace(/[^0-9]/g, '')) || 0;
            
            if (!useOneCard) {
                // Em Dual Card: CH1, CH2, CH4 → SD1 | CH3, CH5 → SD2
                if (channelNum === 3 || channelNum === 5) {
                    cardAssignment = 'SD2';
                    card2Channels.push(channel.channelId);
                    card2Bitrate += nominalMbps;
                } else {
                    card1Channels.push(channel.channelId);
                    card1Bitrate += nominalMbps;
                }
            } else {
                card1Channels.push(channel.channelId);
                card1Bitrate += nominalMbps;
            }
            
            console.log(`[JC450] ${channel.channelId}: ${nominalMbps} Mbps → ${rateMBh.toFixed(1)} MB/h [${cardAssignment}]`);
            
            channelResults.push({
                channelId: channel.channelId,
                channelName: channel.channelName,
                cardAssignment: cardAssignment,
                resolution: channel.resolution ? channel.resolution.toString() : '1080',
                fps: channel.fps || 25,
                bitrate: nominalMbps,
                codec: channel.codec || 'H.264',
                codecMultiplier: 1.0,
                correctionFactor: 1.0,
                correctionBreakdown: { base: 1.0 },
                effectiveBitrate: nominalMbps,
                outputMultiplier: 1,
                multiplierEstimated: false,
                multiplierReason: 'nominal-cbr',
                rateMBh: rateMBh,
                rateGBh: rateMBh / MB_PER_GB,
                rateGBday: (rateMBh * 24) / MB_PER_GB,
                rateMBs: rateMBh / 3600
            });
            
            totalNominalMbps += nominalMbps;
        });
        
        console.log('[JC450] Bitrate total:', totalNominalMbps.toFixed(2), 'Mbps');
        console.log('[JC450] SD1 Bitrate:', card1Bitrate.toFixed(2), 'Mbps (Cams:', card1Channels.join(', ') + ')');
        console.log('[JC450] SD2 Bitrate:', card2Bitrate.toFixed(2), 'Mbps (Cams:', card2Channels.join(', ') + ')');
        
        // Calcular tempo para cada cartão separadamente
        let card1TimeHours = 0;
        let card2TimeHours = 0;
        let timeHours = 0;
        
        if (useOneCard) {
            // Modo Single Card: todos os canais em SD1
            card1TimeHours = this.calcularHorasCBR(card1Bitrate, availablePerCardMB);
            timeHours = card1TimeHours;
        } else {
            // Modo Dual Card: calcular tempo de cada cartão
            if (card1Bitrate > 0) {
                card1TimeHours = this.calcularHorasCBR(card1Bitrate, availablePerCardMB);
            }
            if (card2Bitrate > 0) {
                card2TimeHours = this.calcularHorasCBR(card2Bitrate, availablePerCardMB);
            }
            
            // O sistema é limitado pelo cartão que enche primeiro (menor tempo)
            timeHours = Math.min(card1TimeHours || Infinity, card2TimeHours || Infinity);
            
            // Se apenas um cartão tem câmeras ativas, use o tempo dele
            if (card1Bitrate === 0 && card2Bitrate > 0) timeHours = card2TimeHours;
            if (card2Bitrate === 0 && card1Bitrate > 0) timeHours = card1TimeHours;
        }
        
        const timeDays = timeHours / 24;
        const totalRateMBh = totalNominalMbps * this.config.MB_PER_HOUR_PER_MBPS;
        const totalRateGBh = totalRateMBh / MB_PER_GB;
        
        console.log('[JC450] SD1 Tempo:', card1TimeHours.toFixed(2), 'horas');
        console.log('[JC450] SD2 Tempo:', card2TimeHours.toFixed(2), 'horas');
        console.log('[JC450] ✅ Tempo de gravação (retenção mínima):', timeHours.toFixed(2), 'horas (', timeDays.toFixed(2), 'dias)');
        
        // Bitrate warning
        const bitrateWarning = totalNominalMbps > MAX_TOTAL_BITRATE 
            ? `⚠️ Bitrate total (${totalNominalMbps.toFixed(1)} Mbps) excede o limite de hardware (${MAX_TOTAL_BITRATE} Mbps). Reduza a qualidade.`
            : null;
        
        if (bitrateWarning) {
            console.log('[JC450]', bitrateWarning);
        }
        
        const variationRange = this.getVariationRange(timeHours);
        
        console.log('========================================');
        
        return {
            cardSizeGB,
            useOneCard,
            availableSpaceMB: availablePerCardMB,
            isDualCardSplit: !useOneCard && card1Channels.length > 0 && card2Channels.length > 0,
            
            sd1: {
                cardName: 'SD1',
                channels: useOneCard ? 'All Channels' : card1Channels.join(', '),
                channelCount: card1Channels.length,
                totalBitrate: card1Bitrate,
                totalRateMBh: card1Bitrate * this.config.MB_PER_HOUR_PER_MBPS,
                totalRateGBh: (card1Bitrate * this.config.MB_PER_HOUR_PER_MBPS) / MB_PER_GB,
                availableSpaceMB: availablePerCardMB,
                timeHours: card1TimeHours,
                timeDays: card1TimeHours / 24,
                channelResults: channelResults.filter(ch => ch.cardAssignment === 'SD1')
            },
            
            sd2: useOneCard ? null : {
                cardName: 'SD2',
                channels: card2Channels.join(', '),
                channelCount: card2Channels.length,
                totalBitrate: card2Bitrate,
                totalRateMBh: card2Bitrate * this.config.MB_PER_HOUR_PER_MBPS,
                totalRateGBh: (card2Bitrate * this.config.MB_PER_HOUR_PER_MBPS) / MB_PER_GB,
                availableSpaceMB: availablePerCardMB,
                timeHours: card2TimeHours,
                timeDays: card2TimeHours / 24,
                channelResults: channelResults.filter(ch => ch.cardAssignment === 'SD2')
            },
            
            totalBitrate: totalNominalMbps,
            totalRateMBh: totalRateMBh,
            totalRateGBh: totalRateGBh,
            totalRateGBday: totalRateGBh * 24,
            totalTimeHours: timeHours,
            totalTimeDays: timeDays,
            totalHours: timeHours,
            activeChannels: activeChannels.length,
            channelResults: channelResults,  // Add channelResults at root level for displayResults
            unitsUsed: this.config.useDecimalUnits ? 'GB (decimal)' : 'GiB (binary)',
            bitrateWarning: bitrateWarning,
            variationRange,
            estimatedTimeRange: {
                min: variationRange.min,
                max: variationRange.max,
                minDays: variationRange.min / 24,
                maxDays: variationRange.max / 24
            },
            note: `CBR nominal calculation for JC450 (no calibration or correction factors).`
        };
    }

    /**
     * Format time for display
     */
    formatTime(hours, showMinutes = true) {
        if (!isFinite(hours) || hours < 0) return '0h';
        
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        const minutes = Math.floor((remainingHours % 1) * 60);
        
        if (days > 0) {
            return showMinutes 
                ? `${days}d ${Math.floor(remainingHours)}h ${minutes}m`
                : `${days}d ${Math.floor(remainingHours)}h`;
        }
        
        return showMinutes 
            ? `${Math.floor(hours)}h ${minutes}m`
            : `${hours.toFixed(1)}h`;
    }

    /**
     * Format detailed time display
     */
    formatTimeDetailed(hours) {
        if (!isFinite(hours) || hours < 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                totalHours: 0,
                formatted: '0h 0m'
            };
        }
        
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.floor(((hours % 24) % 1) * 60);
        
        return {
            days,
            hours: remainingHours,
            minutes,
            totalHours: hours,
            formatted: days > 0 
                ? `${days}d ${remainingHours}h ${minutes}m`
                : `${remainingHours}h ${minutes}m`
        };
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DVRCalculator;
}

// Create global calculator instance
const calculator = new DVRCalculator();

// Export for Node.js test harnesses
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DVRCalculator, calculator };
}
