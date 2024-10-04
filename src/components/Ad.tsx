import Image from 'next/image'

export default function Ad() {
  return (
    <div className="max-w-sm mx-auto bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
      <p className="text-sm font-semibold text-center text-zinc-300 bg-zinc-700 py-1">Another service you may like:</p>
      <div className="flex items-center p-3">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Scrúdú</h3>
          <p className="text-xs text-zinc-300">• Papers, quizzes, flashcards & more</p>
        </div>
        <Image
          src="/logo.png"
          width={50}
          height={50}
          alt="Scrúdú Logo"
          className="rounded-full ml-3"
        />
      </div>
    </div>
  )
}
