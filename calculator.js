// Calculator Module - Precise DVR Recording Time Calculator
class DVRCalculator {
    constructor() {
        // Default configuration (can be overridden)
        this.config = {
            usableSpacePercent: 0.90,        // 90% of total capacity (editable)
            MB_PER_HOUR_PER_MBPS: 450,       // 1 Mbps = 450 MB/h (fixed formula)
            MB_PER_GB: 1000,                 // Decimal (1000) or Binary (1024)
            defaultCodecMultiplier: 1.0,     // H.264 = 1.0, H.265 ≈ 0.6-0.8
            useDecimalUnits: true            // true = GB (1000), false = GiB (1024)
        };
    }

    /**
     * Update calculator configuration
     * @param {object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * CORE CALCULATION - Compute recording times for multiple cards
     * 
     * @param {Array} channels - Array of channel objects: 
     *   [{id, name, bitrateMbps, active, codecMultiplier?}]
     * @param {Array} cards - Array of card objects: 
     *   [{id, sizeGB, usablePercent?}]
     * @param {Object} mapping - Maps channel.id to array of card.id(s)
     *   Example: {CH1: ['SD1'], CH2: ['SD1'], CH3: ['SD2']}
     * @param {Object} options - Override config options for this calculation
     * @returns {Object} - Complete calculation results
     */
    computeRecordingTimes(channels, cards, mapping, options = {}) {
        // Merge options with default config
        const config = { ...this.config, ...options };
        const MB_PER_GB = config.useDecimalUnits ? 1000 : 1024;
        
        // Helper: Convert Mbps to MB/hour
        const toMBperHour = (mbps) => mbps * config.MB_PER_HOUR_PER_MBPS;

        // Process each card
        const cardResults = cards.map(card => {
            // Calculate usable space
            const usablePercent = card.usablePercent ?? config.usableSpacePercent;
            const totalSpaceMB = card.sizeGB * MB_PER_GB;
            const usableMB = card.sizeGB * usablePercent * MB_PER_GB;
            
            // Find channels assigned to this card
            const assignedChannels = channels.filter(ch => {
                if (!ch.active) return false;
                const cardIds = mapping[ch.id] || [];
                return cardIds.includes(card.id);
            });

            // Calculate total bitrate for this card
            let totalMbps = 0;
            const channelDetails = assignedChannels.map(ch => {
                const codecMult = ch.codecMultiplier ?? config.defaultCodecMultiplier;
                const effectiveBitrate = ch.bitrateMbps * codecMult;
                totalMbps += effectiveBitrate;
                
                return {
                    channelId: ch.id,
                    channelName: ch.name,
                    userBitrate: ch.bitrateMbps,
                    codecMultiplier: codecMult,
                    effectiveBitrate: effectiveBitrate,
                    resolution: ch.resolution,
                    fps: ch.fps,
                    codec: ch.codec || 'H.264'
                };
            });

            // Calculate recording time
            let timeHours = null;
            let totalMBperHour = 0;
            let note = null;

            if (totalMbps <= 0) {
                note = 'No active channels recording on this card';
            } else {
                totalMBperHour = toMBperHour(totalMbps);
                timeHours = usableMB / totalMBperHour;
            }

            return {
                cardId: card.id,
                cardName: card.name || card.id,
                sizeGB: card.sizeGB,
                totalSpaceMB: totalSpaceMB,
                usablePercent: usablePercent * 100,
                usableMB: usableMB,
                assignedChannels: channelDetails,
                totalMbps: totalMbps,
                totalMBperHour: totalMBperHour,
                totalGBperHour: totalMBperHour / MB_PER_GB,
                totalGBperDay: (totalMBperHour * 24) / MB_PER_GB,
                totalMBperSecond: totalMBperHour / 3600,
                timeHours: timeHours,
                timeDays: timeHours ? timeHours / 24 : null,
                note: note
            };
        });

        // Calculate overall statistics
        const totalTimeHours = Math.min(...cardResults.map(r => r.timeHours || Infinity));
        const maxTimeHours = Math.max(...cardResults.map(r => r.timeHours || 0));
        const avgTimeHours = cardResults.reduce((sum, r) => sum + (r.timeHours || 0), 0) / cardResults.length;

        const totalBitrate = cardResults.reduce((sum, r) => sum + r.totalMbps, 0);
        const totalMBperHour = cardResults.reduce((sum, r) => sum + r.totalMBperHour, 0);

        return {
            config: config,
            cards: cardResults,
            summary: {
                totalChannels: channels.filter(ch => ch.active).length,
                totalCards: cards.length,
                totalBitrateMbps: totalBitrate,
                totalMBperHour: totalMBperHour,
                totalGBperHour: totalMBperHour / MB_PER_GB,
                totalGBperDay: (totalMBperHour * 24) / MB_PER_GB,
                minTimeHours: isFinite(totalTimeHours) ? totalTimeHours : null,
                maxTimeHours: maxTimeHours > 0 ? maxTimeHours : null,
                avgTimeHours: avgTimeHours > 0 ? avgTimeHours : null
            }
        };
    }

    /**
     * SIMPLIFIED CALCULATION - For single card, multiple channels
     * (Backward compatible with existing code)
     * 
     * @param {number} cardSizeGB - SD card size in GB (per card if dual card)
     * @param {Array} channels - Array of channel configurations
     * @param {boolean} dualCard - Whether the device uses 2 SD cards (default: false)
     * @returns {object} - Total recording time and detailed breakdown
     */
    calculateTotal(cardSizeGB, channels, dualCard = false) {
        const MB_PER_GB = this.config.useDecimalUnits ? 1000 : 1024;
        
        // If dual card, multiply capacity by 2
        const effectiveCardSize = dualCard ? cardSizeGB * 2 : cardSizeGB;
        
        const totalSpaceMB = effectiveCardSize * MB_PER_GB;
        const availableSpaceMB = totalSpaceMB * this.config.usableSpacePercent;
        
        let totalRateMBh = 0;
        const channelResults = [];

        channels.forEach((channel, index) => {
            if (channel.active) {
                const codecMultiplier = channel.codecMultiplier || 1;
                const effectiveBitrate = channel.bitrate * codecMultiplier;
                const rateMBh = effectiveBitrate * this.config.MB_PER_HOUR_PER_MBPS;
                const timeHours = availableSpaceMB / rateMBh;
                
                channelResults.push({
                    channelId: channel.channelId,
                    channelName: channel.channelName || `CH${index + 1}`,
                    resolution: channel.resolution,
                    fps: channel.fps,
                    bitrate: channel.bitrate,
                    codec: channel.codec || 'H.264',
                    codecMultiplier: codecMultiplier,
                    effectiveBitrate: effectiveBitrate,
                    timeHours: timeHours,
                    timeDays: timeHours / 24,
                    rateMBh: rateMBh,
                    rateGBh: rateMBh / MB_PER_GB,
                    rateGBday: (rateMBh * 24) / MB_PER_GB,
                    rateMBs: rateMBh / 3600
                });
                
                totalRateMBh += rateMBh;
            }
        });

        // Calculate total time based on combined consumption
        const totalTimeHours = totalRateMBh > 0 ? availableSpaceMB / totalRateMBh : 0;
        const totalTimeDays = totalTimeHours / 24;

        return {
            cardSizeGB,
            totalSpaceMB,
            availableSpaceMB,
            usablePercentage: this.config.usableSpacePercent * 100,
            totalTimeHours,
            totalTimeDays,
            totalRateMBh,
            totalRateGBh: totalRateMBh / MB_PER_GB,
            totalRateGBday: (totalRateMBh * 24) / MB_PER_GB,
            totalRateMBs: totalRateMBh / 3600,
            channelResults,
            activeChannels: channelResults.length,
            unitsUsed: this.config.useDecimalUnits ? 'GB (decimal)' : 'GiB (binary)'
        };
    }

    /**
     * Format time for display with precision
     * @param {number} hours - Time in hours
     * @param {boolean} showMinutes - Include minutes in output
     * @returns {string} - Formatted time string
     */
    formatTime(hours, showMinutes = true) {
        if (!hours || hours <= 0) return '-';
        
        if (hours < 1) {
            return `${Math.round(hours * 60)} min`;
        } else if (hours < 24) {
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return showMinutes && m > 0 ? `${h}h ${m}min` : `${hours.toFixed(1)}h`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            if (remainingHours === 0) {
                return `${days} ${days === 1 ? t('day') : t('days')}`;
            }
            return showMinutes ? `${days}d ${remainingHours}h` : `${(hours / 24).toFixed(1)} ${t('days')}`;
        }
    }

    /**
     * Format detailed time breakdown
     * @param {number} hours - Time in hours
     * @returns {object} - Detailed time breakdown
     */
    formatTimeDetailed(hours) {
        if (!hours || hours <= 0) return null;
        
        const totalMinutes = Math.floor(hours * 60);
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.floor((hours - Math.floor(hours)) * 60);
        
        return {
            totalHours: hours.toFixed(2),
            totalMinutes: totalMinutes,
            days: days,
            hours: remainingHours,
            minutes: minutes,
            formatted: this.formatTime(hours, true),
            formattedShort: this.formatTime(hours, false)
        };
    }

    /**
     * Get status color based on recording time
     * @param {number} hours - Recording time in hours
     * @returns {string} - Status class
     */
    getStatusColor(hours) {
        if (!hours) return 'text-gray-500';
        if (hours >= 72) return 'text-green-600 dark:text-green-400';  // 3+ days
        if (hours >= 48) return 'text-green-500 dark:text-green-500';  // 2+ days
        if (hours >= 24) return 'text-yellow-600 dark:text-yellow-400'; // 1+ day
        if (hours >= 12) return 'text-orange-500 dark:text-orange-400'; // 12+ hours
        return 'text-red-600 dark:text-red-400';                        // < 12 hours
    }

    /**
     * Validate bitrate against device specifications
     * @param {number} bitrate - Bitrate in Mbps
     * @param {object} deviceSpec - Device specification
     * @returns {object} - Validation result
     */
    validateBitrate(bitrate, deviceSpec) {
        if (!deviceSpec || !deviceSpec.bitrateRange) {
            return { valid: true, warning: null };
        }
        
        const [min, max] = deviceSpec.bitrateRange;
        if (bitrate < min || bitrate > max) {
            return {
                valid: false,
                warning: `Bitrate ${bitrate} Mbps is outside device range (${min}-${max} Mbps). May not work properly.`
            };
        }
        
        return { valid: true, warning: null };
    }

    /**
     * REVERSE CALCULATION - Calculate required bitrate based on desired recording time
     * Given: card size, desired time, number of active channels
     * Returns: suggested bitrate per channel to achieve the desired time
     * 
     * @param {number} cardSizeGB - SD card size in GB
     * @param {number} desiredHours - Desired recording time in hours
     * @param {number} activeChannels - Number of active channels
     * @param {object} options - Optional config overrides
     * @returns {object} - Suggested configuration
     */
    calculateReverseFromTime(cardSizeGB, desiredHours, activeChannels = 1, options = {}) {
        const config = { ...this.config, ...options };
        const MB_PER_GB = config.useDecimalUnits ? 1000 : 1024;
        
        const totalSpaceMB = cardSizeGB * MB_PER_GB;
        const availableSpaceMB = totalSpaceMB * config.usableSpacePercent;
        
        // Calculate required total consumption rate
        const requiredTotalMBh = availableSpaceMB / desiredHours;
        
        // Distribute evenly across active channels
        const requiredMBhPerChannel = requiredTotalMBh / activeChannels;
        
        // Convert back to Mbps
        const requiredBitratePerChannel = requiredMBhPerChannel / config.MB_PER_HOUR_PER_MBPS;
        
        // Find suitable configurations for each resolution
        const suggestions = this.findSuitableConfigurations(requiredBitratePerChannel);
        
        return {
            cardSizeGB,
            desiredHours,
            desiredDays: desiredHours / 24,
            activeChannels,
            availableSpaceMB,
            requiredTotalMBh,
            requiredMBhPerChannel,
            requiredBitratePerChannel: requiredBitratePerChannel.toFixed(2),
            suggestions,
            note: requiredBitratePerChannel < 0.5 
                ? 'Bitrate muito baixo - considere aumentar capacidade do cartão ou reduzir tempo de gravação'
                : requiredBitratePerChannel > 8 
                ? 'Bitrate muito alto - considere reduzir resolução ou aumentar número de canais'
                : 'Configuração viável'
        };
    }

    /**
     * Find suitable resolution/fps/bitrate combinations for target bitrate
     * @param {number} targetBitrate - Target bitrate in Mbps
     * @returns {Array} - Array of suggested configurations
     */
    findSuitableConfigurations(targetBitrate) {
        // Common configurations for DVR equipment
        const configurations = [
            { resolution: '1080', fps: 25, bitrate: 8, quality: 'High' },
            { resolution: '1080', fps: 25, bitrate: 6, quality: 'Medium-High' },
            { resolution: '1080', fps: 15, bitrate: 4, quality: 'Medium' },
            { resolution: '720', fps: 25, bitrate: 4, quality: 'High' },
            { resolution: '720', fps: 25, bitrate: 3, quality: 'Medium-High' },
            { resolution: '720', fps: 25, bitrate: 2, quality: 'Medium' },
            { resolution: '720', fps: 15, bitrate: 2, quality: 'Medium-Low' },
            { resolution: '480', fps: 25, bitrate: 2, quality: 'Medium' },
            { resolution: '480', fps: 15, bitrate: 1, quality: 'Low' },
            { resolution: '360', fps: 15, bitrate: 0.5, quality: 'Very Low' }
        ];

        // Find configurations close to target bitrate
        const suggestions = configurations
            .map(config => ({
                ...config,
                difference: Math.abs(config.bitrate - targetBitrate),
                match: Math.abs(config.bitrate - targetBitrate) / targetBitrate * 100
            }))
            .sort((a, b) => a.difference - b.difference)
            .slice(0, 5)
            .map(config => ({
                resolution: config.resolution,
                fps: config.fps,
                bitrate: config.bitrate,
                quality: config.quality,
                matchPercentage: (100 - config.match).toFixed(1)
            }));

        return suggestions;
    }
}

// Create global calculator instance
const calculator = new DVRCalculator();
