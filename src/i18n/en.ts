import { site } from '@/config/site'
import type { Dictionary } from '@/i18n/types'

export const en: Dictionary = {
  meta: {
    title: site.title,
    description: `Portfolio of ${site.legalName}, ${site.role}. Backend with Java, Spring Boot and PostgreSQL.`,
  },
  nav: {
    about: 'Profile',
    services: 'Services',
    projects: 'Projects',
    contact: 'Contact',
    skipToContent: 'Skip to content',
    language: 'switch the language to Spanish',
    pauseAnimations: 'Pause animations',
    cta: "Let's talk",
    main: 'Main navigation',
    home: 'home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  intro: {
    phrases: [{ natural: 'optimize processes', code: 'optimize_workflow()' }],
    label: 'Intro',
    hint: 'Press Escape or click to skip it.',
  },
  hero: {
    heading: site.shortName,
    intro:
      'I combine software development, communication and strategic thinking to build solutions that meet real needs and make sense to the people who use them.',
    stackLine: 'Java · Spring Boot · AI & automation',
    motto: { first: 'Code solves.', second: 'Judgment makes the difference.' },
    mainStack: 'main stack',
    stackLabel: 'Technologies',
    viewProjects: 'View projects',
    availability: 'Available for freelance',
    downloadCv: 'Download CV',
    cvInfographic: 'Infographic version (PDF)',
    cvAts: 'ATS version (PDF)',
    photoAlt: `Photo of ${site.shortName}`,
  },
  about: {
    label: 'Profile',
    tag: 'from_business_to_code()',
    phrase: { filled: 'Understand the challenge.', outline: 'Build the answer.' },
    // Two-paragraph bio of the redesign v2.1 spec (§3.2), set by the author in
    // both languages and approved on 2026-11-11, with typographic
    // apostrophes: do not edit without the author's approval.
    bio: [
      'I’m a Full-Stack developer focused on Java and Spring Boot. My background in Social Communication and Journalism also shapes how I approach technology: it leads me to listen, analyze context and understand the needs behind each problem.',
      'I want to build software that doesn’t just work, but makes sense to the people who use it. That’s why I connect technical decisions with business goals, a clear experience and the purpose of each solution.',
    ],
    stack: {
      tag: 'stack.list()',
      title: 'My stack',
      count: (count) => `${count} ${count === 1 ? 'technology' : 'technologies'}`,
      groups: {
        languages: 'Languages',
        backend: 'Backend',
        data: 'Data',
        frontend: 'Frontend',
        'ai-tools': 'AI & tools',
      },
    },
    stats: {
      codingTime: {
        months: (count) => (count === 1 ? 'Month of coding' : 'Months of coding'),
        years: (count) => (count === 1 ? 'Year of coding' : 'Years of coding'),
      },
      projects: (count) => (count === 1 ? 'Project built' : 'Projects built'),
      technologies: (count) => (count === 1 ? 'Technology' : 'Technologies'),
      plusPosition: 'suffix',
    },
    educationLabel: 'Education',
    // Official titles keep the original name, with the translation in parentheses.
    educationTranslation: {
      'tecnico-laboral-programacion': 'Technical Diploma in Software Programming',
      'comunicador-social-periodista': 'Social Communicator and Journalist',
    },
    translator: {
      label: 'Translator',
      examplesLabel: 'Examples',
      saysLabel: 'What the business says',
      writesLabel: 'What I write',
      viewRepo: 'View the repo',
      items: {
        inventory: { tab: 'Inventory', say: 'Let me know when a product is about to run out.' },
        permissions: {
          tab: 'Permissions',
          say: 'Anyone on the team can create and edit products, but only an administrator can delete them.',
        },
        news: { tab: 'News', say: 'I want a news digest every day.' },
      },
    },
  },
  services: {
    label: 'Services',
    tag: 'what_i_build()',
    title: ['What I', 'build'],
    relatedProject: 'View related project',
    ribbons: {
      codeLabel: 'Code snippets from my repos',
      verbsLabel: 'How I work',
      verbs: ['I listen', 'I plan', 'I code', 'I document', 'I explain', 'I deliver'],
    },
    items: {
      backend: {
        title: 'Backend Development',
        description:
          'REST APIs with Java and Spring Boot, with JWT authentication, roles and permissions, and OpenAPI documentation.',
      },
      frontend: {
        title: 'Frontend Development',
        description:
          'Responsive interfaces with HTML, CSS, JavaScript and TypeScript, and React, with AI agent support.',
      },
      fullstack: {
        title: 'Full-Stack Development',
        description:
          'I build complete applications: a Java and Spring Boot API, a PostgreSQL database and a web interface with HTML, CSS and JavaScript, from the idea to a working system.',
      },
      databases: {
        title: 'Databases',
        description:
          'Relational modeling and queries in PostgreSQL and MySQL, with foreign keys and constraints that protect data integrity.',
      },
      automation: {
        title: 'Automation and AI agents',
        description:
          'Agentic workflows built on AGENTS.md, skills and commands, connecting AI agents to n8n workflows and MCP servers, with clear rules on what each agent can do.',
      },
      communication: {
        title: 'Strategic communication',
        description:
          'I turn business goals into technology solutions. I listen, translate them into clear technical requirements and communicate them to the team.',
      },
    },
  },
  projects: {
    label: 'Projects',
    viewAll: 'View all on GitHub',
    viewCode: 'View code',
    mainProject: 'Main project',
    stackLabel: 'Technologies',
    screenshotPending: 'Screenshot pending',
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
      'portafolio-web': {
        description:
          'Personal portfolio built with HTML, CSS & Vanilla JS. Dark tech aesthetic, smooth scroll animations and responsive design. Showcases projects, skills and background of a Software Developer & Social Communicator. | jorge.dev',
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
  contact: {
    label: 'Contact',
    title: 'Good ideas deserve to be built well.',
    pitch: {
      lead: 'Do you have a project, a problem to solve, or are you looking for someone to strengthen your team?',
      body: 'Let’s talk about your goals, what you need and how I can contribute through software development.',
    },
    channelsLabel: 'Or pick the channel you prefer',
    copyEmail: 'Copy email',
    emailCopied: 'Email copied.',
    copyFailed: 'Could not copy it: your email app opened instead.',
    whatsapp: 'WhatsApp',
    linksLabel: 'Other ways to reach me',
    cv: { short: 'CV · EN', name: 'Download the CV in English' },
    form: {
      tag: 'new_message()',
      title: 'Tell me your idea',
      required: 'required',
      optional: 'optional',
      pickSeveral: 'you can pick several',
      name: { label: 'Name', placeholder: 'Jane Doe…', error: 'Write your name.' },
      email: {
        label: 'Email',
        placeholder: 'jane@company.com…',
        error: 'Check the email: something is missing.',
      },
      company: { label: 'Company', placeholder: 'Where you work…' },
      needs: {
        legend: 'What do you need?',
        options: {
          backend: 'Backend',
          frontend: 'Frontend',
          'full-stack': 'Full-Stack',
          databases: 'Databases',
          'automation-ai': 'Automation and AI',
          other: 'Something else',
        },
      },
      message: {
        label: 'Message',
        placeholder: 'What you want to build and by when…',
        error: 'Tell me in at least one sentence what you need.',
      },
      submit: 'Send message',
      sending: 'Sending…',
      failed:
        'It could not be sent right now. Your message is still here: try again or write to me directly with “Copy email”.',
      sent: {
        title: 'Message received',
        reply: 'I will reply to',
        again: 'Send another',
      },
    },
  },
  footer: {
    credits: {
      design: 'Design and code',
      builtWith: 'Built with',
      from: 'Based in',
      online: 'Online',
    },
    rights: 'All rights reserved',
    social: 'Social links',
    backToTop: 'Back to top',
  },
  common: {
    opensInNewTab: 'opens in a new tab',
  },
  technologyNames: { 'ai-agents': 'AI Agents' },
}
