---
name: pre-push-check
description: Comprobaciones previas a un push en portafolio-web. Solo lee e informa; el push lo hace el autor.
disable-model-invocation: true
---

# Comprobación previa al push

Ejecuta las comprobaciones de abajo sobre los commits que aún no están en el
remoto y entrega un veredicto. Es de solo lectura.

## Nunca

- No hagas push, ni lo intentes con variantes del comando.
- No modifiques archivos versionados; el build solo escribe en `dist/`, que
  está ignorado. No borres nada. No hagas commits ni `git add`.
- No uses `--no-verify`.
- No escribas datos personales en ningún sitio, tampoco en tu respuesta: si
  encuentras uno, nombra el archivo, la línea y el tipo de dato, no su valor.
- Si una comprobación falla, no la arregles: infórmala y sigue con las demás.

## Pasos

1. **Estado.** `git status -sb`, `git branch -vv` y
   `git log --oneline @{upstream}..HEAD`. Informa la rama, cuántos commits
   van por delante y cualquier archivo modificado o sin versionar. Si no hay
   upstream, dilo y usa `origin/main..HEAD`.
2. **Mensajes de commit.** En Bash:
   `git log --format=%B @{upstream}..HEAD | grep -iE "claude|anthropic|co-authored"`.
   No debe devolver nada. Control positivo obligatorio: repite el `grep` con
   una palabra que sí esté en esos mensajes (por ejemplo `feat`) y confirma
   que da resultados; sin eso, la salida vacía no vale.
   Si devuelve algo, no lo marques como fallo sin más: muestra cada línea con
   el hash de su commit. Una mención legítima de la carpeta `.claude/` en un
   asunto no es una atribución; el autor decide cada caso.
3. **Formato de los mensajes.** Cada asunto sigue Conventional Commits, en
   inglés. Lista los que no.
4. **Archivos que no deben estar versionados.** `git ls-files` no debe
   contener `.claude/settings.local.json`, nada bajo `_incoming/`, archivos
   `.env` distintos de `.env.example`, capturas ni trazas de Playwright.
5. **Datos personales, por patrón.** Con `git grep -nIE` sobre los archivos
   versionados, busca: texto con forma de correo, secuencias de siete o más
   dígitos seguidos o separados por espacios o guiones, y fechas completas
   (año, mes y día). Descarta lo que sea claramente otra cosa (hashes,
   versiones, el correo `noreply` de los commits, códigos de carácter de
   `src/config/`). Lista el resto como archivo, línea y tipo, sin el valor.
   Control positivo: confirma que el patrón de correo encuentra una dirección
   ficticia de ejemplo pasada por la entrada estándar.
   Límite: esto no comprueba valores concretos; la cédula y la fecha de
   nacimiento no están escritas en ningún sitio con el que comparar.
6. **Contacto en el bundle.** Si la sección de contacto está montada en la
   aplicación, recuerda que toca repetir la verificación de
   `.claude/rules/contacto.md` sobre `dist/`. No la des por hecha.
7. **Tests sin trampas.**
   `git grep -nE "\.(only|skip)\(" -- '*.test.ts' '*.test.tsx'` no debe
   devolver nada. Control positivo obligatorio:
   `git ls-files -- '*.test.ts' '*.test.tsx'` debe listar `src/App.test.tsx`;
   si no aparece, el patrón no cubre todos los tests y la salida vacía no
   vale.
8. **Calidad.** `npm run lint`, `npm run typecheck`, `npm test` y
   `npm run build`. Informa el resultado de cada uno con sus cifras.

## Informe

Una tabla con una fila por paso: qué se comprobó, resultado (pasa, falla o
no se pudo comprobar) y la evidencia. Después:

- Si todo pasa: di que está listo y muestra el comando de push para que lo
  ejecute el autor. No lo ejecutes.
- Si algo falla o no se pudo comprobar: di que no está listo y qué falta.
