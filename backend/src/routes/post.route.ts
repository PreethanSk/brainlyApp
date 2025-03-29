import express, {Router, Request, Response} from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import { PrismaClient } from "@prisma/client";
import { POST_ZOD } from "../utils/zod";
const client = new PrismaClient ();
const app = express();
const postRouter = Router ();


app.use(express.json());

// postRouter.post("/createPost",userMiddleware, async(req,res) => {
//     try{
//         const {title, content, isPublic, link} = req.body;
//         //@ts-ignore
//         const user_id = req.userId;
//         const userId : any = Object.values(user_id)[0];

//         const zodParse = POST_ZOD.safeParse(req.body);
//         if(!zodParse){
//             res.status(403).json({message:"zod error"});
//             return
//         }

//         const username = await client.user.findUnique({where: {id: userId}, select: {username: true}});
//         if(!username){
//             res.status(403).json({messag:"this user does not exist"});
//             return
//         }
//        const postCount = await client.post.count({where: {userId: userId}});
//        const postId = postCount + 1
//        const postLink = `${username.username}/${postId}`

//         await client.post.create({data: {title, content, isPublic,userId, link}});
//         res.json({link: `localhost:3001/${postLink}`})
//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({message:"server crash in create post endpoint"})
//     }
// })

postRouter.post("/createPost", userMiddleware, async(req, res) => {
    try {
        const {title, content, isPublic, link} = req.body;

        //@ts-ignore
        const userId = req.userId;
        console.log("User ID from middleware:", userId);

        if (!userId) {
            res.status(401).json({message: "User not authenticated"});
            return;
        }

        const zodParse = POST_ZOD.safeParse(req.body);
        if (!zodParse.success) {
            res.status(403).json({message: "zod error"});
            return;
        }

        const username = await client.user.findUnique({
            where: {id: userId},
            select: {username: true}
        });

        if (!username) {
            res.status(403).json({message: "this user does not exist"});
            return;
        }

        const postCount = await client.post.count({where: {userId: userId}});
        const postId = postCount + 1;
        const postLink = `${username.username}/${postId}`;

        await client.post.create({
            data: {
                title,
                content,
                isPublic,
                userId,
                link
            }
        });

        res.json({link: `localhost:3001/${postLink}`});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: "server crash in create post endpoint"});
    }
});

postRouter.put("/editPost", userMiddleware, async(req,res) => {
    try{
        const {title, content, isPublic, link, id} = req.body;
        //@ts-ignore
        const userId = req.userId;
        const postId = parseInt(id)

        if (!userId) {
            res.status(401).json({message: "User not authenticated"});
            return;
        }


        const userCheck = await client.post.findFirst({
            where: {id: postId, userId: userId}
        })
        if(!userCheck){
            res.status(403).json({message:"you dont have access to this content or this content does not exist"});
            return
        }
        await client.post.update({
            where: {id: id},
            data: {title, content, isPublic, link}
        })
        res.json({mesage: "content updated successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"server crash in edit post endpoint"})
    }
})


postRouter.delete("/deletePost",userMiddleware, async(req,res) => {
    try{
        const {id} = req.body;
        //@ts-ignore
        const userId = req.userId;
        const postId = parseInt(id)
        const userCheck = await client.post.findFirst({
            where: {id: postId, userId: userId}
        })
        if(!userCheck){
            res.status(403).json({message:"you dont have access to this content or this content does not exist"});
            return
        }
        await client.post.delete({
            where: {id: id}
        })
        res.json({message:"content deleted successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash in delete post endpoint"})
    }
})

postRouter.get("/getPosts", userMiddleware, async(req,res) => {
    try{
        //@ts-ignore
        const userId = req.userId;
        const content = await client.post.findMany({where: {userId: userId}});
        if(!content){
            res.status(403).json({message:"you dont have any content yet"});
            return
        }
        res.json({content: content})
    }
    catch(error){
        res.status(500).json({message:"server crash in getPost endpoint"})
    }
})

postRouter.get("/getPosts/:username",async(req,res) => {
    try{
        const username = req.params.username;
        const content = await client.user.findUnique({
            where: {username: username},
            include: {post: {where: {isPublic: true}}}
        })
        if(!content || !content.post || content.post.length === 0){
            res.status(403).json({message:"this user does not exist or this user has no posts"});
            return
        }
        res.json({content: content.post})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash at getPosts/username endpoint"})
    }
})


postRouter.get("/getPosts/:username/:postId", async(req,res) => {
    try{
        const username = req.params.username;
        const postId = parseInt(req.params.postId);

        const user = await client.user.findUnique({where: {username: username}});
        if(user){
            const userId = user.id;
            const content = await client.post.findUnique({where: {userId: userId, id: postId}});
            if(content){
                res.json({content: content})
            }
            else{
                res.status(403).json({message:"this post does not exist"})
                return
            }
        }
        else{
            res.status(403).json({message:"this user does not exist"})
            return
        }

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed in getpost postId endpoint"})
    }
})

export default postRouter