import express, {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../utils/config";
const JWT_SECRET = JWT_KEY || "defaultKey"

export  async function userMiddleware(req: Request, res: Response, next: NextFunction){
    const token = req.headers["authorization"];
    try{
        if(!token){
            res.status(403).json({message:"please enter your jwt"});
            return
        }
        const verify = jwt.verify(token,JWT_SECRET);
        if(!verify){
            res.status(403).json({message:"your jwt is incorrect"});
            return
        }

        //@ts-ignore
        req.userId = verify.userId;
        next()

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash in user middlewares"})
    }
}