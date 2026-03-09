import { useEffect, useState } from "react"

type Quote = {
  text: string
  author: string
}

const quotes: Quote[] = [
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "The only thing you absolutely have to know is the location of the library.", author: "Albert Einstein" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
{ text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
{ text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
{ text: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
{ text: "Books are the mirrors of the soul.", author: "Virginia Woolf" },
{ text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },

{ text: "Libraries were full of ideas—perhaps the most dangerous and powerful of all weapons.", author: "Sarah J. Maas" },
{ text: "So many books, so little time.", author: "Frank Zappa" },
{ text: "Books are the quietest and most constant of friends.", author: "Charles W. Eliot" },
{ text: "Reading is essential for those who seek to rise above the ordinary.", author: "Jim Rohn" },
{ text: "The library is the temple of learning.", author: "Swami Vivekananda" },
{ text: "A library is not a luxury but one of the necessities of life.", author: "Henry Ward Beecher" },
{ text: "Books are the training weights of the mind.", author: "Epictetus" },
{ text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
{ text: "A great book should leave you with many experiences.", author: "William Styron" },
{ text: "A reader lives a thousand lives before he dies.", author: "George R. R. Martin" },

{ text: "Books serve to show a man that those original thoughts of his aren’t very new after all.", author: "Abraham Lincoln" },
{ text: "There is more treasure in books than in all the pirate’s loot on Treasure Island.", author: "Walt Disney" },
{ text: "Reading is an exercise in empathy.", author: "Malorie Blackman" },
{ text: "Books are lighthouses erected in the great sea of time.", author: "E. P. Whipple" },
{ text: "The reading of all good books is like conversation with the finest minds.", author: "René Descartes" },
{ text: "Knowledge is power.", author: "Francis Bacon" },
{ text: "A library is infinity under a roof.", author: "Gail Carson Levine" },
{ text: "Books and doors are the same thing. You open them, and you go through into another world.", author: "Jeanette Winterson" },
{ text: "A book is a gift you can open again and again.", author: "Garrison Keillor" },
{ text: "The love of learning, the sequestered nooks, and all the sweet serenity of books.", author: "Henry Wadsworth Longfellow" },

{ text: "Reading is a discount ticket to everywhere.", author: "Mary Schmich" },
{ text: "A library is a hospital for the mind.", author: "Anonymous" },
{ text: "Books are a uniquely portable magic.", author: "Stephen King" },
{ text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
{ text: "Reading is an adventure that never ends.", author: "Unknown" },
{ text: "The man who does not read has no advantage over the man who cannot read.", author: "Mark Twain" },
{ text: "There is no substitute for books in the life of a child.", author: "May Ellen Chase" },
{ text: "Books are the treasured wealth of the world.", author: "Henry David Thoreau" },
{ text: "Libraries store the energy that fuels the imagination.", author: "Sidney Sheldon" },
{ text: "Reading is dreaming with open eyes.", author: "Unknown" },

{ text: "Books are the plane, and the train, and the road.", author: "Anna Quindlen" },
{ text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
{ text: "Reading is a conversation. All books talk.", author: "Ezra Pound" },
{ text: "Books are humanity in print.", author: "Barbara W. Tuchman" },
{ text: "A house without books is poor.", author: "Hermann Hesse" },
{ text: "Reading brings us unknown friends.", author: "Honoré de Balzac" },
{ text: "Libraries are the backbone of knowledge.", author: "Unknown" },
{ text: "Books are the carriers of civilization.", author: "Barbara W. Tuchman" },
{ text: "Reading is the gateway skill that makes all other learning possible.", author: "Barack Obama" },
{ text: "A library outranks any other one thing a community can do to benefit its people.", author: "Andrew Carnegie" }
]

export default function QuoteCard() {
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    const storedQuote = sessionStorage.getItem("dashboardQuote")

    if (storedQuote) {
      setQuote(JSON.parse(storedQuote))
    } else {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      sessionStorage.setItem("dashboardQuote", JSON.stringify(randomQuote))
      setQuote(randomQuote)
    }
  }, [])

  if (!quote) return null

  return (
    <div
      style={{
        margin: "26px 0",
        padding: "28px 32px",
        borderRadius: "16px",
        background: "white",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        position: "relative",
        borderLeft: "6px solid #6B5CFF"
      }}
    >
      <span
        style={{
          fontSize: "54px",
          position: "absolute",
          top: "10px",
          left: "18px",
          color: "#6B5CFF",
          opacity: 0.2
        }}
      >
        “
      </span>

      <p
        style={{
          fontSize: "20px",
          fontStyle: "italic",
          lineHeight: "1.6",
          color: "#333",
          padding: "0 30px"
        }}
      >
        {quote.text}
      </p>

      <span
        style={{
          fontSize: "54px",
          position: "absolute",
          bottom: "10px",
          right: "18px",
          color: "#6B5CFF",
          opacity: 0.2
        }}
      >
        ”
      </span>

      <p
        style={{
          marginTop: "14px",
          textAlign: "right",
          fontWeight: 600,
          color: "#6B5CFF"
        }}
      >
        — {quote.author}
      </p>
    </div>
  )
}