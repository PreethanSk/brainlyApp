require ("dotenv").config();
import express from "express";
const app = express();
import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route"


app.use(express.json());
app.use("/user",userRouter);
app.use("/post",postRouter)

app.listen(3001);