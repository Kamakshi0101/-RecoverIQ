import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  HeartPulse,
  Layers,
  LineChart,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react';
import animatedHero from '../assets/animatedhs.svg';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const floatSlow = { duration: 10, repeat: Infinity, ease: 'easeInOut' };

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F7F5F1] text-[#233127] overflow-hidden">
      {/* Floating Navbar */}
      <motion.nav
        className="fixed top-6 left-6 right-6 z-50 lg:top-8 lg:left-12 lg:right-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="backdrop-blur-md bg-white/80 rounded-full border border-[#E7D9C9]/40 px-6 py-4 flex items-center justify-between shadow-lg shadow-black/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1F4D3A] text-white font-serif font-bold text-lg">
              R
            </div>
            <span className="hidden sm:inline text-xl font-serif font-semibold tracking-wide">RecoverIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-[#5F6B63] hover:text-[#2D6A4F] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Start Your Journey
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Cinematic Hero */}
      <motion.section
        className="relative pt-40 pb-28 lg:pt-52 lg:pb-40 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(247,245,241,0.9)_40%,_rgba(220,230,216,0.7)_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(120deg,rgba(31,77,58,0.08)_0,rgba(31,77,58,0.08)_1px,transparent_1px,transparent_10px)]" />
        <motion.div
          className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[#D8D1F0]/50 blur-3xl"
          animate={{ y: [0, 16, 0], x: [0, 10, 0] }}
          transition={floatSlow}
        />
        <motion.div
          className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#E7D9C9]/70 blur-3xl"
          animate={{ y: [0, -14, 0], x: [0, -8, 0] }}
          transition={{ ...floatSlow, duration: 12 }}
        />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <motion.div variants={itemVariants} className="relative z-10">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DCE6D8]/60 text-xs uppercase tracking-[0.3em] font-semibold text-[#5F6B63]">
              Premium Rehabilitation Platform
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="mt-8 text-6xl lg:text-7xl font-serif font-semibold leading-[1.02]"
            >
              Recovery,
              <span className="block text-[#1F4D3A]">curated like care.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-[#5F6B63] max-w-xl leading-relaxed">
              A calm, intelligent platform that guides patients and clinicians through every milestone with clarity, empathy, and precision.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base flex items-center justify-center gap-2">
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base">
                Sign In
              </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 text-sm text-[#5F6B63]">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#2D6A4F]" />
                92% adherence uplift
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#2D6A4F]" />
                4.9 patient satisfaction
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative h-[520px]">
            <motion.img
              src={animatedHero}
              alt="Recovery illustration"
              className="absolute right-0 top-6 w-[95%] max-w-[520px] opacity-85 mix-blend-multiply"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-0 top-10 w-40 rounded-3xl bg-white/80 border border-white/60 p-4 shadow-xl shadow-black/5 backdrop-blur"
              animate={{ y: [0, 10, 0] }}
              transition={floatSlow}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Recovery Score</p>
              <p className="mt-3 text-3xl font-serif font-semibold text-[#1F4D3A]">84</p>
              <p className="text-xs text-[#5F6B63]">+12 this week</p>
            </motion.div>
            <motion.div
              className="absolute -right-4 bottom-4 w-44 rounded-3xl bg-white/80 border border-white/60 p-4 shadow-xl shadow-black/5 backdrop-blur"
              animate={{ y: [0, -8, 0] }}
              transition={{ ...floatSlow, duration: 9 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Next Session</p>
              <p className="mt-3 text-lg font-semibold text-[#233127]">Tuesday 9:30</p>
              <p className="text-xs text-[#5F6B63]">Virtual check-in</p>
            </motion.div>
            <motion.div
              className="absolute -left-4 bottom-6 w-48 rounded-3xl bg-white/80 border border-white/60 p-4 shadow-xl shadow-black/5 backdrop-blur"
              animate={{ y: [0, 6, 0] }}
              transition={{ ...floatSlow, duration: 11 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Pain Trend</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#2D6A4F]" />
                <span className="text-sm text-[#233127]">Down 18% in 30 days</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-[#DCE6D8]">
                <div className="h-full w-3/4 rounded-full bg-[#2D6A4F]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Trusted by Professionals */}
      <motion.section
        className="py-20 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.p variants={itemVariants} className="text-center text-xs uppercase tracking-[0.4em] text-[#5F6B63] font-semibold mb-12">
            Trusted by Professionals
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm text-[#5F6B63]">
            {['Northwell Rehab', 'Cedar Mobility', 'Axis Health', 'Summit Ortho'].map((brand) => (
              <motion.div key={brand} variants={itemVariants} className="rounded-full border border-[#E7D9C9]/50 bg-white/60 py-3">
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Recovery Fails */}
      <motion.section
        className="relative py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1EA] via-[#F7F5F1] to-white" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
          <motion.div variants={itemVariants}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">The Reality</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold leading-tight">
              Recovery fails without tracking, feedback, and care that adapts.
            </h2>
            <p className="mt-6 text-[#5F6B63] leading-relaxed">
              Most rehabilitation programs end early because progress feels invisible. RecoverIQ makes every effort visible, actionable, and supported in real time.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
            {[
              { title: 'Unclear goals', desc: 'Patients do not know what to prioritize each week.' },
              { title: 'No adaptive plan', desc: 'Therapy does not adjust to real progress or pain.' },
              { title: 'Disconnected care', desc: 'Clinicians lack a daily pulse on recovery.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#E7D9C9]/60 bg-white/70 p-6 shadow-lg shadow-black/5">
                <h3 className="text-xl font-serif font-semibold text-[#233127]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#5F6B63]">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Intelligent Dashboard Preview */}
      <motion.section
        className="py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <motion.div variants={itemVariants} className="relative">
            <div className="rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-[#1F4D3A]/10 backdrop-blur">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Patient Dashboard</p>
                  <h3 className="text-2xl font-serif font-semibold text-[#233127]">Recovery Overview</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#DCE6D8] flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-[#2D6A4F]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Pain', 'Mobility', 'Energy'].map((label, index) => (
                  <div key={label} className="rounded-2xl bg-[#F5F1EA] p-4">
                    <p className="text-xs text-[#5F6B63] uppercase tracking-[0.2em]">{label}</p>
                    <p className="mt-3 text-2xl font-serif font-semibold text-[#233127]">
                      {index === 0 ? '3.2' : index === 1 ? '78' : '7.4'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 h-28 rounded-2xl bg-gradient-to-r from-[#DCE6D8] via-[#E7D9C9] to-[#D8D1F0] opacity-60" />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Intelligent Tracking</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold">A recovery dashboard that feels human.</h2>
            <p className="mt-6 text-[#5F6B63] leading-relaxed">
              Every signal is translated into gentle, actionable guidance. Patients see progress clearly while clinicians receive rich context to personalize care.
            </p>
            <div className="mt-8 space-y-4">
              {['Adaptive weekly goals', 'Daily symptom checks', 'Clinical prompts in real time'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#5F6B63]">
                  <CheckCircle className="h-4 w-4 text-[#2D6A4F]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* AI Powered Insights */}
      <motion.section
        className="relative py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7F5F1] via-white to-[#F5F1EA]" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <motion.div variants={itemVariants}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">AI Powered</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold">
              Intelligent insights that keep recovery on track.
            </h2>
            <p className="mt-6 text-[#5F6B63] leading-relaxed">
              Our models identify risk patterns early and guide clinicians with precise, compassionate recommendations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {['Risk alerts', 'Pain variance', 'Mobility prediction'].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full bg-[#DCE6D8]/60 text-xs uppercase tracking-[0.2em] text-[#1F4D3A]">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-[#2D6A4F]" />
                <h3 className="text-lg font-serif font-semibold">Insight Summary</h3>
              </div>
              <p className="mt-3 text-sm text-[#5F6B63]">
                Patient response indicates a steady reduction in pain with consistent mobility gains.
              </p>
            </div>
            <div className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#2D6A4F]" />
                <h3 className="text-lg font-serif font-semibold">Suggested Action</h3>
              </div>
              <p className="mt-3 text-sm text-[#5F6B63]">Increase resistance by 10% and add a low-impact stretch routine.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Recovery Timeline */}
      <motion.section
        className="py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Recovery Timeline</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold">A visual journey from day one to discharge.</h2>
          </motion.div>
          <div className="mt-12 grid lg:grid-cols-3 gap-6">
            {[
              { step: 'Week 1', title: 'Baseline assessment', desc: 'Capture pain, mobility, and daily capacity.' },
              { step: 'Week 4', title: 'Adaptive plan', desc: 'Adjust exercises and goals based on response.' },
              { step: 'Week 8', title: 'Confident discharge', desc: 'Graduation plan with long-term guidance.' },
            ].map((item) => (
              <motion.div key={item.step} variants={itemVariants} className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
                <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">{item.step}</p>
                <h3 className="mt-4 text-xl font-serif font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[#5F6B63]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Patient Progress Analytics */}
      <motion.section
        className="relative py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1EA] via-white to-[#F7F5F1]" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
          <motion.div variants={itemVariants}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Analytics</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold">Patient progress at a glance.</h2>
            <p className="mt-6 text-[#5F6B63] leading-relaxed">
              Clear charts, weekly summaries, and trend analysis make progress visible and motivating.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: <LineChart />, title: 'Mobility gains', value: '+24%' },
              { icon: <HeartPulse />, title: 'Pain reduction', value: '-31%' },
              { icon: <Clock />, title: 'Session adherence', value: '92%' },
              { icon: <Layers />, title: 'Milestones reached', value: '12' },
            ].map((card) => (
              <div key={card.title} className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
                <div className="h-10 w-10 rounded-full bg-[#DCE6D8] flex items-center justify-center text-[#2D6A4F]">
                  {card.icon}
                </div>
                <p className="mt-4 text-sm text-[#5F6B63]">{card.title}</p>
                <p className="mt-2 text-2xl font-serif font-semibold text-[#233127]">{card.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Collaboration */}
      <motion.section
        className="py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <motion.div variants={itemVariants} className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Collaboration</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-semibold">Doctors and patients aligned every day.</h2>
            <p className="text-[#5F6B63] leading-relaxed">
              Secure messaging, progress reviews, and shared milestones keep everyone focused on outcomes.
            </p>
            <div className="flex items-center gap-4 text-sm text-[#5F6B63]">
              <MessageCircle className="h-4 w-4 text-[#2D6A4F]" />
              Personalized feedback within 24 hours
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Doctor Note</p>
              <p className="mt-4 text-sm text-[#233127]">Great progress this week. Increase repetitions gently and keep your evening stretch routine.</p>
            </div>
            <div className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Patient Update</p>
              <p className="mt-4 text-sm text-[#233127]">Pain has dropped to 3/10. Mobility feels smoother after the new exercises.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="relative py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1EA] via-white to-[#F7F5F1]" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Testimonials</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold">Stories of progress and trust.</h2>
          </motion.div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Lena Morris', role: 'Orthopedic Specialist', quote: 'RecoverIQ makes it effortless to personalize care without losing time.' },
              { name: 'Marissa C.', role: 'Patient', quote: 'Seeing my progress each day kept me motivated and hopeful.' },
              { name: 'Dr. Priya Patel', role: 'Rehab Director', quote: 'Our outcomes improved immediately once we adopted RecoverIQ.' },
            ].map((item) => (
              <motion.div key={item.name} variants={itemVariants} className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 shadow-lg shadow-black/5">
                <div className="flex items-center gap-1 text-[#D8D1F0]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-[#233127]">"{item.quote}"</p>
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#5F6B63]">{item.name}</p>
                <p className="text-xs text-[#5F6B63]">{item.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Rehabilitation Metrics */}
      <motion.section
        className="py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            { label: 'Active patients', value: '12,400+' },
            { label: 'Clinical partners', value: '320+' },
            { label: 'Weekly sessions', value: '86k' },
            { label: 'Recovery plans', value: '9,200+' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants} className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-6 text-center shadow-lg shadow-black/5">
              <p className="text-3xl font-serif font-semibold text-[#1F4D3A]">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#5F6B63]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Security + Compliance */}
      <motion.section
        className="relative py-24 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1EA] via-white to-[#F7F5F1]" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          <motion.div variants={itemVariants}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F6B63]">Security</p>
            <h2 className="mt-6 text-4xl lg:text-5xl font-serif font-semibold">Healthcare-grade protection.</h2>
            <p className="mt-6 text-[#5F6B63] leading-relaxed">
              Built with modern encryption, role-based access, and compliance-ready workflows designed for clinics and hospitals.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            {[
              { icon: <Shield />, title: 'HIPAA-aligned security' },
              { icon: <Lock />, title: 'End-to-end encryption' },
              { icon: <Stethoscope />, title: 'Clinical audit trails' },
              { icon: <Calendar />, title: 'Secure scheduling' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#E7D9C9]/70 bg-white/70 p-5 shadow-lg shadow-black/5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#DCE6D8] flex items-center justify-center text-[#2D6A4F]">
                  {item.icon}
                </div>
                <p className="text-sm text-[#233127]">{item.title}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-28 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto text-center rounded-[48px] border border-[#E7D9C9]/70 bg-gradient-to-br from-[#DCE6D8]/40 via-white to-[#F5F1EA] p-12 shadow-2xl shadow-black/5">
          <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-serif font-semibold">
            The most calming way to recover.
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-6 text-[#5F6B63] text-lg">
            Begin with a personalized plan, guided by clinicians and supported by gentle intelligence.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base">
              Create Your Account
            </Link>
            <Link to="/login" className="btn-secondary text-base">
              Talk to a Specialist
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-[#E7D9C9]/30 py-12 px-6 lg:px-12 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1F4D3A] text-white font-serif font-bold">
              R
            </div>
            <span className="font-serif font-semibold text-[#233127]">RecoverIQ</span>
          </div>
          <p className="text-sm text-[#5F6B63]">
            © {new Date().getFullYear()} RecoverIQ. Compassionate care through technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
