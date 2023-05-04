import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { use } from "react";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User)=>{
  return {id:user,
  username:user.username,profileImageUrl:user.profileImageUrl}
}

export const postsRouter = createTRPCRouter({

  getAll: publicProcedure.query(async({ ctx }) => {

    const posts= await ctx.prisma.post.findMany({
      take:100,
      orderBy:[{createdAt:"desc"}]
    });
    //get users corresponding to all posts
    const users= (await clerkClient.users.getUserList({
      userId:  posts.map((post)=>post.authorId),
      limit:100
    })).map(filterUserForClient)

    console.log(users[0])
    console.log(posts)

    return posts.map((post)=>
      {
        const author= users.find((user)=>String(user.id.id)===post.authorId)
        if(!author) throw new TRPCError({
          code:"INTERNAL_SERVER_ERROR",
          message:"author for post not found"
        })

        return {
        post,
        author:(users.find((user)=>String(user.id.id)===post.authorId))
      }
    }
    )
  }),

  create:privateProcedure.input(z.object({
    content:z.string().min(1).max(280)
  })).mutation(async ({ctx,input})=>{
    let authorId = ctx.currentUser.userId
    if(!authorId){
      authorId='-'
    }
    const post = await ctx.prisma.post.create({
      data:{
        authorId:authorId,
        content:input.content
      }
    })
    return post
  })
});