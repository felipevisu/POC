# code-graph — trace-flow

Skill do Claude Code que rastreia o fluxo de um dado num sistema legado **Java + Struts (1 ou 2)**: da URL da tela até o banco (JDBC) ou API REST externa, e de volta até o campo na JSP. O resultado é um grafo HTML interativo, em que cada nó aponta para `arquivo:linha` e traz a explicação do que acontece ali, as regras de negócio, os pontos de atenção e uma sugestão para a migração.

Feito para a migração do legado Struts para backend + frontend modernos: em vez de ler dezenas de classes para descobrir de onde vem um campo, você pede o trace e recebe o caminho e as regras.

## Instalação

```bash
cp -r .claude/skills/trace-flow ~/.claude/skills/
```

Abra uma sessão nova do Claude Code depois de copiar. Para usar só num projeto, copie para `<projeto>/.claude/skills/`.

## Uso

Na raiz do repositório legado:

```bash
claude
```

```
/trace-flow http://servidor/app/cliente/detalhe.do?id=123 campo Saldo
```

ou em texto livre: *"de onde vem o campo Saldo em /app/cliente/detalhe.do?id=123?"*

- Use a URL completa do navegador. Parâmetros como `method=...` definem qual método da Action roda.
- Prefira **um campo por vez**: o grafo fica menor e o trace, mais rápido.
- A saída fica em `.trace-flow/<tela>/` (`graph.json` e `trace.html`), e o HTML abre no navegador.

## Como funciona

| Etapa | Quem faz |
|---|---|
| URL → Action, método, form, forwards, JSPs (Tiles, DispatchAction, wildcards do Struts 2) | `scripts/resolve_url.py` |
| O que a tela exibe: tags `bean:`/`html:`/`logic:`/`s:`, EL, scriptlets, includes | `scripts/jsp_bindings.py` |
| Action → Service → DAO → SQL/tabela ou API REST, ramos e transformações | Claude, guiado pela `SKILL.md` |
| Explicações, regras de negócio, pontos de atenção e sugestão de migração | Claude, guiado pela `SKILL.md` |
| Cada nó precisa existir no código (`arquivo:linha` + trecho literal) e ter explicação | `scripts/validate_graph.py`, que reprova até o grafo ficar correto |
| `graph.json` → HTML interativo (Cytoscape + dagre) | `scripts/render.py` + `template/trace.html` |

Os scripts usam só Python 3 (stdlib). Também podem ser rodados sozinhos para depurar:

```bash
S=~/.claude/skills/trace-flow/scripts
python3 $S/resolve_url.py "http://servidor/app/cliente/detalhe.do?id=1" --root .
python3 $S/jsp_bindings.py caminho/da/tela.jsp
python3 $S/validate_graph.py .trace-flow/<tela>/graph.json --root .
python3 $S/render.py .trace-flow/<tela>/graph.json --root .
```

## Lendo o HTML

- **Painel inicial:** resumo, regras de negócio, pontos de atenção e sugestões de migração. Cada item é clicável e leva ao nó.
- **Grafo:** o fluxo vai da requisição (esquerda) à tela (direita), com cor por camada. Linha tracejada é um ramo (`if`); linha laranja é uma transformação do dado.
- **Clique num nó:** destaca de onde o dado vem e para onde vai, e mostra a explicação, os dados que entram e saem, as regras, os pontos de atenção, a nota de migração e o código com a linha marcada. Clique no fundo para voltar ao painel inicial.
- **Busca:** pula para o nó pelo nome.

## Exemplo

`examples/legacy-app/` é um mini app Struts 1 (Tiles, JDBC, REST) com uma tela de cliente. `examples/expected/` tem o gabarito do trace do campo **Saldo**, escrito à mão para mostrar o resultado esperado:

```bash
open examples/expected/trace.html
```

Para ver a skill gerar o grafo sozinha e comparar com o gabarito:

```bash
cd examples/legacy-app && claude
# /trace-flow /app/cliente/detalhe.do?id=1 campo Saldo
```

## Testes

```bash
python3 -m unittest discover tests
```

## Limitações conhecidas

- Struts 2 por anotações (`@Action`) ou convention plugin não está em XML: a skill orienta o Claude a procurar por grep.
- Módulos do Struts 1 com prefixo no `web.xml`: a URL casa pelo final do caminho, o que costuma bastar.
- Análise só estática: o grafo mostra todos os ramos possíveis, não o que executou para um usuário específico.
- Explicações e regras são escritas pela IA. O validador garante que cada nó existe no código, mas a interpretação deve ser revisada.
