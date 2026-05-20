const mongoose = require('mongoose');

const ProcessingHistorySchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true,
        unique: true
    },
    source: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    weightInfo: {
        type: String,
        default: ''
    },
    lossInfo: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'COMPLETED'
    },
    tag: {
        type: String,
        default: ''
    },
    tagColor: {
        type: String,
        default: ''
    },
    temperature: {
        type: Number,
        default: 0
    },
    processingTime: {
        type: String,
        default: ''
    },
    gasPressure: {
        type: Number,
        default: 0
    },
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProcessingHistory', ProcessingHistorySchema);
