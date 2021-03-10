const express = require('express');
const multer = require('multer');
const Post = require('../models/post');
const middleware = require('../middleware/middleware');

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
});

router.post('', middleware.checkAuth, multer({storage: storage}).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host'); // construct url to server
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imageUrl: url + '/images/' + req.file.filename,
        author: req.userData.userId
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

router.put('/:id', middleware.checkAuth, multer({storage: storage}).single('image'),
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
            imageUrl: imageUrl,
            author: req.userData.userId
        });
        Post.updateOne({_id: req.params.id, author: req.userData.userId}, post)
            .then(result => {
                if (result.n > 0) {
                    res.status(200).json({message: 'Update successful.'});
                } else {
                    res.status(401).json({message: 'Unauthorised access.'});
                }
            });
});

router.get('',(req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find(); // executes after we call then
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);
    }
    postQuery.then(documents => {
        fetchedPosts = documents;
        return Post.countDocuments();
    }).then(count => {
        res.status(200).json({
            message: 'Posts fetched successfully.',
            posts: fetchedPosts,
            numOfPosts: count
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

router.delete('/:id', middleware.checkAuth, (req, res, next) => {
    console.log(req.params.id);
    Post.deleteOne({_id: req.params.id, author: req.userData.userId})
        .then(result => {
            if (result.n > 0) {
                res.status(200).json({message: 'Deleted successfully.'});
            } else {
                res.status(401).json({message: 'Unauthorised access.'});
            }
        })
});

module.exports = router;
