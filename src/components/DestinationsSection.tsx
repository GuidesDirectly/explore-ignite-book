import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import nycImg from "@/assets/city-cards/nyc.jpg";
import phillyImg from "@/assets/city-cards/philadelphia.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";
import bostonImg from "@/assets/city-cards/boston.jpg";
import phoenixImg from "@/assets/city-cards/phoenix.jpg";
import laImg from "@/assets/city-cards/los-angeles.jpg";
import sfImg from "@/assets/city-cards/san-francisco.jpg";
import sanDiegoImg from "@/assets/city-cards/san-diego.jpg";
import denverImg from "@/assets/city-cards/denver.jpg";
import vegasImg from "@/assets/city-cards/las-vegas.jpg";
import houstonImg from "@/assets/city-cards/houston.jpg";
import sanAntonioImg from "@/assets/city-cards/san-antonio.jpg";
import miamiImg from "@/assets/city-cards/miami.jpg";
import torontoImg from "@/assets/city-cards/toronto.jpg";
import montrealImg from "@/assets/city-cards/montreal.jpg";

const expansionCities = [
  { name: "New York City", abbr: "NYC", photo: nycImg, accent: "#e94560" },
  { name: "Philadelphia", abbr: "PHL", photo: phillyImg, accent: "#52b788" },
  { name: "Chicago", abbr: "CHI", photo: chicagoImg, accent: "#5dade2" },
  { name: "Boston", abbr: "BOS", photo: bostonImg, accent: "#f1948a" },
  { name: "Phoenix", abbr: "PHX", photo: phoenixImg, accent: "#f39c12" },
  { name: "Los Angeles", abbr: "LAX", photo: laImg, accent: "#ff6b9d" },
  { name: "San Francisco", abbr: "SFO", photo: sfImg, accent: "#f39c12" },
  { name: "San Diego", abbr: "SAN", photo: sanDiegoImg, accent: "#90e0ef" },
  { name: "Denver", abbr: "DEN", photo: denverImg, accent: "#a5d6a7" },
  { name: "Las Vegas", abbr: "LAS", photo: vegasImg, accent: "#ffd700" },
  { name: "Houston", abbr: "HOU", photo: houstonImg, accent: "#ffd966" },
  { name: "San Antonio", abbr: "SAT", photo: sanAntonioImg, accent: "#e8a87c" },
  { name: "Miami", abbr: "MIA", photo: miamiImg, accent: "#80deea" },
  { name: "Toronto", abbr: "YYZ", photo: torontoImg, accent: "#ff8a80" },
  { name: "Montreal", abbr: "YUL", photo: montrealImg, accent: "#7986cb" },
];




const DestinationsSection = () => {
  return (
    <section id="destinations" className="bg-background overflow-hidden">

      {/* ── Section 1: Origin Story ── */}
      <div className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-8">
              <MapPin className="w-3.5 h-3.5" />
              Where We Started
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
              From the USA Capital<br />
              <span className="text-primary italic">to the Continent.</span>
            </h2>

            <p className="text-secondary-foreground/70 text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
              We are working hard to perfect our <span className="text-primary font-semibold">"Direct Connection"</span> model through our rigorous pilot launch in Washington D.C. Through testing every variable in the U.S. capital, we are developing the{" "}
              <span className="text-primary font-semibold">Launch-City Playbook</span>—a blueprint for transparent, commission-free travel.
            </p>

            {/* Blockquote */}
            <motion.blockquote
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative border-l-4 border-primary pl-6 py-4 text-left max-w-2xl mx-auto mt-10"
            >
              <div className="font-display text-3xl text-primary/30 absolute -top-2 -left-1">"</div>
              <p className="font-display text-lg md:text-xl italic text-secondary-foreground/80 leading-relaxed">
                D.C. isn't just our first city; it is our laboratory in which we'll prove that travelers prefer direct access — and guides deserve 100% of their earnings.
              </p>
            </motion.blockquote>

            {/* DC Stats */}
            <div className="grid grid-cols-3 gap-6 mt-14 max-w-xl mx-auto">
              {[
                { value: "25+", label: "Verified Guides" },
                { value: "100%", label: "Direct Earnings" },
                { value: "$0", label: "Commission Taken" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-secondary-foreground/60 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Section 2: Expansion Grid ── */}
      <div className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-6">
              <Zap className="w-3.5 h-3.5" />
              Scaling Excellence
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              City After City.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              After achieving a full success of our D.C. pilot, we'll begin systematically deploying our playbook across North America's most iconic destinations.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {expansionCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group relative rounded-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden aspect-square"
              >
                {/* City photo */}
                <img
                  src={city.photo}
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient overlay — always visible at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* City name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <p className="font-display font-bold text-white text-xs leading-tight text-center drop-shadow-lg">
                    {city.name}
                  </p>
                  <p className="text-[10px] text-center mt-0.5 font-mono opacity-70" style={{ color: city.accent }}>{city.abbr}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl bg-black/75 backdrop-blur-sm z-20">
                  <p className="font-display text-white font-bold text-xs text-center mb-2 leading-tight">
                    Guides Directly<br />Playbook
                  </p>
                  <div className="space-y-1">
                    {["Verified Guides", "Zero Commissions"].map((item) => (
                      <div key={item} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: city.accent }} />
                        <span className="text-[10px] font-semibold" style={{ color: city.accent }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Global Horizon ── */}
      <div className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-6">
              <Globe className="w-3.5 h-3.5" />
              The Global Horizon
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
              The World is Next.
            </h2>
            <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
              Our infrastructure is built for every border. We are currently identifying local leaders to adapt our Launch-City Playbook for international markets.
            </p>
          </motion.div>

          {/* Stylized World Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Map background — equirectangular projection 1000×500 */}
            <div className="relative rounded-2xl border border-primary/20 overflow-hidden" style={{ paddingTop: "50%", background: "hsl(var(--secondary))" }}>

              {/* Ocean base */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(220,35%,12%) 0%, hsl(220,30%,8%) 100%)" }} />

              {/* Latitude / longitude grid */}
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 500">
                {[10,20,30,40,50,60,70,80].map(lat => (
                  <line key={lat} x1="0" y1={(90-lat)*500/180} x2="1000" y2={(90-lat)*500/180} stroke="hsl(var(--primary))" strokeWidth="0.6"/>
                ))}
                {[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon => (
                  <line key={lon} x1={(lon+180)*1000/360} y1="0" x2={(lon+180)*1000/360} y2="500" stroke="hsl(var(--primary))" strokeWidth="0.6"/>
                ))}
                {/* Equator highlighted */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.4"/>
              </svg>

              {/* ── Accurate continent paths (equirectangular, viewBox 1000×500) ── */}
              {/* lon→x: (lon+180)×(1000/360)  |  lat→y: (90−lat)×(500/180) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* ── NORTH AMERICA ── */}
                <path
                  d="M 83,56  L 94,44  L 108,38  L 125,36  L 142,40  L 155,50
                     L 162,55  L 168,62  L 172,52  L 185,42  L 200,38  L 215,36
                     L 228,40  L 238,50  L 242,62  L 240,75  L 232,85  L 222,92
                     L 210,98  L 198,105 L 190,115 L 188,125 L 192,132 L 200,138
                     L 206,148 L 208,158 L 205,168 L 200,176 L 195,184 L 190,192
                     L 186,200 L 182,208 L 178,215 L 175,222 L 172,230 L 168,235
                     L 165,230 L 162,222 L 158,215 L 154,208 L 150,200 L 148,192
                     L 146,182 L 148,172 L 152,162 L 155,152 L 152,142 L 146,135
                     L 138,128 L 130,122 L 120,118 L 110,115 L 102,110 L 96,102
                     L 90,92  L 85,80  L 82,68  Z"
                  fill="hsl(var(--primary))" opacity="0.45"
                />
                {/* Alaska */}
                <path
                  d="M 28,72  L 38,65  L 50,60  L 62,58  L 72,60  L 80,65
                     L 83,72  L 78,80  L 68,85  L 55,85  L 42,82  L 32,78  Z"
                  fill="hsl(var(--primary))" opacity="0.4"
                />
                {/* Greenland */}
                <path
                  d="M 228,28  L 248,22  L 268,22  L 282,28  L 288,38  L 285,50
                     L 275,58  L 260,62  L 245,60  L 232,52  L 225,42  Z"
                  fill="hsl(var(--primary))" opacity="0.32"
                />
                {/* Central America narrow strip */}
                <path
                  d="M 168,235 L 172,242 L 174,250 L 172,258 L 168,264
                     L 164,258 L 162,250 L 164,242 Z"
                  fill="hsl(var(--primary))" opacity="0.4"
                />
                {/* Cuba */}
                <path d="M 198,200 L 210,198 L 218,202 L 215,208 L 205,210 L 196,206 Z"
                  fill="hsl(var(--primary))" opacity="0.3"
                />

                {/* ── SOUTH AMERICA ── */}
                <path
                  d="M 172,258 L 182,252 L 195,250 L 208,252 L 220,258 L 228,268
                     L 232,280 L 234,295 L 232,310 L 228,325 L 220,340 L 210,352
                     L 198,360 L 186,358 L 175,350 L 165,338 L 158,322 L 154,305
                     L 154,288 L 157,272 L 163,262 L 168,255 Z"
                  fill="hsl(var(--primary))" opacity="0.45"
                />

                {/* ── EUROPE ── */}
                <path
                  d="M 422,62  L 432,55  L 445,50  L 458,50  L 470,54  L 480,62
                     L 486,72  L 485,82  L 478,90  L 468,96  L 456,100 L 448,108
                     L 445,118 L 440,120 L 435,112 L 430,102 L 425,92  L 420,82
                     L 418,72  Z"
                  fill="hsl(var(--primary))" opacity="0.45"
                />
                {/* Iberian Peninsula */}
                <path
                  d="M 418,100 L 428,96  L 436,100 L 438,110 L 432,118 L 422,120
                     L 415,112 L 415,104 Z"
                  fill="hsl(var(--primary))" opacity="0.4"
                />
                {/* Scandinavia */}
                <path
                  d="M 450,38  L 462,28  L 474,24  L 484,28  L 488,38  L 485,50
                     L 475,56  L 462,56  L 452,50  Z"
                  fill="hsl(var(--primary))" opacity="0.38"
                />
                {/* Great Britain */}
                <path
                  d="M 408,60  L 416,55  L 422,60  L 420,70  L 414,74  L 407,68  Z"
                  fill="hsl(var(--primary))" opacity="0.35"
                />
                {/* Italy boot */}
                <path
                  d="M 458,98  L 466,100 L 470,110 L 468,120 L 462,126 L 456,120
                     L 455,110 Z"
                  fill="hsl(var(--primary))" opacity="0.38"
                />

                {/* ── AFRICA ── */}
                <path
                  d="M 428,120 L 445,115 L 462,115 L 478,118 L 490,125 L 498,135
                     L 502,148 L 503,162 L 502,178 L 498,195 L 492,212 L 482,228
                     L 470,242 L 456,252 L 442,256 L 428,252 L 416,240 L 408,225
                     L 404,208 L 404,190 L 408,172 L 415,155 L 422,140 L 425,130  Z"
                  fill="hsl(var(--primary))" opacity="0.45"
                />
                {/* Madagascar */}
                <path
                  d="M 510,200 L 518,194 L 525,200 L 524,216 L 518,224 L 510,218  Z"
                  fill="hsl(var(--primary))" opacity="0.32"
                />

                {/* ── ASIA (connected Eurasia landmass) ── */}
                {/* Russia / Northern Asia */}
                <path
                  d="M 486,42  L 510,35  L 545,28  L 590,25  L 640,25  L 690,28
                     L 735,32  L 768,40  L 785,52  L 782,65  L 770,75  L 752,82
                     L 728,88  L 700,92  L 668,92  L 638,90  L 608,88  L 578,86
                     L 550,84  L 522,82  L 500,78  L 488,68  L 484,55  Z"
                  fill="hsl(var(--primary))" opacity="0.42"
                />
                {/* Central/South Asia */}
                <path
                  d="M 500,78  L 528,82  L 558,86  L 590,88  L 622,90  L 655,92
                     L 688,92  L 715,90  L 738,85  L 755,82  L 762,92  L 760,105
                     L 750,118 L 735,128 L 718,136 L 700,142 L 680,148 L 658,152
                     L 638,152 L 618,148 L 600,142 L 582,135 L 566,126 L 555,115
                     L 548,105 L 542,95  L 532,88  L 518,85  L 504,85  Z"
                  fill="hsl(var(--primary))" opacity="0.42"
                />
                {/* Middle East */}
                <path
                  d="M 488,95  L 505,90  L 522,90  L 540,95  L 552,105 L 555,118
                     L 548,128 L 535,132 L 520,130 L 506,122 L 494,112 L 487,102  Z"
                  fill="hsl(var(--primary))" opacity="0.42"
                />
                {/* Indian subcontinent */}
                <path
                  d="M 568,138 L 585,135 L 600,138 L 610,148 L 615,162 L 612,178
                     L 604,192 L 594,200 L 582,198 L 572,188 L 565,174 L 563,158  Z"
                  fill="hsl(var(--primary))" opacity="0.42"
                />
                {/* Southeast Asia peninsula */}
                <path
                  d="M 648,148 L 668,148 L 685,152 L 695,162 L 692,175 L 682,182
                     L 668,180 L 656,172 L 648,162  Z"
                  fill="hsl(var(--primary))" opacity="0.4"
                />
                {/* Indonesia/Philippines islands */}
                <path
                  d="M 700,185 L 720,180 L 740,182 L 755,188 L 758,198 L 745,205
                     L 726,205 L 708,200 L 698,192  Z"
                  fill="hsl(var(--primary))" opacity="0.35"
                />
                <path
                  d="M 760,178 L 775,172 L 790,175 L 795,185 L 788,195 L 772,196
                     L 760,190  Z"
                  fill="hsl(var(--primary))" opacity="0.32"
                />
                {/* Japan */}
                <path
                  d="M 762,70  L 775,65  L 785,68  L 790,78  L 785,90  L 772,95
                     L 760,90  L 758,80  Z"
                  fill="hsl(var(--primary))" opacity="0.38"
                />
                {/* Sri Lanka */}
                <path d="M 594,202 L 600,200 L 604,206 L 600,214 L 594,210 Z"
                  fill="hsl(var(--primary))" opacity="0.32"
                />

                {/* ── AUSTRALIA ── */}
                <path
                  d="M 712,288 L 738,275 L 765,268 L 792,268 L 815,275 L 830,288
                     L 838,305 L 835,322 L 822,335 L 805,342 L 785,345 L 762,342
                     L 740,332 L 722,318 L 710,302  Z"
                  fill="hsl(var(--primary))" opacity="0.45"
                />
                {/* New Zealand */}
                <path
                  d="M 850,322 L 860,315 L 868,320 L 866,335 L 858,342 L 850,336  Z"
                  fill="hsl(var(--primary))" opacity="0.35"
                />
                <path
                  d="M 855,348 L 863,342 L 870,348 L 868,360 L 858,364 L 852,358  Z"
                  fill="hsl(var(--primary))" opacity="0.32"
                />

                {/* ── WASHINGTON D.C. MARKER (77°W, 38.9°N → x≈286, y≈142) ── */}
                {/* Pulsing ring */}
                <circle cx="286" cy="142" r="12" fill="hsl(var(--primary))" opacity="0.2">
                  <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                {/* Solid dot */}
                <circle cx="286" cy="142" r="5" fill="hsl(var(--primary))" filter="url(#glow)"/>
                <circle cx="286" cy="142" r="3" fill="white"/>

                {/* DC label */}
                <rect x="292" y="130" width="90" height="22" rx="11" fill="hsl(var(--primary))" opacity="0.92"/>
                <text x="337" y="145" textAnchor="middle" fill="hsl(var(--secondary))"
                  fontFamily="serif" fontSize="9" fontWeight="bold" letterSpacing="0.5">
                  ★ Washington D.C.
                </text>

                {/* Expansion pulse dots — Europe, Middle East, Asia, South America */}
                {[
                  { cx: 448, cy: 72,  label: "London" },
                  { cx: 454, cy: 80,  label: "Paris" },
                  { cx: 496, cy: 105, label: "Dubai" },
                  { cx: 590, cy: 165, label: "Mumbai" },
                  { cx: 700, cy: 125, label: "Bangkok" },
                  { cx: 770, cy: 82,  label: "Tokyo" },
                  { cx: 785, cy: 295, label: "Sydney" },
                  { cx: 205, cy: 290, label: "São Paulo" },
                  { cx: 456, cy: 200, label: "Nairobi" },
                ].map((pt, idx) => (
                  <g key={pt.label}>
                    <circle cx={pt.cx} cy={pt.cy} r="6" fill="hsl(var(--primary))" opacity="0.2">
                      <animate attributeName="r" values="4;12;4" dur={`${2 + idx * 0.3}s`} repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.35;0;0.35" dur={`${2 + idx * 0.3}s`} repeatCount="indefinite"/>
                    </circle>
                    <circle cx={pt.cx} cy={pt.cy} r="3" fill="hsl(var(--primary))" opacity="0.9"/>
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-secondary-foreground/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-primary" />
                <span>Washington D.C. — Launch City</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/80" />
                <span>Expansion Horizon</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <a
              href="#inquiry"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity duration-200 text-base"
            >
              View Our Global Expansion Roadmap
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── Section 4: Dual CTA ── */}
      <div className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Column A — For Guides */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-secondary text-secondary-foreground rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">For Professionals</div>
                <h3 className="font-display text-3xl font-bold text-secondary-foreground mb-4">
                  Own Your Business.
                </h3>
                <p className="text-secondary-foreground/70 leading-relaxed mb-8">
                  Are you a local expert in a city we haven't reached yet? We provide the platform and the playbook; you provide the expertise. Join the world's only commission-free professional network.
                </p>
                <div className="space-y-2 mb-8">
                  {["Zero commissions — ever", "Your price, your rules", "Direct traveler relationships"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-secondary-foreground/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/guide-register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-200 w-full text-center"
              >
                Apply to Pilot Your City
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Column B — For Travelers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">For Explorers</div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-4">
                  Travel Without<br />the Middleman.
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Stop paying 20–30% markups to booking platforms. Connect directly with the people who know the city best. Worldwide expansion is underway — see where we're landing next.
                </p>
                <div className="space-y-2 mb-8">
                  {["No booking fees", "Real local experts", "Custom flexible tours"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="#inquiry"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-200 w-full text-center"
              >
                Explore Commission-Free Tours
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Value Ribbon ── */}
      <div className="bg-primary py-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-primary-foreground text-center">
            <div>
              <span className="font-display text-xs uppercase tracking-[0.25em] opacity-70 block">The Guides Directly Promise</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-primary-foreground/30" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 items-center font-semibold text-sm">
              <span>$0 Booking Fees</span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span>100% Direct to Guides</span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span>100% Authentic for Travelers</span>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default DestinationsSection;
