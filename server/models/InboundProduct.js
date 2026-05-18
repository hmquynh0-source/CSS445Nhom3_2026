const mongoose = require('mongoose');

const inboundProductSchema = new mongoose.Schema({
    batchCode: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    origin: { type: String, default: 'Vietnam' },
    weight: { type: Number, required: true },
    moisture: { type: Number, default: 0 },
    screenSize: { type: String, default: '18' },
    screenPercent: { type: Number, default: 0 },
    defects: { type: Number, default: 0 },
    staffName: { type: String, default: 'Admin' },
    categoryName: { type: String, default: 'Nhân xanh' },
    status: { 
        type: String, 
        enum: ['QC PASSED', 'IN PROGRESS', 'FAILED'], 
        default: 'QC PASSED' 
    }
}, { timestamps: true });

module.exports = mongoose.model('InboundProduct', inboundProductSchema);