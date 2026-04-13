# cron-parser-lite

Parser minimalista de expressoes cron (5 campos) e calculo da proxima execucao.

## Instalacao

```bash
npm install cron-parser-lite
```

## Uso

```ts
import { parse, nextRun, matches } from "cron-parser-lite";

parse("*/15 9-17 * * 1-5");
nextRun("0 9 * * 1");
matches("0 0 * * *", new Date());
```

## API

- `parse(expr)` — retorna sets dos campos `minute hour dom month dow`.
- `nextRun(expr, from?)` — proxima `Date` que satisfaz a expressao.
- `matches(expr, date)` — se a data bate com a expressao.

Suporta `*`, `,`, `-`, `/` e numeros.

## Licenca

MIT
