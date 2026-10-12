---
name: update-hero-cv
description: Sustituye los cuatro PDFs del CV de portafolio-web por los de una carpeta de fuera del repo, tras revisarlos. No hace commit ni push.
disable-model-invocation: true
---

# Actualizar los PDFs del CV

Recibe la ruta de una carpeta de fuera del repo, localiza en ella los PDFs
del CV, los revisa y, si todo está bien, los copia sobre los de `public/cv/`.
Prepara el cambio y se detiene: el commit lo decide el autor.

## Nunca

- No hagas `git add`, commit ni push.
- No copies nada a `public/cv/` antes de terminar la revisión y de que el
  autor haya respondido a todas las preguntas.
- No leas fuera del repo nada más que la carpeta que anunciaste.
- No modifiques, muevas ni borres los archivos de origen.
- No conviertas `.docx`, no edites un PDF ni sus metadatos y no cambies
  `src/data/cv.ts`.
- No instales nada. Si falta `pdftotext`, detente y dilo.
- No escribas datos personales en ningún sitio, tampoco en tu respuesta ni
  en una pregunta: nombra el archivo, la página y el tipo de dato, no su
  valor. Del correo y del teléfono di solo «coincide» o «no coincide».
- Para volver atrás se usa la copia de seguridad, no `git checkout`.

## Pasos

1. **Origen.** La ruta de la carpeta llega como argumento; si no llega,
   pídela. Antes de leerla, escribe la ruta exacta que vas a leer. Debe ser
   una carpeta y estar fuera del repo; si no, detente.
2. **Estado.** `git status -sb`. Si `public/cv/` tiene cambios sin
   commitear, detente y dilo: la copia de seguridad debe ser la de los PDFs
   versionados.
3. **Registro.** Lee `src/data/cv.ts`. De ahí salen los pares de idioma y
   versión que hay que cubrir y el nombre de destino de cada uno; no los
   des por sabidos.
4. **Localizar.** Lista la carpeta, sin entrar en subcarpetas. Parte el
   nombre de cada `.pdf` en palabras, cortando por guion bajo, guion,
   punto, espacio y paréntesis, y clasifícalo sin distinguir mayúsculas:
   - versión infográfica si una palabra empieza por «Infogra» (cubre
     «Infografico» e «Infographic»);
   - versión ATS si una palabra es exactamente «ATS»;
   - idioma si una palabra es exactamente «ES» o «EN».
   Se buscan palabras enteras, nunca una subcadena suelta: «Formats» no es
   «ATS». Una copia como «ATS_ES (1).pdf» sí da la palabra «ES», así que
   compite con «ATS_ES.pdf» y hay que preguntar cuál se usa.
   Si un nombre lleva las dos versiones, o los dos idiomas, pregunta con
   AskUserQuestion qué es; no lo adivines.
   Todo lo demás se ignora: los `.docx`, cualquier otro archivo y los PDFs
   sin versión o sin idioma. Di cuáles ignoraste y por qué.
   Si a un par del registro no le corresponde ningún PDF, o le corresponde
   más de uno, pregunta con AskUserQuestion y no sigas hasta tener
   exactamente uno por par.
5. **Revisar.** De cada PDF de origen anota el tamaño y aplícale la sección
   «Revisión de PDFs» de `.claude/skills/pre-push-check/SKILL.md`, entera:
   cabecera, texto con `pdftotext -enc UTF-8`, metadatos y búsquedas. Anota
   también cuántas páginas tiene y cuántos caracteres de texto se extraen.
   - **Detente sin copiar** si un archivo no empieza por `%PDF-`, si falta
     `pdftotext`, si un correo o un teléfono no coincide con el de
     `src/config/contact.ts`, o si hay un correo o un teléfono en los
     metadatos.
   - **Pregunta con AskUserQuestion, recomendando detenerse,** si un PDF o
     una página no tiene capa de texto, o si queda cualquier otro hallazgo
     que no sea un descarte conocido (número largo, fecha completa, palabra
     de cédula, de nacimiento, de dirección o de estado civil). Si el autor
     decide seguir, el informe lo recoge como «no se pudo comprobar» o como
     hallazgo aceptado por el autor, nunca como limpio.
6. **«Gómez».** El nombre debe venir con tilde. Aquí «Gomez» sin tilde, en
   el texto o en los metadatos, no es un aviso que baste: pregunta con
   AskUserQuestion si seguir o detenerse, y recomienda detenerse, porque el
   propósito de este comando incluye que los PDFs vengan con «Gómez». Di en
   qué archivos aparece y si es en el texto o en los metadatos.
7. **Comparar con los actuales.** Para cada par, el PDF nuevo frente al de
   `public/cv/`: tamaño, páginas y caracteres de texto, y si es el mismo
   archivo (mismo SHA-256). No imprimas el texto.
8. **Copia de seguridad.** Copia los PDFs actuales de `public/cv/` a una
   carpeta nueva fuera del repo, con la fecha y la hora en el nombre.
   Anota el SHA-256 de cada uno y comprueba que la copia tiene el mismo.
9. **Copiar.** Copia cada PDF de origen a `public/cv/` con el nombre que le
   da el registro. Compara el SHA-256 de origen y el de destino: deben ser
   iguales. Confirma que en `public/cv/` no queda ningún archivo fuera del
   registro.
10. **Tests.** `npx vitest run src/data/cv.test.ts
    src/components/ui/CvDownload.test.tsx
    src/components/sections/Hero.cv.test.tsx
    src/components/sections/Hero.cv.empty.test.tsx`. No se toca ningún
    test. Si alguno falla, restaura los PDFs desde la copia de seguridad,
    comprueba que sus SHA-256 vuelven a ser los anotados e informa del
    fallo.
11. **Cierre.** `git status -sb` y `git diff --stat`.

## Informe

Una tabla con una fila por PDF: archivo de origen, nombre de destino,
tamaño, páginas, caracteres de texto, qué cambió respecto al anterior,
correo y teléfono (coincide, no coincide o no aparece), «Gómez» con tilde
y SHA-256 de origen y de destino. Después:

- Los archivos ignorados, con su motivo.
- Los avisos, los descartes y lo que no se pudo comprobar. Un PDF de
  diseño puede llevar texto convertido a contornos, que no sale al
  extraer: recuérdale al autor que lo revise a ojo.
- Si te detuviste: en qué paso, por qué, y que no se copió nada.
- Dónde quedó la copia de seguridad, con los SHA-256 anteriores, y cómo
  volver atrás: copiar esos archivos de vuelta a `public/cv/`.
- El `git diff --stat`.
- Dos recordatorios para el autor: una vez publicados, los PDFs los puede
  descargar cualquiera, con el correo y el teléfono que llevan dentro; y
  la versión anterior sigue en el historial de git.
