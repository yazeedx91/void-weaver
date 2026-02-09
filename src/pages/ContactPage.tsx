import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', company: '', inquiryType: 'business' as string, message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        toast.success('Inquiry submitted successfully')
      } else {
        toast.error(data.error || 'Failed to submit')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/[0.06] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-sm tracking-[0.2em] text-[#E2E8F0] hover:text-white transition-colors min-h-[48px] touch-manipulation">FLUX</button>
            <span className="text-slate-600">/</span>
            <span className="text-xs tracking-wider text-slate-400">CONTACT</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {sent ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-light text-[#E2E8F0] mb-3">Inquiry Received</h2>
              <p className="text-sm text-slate-400 mb-8">We'll be in touch within 24 hours.</p>
              <button onClick={() => navigate('/')} className="px-8 py-3 min-h-[48px] bg-white/[0.06] border border-white/[0.08] text-sm text-[#E2E8F0] tracking-wider hover:bg-white/[0.1] transition-all touch-manipulation">
                RETURN HOME
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-light text-[#E2E8F0] mb-3">Business & Partnerships</h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Interested in enterprise deployment, team licensing, research partnerships, or data intelligence services? Let's talk.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {[
                  { title: 'Enterprise', desc: 'Custom deployment & SSO' },
                  { title: 'Research', desc: 'Academic partnerships' },
                  { title: 'Data Intelligence', desc: 'Anonymized workforce insights' },
                ].map(item => (
                  <div key={item.title} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
                    <p className="text-sm text-[#E2E8F0] font-medium">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-wider text-slate-400 block mb-2">NAME</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      minLength={2}
                      className="w-full h-12 px-4 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-slate-400 block mb-2">EMAIL</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      className="w-full h-12 px-4 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-wider text-slate-400 block mb-2">COMPANY (OPTIONAL)</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full h-12 px-4 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-slate-400 block mb-2">INQUIRY TYPE</label>
                    <select
                      value={form.inquiryType}
                      onChange={(e) => setForm(f => ({ ...f, inquiryType: e.target.value }))}
                      className="w-full h-12 px-4 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all appearance-none"
                    >
                      <option value="business">Business Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="enterprise">Enterprise Deployment</option>
                      <option value="research">Research Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs tracking-wider text-slate-400 block mb-2">MESSAGE</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5]/50 rounded-none transition-all resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full h-14 bg-white text-[#020617] font-semibold text-xs tracking-wider disabled:opacity-40 transition-all"
                >
                  {sending ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}
                </motion.button>

                <p className="text-[10px] text-center text-slate-500 tracking-wider">
                  RESPONSE WITHIN 24 HOURS / ALL INQUIRIES CONFIDENTIAL
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
