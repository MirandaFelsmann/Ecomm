import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const { Schema } = mongoose;


const purchasesSchema = new mongoose.Schema({
    productID: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    productName: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    pricePaid: {
        type: Number,
        required: true,
    },
    totalPaid: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  credits: {
    type: Number,
    default: 200,
  },
  purchases: [purchasesSchema],
});



UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Check if the model exists before compiling it
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
