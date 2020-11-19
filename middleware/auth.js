const jwt = require('jsonwebtoken')
const config = require('config')

//get access to the response and request 
//'next' - callback
module.exports = function(req,res,next){

    //get the token from the header
    const token = req.header('x-auth-token'); 
    //check if not token
    if(!token){
        return res.status(401).json({msg: 'no token, authorization denied'})
    }
    //verify token 
    try{ 
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user
        next()
    }catch(err){
        res.status(401).json({msg: 'token s not valid'})
    }
}