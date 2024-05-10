module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        req.flash('error', 'Please Sign-in first');
        return res.redirect('/login')
    
    }
    next();
}