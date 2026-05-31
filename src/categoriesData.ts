export interface PredefinedCategory {
  id: string;
  label: string;
  icon: string;
  query: string;
  desc: string;
  tools: string[];
}

export const POPULAR_10_CATEGORIES: PredefinedCategory[] = [
  {
    id: "baker",
    label: "Professional Baker",
    icon: "🍞",
    query: "home bakery and baking business",
    desc: "Baking pastries, artisanal breads, custom decorative cakes, and pastries for local catering or pre-ordered cafe delivery.",
    tools: ["Commercial Convection Oven", "Planetary Stand Mixer (7-10 Qt)", "Heavy-duty Cooling Racks & Baking Sheets", "Stainless Steel Prep Counters", "Digital Portion Scales & Thermometers"]
  },
  {
    id: "writer",
    label: "Freelance Writer",
    icon: "✍️",
    query: "freelance writer and editor",
    desc: "Authoring commercial blog content, SEO articles, ghostwriting novels, technical whitepapers, and dynamic marketing copy.",
    tools: ["Mechanical Tactile Keyboard", "Grammarly/ProWritingAid Premium Subscriptions", "Color-Calibrated Multi-Monitor Setup", "Dual-band Wi-Fi Router (Backup Cellular Device)", "Ergonomic Desk & Active Seat"]
  },
  {
    id: "photographer",
    label: "Commercial Photographer",
    icon: "📷",
    query: "commercial event photographer",
    desc: "Shooting high-resolution promotional materials, fashion editorials, real estate listings, and professional portraits.",
    tools: ["Mirrorless Digital Camera Body (Sony/Canon)", "Wide-aperture Zoom (24-70mm f/2.8) & Prime Lenses", "Wireless Flash Transmitter & Softbox Kits", "Carbon Fiber Professional Tripod Setup", "Adobe Creative Cloud Suite Subscription"]
  },
  {
    id: "tutor",
    label: "Online Tutor",
    icon: "💻",
    query: "online tutor and remote teacher",
    desc: "Providing virtual academic support, language coaching, vocational training, and standardized test preparations globally.",
    tools: ["External Active Digital Stylus / Writing Tablet", "Noise-canceling Headset with Microphone", "Full-HD Autofocus USB Web Camera", "Professional Video Conferencing Platform", "Adjustable Table Ring Light Panel"]
  },
  {
    id: "dropshipping",
    label: "Dropshipping Store Owner",
    icon: "🛒",
    query: "e-commerce dropshipping store business",
    desc: "Curating high-conversion consumer goods storefronts, coordinating online fulfillment, and running social media marketing pipelines.",
    tools: ["Shopify Store Builder Subscription", "Ad Assets Creator Software (Canva Pro/Figma)", "Auto-fulfillment Integration Engine", "Multichannel Support Ticket Inbox", "Domain Hosting & Security Certificates"]
  },
  {
    id: "app_developer",
    label: "App Developer",
    icon: "📱",
    query: "freelance mobile app developer",
    desc: "Engineering custom native iOS & Android solutions, API integrations, secure user systems, and client software architectures.",
    tools: ["Advanced Workstation (Apple Silicon/M-series Preferred)", "Physical Test Mobile Hardware", "Annual App Store & Play Console Accreditations", "Cloud Backend Server / Database Subscriptions", "Version Control Platform Licenses (GitHub/GitLab)"]
  },
  {
    id: "graphic_designer",
    label: "Graphic Designer",
    icon: "🎨",
    query: "brand graphic designer studio",
    desc: "Drafting unique brand style guides, logo arrays, vector layouts, packaging templates, and promotional print media.",
    tools: ["Pressure-sensitive Graphic Pen Tablet", "Full Vector Illustration Software Subscription", "Wide-gamut Color-Calibrated Display", "External Storage Safe (Thunderbolt SSD RAID)", "Asset Stock Subscription Account"]
  },
  {
    id: "social_media",
    label: "Social Media Manager",
    icon: "📣",
    query: "social media marketing manager agent",
    desc: "Planning monthly content calendars, designing visual layout feeds, configuring targeted ads, and scheduling across networks.",
    tools: ["Content Scheduling Framework Suite (Buffer/Hootsuite)", "Asset Mockup Software", "High-Resolution Phone Camera & Multi-Axis Gimbal", "LED Ring Light & Dual Clip-on Lapel Mics", "Social Analytics Analytics Suite"]
  },
  {
    id: "virtual_assistant",
    label: "Virtual Assistant",
    icon: "💼",
    query: "remote virtual assistant agent",
    desc: "Supporting business stakeholders with administrative support, calendar bookings, inbound billing, and custom client workflows.",
    tools: ["Calendar Integration Tool Suite", "Secure Enterprise Email Client", "Cloud Storage Volume System", "Dynamic Task Manager Plan (Asana/Trello)", "e-Signature Service Plan"]
  },
  {
    id: "youtuber",
    label: "YouTuber / Video Creator",
    icon: "🎥",
    query: "youtuber video creator and streamer",
    desc: "Developing entertainment, tech reviews, stream content, and educational videos for sponsorship and monetization.",
    tools: ["4K Video Capture Unit (Internal Autofocus)", "Studio-grade Shotgun Cardioid Microphone", "Bi-color LED Studio Key Lights", "High-performance Desktop Editing Workstation", "Acoustic Wall Foam Dampening Panels"]
  }
];
