import { SignIn,useUser,SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from "dayjs";
import LoadingSpinner from "~/components/loading";
import { RouterOutputs, api } from "~/utils/api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import PageLayout from "~/components/layout";


dayjs.extend(relativeTime)

const CreatePostWizard = ()=>{
  const [input, setInput]=useState('')
  const {user} = useUser()

  const ctx=api.useContext()

  if(!user) return null
  const {mutate,isLoading:isPosting} = api.posts.create.useMutation({
    onSuccess:()=>{
      setInput("")
      void ctx.posts.getAll.invalidate()
    },
    onError:(e)=>{
      const errorMessage= e.data?.zodError?.fieldErrors.content
      if (errorMessage && errorMessage[0]){
toast.error(errorMessage[0])

      }
      else{toast.error("failed to post data")}

    }
  })


  return (
<div className="flex flex-row  gap-2 w-full">
      <Image className="m-2 rounded-full" width={40} height={40} alt="profilepic" src={user.profileImageUrl} ></Image>
      <input onKeyDown={(e)=>{
        if(e.key=="Enter"){
          e.preventDefault()
          mutate({content:input
          })


        }
      }} disabled={isPosting} value={input} onChange={(e)=>{setInput(e.target.value)}} className="bg-transparent w-full m-2 grow outline-none" placeholder="Type something"></input>
      {!isPosting&&<button disabled={isPosting} onClick={()=>mutate({content:input})}>Post</button>}
      {isPosting&&<div className="flex items-center justify-center"><LoadingSpinner/></div>}
      </div>
  )
}

type PostWithUser= RouterOutputs["posts"]["getAll"][number]


const PostView= (props:PostWithUser)=>{
  const {post,author}=props
  const idd=String(author?.id)
  let imgSrc=""

  if(!author ||!author?.username){
    toast.error("something went wrong with auth")
    return <div></div>
  }
  if(author)
  {imgSrc= author?.profileImageUrl}
  else{
   imgSrc= "profilepic"
  }


  return (
    <div className="p-8  border-b w-full flex flex-row items-center gap-4 border-slate-400" key={post.id}>
    <Image src={imgSrc} width={40} height={40} alt="profile_pic">
      </Image ><div className="flex flex-col">
        <div className="flex gap-3 font-semibold">
          <Link href={`/@${author.username}`}> <label>{`@${author?.username}`}</label></Link>
          <Link href={`/@${author.username}`}>
        <label>{`${dayjs(post?.createdAt).fromNow()}`}</label>
        </Link></div>
        <div>{post.content}</div></div></div>
  )

}


const Feed = ()=>{
  const {data, isLoading:postsLoading } = api.posts.getAll.useQuery()
  if(postsLoading){
    return (< div className="h-full w-full justify-center items-center flex "><LoadingSpinner size={40}></LoadingSpinner></div>)
  }
  if(!data){
    return <div>Something went wrong</div>
  }

  return (
    <div className="flex overflow-y-auto flex-col w-full">
    {data.map((fullPost)=>(
 <PostView {...fullPost} key={fullPost.post.id}></PostView>

    ))}
  </div>
  )
}

const Home: NextPage = () => {
  const {user,isLoaded:userLoaded,isSignedIn} = useUser()
//75 caches the data as soon as it is called
// and then when the same function is called again in feed it can use the cache
  api.posts.getAll.useQuery()


  if(!userLoaded) return <div></div>




  return (
    <>
<PageLayout>
          <div className="flex w-full justify-between">


          <div className={`p-4  w-full flex searchDiv ${isSignedIn?("justify-between"):("justify-center")}`}>
          {!isSignedIn&&<div className=""><SignIn></SignIn></div>}
          {isSignedIn&&( <div><CreatePostWizard></CreatePostWizard> </div>)}

 {!!isSignedIn&&<SignOutButton></SignOutButton>}
 </div>


          </div>

 <hr className="p-2 w-full"></hr>

<Feed></Feed>

</PageLayout>

    </>
  )
}

export default Home;
