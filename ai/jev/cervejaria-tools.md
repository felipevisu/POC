## Tools disponíveis (modo loja)

| Tool | Description enviada ao LLM | Parâmetros |
|---|---|---|
| `list_products` | Lista o catálogo da loja: product_id, nome, tipo, preço, atributos e nota de cada produto, mais entrega e horário. Use antes de sugerir ou adicionar produtos; ofereça apenas o que ela devolver. | — |
| `find_customer` | Procura o cadastro do cliente pelo telefone e devolve os pets já cadastrados. No WhatsApp o número de quem está falando já é conhecido — chame sem argumento algum e NÃO peça o telefone. | `phone` (removido no WhatsApp) |
| `add_to_cart` | Adiciona um produto ao carrinho do cliente (soma à quantidade já existente). Use o product_id EXATO do catálogo. Devolve o carrinho completo com preços e total — use esse retorno, nunca a memória, para dizer o que está no carrinho. | `product_id`*, `quantity`* |
| `remove_from_cart` | Remove um produto do carrinho. Sem quantity, tira o item inteiro; com quantity, reduz essa quantidade. Devolve o carrinho atualizado. | `product_id`*, `quantity` |
| `view_cart` | Devolve o carrinho atual: itens, quantidades, preço unitário, subtotal e total. O bloco "Carrinho atual" do contexto já traz esse estado — use esta ferramenta só se precisar reler o carrinho depois de alterá-lo nesta mensagem. | — |
| `place_order` | Fecha o pedido com os itens do carrinho. Exige cliente identificado, data de entrega, cidade e endereço (se omitido, usa o endereço do cadastro). Se o cliente vai RETIRAR na loja, passe pickup=true e não informe endereço. Chame SOMENTE depois de o cliente confirmar explicitamente o resumo completo (itens, total, data e endereço ou retirada). Em sucesso o carrinho é esvaziado. Se o cliente não tem cadastro, passe name (e o endereço): a ferramenta cadastra ao fechar. | `delivery_date`*, `delivery_weekday`, `delivery_address`, `delivery_city`, `pickup`, `notes`, `name`, `phone` (só web) |
| `list_my_orders` | Lista os pedidos em aberto (pendentes ou confirmados, ainda não entregues) do cliente identificado, com os ids usados para cancelar. Não recebe argumento algum — nunca peça nem aceite um id do cliente. | — |
| `cancel_order` | Cancela um pedido em aberto do próprio cliente. O id vem de list_my_orders. Confirme com o cliente antes — o cancelamento é imediato. Pedidos já entregues não podem ser cancelados. | `order_id`* |
| `update_order` | Altera um pedido em aberto do próprio cliente (id vem de list_my_orders): itens, data de entrega, endereço ou retirada na loja. Passe só o que muda. Em items, passe a lista COMPLETA final (o que ficar de fora é removido). Confirme com o cliente o resumo do que muda antes de chamar. Pedidos entregues ou cancelados não podem ser alterados. | `order_id`*, `items[]`, `delivery_date`, `delivery_weekday`, `delivery_address`, `delivery_city`, `pickup` |
| `escalate_to_human` | Flag a human attendant for something you cannot handle. This does NOT turn you off — keep helping if the customer later asks something you CAN do. Call it when: the request is outside your tools (professional/health advice, complaints, billing/refunds, talking to a person), a tool keeps failing, the request stays ambiguous after you clarified, or the customer is upset. Also when the customer keeps going off-topic — give ONE redirect, then escalate on the second. After calling, send ONE short message that a human will continue shortly, then stop. | `reason`* |

## Conversa

Cliente: Ola tudo bem
Agente: Bem vindo a cervejaria terra boa, em que posso ajudar?
Cliente: Voces tem barril de chopp? quero fazer uma festa esse fds de aniversario e servir chopp pra galera