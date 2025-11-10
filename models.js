// DVR Models Configuration
const dvrModels = {
    JC181: {
        name: 'JC181',
        maxCapacity: 128,
        cardSizes: [16, 32, 64, 128],
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
                name: 'CH2 - Internal Camera (Fixed: 360P@0.5M@10fps)',
                configurable: false,
                fixed: true,
                resolution: '360',
                fps: 10,  // FIXED - Internal camera only supports 10fps
                bitrate: 0.5,
                resolutions: [
                    { value: '360', label: '360P (640×360) - Fixed @0.5M @10fps', bitrates: [0.5] }
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
            
            // CH2 é sempre fixo: 360P@0.5M@10fps (não precisa comando)
            commands.push('# CH2 (Internal Camera) is fixed: 360P (640×360) @ 0.5M @ 10fps');
            
            return commands.join('\n');
        }
    },
    
    JC371: {
        name: 'JC371',
        maxCapacity: 256,
        cardSizes: [16, 32, 64, 128, 256],
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
                    { value: '0', label: '720P@4M', resolution: '720', bitrate: 4, fps: 25 },
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
