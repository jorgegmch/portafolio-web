import { site } from '@/config/site'
import type { Dictionary } from '@/i18n/types'

export const es: Dictionary = {
  meta: {
    title: site.title,
    description: `Portafolio de ${site.legalName}, ${site.role}. Backend con Java, Spring Boot y PostgreSQL.`,
  },
  nav: {
    about: 'Sobre mí',
    technologies: 'Tecnologías',
    projects: 'Proyectos',
    contact: 'Contacto',
    skipToContent: 'Saltar al contenido',
    language: 'Idioma',
    certifications: 'Certificaciones',
    main: 'Navegación principal',
    home: 'Ir al inicio',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
  },
  intro: {
    phrases: [{ natural: 'optimización de procesos', code: 'optimize_workflow()' }],
    skip: 'Saltar animación',
  },
  hero: {
    heading: site.shortName,
    tagline: 'Where code meets storytelling.',
    viewProjects: 'Ver proyectos',
    downloadCv: 'Descargar CV',
    cvDesigned: 'Versión diseñada (PDF)',
    cvAts: 'Versión ATS (PDF)',
    photoAlt: `Foto de ${site.legalName}`,
  },
  about: {
    heading: 'Sobre mí',
    // Texto aprobado palabra por palabra: no editar sin aprobación.
    bio: [
      "Me gusta que el código haga algo, no solo que compile. Trabajo principalmente en backend — Java, Spring Boot, PostgreSQL — y uso Python o TypeScript cuando el problema lo pide. LogiTrack IQ nació como una simple API para controlar inventario y terminó con un agente de IA que avisa solo cuándo un producto está a punto de agotarse. Ese 'y terminó' es básicamente mi forma de trabajar.",
      'Antes de programar pasé años al otro lado del teléfono, resolviendo lo que un cliente decía que quería y lo que en realidad necesitaba — casi nunca son lo mismo. Esa costumbre no se fue a ningún lado. Hoy se nota en cómo escucho antes de escribir una sola línea.',
      'Estudié Comunicación Social antes que programación, así que cuando alguien me explica un problema de negocio, no necesito traductor. Puedo ser el traductor.',
    ],
    viewCertifications: 'Ver certificaciones',
    stats: {
      repos: { label: 'Proyectos' },
      certifications: { label: 'Certificaciones' },
      stack: { label: 'Stack principal' },
      languages: { label: 'Idiomas', value: 'Español nativo · Inglés B1' },
    },
  },
  technologies: {
    heading: 'Tecnologías',
    groups: {
      backend: 'Backend',
      databases: 'Bases de datos',
      languages: 'Lenguajes',
      frontend: 'Frontend',
      tools: 'Herramientas',
      ai: 'IA',
    },
  },
  projects: {
    heading: 'Proyectos destacados',
    viewRepo: 'Ver repositorio',
    viewAll: 'Ver todos en GitHub',
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
  certifications: {
    heading: 'Certificaciones',
    back: 'Volver al inicio',
    hours: (count) => `${count} horas`,
    categories: {
      formal: 'Formación formal',
      'soft-skills': 'Habilidades blandas',
      technical: 'Técnico',
    },
    items: {
      'comunicador-social-periodista': { title: 'Comunicador Social y Periodista' },
      'diplomado-comunicacion-digital': {
        title: 'Diplomado en Comunicación Digital Estratégica',
      },
      'bachiller-academico-sistemas': { title: 'Bachiller Académico con Énfasis en Sistemas' },
      'servicio-al-cliente': { title: 'Servicio al Cliente: Un Reto Personal' },
      'taller-desempeno-laboral': {
        title: 'Taller Fortalecimiento de Competencias para el Mejor Desempeño Laboral',
      },
      'taller-competencias-vida': {
        title: 'Taller Fortalecimiento de Competencias para la Vida',
      },
      'congreso-comunicacion-afacom': {
        title:
          'III Congreso de Comunicación "Retos de la Comunicación en la Sociedad del Conocimiento"',
      },
      'bootcamp-programacion-basico': { title: 'Bootcamp de Programación Nivel Básico' },
      'curso-desarrollo-ia': { title: 'Curso de Desarrollo con IA' },
    },
  },
  contact: {
    heading: 'Contacto',
    email: 'Correo',
  },
  footer: {
    rights: 'Todos los derechos reservados',
    social: 'Redes',
  },
  common: {
    opensInNewTab: 'se abre en una pestaña nueva',
  },
}
