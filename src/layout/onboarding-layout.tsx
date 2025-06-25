import type { ReactNode } from "react";


export default function OnboardingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="w-full max-w-[120em] h-screen overflow-hidden flex bg-brown-800">
      <main
        role="presentation"
        className="w-full h-full max-w-3xl mx-auto mb-auto py-10 px-6 lg:px-0 text-white overflow-auto md:overflow-hidden"
      >
        {children}
      </main>
    </div>
  )
}
