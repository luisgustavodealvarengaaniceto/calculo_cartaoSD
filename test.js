// Test file to verify model structure
console.log('=== Testing DVR Models ===');

// Load models.js content here to test
// This is just for verification

const testModel = 'JC181';
console.log(`Testing model: ${testModel}`);

// Check if model exists
if (typeof dvrModels !== 'undefined' && dvrModels[testModel]) {
    const model = dvrModels[testModel];
    console.log('✅ Model found');
    console.log('Channels:', model.channels ? model.channels.length : 'undefined');
    console.log('Has presets:', model.presets ? 'Yes' : 'No');
    
    if (model.channels) {
        model.channels.forEach((ch, idx) => {
            console.log(`Channel ${idx}:`, ch.name);
            console.log('  Resolutions:', ch.resolutions ? ch.resolutions.length : 'undefined');
            if (ch.resolutions && ch.resolutions[0]) {
                console.log('  First resolution:', ch.resolutions[0].label);
                console.log('  Bitrates:', ch.resolutions[0].bitrates);
            }
            console.log('  FPS:', ch.fps || 'undefined');
        });
    }
} else {
    console.error('❌ Model not found or dvrModels not loaded');
}

console.log('=== Test Complete ===');
