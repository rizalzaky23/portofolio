import { motion } from "framer-motion";
import { BlurText, SplitText } from "../reactbits/effects";

export const AboutSection = () => {
  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-24">
      <motion.div
        className="flex flex-col gap-8 items-center max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="space-y-6">
          <div>
            <SplitText
              text="Where Networks Meet Creativity"
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4 justify-center"
              delay={40}
              animateBy="words"
              direction="bottom"
            />
            <BlurText
              text="I'm a curious and driven IT student with a deep fascination for the invisible highways that power the digital world — networking and cloud computing. Beyond the infrastructure, I'm equally captivated by the art of web development, where logic meets design to create experiences that people love. I thrive at the intersection of back-end systems and front-end craft, constantly exploring how cloud-native architectures and modern web technologies can come together to build something truly impactful."
              className="text-lg text-muted-foreground leading-relaxed justify-center"
              delay={30}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};
