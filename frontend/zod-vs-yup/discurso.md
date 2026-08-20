# Discurso — Zod vs Yup (apresentação com código ao vivo)

> Roteiro falado, em português, seguindo os arquivos do projeto na ordem: demo1 → demo5, depois demo0 (servidor com Swagger), e o fechamento sobre dependências. Abra cada arquivo lado a lado (`yup.ts` e `zod.ts`) enquanto fala.

---

## Abertura

Pessoal, hoje eu quero comparar duas bibliotecas de validação de schema para TypeScript: Yup e Zod. As duas resolvem o mesmo problema — validar dados em runtime e, de quebra, gerar os tipos do TypeScript a partir do schema. Mas elas tomam decisões de design bem diferentes, e essas decisões afetam o dia a dia de quem escreve API, formulário, qualquer coisa que receba dado de fora.

Em vez de slides, eu vou mostrar código de verdade. São seis demos pequenas, cada uma isola uma diferença. No final eu fecho com um argumento que pra mim é decisivo.

---

## Demo 1 — Inferência de tipos: o padrão de cada uma

*(abrir `demo1/yup.ts` e `demo1/zod.ts`)*

Olhem esses dois schemas. Eles são visualmente idênticos: um objeto com `name` string e `age` number. Agora olhem o tipo que cada biblioteca infere.

No Yup, tudo sai opcional: `name?: string | undefined`, `age?: number | undefined`. No Zod, tudo sai obrigatório: `name: string`, `age: number`.

Ou seja: o mesmo schema "de cara" produz tipos opostos. No Yup, campo é opcional por padrão e você precisa lembrar de chamar `.required()` em cada um. No Zod, campo é obrigatório por padrão e você marca `.optional()` só onde realmente quer opcional.

Pensem em como são os tipos das suas APIs: a maioria dos campos é obrigatória. O padrão do Zod combina com a realidade; o do Yup te obriga a escrever `.required()` em quase toda linha — e o campo que você esquecer vira um `undefined` silencioso no seu tipo.

---

## Demo 2 — Expressando a mesma coisa

*(abrir `demo2/yup.ts` e `demo2/zod.ts`)*

Aqui os dois chegam no mesmo tipo final: `email` obrigatório, `nickname` opcional. A diferença é a direção da anotação.

No Yup eu escrevi `yup.string().email().required()` — precisei do `.required()` explícito. No Zod eu escrevi `z.email()` e pronto; quem ganhou anotação foi o `nickname`, com `.optional()`.

Reparem também no detalhe do `z.email()`: no Zod moderno, email é um tipo de primeira classe, não um modificador em cima de string. É pouca coisa, mas mostra a filosofia: o schema descreve o dado, não uma cadeia de validações.

---

## Demo 3 — Tratamento de erros

*(abrir `demo3/yup.ts` e `demo3/zod.ts`)*

Agora vamos passar dado inválido de propósito: `{ name: 123, age: "x" }` num schema que espera `email` e `nickname`.

No Yup, `validate()` lança exceção. Então o fluxo é try/catch, com `instanceof yup.ValidationError` pra ter certeza do tipo do erro. E tem uma pegadinha importante: por padrão o Yup para no primeiro erro. Se você quer todos os erros de uma vez — que é o que todo formulário e toda API precisam — tem que lembrar de passar `{ abortEarly: false }`. Quem esquece só descobre em produção, quando o usuário corrige um campo e aparece o erro do próximo.

No Zod, `safeParse()` nunca lança. Ele devolve um objeto resultado: ou `success: true` com o dado tipado, ou `success: false` com `error.issues` — sempre com todos os erros, sem flag nenhuma. O fluxo vira um `if`, que o TypeScript ainda usa pra estreitar o tipo: dentro do `if (result.success)`, `result.data` já é o tipo validado.

---

## Demo 4 — Síncrono vs assíncrono

*(abrir `demo4/yup.ts` e `demo4/zod.ts`)*

Essa diferença é sutil mas aparece em todo lugar: o Yup é assíncrono por padrão. `validate()` sempre devolve uma Promise, mesmo pra uma regra puramente síncrona como `min(3)`. Olhem o console: sem `await`, você recebe uma Promise, não o dado. Existe o `validateSync()`, mas ele lança exceção se o schema tiver qualquer teste assíncrono — então você nunca tem certeza se pode usar.

O Zod é o contrário: síncrono por padrão. `safeParse()` devolve o resultado na hora, sem `await`, sem Promise. E quando você adiciona lógica assíncrona — tipo um `refine` que consulta o banco pra ver se o username já existe — o Zod te força a trocar explicitamente pra `safeParseAsync()`. Se você tentar o `safeParse` síncrono num schema assíncrono, ele lança na hora, em desenvolvimento, não silenciosamente em produção.

Resumindo: com Yup você paga o imposto da Promise em toda validação. Com Zod, assíncrono é opt-in e a fronteira fica explícita no código.

---

## Demo 5 — Validação condicional

*(abrir `demo5/yup.ts` e `demo5/zod.ts`)*

Cenário clássico: um pedido tem `deliveryMethod` que pode ser `pickup` ou `ship`, e o `address` só é obrigatório quando é entrega.

O Yup tem isso embutido, o famoso `.when()`: "quando `deliveryMethod` for `ship`, o address é required; senão, descarta o campo". É ergonômico, funciona bem em runtime. Mas olhem o tipo inferido no final do arquivo: `address?: string`. Opcional. O sistema de tipos não enxerga a condição — o TypeScript deixa você criar um pedido `ship` sem endereço sem reclamar.

O Zod não tem `.when()`. A forma idiomática é uma discriminated union: dois objetos, um pra `pickup` sem address, outro pra `ship` com address obrigatório. E aí vejam o tipo inferido: `{ deliveryMethod: "pickup" } | { deliveryMethod: "ship"; address: string }`. A condição vive no próprio tipo. Se o código tratar um pedido `ship`, o TypeScript garante que o address existe.

Pra condições que não cabem numa union, o Zod tem o `.refine()` como fallback — validação em runtime, igual ao `.when()`, com a mesma limitação de tipo. Mas o caminho principal é melhor: a regra de negócio vira tipo.

---

## Demo 0 — Comportamento na fronteira da API (ao vivo)

*(rodar `demo0/server.ts` e abrir http://localhost:3000/docs)*

Pra fechar a parte técnica, um servidor Express com os dois schemas lado a lado, e Swagger pra gente testar ao vivo. Mesmo schema de usuário: `name`, `age` inteiro maior ou igual a 18, `email`.

Três experimentos:

Primeiro, mando `age` como string: `"30"` com aspas. O Yup **passa** — ele faz cast silencioso de string pra número. O Zod **rejeita** — sem coerção implícita. O Yup nasceu para formulários, onde tudo chega como string e o cast é um recurso; mas numa API, cast silencioso significa aceitar payload que o contrato não previu.

Segundo, mando uma chave extra: `role: "admin"`. O Yup mantém a chave no dado de saída. O Zod remove. De novo: pra uma API, deixar chave desconhecida passar é risco — é assim que nasce mass assignment.

Terceiro, reparem como esse Swagger foi gerado: `z.toJSONSchema(zodUser)`. O Zod converte schema pra JSON Schema nativamente, sem biblioteca de terceiros. Com Yup, você precisa de um pacote externo pra isso.

---

## Fechamento — zero dependências

Último ponto, e pra mim ele resume a filosofia das duas bibliotecas.

Abram o `package.json` de cada uma. O Yup depende de quatro pacotes: `property-expr`, `tiny-case`, `toposort` e `type-fest`. O Zod... não depende de nada. **Zero dependências.**

Por que isso importa?

Primeiro, superfície de ataque. Cada dependência transitiva é um pacote a mais que pode ser comprometido num ataque de supply chain, um pacote a mais pra auditar, um CVE a mais pra acompanhar. Com o Zod, validar dados — que é literalmente a porta de entrada da sua aplicação, o código que toca dado não confiável — não puxa nenhum código de terceiros junto.

Segundo, previsibilidade. Sem dependências, não existe conflito de versão com o resto da sua árvore, não existe breaking change vindo de um pacote que você nem sabia que usava.

Terceiro, portabilidade. A biblioteca inteira é um import autocontido. Funciona igual no Node, no browser, em edge runtime, sem polyfill, sem surpresa.

Então recapitulando: o Zod tem defaults que combinam com APIs — obrigatório por padrão, síncrono por padrão, sem cast silencioso, erros como valor em vez de exceção, condições que viram tipos. E entrega tudo isso sem trazer uma única dependência junto.

O Yup continua sendo uma boa biblioteca, especialmente no mundo de formulários onde ele nasceu. Mas pra código novo, principalmente em fronteira de API, minha recomendação é Zod.

Obrigado! Perguntas?
