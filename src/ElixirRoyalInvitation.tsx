import React, { useState, useEffect, useRef } from "react";

// Asset paths - pointing to local public/assets for offline resilience
const ASSETS = {
  video: "https://s3.envelope.id/templates/prewed-1/hansen-kezia-720.mp4",
  cover: "/assets/cover.jpg",
  openingBg: "/assets/opening_bg.jpg",
  groomBg: "/assets/groom.jpg",
  brideBg: "/assets/bride.jpg",
  lovestory: "/assets/lovestory.jpg",
  arrowLight: "/assets/arrow-white-light.webp",
  rundown: "/assets/rundown.png",
  dresscodeBg: "/assets/dresscode_bg.jpg",
  frameSample: "/assets/frame-sample.webp",
  cross: "/assets/cross.svg",
  giftBg: "/assets/gift_bg.jpg",
  closingBg: "/assets/closing_bg.jpg",
  envelopeLogo: "/assets/envelope-logo.webp",
  bca: "/assets/bca.png",
  mandiri: "/assets/mandiri.png",
  copyIcon: "/assets/copy-white.svg",
  giftIcon: "/assets/gift-icon-white.svg",
  rightArrow: "/assets/right-arrow.svg",
  playIcon: "/assets/play.svg",
  ytThumb: "/assets/yt_thumb.jpg",
  bgAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  galleryStrip1: [
    "/assets/gallery_1.jpg",
    "/assets/gallery_2.jpg",
    "/assets/gallery_3.jpg",
    "/assets/gallery_4.jpg",
    "/assets/gallery_5.jpg"
  ],
  galleryStrip2: [
    "/assets/gallery_6.jpg",
    "/assets/gallery_7.jpg",
    "/assets/gallery_8.jpg",
    "/assets/gallery_9.jpg",
    "/assets/gallery_10.jpg"
  ]
};

// Reusable Reanimate Scroll Observer Hook
function useReanimateObserver(isOpen: boolean) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { rootMargin: "-10px 0px -10px 0px", threshold: 0.01 }
    );

    const elements = document.querySelectorAll(".reanimate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isOpen]);
}

export default function ElixirRoyalInvitation() {
  // 1. Preloader State
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [preloaderFading, setPreloaderFading] = useState(false);

  // 2. Open / Cover State
  const [isOpen, setIsOpen] = useState(false);

  // 3. Audio & Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 4. URL Parameters & Dynamic State
  const [guestName] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("to") || "Guest";
    }
    return "Guest";
  });

  const [sessionTime] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("s") === "2" ? "20.00 - 21.00 WIB" : "19.00 - 20.00 WIB";
    }
    return "19.00 - 20.00 WIB";
  });

  // 5. Countdown Timer (Target: Saturday, 18 April 2026 09:00:00 WIB)
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  useEffect(() => {
    const targetDate = new Date("2026-04-18T09:00:00+07:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0")
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 6. RSVP State
  const [formName, setFormName] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("to") || "";
    }
    return "";
  });
  const [attendance, setAttendance] = useState("Attend");
  const [guestCount, setGuestCount] = useState(1);
  const [accommodation, setAccommodation] = useState("0");
  const [allergies, setAllergies] = useState("");
  const [wishes, setWishes] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  // 7. Wishes Feed with Pagination
  const [comments, setComments] = useState([
    { name: "Jessica Alexander", text: "Congratulations Hansen & Kezia! Wishing you a lifetime of joy, love, and endless blessings together.", time: "2 hours ago" },
    { name: "Budi Santoso", text: "Selamat atas pernikahannya! Kiranya Tuhan selalu memberkati rumah tangga kalian.", time: "5 hours ago" },
    { name: "Tomas", text: "Happy wedding Hansen & Kezia! All the best for your new journey.", time: "1 day ago" },
    { name: "Michelle Tan", text: "So happy for both of you! Wishing you love and happiness always.", time: "2 days ago" },
    { name: "David & Sarah", text: "Congratulations on your special day! May your love grow stronger each day.", time: "3 days ago" },
    { name: "Kevin Chandra", text: "Selamat menempuh hidup baru bro Hansen & sis Kezia!", time: "5 days ago" }
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const currentComments = comments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 8. Gift Accordion State & Clipboard
  const [giftActive, setGiftActive] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 9. Lightbox / Modal States
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [framePopupOpen, setFramePopupOpen] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);

  const allPhotos = [...ASSETS.galleryStrip1, ...ASSETS.galleryStrip2];

  const openLightbox = (photoUrl: string) => {
    const idx = allPhotos.indexOf(photoUrl);
    setLightboxIndex(idx !== -1 ? idx : 0);
    setSelectedPhoto(photoUrl);
    setYtPlaying(false);
  };

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (lightboxIndex + 1) % allPhotos.length;
    setLightboxIndex(nextIdx);
    setSelectedPhoto(allPhotos[nextIdx]);
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = (lightboxIndex - 1 + allPhotos.length) % allPhotos.length;
    setLightboxIndex(prevIdx);
    setSelectedPhoto(allPhotos[prevIdx]);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useReanimateObserver(isOpen);

  // Preloader Lifecycle
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setPreloaderFading(true);
    }, 4000);

    const doneTimer = setTimeout(() => {
      setPreloaderDone(true);
    }, 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // Lock Body Scroll before opening
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle Tab Visibility Auto-Pause
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
        }
      } else {
        if (audioRef.current && isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  // Open Invitation
  const handleOpenInvitation = () => {
    setIsOpen(true);
    document.body.style.overflow = "auto";
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(textArea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setRsvpError("Please enter your name");
      return;
    }
    if (!attendance) {
      setRsvpError("Please select your attendance");
      return;
    }

    setRsvpError("");
    setRsvpSubmitted(true);

    if (wishes.trim()) {
      setComments((prev) => [
        { name: formName.trim(), text: wishes.trim(), time: "Just now" },
        ...prev
      ]);
    }
    setWishes("");
  };

  return (
    <div className="relative min-h-screen bg-royal-bg text-white font-body selection:bg-gold-500 selection:text-black">
      {/* Background Audio */}
      <audio ref={audioRef} src={ASSETS.bgAudio} loop preload="auto" />

      {/* 1. Preloader Screen */}
      {!preloaderDone && (
        <div
          id="preloader"
          className={`preloader transition-opacity duration-500 ${preloaderFading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="preloader-content">
            <p className="first-text font-display uppercase tracking-[3px]">THE WEDDING OF</p>
            <p className="second-text font-display uppercase tracking-[3px]">HANSEN &amp; KEZIA</p>
            <div className="initial-wrapper">
              <div className="word-mask">
                <div className="word">
                  <div className="initial font-display tracking-widest">
                    <span>H</span>
                    <span className="mx-4 text-gold-400 font-serif italic text-7xl self-center">&amp;</span>
                    <span>K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fixed Looping Background Video (Desktop right 500px, Mobile full screen) */}
      <div className="fixed top-0 right-0 w-full lg:w-[500px] h-screen overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={ASSETS.cover}
          className="w-full h-full object-cover"
        >
          <source src={ASSETS.video} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* 3. Floating Music Toggle Button */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          id="music-button"
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
          className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full glass-panel flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer bg-white/20 border border-white/30 backdrop-blur-md"
        >
          {isPlaying ? (
            <svg
              className="w-5 h-5 fill-white animate-spin"
              viewBox="0 0 24 24"
              style={{ animationDuration: "5s" }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      )}

      {/* 4. Floating Hamburger Menu */}
      {isOpen && (
        <>
          <div className={`fixed top-6 right-6 z-50 menu ${menuOpen ? "active" : ""}`}>
            <button
              id="menuButton"
              onClick={() => setMenuOpen(!menuOpen)}
              className="menu-button glass-panel rounded-full w-11 h-11 border border-white/30 flex items-center justify-center"
              aria-label="Navigation Menu"
            >
              <span className="line" />
              <span className="line" />
            </button>
          </div>

          {/* Slide-out Menu Drawer */}
          <div
            className={`fixed inset-y-0 right-0 z-40 w-80 bg-black/90 backdrop-blur-xl border-l border-white/20 p-10 flex flex-col justify-between transform transition-transform duration-500 shadow-2xl ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="pt-12">
              <p className="font-display text-xs uppercase tracking-[4px] text-gold-400 mb-8 text-center">Navigation</p>
              <nav className="flex flex-col gap-6 text-center">
                {[
                  { label: "Home", href: "#opening" },
                  { label: "Groom & Bride", href: "#couple" },
                  { label: "Love Story", href: "#lovestory" },
                  { label: "Event Details", href: "#events" },
                  { label: "RSVP & Wishes", href: "#rsvp" },
                  { label: "Gallery", href: "#gallery" },
                  { label: "Wedding Gift", href: "#gift" }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-2xl tracking-wider text-white/90 hover:text-gold-400 transition-colors uppercase"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <p className="text-[11px] opacity-40 text-center tracking-wider pb-6">
              Select one of the menus above to navigate.
            </p>
          </div>
        </>
      )}

      {/* 5. Main Split Grid Container */}
      <div className="relative min-h-screen flex">
        {/* Desktop Fixed Left Banner (hidden on mobile, min-width 1024px) */}
        <aside
          className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[calc(100vw-500px)] flex-col justify-between p-20 z-10 text-center bg-cover bg-center select-none"
          style={{ backgroundImage: `url(${ASSETS.cover})` }}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10">
            <p className="tracking-[5px] text-xs font-semibold uppercase text-gold-400">THE WEDDING OF</p>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="font-display text-8xl xl:text-9xl tracking-wide leading-none text-white">Hansen</h1>
            <span className="font-serif italic text-6xl text-gold-400 my-2">&amp;</span>
            <h1 className="font-display text-8xl xl:text-9xl tracking-wide leading-none text-white">Kezia</h1>
            <p className="mt-8 text-sm tracking-[4px] opacity-90 uppercase text-gold-400 font-semibold">SATURDAY, 11 / 04 / 2026</p>
          </div>
          <div className="relative z-10 text-xs tracking-[4px] opacity-60 uppercase text-white">
            #HAppywithKEZIA
          </div>
        </aside>

        {/* Right Scrollable Mobile Invitation Container */}
        <main className="w-full lg:w-[500px] ml-auto relative z-10 min-h-screen">
          {/* Cover Screen Overlay */}
          <div
            id="cover-section"
            className={`fixed top-0 right-0 w-full lg:w-[500px] h-screen z-30 flex flex-col justify-between items-center text-center p-8 bg-cover bg-center transition-all duration-1000 ${
              isOpen ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"
            }`}
            style={{ backgroundImage: `url(${ASSETS.openingBg})` }}
          >
            <div className="absolute inset-0 bg-black/70 z-0" />

            <div className="relative z-10 mt-10">
              <p className="text-[11px] tracking-[4px] uppercase text-gold-400 font-semibold">THE WEDDING OF</p>
              <h2 className="font-display text-5xl mt-3 tracking-wide text-white">Hansen &amp; Kezia</h2>
              <p className="text-[11px] tracking-[3px] opacity-80 uppercase mt-2 text-white/80">SATURDAY, 11 / 04 / 2026</p>
            </div>

            <div className="relative z-10 w-full max-w-xs mb-10 flex flex-col items-center">
              <div className="glass-panel rounded-2xl p-6 w-full mb-6 border border-white/20">
                <p className="text-[11px] tracking-widest opacity-70 uppercase">Dear,</p>
                <h3 className="text-2xl font-bold mt-2 text-white font-display tracking-wide">{guestName}</h3>
                <p className="text-[11px] opacity-70 mt-3 leading-relaxed">
                  We apologize if there is any misspelling of name or title.
                </p>
              </div>

              <button
                id="desktopcoverbutton"
                onClick={handleOpenInvitation}
                className="px-8 py-3.5 bg-white text-black font-semibold text-xs tracking-[3px] rounded-full uppercase transition-transform hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
              >
                OPEN INVITATION
              </button>
            </div>
          </div>

          {/* Invitation Content Sections */}
          <div className="relative w-full overflow-hidden">
            {/* Section 1: Top Hero Cover */}
            <section className="snap-section text-center p-8 relative min-h-screen justify-between py-16">
              <div className="reanimate fade delay200ms">
                <p className="text-xs tracking-[4px] uppercase text-gold-400 font-semibold">THE WEDDING OF</p>
              </div>
              <div className="reanimate fade delay400ms flex flex-col items-center my-auto">
                <h2 className="font-display text-6xl tracking-wide text-white">Hansen</h2>
                <span className="font-serif italic text-4xl text-gold-400 my-1">&amp;</span>
                <h2 className="font-display text-6xl tracking-wide text-white">Kezia</h2>
                <p className="mt-6 text-xs tracking-[3px] uppercase opacity-80">SATURDAY, 11 / 04 / 2026</p>
              </div>
              <div className="reanimate fade delay600ms text-[11px] tracking-widest opacity-60">
                #HAppywithKEZIA
              </div>
            </section>

            {/* Section 2: Opening & Scripture */}
            <section
              id="opening"
              className="snap-section text-center p-8 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${ASSETS.openingBg})` }}
            >
              <div className="absolute inset-0 bg-black/75 z-0" />
              <div className="relative z-10 max-w-sm flex flex-col items-center">
                <div className="reanimate fade delay200ms flex items-center justify-center gap-3 font-display text-6xl mb-4">
                  <span className="text-white">H</span>
                  <span className="font-serif italic text-4xl text-gold-400">&amp;</span>
                  <span className="text-white">K</span>
                </div>
                <p className="reanimate fade delay300ms text-xs tracking-[3px] uppercase text-gold-400 font-semibold mb-6">
                  #HAppywithKEZIA
                </p>
                <div className="reanimate up delay400ms glass-panel rounded-3xl p-8 border border-white/20">
                  <h4 className="font-display text-lg text-gold-400 mb-3 tracking-wide">Mark 10:6-9</h4>
                  <p className="text-xs leading-relaxed italic opacity-90 font-light">
                    &ldquo;But at the beginning of creation God &lsquo;made them male and female.&rsquo; &lsquo;For this reason a man will leave his father and mother and be united to his wife, and the two will become one flesh.&rsquo; So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.&rdquo;
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: The Groom */}
            <section
              id="couple"
              className="snap-section text-center p-8 bg-cover bg-center relative justify-end pb-16"
              style={{ backgroundImage: `url(${ASSETS.groomBg})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-0" />

              {/* Rotated Vertical Badge */}
              <div className="absolute left-6 top-16 z-10 flex items-center gap-3 origin-top-left -rotate-90 reanimate fade delay200ms">
                <p className="text-[10px] tracking-[4px] uppercase text-gold-400 font-bold whitespace-nowrap">THE GROOM</p>
                <div className="w-12 h-[1px] bg-gold-400/60" />
              </div>

              <div className="relative z-10 max-w-sm w-full flex flex-col items-center">
                <p className="reanimate fade delay200ms font-serif italic text-2xl text-gold-400 mb-1">Hansen</p>
                <h3 className="reanimate up delay400ms font-display text-4xl text-white tracking-wide">Hansen Yap</h3>
                <p className="reanimate up delay600ms text-xs opacity-80 mt-2 leading-relaxed">
                  Son of<br />Mr. Hansen&apos;s Father &amp; Mrs. Hansen&apos;s Mother
                </p>
                <div className="reanimate up delay800ms w-16 h-[1px] bg-white/30 my-4" />
                <a
                  href="https://instagram.com/envelope.id"
                  target="_blank"
                  rel="noreferrer"
                  className="reanimate up delay1000ms inline-flex items-center gap-2 px-6 py-2 glass-button rounded-full text-xs font-semibold hover:bg-white/30 transition-all text-white border border-white/30"
                >
                  <i className="fab fa-instagram text-sm" />
                  <span>@hansen.yap</span>
                </a>
              </div>
            </section>

            {/* Section 4: The Bride */}
            <section
              className="snap-section text-center p-8 bg-cover bg-center relative justify-end pb-16"
              style={{ backgroundImage: `url(${ASSETS.brideBg})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-0" />

              {/* Rotated Vertical Badge */}
              <div className="absolute left-6 top-16 z-10 flex items-center gap-3 origin-top-left -rotate-90 reanimate fade delay200ms">
                <p className="text-[10px] tracking-[4px] uppercase text-gold-400 font-bold whitespace-nowrap">THE BRIDE</p>
                <div className="w-12 h-[1px] bg-gold-400/60" />
              </div>

              <div className="relative z-10 max-w-sm w-full flex flex-col items-center">
                <p className="reanimate fade delay200ms font-serif italic text-2xl text-gold-400 mb-1">Kezia</p>
                <h3 className="reanimate up delay400ms font-display text-4xl text-white tracking-wide">Kezia Aurelia</h3>
                <p className="reanimate up delay600ms text-xs opacity-80 mt-2 leading-relaxed">
                  Daughter of<br />Mr. Kezia&apos;s Father &amp; Mrs. Kezia&apos;s Mother
                </p>
                <div className="reanimate up delay800ms w-16 h-[1px] bg-white/30 my-4" />
                <a
                  href="https://instagram.com/envelope.id"
                  target="_blank"
                  rel="noreferrer"
                  className="reanimate up delay1000ms inline-flex items-center gap-2 px-6 py-2 glass-button rounded-full text-xs font-semibold hover:bg-white/30 transition-all text-white border border-white/30"
                >
                  <i className="fab fa-instagram text-sm" />
                  <span>@kezia.aurelia</span>
                </a>
              </div>
            </section>

            {/* Section 5: Love Story */}
            <section id="lovestory" className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full flex flex-col items-center">
                <div className="reanimate fade delay200ms w-full mb-6 rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                  <img src={ASSETS.lovestory} alt="Love Story" className="w-full h-48 object-cover" />
                </div>
                <h3 className="reanimate up delay300ms font-display text-2xl text-white tracking-wide mb-6">
                  The Path Where Two Hearts Unite
                </h3>

                <div className="space-y-4 w-full text-left">
                  <div className="reanimate up delay400ms glass-panel rounded-2xl p-5 border border-white/10">
                    <h4 className="font-display text-lg text-gold-400 mb-2">The Beginning</h4>
                    <p className="text-xs opacity-80 leading-relaxed font-light">
                      Our story began like a quiet song—unexpected yet comforting. We met at just the right time, when life was still figuring itself out. What started as casual conversations turned into deep connections, shared dreams, and a sense of home in each other’s presence.
                    </p>
                  </div>

                  <div className="reanimate up delay600ms glass-panel rounded-2xl p-5 border border-white/10">
                    <h4 className="font-display text-lg text-gold-400 mb-2">A Promise for Forever</h4>
                    <p className="text-xs opacity-80 leading-relaxed font-light">
                      Now, with joyful hearts and hopeful eyes, we’re stepping into the next chapter. This wedding isn’t just a celebration of a day—it’s a celebration of a journey, a promise, and the love we’re lucky enough to call our own.
                    </p>
                  </div>
                </div>

                <div className="reanimate fade delay800ms flex flex-col items-center mt-6">
                  <span className="text-[10px] tracking-widest uppercase opacity-60">Scroll to read more</span>
                  <img src={ASSETS.arrowLight} alt="Scroll" className="w-4 h-4 mt-2 animate-bounce opacity-70" />
                </div>
              </div>
            </section>

            {/* Section 6: Countdown & Calendar */}
            <section className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full flex flex-col items-center">
                {/* Stylized date header */}
                <div className="reanimate fade delay200ms flex items-center justify-center gap-4 text-3xl font-display text-gold-400 mb-2">
                  <span>11</span>
                  <span className="opacity-40">/</span>
                  <span>04</span>
                  <span className="opacity-40">/</span>
                  <span>26</span>
                </div>
                <p className="reanimate fade delay400ms text-xs tracking-[4px] uppercase text-white/80 font-semibold mb-8">
                  ALMOST TIME FOR OUR CELEBRATION
                </p>

                {/* Countdown Cards */}
                <div className="reanimate up delay600ms grid grid-cols-4 gap-2 w-full mb-8">
                  {[
                    { label: "Days", val: timeLeft.days },
                    { label: "Hours", val: timeLeft.hours },
                    { label: "Minutes", val: timeLeft.minutes },
                    { label: "Seconds", val: timeLeft.seconds }
                  ].map((unit) => (
                    <div key={unit.label} className="glass-panel rounded-2xl py-4 px-2 border border-white/20">
                      <span className="font-display text-3xl font-bold text-white block">{unit.val}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gold-400 mt-1 block">{unit.label}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://www.google.com/calendar/render?action=TEMPLATE&text=The%20Wedding%20of%20Hansen%20%26%20Kezia&details=Wedding%20Celebration&dates=20260418/20260418&location=AYANA%20Midplaza%20Jakarta"
                  target="_blank"
                  rel="noreferrer"
                  className="reanimate up delay800ms inline-block w-full py-3.5 bg-white text-black font-semibold text-xs tracking-[3px] rounded-full uppercase hover:bg-white/90 transition-all shadow-xl"
                >
                  SAVE THE DATE
                </a>
              </div>
            </section>

            {/* Section 7: Holy Matrimony */}
            <section id="events" className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full">
                <div className="reanimate up delay200ms glass-panel rounded-3xl p-8 border border-white/20">
                  <h3 className="font-display text-2xl text-gold-400 tracking-wide mb-6">HOLY MATRIMONY</h3>

                  {/* Date Grid */}
                  <div className="reanimate fade delay300ms grid grid-cols-3 gap-2 items-center py-4 border-y border-white/10 mb-6">
                    <span className="text-xs uppercase tracking-widest text-white/70">SATURDAY</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] tracking-widest uppercase text-gold-400 font-bold">APR</span>
                      <span className="font-display text-4xl text-white font-bold">18</span>
                      <span className="text-[10px] tracking-widest text-white/60">2026</span>
                    </div>
                    <span className="text-xs font-semibold text-white/90">09.00 - 11.00 WIB</span>
                  </div>

                  <h4 className="font-display text-lg text-white font-semibold">Ruby Room, AYANA Midplaza Jakarta</h4>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">Jl. Jend. Sudirman Kav. 10-11, Jakarta Pusat</p>

                  <a
                    href="https://maps.app.goo.gl/jVs1wwz4f15rR29AA"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block w-full py-3 glass-button rounded-full text-xs font-semibold tracking-wider hover:bg-white/30 transition-all border border-white/30"
                  >
                    GOOGLE MAPS
                  </a>
                </div>
              </div>
            </section>

            {/* Section 8: Tea Pai & Reception */}
            <section className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full space-y-6">
                {/* Event 1: Tea Pai */}
                <div className="reanimate up delay200ms glass-panel rounded-3xl p-6 border border-white/20">
                  <h3 className="font-display text-xl text-gold-400 tracking-wide mb-4">TEA PAI</h3>
                  <div className="grid grid-cols-3 gap-2 items-center py-3 border-y border-white/10 mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-white/70">SATURDAY</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] tracking-widest uppercase text-gold-400 font-bold">APR</span>
                      <span className="font-display text-3xl text-white font-bold">18</span>
                      <span className="text-[9px] tracking-widest text-white/60">2026</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white/90">15.30 - 17.00 WIB</span>
                  </div>
                  <h4 className="font-display text-base text-white font-semibold">Ceremony Hall, AYANA Midplaza Jakarta</h4>
                  <p className="text-[11px] opacity-75 mt-1">Jl. Jend. Sudirman Kav. 10-11, Jakarta Pusat</p>
                  <a
                    href="https://maps.app.goo.gl/jVs1wwz4f15rR29AA"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block w-full py-2.5 glass-button rounded-full text-[11px] font-semibold tracking-wider hover:bg-white/30 transition-all border border-white/30"
                  >
                    GOOGLE MAPS
                  </a>
                </div>

                {/* Event 2: Reception */}
                <div className="reanimate up delay400ms glass-panel rounded-3xl p-6 border border-white/20">
                  <h3 className="font-display text-xl text-gold-400 tracking-wide mb-4">RECEPTION</h3>
                  <div className="grid grid-cols-3 gap-2 items-center py-3 border-y border-white/10 mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-white/70">SATURDAY</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] tracking-widest uppercase text-gold-400 font-bold">APR</span>
                      <span className="font-display text-3xl text-white font-bold">18</span>
                      <span className="text-[9px] tracking-widest text-white/60">2026</span>
                    </div>
                    <span id="session-time" className="text-[11px] font-bold text-gold-400">
                      {sessionTime}
                    </span>
                  </div>
                  <h4 className="font-display text-base text-white font-semibold">Grand Ballroom, AYANA Midplaza Jakarta</h4>
                  <p className="text-[11px] opacity-75 mt-1">Jl. Jend. Sudirman Kav. 10-11, Jakarta Pusat</p>
                  <a
                    href="https://maps.app.goo.gl/jVs1wwz4f15rR29AA"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block w-full py-2.5 glass-button rounded-full text-[11px] font-semibold tracking-wider hover:bg-white/30 transition-all border border-white/30"
                  >
                    GOOGLE MAPS
                  </a>
                </div>
              </div>
            </section>

            {/* Section 9: Rundown */}
            <section className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full flex flex-col items-center">
                <h3 className="reanimate fade delay200ms font-display text-2xl text-gold-400 tracking-wider mb-6">
                  RUNDOWN
                </h3>
                <div className="reanimate up delay400ms w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <img src={ASSETS.rundown} alt="Wedding Rundown" className="w-full h-auto object-contain" />
                </div>
              </div>
            </section>

            {/* Section 10: Dresscode */}
            <section
              id="dresscode"
              className="snap-section text-center p-8 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${ASSETS.dresscodeBg})` }}
            >
              <div className="absolute inset-0 bg-black/75 z-0" />
              <div className="relative z-10 max-w-sm w-full flex flex-col items-center">
                <p className="reanimate fade delay400ms text-xs tracking-[4px] uppercase text-gold-400 font-semibold mb-2">
                  DRESSCODE
                </p>
                <div className="reanimate fade delay400ms w-48 h-[1px] bg-white/50 mb-6" />
                <h3 className="reanimate up delay800ms font-display text-xl text-white tracking-wide leading-relaxed mb-8">
                  We kindly encourage our guests to wear tones from our selected color palette.
                </h3>

                {/* 3 Swatches from the design */}
                <div className="reanimate up delay600ms flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFFFFFDB] border border-white/40 shadow-lg" />
                    <span className="text-[10px] mt-2 opacity-70 uppercase tracking-wider">Cream</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#BDA896DB] border border-white/40 shadow-lg" />
                    <span className="text-[10px] mt-2 opacity-70 uppercase tracking-wider">Beige</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#8C7466DB] border border-white/40 shadow-lg" />
                    <span className="text-[10px] mt-2 opacity-70 uppercase tracking-wider">Mocha</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 11: Live Streaming */}
            <section id="livestreaming" className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full flex flex-col items-center">
                <div className="reanimate fade delay200ms flex items-center justify-center gap-2 mb-4">
                  <p className="text-xs tracking-[4px] uppercase text-gold-400 font-semibold">LIVE STREAMING</p>
                </div>
                <div className="w-24 h-[1px] bg-gold-400/40 mb-6" />

                <h3 className="reanimate up delay400ms font-display text-2xl text-white tracking-wide mb-3">
                  JOIN OUR EXCLUSIVE LIVE STREAMING EVENT
                </h3>
                <p className="reanimate up delay600ms text-xs opacity-80 leading-relaxed mb-8">
                  Saturday, 11 April 2026<br />11:00 - 13:00 WIB
                </p>

                <a
                  href="https://instagram.com/envelope.id"
                  target="_blank"
                  rel="noreferrer"
                  className="reanimate up delay800ms inline-block px-10 py-3.5 bg-white text-black font-semibold text-xs tracking-[3px] rounded-full uppercase hover:bg-white/90 transition-all shadow-xl"
                >
                  JOIN LIVE
                </a>
              </div>
            </section>

            {/* Section 12: Wedding Frame */}
            <section className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full flex flex-col items-center">
                <div className="reanimate fade delay200ms w-36 h-auto mb-4 rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  <img src={ASSETS.frameSample} alt="Wedding Frame" className="w-full h-auto object-contain" />
                </div>
                <p className="reanimate fade delay400ms text-xs tracking-[4px] uppercase text-gold-400 font-semibold mb-2">
                  WEDDING FRAME
                </p>
                <p className="reanimate fade delay500ms text-xs opacity-80 leading-relaxed mb-6 font-light">
                  Capture the joyful moments of our wedding day using the Wedding Frame provided below.
                </p>

                <div className="reanimate up delay600ms w-full flex flex-col gap-3">
                  <button
                    onClick={() => setFramePopupOpen(true)}
                    className="w-full py-3 bg-white text-black font-semibold text-xs tracking-[2px] rounded-full uppercase hover:bg-white/90 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fab fa-instagram text-sm" />
                    <span>OPEN FRAME</span>
                  </button>

                  <a
                    href="https://envelope.id"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 glass-button rounded-full text-xs font-semibold tracking-[2px] uppercase hover:bg-white/30 transition-all border border-white/30 flex items-center justify-center gap-2"
                  >
                    <i className="fab fa-google-drive text-sm" />
                    <span>UPLOAD PHOTOS</span>
                  </a>
                </div>

                <p className="reanimate fade delay800ms text-[10px] opacity-50 mt-4 italic">
                  *We recommend updating your Instagram app to the latest version.
                </p>
              </div>
            </section>

            {/* Wedding Frame Popup Modal */}
            <div
              id="framepopup"
              className={framePopupOpen ? "active" : ""}
              onClick={() => setFramePopupOpen(false)}
            >
              <div
                className="framecontainer text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setFramePopupOpen(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
                >
                  <img src={ASSETS.cross} alt="Close" className="w-5 h-5 invert" />
                </button>
                <h3 className="font-display text-xl text-gold-400 mb-2">WEDDING FRAME</h3>
                <p className="text-xs opacity-80 mb-6 font-light leading-relaxed">
                  If the frame doesn&apos;t open automatically, please swipe through the Instagram Highlights until you find the intended frame.
                </p>

                <div className="video-wrapper rounded-xl overflow-hidden mb-6 border border-white/20">
                  <div className="w-full h-24 bg-white/10 flex items-center justify-center">
                    <i className="fab fa-instagram text-4xl text-gold-400" />
                  </div>
                </div>

                <a
                  href="https://instagram.com/envelope.id"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-semibold text-xs tracking-wider rounded-full uppercase hover:bg-white/90 transition-all"
                >
                  <i className="fab fa-instagram" />
                  <span>OPEN FRAME</span>
                </a>
              </div>
            </div>

            {/* Section 13: RSVP Form */}
            <section id="rsvp" className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full">
                <div className="reanimate fade delay200ms flex items-center justify-center gap-2 mb-2">
                  <p className="text-xs tracking-[4px] uppercase text-gold-400 font-semibold">RSVP</p>
                </div>
                <h3 className="reanimate up delay400ms font-display text-2xl text-white tracking-wide mb-2">
                  WILL YOU ATTEND?
                </h3>
                <p className="reanimate up delay600ms text-xs opacity-75 mb-6 leading-relaxed font-light">
                  We kindly request your prompt response to confirm your attendance at our upcoming event. Alongside your RSVP, please take a moment to extend your warm regards and best wishes.
                </p>

                <form
                  onSubmit={handleRSVPSubmit}
                  className="reanimate up delay800ms glass-panel rounded-3xl p-6 text-left border border-white/20 shadow-2xl"
                >
                  {/* Name field */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                      NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Guest Name"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                    />
                  </div>

                  {/* Attendance radio */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                      ATTENDANCE
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Attend", "Not Attend"].map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setAttendance(opt)}
                          className={`py-2 text-xs rounded-lg font-semibold border transition-all cursor-pointer uppercase tracking-wider ${
                            attendance === opt
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-white border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guest count stepper (shown when attending) */}
                  {attendance === "Attend" && (
                    <div className="mb-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                        NUMBER OF GUESTS (MAX 2)
                      </label>
                      <div className="qty-wrapper">
                        <button
                          type="button"
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          readOnly
                          id="form-field-guestcount"
                          value={guestCount}
                        />
                        <button
                          type="button"
                          onClick={() => setGuestCount(Math.min(2, guestCount + 1))}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accommodation option */}
                  {attendance === "Attend" && (
                    <div className="mb-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                        ACCOMMODATION
                      </label>
                      <select
                        value={accommodation}
                        onChange={(e) => setAccommodation(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="0" className="bg-[#1a1a1a] text-white">Do you need accommodation?</option>
                        <option value="No" className="bg-[#1a1a1a] text-white">No</option>
                        <option value="Yes, for 1 night" className="bg-[#1a1a1a] text-white">Yes, for 1 night</option>
                        <option value="Yes, for 2 nights" className="bg-[#1a1a1a] text-white">Yes, for 2 nights</option>
                      </select>
                    </div>
                  )}

                  {/* Allergies field */}
                  {attendance === "Attend" && (
                    <div className="mb-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                        ALLERGIES
                      </label>
                      <textarea
                        rows={2}
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Kindly inform us if you have any allergies to prawn or beef"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400 placeholder:text-white/40"
                      />
                    </div>
                  )}

                  {/* Wishes field */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                      WISHES
                    </label>
                    <textarea
                      rows={3}
                      value={wishes}
                      onChange={(e) => setWishes(e.target.value)}
                      placeholder="Write your wishes and blessings"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400 placeholder:text-white/40"
                    />
                  </div>

                  {rsvpError && (
                    <div className="text-red-400 text-xs font-semibold mb-3">
                      {rsvpError}
                    </div>
                  )}

                  {rsvpSubmitted && (
                    <div className="text-emerald-400 text-xs font-semibold mb-3 flex items-center gap-2">
                      <svg width="14" height="11" viewBox="0 0 36 36" fill="currentColor">
                        <path d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z" />
                      </svg>
                      <span>Thank you, we have received your response!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-black font-semibold text-xs tracking-wider rounded-lg uppercase hover:bg-white/90 transition-all shadow-md cursor-pointer"
                  >
                    SUBMIT
                  </button>
                </form>
              </div>
            </section>

            {/* Section 14: Wishes Feed */}
            <section className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full">
                <div className="reanimate fade delay200ms flex items-center justify-center gap-2 mb-4">
                  <p className="text-xs tracking-[4px] uppercase text-gold-400 font-semibold">WISHES</p>
                </div>

                <div className="reanimate up delay400ms glass-panel rounded-3xl p-6 text-left border border-white/20 shadow-xl max-h-[60vh] flex flex-col justify-between">
                  <div className="divide-y divide-white/10 overflow-y-auto pr-1">
                    {currentComments.map((c, i) => (
                      <div key={i} className="comment py-3">
                        <span className="name font-bold text-sm text-white block">{c.name}</span>
                        <span className="text text-xs text-white/90 block mt-1 leading-relaxed">{c.text}</span>
                        <span className="time text-[10px] text-white/50 italic block mt-1.5">{c.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div id="rsvp-pagination" className="pt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rsvp-page-btn"
                      >
                        ← Prev
                      </button>
                      <span className="rsvp-page-info text-xs">{currentPage} / {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rsvp-page-btn"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 15: Gallery & Lightbox */}
            <section id="gallery" className="snap-section text-center p-8 relative">
              <div className="max-w-sm w-full flex flex-col items-center">
                <h3 className="reanimate fade delay400ms font-display text-3xl text-white tracking-wide mb-1">
                  Moments in Time
                </h3>
                <p className="reanimate fade delay1000ms text-[11px] opacity-75 mb-6">
                  Tap image for slideshow view &bull; Swipe to see more
                </p>

                {/* Strip 1: 5 photos */}
                <div className="reanimate up delay200ms gallery-scroll mb-4 w-full">
                  {ASSETS.galleryStrip1.map((img, i) => (
                    <a key={i} onClick={() => openLightbox(img)} className="cursor-pointer">
                      <img src={img} alt={`Moment ${i + 1}`} />
                    </a>
                  ))}
                </div>

                {/* Strip 2: 1 video thumb + 5 photos */}
                <div className="reanimate up delay800ms gallery-scroll mb-6 w-full">
                  <div
                    onClick={() => {
                      setSelectedPhoto(ASSETS.ytThumb);
                      setYtPlaying(true);
                    }}
                    className="gallery-video-item cursor-pointer relative flex-shrink-0 w-36 h-full rounded-xl overflow-hidden border border-white/20"
                  >
                    <img src={ASSETS.ytThumb} alt="Video" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <img src={ASSETS.playIcon} alt="Play" className="w-10 h-10" />
                    </div>
                  </div>
                  {ASSETS.galleryStrip2.map((img, i) => (
                    <a key={i} onClick={() => openLightbox(img)} className="cursor-pointer">
                      <img src={img} alt={`Moment ${i + 6}`} />
                    </a>
                  ))}
                </div>

                {/* Quote */}
                <p className="reanimate fade delay600ms text-xs italic opacity-75 font-serif max-w-xs -rotate-2 mt-2">
                  &ldquo;To love and be loved is to feel the sun from both sides.&rdquo; &mdash; David Viscott
                </p>
              </div>
            </section>

            {/* Gallery Lightbox Modal */}
            {selectedPhoto && (
              <div
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
              >
                <div className="relative max-w-full max-h-[85vh] flex items-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute -top-12 right-0 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold hover:bg-white/40 cursor-pointer"
                  >
                    ✕
                  </button>

                  <button
                    onClick={prevLightbox}
                    className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl hover:bg-white/40 cursor-pointer"
                  >
                    &#8249;
                  </button>

                  {ytPlaying ? (
                    <div className="w-[320px] md:w-[500px] aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/FpJVl_iHvHk?autoplay=1"
                        title="Wedding Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <img
                      src={selectedPhoto}
                      alt="Enlarged moment"
                      className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
                    />
                  )}

                  <button
                    onClick={nextLightbox}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl hover:bg-white/40 cursor-pointer"
                  >
                    &#8250;
                  </button>
                </div>
              </div>
            )}

            {/* Section 16: Wedding Gift */}
            <section
              id="gift"
              className="snap-section text-center p-8 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${ASSETS.giftBg})` }}
            >
              <div className="absolute inset-0 bg-black/75 z-0" />
              <div className="relative z-10 max-w-sm w-full flex flex-col items-center">
                <p className="reanimate fade delay400ms text-xs tracking-[4px] uppercase text-gold-400 font-semibold mb-3">
                  WEDDING GIFT
                </p>
                <p className="reanimate fade delay400ms text-xs opacity-80 leading-relaxed font-light mb-8 max-w-xs">
                  The greatest gift is having you with us. If you’d like to give a token of love, we would be truly grateful.
                </p>

                {/* Gift Container Accordion */}
                <div
                  className={`gift-container mx-auto ${giftActive ? "active" : ""}`}
                >
                  {!giftActive ? (
                    <button
                      id="giftButton"
                      onClick={() => setGiftActive(true)}
                      className="w-full py-3.5 px-6 flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold tracking-wider text-white"
                    >
                      <span>SEND GIFT</span>
                      <img src={ASSETS.giftIcon} alt="Gift" className="w-4 h-4" />
                    </button>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center p-4 border-b border-white/10">
                        <span className="font-display text-sm tracking-wider text-gold-400 uppercase font-semibold">Bank Accounts</span>
                        <button
                          id="giftCloseButton"
                          onClick={() => setGiftActive(false)}
                          className="text-xs tracking-wider opacity-70 hover:opacity-100 uppercase"
                        >
                          CLOSE ✕
                        </button>
                      </div>

                      <div className="gift-wrapper">
                        <div className="gift-content text-left space-y-1">
                          {/* Account 1: BCA */}
                          <div className="gift-item">
                            <img src={ASSETS.bca} alt="BCA" />
                            <div className="gift-account-info">
                              <span className="gift-account-name font-bold">Hansen Yap</span>
                              <span className="gift-account-number font-mono">123456789</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard("123456789", "bca")}
                              className="gift-copy-btn cursor-pointer"
                              title="Copy account number"
                            >
                              <img src={ASSETS.copyIcon} alt="Copy" />
                            </button>
                          </div>
                          {copiedKey === "bca" && (
                            <p className="text-[10px] text-gold-400 text-right -mt-2">Copied!</p>
                          )}

                          <div className="gift-divider" />

                          {/* Account 2: Mandiri */}
                          <div className="gift-item">
                            <img src={ASSETS.mandiri} alt="Mandiri" />
                            <div className="gift-account-info">
                              <span className="gift-account-name font-bold">Kezia Aurelia</span>
                              <span className="gift-account-number font-mono">987654321</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard("987654321", "mandiri")}
                              className="gift-copy-btn cursor-pointer"
                              title="Copy account number"
                            >
                              <img src={ASSETS.copyIcon} alt="Copy" />
                            </button>
                          </div>
                          {copiedKey === "mandiri" && (
                            <p className="text-[10px] text-gold-400 text-right -mt-2">Copied!</p>
                          )}

                          <div className="gift-divider" />

                          {/* Account 3: Physical Address */}
                          <div className="gift-item">
                            <img src={ASSETS.giftIcon} alt="Gift Address" className="p-2" />
                            <div className="gift-account-info">
                              <span className="gift-account-name font-bold">Send Gift</span>
                              <span className="gift-account-number text-[11px]">Evan (08123456789)</span>
                              <span className="gift-account-number text-[10px] leading-tight opacity-75">
                                Jl. Arcadia Raya No.9, Bojongsoang, Bandung 40288
                              </span>
                            </div>
                            <button
                              onClick={() => copyToClipboard("Jl. Arcadia Raya No.9, Bojongsoang, Bandung 40288", "address")}
                              className="gift-copy-btn cursor-pointer"
                              title="Copy shipping address"
                            >
                              <img src={ASSETS.copyIcon} alt="Copy" />
                            </button>
                          </div>
                          {copiedKey === "address" && (
                            <p className="text-[10px] text-gold-400 text-right -mt-2">Copied!</p>
                          )}

                          <div className="gift-divider" />

                          {/* Account 4: Gift Registry */}
                          <div className="gift-item">
                            <img src={ASSETS.giftIcon} alt="Gift Registry" className="p-2" />
                            <div className="gift-account-info">
                              <span className="gift-account-name font-bold">Gift Registry</span>
                            </div>
                            <a
                              href="https://instagram.com/envelope.id"
                              target="_blank"
                              rel="noreferrer"
                              className="gift-copy-btn cursor-pointer"
                              title="Open registry"
                            >
                              <img src={ASSETS.rightArrow} alt="Open" className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 17: Closing & Credits */}
            <section
              id="closing"
              className="snap-section text-center p-8 bg-cover bg-center relative justify-between py-16"
              style={{ backgroundImage: `url(${ASSETS.closingBg})` }}
            >
              <div className="absolute inset-0 bg-black/75 z-0" />
              <div className="relative z-10 max-w-sm w-full my-auto flex flex-col items-center">
                <p className="reanimate fade delay200ms text-xs tracking-[3px] uppercase text-gold-400 font-semibold mb-4 leading-relaxed">
                  WITH HEARTFELT GRATITUDE FOR YOUR PRESENCE AND BLESSINGS
                </p>
                <p className="reanimate fade delay400ms text-xs opacity-80 leading-relaxed font-light mb-8">
                  We can’t wait to share this special moment with you.<br />
                  Your presence will make our day even more meaningful.
                </p>
                <h2 className="reanimate fade delay600ms font-display text-4xl text-white tracking-wide">
                  HANSEN &amp; KEZIA
                </h2>
              </div>

              {/* Footer Credits */}
              <div className="relative z-10 reanimate fade delay800ms flex flex-col items-center gap-2">
                <a href="https://instagram.com/envelope.id" target="_blank" rel="noreferrer">
                  <img src={ASSETS.envelopeLogo} alt="énvelope" className="h-6 w-auto opacity-75 hover:opacity-100 transition-opacity" />
                </a>
                <span className="text-[9px] tracking-widest opacity-40 uppercase">
                  &copy; 2026 énvelope, All rights reserved.
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
