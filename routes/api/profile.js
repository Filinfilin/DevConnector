const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const validator = require('express-validator')
const {check, validationResult, sanitizeBody} = require('express-validator');
const { find, findOne } = require('../../models/Profile');
const User = require('../../models/User');
const request = require("request");
const config = require("config");
const { response } = require('express');


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
    
router.post('/', [auth,[
    check('status','Status is required').not().isEmpty(),
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
            if(!profile) return res.status(400).json({msg: 'there is no any matched user'})
            res.json(profile)
    } catch (err) {
            if(err.kind === 'ObjectId'){
                return res.status(400).json({msg: 'there is no any matched user'})
            }
            console.error(err.message)
            res.status(500).send('Server error from get user by user id')
    }
})

    //@route DELETE api/profile/user/:user_id
    //@desc delete profile and posts
    //@access public

router.delete('/',auth, async(req, res)=> {

        try {
            //find and remove user
            await User.findOneAndRemove({_id: req.user.id})
            //find and remove profile
            await Profile.findOneAndRemove({user: req.user.id})

            res.json({msg: "The user has been deleted"})

        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error from get all profiles')
        }
});

    //@route PUT api/profile/experience
    //@desc add proile experience
    //@access private

router.put('/experience', [auth,[
            check('title', 'title is required').not().isEmpty(),
            check('company', 'company is required').not().isEmpty(),
            check('from', 'from is required').not().isEmpty()
    ]], async(req, res)=>{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({user: req.user.id})
            profile.experience.unshift(newExp)
            await profile.save()
            res.json(profile)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error from update experience')
        }
 })

    //@route DELETE api/profile/experience
    //@desc delete proile experience
    //@access private
    
router.delete('/experience/:exp_id',auth, async(req, res)=>{

        try {
            const profile = await Profile.findOne({user: req.user.id})
            const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id)
            console.log(removeIndex)
            profile.experience.splice(removeIndex, 1)
            await profile.save()
            res.json(profile)
        
        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error from delete experience')
        }
})

     //@route PUT api/profile/education
    //@desc update proile education
    //@access private

router.put('/education', [auth,[
            check('school', 'school is required').not().isEmpty(),
            check('degree', 'degree is required').not().isEmpty(),
            check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
            check('from', 'from is required').not().isEmpty(),
    ]], async(req, res)=>{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newEd = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({user: req.user.id})
            profile.education.unshift(newEd)
            await profile.save()
            res.json(profile)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error from update education')
        }
})

    //@route DELETE api/profile/education
    //@desc delete proile education
    //@access private

router.delete('/education/:ed_id',auth, async(req, res)=>{

        try {
            const profile = await Profile.findOne({user: req.user.id})
            const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.ed_id)
            console.log(removeIndex)
            profile.education.splice(removeIndex, 1)
            await profile.save()
            res.json(profile)
        
        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error from delete education')
        }
})

    //@route DELETE api/profile/education
    //@desc delete proile education
    //@access private
router.get('/github/:username', async (req, res) => {
    try { 

        const options = await {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githuClientScret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        }  

        request(options,(err, response, body)=>{
            
            if(response.statusCode !== 200){
                res.status(404).json({msg: 'No Github Profile found'})
            }
            res.json(JSON.parse(body))
        })  

    } catch (err) {
        console.error(err.message)
        response.status(500).send("server error from gh get request")
        
        }
    })


module.exports = router;
