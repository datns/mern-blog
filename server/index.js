import express from 'express';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from "./mongodb/connect.js";
import {validateEmail, validatePassword} from "./utils/index.js";
import User from "./mongodb/models/user.js";
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './firebase-service-account-key.json' assert { type: "json" }

dotenv.config()

const server = express();
const PORT = 8080;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



server.use(express.json())
server.use(cors())

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET_KEY)
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

server.post("/signup", (req, res) => {
    const { fullname, email, password } = req.body;

    if (fullname.length < 3) {
        return res.status(403).json({ error: "Full name must be at least 3 letters long"});
    }

    if (!email.length) {
        return res.status(403).json({ error: "Enter email" })
    }

    if (!validateEmail(email)) {
        return res.status(403).json({ error: "Email is invalid "})
    }

    if (!validatePassword(password)) {
        return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"})
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username },
        })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        }).catch(err => {
            if (err.code === 11000) {
                return res.status(500).json({ error: "Email already exists" })
            }
            return res.status(500).json({ error: err.message })
        })
    })
})

server.post("/signin", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });
            }

            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(403).json({ error: "Error occurred while login please try again" });
                }

                if (!result) {
                    return res.status(403).json({ error: "Incorrect password "})
                } else {
                    return res.status(200).json(formatDatatoSend(user))
                }
            })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
})

server.post("/google-auth", async (req, res) => {
    const { access_token } = req.body

    getAuth().verifyIdToken(access_token)
        .then(async (decodedUser) => {
            try {
                const { email, name } = decodedUser;

                let user = await User.findOne({"personal_info.email": email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")

                if (user) {
                    if (!user.google_auth){
                        return res.status(403).json({
                            "error": "This email was signed up without google. Please log in with password to access the account"
                        })
                    }
                }
                else {
                    const username = await generateUsername(email);

                    user = new User({
                        personal_info: { fullname: name, email, username },
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
            return res.status(500).json({ error: "Failed to authenticate you with google. Try with some other google account"})
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

