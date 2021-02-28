const express = require('express');
const multer = require('multer');
const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png:': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        if (isValid) {
            error = null;
        }
        cb(error, 'images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})

router.post('', multer({storage: storage}).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host'); // construct url to server
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imageUrl: url + '/images/' + req.file.filename
    });
    post.save().then(createdPost => {
        console.log(createdPost);
        res.status(201).json({
            message: 'Post added successfully.',
            post: {
                ...createdPost,
                id: createdPost._id
            }
        });
    });
});

router.put('/:id', multer({storage: storage}).single('image'),
    (req, res, next) => {
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            const url = req.protocol + '://' + req.get('host'); // construct url to server
            imageUrl = url + '/images/' + req.file.filename;
        }
        const post = new Post({
            _id: req.params.id,
            title: req.body.title,
            content: req.body.content,
            imageUrl: imageUrl
        });
        console.log(post);
        Post.updateOne({_id: req.params.id}, post).then(result => {
            console.log(result);
            res.status(200).json({message: 'Update successful.'});
        });
});

router.get('',(req, res, next) => {
    Post.find()
        .then(documents => {
            console.log(documents);
            res.status(200).json({
                message: 'Posts fetched successfully.',
                posts: documents
            });
        });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: 'Post not found.'});
        }
    });
});

router.delete('/:id', (req, res, next) => {
    console.log(req.params.id);
    Post.deleteOne({_id: req.params.id})
        .then(responseData => {
            res.status(200).json({message: responseData});
        })
});

module.exports = router;
