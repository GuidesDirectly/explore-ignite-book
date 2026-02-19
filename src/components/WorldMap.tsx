import { useEffect, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { motion } from "framer-motion";

interface Feature {
  type: string;
  geometry: { type: string; coordinates: unknown };
  properties: { name: string };
}

const DC = { lon: -77.04, lat: 38.9 };

const expansionDots = [
  { lon: -0.12,   lat: 51.5,  label: "London"    },
  { lon: 2.35,    lat: 48.85, label: "Paris"      },
  { lon: 55.3,    lat: 25.2,  label: "Dubai"      },
  { lon: 72.88,   lat: 19.07, label: "Mumbai"     },
  { lon: 100.5,   lat: 13.75, label: "Bangkok"    },
  { lon: 139.69,  lat: 35.69, label: "Tokyo"      },
  { lon: 151.2,   lat: -33.87,label: "Sydney"     },
  { lon: -46.63,  lat: -23.55,label: "São Paulo"  },
  { lon: 36.82,   lat: -1.28, label: "Nairobi"    },
  { lon: 116.4,   lat: 39.9,  label: "Beijing"    },
];

const WorldMap = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [size, setSize] = useState({ w: 800, h: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load GeoJSON
  useEffect(() => {
    fetch("/world.geojson")
      .then(r => r.json())
      .then(data => setFeatures(data.features ?? []));
  }, []);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  const projection = geoNaturalEarth1()
    .scale(w / 6.3)
    .translate([w / 2, h / 2]);

  const pathGen = geoPath(projection);

  const project = (lon: number, lat: number) => {
    const p = projection([lon, lat]);
    return p ? { x: p[0], y: p[1] } : null;
  };

  const dcPos  = project(DC.lon, DC.lat);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-primary/20 overflow-hidden"
      style={{
        height: 0,
        paddingTop: "50%",
        background: "linear-gradient(180deg,hsl(220,40%,10%) 0%,hsl(215,35%,7%) 100%)",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Graticule grid */}
        {[-60,-30,0,30,60].map(lat => {
          const y0 = project(0, lat);
          const y180 = project(180, lat);
          if (!y0 || !y180) return null;
          return (
            <line key={`lat${lat}`} x1={0} y1={y0.y} x2={w} y2={y0.y}
              stroke="hsl(45,60%,55%)" strokeWidth={lat === 0 ? 0.8 : 0.4} opacity={lat === 0 ? 0.3 : 0.12} />
          );
        })}
        {[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon => {
          const top = project(lon, 80);
          const bot = project(lon, -80);
          if (!top || !bot) return null;
          return (
            <line key={`lon${lon}`} x1={top.x} y1={top.y} x2={bot.x} y2={bot.y}
              stroke="hsl(45,60%,55%)" strokeWidth="0.4" opacity="0.12" />
          );
        })}

        {/* Continents */}
        {features.map((f, i) => {
          const d = pathGen(f as any);
          if (!d) return null;
          return (
            <path
              key={i}
              d={d}
              fill="hsl(var(--primary))"
              fillOpacity="0.55"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.8"
              strokeWidth="0.6"
            />
          );
        })}

        {/* Expansion pulse dots */}
        {expansionDots.map((dot, idx) => {
          const pos = project(dot.lon, dot.lat);
          if (!pos) return null;
          return (
            <g key={dot.label}>
              <circle cx={pos.x} cy={pos.y} r="8" fill="hsl(var(--primary))" opacity="0.15">
                <animate attributeName="r" values="4;14;4" dur={`${2.2 + idx * 0.2}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0;0.3" dur={`${2.2 + idx * 0.2}s`} repeatCount="indefinite"/>
              </circle>
              <circle cx={pos.x} cy={pos.y} r="3.5" fill="hsl(var(--primary))" opacity="0.9"/>
              <circle cx={pos.x} cy={pos.y} r="1.8" fill="hsl(45,90%,80%)"/>
            </g>
          );
        })}

        {/* Washington D.C. marker */}
        {dcPos && (
          <g>
            {/* Outer pulsing ring */}
            <circle cx={dcPos.x} cy={dcPos.y} r="6" fill="hsl(var(--primary))" opacity="0.25">
              <animate attributeName="r" values="5;18;5" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.45;0;0.45" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            {/* Solid gold dot */}
            <circle cx={dcPos.x} cy={dcPos.y} r="5" fill="hsl(var(--primary))"/>
            {/* White center */}
            <circle cx={dcPos.x} cy={dcPos.y} r="2.5" fill="white"/>

            {/* Label pill */}
            <rect
              x={dcPos.x + 8} y={dcPos.y - 12}
              width="102" height="22" rx="11"
              fill="hsl(var(--primary))" opacity="0.95"
            />
            <text
              x={dcPos.x + 59} y={dcPos.y + 3}
              textAnchor="middle"
              fill="hsl(var(--secondary))"
              fontFamily="Georgia,serif"
              fontSize="9"
              fontWeight="bold"
              letterSpacing="0.5"
            >
              ★ Washington D.C.
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default WorldMap;
