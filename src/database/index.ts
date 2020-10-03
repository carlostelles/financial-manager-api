import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

mongoose.connect(
    `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }
);
mongoose.Promise = global.Promise;

export default mongoose;
