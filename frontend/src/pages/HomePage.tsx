import { Link } from "react-router-dom"

export const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex h-16 w-full items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Boo<span className="text-indigo-600">King</span>
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-56 -right-56 h-[36rem] w-[36rem] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-56 -left-56 h-[36rem] w-[36rem] rounded-full bg-purple-100 opacity-50 blur-3xl" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 py-28 text-center sm:py-36">

          {/* Eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
            Library Management System
          </p>

          {/* Wordmark */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-[4.5rem] font-black leading-none tracking-tight sm:text-[7rem]">
              <span className="text-gray-900">Boo</span><span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">King</span>
            </h1>
            <div className="h-0.5 w-20 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
          </div>

          {/* Tagline */}
          <p className="text-xl font-semibold tracking-wide text-gray-700 sm:text-2xl">
            Your library,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              fully organised
            </span>
          </p>

          {/* Description */}
          <p className="max-w-lg text-base leading-relaxed text-gray-500">
            End-to-end library management for librarians and members alike — catalog search, book issuing, reservations, and fine tracking, all in one place.
          </p>

          {/* CTAs */}
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 sm:w-auto"
            >
              Create an account
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </main>


    </div>
  )
}
