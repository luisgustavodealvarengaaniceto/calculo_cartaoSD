// DVR Models Configuration
const dvrModels = {
    JC181: {
        name: 'JC181',
        maxCapacity: 128,
        cardSizes: [16, 32, 64, 128],
        presets: [
            {
                id: 'default',
                name: 'Default',
                nameEn: 'Default',
                namePt: 'Padrão',
                description: 'CH1: 720P@4M + CH2: 360P@0.5M (fixed)',
                channels: [
                    { id: 'CH1', resolution: '720', fps: 25, bitrate: 4 },
                    { id: 'CH2', resolution: '360', fps: 25, bitrate: 0.5, fixed: true }
                ],
                totalBitrate: 4.5,
                estimatedTime: { '32': 14.5, '64': 29.1, '128': 58.3 }
            },
            {
                id: 'high_resolution',
                name: 'High Resolution',
                nameEn: 'High Resolution',
                namePt: 'Alta Resolução',
                description: 'CH1: 1080P@8M + CH2: 360P@0.5M (fixed)',
                channels: [
                    { id: 'CH1', resolution: '1080', fps: 25, bitrate: 8 },
                    { id: 'CH2', resolution: '360', fps: 25, bitrate: 0.5, fixed: true }
                ],
                totalBitrate: 8.5,
                estimatedTime: { '32': 7.7, '64': 15.4, '128': 30.8 }
            },
            {
                id: 'long_recording',
                name: 'Long Recording',
                nameEn: 'Longest Recording Time',
                namePt: 'Maior Tempo de Gravação',
                description: 'CH1: 480P@1M + CH2: 360P@0.5M (fixed)',
                channels: [
                    { id: 'CH1', resolution: '480', fps: 25, bitrate: 1 },
                    { id: 'CH2', resolution: '360', fps: 25, bitrate: 0.5, fixed: true }
                ],
                totalBitrate: 1.5,
                estimatedTime: { '32': 43.7, '64': 87.4, '128': 174.8 }
            }
        ],
        channels: [
            {
                id: 'CH1',
                name: 'CH1 - Main Camera',
                configurable: true,
                resolutions: [
                    { value: '480', label: '480P (720×480)', bitrates: [1, 2, 3, 4] },
                    { value: '720', label: '720P (1280×720)', bitrates: [1, 2, 3, 4, 5, 6] },
                    { value: '1080', label: '1080P (1920×1080)', bitrates: [1, 2, 3, 4, 5, 6, 7, 8] }
                ],
                fps: [15, 25, 30]
            },
            {
                id: 'CH2',
                name: 'CH2 - Internal Camera (Fixed: 360P@0.5M)',
                configurable: false,
                fixed: true,
                resolution: '360',
                fps: 25,
                bitrate: 0.5,
                resolutions: [
                    { value: '360', label: '360P (640×360) - Fixed @0.5M', bitrates: [0.5] }
                ]
            }
        ],
        maxChannels: 2,
        commandFormat: (config) => {
            const commands = [];
            // JC181: VIDEO,PARAM,<A>,<B>,<C>,<D>#
            // A=1 (Main camera - CH1)
            // B=480/720/1080 (Resolution)
            // C=30/25/15 (FPS)
            // D=1/2/3/4/5/6/7/8 (Bitrate in Mbps)
            
            const ch1 = config.channels[0];
            if (ch1 && ch1.active) {
                commands.push(`VIDEO,PARAM,1,${ch1.resolution},${ch1.fps},${ch1.bitrate}#`);
            }
            
            // CH2 é sempre fixo: 360P@0.5M@25fps (não precisa comando)
            commands.push('# CH2 (Internal Camera) is fixed: 360P (640×360) @ 0.5M @ 25fps');
            
            return commands.join('\n');
        }
    },
    
    JC371: {
        name: 'JC371',
        maxCapacity: 256,
        cardSizes: [16, 32, 64, 128, 256],
        presets: [
            {
                id: 'default',
                name: 'Default',
                nameEn: 'Default',
                namePt: 'Padrão',
                description: 'CH1: 1080P@8M, CH2/CH3: 720P@4M (H.264)',
                channels: [
                    { id: 'CH1', resolution: '1080', fps: 25, bitrate: 8, codec: 'H264' },
                    { id: 'CH2', resolution: '720', fps: 15, bitrate: 4, codec: 'H264' },
                    { id: 'CH3', resolution: '720', fps: 15, bitrate: 4, codec: 'H264' }
                ],
                totalBitrate: 16,
                estimatedTime: { '32': 4.1, '128': 16.4, '256': 32.8 }
            },
            {
                id: 'high_resolution',
                name: 'High Resolution',
                nameEn: 'High Resolution',
                namePt: 'Alta Resolução',
                description: 'All channels: 1080P@8M (H.264)',
                channels: [
                    { id: 'CH1', resolution: '1080', fps: 25, bitrate: 8, codec: 'H264' },
                    { id: 'CH2', resolution: '1080', fps: 15, bitrate: 8, codec: 'H264' },
                    { id: 'CH3', resolution: '1080', fps: 15, bitrate: 8, codec: 'H264' }
                ],
                totalBitrate: 24,
                estimatedTime: { '32': 2.7, '128': 10.9, '256': 21.9 }
            },
            {
                id: 'h265_optimized',
                name: 'H.265 Optimized',
                nameEn: 'H.265 Optimized',
                namePt: 'Otimizado H.265',
                description: 'CH1: 1080P@8M, CH2/CH3: 720P@4M (H.265)',
                channels: [
                    { id: 'CH1', resolution: '1080', fps: 25, bitrate: 8, codec: 'H265' },
                    { id: 'CH2', resolution: '720', fps: 15, bitrate: 4, codec: 'H265' },
                    { id: 'CH3', resolution: '720', fps: 15, bitrate: 4, codec: 'H265' }
                ],
                totalBitrate: 11.2,
                estimatedTime: { '32': 5.9, '128': 23.4, '256': 46.9 }
            },
            {
                id: 'long_recording',
                name: 'Long Recording',
                nameEn: 'Longest Recording Time',
                namePt: 'Maior Tempo de Gravação',
                description: 'All channels: 360P@0.5M (H.264)',
                channels: [
                    { id: 'CH1', resolution: '360', fps: 25, bitrate: 0.5, codec: 'H264' },
                    { id: 'CH2', resolution: '360', fps: 15, bitrate: 0.5, codec: 'H264' },
                    { id: 'CH3', resolution: '360', fps: 15, bitrate: 0.5, codec: 'H264' }
                ],
                totalBitrate: 1.5,
                estimatedTime: { '32': 43.7, '128': 174.8, '256': 349.5 }
            }
        ],
        channels: [
            { id: 'CH1', name: 'CH1 - Road Facing' },
            { id: 'CH2', name: 'CH2 - USB Camera' },
            { id: 'CH3', name: 'CH3 - DMS Camera' }
        ],
        resolutions: [
            { value: '360', label: '360P', bitrates: [0.5, 1, 2] },
            { value: '480', label: '480P', bitrates: [0.5, 1, 2, 3, 4] },
            { value: '720', label: '720P', bitrates: [0.5, 1, 2, 3, 4, 5, 6, 7, 8] },
            { value: '1080', label: '1080P', bitrates: [0.5, 1, 2, 3, 4, 5, 6, 7, 8] }
        ],
        fps: [5, 10, 15, 20, 25],
        codecs: [
            { value: 'H264', label: 'H.264', multiplier: 1 },
            { value: 'H265', label: 'H.265', multiplier: 0.7 }
        ],
        maxChannels: 3,
        commandFormat: (config) => {
            const commands = [];
            // JC371: VIDEORSL,P1,P2,P3,P4,P5#
            // Configura resolução, taxa de quadros, bitrate e codificação dos vídeos salvos no cartão SD
            // Só entra em vigor após reiniciar o dispositivo
            // P1 = Canal da câmera (1: CH1 / 2: CH2 / 3: CH3)
            // P2 = Resolução (CH1: 1080/720/480/360, CH2: 1080/720/480/360, CH3: 720/480/360)
            // P3 = Frame rate (5-25 fps) - Padrão: 25 (CH1), 15 (CH2/CH3)
            // P4 = Bitrate (0.5-8 Mbps) - Padrão: 8 (CH1), 4 (CH2/CH3)
            // P5 = Codec (1: H.264 / 2: H.265) - Padrão: 2 (H.265)
            
            config.channels.forEach((ch, idx) => {
                if (ch.active) {
                    const codecValue = ch.codec === 'H265' || ch.codec === 'H.265' ? 2 : 1;
                    commands.push(`VIDEORSL,${idx + 1},${ch.resolution},${ch.fps},${ch.bitrate},${codecValue}#`);
                }
            });
            
            return commands.join('\n');
        }
    },
    
    JC400: {
        name: 'JC400',
        maxCapacity: 256,
        cardSizes: [16, 32, 64, 128, 256],
        presets: [
            {
                id: 'default',
                name: 'Default',
                nameEn: 'High Resolution (Default)',
                namePt: 'Alta Resolução (Padrão)',
                description: 'OUT: 1080P@8M, IN: 720P@6M',
                channels: [
                    { id: 'OUT', resolution: '1080', fps: 25, bitrate: 8, preset: '0' },
                    { id: 'IN', resolution: '720', fps: 25, bitrate: 6, preset: '0' }
                ],
                totalBitrate: 14,
                estimatedTime: { '32': 4.7, '128': 18.7, '256': 37.4 }
            },
            {
                id: 'long_recording',
                name: 'Long Recording',
                nameEn: 'Longest Recording Time',
                namePt: 'Maior Tempo de Gravação',
                description: 'Both: 360P@0.5M',
                channels: [
                    { id: 'OUT', resolution: '360', fps: 25, bitrate: 0.5, preset: '3' },
                    { id: 'IN', resolution: '360', fps: 25, bitrate: 0.5, preset: '3' }
                ],
                totalBitrate: 1,
                estimatedTime: { '32': 65.5, '128': 262.1, '256': 524.3 }
            }
        ],
        channels: [
            {
                id: 'OUT',
                name: 'OUT Camera',
                presets: [
                    { value: '0', label: '1080P@8M', resolution: '1080', bitrate: 8, fps: 25 },
                    { value: '1', label: '720P@4M', resolution: '720', bitrate: 4, fps: 25 },
                    { value: '2', label: '480P@2M', resolution: '480', bitrate: 2, fps: 25 },
                    { value: '3', label: '360P@0.5M', resolution: '360', bitrate: 0.5, fps: 25 }
                ]
            },
            {
                id: 'IN',
                name: 'IN Camera',
                presets: [
                    { value: '0', label: '720P@6M', resolution: '720', bitrate: 6, fps: 25 },
                    { value: '1', label: '720P@3M', resolution: '720', bitrate: 3, fps: 25 },
                    { value: '2', label: '480P@2M', resolution: '480', bitrate: 2, fps: 25 },
                    { value: '3', label: '360P@0.5M', resolution: '360', bitrate: 0.5, fps: 25 }
                ]
            }
        ],
        maxChannels: 2,
        commandFormat: (config) => {
            const commands = [];
            // JC400 uses preset mode with descriptive comments
            // CAMERA,<channel>,<preset>#
            // Presets define resolution, fps, and bitrate combinations
            
            config.channels.forEach((ch) => {
                if (!ch.active) return;
                
                if (ch.preset !== undefined) {
                    // Add command with descriptive comment showing what the preset means
                    const presetDesc = `${ch.resolution}P @ ${ch.fps}fps, ${ch.bitrate}Mbps`;
                    commands.push(`CAMERA,${ch.channelId},${ch.preset}# // ${presetDesc}`);
                }
            });
            
            return commands.join('\n');
        }
    },
    
    JC450: {
        name: 'JC450',
        maxCapacity: 512,
        cardSizes: [16, 32, 64, 128, 256],
        dualCard: true,
        cardDescription: '2 cartões SD (capacidade total combinada)',
        presets: [
            {
                id: 'default',
                name: 'Default',
                nameEn: 'Default',
                namePt: 'Padrão',
                description: 'CH1: 720P@2M, CH2-5: 480P@1M',
                channels: [
                    { id: 'CH1', resolution: '720', fps: 25, bitrate: 2 },
                    { id: 'CH2', resolution: '480', fps: 15, bitrate: 1 },
                    { id: 'CH3', resolution: '480', fps: 15, bitrate: 1 },
                    { id: 'CH4', resolution: '480', fps: 15, bitrate: 1 },
                    { id: 'CH5', resolution: '480', fps: 15, bitrate: 1 }
                ],
                totalBitrate: 6,
                estimatedTime: { '128': 43.7, '256': 87.4 }
            },
            {
                id: 'high_resolution',
                name: 'High Resolution',
                nameEn: 'High Resolution',
                namePt: 'Alta Resolução',
                description: 'CH1: 1080P@4M, CH2-5: 720P@2M',
                channels: [
                    { id: 'CH1', resolution: '1080', fps: 25, bitrate: 4 },
                    { id: 'CH2', resolution: '720', fps: 15, bitrate: 2 },
                    { id: 'CH3', resolution: '720', fps: 15, bitrate: 2 },
                    { id: 'CH4', resolution: '720', fps: 15, bitrate: 2 },
                    { id: 'CH5', resolution: '720', fps: 15, bitrate: 2 }
                ],
                totalBitrate: 12,
                estimatedTime: { '128': 21.8, '256': 43.7 }
            },
            {
                id: 'long_recording',
                name: 'Long Recording',
                nameEn: 'Longest Recording Time',
                namePt: 'Maior Tempo de Gravação',
                description: 'All: 480P@1M',
                channels: [
                    { id: 'CH1', resolution: '480', fps: 25, bitrate: 1 },
                    { id: 'CH2', resolution: '480', fps: 15, bitrate: 1 },
                    { id: 'CH3', resolution: '480', fps: 15, bitrate: 1 },
                    { id: 'CH4', resolution: '480', fps: 15, bitrate: 1 },
                    { id: 'CH5', resolution: '480', fps: 15, bitrate: 1 }
                ],
                totalBitrate: 5,
                estimatedTime: { '128': 52.4, '256': 104.9 }
            }
        ],
        channels: [
            { id: 'CH1', name: 'CH1 - Road Facing/ADAS' },
            { id: 'CH2', name: 'CH2 - USB Camera' },
            { id: 'CH3', name: 'CH3 - DMS Camera' },
            { id: 'CH4', name: 'CH4 - Camera 4' },
            { id: 'CH5', name: 'CH5 - Camera 5 (PRO only)' }
        ],
        resolutions: [
            { value: '480', label: '480P (720×480)', bitrates: [1, 2, 3, 4] },
            { value: '720', label: '720P (1280×720)', bitrates: [1, 2, 3, 4] },
            { value: '1080', label: '1080P (1920×1080)', bitrates: [1, 2, 3, 4] }
        ],
        fps: [15, 25],
        maxChannels: 5,
        commandFormat: (config) => {
            const commands = [];
            // JC450: VIDEORSL,<A>,<B>,<C>,<D>#
            // A = número do canal (1-5)
            // B = resolução (480/720/1080)
            // C = frame rate (15/25)
            // D = bitrate em Mbps (1, 2, 3, 4)
            
            config.channels.forEach((ch, idx) => {
                if (ch.active) {
                    // Extract channel number from channelId (e.g., "CH1" -> 1)
                    const channelNum = ch.channelId ? parseInt(ch.channelId.replace(/[^0-9]/g, '')) : (idx + 1);
                    
                    // Bitrate in Mbps (not Kbps)
                    const bitrateMbps = ch.bitrate;
                    
                    commands.push(`VIDEORSL,${channelNum},${ch.resolution},${ch.fps},${bitrateMbps}#`);
                }
            });
            
            return commands.join('\n');
        }
    }
};

// Get Model Configuration
function getModelConfig(modelName) {
    return dvrModels[modelName] || null;
}

// Check if model exists
function isValidModel(modelName) {
    return dvrModels.hasOwnProperty(modelName);
}
