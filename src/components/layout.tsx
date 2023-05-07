import type { PropsWithChildren } from "react";

const PageLayout = (props:PropsWithChildren) => {
    return (
        <main className="flex justify-center h-screen">
          <div className="border-x w-full flex flex-col md:max-w-2xl  items-center border-blue-50  ">

                {props.children}
                </div></main> );
}

export default PageLayout;