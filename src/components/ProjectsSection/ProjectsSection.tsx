import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Folder, Award, Trophy, Code2, Calendar, Building2, Hash, X, ChevronLeft, ChevronRight, Smartphone, Monitor, Globe, Layers } from "lucide-react";
import { MagicCard } from "../lightswind/magic-card";
import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// === DATA TYPES ===
interface Project {
  id: number;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  github?: string;
  live?: string;
}

interface Certificate {
  id: number;
  title: string;
  image: string;
  issuer: string;
  year: string;
  credentialId?: string;
  credentialLink?: string;
  coursesLink?: string;
}

interface Competition {
  id: number;
  title: string;
  image: string;
  organizer: string;
  year: string;
  achievement?: string;
  certificateLink?: string;
}

// === DATA ===
const projects: Project[] = [
  {
    id: 1,
    title: "Fleet Operations Management System",
    description:
      "Aplikasi enterprise modern berbasis Flutter yang berjalan lancar di 3 platform (Android, Desktop, dan Web). Memudahkan pemantauan operasional armada kendaraan secara real-time, pencatatan jadwal servis, manajemen asuransi, serta pengelolaan sewa unit armada perusahaan.",
    images: [
      "/images/project/fleet_app/Screenshot From 2026-09-07 18-46-18.png",
      "/images/project/fleet_app/Screenshot From 2026-09-07 18-46-09.png",
      "/images/project/fleet_app/Screenshot From 2026-09-07 18-46-25.png",
      "/images/project/fleet_app/Screenshot From 2026-09-07 18-46-40.png",
      "/images/project/fleet_app/Screenshot From 2026-09-07 18-47-05.png",
    ],
    tags: ["Flutter", "Dart", "Android", "Desktop", "Web", "Cross-Platform", "Fleet Operations"],
  },
  {
    id: 2,
    title: "Kavier POS (Point of Sale) & Cashier System",
    description:
      "Sistem aplikasi kasir pintar berbasis Flutter multiplatform yang dapat dijalankan di 3 platform (Android, Desktop, dan Web). Dilengkapi kemampuan mode offline dengan cache lisensi lokal, transaksi kasir instan, manajemen katalog produk/menu, cetak nota, serta rekapitulasi laporan penjualan.",
    images: [
      "/images/project/kavier/Screenshot From 2026-09-07 19-19-33.png",
      "/images/project/kavier/Screenshot From 2026-09-07 19-19-40.png",
      "/images/project/kavier/Screenshot From 2026-09-07 19-19-49.png",
      "/images/project/kavier/Screenshot From 2026-09-07 19-18-07.png",
      "/images/project/kavier/Screenshot From 2026-09-07 19-20-25.png",
    ],
    tags: ["Flutter", "Dart", "Android", "Desktop", "Web", "Cross-Platform", "POS System"],
  },
];

const certificates: Certificate[] = [
  {
    id: 1,
    title: "MikroTik Certified Network Associate (MTCNA)",
    image: "/images/certificate/MTCNA.jpg",
    issuer: "MikroTik",
    year: "2024",
    credentialId: "2412NA2587",
  },
  {
    id: 2,
    title: "MikroTik Certified Routing Engineer (MTCRE)",
    image: "/images/certificate/MTCRE.jpg",
    issuer: "MikroTik",
    year: "2024",
    credentialId: "2412RE2676",
  },
  {
    id: 3,
    title: "Oracle Certified Foundations Associate",
    image: "/images/certificate/oracle.jpg",
    issuer: "Oracle",
    year: "2025",
    credentialId: "ZX66UYP1FBHJ",
  },
  {
    id: 4,
    title: "AWS Academy Cloud Foundations",
    image: "/images/certificate/AWS_Academy_Cloud_Foundations.pdf",
    issuer: "Amazon Web Services (AWS Academy)",
    year: "2023",
  },
  {
    id: 5,
    title: "Fortinet Certified Associate in Cybersecurity (FCA)",
    image: "/images/certificate/Fortinet_Certified_Associate_Cybersecurity.pdf",
    issuer: "Fortinet",
    year: "2024",
  },
  {
    id: 6,
    title: "Fortinet Certified Fundamentals in Cybersecurity (FCF)",
    image: "/images/certificate/Fortinet_Certified_Fundamentals_Cybersecurity.pdf",
    issuer: "Fortinet",
    year: "2024",
  },
  {
    id: 7,
    title: "Getting Started with Cisco Packet Tracer",
    image: "/images/certificate/Cisco_Getting_Started_Packet_Tracer.pdf",
    issuer: "Cisco Networking Academy",
    year: "2024",
    credentialId: "124250081",
  },
  {
    id: 8,
    title: "Cisco Networking Basics",
    image: "/images/certificate/Cisco_Networking_Basics.pdf",
    issuer: "Cisco Networking Academy",
    year: "2024",
  },
  {
    id: 9,
    title: "Ruijie Certified Network Associate (Routing & Switching)",
    image: "/images/certificate/RCNA-ROUTING.pdf",
    issuer: "Ruijie Networks",
    year: "2025",
  },
  {
    id: 10,
    title: "Ruijie Certified Network Associate (Wireless)",
    image: "/images/certificate/RCNA-WLAN.pdf",
    issuer: "Ruijie Networks",
    year: "2025",
  },
  {
    id: 11,
    title: "BNSP Data Scientist",
    image: "/images/certificate/231070_bnsp.pdf",
    issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
    year: "2023",
  },
  {
    id: 12,
    title: "Cloud Practitioner Essentialst",
    image: "/images/certificate/Sertifikat_Course_251.pdf",
    issuer: "Dicoding Indonesia",
    year: "2024",
  },
  {
    id: 13,
    title: "Belajar Dasar-Dasar DevOps",
    image: "/images/certificate/Sertifikat_Course_382.pdf",
    issuer: "Dicoding Indonesia",
    year: "2024",
  },
  {
    id: 14,
    title: "AWS Cloud Practitioner Essentials",
    image: "/images/certificate/AWS_Course_Completion_1.pdf",
    issuer: "Amazon Web Services",
    year: "2024",
  },
  {
    id: 15,
    title: "AWS Technical Essentials",
    image: "/images/certificate/AWS_Course_Completion_2.pdf",
    issuer: "Amazon Web Services",
    year: "2024",
  },
  {
    id: 16,
    title: "How AWS Managed Service(AMS) Work Within Cloud Operating Models",
    image: "/images/certificate/AWS_Course_Completion_3.pdf",
    issuer: "Amazon Web Services",
    year: "2024",
  },
  {
    id: 17,
    title: "Foundational C# With Microsoft",
    image: "/images/certificate/cert_screenshot.png",
    issuer: "FreeCodeCamp",
    year: "2024",
  },
];


const competitions: Competition[] = [
  {
    id: 1,
    title: "Techsprint Innovation Cup",
    image: "https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg?auto=compress&cs=tinysrgb&w=600",
    organizer: "Tech Innovation Forum",
    year: "2026",
    achievement: "Finalist",
    certificateLink: "#",
  },
  {
    id: 2,
    title: "Business Model Canvas Competition",
    image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600",
    organizer: "National Entrepreneurship Council",
    year: "2025",
    achievement: "Participant",
    certificateLink: "#",
  },
  {
    id: 3,
    title: "Hackathon Web Development Challenge",
    image: "https://images.pexels.com/photos/7108/notebook-hero-workspace-handmade.jpg?auto=compress&cs=tinysrgb&w=600",
    organizer: "DevCommunity Indonesia",
    year: "2025",
    achievement: "Top 10",
    certificateLink: "#",
  },
];

const tabs = [
  { key: "projects", label: "Projects", icon: Code2 },
  { key: "certificates", label: "Certificates", icon: Award },
  { key: "lomba", label: "Lomba", icon: Trophy },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// === LIGHTBOX COMPONENT ===
interface LightboxProps {
  image: string | null;
  images?: string[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  alt: string;
  onClose: () => void;
}

const Lightbox = ({ image, images, currentIndex = 0, onNavigate, alt, onClose }: LightboxProps) => {
  const currentImage = images && images.length > 0 ? images[currentIndex] : image;
  const hasMultiple = Boolean(images && images.length > 1);

  // Keyboard navigation
  useEffect(() => {
    if (!currentImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (hasMultiple && onNavigate && images) {
        if (e.key === "ArrowLeft") {
          onNavigate((currentIndex - 1 + images.length) % images.length);
        } else if (e.key === "ArrowRight") {
          onNavigate((currentIndex + 1) % images.length);
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentImage, hasMultiple, currentIndex, images, onNavigate, onClose]);

  return (
    <AnimatePresence>
      {currentImage && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 z-30 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all shadow-xl cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Lightbox Navigation Buttons */}
          {hasMultiple && onNavigate && images && (
            <>
              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/90 hover:scale-105 transition-all shadow-xl cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((currentIndex - 1 + images.length) % images.length);
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/90 hover:scale-105 transition-all shadow-xl cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((currentIndex + 1) % images.length);
                }}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image & Caption */}
          <div
            className="relative z-20 flex flex-col items-center max-w-[92vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={currentImage}
              src={currentImage}
              alt={alt}
              className="max-w-[90vw] max-h-[78vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            />

            {/* Info bar below image */}
            <div className="mt-3 flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/90">
              <span className="font-semibold">{alt}</span>
              {hasMultiple && images && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/70">
                    {currentIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail dots */}
            {hasMultiple && onNavigate && images && (
              <div className="flex items-center gap-1.5 mt-2.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex ? "w-6 bg-primary" : "w-2 bg-white/40 hover:bg-white/80"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// === COMPONENTS ===

const ProjectCard = ({
  project,
  index,
  onImageClick,
}: {
  project: Project;
  index: number;
  onImageClick: (image: string, alt: string, images?: string[], initialIndex?: number) => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide every 3.5 seconds when not hovered
  useEffect(() => {
    if (isHovered || project.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % project.images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, project.images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % project.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="h-full"
    >
      <MagicCard
        className="h-full rounded-[2rem] border border-border/80 bg-card/90 overflow-hidden group flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/40"
        gradientSize={320}
        gradientColor="rgba(139, 92, 246, 0.12)"
        gradientFrom="#8b5cf6"
        gradientTo="#38bdf8"
      >
        {/* Slideshow Image Area */}
        <div
          className="relative aspect-[16/10] overflow-hidden bg-muted/30 cursor-pointer select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() =>
            onImageClick(
              project.images[currentSlide],
              `${project.title} (Foto ${currentSlide + 1})`,
              project.images,
              currentSlide
            )
          }
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={project.images[currentSlide]}
              alt={`${project.title} screenshot ${currentSlide + 1}`}
              loading="lazy"
              decoding="async"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />

          {/* Hover Zoom Hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>

          {/* Navigation Arrows */}
          {project.images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 hover:scale-110 transition-all duration-200 z-10 shadow-lg cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 hover:scale-110 transition-all duration-200 z-10 shadow-lg cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Slide Indicator Dots */}
          {project.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {project.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide ? "w-5 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Counter Badge */}
          {project.images.length > 1 && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white/90 z-10">
              {currentSlide + 1} / {project.images.length}
            </div>
          )}

          {/* Flutter Multiplatform Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-sky-500/90 backdrop-blur-md text-[10px] font-extrabold text-white uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Flutter Multiplatform
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-7 flex flex-col gap-4 flex-1">
          {/* Platforms Support Header */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-wider">3 Platforms:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              <Smartphone className="w-3 h-3" /> Android
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-semibold">
              <Monitor className="w-3 h-3" /> Desktop
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-semibold">
              <Globe className="w-3 h-3" /> Web
            </span>
          </div>

          <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {project.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.map((tag, j) => (
              <span key={j} className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
            <button
              onClick={() =>
                onImageClick(
                  project.images[currentSlide],
                  `${project.title} (Foto ${currentSlide + 1})`,
                  project.images,
                  currentSlide
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-foreground transition-colors group/link cursor-pointer"
            >
              Lihat Semua Screenshot ({project.images.length} foto)
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </MagicCard>
    </motion.div>
  );
};

const isPdf = (src: string) => src.toLowerCase().endsWith('.pdf');

// Renders the first page of a PDF as a visual thumbnail
const PdfThumbnail = ({ file }: { file: string }) => (
  <Document
    file={file}
    loading={<div className="w-full h-full bg-slate-900 flex items-center justify-center"><span className="text-white/30 text-xs">Loading...</span></div>}
    error={<div className="w-full h-full bg-slate-900 flex items-center justify-center"><span className="text-red-400/60 text-xs">Error</span></div>}
  >
    <Page
      pageNumber={1}
      height={192}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      className="!w-full [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:object-cover"
    />
  </Document>
);

const CertificateCard = ({ cert, index, onImageClick }: { cert: Certificate; index: number; onImageClick: (image: string, alt: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
  >
    <MagicCard
      className="h-full rounded-[2rem] border border-border/80 bg-card/80 overflow-hidden group"
      gradientSize={280}
      gradientColor="rgba(16, 185, 129, 0.08)"
      gradientFrom="#10b981"
      gradientTo="#38bdf8"
    >
      {/* Image or PDF preview */}
      {isPdf(cert.image) ? (
        <a
          href={cert.image}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-48 overflow-hidden block cursor-pointer group/pdf"
        >
          <div className="w-full h-48 overflow-hidden pointer-events-none [&_.react-pdf\_\_Page]:!w-full [&_.react-pdf\_\_Page\_canvas]:!w-full [&_.react-pdf\_\_Page\_canvas]:!h-auto">
            <PdfThumbnail file={cert.image} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pdf:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              <span className="text-white text-xs font-semibold">Open PDF</span>
            </div>
          </div>
        </a>
      ) : (
        <div
          className="relative h-48 overflow-hidden bg-muted/30 cursor-pointer"
          onClick={() => onImageClick(cert.image, cert.title)}
        >
          <img
            src={cert.image}
            alt={cert.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
      )}
      {/* Content */}
      <div className="p-6 flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-emerald-400 transition-colors leading-snug">
          {cert.title}
        </h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Issuer: <span className="text-foreground/80 font-medium">{cert.issuer}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Year: <span className="text-foreground/80 font-medium">{cert.year}</span></span>
          </div>
          {cert.credentialId && (
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span>Credential ID: <span className="text-foreground/80 font-medium font-mono text-[11px]">{cert.credentialId}</span></span>
            </div>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-border/40">
          {isPdf(cert.image) ? (
            <a
              href={cert.image}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-foreground transition-colors"
            >
              View Certificate <ArrowUpRight className="w-3 h-3" />
            </a>
          ) : (
            <button
              onClick={() => onImageClick(cert.image, cert.title)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-foreground transition-colors cursor-pointer"
            >
              View Certificate <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </MagicCard>
  </motion.div>
);

const CompetitionCard = ({ comp, index, onImageClick }: { comp: Competition; index: number; onImageClick: (image: string, alt: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
  >
    <MagicCard
      className="h-full rounded-[2rem] border border-border/80 bg-card/80 overflow-hidden group"
      gradientSize={280}
      gradientColor="rgba(245, 158, 11, 0.08)"
      gradientFrom="#f59e0b"
      gradientTo="#ef4444"
    >
      {/* Image */}
      <div
        className="relative h-48 overflow-hidden bg-muted/30 cursor-pointer"
        onClick={() => onImageClick(comp.image, comp.title)}
      >
        <img
          src={comp.image}
          alt={comp.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent pointer-events-none" />
        {/* Zoom hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
        {/* Achievement Badge */}
        {comp.achievement && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg backdrop-blur-sm">
              {comp.achievement}
            </span>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-6 flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-amber-400 transition-colors leading-snug">
          {comp.title}
        </h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Organizer: <span className="text-foreground/80 font-medium">{comp.organizer}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Year: <span className="text-foreground/80 font-medium">{comp.year}</span></span>
          </div>
        </div>
        {/* Link */}
        {comp.certificateLink && (
          <div className="mt-auto pt-3 border-t border-border/40">
            <a href={comp.certificateLink} className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-foreground transition-colors">
              View Certificate <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </MagicCard>
  </motion.div>
);

// === MAIN SECTION ===
export const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("projects");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = useCallback((image: string, alt: string, images?: string[], initialIndex?: number) => {
    if (images && images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(initialIndex ?? (images.indexOf(image) >= 0 ? images.indexOf(image) : 0));
      setLightboxImage(images[initialIndex ?? 0]);
    } else {
      setLightboxImages([image]);
      setLightboxIndex(0);
      setLightboxImage(image);
    }
    setLightboxAlt(alt);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
    setLightboxImages([]);
    setLightboxIndex(0);
    setLightboxAlt("");
  }, []);

  return (
    <section id="projects" className="w-full max-w-7xl mx-auto px-6 py-24">
      {/* Lightbox */}
      <Lightbox
        image={lightboxImage}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
        alt={lightboxAlt}
        onClose={closeLightbox}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mb-12 md:mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-5">
          <Folder className="w-3.5 h-3.5" />
          My Work
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Portfolio <span className="text-gradient-primary">Showcase</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Explore my journey through projects, certifications, and competitions. Each section represents a milestone in my continuous learning path.
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex gap-1 p-1.5 rounded-full glass-panel border border-foreground/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="popLayout">
        {activeTab === "projects" && (
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onImageClick={openLightbox} />
            ))}
          </motion.div>
        )}

        {activeTab === "certificates" && (
          <motion.div
            key="certificates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {certificates.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} index={i} onImageClick={openLightbox} />
            ))}
          </motion.div>
        )}

        {activeTab === "lomba" && (
          <motion.div
            key="lomba"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {competitions.map((comp, i) => (
              <CompetitionCard key={comp.id} comp={comp} index={i} onImageClick={openLightbox} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
