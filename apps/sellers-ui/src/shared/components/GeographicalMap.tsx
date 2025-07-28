"use client";

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import {motion, AnimatePresence} from 'framer-motion';



const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryData = [
    { name: 'United States of America', users: 120 ,sellers: 30},
    { name: 'Canada', users: 80, sellers: 20 },
    { name: 'Mexico', users: 60, sellers: 15 },
    { name: 'United Kingdom', users: 100, sellers: 25 },
    { name: 'Germany', users: 90, sellers: 22 },
    {name :'India', users: 200, sellers: 50},
    { name: 'China', users: 300, sellers: 70 },
];

const getColor = (counryName :string) => {
    const country = countryData.find(country => country.name === counryName);
    if (!country) return '#1e293b'; 
    const total = country.users + country.sellers;
    if (total > 100) return '#22c55e';
    if (total > 0) return '#3b82f6';
    return '#1e293b';
}

const GeographicalMap = () => {
    const [hovered, setHovered] = useState<{name:string; users:number; sellers:number;}|null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{x: number; y: number}>({x: 0, y: 0});


  return (
    <div className='relative w-full px-0 py-5 overflow-visible'>
        <ComposableMap
            projectionConfig={{ scale: 230, center: [0, 10] }}
            projection={"geoEqualEarth"}
            width={1400}
            height={500}
            viewBox='0 0 1400 500'
            preserveAspectRatio='xMidYMid slice'
            style={{
                width: "100%",
                height: "auto",
                maxHeight: "500px",
                background: "transparent",
                margin: "0",
                padding: "0",
                display: "block",
            }}
        >
            <Geographies geography={geoUrl}>
                {({ geographies }) =>
                    geographies.map((geo) => {
                        const countryName = geo.properties.name;
                        const match = countryData.find(country => country.name === countryName);
                        const baseColor = getColor(countryName) ;
                        return (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={baseColor}
                                onMouseEnter={(e) => {
                                    setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10});
                                    setHovered({
                                        name: countryName,
                                        users: match ? match.users : 0,
                                        sellers: match ? match.sellers : 0,
                                    });
                                }}
                                onMouseMove={(e) => {
                                    setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
                                }}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    default: { outline: "none", transition: "fill 0.3s ease-in-out" ,stroke: "#0f172a",strokeWidth: 0.5 },
                                    hover: { fill: match ? baseColor : "#facc15", outline: "none" , transition: "fill 0.3s ease-in-out", stroke: "#facc15", strokeWidth: 1 },
                                    pressed: { fill: "#ef4444", outline: "none" },
                                }}
                            />
                        );
                    })
                }
            </Geographies>
        </ComposableMap>

        <AnimatePresence>
            {hovered && (
                <motion.div
                    key={hovered.name}
                    className='fixed bg-gray-800 text-white text-xs p-3 rounded shadow-lg z-50'
                    style={{
                        top: tooltipPosition.y ,
                        left: tooltipPosition.x ,
                    }}
                    initial={{ opacity: 0, y: 0.95 }}
                    animate={{ opacity: 1, y: 1 }}
                    exit={{ opacity: 0, y: 0.95 }}
                    transition={{ duration: 0.15 , ease: "easeInOut" }}
                >
                    <strong>{hovered.name}</strong><br />
                    Users: <span className='text-green-400'> {hovered.users}</span><br />
                    Sellers: <span className='text-yellow-400'> {hovered.sellers}</span>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

export default GeographicalMap;