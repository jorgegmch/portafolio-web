import { site } from '@/config/site'
import type { Dictionary } from '@/i18n/types'

export const en: Dictionary = {
  meta: {
    title: `${site.legalName} — ${site.role}`,
    description: `Portfolio of ${site.legalName}, ${site.role}. Backend with Java, Spring Boot and PostgreSQL.`,
  },
  nav: {
    about: 'About',
    technologies: 'Technologies',
    projects: 'Projects',
    contact: 'Contact',
    skipToContent: 'Skip to content',
    language: 'Language',
    certifications: 'Certifications',
    main: 'Main navigation',
    home: 'Go to top',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  intro: {
    phrases: [{ natural: 'optimize processes', code: 'optimize_workflow()' }],
    skip: 'Skip',
  },
  hero: {
    heading: site.shortName,
    tagline: 'Where code meets storytelling.',
    viewProjects: 'View projects',
    downloadCv: 'Download CV',
    cvDesigned: 'Designed version (PDF)',
    cvAts: 'ATS version (PDF)',
    photoAlt: `Photo of ${site.legalName}`,
  },
  about: {
    heading: 'About me',
    // Translation of the approved Spanish bio: do not edit without approval.
    bio: [
      "I like code that does something, not code that just compiles. I work mostly on the backend — Java, Spring Boot, PostgreSQL — and reach for Python or TypeScript when the problem calls for it. LogiTrack IQ started out as a simple API for tracking inventory and ended up with an AI agent that warns you, all on its own, when a product is about to run out. That 'and ended up' is basically how I work.",
      'Before I wrote code, I spent years on the other end of the phone, sorting out what a customer said they wanted and what they actually needed — the two are almost never the same. That habit never left. Today it shows in how I listen before writing a single line.',
      "I studied Social Communication before I studied programming, so when someone walks me through a business problem, I don't need a translator. I can be the translator.",
    ],
    viewCertifications: 'View certifications',
    stats: {
      repos: { label: 'Projects' },
      certifications: { label: 'Certifications' },
      stack: { label: 'Main stack' },
      languages: { label: 'Spoken languages', value: 'Native Spanish · English B1' },
    },
  },
  technologies: {
    heading: 'Technologies',
    groups: {
      backend: 'Backend',
      databases: 'Databases',
      languages: 'Languages',
      frontend: 'Frontend',
      tools: 'Tools',
      ai: 'AI',
    },
  },
  projects: {
    heading: 'Featured projects',
    viewRepo: 'View repository',
    viewAll: 'View all on GitHub',
    // Las descripciones coinciden con las de cada repositorio en GitHub.
    items: {
      'logitrack-iq': {
        description:
          'Inventory control tower extending LogiTrack API with AI/MCP-driven purchase order automation, stock-risk detection, and a fully automated n8n workflow. Built with Spring Boot, a Node.js MCP server, PostgreSQL, and Docker.',
      },
      'logitrack-api': {
        description:
          'REST API for warehouse and inventory management, built with Spring Boot, Spring Security (JWT), and PostgreSQL. Tracks stock movements between warehouses, automatically logs every change for full auditability, and is documented with OpenAPI/Swagger.',
      },
      'inventory-guardian': {
        description:
          'Desktop inventory management app built with Python, ttkbootstrap, and SQLite. Includes full CRUD for products, a live 5-metric dashboard, low-stock alerts, name search, multi-column sorting, and a dark/light theme toggle. Runs fully offline, with no server or external services required.',
      },
      'crm-registro-campers': {
        description:
          'Camper registration module of a team-built CRM MVP for Campuslands. React, TypeScript and JSON Server, with role-based sales rep assignment, photo upload and validation. Runs standalone with fictional data.',
      },
      'n8n-daily-news-agent': {
        description:
          'An automated daily news digest agent built in n8n. A Gemini-powered AI agent searches the web in real time to curate a tech news story, a fun fact, and a historical event, skips topics already covered in the last 7 days via a Google Sheets log, adds live weather data, and emails a formatted newsletter every morning.',
      },
      'campuslands-erp-cli': {
        description:
          'Command-line ERP for academic management: students, trainers, schedules and academic-risk tracking. Built in pure Python with JSON-based local persistence and a modular CRUD architecture, with no external database or dependencies.',
      },
      'patitas-felices-web': {
        description:
          'Static, responsive website for an animal rescue and adoption foundation, built with pure HTML5 and CSS3. Features a home page, adoption catalog, donation flows, and volunteer forms with fluid typography, normalized asset proportions, and no external frameworks or dependencies.',
      },
      'rebelwear-ui': {
        description:
          'RebelWear is a responsive e-commerce frontend built with vanilla HTML, CSS, and JavaScript, consuming the FakeStore API. Features a filterable/paginated catalog, a cart with localStorage persistence, and a fully mobile-first responsive design across all pages.',
      },
      'colombia-population-stats': {
        description:
          'A small web app to look up population, area, and municipalities for any Colombian department, using the public api-colombia.com API. Built with vanilla HTML5, CSS3, and JavaScript, no frameworks or dependencies. Includes search by name, Enter-key support, and error handling for failed lookups.',
      },
      'pocketflow-code-validator': {
        description:
          'AI-powered code evaluation engine built on a custom PocketFlow-style node architecture. Runs solutions in an isolated subprocess with timeout and resource limits, then uses the Gemini API to review correctness, efficiency, and readability. Includes an import-policy linter and a two_sum sample problem.',
      },
      'cultuvivo-events-system': {
        description:
          'Cultural events management system built with Python and JSON persistence. Role-based menus for admin, artist, and attendee, with capacity-validated registrations and a waitlist. Developed as a team project using Scrum. Handles artists, events, attendees, and reports.',
      },
      'n8n-telegram-helpdesk-bot': {
        description:
          'A Telegram support-ticket bot built entirely in n8n, using a deterministic state-machine architecture instead of an AI agent. Manages ticket creation, status checks, and reporting, using Google Sheets as its data store.',
      },
      'medisistema-hospital-db': {
        description:
          'Normalized relational database design for a hospital management system. Models doctors, patients, specialties, and medical consultations with full referential integrity, a many-to-many junction table, an ER diagram (StarUML), and 20 solved SQL queries. Built in MySQL 8.0+.',
      },
      'gaseosas-del-valle-db': {
        description:
          'Relational MySQL database for a soft-drink distributor: 6-table schema, sample data, stored functions, triggers that update stock and order totals (19% VAT) and audit price changes, 3 views and 10 analytical queries. Includes a StarUML ER diagram. Built for MySQL 8.0.16+.',
      },
      'vehicle-dealership-db': {
        description:
          'Relational PostgreSQL database for a vehicle dealership: inventory, customers and leads, sales with commissions, workshop services and parts suppliers. Includes an ER diagram (StarUML), sample data and 10 business queries.',
      },
      'tecnostore-pos': {
        description:
          'Console-based point-of-sale system in Java for a phone store, with JDBC/MySQL persistence, tier-based discounts, and credit account management.',
      },
    },
  },
  certifications: {
    heading: 'Certifications',
    back: 'Back to home',
    hours: (count) => `${count} hours`,
    categories: {
      formal: 'Formal education',
      'soft-skills': 'Soft skills',
      technical: 'Technical',
    },
    items: {
      // Official degree titles keep the original name, with the translation
      // in parentheses.
      'comunicador-social-periodista': {
        title: 'Comunicador Social y Periodista (Social Communicator and Journalist)',
      },
      'diplomado-comunicacion-digital': {
        title: 'Diplomado in Strategic Digital Communication (certificate program)',
      },
      'bachiller-academico-sistemas': {
        title:
          'Bachiller Académico con Énfasis en Sistemas (High School Diploma with an Emphasis in Computer Systems)',
      },
      'servicio-al-cliente': { title: 'Customer Service: A Personal Challenge' },
      'taller-desempeno-laboral': {
        title: 'Workshop: Strengthening Competencies for Better Job Performance',
      },
      'taller-competencias-vida': { title: 'Workshop: Strengthening Competencies for Life' },
      'congreso-comunicacion-afacom': {
        title:
          '3rd Communication Congress "Challenges of Communication in the Knowledge Society"',
      },
      'bootcamp-programacion-basico': { title: 'Programming Bootcamp, Basic Level' },
      'curso-desarrollo-ia': { title: 'AI Development Course' },
    },
  },
  contact: {
    heading: 'Contact',
    email: 'Email',
  },
  footer: {
    builtBy: 'Designed and built by',
    social: 'Social links',
  },
  common: {
    opensInNewTab: 'opens in a new tab',
  },
}
