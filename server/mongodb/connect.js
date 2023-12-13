import mongoose from 'mongoose';

const connectDB = (url) => {
    mongoose.connect(url, {
        autoIndex: true, //make this also true
    })
        .then(() => console.log('connected to mongo'))
        .catch((err) => {
            console.error('failed to connect with mongo');
            console.error(err);
        });
};

export default connectDB;
