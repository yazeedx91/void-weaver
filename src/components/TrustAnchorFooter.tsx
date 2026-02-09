import { useNavigate } from 'react-router-dom'

export default function TrustAnchorFooter() {
  const navigate = useNavigate()

  return (
    <div className="w-full flex justify-center py-6 sm:py-8">
      <button
        onClick={() => navigate('/science')}
        aria-label="View our scientific methodology"
        className="group flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-lg text-slate-500 hover:text-indigo-300 transition-all duration-500 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] touch-manipulation"
      >
        <svg
          className="w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-indigo-300 transition-colors duration-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span className="text-[11px] sm:text-xs tracking-wider font-medium">
          Verified Science
        </span>
      </button>
    </div>
  )
}
