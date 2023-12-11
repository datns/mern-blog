import express from 'express';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from "./mongodb/connect.js";
import {validateEmail, validatePassword} from "./utils/index.js";
import User from "./mongodb/models/user.js";
import { nanoid } from 'nanoid'

dotenv.config()

const server = express();
const PORT = 3000;

server.use(express.json())

const formatDatatoSend = (user) => {
    return {
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

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);
        server.listen(PORT, () => console.log('listening on port -> ' + PORT))
    } catch (e) {
        console.log(e);
    }
}

startServer();

