import Post from '../Models/Post.js';
import User from '../Models/User.js';
import Cart from '../models/Cart.js';

let totalCartItems = 0;
let totalCartCost = 0;
let page = 1;
let sortQuery = {};
let searchQuery = {};
let totalPages = 0;

export const home = async (req, res) => {
    res.redirect('/products/1');
} //redirect to page 1 if just localhost3000/

export const loadPosts = async (req, res) => {
  try {
      console.log("LOAD POSTS CALLED");
      const posts = await Post.find();
      const totalPosts = posts.length;
      console.log("SQ");
      console.log(sortQuery);
      page = parseInt(req.params.page);
      totalPages = Math.ceil(totalPosts/5);
      res.render('posts/index', { posts, user: req.user ? req.user : null, page, totalPages, sortQuery });
    } catch (error) {
        res.status(500).send(error.toString());
    }
}; //awaits all posts, no limiting queries—renders index.ejs with necessary information inc page number


export const getProducts = async (req, res) => { //called through script.js
    console.log("GET PRODUCTS CALLED");
    const { sortOrder, searchText, sortBy, sortType } = req.body;
    if (sortType === 'price') {
        sortQuery = sortOrder === 'asc' ? { price: 1 } : { price: -1 };
    } //changes sortQuery to price if the sortType from script.js is price; toggles bw ascending and descending
    if (sortType === 'alpha') {
        sortQuery = sortBy === 'asc' ? { name: 1 } : { name: -1 };
    } //changes sortQuery to name if the sortType from script.js is alpha; toggles bw ascending and descending
    let sortTypeeee = sortType; //test line
    
    let searchQuery = searchText ? { name: { $regex: searchText, $options: 'i' } } : {}; //if searchText exists
    console.log(searchQuery);
    
    try {
        console.log(sortQuery);
        const products = await Post.find({
            $and: [ searchQuery ]
        }).sort(sortQuery).limit(5).skip(5*(page-1)); //awaits posts using limiting queries—prep for pagination
        const totalPostsXX = await Post.find({
            $and: [ searchQuery ]
        }).sort(sortQuery); //awaits all posts using limiting queries but without pagination
        totalPages = Math.ceil(totalPostsXX.length/5); //calc total pages by rounding up to nearest whole number required to display all posts at 5 posts per page
        console.log("total Pages:");
        console.log(totalPages);
        const productInfo = {products: products, totalPages: totalPages, totalProducts: totalPostsXX.length, currPage: page, allProducts: totalPostsXX, sortType: sortTypeeee } //grouping information
        res.json(productInfo); //sending information to script.js
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send(error);
    }
}

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params; // Assuming productId is passed as a parameter
    const user = req.user; 

    // Retrieve the user's cart or create a new one if it doesn't exist
    let cart = await Cart.findOne({ userID: user._id });
    if (!cart) {
      cart = new Cart({
        userID: user._id,
        totalQuantity: 0,
        totalPrice: 0,
        items: []
      });
    }

    // Find the product by its ID and check if it exists
    const product = await Post.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }
      
    const existingItemIndex = cart.items.findIndex(item => item.productID.equals(product._id));

    if (existingItemIndex !== -1) {
      // If the product already exists, increase its quantity and update the total price
      cart.items[existingItemIndex].quantity += 1;
      cart.totalPrice += product.price;
    } else {
      // If the product doesn't exist, add it as a new item
      cart.items.push({
        productID: product._id,
        productName: product.name,
        quantity: 1,
        price: product.price
      });
      // Update total quantity and total price in the cart
      cart.totalQuantity += 1;
      cart.totalPrice += product.price;
    }

    // Save the updated cart
    await cart.save();
    res.redirect('/'); // Redirect the user to the homepage or any other appropriate page
      
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const viewCart = async (req, res) => {
  try {
    totalCartItems = 0;
    totalCartCost = 0;
    const user = req.user;

    // Retrieve the user's cart from the database
    const userCart = await Cart.findOne({ userID: req.user._id }).populate('items.productID');
    
    if (!userCart || userCart.items.length === 0) {
      // If the cart is empty or not found, render the cart page with a message
      return res.render('posts/cart', { user, totalCartItems, totalCartCost, cart: null, message: "You have not added any items to your cart." });
    }

    // Calculate total number of items and total cost
    userCart.items.forEach(item => {
      totalCartItems += item.quantity;
      totalCartCost += item.price * item.quantity;
    });

    res.render('posts/cart', { user, totalCartItems, totalCartCost, cart: userCart });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = req.user; // Assuming user is authenticated and available in req.user
    const cart = await Cart.findOne({ userID: user._id });
    if (!cart) {
      return res.status(404).send('Cart not found');
    }
    cart.items = []; // Clearing the items array
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save(); // Save the updated cart
    req.flash('success', 'Cart cleared successfully');
    res.redirect('/cart'); // Redirect back to the cart page
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const user = req.user; // Assuming user is authenticated and available in req.user
    const cart = await Cart.findOne({ userID: user._id });
    if (!cart) {
      return res.status(404).send('Cart not found');
    }
    const { itemId } = req.params; //find itemId
      
    const itemToDelete = cart.items.find(item => item._id.toString() === itemId); //find item with itemId
    if (!itemToDelete) {
      return res.status(404).send('Item not found in cart');
    }
      
      cart.totalPrice -= itemToDelete.price * itemToDelete.quantity;
      cart.totalQuantity -= 1;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save(); // Save the updated cart
    req.flash('success', 'Item(s) successfully deleted from cart');
    res.redirect('/cart'); // Redirect back to the cart page
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addQuantityToCartItem = async (req, res) => { //limited in cart.ejs to not allow if total in cart = total stock
    try {
        const user = req.user;
        const { itemId } = req.params;
        const cart = await Cart.findOne({ userID: user._id });

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        const itemToUpdate = cart.items.find(item => item._id.toString() === itemId);

        if (!itemToUpdate) {
            return res.status(404).send('Item not found in cart');
        }

        // Increase the quantity of the item by 1
        itemToUpdate.quantity += 1;
        cart.totalPrice += itemToUpdate.price; // Update the total price accordingly

        await cart.save();

        res.redirect('/cart');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const minusQuantityToCartItem = async (req, res) => {
    try {
        const user = req.user;
        const { itemId } = req.params;
        const cart = await Cart.findOne({ userID: user._id });

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        const itemToUpdate = cart.items.find(item => item._id.toString() === itemId);

        if (!itemToUpdate) {
            return res.status(404).send('Item not found in cart');
        }
        
        if (itemToUpdate.quantity !== 1) {
            itemToUpdate.quantity -= 1;
            cart.totalPrice -= itemToUpdate.price; // Update the total price accordingly
        } else {
            // If the quantity becomes zero after subtraction, delete the item from the cart
            cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        }

        await cart.save();

        res.redirect('/cart');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const viewProfile = async (req, res) => {
    try {
        const user = req.user;
        const userWithPurchases = await User.findById(user._id).populate('purchases.productID');
        res.render('posts/profile', { user: userWithPurchases });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const purchase = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ userID: user._id }).populate('items.productID');
    if (!cart) {
      return res.status(404).send('Cart not found');
    }
    
    const totalCartCost = cart.totalPrice;
    const userCredits = user.credits;
    
    if (userCredits >= totalCartCost) {
      // Sufficient credits, proceed with purchase
      user.credits -= totalCartCost;
      
      // Prepare purchases array to group items
      let purchases = [];
      
      // Group items in the cart by product
      const groupedItems = groupItemsByProduct(cart.items);
      
      // Calculate pricePaid and totalPaid for each group of items
      for (const groupedItem of groupedItems) {
        const product = groupedItem.product;
        const amount = groupedItem.quantity;
        const pricePaid = product.price; // Assuming each product has a price field
        
        // Calculate totalPaid for this group of items
        const totalPaid = pricePaid * amount;
          
        const productName = product.name;
        
        // Reduce available stock of the product by the purchased quantity
        product.availableStock -= amount;
        
        // Push the purchase object to the purchases array
        purchases.push({
          product: product._id,
          productName,
          amount,
          pricePaid,
          totalPaid,
          date: new Date(),
        });
          
        // Update post.sales attribute
        await Post.updateOne(
          { _id: product._id },
          {
            $push: {
              sales: {
                userID: user._id,
                pricePaid: pricePaid * amount,
                timeOfPurchase: new Date()
              }
            }
          }
        );
      }
      
      // Add purchases to the user's purchases array
      user.purchases.push(...purchases);
      
      // Clear the cart
      cart.items = [];
      cart.totalQuantity = 0;
      cart.totalPrice = 0;
      
      // Save changes to user, cart, and products
      await user.save();
      await cart.save();
      await Promise.all(groupedItems.map(item => item.product.save())); // Save all modified products
      req.flash('purchase', 'Purchase successful');
      
      res.redirect('/cart');
    } else {
      // Insufficient credits, display message
      res.send('You do not have enough credits to make this purchase.');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Helper function to group cart items by product and include available stock
const groupItemsByProduct = (items) => {
  const groupedItems = [];
  const map = new Map();
  
  // Group items by product
  items.forEach(item => {
    const key = item.productID._id;
    if (!map.has(key)) {
      map.set(key, { product: item.productID, quantity: 0 });
    }
    map.get(key).quantity += item.quantity;
  });
  
  // Convert map to array of grouped items and include available stock
  map.forEach(value => {
    const product = value.product;
    groupedItems.push(value);
  });
  
  return groupedItems;
};


