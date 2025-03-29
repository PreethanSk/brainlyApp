import {z} from "zod";

export const USER_ZOD = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string()
});

export const USER_SIGNIN_ZOD = z.object({
    username: z.string(),
    password: z.string()
})

export const POST_ZOD = z.object({
    title: z.string(),
    content: z.string(),
    isPublic: z.boolean(),
    link: z.string()
})