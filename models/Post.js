import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    pricePaid: {
        type: Number,
        required: true,
    },
    timeOfPurchase: {
        type: Date,
        default: Date.now,
    }
});

const PostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availableStock: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  sales: [salesSchema],
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
