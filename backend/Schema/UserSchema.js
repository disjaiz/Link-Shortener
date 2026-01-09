import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    links: [{
        originalUrl: { type: String, required: true },
        shortCode: { type: String, required: false},
        expirationDate: { type: Date },
        dateCreated: { type: String, default: () => new Date().toDateString() },
        timeCreated: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        remark: { type: String, default: '' },
        clicks: { type: Number, default: 0 },
    }],
});

// Hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

export default mongoose.model('User', userSchema);


 // shortCode: { type: String, required: false},