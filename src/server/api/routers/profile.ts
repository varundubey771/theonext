import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { use } from "react";
import { z } from "zod";
import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({

    getUserByUserName:publicProcedure.input(z.object({username:z.string()})).query(async({ctx, input})=>{
        console.log(input.username)
        const [user] = await clerkClient.users.getUserList({
            username:[input.username]
        })
        console.log(user)
        console.log("whathehell")
        if(!user){
            throw new TRPCError({message:"user not found",code:"INTERNAL_SERVER_ERROR"})
        }
        const filteredUser=filterUserForClient(user)
        console.log("jsnkibwduycbwudybc")
        console.log(filteredUser)
        return filteredUser
    })





});