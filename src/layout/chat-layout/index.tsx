import type { ReactNode } from "react";
import Topnav from "./topnav";
import Sidebar from "./sidebar";

export default function ChatLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="w-full h-screen flex overflow-hidden bg-brown-800">
      <Sidebar />
      <main className="w-full flex flex-col gap-1 text-brown-100">
        <Topnav />
        <section
          role="presentation"
          className="w-full max-w-2xl h-full overflow-x-hidden mx-auto"
        >
          {children}
        </section>
      </main>
    </div>
  )
}
