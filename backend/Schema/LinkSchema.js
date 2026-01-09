// import mongoose from 'mongoose';

// const linkSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
//     originalUrl: { type: String, required: true },
//     shortUrl: { type: String},
//     expirationDate: { type: Date, required: true },
//     dateCreated: { type: String, default: () => new Date().toDateString() }, // Format: "Mon Jan 01 2024"
//     timeCreated: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, // Format: "16:30"
//     status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//     remark: { type: String, default: '' },
//     clicks: { type: Number, default: 0 },
// });

// // Middleware to update status to 'inactive' if expiration date is passed
// linkSchema.pre('save', function (next) {
//     if (this.expirationDate < new Date()) {
//         this.status = 'inactive';
//     }
//     next();
// });

// export default mongoose.model('Link', linkSchema);