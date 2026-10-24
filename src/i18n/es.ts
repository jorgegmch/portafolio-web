import { site } from '@/config/site'
import type { Dictionary } from '@/i18n/types'

export const es: Dictionary = {
  meta: {
    title: site.title,
    description: `Portafolio de ${site.legalName}, ${site.role}. Backend con Java, Spring Boot y PostgreSQL.`,
  },
  nav: {
    about: 'Perfil',
    services: 'Servicios',
    projects: 'Proyectos',
    contact: 'Contacto',
    skipToContent: 'Saltar al contenido',
    language: 'cambiar el idioma a inglés',
    pauseAnimations: 'Pausar animaciones',
    cta: 'Hablemos',
    main: 'Navegación principal',
    home: 'Ir al inicio',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
  },
  intro: {
    phrases: [{ natural: 'optimizar procesos', code: 'optimize_workflow()' }],
    skip: 'Saltar',
  },
  hero: {
    heading: site.shortName,
    intro:
      'Traduzco lo que tu negocio necesita en software que funciona, y te lo explico sin tecnicismos.',
    stackLine: 'Java · Spring Boot · Agentes de IA',
    stackLabel: 'Tecnologías',
    viewProjects: 'Ver proyectos',
    availability: 'Disponible para proyectos freelance',
    availabilityShort: 'Disponible para freelance',
    downloadCv: 'Descargar CV',
    cvInfographic: 'Versión infográfica (PDF)',
    cvAts: 'Versión ATS (PDF)',
    photoAlt: `Foto de ${site.shortName}`,
    socialLabel: 'Redes y contacto',
    social: {
      github: 'GitHub',
      linkedin: 'LinkedIn',
      email: 'Enviar un correo',
      whatsapp: 'Escribir por WhatsApp',
    },
  },
  about: {
    label: 'Perfil',
    tag: 'del_negocio_al_codigo()',
    phrase: { filled: 'Del negocio al código.', outline: 'Y del código a palabras claras.' },
    // Bio de una línea de la spec del rediseño v2 (§3.2), escrita por el
    // autor: no editar sin su aprobación.
    bio: 'Desarrollador Full-Stack con base en Java y Spring Boot. Vengo de la Comunicación Social: escucho antes de programar y explico lo que construyo.',
    stats: {
      codingTime: {
        months: (count) => (count === 1 ? 'Mes programando' : 'Meses programando'),
        years: (count) => (count === 1 ? 'Año programando' : 'Años programando'),
      },
      projects: (count) => (count === 1 ? 'Proyecto construido' : 'Proyectos construidos'),
      technologies: (count) => (count === 1 ? 'Tecnología' : 'Tecnologías'),
      plusPosition: 'prefix',
    },
    educationLabel: 'Formación',
    // Los títulos oficiales van en su idioma original: en español no llevan traducción.
    educationTranslation: {
      'tecnico-laboral-programacion': null,
      'comunicador-social-periodista': null,
    },
    translator: {
      label: 'Traductor',
      examplesLabel: 'Ejemplos',
      saysLabel: 'Lo que dice el negocio',
      writesLabel: 'Lo que escribo',
      viewRepo: 'Ver el repo',
      items: {
        inventory: { tab: 'Inventario', say: 'Avísame cuando un producto esté por agotarse.' },
        permissions: {
          tab: 'Permisos',
          say: 'Cualquiera del equipo puede crear y editar productos, pero solo un administrador puede borrarlos.',
        },
        news: { tab: 'Noticias', say: 'Quiero un resumen de noticias todos los días.' },
      },
    },
  },
  services: {
    label: 'Servicios',
    tag: 'what_i_build()',
    title: ['Lo que', 'construyo'],
    relatedProject: 'Ver proyecto relacionado',
    ribbons: {
      codeLabel: 'Fragmentos de código de mis repos',
      verbsLabel: 'Cómo trabajo',
      verbs: ['Escucho', 'Planifico', 'Programo', 'Documento', 'Explico', 'Entrego'],
    },
    items: {
      backend: {
        title: 'Desarrollo Backend',
        description:
          'APIs REST con Java y Spring Boot, con autenticación JWT, roles y permisos, y documentación OpenAPI.',
      },
      frontend: {
        title: 'Desarrollo Frontend',
        description:
          'Interfaces responsivas con HTML, CSS, JavaScript y TypeScript, y React, con apoyo de agentes de IA.',
      },
      fullstack: {
        title: 'Desarrollo Full-Stack',
        description:
          'Construyo aplicaciones completas: API en Java y Spring Boot, base de datos en PostgreSQL e interfaz web con HTML, CSS y JavaScript, de la idea a un sistema que funciona.',
      },
      databases: {
        title: 'Bases de datos',
        description:
          'Modelado relacional y consultas en PostgreSQL y MySQL, con claves foráneas y restricciones que protegen la integridad de los datos.',
      },
      automation: {
        title: 'Automatización y agentes de IA',
        description:
          'Ciclos de trabajo con agentes de IA (AGENTS.md, skills y comandos), conectados a flujos de n8n y servidores MCP, con reglas claras de lo que cada agente puede hacer.',
      },
      communication: {
        title: 'Comunicación estratégica',
        description:
          'Convierto los objetivos del negocio en soluciones tecnológicas. Escucho, los traduzco a requerimientos técnicos claros y los comunico al equipo.',
      },
    },
  },
  projects: {
    label: 'Proyectos',
    viewAll: 'Ver todos en GitHub',
    viewCode: 'Ver código',
    mainProject: 'Proyecto principal',
    stackLabel: 'Tecnologías',
    screenshotPending: 'Captura pendiente',
    items: {
      'logitrack-iq': {
        description:
          'Torre de control de inventario que extiende LogiTrack API con automatización de órdenes de compra mediante IA/MCP, detección de riesgo de stock y un flujo de trabajo en n8n totalmente automatizado. Hecha con Spring Boot, un servidor MCP en Node.js, PostgreSQL y Docker.',
      },
      'logitrack-api': {
        description:
          'API REST para la gestión de bodegas e inventario, hecha con Spring Boot, Spring Security (JWT) y PostgreSQL. Registra los movimientos de stock entre bodegas, guarda automáticamente cada cambio para una auditoría completa y está documentada con OpenAPI/Swagger.',
      },
      'inventory-guardian': {
        description:
          'Aplicación de escritorio para gestión de inventario hecha con Python, ttkbootstrap y SQLite. Incluye CRUD completo de productos, un panel en vivo con 5 métricas, alertas de stock bajo, búsqueda por nombre, ordenamiento por varias columnas y un selector de tema oscuro/claro. Funciona completamente sin conexión, sin necesidad de servidor ni servicios externos.',
      },
      'portafolio-web': {
        description:
          'Portafolio personal hecho con HTML, CSS y JavaScript puro. Estética tecnológica oscura, animaciones de scroll suaves y diseño responsive. Muestra los proyectos, las habilidades y la trayectoria de un desarrollador de software y comunicador social. | jorge.dev',
      },
      'crm-registro-campers': {
        description:
          'Módulo de registro de campers de un MVP de CRM hecho en equipo para Campuslands. React, TypeScript y JSON Server, con asignación de asesores comerciales basada en roles, carga de fotos y validación. Funciona de forma independiente con datos ficticios.',
      },
      'n8n-daily-news-agent': {
        description:
          'Un agente automatizado de resumen diario de noticias construido en n8n. Un agente de IA con Gemini busca en la web en tiempo real para seleccionar una noticia de tecnología, un dato curioso y un evento histórico, omite los temas ya tratados en los últimos 7 días mediante un registro en Google Sheets, añade datos del clima en vivo y envía por correo un boletín con formato cada mañana.',
      },
      'campuslands-erp-cli': {
        description:
          'ERP de línea de comandos para gestión académica: estudiantes, trainers, horarios y seguimiento de riesgo académico. Hecho en Python puro, con persistencia local basada en JSON y una arquitectura CRUD modular, sin base de datos externa ni dependencias.',
      },
      'patitas-felices-web': {
        description:
          'Sitio web estático y responsivo para una fundación de rescate y adopción de animales, hecho con HTML5 y CSS3 puros. Incluye página de inicio, catálogo de adopción, flujos de donación y formularios de voluntariado, con tipografía fluida, proporciones de recursos normalizadas y sin frameworks ni dependencias externas.',
      },
      'rebelwear-ui': {
        description:
          'RebelWear es un frontend de e-commerce responsivo hecho con HTML, CSS y JavaScript vanilla, que consume la API FakeStore. Incluye un catálogo filtrable y paginado, un carrito con persistencia en localStorage y un diseño responsivo mobile-first en todas las páginas.',
      },
      'colombia-population-stats': {
        description:
          'Una pequeña aplicación web para consultar la población, la superficie y los municipios de cualquier departamento de Colombia, usando la API pública api-colombia.com. Hecha con HTML5, CSS3 y JavaScript vanilla, sin frameworks ni dependencias. Incluye búsqueda por nombre, soporte para la tecla Enter y manejo de errores en consultas fallidas.',
      },
      'pocketflow-code-validator': {
        description:
          'Motor de evaluación de código con IA, construido sobre una arquitectura propia de nodos al estilo PocketFlow. Ejecuta las soluciones en un subproceso aislado con límites de tiempo y de recursos, y luego usa la API de Gemini para revisar corrección, eficiencia y legibilidad. Incluye un linter de política de imports y un problema de ejemplo two_sum.',
      },
      'cultuvivo-events-system': {
        description:
          'Sistema de gestión de eventos culturales hecho con Python y persistencia en JSON. Menús por rol para administrador, artista y asistente, con inscripciones validadas por aforo y lista de espera. Desarrollado como proyecto en equipo usando Scrum. Gestiona artistas, eventos, asistentes y reportes.',
      },
      'n8n-telegram-helpdesk-bot': {
        description:
          'Un bot de tickets de soporte para Telegram construido íntegramente en n8n, con una arquitectura de máquina de estados determinista en lugar de un agente de IA. Gestiona la creación de tickets, la consulta de estado y los reportes, usando Google Sheets como almacén de datos.',
      },
      'medisistema-hospital-db': {
        description:
          'Diseño de base de datos relacional normalizada para un sistema de gestión hospitalaria. Modela médicos, pacientes, especialidades y consultas médicas con integridad referencial completa, una tabla intermedia de muchos a muchos, un diagrama ER (StarUML) y 20 consultas SQL resueltas. Hecho en MySQL 8.0+.',
      },
      'gaseosas-del-valle-db': {
        description:
          'Base de datos relacional en MySQL para una distribuidora de gaseosas: esquema de 6 tablas, datos de ejemplo, funciones almacenadas, triggers que actualizan el stock y los totales de los pedidos (IVA del 19 %) y auditan los cambios de precio, 3 vistas y 10 consultas analíticas. Incluye un diagrama ER en StarUML. Hecha para MySQL 8.0.16+.',
      },
      'vehicle-dealership-db': {
        description:
          'Base de datos relacional en PostgreSQL para un concesionario de vehículos: inventario, clientes y prospectos, ventas con comisiones, servicios de taller y proveedores de repuestos. Incluye un diagrama ER (StarUML), datos de ejemplo y 10 consultas de negocio.',
      },
      'tecnostore-pos': {
        description:
          'Sistema de punto de venta por consola en Java para una tienda de celulares, con persistencia en JDBC/MySQL, descuentos por niveles y gestión de cuentas de crédito.',
      },
    },
  },
  contact: {
    label: 'Contacto',
    title: ['¿Construimos', 'algo?'],
    pitch: 'Cuéntame qué necesita tu negocio. Yo lo traduzco a código.',
    writeMe: 'Escríbeme',
    copyEmail: 'Copiar correo',
    emailCopied: 'Correo copiado.',
    copyFailed: 'No se pudo copiar: se abrió tu programa de correo.',
    whatsapp: 'WhatsApp',
    linksLabel: 'Otras formas de contacto',
    cv: {
      es: { short: 'CV · ES', name: 'Descargar el CV en español (PDF)' },
      en: { short: 'CV · EN', name: 'Descargar el CV en inglés (PDF)' },
    },
    form: {
      tag: 'nuevo_mensaje()',
      title: 'Cuéntame tu idea',
      close: 'Cerrar formulario',
      required: 'obligatorio',
      optional: 'opcional',
      pickSeveral: 'puedes marcar varias',
      name: { label: 'Nombre', placeholder: 'Cómo te llamas', error: 'Escribe tu nombre.' },
      email: {
        label: 'Correo',
        placeholder: 'Donde te respondo',
        error: 'Revisa el correo: falta algo.',
      },
      company: { label: 'Empresa', placeholder: 'Si escribes en nombre de una empresa' },
      needs: {
        legend: '¿Qué necesitas?',
        options: {
          backend: 'Backend',
          frontend: 'Frontend',
          'full-stack': 'Full-Stack',
          databases: 'Bases de datos',
          'automation-ai': 'Automatización e IA',
          other: 'Otra cosa',
        },
      },
      message: {
        label: 'Mensaje',
        placeholder: 'Qué quieres construir, para cuándo y cualquier detalle que sirva',
        error: 'Cuéntame al menos en una frase qué necesitas.',
      },
      submit: 'Enviar mensaje',
      sending: 'Enviando…',
      failed:
        'No se pudo enviar ahora mismo. Tu mensaje sigue aquí: inténtalo de nuevo o escríbeme directo con «Copiar correo».',
      direct: '¿Prefieres directo?',
      sent: {
        title: 'Mensaje recibido',
        reply: 'te respondo a',
        back: 'Volver al portafolio',
        again: 'Enviar otro',
      },
    },
  },
  footer: {
    credits: {
      design: 'Diseño y código',
      builtWith: 'Construido con',
      from: 'Desde',
      online: 'En la red',
    },
    rights: 'Todos los derechos reservados',
    social: 'Redes',
    backToTop: 'Volver arriba',
  },
  common: {
    opensInNewTab: 'se abre en una pestaña nueva',
  },
}
