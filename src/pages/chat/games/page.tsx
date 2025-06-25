import Image from "@/components/image";
import { games } from "./_data";

export default function GamesPage() {
  return (
    <div className="m-auto space-y-10">
      <h2 className="text-center">So, you want to joust with me? Let me see what best you can do!</h2>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
        {games.map((item, idx) => (
          <span
            key={idx}
            className="w-full flex flex-col items-center justify-center p-4 rounded-xl hover:bg-brown-100/10 transition-all ease-in-out duration-150"
            
          >
            <Image src={item.image} alt={item?.title} width={200} height={200} className="w-full h-full object-contain" />
            <div className="text-center">
              <h3>{item?.title}</h3>
              <p className="font-im opacity-70">{item?.desc}</p>
            </div>
          </span>
        ))}
      </section>
    </div>
  )
}
