import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(79,70,229,0.05) 40%, transparent 70%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        <h1 className="text-[8rem] sm:text-[12rem] font-bold leading-none bg-gradient-to-b from-[#E2E8F0] to-[#4F46E5] bg-clip-text text-transparent">
          404
        </h1>

        <p className="text-lg sm:text-xl tracking-widest text-slate-400 mb-4">
          Signal Not Found
        </p>

        <p className="text-sm text-slate-400 max-w-md mx-auto mb-10">
          The frequency you're looking for doesn't exist in this spectrum.
        </p>

        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(226,232,240,0.15)' }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-3 bg-[#E2E8F0] text-[#020617] font-semibold text-xs tracking-widest rounded-none border-2 border-transparent hover:border-[#E2E8F0] transition-all duration-300"
        >
          RETURN TO BASE
        </motion.button>
      </motion.div>
    </div>
  )
}
