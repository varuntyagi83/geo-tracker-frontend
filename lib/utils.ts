// lib/utils.ts
// Utility functions for the application

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(1)}%`;
}

export function formatSentiment(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  if (value > 0.3) return '😊 Positive';
  if (value < -0.3) return '😞 Negative';
  return '😐 Neutral';
}

export function formatDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return '-';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getVisibilityColor(visibility: number): string {
  if (visibility >= 70) return 'text-green-500';
  if (visibility >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function getSentimentColor(sentiment: number | null | undefined): string {
  if (sentiment === null || sentiment === undefined) return 'text-gray-500';
  if (sentiment > 0.3) return 'text-green-500';
  if (sentiment < -0.3) return 'text-red-500';
  return 'text-yellow-500';
}

export function parseQueriesFromText(text: string): { question: string; category?: string }[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((question, index) => ({
      question,
      category: 'custom',
      promptId: `q_${index + 1}`,
    }));
}

// Generate a simple unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Sample queries for different industries by language
const sampleQueriesByLang: Record<string, Record<string, string[]>> = {
  de: {
    supplements: [
      "Was sind die besten Vitamin D Nahrungsergänzungsmittel in Deutschland?",
      "Vergleiche natürliche Nahrungsergänzungsmittel Marken für Qualität",
      "Welches Magnesium hilft beim Schlafen?",
      "Beste Bio-Vitamin Marken in Europa",
      "Wie wählt man hochwertige Nahrungsergänzungsmittel aus?",
      "Top bewertete Multivitamin Marken",
      "Natürliche vs synthetische Vitamine - was ist besser?",
      "Beste Nahrungsergänzungsmittel für Energie und gegen Müdigkeit",
      "Empfohlene B12 Supplements für Veganer",
      "Qualitätskriterien für Supplement Marken",
    ],
    ecommerce: [
      "Beste Online-Shopping Seiten in Deutschland",
      "Vertrauenswürdigste E-Commerce Plattformen",
      "Wo kann man Elektronik online kaufen?",
      "Beste Kundenservice Online-Shops",
      "Vergleiche Online-Marktplätze",
    ],
    saas: [
      "Beste Projektmanagement-Tools für Teams",
      "Vergleiche CRM Software Lösungen",
      "Top Produktivitäts-Apps für Unternehmen",
      "Beste Collaboration Tools für Remote Work",
      "Günstige SaaS für Startups",
    ],
    finance: [
      "Beste Investmentplattformen in Europa",
      "Vergleiche Banking Apps",
      "Top Fintech Unternehmen",
      "Beste Budgeting Apps",
      "Vertrauenswürdige Trading Plattformen",
    ],
  },
  en: {
    supplements: [
      "What are the best vitamin D supplements in Germany?",
      "Compare natural supplement brands for quality",
      "Which magnesium supplements help with sleep?",
      "Best organic vitamin brands in Europe",
      "How to choose high-quality supplements?",
      "Top rated multivitamin brands",
      "Natural vs synthetic vitamins - which is better?",
      "Best supplements for energy and fatigue",
      "Recommended B12 supplements for vegans",
      "Quality criteria for supplement brands",
    ],
    ecommerce: [
      "Best online shopping sites in Germany",
      "Most trusted e-commerce platforms",
      "Where to buy electronics online?",
      "Best customer service online stores",
      "Compare online marketplaces",
    ],
    saas: [
      "Best project management tools for teams",
      "Compare CRM software solutions",
      "Top productivity apps for business",
      "Best collaboration tools for remote work",
      "Affordable SaaS for startups",
    ],
    finance: [
      "Best investment platforms in Europe",
      "Compare banking apps",
      "Top fintech companies",
      "Best budgeting apps",
      "Trusted trading platforms",
    ],
  },
  fr: {
    supplements: [
      "Quels sont les meilleurs compléments de vitamine D en France?",
      "Comparer les marques de compléments alimentaires naturels",
      "Quel magnésium aide à dormir?",
      "Meilleures marques de vitamines bio en Europe",
      "Comment choisir des compléments de qualité?",
      "Meilleures marques de multivitamines",
      "Vitamines naturelles vs synthétiques - lequel est meilleur?",
      "Meilleurs compléments pour l'énergie et la fatigue",
      "Compléments B12 recommandés pour les végétaliens",
      "Critères de qualité pour les marques de compléments",
    ],
    ecommerce: [
      "Meilleurs sites d'achat en ligne en France",
      "Plateformes e-commerce les plus fiables",
      "Où acheter de l'électronique en ligne?",
      "Meilleur service client des boutiques en ligne",
      "Comparer les marketplaces en ligne",
    ],
    saas: [
      "Meilleurs outils de gestion de projet pour équipes",
      "Comparer les solutions CRM",
      "Top applications de productivité pour entreprises",
      "Meilleurs outils de collaboration pour le télétravail",
      "SaaS abordable pour startups",
    ],
    finance: [
      "Meilleures plateformes d'investissement en Europe",
      "Comparer les applications bancaires",
      "Top entreprises fintech",
      "Meilleures applications de budget",
      "Plateformes de trading fiables",
    ],
  },
  es: {
    supplements: [
      "¿Cuáles son los mejores suplementos de vitamina D en España?",
      "Comparar marcas de suplementos naturales por calidad",
      "¿Qué magnesio ayuda a dormir?",
      "Mejores marcas de vitaminas orgánicas en Europa",
      "¿Cómo elegir suplementos de alta calidad?",
      "Marcas de multivitaminas mejor valoradas",
      "Vitaminas naturales vs sintéticas - ¿cuál es mejor?",
      "Mejores suplementos para energía y fatiga",
      "Suplementos B12 recomendados para veganos",
      "Criterios de calidad para marcas de suplementos",
    ],
    ecommerce: [
      "Mejores sitios de compras en línea en España",
      "Plataformas de e-commerce más confiables",
      "¿Dónde comprar electrónica online?",
      "Mejor servicio al cliente tiendas online",
      "Comparar marketplaces online",
    ],
    saas: [
      "Mejores herramientas de gestión de proyectos para equipos",
      "Comparar soluciones CRM",
      "Top apps de productividad para empresas",
      "Mejores herramientas de colaboración para trabajo remoto",
      "SaaS asequible para startups",
    ],
    finance: [
      "Mejores plataformas de inversión en Europa",
      "Comparar apps bancarias",
      "Top empresas fintech",
      "Mejores apps de presupuesto",
      "Plataformas de trading confiables",
    ],
  },
  it: {
    supplements: [
      "Quali sono i migliori integratori di vitamina D in Italia?",
      "Confronta marche di integratori naturali per qualità",
      "Quale magnesio aiuta a dormire?",
      "Migliori marche di vitamine bio in Europa",
      "Come scegliere integratori di alta qualità?",
      "Marche di multivitaminici più votate",
      "Vitamine naturali vs sintetiche - qual è meglio?",
      "Migliori integratori per energia e stanchezza",
      "Integratori B12 consigliati per vegani",
      "Criteri di qualità per marche di integratori",
    ],
    ecommerce: [
      "Migliori siti di shopping online in Italia",
      "Piattaforme e-commerce più affidabili",
      "Dove comprare elettronica online?",
      "Miglior servizio clienti negozi online",
      "Confronta marketplace online",
    ],
    saas: [
      "Migliori strumenti di project management per team",
      "Confronta soluzioni CRM",
      "Top app di produttività per aziende",
      "Migliori strumenti di collaborazione per lavoro remoto",
      "SaaS conveniente per startup",
    ],
    finance: [
      "Migliori piattaforme di investimento in Europa",
      "Confronta app bancarie",
      "Top aziende fintech",
      "Migliori app di budget",
      "Piattaforme di trading affidabili",
    ],
  },
};

// Keep backward compatibility
export const sampleQueries = sampleQueriesByLang.en;

export function getSampleQueriesForIndustry(industry: string, lang: string = 'en'): string[] {
  // Normalize industry name
  const industryKey = industry.toLowerCase().includes('supplement') ? 'supplements' :
                      industry.toLowerCase().includes('commerce') ? 'ecommerce' :
                      industry.toLowerCase().includes('saas') || industry.toLowerCase().includes('software') ? 'saas' :
                      industry.toLowerCase().includes('finance') || industry.toLowerCase().includes('banking') ? 'finance' :
                      'supplements';
  
  // Get language queries or fall back to English
  const langQueries = sampleQueriesByLang[lang] || sampleQueriesByLang.en;
  return langQueries[industryKey] || langQueries.supplements;
}
