---
name: close-phase
description: Cierra una fase de portafolio-web actualizando docs/PLAN.md y docs/MEMORY.md en un commit docs propio, tras la aprobación del autor.
argument-hint: "[número de fase]"
disable-model-invocation: true
---

# Cierre de la fase $ARGUMENTS

Deja el repo en un estado desde el que una sesión nueva pueda retomar el
trabajo leyendo solo `docs/PLAN.md` y `docs/MEMORY.md`.

## Nunca

- No hagas push.
- No uses `git add .`, `git add -A` ni `--no-verify`.
- No borres archivos. Si hay algo sin versionar, avisa y deja que decida el
  autor.
- No toques código ni tests: este cierre solo edita documentación.
- No edites nada fuera del repo.
- No escribas datos personales: en los documentos se nombra el campo, no su
  valor.
- No commitees sin que el autor haya aprobado el diff.

## Pasos

1. **Estado.** `git status -sb`, `git branch -vv` y `git log --oneline -5`.
   Si el árbol no está limpio, detente y lista lo que sobra.
2. **Calidad.** `npm run lint`, `npm run typecheck`, `npm test` y
   `npm run build`. Si algo falla, detente e infórmalo: una fase no se cierra
   en rojo.
3. **Commits de la fase.** Lista con `git log --oneline` los commits desde el
   cierre de la fase anterior, en orden, con su hash.
4. **Pendientes.** Lee primero `docs/PLAN.md`, `docs/MEMORY.md` y `AGENTS.md`:
   una sesión nueva no ve la conversación en la que se hizo la fase. Con eso
   y con el historial de git, reúne las deudas, las decisiones con su porqué,
   los riesgos, lo que quedó sin revisar a ojo y los encargos aprobados que
   aún no se ejecutan. Pregunta al autor solo lo que no conste ahí; no lo
   inventes.
5. **`docs/PLAN.md`.** Marca la fase como cerrada, añade la tabla de commits
   con sus hashes, actualiza deudas, decisiones pendientes y riesgos, y deja
   una sección «Cómo retomar» con el siguiente paso exacto. Los encargos
   pendientes se copian literalmente. La numeración de fases la manda este
   archivo: si un encargo nombra otra, se anota a qué fase corresponde aquí.
6. **`docs/MEMORY.md`.** Actualiza el estado, las decisiones con su porqué y
   los aprendizajes. Respeta el máximo de ~50 líneas que fija `AGENTS.md`:
   resume o quita lo que ya no aporte, y no dupliques lo que ya está en
   `PLAN.md`.
7. **Reglas permanentes.** Si algo de la fase debería pasar a `AGENTS.md` o a
   `.claude/rules/`, proponlo aparte; no lo edites en este commit salvo que
   el autor lo pida.
8. **Verificación desde disco.** En cada archivo editado: sin «Ã», sin
   retornos de carro y sin BOM.
9. **Diff y espera.** Muestra `git diff` completo y detente hasta que el
   autor apruebe.
10. **Commit.** Tras la aprobación: `git add` con los nombres explícitos de
    los archivos editados, y un commit
    `docs: update plan and memory after closing Phase $ARGUMENTS`, sin líneas
    de atribución. Después, `git show --stat HEAD` y `git status -sb`.

## Informe

Qué se cerró, la tabla de commits, lo que quedó pendiente y el siguiente
paso. Si no pudiste comprobar algo, dilo.
