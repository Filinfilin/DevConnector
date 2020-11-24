const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const validator = require('express-validator')
const {check, validationResult} = require('express-validator');
const { find } = require('../../models/Profile');

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
    }});

    //@route POST api/profile
    //@desc create or update user profile
    //@access private
    
router.post('/', [auth,[check('status','Status is required').not().isEmpty(),
                            check('skills', 'skills is required').not().isEmpty()
                            ]],
    async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const { company,
                website,
                location,
                bio,
                status,
                githubusername,
                skills,
                youtube,
                twiter,
                facebook,
                instagram,
                linkedin
            } = req.body

    //build profile object

        const profileFields ={};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company
        if(website) profileFields.website = website
        if(location) profileFields.location = location
        if(bio) profileFields.bio = bio
        if(status) profileFields.status = status
        if(githubusername) profileFields.githubusername = githubusername
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
       profileFields.social = {}
       if(youtube) profileFields.social.youtube = youtube
       if(twiter) profileFields.social.twiter = twiter
       if(facebook) profileFields.social.facebook = facebook
       if(instagram) profileFields.social.instagram = instagram 
       if (linkedin) profileFields.social.linkedin = linkedin

       try{
            let profile = await Profile.findOne({user: req.user.id})
            if(profile){
        //update profile
                profile = await Profile.findOneAndUpdate(
                     {user: req.user.id},
                     {$set: profileFields},
                     {new: true}
                )
                    return res.json(profile)
            }

        // create profile
            profile = new Profile(profileFields)

            await profile.save()
            res.json(profile)

       }catch(err){
        console.error(err.message);
        res.status(500).send('server error from profile update')
    }

    })

    //@route POST api/profile
    //@desc get all profiles
    //@access public

router.get('/', async(req, res)=> {
    try {
        const profiles = await Profile.find().populate("user", ["name", "avatar"])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error from get all profiles')
    }
});

    //@route GET api/profile/user/:user_id
    //@desc get all profiles
    //@access public

router.get('/user/:user_id', async(req, res)=> {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate("user", ["name", "avatar"])
        if(!profile) res.status(400).json({msg: 'there is no any matched user'})
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error from get user by user id')
    }
})



module.exports = router;
