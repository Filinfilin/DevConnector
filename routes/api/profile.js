const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');


//@route GET api/profile/me
//@desc get curent user profile
//@access private


router.get('/me', auth, async (req, res) => {
    try{

        const profile = await (await Profile.findOne({user: req.user.id})).populate('user', ['name','avatar'])

        if(!profile){
            return res.status(400).json({msg: 'there si no profile for this user'})
        }

        res.json(profile)

    }
    catch(err){
        console.error(err.message)
        res.status(500).send('server error from profile')

    }
}
);

module.exports = router;
