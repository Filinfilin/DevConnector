const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')
//@route GET api/users
//@desc register user
//@access Public

router.post ('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'please enter a valid email').isEmail(),
    check('password', 'lease enter password 6 or more characters').isLength({min: 6})
],
(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    res.send('user route')});

module.exports = router;
 