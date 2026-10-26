/**
 * Earth Intelligence — Bespoke Cartographic Iconography (icons.js)
 * ================================================================
 * Designed specifically for Earth Intelligence.
 *
 * Visual Philosophy:
 * - Cartographic Modernism: Built on the geometry of topographic surveys,
 *   geodetic benchmarks, photogrammetry reticles, and hydrologic confluence.
 * - Consistent 24x24 drafting grid with refined 1.5px optical stroke weight.
 * - Authentic silhouettes: Every concept has an environmental and geospatial
 *   structural rationale rather than relying on generic SaaS or AI symbols.
 * - Native currentColor inheritance, crisp at 14px, 18px, 24px, and 32px.
 */
'use strict';

const SVG_ICONS = {
  // 1. Earth Intelligence Primary Emblem (The Geodetic Contour Horizon)
  'brand-emblem': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon ei-icon-brand" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M4 15c2.5-1.5 5.5-1 8-2.5s5-3.5 8-4.5"/>
    <path d="M5.5 18c3-1.5 5.5-1 8-2.5 2-.5 4-2 6.5-2.5"/>
    <path d="M11 5.5c-.5 2.5 1 4 2.5 6s3 2.5 4 4.5"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
  </svg>`,

  // 2. Planetary Overview / Orthographic Horizon
  'planetary-overview': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3.2 12h17.6"/>
    <path d="M5.5 7h13M5.5 17h13" stroke-dasharray="1.5 2"/>
    <path d="M12 3c-3 3-4.5 6-4.5 9s1.5 6 4.5 9"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>`,
  'globe': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3.2 12h17.6"/>
    <path d="M5.5 7.5h13M5.5 16.5h13" stroke-dasharray="1.5 2"/>
    <path d="M12 3c-3 3-4.5 6-4.5 9s1.5 6 4.5 9"/>
  </svg>`,
  'grid': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/>
    <line x1="3.5" y1="9" x2="20.5" y2="9"/>
    <line x1="3.5" y1="15" x2="20.5" y2="15"/>
    <line x1="9" y1="3.5" x2="9" y2="20.5"/>
    <line x1="15" y1="3.5" x2="15" y2="20.5"/>
    <circle cx="9" cy="9" r="0.75" fill="currentColor"/>
  </svg>`,

  // 3. Satellite Remote Sensing & Nadir Scanner
  'satellite': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <rect x="9.5" y="7.5" width="5" height="7" rx="0.75"/>
    <line x1="4" y1="11" x2="9.5" y2="11"/>
    <line x1="14.5" y1="11" x2="20" y2="11"/>
    <rect x="3" y="9" width="3" height="4" rx="0.5"/>
    <rect x="18" y="9" width="3" height="4" rx="0.5"/>
    <path d="M11 14.5l-3 6h8l-3-6"/>
    <line x1="6" y1="21.5" x2="18" y2="21.5"/>
  </svg>`,

  // 4. Forest Intelligence / Stratified Canopy Perimeter
  'forest': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M12 3.5c-4 4-7 8-7 12.5a7 7 0 0 0 14 0c0-4.5-3-8.5-7-12.5z"/>
    <path d="M12 9v11"/>
    <path d="M8.5 15c2-1 5-1 7 0"/>
    <line x1="6" y1="20.5" x2="18" y2="20.5"/>
  </svg>`,
  'tree': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M12 3.5c-4 4-7 8-7 12.5a7 7 0 0 0 14 0c0-4.5-3-8.5-7-12.5z"/>
    <line x1="12" y1="11" x2="12" y2="20.5"/>
    <line x1="7" y1="20.5" x2="17" y2="20.5"/>
  </svg>`,

  // 5. River Intelligence / Hydrologic Confluence & Reach
  'river': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M4 4c2.5 3 4 6 3.5 10-.5 3.5 1 5 4.5 6"/>
    <path d="M10 4c2 3 3.5 6 3 9.5-.5 3 1 4.5 4 6.5"/>
    <path d="M18.5 4c-2 2.5-3.5 5-5 8"/>
    <circle cx="4" cy="4" r="1" fill="currentColor"/>
    <circle cx="18.5" cy="4" r="1" fill="currentColor"/>
  </svg>`,
  'droplet': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M12 3.5C8 8.5 6 12 6 15.5a6 6 0 0 0 12 0c0-3.5-2-7-6-12z"/>
    <path d="M9.5 16c0-1.8 1.2-3 2.5-3.5"/>
  </svg>`,

  // 6. Water Quality / Limnological Stratification Column
  'water-quality': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <rect x="6" y="3.5" width="12" height="17" rx="1.5"/>
    <line x1="6" y1="9" x2="18" y2="9"/>
    <line x1="6" y1="14" x2="18" y2="14" stroke-dasharray="1.5 1.5"/>
    <circle cx="10" cy="11.5" r="0.8" fill="currentColor"/>
    <circle cx="14" cy="16.5" r="0.8" fill="currentColor"/>
    <circle cx="12" cy="6.2" r="0.8" fill="currentColor"/>
  </svg>`,

  // 7. Hydropower Dam / Civil Abutment & Spillway
  'dam': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M3.5 8h4"/>
    <path d="M7.5 6h3.5l4.5 13H7.5V6z"/>
    <line x1="15.5" y1="19" x2="20.5" y2="19"/>
    <path d="M10.5 10.5l-2 3h3l-1.5 3"/>
  </svg>`,
  'zap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <polygon points="12.5 3 4.5 13 11 13 10.5 21 18.5 10.5 12 10.5 12.5 3"/>
  </svg>`,

  // 8. Hazard Lens / Geophysical Fault Displacement
  'hazard': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M3.5 6.5h7l2 4h8"/>
    <path d="M3.5 17.5h8l2-4h7"/>
    <line x1="12" y1="3.5" x2="12" y2="7"/>
    <line x1="12" y1="17" x2="12" y2="20.5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>`,
  'alert-triangle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M12 4l8 15H4L12 4z"/>
    <line x1="12" y1="9.5" x2="12" y2="13.5"/>
    <circle cx="12" cy="16.5" r="0.75" fill="currentColor"/>
  </svg>`,
  'alert': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"/>
    <line x1="12" y1="8" x2="12" y2="12.5"/>
    <circle cx="12" cy="15.8" r="0.75" fill="currentColor"/>
  </svg>`,

  // 9. Digital Elevation Model / Topographic Isoline Contours
  'mountain': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M3 19.5c4-2 7.5-1.5 11-2.5 3-.8 4.5-1.5 7-1"/>
    <path d="M4.5 15c3.5-1.5 6.5-1 9.5-2 3-.8 4.5-1.5 6.5-1"/>
    <path d="M7 10.5c2.5-1.5 4.5-2.5 6.5-2.5 2.5 0 3.5 1 5.5 2"/>
    <circle cx="13.5" cy="5.5" r="1.2" fill="currentColor"/>
  </svg>`,

  // 10. Evidence Dossier / Field Survey Record Folio
  'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M5.5 3.5h9l4 4v13H5.5V3.5z"/>
    <path d="M14.5 3.5v4H18.5"/>
    <line x1="8.5" y1="11" x2="14.5" y2="11"/>
    <line x1="8.5" y1="14.5" x2="13.5" y2="14.5"/>
    <line x1="8.5" y1="17.5" x2="11.5" y2="17.5"/>
    <circle cx="15.5" cy="16.5" r="1" fill="currentColor"/>
  </svg>`,
  'fileText': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M5.5 3.5h9l4 4v13H5.5V3.5z"/>
    <path d="M14.5 3.5v4H18.5"/>
    <line x1="8.5" y1="11" x2="14.5" y2="11"/>
    <line x1="8.5" y1="14.5" x2="13.5" y2="14.5"/>
    <circle cx="15.5" cy="16.5" r="1" fill="currentColor"/>
  </svg>`,

  // 11. Multispectral Bands / Isometric Map Sheets
  'layers': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <polygon points="12 3 20 7 12 11 4 7 12 3"/>
    <path d="M4 11.5l8 4 8-4"/>
    <path d="M4 16l8 4 8-4"/>
    <circle cx="12" cy="7" r="0.75" fill="currentColor"/>
  </svg>`,

  // 12. Data Telemetry & Spatial Register Storage
  'database': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <rect x="4.5" y="4" width="15" height="4.5" rx="1"/>
    <rect x="4.5" y="10" width="15" height="4.5" rx="1"/>
    <rect x="4.5" y="16" width="15" height="4.5" rx="1"/>
    <circle cx="7.5" cy="6.2" r="0.75" fill="currentColor"/>
    <circle cx="7.5" cy="12.2" r="0.75" fill="currentColor"/>
    <circle cx="7.5" cy="18.2" r="0.75" fill="currentColor"/>
  </svg>`,
  'radar': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"/>
    <circle cx="12" cy="12" r="4.5" stroke-dasharray="1.5 1.5"/>
    <line x1="12" y1="12" x2="18" y2="6"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>`,

  // 13. AI-Assisted Synthesis / Spatial Focal Convergence
  'sparkles': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <rect x="9.5" y="9.5" width="5" height="5" transform="rotate(45 12 12)"/>
    <line x1="12" y1="3" x2="12" y2="7"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="7" y2="12"/>
    <line x1="17" y1="12" x2="21" y2="12"/>
    <circle cx="12" cy="12" r="0.8" fill="currentColor"/>
  </svg>`,

  // 14. Aerial Photogrammetry Fiducial / Geodetic Reticle
  'crosshair': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="7"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>`,

  // 15. Real-Time Telemetry & Hydrograph Curve
  'activity': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M3 13h4l2.5-6.5 4.5 13 3-8.5 2 2h2"/>
  </svg>`,
  'chart': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <line x1="3.5" y1="20" x2="20.5" y2="20"/>
    <line x1="3.5" y1="4" x2="3.5" y2="20"/>
    <path d="M5.5 16c3-1 5.5-5 8-5 2.5 0 3.5-3 5-5"/>
    <circle cx="18.5" cy="6" r="1" fill="currentColor"/>
  </svg>`,

  // 16. Perimeter Defense & Rate Limiter Shield
  'shield': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M12 3l7 3v6.5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V6l7-3z"/>
    <circle cx="12" cy="11.5" r="1.5" fill="currentColor"/>
  </svg>`,
  'shieldCheck': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M12 3l7 3v6.5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V6l7-3z"/>
    <polyline points="9 11.5 11 13.5 15 9.5"/>
  </svg>`,

  // 17. Cartographic Loupe / Geo Search
  'search': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5"/>
    <line x1="15.2" y1="15.2" x2="20.5" y2="20.5"/>
    <circle cx="10.5" cy="10.5" r="1" fill="currentColor"/>
  </svg>`,

  // 18. Surveyor Benchmark Needle
  'pin': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="8.5" r="5"/>
    <circle cx="12" cy="8.5" r="1.5" fill="currentColor"/>
    <line x1="12" y1="13.5" x2="12" y2="21"/>
    <line x1="8.5" y1="21" x2="15.5" y2="21"/>
  </svg>`,
  'map-pin': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="8.5" r="5"/>
    <circle cx="12" cy="8.5" r="1.5" fill="currentColor"/>
    <line x1="12" y1="13.5" x2="12" y2="21"/>
    <line x1="8.5" y1="21" x2="15.5" y2="21"/>
  </svg>`,

  // 19. Export Dossier Extraction
  'download': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M4.5 14v5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-5"/>
    <line x1="12" y1="3.5" x2="12" y2="14"/>
    <polyline points="8 10 12 14 16 10"/>
  </svg>`,

  // 20. Verification Seal
  'check': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
  'check-circle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"/>
    <polyline points="8 12 10.8 14.8 16 9.2"/>
  </svg>`,
  'checkCircle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"/>
    <polyline points="8 12 10.8 14.8 16 9.2"/>
  </svg>`,

  // 21. Modal & Navigation Crop Cross
  'close': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <line x1="16.5" y1="7.5" x2="7.5" y2="16.5"/>
    <line x1="7.5" y1="7.5" x2="16.5" y2="16.5"/>
  </svg>`,
  'x': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <line x1="16.5" y1="7.5" x2="7.5" y2="16.5"/>
    <line x1="7.5" y1="7.5" x2="16.5" y2="16.5"/>
  </svg>`,

  // 22. Geodetic Datum & Info Point
  'info': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"/>
    <circle cx="12" cy="8" r="0.8" fill="currentColor"/>
    <line x1="12" y1="11" x2="12" y2="16"/>
  </svg>`,

  // 23. Survey Recalibration Cycle
  'refresh': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M19.5 11A7.5 7.5 0 0 0 5 8M5 4.5v4h4"/>
    <path d="M4.5 13a7.5 7.5 0 0 0 14.5 3M19 19.5v-4h-4"/>
  </svg>`,

  // 24. Atmospheric & Isobaric Dynamics
  'wind': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M16 8a2 2 0 1 1 1.7 3H3"/>
    <path d="M10 5a1.8 1.8 0 1 1 1.5 2.5H3"/>
    <path d="M13 19a2 2 0 1 0 1.7-3H3"/>
  </svg>`,
  'rain': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M18.5 14.5A4 4 0 0 0 17 7h-1A6.5 6.5 0 1 0 5 13.5"/>
    <line x1="8.5" y1="16.5" x2="7.5" y2="20.5"/>
    <line x1="12.5" y1="16.5" x2="11.5" y2="20.5"/>
    <line x1="16.5" y1="16.5" x2="15.5" y2="20.5"/>
  </svg>`,
  'thermometer': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M13.5 14V4.5a1.5 1.5 0 0 0-3 0V14a3.5 3.5 0 1 0 3 0z"/>
    <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
  </svg>`,

  // 25. Settings & Botanical Seedling
  'settings': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12h2.5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>
  </svg>`,
  'sprout': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ei-icon" aria-hidden="true">
    <path d="M5.5 20.5h13"/>
    <path d="M12 20.5v-9"/>
    <path d="M12 11.5c-3-2-4.5 0-5.5-4 3-.5 5.5 1 5.5 4z"/>
    <path d="M12 10c3-2 4.5 0 5.5-4-3-.5-5.5 1-5.5 4z"/>
  </svg>`
};

/**
 * Returns raw SVG markup for a given icon name with optional sizing and custom CSS classes.
 * @param {string} name - Registered icon identifier.
 * @param {number|string} [sizeOrClass] - Size in pixels (e.g. 14, 18, 24) or extra CSS classes.
 * @returns {string} Clean SVG markup.
 */
function getIcon(name, sizeOrClass = '') {
  let key = name || 'info';
  if (key === 'fileText') key = 'file-text';
  if (key === 'mapPin') key = 'map-pin';
  if (key === 'checkCircle') key = 'check-circle';
  if (key === 'alertTriangle') key = 'alert-triangle';

  const iconMarkup = SVG_ICONS[key] || SVG_ICONS[name] || SVG_ICONS.info;

  if (typeof sizeOrClass === 'number') {
    return iconMarkup.replace('class="ei-icon', `style="width:${sizeOrClass}px;height:${sizeOrClass}px;" class="ei-icon`);
  }
  if (typeof sizeOrClass === 'string' && sizeOrClass.trim()) {
    return iconMarkup.replace('class="ei-icon"', `class="ei-icon ${sizeOrClass.trim()}"`);
  }
  return iconMarkup;
}

// Global browser runtime exposure
if (typeof window !== 'undefined') {
  window.EarthIcons = {
    get: getIcon,
    icons: SVG_ICONS,
    renderAll: function (root = document) {
      root.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.getAttribute('data-icon');
        const customClass = el.getAttribute('data-icon-class') || '';
        el.innerHTML = getIcon(name, customClass);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.EarthIcons.renderAll());
  } else {
    window.EarthIcons.renderAll();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SVG_ICONS, getIcon };
}
