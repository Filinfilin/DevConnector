const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')
const Post = require('../../models/Post')
const User = require('../../models/User')
const Profie = require('../../models/Profile');

//@route POST api/posts
//@desc create a post
//@access private

router.post('/', [auth,
    [ 
        check('text', 'Text is required').not().isEmpty()
    ]],
    async(req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        try {
            const user = await User.findById(req.user.id).select('-password')

            const newPost = new Post ({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })

            const post = await newPost.save()

            res.json(post)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error from post')
        }

    });

//@route GET api/posts
//@desc get all posts
//@access private

router.get('/',auth, async(req, res)=>{
    try {
        const allposts = await Post.find().sort({date: -1})
        res.json(allposts)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error from get post')
    }
})

//@route GET api/posts/:id
//@desc get posts by id
//@access private

router.get('/:id',auth, async(req, res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({msg: 'post not found'})
        res.json(post)

    } catch (err) {

        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'post not found'})
        }
        res.status(500).send('Server error from get post')
    }
})

//@route GET api/posts/:id
//@desc get posts by id
//@access private

router.delete('/:id', auth, async(req, res)=>{
    try {

        const post = await Post.findById(req.params.id)
        console.log(post)
        if(!post) return res.status(404).json({msg: 'post not found'})
        if(post.user.toString() !== req.user.id) return res.status(401).json({msg: 'User not authoraized'})
        await post.remove()
        res.json({msg: 'Post removed'})

    } catch (err) {

        console.error(err.message)

        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'post not found'})
        }
        res.status(500).send('Server error from delete post')
    }
})


module.exports = router;
