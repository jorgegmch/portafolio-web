# Ejemplo de Java

`examples/java/Developer.java` es el programa que la terminal de «Sobre mí» muestra ya ejecutado: un `record` con cinco componentes (`fullName`, `age`, `location`, `role`, `passion`) y un `main` que imprime una línea por campo. La terminal de la web pinta esa misma salida a partir de `src/config/developer.ts`; el archivo de Java existe para que el comando `java Developer` sea real y cualquiera pueda compilarlo y obtener lo mismo.

## Compilar y ejecutar

Siempre se compila con `-encoding UTF-8`. Los comandos compilan en la carpeta temporal del sistema para no dejar ningún `.class` en el repo; `javac -d` crea la carpeta si no existe.

**cmd.exe**, desde la raíz del repo:

```bat
javac -encoding UTF-8 -d "%TEMP%\developer-java" examples\java\Developer.java
cd /d "%TEMP%\developer-java"
java Developer
```

**PowerShell**, desde la raíz del repo:

```powershell
javac -encoding UTF-8 -d "$env:TEMP\developer-java" examples\java\Developer.java
Set-Location "$env:TEMP\developer-java"
java Developer
```

**Git Bash**, desde la raíz del repo: hay que añadir `-Dfile.encoding=UTF-8` al ejecutar.

```bash
javac -encoding UTF-8 -d "$TEMP/developer-java" examples/java/Developer.java
cd "$TEMP/developer-java"
java -Dfile.encoding=UTF-8 Developer
```

La primera línea debe decir `full name: Jorge Alberto Gómez Chaparro`, con la «ó» bien.

## La «ó»: qué se midió y qué se vio

Medido con JDK 17.0.19 en Windows 11. «Medido» significa que se registraron los bytes que Java escribió para la «ó»; «visto» significa que el autor ejecutó los comandos y leyó la salida en la ventana.

| Consola | Codificación de salida de Java | Bytes de la «ó» | Medido | Visto a ojo |
|---|---|---|---|---|
| cmd.exe | `cp850` (hay consola) | `A2`, que es «ó» en la página de códigos 850 | Sí | Sí, bien |
| PowerShell | `cp850` (hay consola) | `A2` | Sí | Sí, bien |
| Git Bash, sin `-Dfile.encoding` | `Cp1252` (Java no detecta consola) | `F3`, que no es UTF-8 válido | Sí | No |
| Git Bash, con `-Dfile.encoding=UTF-8` | UTF-8 | `C3 B3`, la «ó» en UTF-8 | Sí | No |

En Git Bash solo hay medida. Si su terminal trabaja en UTF-8 (`locale charmap` devolvió `UTF-8` en el shell de Git Bash donde se midió), `F3` no puede mostrarse como «ó» y `C3 B3` sí; nadie lo comprobó a ojo en una ventana.

### Sin `-encoding`

La documentación de `javac` 17 dice: «If the -encoding option is not specified, then the platform default converter is used» (<https://docs.oracle.com/en/java/javase/17/docs/specs/man/javac.html>, opción `-encoding`). En este equipo esa codificación es windows-1252, que lee los dos bytes UTF-8 de la «ó» (`C3 B3`) como dos caracteres, U+00C3 y U+00B3. Medido: compilado sin `-encoding`, la cadena dentro del programa lleva esos dos caracteres en lugar de la «ó».

En Git Bash la salida parece correcta por casualidad: al imprimir esos dos caracteres en windows-1252 salen otra vez `C3 B3`, y la terminal los muestra como «ó». Los dos errores se cancelan, pero el dato dentro del programa está mal. Por eso `-encoding UTF-8` va siempre, en cualquier consola.

### Sin escapes `\u`

El nombre va escrito con su tilde, no como `Gómez`. El escape compila y se imprime bien, pero el archivo deja de mostrar el nombre tal cual y ya no coincide con el de `src/config/site.ts`. El test lo prohíbe.

## Versión mínima de Java

Java 16: es la primera versión en la que `record` forma parte del lenguaje sin opciones de vista previa.

Fuente: JEP 395, «Records» (<https://openjdk.org/jeps/395>). En su ficha, «Status: Closed / Delivered» y «Release: 16». En «History»: «This JEP proposes to finalize the feature in JDK 16». La misma sección indica que en JDK 14 y JDK 15 los records llegaron solo como «preview feature» (JEP 359 y JEP 384).

El ejemplo se compiló y ejecutó con JDK 17.0.19; no se probó con JDK 16.

## La salida no se traduce

Lo que imprime el programa va en inglés en los dos idiomas de la web, incluidos las etiquetas y «Coding the future»: es la salida de un programa, no texto de la interfaz. Lo único que se traduce es el nombre accesible de la figura que la contiene, `about.terminalLabel` en `src/i18n/es.ts` y `src/i18n/en.ts`.

## La edad

En el archivo de Java la edad es un literal y se actualiza a mano en cada cumpleaños. En la web es en vivo: la calcula `useAge` y al DOM solo llega el número. El test comprueba solo la forma de la edad (un entero de una a tres cifras), no su valor, así que una edad desfasada no lo hace fallar.

Al actualizarla no se escribe la fecha de nacimiento en ningún sitio: ni en el archivo, ni en comentarios, ni en el mensaje del commit.

## Fuera de lint, build y capas

`examples/` está fuera de `src/`:

- ESLint no revisa archivos `.java`.
- `tsc -b` solo incluye `src/` y los archivos de configuración, y `vite build` solo empaqueta lo que se importa desde `index.html`.
- Las reglas de capas de `eslint.config.js` cubren solo carpetas de `src/`.
- Ni los tests ni el build compilan Java.

## Qué lo ata a `config/`

`src/config/developerJava.test.ts` lee el archivo como bytes y comprueba:

- **Codificación:** que es UTF-8 válido, que «Gómez» ocupa los bytes `47 C3 B3 6D 65 7A`, que no hay escapes `\u` y que no empieza con BOM (`javac` lo rechaza con `illegal character: '﻿'`).
- **El record:** que se llama `Developer`, que `developer.command` es `java Developer`, que sus componentes son `developer.fields` en el mismo orden y que la edad es `int` y el resto `String`.
- **Valores:** que cada argumento es el valor de `developer.values` de su campo, y que el nombre, la ubicación y el rol coinciden tal cual con `src/config/site.ts`.
- **Salida:** una línea por campo, con la etiqueta de `developer.labels`, en orden.
- **Datos personales:** sin arrobas ni correo; el único número del archivo es la edad, y nada tiene forma de fecha.

Si cambia el nombre, la ubicación o el rol en `site.ts`, o un campo o una etiqueta en `developer.ts`, el test falla hasta que se actualiza también el archivo de Java.
