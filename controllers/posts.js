const Post = require('../models/post');

exports.createPost = (req, res, next) => {
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
    }).catch(error => {
        res.status(500).json({
            message: 'Post creation failed!'
        });
    });
}

exports.updatePost = (req, res, next) => {
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
                res.status(401).json({message: 'Unauthorised action!'});
            }
        }).catch(error => {
        res.status(500).json({
            message: 'Post update failed!'
        })
    });
}

exports.getPosts = (req, res, next) => {
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
    }).catch(error => {
        res.status(500).json({
            message: 'Couldn\'t fetch posts!'
        });
    });
}

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: 'Post not found.'});
        }
    }).catch(error => {
        res.status(500).json({
            message: 'Couldn\'t fetch post!'
        });
    });
}

exports.deletePost = (req, res, next) => {
    Post.deleteOne({_id: req.params.id, author: req.userData.userId})
        .then(result => {
            if (result.n > 0) {
                res.status(200).json({message: 'Deleted successfully.'});
            } else {
                res.status(401).json({message: 'Unauthorised access!'});
            }
        }).catch(error => {
        res.status(500).json({
            message: 'Couldn\'t delete post!'
        });
    });
}
