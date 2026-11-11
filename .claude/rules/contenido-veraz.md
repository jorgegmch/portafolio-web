# Contenido veraz

## Nada inventado

- Prohibido inventar o insinuar años de experiencia, clientes o métricas de impacto.
- No afirmar ni insinuar uso en producción real. Si hace falta matizar un proyecto, usar exactamente la formulación del LinkedIn del autor: «siguiendo los mismos estándares que exigiría un entorno de producción real».
- Cada etiqueta de stack nueva se justifica citando de dónde sale.
- El código que muestra el sitio (los fragmentos del Traductor de Perfil y la ventana de código del Hero) es real: copiado de un repo público, sin retocar salvo la sangría común, con «// …» donde se saltan líneas. En `data/` se anotan junto a cada fragmento el repo, el commit, la ruta y las líneas.

## Proyectos

- Descripción EN = texto actual del repo en GitHub, sin retocar. Descripción ES = traducción fiel.
- Si una descripción cambia, se cambia en GitHub y en los dos diccionarios.
- `crm-registro-campers` se presenta como módulo de un MVP hecho en equipo, nunca como el CRM completo; no sugerir backend propio (usa JSON Server local).
- Destacados: los marcados con `featured` en `data/projects.ts`, en el orden de ese archivo. El resto se ve desde "Ver todos en GitHub".

## Proyectos construidos

- La tarjeta «Proyectos construidos» cuenta solo los marcados con `built: true` en `data/projects.ts`. La cifra sale de `builtProjects.length`; nunca se escribe a mano.
- `built` significa proyecto de desarrollo completo y funcional. Excluye ejercicios de aprendizaje, repos de scripts de BD y forks.
- Solo cuentan repos públicos.
- Un proyecto hecho en equipo cuenta si cumple el criterio. Su descripción debe decir que es de equipo y, si se sabe, cuál fue la parte del autor, sin presentarlo nunca como trabajo individual.
- Marcar o desmarcar un proyecto lo decide el autor.

## Certificaciones

El rediseño v2 retiró la página de certificaciones: del registro de `data/certifications.ts` hoy solo se muestra la Formación de Perfil.

- Solo texto: sin imágenes ni enlaces a los documentos.
- Los títulos oficiales conservan el original, con la traducción entre paréntesis.
- Las entidades no se traducen.
