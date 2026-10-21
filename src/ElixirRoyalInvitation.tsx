import React, { useState, useEffect, useRef } from "react";

// Asset URLs from envelope.id CDN
const ASSETS = {
  video: "https://s3.envelope.id/templates/prewed-1/hansen-kezia-720.mp4",
  coverImage: "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg",
  groomImage: "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg",
  brideImage: "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg",
  bgAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Audio stream
  gallery: [
    "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg",
    "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg",
    "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg",
    "https://s3.envelope.id/wp/uploads/2026/02/hansenkezia_28_1770794555.jpg"
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
      { rootMargin: "-20px 0px -20px 0px", threshold: 0.05 }
    );

    const elements = document.querySelectorAll(".reanimate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isOpen]);
}

export default function ElixirRoyalInvitation() {
  // State Management
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guestName] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("to") || "Mr. & Mrs. Guest";
    }
    return "Mr. & Mrs. Guest";
  });
  const [sessionTime] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("s") === "2" ? "20.00 - 21.00 WIB" : "18.00 - 20.00 WIB";
    }
    return "18.00 - 20.00 WIB";
  });
  const [guestCount, setGuestCount] = useState(1);
  const [attendance, setAttendance] = useState("Attend");
  const [giftActive, setGiftActive] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // RSVP Comments Feed
  const [comments, setComments] = useState([
    { name: "Jessica Alexander", text: "Congratulations Hansen & Kezia! Wishing you a lifetime of joy and happiness.", time: "2 hours ago" },
    { name: "Budi Santoso", text: "Selamat atas pernikahannya! Bahagia selalu selamanya.", time: "5 hours ago" }
  ]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useReanimateObserver(isOpen);

  // Parse URL Parameters and handle Preloader
  useEffect(() => {
    // Dismiss Preloader after 2.8 seconds
    const timer = setTimeout(() => {
      setPreloaderDone(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // Lock scroll before invitation is opened
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

  // Unlock Scroll & Play Music
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

  const copyToClipboard = (text: string, id: string) => {
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
        // fallback ignored
      }
      document.body.removeChild(textArea);
    }
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    setComments((prev) => [
      { name: newCommentName.trim(), text: newCommentText.trim(), time: "Just now" },
      ...prev
    ]);
    setNewCommentName("");
    setNewCommentText("");
  };

  return (
    <div className="relative min-h-screen bg-royal-bg text-white font-body selection:bg-gold-500 selection:text-black">
      {/* Background Audio */}
      <audio ref={audioRef} src={ASSETS.bgAudio} loop preload="auto" />

      {/* 1. Preloader Overlay */}
      {!preloaderDone && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-700">
          <p className="font-display tracking-[4px] text-xs uppercase animate-pulse text-gold-400">The Wedding Of</p>
          <div className="font-display text-7xl md:text-8xl mt-4 tracking-wider animate-bounce text-white">
            H &amp; K
          </div>
          <div className="w-16 h-0.5 bg-gold-400/50 mt-6 animate-pulse" />
        </div>
      )}

      {/* 2. Fixed Looping Background Video (Right 500px on desktop, full-bleed on mobile) */}
      <div className="fixed top-0 right-0 w-full lg:w-[500px] h-screen overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={ASSETS.coverImage}
          className="w-full h-full object-cover"
        >
          <source src={ASSETS.video} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* 3. Floating Music Toggle */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
          className="fixed bottom-5 left-5 z-50 w-10 h-10 rounded-full glass-panel flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 fill-gold-400 animate-spin" viewBox="0 0 24 24" style={{ animationDuration: "6s" }}>
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
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full glass-panel flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
            aria-label="Navigation Menu"
          >
            <span className={`w-5 h-[1.5px] bg-white transition-transform ${menuOpen ? "translate-y-[4.5px] rotate-45" : ""}`} />
            <span className={`w-5 h-[1.5px] bg-white transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>

          {/* Slide-out Menu Drawer */}
          <div
            className={`fixed inset-y-0 right-0 z-40 w-72 glass-panel p-8 flex flex-col justify-center gap-6 text-center transform transition-transform duration-500 shadow-2xl ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {["Opening", "Couple", "Events", "Love Story", "Gallery", "Dresscode", "Gift", "RSVP"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                onClick={() => setMenuOpen(false)}
                className="font-display text-xl tracking-wider hover:text-gold-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </>
      )}

      {/* 5. Main Split Grid Container */}
      <div className="relative min-h-screen flex">
        {/* Desktop Fixed Left Banner (min-width: 1024px) */}
        <aside
          className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[calc(100vw-500px)] flex-col justify-between p-16 z-10 text-center bg-cover bg-center"
          style={{ backgroundImage: `url(${ASSETS.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10">
            <p className="tracking-[5px] text-xs font-semibold uppercase text-gold-400">The Wedding Celebration</p>
          </div>
          <div className="relative z-10">
            <h1 className="font-display text-7xl xl:text-8xl tracking-wide text-white">Hansen &amp; Kezia</h1>
            <p className="mt-4 text-sm tracking-[3px] opacity-80 uppercase text-gold-400">Saturday, 11 April 2026</p>
          </div>
          <div className="relative z-10 text-xs tracking-widest opacity-60">
            #HANSENKEZIAFOREVER
          </div>
        </aside>

        {/* Right Scrollable Mobile Invitation Container */}
        <main className="w-full lg:w-[500px] ml-auto relative z-10 min-h-screen">
          {/* Cover Screen Overlay */}
          <div
            className={`fixed top-0 right-0 w-full lg:w-[500px] h-screen z-30 flex flex-col justify-between items-center text-center p-8 bg-cover bg-center transition-all duration-1000 ${
              isOpen ? "opacity-0 -translate-y-6 pointer-events-none" : "opacity-100 translate-y-0"
            }`}
            style={{ backgroundImage: `url(${ASSETS.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black/65 z-0" />

            <div className="relative z-10 mt-12">
              <p className="text-xs tracking-[4px] uppercase text-gold-400">The Wedding Of</p>
              <h2 className="font-display text-5xl mt-2 tracking-wide text-white">Hansen &amp; Kezia</h2>
            </div>

            <div className="relative z-10 w-full max-w-xs mb-8 flex flex-col items-center">
              <div className="glass-panel rounded-2xl p-6 w-full mb-6">
                <p className="text-[11px] tracking-widest opacity-70 uppercase">Dear Valued Guest</p>
                <h3 className="text-xl font-bold mt-2 text-white">{guestName}</h3>
                <p className="text-xs opacity-70 mt-2">We cordially invite you to celebrate our joyful wedding day.</p>
              </div>

              <button
                onClick={handleOpenInvitation}
                className="px-8 py-3.5 bg-white text-black font-semibold text-xs tracking-[2px] rounded-full uppercase transition-transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
              >
                Open Invitation
              </button>
            </div>
          </div>

          {/* Invitation Content Sections */}
          <div className="px-6 py-12 flex flex-col gap-12">
            {/* Opening / Bible Verse */}
            <section id="opening" className="pt-12 text-center">
              <div className="reanimate up glass-panel rounded-3xl p-8">
                <p className="font-display text-3xl text-gold-400 mb-2">“</p>
                <p className="text-xs leading-relaxed italic opacity-90">
                  Two are better than one, because they have a good return for their labor: If either of them falls down,
                  one can help the other up.
                </p>
                <p className="text-[11px] tracking-widest uppercase mt-4 text-gold-400 font-semibold">Ecclesiastes 4:9-10</p>
              </div>
            </section>

            {/* Couple Profile Section */}
            <section id="couple" className="text-center">
              <div className="reanimate fade mb-8">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">The Groom &amp; The Bride</p>
                <h3 className="font-display text-4xl mt-1">Beloved Couple</h3>
              </div>

              {/* Groom */}
              <div className="reanimate left glass-panel rounded-3xl p-6 mb-8 flex flex-col items-center">
                <div className="w-32 h-44 rounded-2xl overflow-hidden mb-4 border border-white/20 shadow-lg">
                  <img src={ASSETS.groomImage} alt="Groom" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-display text-2xl">Hansen Wiratama</h4>
                <p className="text-xs opacity-75 mt-1">Son of Mr. Ronald Wiratama &amp; Mrs. Maria Susanto</p>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-xs tracking-wider text-gold-400 hover:underline"
                >
                  @hansenwiratama
                </a>
              </div>

              <div className="font-display text-3xl text-gold-400 my-2">&amp;</div>

              {/* Bride */}
              <div className="reanimate right glass-panel rounded-3xl p-6 mt-6 flex flex-col items-center">
                <div className="w-32 h-44 rounded-2xl overflow-hidden mb-4 border border-white/20 shadow-lg">
                  <img src={ASSETS.brideImage} alt="Bride" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-display text-2xl">Kezia Gabriella</h4>
                <p className="text-xs opacity-75 mt-1">Daughter of Mr. David Gabriella &amp; Mrs. Stephanie Tan</p>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-xs tracking-wider text-gold-400 hover:underline"
                >
                  @keziagabriella
                </a>
              </div>
            </section>

            {/* Events Detail Section */}
            <section id="events" className="text-center">
              <div className="reanimate fade mb-8">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">Schedule &amp; Venue</p>
                <h3 className="font-display text-4xl mt-1">Wedding Day</h3>
              </div>

              {/* Holy Matrimony */}
              <div className="reanimate up glass-panel rounded-3xl p-6 mb-6">
                <h4 className="font-display text-2xl text-gold-400">Holy Matrimony</h4>
                <p className="text-xs tracking-wider mt-2 font-semibold">SATURDAY, 11 APRIL 2026</p>
                <p className="text-xs opacity-80 mt-1">10.00 - 12.00 WIB</p>
                <div className="border-t border-white/10 my-4" />
                <p className="text-xs font-semibold">Cathedral Church of St. Mary</p>
                <p className="text-[11px] opacity-70 mt-1">Jl. Katedral No. 7, Jakarta Pusat</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 px-6 py-2 glass-button rounded-full text-xs font-semibold hover:bg-white/30 transition-all"
                >
                  Open Maps
                </a>
              </div>

              {/* Reception with dynamic session time */}
              <div className="reanimate up delay-200 glass-panel rounded-3xl p-6">
                <h4 className="font-display text-2xl text-gold-400">Wedding Reception</h4>
                <p className="text-xs tracking-wider mt-2 font-semibold">SATURDAY, 11 APRIL 2026</p>
                <p className="text-xs opacity-90 mt-1 text-gold-400 font-bold">{sessionTime}</p>
                <div className="border-t border-white/10 my-4" />
                <p className="text-xs font-semibold">The Grand Ballroom, Mulia Hotel</p>
                <p className="text-[11px] opacity-70 mt-1">Jl. Asia Afrika, Senayan, Jakarta</p>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 px-6 py-2 glass-button rounded-full text-xs font-semibold hover:bg-white/30 transition-all"
                >
                  Add to Calendar
                </a>
              </div>
            </section>

            {/* Love Story Section */}
            <section id="lovestory" className="text-center">
              <div className="reanimate fade mb-8">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">Our Journey</p>
                <h3 className="font-display text-4xl mt-1">Love Story</h3>
              </div>

              <div className="space-y-4">
                <div className="reanimate up glass-panel rounded-3xl p-6 text-left relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-0.5 rounded-full bg-gold-400/20 text-gold-400 text-[10px] font-semibold tracking-wider uppercase">2021</span>
                    <h4 className="font-display text-lg text-white">First Encounter</h4>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    A serendipitous meeting at a mutual friend&apos;s gathering sparked endless conversations and a beautiful bond.
                  </p>
                </div>

                <div className="reanimate up delay-100 glass-panel rounded-3xl p-6 text-left relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-0.5 rounded-full bg-gold-400/20 text-gold-400 text-[10px] font-semibold tracking-wider uppercase">2023</span>
                    <h4 className="font-display text-lg text-white">Growing Together</h4>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Through countless shared adventures, late-night talks, and growing together through every season of life.
                  </p>
                </div>

                <div className="reanimate up delay-200 glass-panel rounded-3xl p-6 text-left relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-0.5 rounded-full bg-gold-400/20 text-gold-400 text-[10px] font-semibold tracking-wider uppercase">2025</span>
                    <h4 className="font-display text-lg text-white">The Proposal</h4>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Under the golden sunset of Bali, she whispered &ldquo;Yes&rdquo; to forever with tears of joy.
                  </p>
                </div>
              </div>
            </section>

            {/* Gallery Lightbox Section */}
            <section id="gallery" className="text-center">
              <div className="reanimate fade mb-6">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">Moments</p>
                <h3 className="font-display text-4xl mt-1">Photo Gallery</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ASSETS.gallery.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(img)}
                    className="reanimate up aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Photo Lightbox Modal */}
              {selectedPhoto && (
                <div
                  onClick={() => setSelectedPhoto(null)}
                  className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                  <div className="relative max-w-full max-h-[85vh]">
                    <img src={selectedPhoto} alt="Enlarged view" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm font-bold border border-white/30"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Dress Code Section */}
            <section id="dresscode" className="text-center">
              <div className="reanimate up glass-panel rounded-3xl p-6">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">Guidance</p>
                <h4 className="font-display text-2xl mt-1">Dress Code</h4>
                <p className="text-xs opacity-80 mt-2">Formal Attire / Black Tie / Royal Evening Dress</p>
                <div className="flex justify-center items-center gap-3 mt-4">
                  <div className="w-7 h-7 rounded-full bg-[#1b263b] border border-white/20 shadow-md" title="Navy" />
                  <div className="w-7 h-7 rounded-full bg-[#2d6a4f] border border-white/20 shadow-md" title="Emerald" />
                  <div className="w-7 h-7 rounded-full bg-[#c5a059] border border-white/20 shadow-md" title="Gold" />
                  <div className="w-7 h-7 rounded-full bg-[#000000] border border-white/20 shadow-md" title="Black" />
                </div>
              </div>
            </section>

            {/* Digital Angpao / Gift Accordion Section */}
            <section id="gift" className="text-center">
              <div className="reanimate fade mb-6">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">Blessings</p>
                <h3 className="font-display text-4xl mt-1">Wedding Gift</h3>
              </div>

              <div
                className={`mx-auto rounded-3xl glass-panel transition-all duration-500 overflow-hidden ${
                  giftActive ? "w-full p-6 bg-black/50" : "w-44 py-3 px-6 cursor-pointer hover:bg-white/20"
                }`}
              >
                {!giftActive ? (
                  <div onClick={() => setGiftActive(true)} className="text-xs font-semibold tracking-wider">
                    SEND GIFT 🎁
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-display text-lg text-gold-400">Bank Transfer</h4>
                      <button
                        onClick={() => setGiftActive(false)}
                        className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {/* Bank Card 1 */}
                    <div className="flex items-center justify-between py-3 border-b border-white/10 text-left">
                      <div>
                        <p className="text-xs font-bold">Bank Central Asia (BCA)</p>
                        <p className="text-sm tracking-wider font-mono mt-0.5">8285 1928 31</p>
                        <p className="text-[11px] opacity-70">a/n Hansen Wiratama</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("8285192831", "bca")}
                        className="px-3 py-1.5 glass-button text-xs rounded-lg hover:bg-white/40 cursor-pointer"
                      >
                        {copiedBank === "bca" ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* Bank Card 2 */}
                    <div className="flex items-center justify-between py-3 text-left">
                      <div>
                        <p className="text-xs font-bold">Bank Mandiri</p>
                        <p className="text-sm tracking-wider font-mono mt-0.5">123 00 9876543 2</p>
                        <p className="text-[11px] opacity-70">a/n Kezia Gabriella</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("1230098765432", "mandiri")}
                        className="px-3 py-1.5 glass-button text-xs rounded-lg hover:bg-white/40 cursor-pointer"
                      >
                        {copiedBank === "mandiri" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* RSVP & Live Wishes Feed Section */}
            <section id="rsvp" className="text-center">
              <div className="reanimate fade mb-6">
                <p className="text-xs tracking-[4px] uppercase text-gold-400">Confirmation</p>
                <h3 className="font-display text-4xl mt-1">RSVP &amp; Wishes</h3>
              </div>

              {/* RSVP Form */}
              <form onSubmit={handleRSVPSubmit} className="reanimate up glass-panel rounded-3xl p-6 text-left mb-8">
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider mb-1 opacity-80">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400 placeholder:text-white/40"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider mb-1 opacity-80">Attendance</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Attend", "Cannot Attend"].map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setAttendance(opt)}
                        className={`py-2 text-xs rounded-xl font-semibold border transition-all cursor-pointer ${
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

                {/* Guest Count Stepper */}
                {attendance === "Attend" && (
                  <div className="mb-4">
                    <label className="block text-xs uppercase tracking-wider mb-1 opacity-80">Number of Guests</label>
                    <div className="flex items-center border border-white/20 rounded-xl overflow-hidden bg-white/10">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-12 h-10 text-lg hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center text-xs font-bold">{guestCount} Person</span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(guestCount + 1)}
                        className="w-12 h-10 text-lg hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider mb-1 opacity-80">Warm Wishes</label>
                  <textarea
                    rows={3}
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Send your prayers and blessings..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-400 placeholder:text-white/40"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black font-semibold text-xs tracking-wider rounded-xl uppercase hover:bg-white/90 transition-all shadow-md cursor-pointer"
                >
                  Submit RSVP
                </button>
              </form>

              {/* Wishes Feed */}
              <div className="reanimate up delay-200 glass-panel rounded-3xl p-6 text-left max-h-80 overflow-y-auto space-y-4">
                <h4 className="font-display text-lg text-gold-400 text-center mb-2">Wishes &amp; Prayers</h4>
                {comments.map((c, idx) => (
                  <div key={idx} className="border-b border-white/10 pb-3 last:border-none">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold">{c.name}</p>
                      <span className="text-[10px] opacity-50">{c.time}</span>
                    </div>
                    <p className="text-xs opacity-85 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Closing / Footer Section */}
            <footer className="text-center py-12">
              <p className="text-xs tracking-[3px] uppercase opacity-75">Thank You</p>
              <h2 className="font-display text-4xl mt-2">Hansen &amp; Kezia</h2>
              <p className="text-[10px] tracking-widest mt-8 opacity-40">DESIGNED WITH ELEGANCE &amp; CARE</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
