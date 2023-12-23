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

server.post('/create-blog', verifyJWT, (req, res) => {
    const authorId = req.user;

    const {title, des, banner, tags, content, draft} = req.body;

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

        if (!content || content.blocks.length === 0) {
            return res.status(403).json({error: "There must be some blog content to publish it"})
        }


        if (!tags || tags.length === 0 || tags.length > 10) {
            return res.status(403).json({error: "Provide tags in order to publish the blog, Maxium 10"})
        }
    }

    const normalizedTags = tags.map(tag => tag.trim().toLowerCase())
    const blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

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
        return res.status(500).json({ error: err.message })
    })
})

server.get('/latest-blogs', (req, res) => {
    const page =  parseInt(req.query.page);
    const maxLimit = 5;
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"publishedAt": -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            Blog.find({ draft: false }).countDocuments().then(count => {
                return res.status(200).json({
                    totalDocs: count,
                    blogs,
                    page,
                })
            })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.get('/trending-blogs', (req, res) => {
    Blog.find({ draft: false})
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publisedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.get("/search-blogs", (req, res) => {
    const tag = req.query.tag;
    const page = parseInt(req.query.page);
    const query = req.query.query;

    let findQuery;

    if (tag)
        findQuery = { tags: tag, draft: false, };
    else if (query)
        findQuery = { draft: false, title: new RegExp(query, 'i')}
    const maxLimit = 5;

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
            return res.status(500).json({ error: err.message })
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

