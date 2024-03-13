import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const { Schema } = mongoose;

const cartItemSchema = new mongoose.Schema({
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  productName: {
      type: String,
      required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  items: [cartItemSchema],
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
