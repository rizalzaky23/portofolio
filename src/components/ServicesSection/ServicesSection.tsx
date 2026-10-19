import { motion } from "framer-motion";
import { Code2, Cloud, Network, Globe, Sparkles } from "lucide-react";
import { MagicCard } from "../lightswind/magic-card";

interface CreativeService {
  icon: typeof Code2;
  title: string;
  description: string;
  image?: string;
  color: string;
}

const creativeServices: CreativeService[] = [
  {
    icon: Code2,
    title: "Web Development",
    description:
      "Building modern, performant web applications with cutting-edge JavaScript frameworks, RESTful APIs, and responsive design principles.",
    image: "/images/service_web_dev.webp",
    color: "from-violet-500/20 to-purple-600/10",
  },
  {
    icon: Cloud,
    title: "Cloud Computing",
    description:
      "Deploying and managing scalable cloud infrastructure using containerization, orchestration, and cloud-native services.",
    image: "/images/service_cloud.webp",
    color: "from-sky-500/20 to-cyan-600/10",
  },
  {
    icon: Network,
    title: "Networking",
    description:
      "Designing and managing secure network infrastructures — from routing and switching to firewall configuration and monitoring.",
    image: "/images/service_networking.webp",
    color: "from-emerald-500/20 to-green-600/10",
  },
];

interface TechItem {
  name: string;
  icon: string;
  category: "web" | "cloud" | "network";
}

const techStack: TechItem[] = [
  // Web Development (12 items)
  { name: "JavaScript", icon: "/icons/tech/javascript-original.svg", category: "web" },
  { name: "TypeScript", icon: "/icons/tech/typescript-original.svg", category: "web" },
  { name: "HTML5",      icon: "/icons/tech/html5-original.svg", category: "web" },
  { name: "CSS3",       icon: "/icons/tech/css3-original.svg", category: "web" },
  { name: "React",      icon: "/icons/tech/react-original.svg", category: "web" },
  { name: "Vue.js",     icon: "/icons/tech/vuejs-original.svg", category: "web" },
  { name: "Next.js",    icon: "/icons/tech/nextjs-original.svg", category: "web" },
  { name: "Node.js",    icon: "/icons/tech/nodejs-original.svg", category: "web" },
  { name: "Express",    icon: "/icons/tech/express-original.svg", category: "web" },
  { name: "Tailwind",   icon: "/icons/tech/tailwindcss-original.svg", category: "web" },
  { name: "MongoDB",    icon: "/icons/tech/mongodb-original.svg", category: "web" },
  { name: "Git",        icon: "/icons/tech/git-original.svg", category: "web" },
  // Cloud Computing (6 items)
  { name: "Docker",      icon: "/icons/tech/docker-original.svg", category: "cloud" },
  { name: "Kubernetes",  icon: "/icons/tech/kubernetes-original.svg", category: "cloud" },
  { name: "AWS",         icon: "/icons/tech/amazonwebservices-plain-wordmark.svg", category: "cloud" },
  { name: "Oracle Cloud",icon: "/icons/tech/oracle-original.svg", category: "cloud" },
  { name: "Terraform",   icon: "/icons/tech/terraform-original.svg", category: "cloud" },
  { name: "Linux",       icon: "/icons/tech/linux-original.svg", category: "cloud" },
  // Networking (6 items) — using simpleicons.org for reliable SVGs
  { name: "Cisco",     icon: "/icons/tech/cisco.svg", category: "network" },
  { name: "MikroTik",  icon: "/icons/tech/mikrotik.svg", category: "network" },
  { name: "Wireshark", icon: "/icons/tech/wireshark.svg", category: "network" },
  { name: "Fortinet",  icon: "/icons/tech/fortinet.svg", category: "network" },
  { name: "pfSense",   icon: "/icons/tech/pfsense.svg", category: "network" },
  { name: "Ubiquiti",  icon: "/icons/tech/ubiquiti.svg", category: "network" },
];

const categoryMeta = {
  web:     { label: "Web Development",  color: "text-violet-500",  bg: "bg-violet-500/10 border-violet-500/30" },
  cloud:   { label: "Cloud Computing",  color: "text-sky-500",     bg: "bg-sky-500/10 border-sky-500/30" },
  network: { label: "Networking",       color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
};


export const ServicesSection = () => {
  return (
    <section id="services" className="max-w-7xl mx-auto px-6 py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Services & Tools
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Creative & <span className="text-gradient-primary">Tech Stack</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          A blend of creative expertise and modern technologies to deliver exceptional digital products.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Creative Services Cards */}
        <div className="lg:w-1/2 flex flex-col gap-5">
          {creativeServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true, amount: 0.1 }}
              >
                <MagicCard
                  className="h-full rounded-[2rem] border border-border/80 bg-card/80 overflow-hidden"
                  gradientSize={280}
                  gradientColor="rgba(139, 92, 246, 0.12)"
                  gradientFrom="#8b5cf6"
                  gradientTo="#38bdf8"
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    {/* Image */}
                    {service.image && (
                      <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} z-10`} />
                        <img
                          src={service.image}
                          alt={service.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover opacity-70 dark:opacity-50"
                        />
                      </div>
                    )}
                    {/* Content */}
                    <div className={`flex-1 p-6 sm:p-7 flex flex-col justify-center gap-3 ${!service.image ? 'p-8' : ''}`}>
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </MagicCard>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Tech Stack Grid — grouped by category */}
        <div className="lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.1 }}
            className="h-full"
          >
            <MagicCard
              className="h-full p-8 rounded-[2rem] border border-border/80 bg-card/80"
              gradientSize={350}
              gradientColor="rgba(56, 189, 248, 0.08)"
              gradientFrom="#38bdf8"
              gradientTo="#8b5cf6"
            >
              <div className="flex flex-col h-full gap-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" /> Tech Stack
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
                    {techStack.length} Tools
                  </span>
                </div>

                {/* Grouped categories */}
                {(["web", "cloud", "network"] as const).map((cat, catIdx) => {
                  const meta = categoryMeta[cat];
                  const items = techStack.filter(t => t.category === cat);
                  return (
                    <div key={cat}>
                      {/* Category label */}
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {items.map((tech, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: catIdx * 0.08 + i * 0.04,
                              duration: 0.35,
                              type: "spring",
                              stiffness: 220,
                            }}
                            viewport={{ once: true }}
                            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-default"
                          >
                            <div className="w-9 h-9 rounded-lg bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
                              <img
                                src={tech.icon}
                                alt={tech.name}
                                className="w-5 h-5 object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                              {tech.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </MagicCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
