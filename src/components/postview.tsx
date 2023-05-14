
import Link from "next/link";
import Image from "next/image";
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from "dayjs";
import LoadingSpinner from "~/components/loading";
import { RouterOutputs, api } from "~/utils/api";

import { toast } from "react-hot-toast";



dayjs.extend(relativeTime)

interface feedProps{
    userId:string
}

type PostWithUser= RouterOutputs["posts"]["getAll"][number]


export const PostView= (props:PostWithUser)=>{
  const {post,author}=props
  const idd=(author?.id)
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


export const ProfileFeed = (props:feedProps)=>{
  const {data, isLoading:postsLoading } = api.posts.getPostByName.useQuery({userId:props.userId})
  if(postsLoading){
    return (< div className="h-full w-full justify-center items-center flex "><LoadingSpinner size={40}></LoadingSpinner></div>)
  }
  if(!data){
    return <div>Something went wrong</div>
  }

  return (
    <div className="flex overflow-y-auto flex-col w-full">
    {data.map((fullPost)=>(
 <PostView {...fullPost} key={fullPost.author?.id}></PostView>

    ))}
  </div>
  )
}
