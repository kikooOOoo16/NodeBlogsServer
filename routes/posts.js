const express = require('express');
const postController = require('../controllers/posts');

const middleware = require('../middleware/middleware');
const extractFile = require('../middleware/file');

const router = express.Router();


router.post('',
    middleware.checkAuth,
    extractFile,
    postController.createPost
);

router.put('/:id',
    middleware.checkAuth,
    extractFile,
    postController.updatePost
);

router.get('', postController.getPosts)

router.get('/:id', postController.getPost)

router.delete(
    '/:id',
    middleware.checkAuth,
    postController.deletePost
);

module.exports = router;
