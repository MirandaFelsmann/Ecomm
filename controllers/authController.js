import User from '../Models/User.js';
import passport from 'passport'; //npm library that handles logins

export const login = (req, res) => {
  res.render('login');
}

export const verifyLogin = 
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: false });

export const register = (req, res) => {
  res.render('register');
}

export const verifyRegister = async (req, res) => {
  try {
    const { username, password, accountName } = req.body;
    const user = new User({ username, password, accountName });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.send(error.message);
  }
};


export const logout = (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    // Redirect or respond after successful logout
    res.redirect('/');
  });
}                        

// Middleware to check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Middleware to check for admin role
export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  // If the user is not an admin, redirect them or show an error
  res.status(403).send('Access denied');
}


export const changeRole = async (req, res ) => {
    try {
        console.log(req.body);
        const user = await User.findOne({ username: req.body.username });
        console.log(user);
        console.log(user.username);
        user.role = user.role === 'admin' ? 'user' : 'admin';

    // Save the updated user
    await user.save();

    // Respond with the updated user information
    res.redirect("/");
  } catch (error) {
    // If an error occurs, send a 500 response with the error message
    res.status(500).send(error.message);
  }
}

export const changePassword = async (req, res) => {
    res.render("changePassword", { user: req.user });
}

export const updatePassword = async (req, res) => {
    const username = req.body.username;
    const user = await User.findOne({ username: username });
    try {
        const currTypedPass = req.body.currPass;
        console.log(currTypedPass);
        const newTypedPass = req.body.newPass;
        console.log(newTypedPass);
        const newConfPass = req.body.confirmPass;
        console.log(newConfPass);
        if (newTypedPass === newConfPass) {
            
            console.log("curr pass: " + user.password);
            user.comparePassword(currTypedPass, async (err, isMatch) => {
                if (!isMatch) {
                    res.send("Current password is incorrect.");
                    return;
                }
                user.password = newConfPass;
                await user.save();
                console.log("new pass: " + user.password);
            });
            res.redirect('/');
            
        } else {
            console.log("error");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}