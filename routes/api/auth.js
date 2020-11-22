const { request } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')
const jwt = require("jsonwebtoken")
const config = require('config' )

//@route GET api/auth
//@desc Test Route
//@access Public

router.get('/', auth, async (req, res) =>{
    try{
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
        

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error from auth')
    }
    
});

//@route GET api/users
//@desc register user
//@access Public

router.post ('/',[
    check('email').isEmail(),
    check('password').exists()
        ], async(req, res) => {
            const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
            }
    const{email, password} = req.body;

    try{
     //see if the user exist
    let user = await User.findOne({email})
        if(!user){
                res.status(400)
                .json({errors: [{msg: 'invalid email'}] });
                };
      

    const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
                res.status(400)
                .json({errors: [{msg: 'password is wrong'}] });
        };
        //return jsonwebtoken

        const payload = {
            user: {
                id: user.id
            }
        };

    jwt.sign(
        payload,
        config.get('jwtSecret'),  
        {expiresIn: 360000},
        (err, token)=>{
            if(err) throw err;
            res.json({token});
        });
 
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server errorfrom users')
    }}
    );



    
module.exports = router;
