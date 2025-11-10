// Calculator Module - Precise DVR Recording Time Calculator
class DVRCalculator {
    constructor() {
        // Default configuration (can be overridden)
        this.config = {
            usableSpacePercent: 0.90,        // 90% of total capacity (editable)
            MB_PER_HOUR_PER_MBPS: 450,       // 1 Mbps = 450 MB/h (fixed formula)
            MB_PER_GB: 1024,                 // Binary (1024) by default to match Jimi PDFs
            defaultCodecMultiplier: 1.0,     // H.264 = 1.0, H.265 ≈ 0.6-0.8
            useDecimalUnits: false,          // false = GiB (1024), true = GB (1000)
            toleranceOK: 5,                  // Tolerance for OK status (%)
            toleranceWarn: 15,               // Tolerance for WARN status (%)
            
            // 🔧 Realistic correction factors (based on real recordings)
            useRealisticCorrections: true,   // Apply real-world overhead corrections
            overheadTS: 0.03,                // +3% - TS container headers and indexes
            overheadAudio: 0.01,             // +1% - Audio track (64-128 kbps)
            overheadVBR: 0.02,               // +2% - Variable bitrate fluctuation (H.264)
            overheadFilesystem: 0.02,        // +2% - Block slack space (32-64 KB blocks)
            variationMargin: 0.10            // ±10% - Expected variation range
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
     * Validate bitrate against device supported ranges
     * @param {number} bitrate - Bitrate in Mbps
     * @param {string} modelId - Model identifier (jc181, jc400, etc.)
     * @param {string} resolution - Resolution (e.g., '1080', '720')
     * @returns {object} - {valid: boolean, warning: string|null, range: array}
     */
    validateBitrate(bitrate, modelId, resolution) {
        // Define supported bitrate ranges per model/resolution
        const bitrateRanges = {
            'jc181': {
                '1080': { min: 1, max: 8 },
                '720': { min: 1, max: 6 },
                '480': { min: 1, max: 4 },
                '360': { min: 0.5, max: 2 }
            },
            'jc400': {
                '1080': { min: 4, max: 8 },
                '720': { min: 2, max: 6 },
                '480': { min: 1, max: 4 },
                '360': { min: 0.5, max: 2 }
            },
            'jc371': {
                '1080': { min: 2, max: 8 },
                '720': { min: 1, max: 6 },
                '480': { min: 0.5, max: 4 },
                '360': { min: 0.5, max: 2 }
            },
            'jc450': {
                '1080': { min: 512, max: 8192 }, // In Kbps (0.5-8 Mbps)
                '720': { min: 512, max: 6144 },
                '480': { min: 256, max: 4096 },
                '360': { min: 256, max: 2048 }
            }
        };

        const modelRanges = bitrateRanges[modelId];
        if (!modelRanges) {
            return { valid: true, warning: null, range: null };
        }

        const range = modelRanges[resolution];
        if (!range) {
            return { valid: true, warning: null, range: null };
        }

        // Convert JC450 Kbps to Mbps if needed
        let min = range.min;
        let max = range.max;
        if (modelId === 'jc450' && max > 100) {
            min = min / 1024;
            max = max / 1024;
        }

        if (bitrate < min || bitrate > max) {
            return {
                valid: false,
                warning: `⚠️ Bitrate ${bitrate} Mbps está fora do range suportado (${min}-${max} Mbps) — pode não ser aplicável no dispositivo.`,
                range: { min, max }
            };
        }

        return { valid: true, warning: null, range: { min, max } };
    }

    /**
     * Calculate realistic correction factor based on codec and real-world overhead
     * @param {string} codec - Codec name (H.264, H.265)
     * @param {number} codecMultiplier - Base codec multiplier
     * @returns {object} - {factor: number, breakdown: object}
     */
    getRealisticCorrectionFactor(codec = 'H.264', codecMultiplier = 1.0) {
        if (!this.config.useRealisticCorrections) {
            return { 
                factor: codecMultiplier, 
                breakdown: { base: codecMultiplier } 
            };
        }

        const breakdown = {
            base: codecMultiplier,
            tsOverhead: this.config.overheadTS,
            audio: this.config.overheadAudio,
            vbr: codec === 'H.264' ? this.config.overheadVBR : 0,  // VBR mainly affects H.264
            filesystem: this.config.overheadFilesystem
        };

        // For H.265, the codec multiplier already includes compression (~0.65)
        // We add the overhead on top of that compression
        let totalFactor;
        if (codec === 'H.265' || codec === 'H265') {
            // H.265: Start with compression benefit (0.65), then add overhead
            totalFactor = codecMultiplier * (1 + breakdown.tsOverhead + breakdown.audio + breakdown.filesystem);
        } else {
            // H.264: Start at 1.0, add all overhead
            totalFactor = codecMultiplier + breakdown.tsOverhead + breakdown.audio + breakdown.vbr + breakdown.filesystem;
        }

        breakdown.total = totalFactor;

        return { factor: totalFactor, breakdown };
    }

    /**
     * Calculate variation range (min/max time estimates)
     * @param {number} baseTimeHours - Base calculation time in hours
     * @returns {object} - {min: number, max: number, margin: number}
     */
    getVariationRange(baseTimeHours) {
        const margin = baseTimeHours * this.config.variationMargin;
        return {
            min: baseTimeHours - margin,
            max: baseTimeHours + margin,
            margin: this.config.variationMargin * 100  // Convert to percentage
        };
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
        const correctionFactors = []; // Track correction details

        channels.forEach((channel, index) => {
            if (channel.active) {
                const codec = channel.codec || 'H.264';
                const baseCodecMultiplier = channel.codecMultiplier || 1;
                
                // Get realistic correction factor
                const correction = this.getRealisticCorrectionFactor(codec, baseCodecMultiplier);
                correctionFactors.push(correction);
                
                // Apply realistic correction factor
                const effectiveBitrate = channel.bitrate * correction.factor;
                const rateMBh = effectiveBitrate * this.config.MB_PER_HOUR_PER_MBPS;
                const timeHours = availableSpaceMB / rateMBh;
                
                channelResults.push({
                    channelId: channel.channelId,
                    channelName: channel.channelName || `CH${index + 1}`,
                    resolution: channel.resolution,
                    fps: channel.fps,
                    bitrate: channel.bitrate,
                    codec: codec,
                    codecMultiplier: baseCodecMultiplier,
                    correctionFactor: correction.factor,
                    correctionBreakdown: correction.breakdown,
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

        // Calculate variation range
        const variationRange = this.getVariationRange(totalTimeHours);

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
            unitsUsed: this.config.useDecimalUnits ? 'GB (decimal)' : 'GiB (binary)',
            
            // 🔧 Realistic calculation metadata
            realisticCorrections: this.config.useRealisticCorrections,
            variationRange: variationRange,
            estimatedTimeRange: {
                min: variationRange.min,
                max: variationRange.max,
                minDays: variationRange.min / 24,
                maxDays: variationRange.max / 24
            }
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
     * JC450 DUAL CARD CALCULATION - According to Official Jimi IoT PDF V1.1.5
     * 
     * DUAL CARD MODE (Two-card):
     * - Both cards record ALL channels (mirror/redundancy mode)
     * - Total available space = 2 × cardSize × 0.9
     * - Recording time = Total Space / Total Bitrate
     * - Reference: 2×256GB, 12Mbps → 460.8GB / 12Mbps = 87.38h
     * 
     * SINGLE CARD MODE:
     * - Only one card records all channels
     * - Available space = 1 × cardSize × 0.9
     * 
     * @param {number} cardSizeGB - Size of EACH SD card in GB
     * @param {Array} channels - Array of all 5 channels (indexed 0-4 for CH1-CH5)
     * @param {boolean} useOneCard - If true, use single card mode
     * @returns {object} - Detailed calculation results
     */
    calculateJC450DualCard(cardSizeGB, channels, useOneCard = false) {
        const MB_PER_GB = this.config.useDecimalUnits ? 1000 : 1024;
        const MAX_TOTAL_BITRATE = 20; // 20 Mbps hardware limit
        
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] Mode:', useOneCard ? 'SINGLE CARD' : 'DUAL CARD (Mirror/Redundancy)');
        console.log('[JC450 Debug] Card size:', cardSizeGB, 'GB each');
        console.log('[JC450 Debug] Input channels:', channels.length);
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] CHANNEL BITRATES RECEIVED FROM UI:');
        channels.forEach((ch, i) => {
            console.log(`  ${ch.channelId} (${ch.channelName}): ${ch.bitrate} Mbps [Active: ${ch.active}]`);
        });
        
        // Filter active channels
        const activeChannels = channels.filter(ch => ch.active);
        
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] ACTIVE CHANNELS BEING CALCULATED:');
        activeChannels.forEach((ch, i) => {
            console.log(`  [${i+1}] ${ch.channelId}: ${ch.bitrate} Mbps`);
        });
        
        // FIXED: According to official documentation, in DUAL CARD mode,
        // BOTH cards record ALL channels (mirror/redundancy), not split by channel.
        // Total available space = 2 × cardSize × 0.9 (when using 2 cards)
        
        const numberOfCards = useOneCard ? 1 : 2;
        const totalSpaceMB = cardSizeGB * numberOfCards * MB_PER_GB * this.config.usableSpacePercent;
        
        console.log('[JC450 Debug] Number of cards:', numberOfCards);
        console.log('[JC450 Debug] Total available space:', totalSpaceMB.toFixed(0), 'MB =', (totalSpaceMB / MB_PER_GB).toFixed(2), 'GB');
        
        // Calculate total bitrate and channel results
        let totalRateMBh = 0;
        let totalNominalRateMBh = 0; // For theoretical calculation (without correction)
        const channelResults = [];
        
        activeChannels.forEach(channel => {
            const codec = channel.codec || 'H.264';
            const baseCodecMultiplier = channel.codecMultiplier || 1;
            
            // Get realistic correction factor (1.08 for H.264)
            const correction = this.getRealisticCorrectionFactor(codec, baseCodecMultiplier);
            
            // Apply correction for display purposes
            const effectiveBitrate = channel.bitrate * correction.factor;
            const rateMBh = effectiveBitrate * this.config.MB_PER_HOUR_PER_MBPS;
            
            // Calculate nominal rate (without correction) for theoretical time calculation
            const nominalRateMBh = channel.bitrate * this.config.MB_PER_HOUR_PER_MBPS;
            
            console.log(`[JC450] ${channel.channelId}: ${channel.bitrate.toFixed(2)} Mbps × ${correction.factor.toFixed(2)} = ${effectiveBitrate.toFixed(2)} Mbps → ${rateMBh.toFixed(1)} MB/h`);
            
            channelResults.push({
                channelId: channel.channelId,
                channelName: channel.channelName,
                cardAssignment: useOneCard ? 'SD1' : 'SD1+SD2 (Mirror)',
                resolution: channel.resolution ? channel.resolution.toString() : '1080',
                fps: channel.fps || 25,
                bitrate: channel.bitrate || 1,
                codec: codec,
                codecMultiplier: baseCodecMultiplier,
                correctionFactor: correction.factor,
                correctionBreakdown: correction.breakdown,
                effectiveBitrate: effectiveBitrate,
                rateMBh: rateMBh,
                rateGBh: rateMBh / MB_PER_GB,
                rateGBday: (rateMBh * 24) / MB_PER_GB,
                rateMBs: rateMBh / 3600
            });
            
            totalRateMBh += rateMBh;
            totalNominalRateMBh += nominalRateMBh;
        });
        
        // Calculate total bitrate in Mbps
        const totalBitrate = activeChannels.reduce((sum, ch) => sum + ch.bitrate, 0);
        const totalRateGBh = totalRateMBh / MB_PER_GB;
        
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] BITRATE CALCULATION:');
        console.log('[JC450 Debug] Sum formula: activeChannels.reduce((sum, ch) => sum + ch.bitrate, 0)');
        console.log('[JC450 Debug] Individual bitrates:', activeChannels.map(ch => ch.bitrate).join(' + '));
        console.log('[JC450 Debug] Total bitrate (nominal):', totalBitrate.toFixed(2), 'Mbps');
        console.log('[JC450 Debug] ========================================');
        
        // FIXED: Calculate recording time using NOMINAL bitrate (without correction)
        // This matches the official formula: recording_hours = (available_gb * 8192) / (total_bitrate_mbps * 3600)
        // Equivalent to: recording_hours = available_MB / (total_bitrate_mbps * 450)
        const timeHours = totalNominalRateMBh > 0 ? totalSpaceMB / totalNominalRateMBh : Infinity;
        const timeDays = isFinite(timeHours) ? timeHours / 24 : 0;
        
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] RECORDING TIME CALCULATION:');
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] Available space:', totalSpaceMB.toFixed(0), 'MB (', (totalSpaceMB / MB_PER_GB).toFixed(2), 'GB )');
        console.log('[JC450 Debug] Total bitrate (sum):', totalBitrate.toFixed(2), 'Mbps');
        console.log('[JC450 Debug] Theoretical consumption:', totalNominalRateMBh.toFixed(2), 'MB/h (', (totalNominalRateMBh / MB_PER_GB).toFixed(2), 'GB/h )');
        console.log('[JC450 Debug] With overhead (8%):', totalRateMBh.toFixed(2), 'MB/h (', totalRateGBh.toFixed(2), 'GB/h )');
        console.log('[JC450 Debug] ----------------------------------------');
        console.log('[JC450 Debug] 📊 RECORDING TIME (theoretical):', timeHours.toFixed(2), 'hours =', timeDays.toFixed(2), 'days');
        console.log('[JC450 Debug] ----------------------------------------');
        console.log('[JC450 Debug] Formula verification:');
        console.log('[JC450 Debug]   Method 1:', totalSpaceMB.toFixed(0), 'MB ÷', totalNominalRateMBh.toFixed(2), 'MB/h =', timeHours.toFixed(2), 'h');
        console.log('[JC450 Debug]   Method 2: (', (totalSpaceMB / MB_PER_GB).toFixed(2), 'GB × 8192 ) ÷ (', totalBitrate.toFixed(2), 'Mbps × 3600 ) =', 
            (((totalSpaceMB / MB_PER_GB) * 8192) / (totalBitrate * 3600)).toFixed(2), 'hours');
        console.log('[JC450 Debug] ========================================');
        console.log('[JC450 Debug] ✅ CALCULATION COMPLETE');
        console.log('[JC450 Debug] 💡 To get different results, change the bitrate values in the UI dropdowns');
        console.log('[JC450 Debug] 💡 Example: CH1=4 Mbps, CH2-5=2 Mbps each → Total 12 Mbps → ~87.38h');
        console.log('[JC450 Debug] ========================================');
        
        // Bitrate warning
        const bitrateWarning = totalBitrate > MAX_TOTAL_BITRATE 
            ? `⚠️ Bitrate total (${totalBitrate.toFixed(1)} Mbps) excede o limite de hardware (${MAX_TOTAL_BITRATE} Mbps). Reduza a qualidade.`
            : null;
        
        // Variation range
        const variationRange = this.getVariationRange(timeHours);
        
        // FIXED: Build result structure compatible with display
        // In dual card mode, we create virtual SD1/SD2 objects for display compatibility
        const availableSpacePerCard = cardSizeGB * MB_PER_GB * this.config.usableSpacePercent;
        
        return {
            // Card information
            cardSizeGB,
            useOneCard,
            availableSpaceMB: totalSpaceMB, // Total available space
            
            // Virtual SD1/SD2 details for display compatibility
            // Note: In mirror mode, both cards record the same data
            sd1: {
                cardName: 'SD1',
                channels: useOneCard ? 'All Channels' : 'All Channels (Mirror)',
                channelCount: activeChannels.length,
                totalBitrate: totalBitrate,
                totalRateMBh: totalRateMBh,
                totalRateGBh: totalRateGBh,
                availableSpaceMB: availableSpacePerCard,
                timeHours: timeHours,
                timeDays: timeDays,
                channelResults: channelResults
            },
            
            sd2: useOneCard ? null : {
                cardName: 'SD2',
                channels: 'All Channels (Mirror)',
                channelCount: activeChannels.length,
                totalBitrate: totalBitrate,
                totalRateMBh: totalRateMBh,
                totalRateGBh: totalRateGBh,
                availableSpaceMB: availableSpacePerCard,
                timeHours: timeHours,
                timeDays: timeDays,
                channelResults: channelResults
            },
            
            // System totals
            totalBitrate,
            totalRateMBh: totalRateMBh,
            totalRateGBh: totalRateGBh,
            totalRateGBday: totalRateGBh * 24,
            
            // Recording time
            totalTimeHours: timeHours,
            totalTimeDays: timeDays,
            limitingCard: null, // Not applicable in mirror mode
            
            // All channels
            channelResults: channelResults,
            activeChannels: activeChannels.length,
            
            // Warnings and metadata
            bitrateWarning,
            usablePercentage: this.config.usableSpacePercent * 100,
            realisticCorrections: this.config.useRealisticCorrections,
            variationRange,
            estimatedTimeRange: {
                min: variationRange.min,
                max: variationRange.max,
                minDays: variationRange.min / 24,
                maxDays: variationRange.max / 24
            },
            
            // FIXED: Dynamic note based on official documentation (Jimi IoT PDF V1.1.5)
            note: useOneCard 
                ? `⚠️ Modo de 1 cartão: Todos os ${activeChannels.length} canais gravam no mesmo cartão SD de ${cardSizeGB}GB. ` +
                  `Espaço disponível: ${(totalSpaceMB / MB_PER_GB).toFixed(1)} GB. ` +
                  `Pequenas variações (±${this.config.variationMargin * 100}%) podem ocorrer devido a bitrate variável, ` +
                  `áudio, overhead do container TS e sistema de arquivos.`
                : `✅ Modo Dual Card (Two-card): Ambos os cartões gravam TODOS os canais (espelhamento/redundância). ` +
                  `Espaço total disponível: ${(totalSpaceMB / MB_PER_GB).toFixed(1)} GB (${numberOfCards} × ${cardSizeGB}GB × 90%). ` +
                  `Bitrate total: ${totalBitrate.toFixed(1)} Mbps. ` +
                  `Tempo de gravação: ${timeHours.toFixed(2)}h. ` +
                  `Pequenas variações (±${this.config.variationMargin * 100}%) podem ocorrer devido a fatores de gravação real.`
        };
    }

    /**
     * Helper function to calculate a single card with assigned channels
     * NOTE: This function is kept for backward compatibility but not used in JC450 dual card mode.
     * JC450 now uses mirror/redundancy mode where both cards record all channels.
     * @param {number} cardSizeGB - Card size in GB
     * @param {Array} channels - Channels assigned to this card
     * @param {string} cardName - Name/ID of the card (SD1 or SD2)
     * @param {number} MB_PER_GB - MB per GB conversion factor
     * @returns {object} - Card calculation result
     */
    calculateCardWithChannels(cardSizeGB, channels, cardName, MB_PER_GB) {
        const totalSpaceMB = cardSizeGB * MB_PER_GB;
        const availableSpaceMB = totalSpaceMB * this.config.usableSpacePercent;
        
        console.log(`[${cardName}] Card size: ${cardSizeGB} GB, Available: ${availableSpaceMB.toFixed(0)} MB (${(this.config.usableSpacePercent * 100)}% usable)`);
        
        let totalRateMBh = 0;
        const channelResults = [];
        
        channels.forEach(channel => {
            const codec = channel.codec || 'H.264';
            const baseCodecMultiplier = channel.codecMultiplier || 1;
            
            // Get realistic correction factor (1.08 for H.264)
            const correction = this.getRealisticCorrectionFactor(codec, baseCodecMultiplier);
            
            // Apply correction
            const effectiveBitrate = channel.bitrate * correction.factor;
            const rateMBh = effectiveBitrate * this.config.MB_PER_HOUR_PER_MBPS;
            
            console.log(`[${cardName}] ${channel.channelId}: ${channel.bitrate.toFixed(2)} Mbps × ${correction.factor.toFixed(2)} = ${effectiveBitrate.toFixed(2)} Mbps → ${rateMBh.toFixed(1)} MB/h`);
            
            channelResults.push({
                channelId: channel.channelId,
                channelName: channel.channelName,
                cardAssignment: cardName,
                resolution: channel.resolution ? channel.resolution.toString() : '1080',
                fps: channel.fps || 25,
                bitrate: channel.bitrate || 1,
                codec: codec,
                codecMultiplier: baseCodecMultiplier,
                correctionFactor: correction.factor,
                correctionBreakdown: correction.breakdown,
                effectiveBitrate: effectiveBitrate,
                rateMBh: rateMBh,
                rateGBh: rateMBh / MB_PER_GB,
                rateGBday: (rateMBh * 24) / MB_PER_GB,
                rateMBs: rateMBh / 3600
            });
            
            totalRateMBh += rateMBh;
        });
        
        // Calculate total bitrate in Mbps
        const totalBitrate = channels.reduce((sum, ch) => sum + ch.bitrate, 0);
        
        // Calculate recording time for this card
        const timeHours = totalRateMBh > 0 ? availableSpaceMB / totalRateMBh : Infinity;
        const timeDays = isFinite(timeHours) ? timeHours / 24 : 0;
        
        console.log(`[${cardName}] Total consumption: ${totalRateMBh.toFixed(1)} MB/h → Time: ${timeHours.toFixed(1)} h (${timeDays.toFixed(2)} days)`);
        
        return {
            cardName,
            channelCount: channels.length,
            totalBitrate,
            totalRateMBh,
            totalRateGBh: totalRateMBh / MB_PER_GB,
            availableSpaceMB,
            timeHours,
            timeDays,
            channelResults
        };
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
