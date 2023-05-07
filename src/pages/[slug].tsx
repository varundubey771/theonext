import { SignIn,useUser,SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";

import { api } from "~/utils/api";
const ProfileFeed = (props:{userId:string})=>{
  const {data, isLoading}=api.posts.getPostByName.useQuery({
    userId:props.userId
  })
  console.log("gr8gr8gr8gr8",data)
  if (isLoading) return <LoadingSpinner></LoadingSpinner>
  if(!data||data.length===0) return <div >User has not posted</div>
  return (
    <div className="flex flex-col">
      {data.map((post)=>(
        <div>
        <div>{post.id}</div>
<div>{post.content}</div>
</div>
      ))}
       </div>
  )
}



const ProfilePage: NextPage<{username:string}> = ({username}) => {

const {data,isLoading} =api.profle.getUserByUserName.useQuery({username:username})
if(isLoading){
  console.log("is loadinggggggg")
  return <div></div>
}
if(!data){
  return <div>404</div>
}
  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
<PageLayout>
  <div className=" relative h-48 w-full bg-slate-600">
    <Image className="-mb-[64px] rounded-full absolute bottom-0 left-0 ml-4 border-4 border-black"  src={data.profileImageUrl} width={128} height={128} alt={`${data.username??""}'s profile pic`}></Image>

  </div>
  <div className="h-[64px]"></div>
  <div className="p-4 font-light text-2xl">{data.username}</div>
  <div className="border-b border-slate-400 w-full"></div>
  <ProfileFeed userId={data.id}></ProfileFeed>
       </PageLayout>

    </>
  )
}


import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson"
import { getAuth } from "@clerk/nextjs/server";
import PageLayout from "~/components/layout";
import LoadingSpinner from "~/components/loading";



export const getStaticProps  = async(context: { params: { slug: any; }; })=>{



const user ={id:""}
 const ssg= createServerSideHelpers({
    router: appRouter,
    ctx: {prisma,currentUser:user?.id},
    transformer: superjson, // optional - adds superjson serialization
  });
  const slug = context.params?.slug
  console.log("hahahah")


  if(typeof slug!=="string") throw new Error("no slug")

  const username = slug.replace("@","")


await ssg.profle.getUserByUserName.prefetch({username})

  return {
    props:{
      trpcState: ssg.dehydrate(),
      username
    }
  }


}

export const getStaticPaths =  ()=>{
  return {paths:[], fallback:"blocking"}
}

export default ProfilePage;
