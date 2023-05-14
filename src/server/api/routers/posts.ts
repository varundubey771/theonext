import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { use } from "react";
import { z } from "zod";
import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import type { Post } from "@prisma/client";


const addUserDataToPost = async (posts:Post[])=>{
  const users= (await clerkClient.users.getUserList({
    userId:  posts.map((post)=>post.authorId),
    limit:100
  })).map(filterUserForClient)

  console.log(users[0])
  console.log(posts)

  return posts.map((post)=>
    {
      const author= users.find((user)=>String(user.id)===post.authorId)
      if(!author) throw new TRPCError({
        code:"INTERNAL_SERVER_ERROR",
        message:"author for post not found"
      })

      return {
      post,
      author:(users.find((user)=>String(user.id)===post.authorId))
    }
  }
  )

}

const redis = new Redis({
  url: 'UPSTASH_REDIS_REST_URL',
  token: 'UPSTASH_REDIS_REST_TOKEN',
})

// Create a new ratelimiter, that allows 5 requests per 5 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(3, "1 m"),
});

export const postsRouter = createTRPCRouter({


  getById: publicProcedure.input(z.object({postId:z.string()})).query(async({ctx,input})=>{
    const post = await ctx.prisma.post.findUnique({where:{id:input.postId}})
    if(!post) throw new TRPCError({code:"NOT_FOUND"})
    return (await addUserDataToPost([post]))[0]
  }

  ),

  getAll: publicProcedure.query(async({ ctx }) => {

    const posts= await ctx.prisma.post.findMany({
      take:100,
      orderBy:[{createdAt:"desc"}]
    });
    //get users corresponding to all posts
const finalResp=addUserDataToPost(posts)
return finalResp
  }),



  create:privateProcedure.input(z.object({
    content:z.string().min(4).max(280)
  })).mutation(async ({ctx,input})=>{
    let authorId = ctx.currentUser



    if(!authorId){
      authorId='-'
    }
    const {success}= await ratelimit.limit(authorId)
    if(!success){
      return new TRPCError({code:"TOO_MANY_REQUESTS"})
    }
    const post = await ctx.prisma.post.create({
      data:{
        authorId:authorId,
        content:input.content
      }
    })
    return post
  }),


  getPostByName:publicProcedure.input(z.object({userId:z.string()})).query(async({ctx,input})=>{
    console.log(input.userId)
    const posts= await ctx.prisma.post.findMany({
       where:{
        authorId:input.userId
       },
       take:100,
       orderBy:[{createdAt:"desc"}]
    })
    return addUserDataToPost(posts)
})
});