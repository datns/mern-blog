import express from 'express';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from "./mongodb/connect.js";
import {validateEmail, validatePassword} from "./utils/index.js";
import User from "./mongodb/models/user.js";
import {nanoid} from 'nanoid'
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import {getAuth} from 'firebase-admin/auth';
import serviceAccount
    from './firebase-service-account-key.json' assert {type: 'json'}
import {v2 as cloudinary} from 'cloudinary';
import Multer from 'multer';
import Blog from "./mongodb/models/blog.js";
import Notification from "./mongodb/models/notification.js";
import Comment from "./mongodb/models/comment.js";
import comment from "./mongodb/models/comment.js";

dotenv.config()

const server = express();
const PORT = 8000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


server.use(express.json())
server.use(cors())

const storage = new Multer.memoryStorage();
const upload = Multer({storage});

const handleUpload = async (file) => {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "image",
    });
    return res;
}

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({id: user._id}, process.env.ACCESS_TOKEN_SECRET_KEY)
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    const isUsernameNotUnique = await User.exists({"personal_info.username": username}).then(result => result);

    isUsernameNotUnique ? username += nanoid().substring(0, 5) : "";

    return username;
}

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    console.log('authHeader', token);

    if (token === null) {
        return res.status(401).json({error: "No access token"})
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        console.log('verify', user);
        if (err) {
            return res.status(403).json({error: "Access token is invalid"})
        }

        req.user = user.id;
        next();
    })

}

server.post("/signup", (req, res) => {
    const {fullname, email, password} = req.body;

    if (fullname.length < 3) {
        return res.status(403).json({error: "Full name must be at least 3 letters long"});
    }

    if (!email.length) {
        return res.status(403).json({error: "Enter email"})
    }

    if (!validateEmail(email)) {
        return res.status(403).json({error: "Email is invalid "})
    }

    if (!validatePassword(password)) {
        return res.status(403).json({error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"})
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            },
        })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        }).catch(err => {
            if (err.code === 11000) {
                return res.status(500).json({error: "Email already exists"})
            }
            return res.status(500).json({error: err.message})
        })
    })
})

server.post("/signin", (req, res) => {
    const {email, password} = req.body;

    User.findOne({"personal_info.email": email})
        .then((user) => {
            if (!user) {
                return res.status(403).json({"error": "Email not found"});
            }

            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(403).json({error: "Error occurred while login please try again"});
                }

                if (!result) {
                    return res.status(403).json({error: "Incorrect password "})
                } else {
                    return res.status(200).json(formatDatatoSend(user))
                }
            })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({error: err.message})
        })
})

server.post("/google-auth", async (req, res) => {
    const {access_token} = req.body

    getAuth().verifyIdToken(access_token)
        .then(async (decodedUser) => {
            try {
                const {email, name} = decodedUser;

                let user = await User.findOne({"personal_info.email": email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")

                if (user) {
                    if (!user.google_auth) {
                        return res.status(403).json({
                            "error": "This email was signed up without google. Please log in with password to access the account"
                        })
                    }
                } else {
                    const username = await generateUsername(email);

                    user = new User({
                        personal_info: {fullname: name, email, username},
                        google_auth: true
                    })

                    user = await user.save()
                }

                return res.status(200).json(formatDatatoSend(user))
            } catch (err) {
                return res.status(500).json({"error": err.message})
            }
        })
        .catch(err => {
            return res.status(500).json({error: "Failed to authenticate you with google. Try with some other google account"})
        })
})

server.post('/change-password', verifyJWT, (req, res) => {
    const {currentPassword, newPassword} = req.body;

    if (!validatePassword(currentPassword) || !validatePassword(newPassword)) {
        return res.status(403).json({ error:"Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"})
    }

    User.findOne({ _id: req.user })
        .then(user => {
            if (user.google_auth) {
                return res.status(403).json({ error: "You can't change account's password because you logged in through google" })
            }

            bcrypt.compare(currentPassword, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Some error occured while changing the password, please try again later" })
                }

                if(!result) {
                    return res.status(403).json({ error: "Incorrect current password"})
                }

                bcrypt.hash(newPassword, 10, (err, hashed_password) => {
                    User.findOneAndUpdate({ _id: req.user }, { "personal_info.password": hashed_password })
                        .then((u) => {
                            return res.status(200).json({ status: 'password changed' })
                        })
                        .catch(err => {
                            return res.status(500).json({ error: "Some error occured while changing the password, please try again later" })
                        })
                })
            })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'User not found' })
        })
})

server.post('/upload-image', upload.single("my_file"), async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        console.log("req.file", req.file);
        let dataUri = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataUri);
        return res.status(200).json({url: cldRes.url});
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
})

server.get("/search-users", (req, res) => {
    const query = req.query.query;

    User.find({"personal_info.username": new RegExp(query, 'i')})
        .limit(50)
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json({users})
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.get("/get-profile", (req, res) => {
    const username = req.query.username;

    User.findOne({"personal_info.username": username})
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            return res.status(200).json(user)
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({error: err.message})
        })
})

server.post('/update-profile-img', verifyJWT, (req, res) => {
    const { url } = req.body;

    User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url})
        .then(() => {
            return res.status(200).json({ profile_img: url })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.post('/update-profile', verifyJWT, (req, res) => {
    const { username, bio, social_links } = req.body;

    if (username.length < 3) {
        return res.status(403).json({ error: "Username should be at least 3 letters long"})
    }

    if (bio.length > 150) {
        return res.status(403).json({ error : 'Bio should not be more than 150 characters '});
    }

    const socialLinksArr = Object.keys(social_links);

    try {
        for(let i = 0; i < socialLinksArr.length; i++) {
            if (social_links[socialLinksArr[i]].length) {
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if (!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] !== 'website') {
                    return res.status(403).json({ error: `${socialLinksArr[i]} link is invalid. You must enter a full link`})
                }
            }
        }
    } catch (err) {
        return res.status(500).json({ error: "You must provice full social links with http(s) included" });
    }

    const updatedObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({ _id: req.user }, updatedObj, {
        runValidators: true
    })
        .then(() => {
            return res.status(200).json({ username })
        })
        .catch(err => {
            if(err.code === 11000) {
                return res.status(409).json({ error: 'username is already taken'})
            }
            return res.status(500).json({ error: err.message })
        })
})

server.post('/create-blog', verifyJWT, (req, res) => {
    const authorId = req.user;

    const {title, des, banner, tags, content, draft, id} = req.body;

    if (!title || title.length === 0) {
        return res.status(403).json({error: "You must provide a title"});
    }

    if (!draft) {
        if (!des || des.length === 0 || des.length > 200) {
            return res.status(403).json({error: "You must provide description under 200 characters"});
        }

        if (!banner || banner.length === 0) {
            return res.status(403).json({error: "You must provide blog banner to publish it"});
        }

        if (!content || content.length === 0) {
            return res.status(403).json({error: "There must be some blog content to publish it"})
        }


        if (!tags || tags.length === 0 || tags.length > 10) {
            return res.status(403).json({error: "Provide tags in order to publish the blog, Maxium 10"})
        }
    }

    const normalizedTags = tags.map(tag => tag.trim().toLowerCase())
    const blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if (id) {
        Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: !!draft || false})
            .then(() => {
                return res.status(200).json({ id: blog_id})
            })
            .catch(err => {
                return res.status(500).json({ error: err.message })
            })
    } else {
        const blog = new Blog({
            title,
            des,
            banner,
            content,
            tags: normalizedTags,
            author: authorId,
            blog_id,
            draft: Boolean(draft),
        })

        blog.save().then(result => {
            let incrementVal = draft ? 0 : 1;

            User.findOneAndUpdate({_id: authorId}, {
                $inc: {"account_info.total_posts": incrementVal},
                $push: {"blogs": result._id}
            }).then(user => {
                return res.status(200).json({id: result.blog_id})
            }).catch(err => {
                return res.status(500).json({error: "Fail to update total posts number"})
            })
        }).catch(err => {
            return res.status(500).json({error: err.message})
        })
    }

})

server.get('/latest-blogs', (req, res) => {
    const page = parseInt(req.query.page);
    const maxLimit = 5;
    Blog.find({draft: false})
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"publishedAt": -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            Blog.find({draft: false}).countDocuments().then(count => {
                return res.status(200).json({
                    totalDocs: count,
                    blogs,
                    page,
                })
            })
        })
        .catch(err => {
            return res.status(500).json({error: err.message})
        })
})

server.get('/trending-blogs', (req, res) => {
    Blog.find({draft: false})
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({
            "activity.total_reads": -1,
            "activity.total_likes": -1,
            "publisedAt": -1
        })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({blogs})
        })
        .catch(err => {
            return res.status(500).json({error: err.message})
        })
})

server.get("/search-blogs", (req, res) => {
    const tag = req.query.tag;
    const page = parseInt(req.query.page);
    const query = req.query.query;
    const author = req.query.author;
    const limit = req.query.limit;
    const eliminate_blog = req.query.eliminate_blog;

    let findQuery;

    if (tag)
        findQuery = {tags: tag, draft: false, blog_id: { $ne: eliminate_blog }};
    else if (query)
        findQuery = {draft: false, title: new RegExp(query, 'i')}
    else if (author)
        findQuery = {draft: false, author}
    const maxLimit = limit || 5;

    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"publishedAt": -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            Blog.find(findQuery).countDocuments().then(count => {
                return res.status(200).json({
                    totalDocs: count,
                    blogs,
                    page,
                })
            })
        })
        .catch(err => {
            return res.status(500).json({error: err.message})
        })
})

server.get("/get-blog", (req, res) => {
    const blog_id = req.query.blog_id;
    const draft = req.query.draft;
    const mode = req.query.mode;

    console.log('blog_id', blog_id)

    const incrementVal = mode !== 'edit' ? 1 : 0;

    Blog.findOneAndUpdate({blog_id}, {$inc: {"activity.total_reads": incrementVal}})
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title des content banner activity publishedAt blog_id tags")
        .then(blog => {
            User.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username}, {
                $inc: {"account_info.total_reads": incrementVal}
            })
                .catch(err => {
                    return res.status(500).json({error: err.message})
                })

            if (blog.draft && !draft) {
                return res.status(500).json({ error: 'You can not access draft blogs'})
            }

            return res.status(200).json({blog})
        })
        .catch(err => {
            return res.status(500).json({error: err.message})
        })
})

server.post('/like-blog', verifyJWT, (req, res) => {
    const user_id = req.user;

    const { _id, liked } = req.body;

    const incrementVal = !liked ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal }})
        .then(blog => {
            if (!liked) {
                const like = new Notification({
                    type: 'like',
                    blog: _id,
                    notification_for: blog.author,
                    user: user_id
                })

                like.save().then(notification => {
                    return res.status(200).json({ liked_by_user: true })
                })
            } else {
                Notification.findOneAndDelete({ user: user_id, blog: _id, type: 'like' })
                    .then(data => {
                        return res.status(200).json({ liked_by_user: false})
                    })
                    .catch(err => {
                        return res.status(500).json({ error: err.message })
                    })
            }
        })
})

server.get('/isliked-by-user', verifyJWT, (req, res) => {
    const user_id = req.user;
    const _id = req.query._id;

    Notification.exists({ user: user_id, type: 'like', blog: _id })
        .then(result => {
            return res.status(200).json({ result })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
    })
})

server.post('/add-comment', verifyJWT, (req, res) => {
    const user_id = req.user;
    const { _id, comment, replying_to, blog_author } =  req.body;

    if (!comment.length) {
        return res.status(403).json({ error: "Write something to leave a comment "})
    }

    const commentObj =
        {
            blog_id: _id,
            blog_author,
            comment,
            commented_by: user_id,
            isReply: false,
        }

    if (replying_to) {
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    new Comment(commentObj).save().then(async commentFile => {
        const { comment, commentedAt, children } = commentFile;

        Blog.findOneAndUpdate({_id}, { $push: { "comments": commentFile._id }, $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 }})
            .then(blog => {
                console.log("Commented")
            });

        const notificationObj = {
            type: "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        }

        if (replying_to) {
            notificationObj.type = "reply";
            notificationObj.replied_on_comment = replying_to

            await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id }})
                .then(replyingToCommentDoc => { notificationObj.notification_for = replyingToCommentDoc.commented_by})
        }

        new Notification(notificationObj).save().then(notification => console.log('Added new notificaiton'))

        return res.status(200).json({
            comment, commentedAt, _id: commentFile._id, user_id, children
        })

    })
})

server.get('/get-blog-comments', (req, res) => {
    const { blog_id, skip } = req.query;

    const maxLimit = 5;

    Comment.find({ blog_id, isReply: false })
        .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
        .skip(skip)
        .limit(maxLimit)
        .sort({
            "commentedAt": -1
        })
        .then(comment => {
            console.log({ comment, blog_id, skip })
            return res.status(200).json(comment);
        })
        .catch(err => {
           console.log(err.message)
            return res.status(500).json({ error: err.message })
        })
})

server.get("/get-replies", (req, res) => {
    const { _id, skip } = req.query;

    const maxLimit = 5;

    Comment.findOne({ _id })
        .populate({
            path: "children",
            options: {
                skip: parseInt(skip),
                limit: maxLimit,
                sort: { 'commentedAt': -1}
            },
            populate: {
                path: 'commented_by',
                select: "personal_info.profile_img personal_info.fullname personal_info.username"
            },
            select: "-blog_id -updatedAt"
        })
        .select("children")
        .then(doc => {
            return res.status(200).json({ replies: doc.children })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

const deleteComments = (_id) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id }})
                    .then(data => console.log('comment delete from parent'))
                    .catch(err => console.log(err))
            }

            Notification.findOneAndDelete({ comment: _id }).then(notification => console.log('comment notification deleted'))

            Notification.findOneAndDelete({ reply: _id }).then(notification => console.log('reply notification deleted'))


            Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { "activity.total_comments": -1}, "activity.total_parent_comments": comment.parent ? 0 : 1})
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComments(replies._id);
                        })
                    }
                })
        })
        .catch(err => {
            console.log(err.message);
        })
}

server.post('/delete-comment', verifyJWT, (req, res) => {
        const user_id = req.user;
        const { _id } = req.body;

        Comment.findOne({ _id })
            .then(comment => {
                if (user_id === comment.commented_by || user_id === comment.blog_author) {
                    deleteComments(_id);

                    return res.status(200).json({ status: "done" })
                } else {
                    return res.status(403).json({ error: "You can not delete this comment "})
                }
            })
})

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);
        server.listen(PORT, () => console.log('listening on port -> ' + PORT))
    } catch (e) {
        console.log(e);
    }
}

startServer();

