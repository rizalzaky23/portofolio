import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Instagram } from "lucide-react";
import TechStackSection from "../TechStackSection/TechStackSection";
import { Button } from "../lightswind/button";
import { Badge } from "../lightswind/badge";
import { HangingIdCard } from "../lightswind/HangingIdCard";
import { AuroraTextEffect } from "../lightswind/aurora-text-effect";
import { Magnet, BlurText } from "../reactbits/effects";

export const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-[100vh] flex flex-col pt-12 md:pt-16 overflow-hidden bg-background">
      {/* Lightweight CSS Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -top-[200px] -left-[100px] rounded-full bg-violet-500/[0.07] dark:bg-violet-500/[0.12] blur-[120px] animate-[drift1_20s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] top-[30%] -right-[150px] rounded-full bg-sky-400/[0.06] dark:bg-sky-400/[0.10] blur-[100px] animate-[drift2_25s_ease-in-out_infinite]" />
        <div className="absolute w-[400px] h-[400px] bottom-[10%] left-[30%] rounded-full bg-purple-500/[0.05] dark:bg-purple-500/[0.08] blur-[100px] animate-[drift3_22s_ease-in-out_infinite]" />
      </div>
      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,var(--fg)_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.04] pointer-events-none" />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, 40px) scale(1.1); }
          66% { transform: translate(-30px, 60px) scale(0.95); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, -30px) scale(1.05); }
          66% { transform: translate(40px, -50px) scale(0.9); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -40px) scale(1.08); }
          66% { transform: translate(-60px, 20px) scale(0.95); }
        }
      `}} />
      
      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 pb-12">
        
        {/* Left Content */}
        <motion.div 
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Badge variant="outline" size="lg" className="gap-2.5 py-1.5 px-4 glass-panel border-foreground/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">Available for work</span>
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-4 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">
              Hi, I'm
            </h1>
            
            {/* Light Theme: Clean Vibrant Gradient Text */}
            <div className="block dark:hidden">
              <span className="bg-gradient-to-r from-violet-600 via-sky-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-extrabold text-[clamp(3rem,6.5vw,5.5rem)] leading-none tracking-tight block pb-2 select-none">
                Rizal Zaky
              </span>
            </div>

            {/* Dark Theme: Rich Lightswind Aurora Text Effect */}
            <div className="hidden dark:block">
              <AuroraTextEffect
                text="Rizal Zaky"
                fontSize="clamp(3rem, 6.5vw, 5.5rem)"
                className="bg-transparent overflow-visible p-0 justify-start"
                textClassName="bg-gradient-to-r from-cyan-400 via-purple-400 to-sky-300 bg-clip-text text-transparent pb-2 font-extrabold"
              />
            </div>
          </motion.div>

          <BlurText
            text="A tech-driven student passionate about networking, cloud computing, and crafting beautiful web experiences — turning curiosity into code, one deploy at a time."
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed w-full justify-center md:justify-start"
            delay={80}
          />

          <motion.div 
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-10 w-full md:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Magnet strength={3} padding={60}>
              <Button size="lg" className="rounded-full px-7 h-12 bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-1">
                View Work <ArrowRight className="w-4 h-4" />
              </Button>
            </Magnet>
            <Magnet strength={3} padding={60}>
              <a
                href="/CV_Rizal_Zaky.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="CV_Rizal_Zaky.pdf"
              >
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12 glass-panel text-foreground font-semibold flex items-center gap-2 hover:bg-foreground/10 transition-all hover:-translate-y-1 border-foreground/10">
                  Resume <Download className="w-4 h-4" />
                </Button>
              </a>
            </Magnet>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex items-center gap-5 justify-center md:justify-start w-full md:w-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              { icon: Instagram, href: "https://www.instagram.com/rizal.zalkyf/", label: "Instagram" },
              { icon: Github, href: "https://github.com/rizalzaky23", label: "GitHub" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/rizalzaky23/", label: "LinkedIn" },
            ].map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground hover:text-foreground transition-colors hover:-translate-y-1 transform duration-200"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content - Visual Hanging ID Card */}
        <motion.div 
          className="flex-1 w-full max-w-md relative flex justify-center items-center py-2"
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <HangingIdCard
            name="Rizal Zaky"
            role="Director of Engineering"
            badgeId="SR-89240-PRO"
            accentColor="#8b5cf6"
            ropeLength={75}
            ropeColor="#27272a"
            cardWidth="w-72 sm:w-80 md:w-84"
          >
            <div className="flex flex-col h-full bg-card w-full">
              {/* Card Header Banner with Avatar */}
              <div className="relative px-5 pt-7 pb-6 flex flex-col items-center bg-[#0d1117] text-white overflow-hidden">
                {/* Animated scrolling code lines */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes codeScroll {
                      0%   { transform: translateY(0); }
                      100% { transform: translateY(-50%); }
                    }
                    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
                    .code-scroll { animation: codeScroll 12s linear infinite; }
                    .cursor-blink { animation: blink 1s step-end infinite; }
                  `}} />
                  <div className="code-scroll absolute inset-x-0 top-0 flex flex-col gap-[2px] font-mono text-[7px] leading-[11px] px-2 pt-1 opacity-30">
                    {[
                      'const net = require("networking");',
                      'import { Cloud } from "@aws-sdk/client";',
                      'ssh root@192.168.1.1 -p 22',
                      'docker run -d --name app nginx',
                      'kubectl apply -f deployment.yaml',
                      'ping 8.8.8.8 -t 64',
                      'SELECT * FROM nodes WHERE active=1;',
                      'git push origin main --force',
                      'npm run build && deploy --prod',
                      'nmap -sV -p 1-65535 target.io',
                      'curl -X POST /api/v1/gateway',
                      'traceroute google.com',
                      'sudo iptables -A INPUT -j ACCEPT',
                      'terraform apply --auto-approve',
                      'cat /etc/network/interfaces',
                      'wget https://cloud.api/config',
                      'const vpc = new VPC({ cidr });',
                      'route add -net 10.0.0.0/8 gw 192.168.1.1',
                      'const net = require("networking");',
                      'import { Cloud } from "@aws-sdk/client";',
                      'ssh root@192.168.1.1 -p 22',
                      'docker run -d --name app nginx',
                      'kubectl apply -f deployment.yaml',
                      'ping 8.8.8.8 -t 64',
                      'SELECT * FROM nodes WHERE active=1;',
                      'git push origin main --force',
                      'npm run build && deploy --prod',
                      'nmap -sV -p 1-65535 target.io',
                    ].map((line, i) => (
                      <span key={i} style={{ color: i % 5 === 0 ? '#22c55e' : i % 5 === 1 ? '#38bdf8' : i % 5 === 2 ? '#a78bfa' : i % 5 === 3 ? '#fb923c' : '#e2e8f0' }}>
                        {line}
                      </span>
                    ))}
                  </div>
                  {/* Dark overlay gradient so avatar stands out */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/30 via-[#0d1117]/10 to-[#0d1117]/70" />
                  {/* Green scan-line glow */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,80,0.018)_2px,rgba(0,255,80,0.018)_4px)]" />
                  {/* Corner circuit accent */}
                  <svg className="absolute top-0 left-0 w-16 h-16 opacity-25" viewBox="0 0 64 64" fill="none">
                    <path d="M4 4 h20 v8 h8 v20" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="40" cy="32" r="2" fill="#22c55e"/>
                  </svg>
                  <svg className="absolute top-0 right-0 w-16 h-16 opacity-25" viewBox="0 0 64 64" fill="none">
                    <path d="M60 4 h-20 v8 h-8 v20" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="24" cy="32" r="2" fill="#38bdf8"/>
                  </svg>
                  {/* Terminal prompt bottom-left */}
                  <div className="absolute bottom-2 left-3 font-mono text-[7px] text-green-400/60 flex items-center gap-0.5">
                    <span>$</span>
                    <span className="cursor-blink ml-0.5">▌</span>
                  </div>
                </div>

                {/* Profile Photo with Dual Glowing Ring */}
                <div className="mt-1 relative w-28 h-28 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 via-cyan-400 to-purple-400 shadow-[0_0_24px_rgba(34,197,94,0.5)] border border-green-400/30 overflow-hidden group z-10">
                  <img 
                    src="/public/images/profil.png" 
                    alt="Rizal Zaky" 
                    className="w-full h-full object-cover rounded-full filter contrast-105"
                    loading="eager"
                  />
                  <div className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0d1117] shadow-md" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col items-center text-center bg-card text-card-foreground flex-1 gap-3">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">Rizal Zaky Firmansyah</h3>
                  <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                    <span>Network & Web Enthusiast</span>
                  </div>
                </div>

                <div className="w-full border-t border-border/60 my-0.5" />

                {/* Details 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2.5 w-full text-left bg-muted/40 p-3 rounded-xl border border-border/50">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-widest font-bold">Specialty</span>
                    <span className="font-bold text-foreground text-xs">Network & Cloud Computing</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-widest font-bold">Location</span>
                    <span className="font-bold text-foreground text-xs">Klaten, Indonesia</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-widest font-bold">Education</span>
                    <span className="font-bold text-foreground text-xs">UPN Veteran Yogyakarta</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-widest font-bold">Status</span>
                    <span className="font-bold text-emerald-500 text-xs flex items-center gap-1">
                      ● Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </HangingIdCard>
        </motion.div>

      </div>

      {/* Marquee appended natively to the bottom to span Full Width */}
      <div className="w-full relative z-10 mt-auto">
        <TechStackSection />
      </div>
    </section>
  );
};

