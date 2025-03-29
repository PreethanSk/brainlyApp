import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import {z} from "zod";
import express, {Router} from "express";
import cors from "cors";
import { JWT_KEY} from "../utils/config";
import { USER_ZOD } from "../utils/zod";
import { USER_SIGNIN_ZOD } from "../utils/zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { userMiddleware } from "../middlewares/user.middleware";
const client = new PrismaClient();
const app = express();
const JWT_SECRET = JWT_KEY || "JWT_SECRET";
const userRouter = Router();

app.use(express.json());


userRouter.post('/signup',async(req,res) => {
    try{
        const {username, password,email} = req.body;

        const zodParse = USER_ZOD.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"})
            return
        }


        const userCheck = await client.user.findUnique({
            where: {username: username}
        })
        if(userCheck){
            res.status(403).json({message:"user already exists"});
            return
        }

        const passwordHash = await bcrypt.hash(password,5);


        await client.user.create({
            data: {username, password: passwordHash, email}
        })
        res.json({message: `your brain share link: localhost:3001/${username}`})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash in user sign up"})
    }
})

userRouter.post("/signin", async(req,res) => {
    try{
        const {username, password} = req.body;

        const zodParse = USER_SIGNIN_ZOD.safeParse(req.body);
        if(!zodParse){
            res.status(403).json({message:"zod error"});
            return
        }

        const userCheck = await client.user.findUnique({
            where: {username: username},
        })
        if(!userCheck){
            res.json({message:"user does not exist"});
            return
        }

        const passwordDecrypt = await bcrypt.compare(password, userCheck.password)
        if(!passwordDecrypt){
            res.status(403).json({message:"your password is incorrect"})
            return
        }

        const token = jwt.sign({userId: userCheck.id}, JWT_SECRET);
        res.json({token: token})

    }
    catch(error){
        console.log(error)
        res.status(403).json({message:"server crash in user signin"})
    }
})

userRouter.delete("/deleteUser", userMiddleware,async(req,res) => {
    try{
        //@ts-ignore
        const userId = req.userId

        await client.user.delete({
            where: {id: userId}
        })
        res.json({message:"user deleted successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash in user delete endpoint"})
    }
})


export default userRouter