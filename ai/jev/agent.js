import { createInterface } from 'node:readline/promises';
import { experimental_evaluate as evaluate, generateText, stepCountIs, tool } from 'ai';
import { z } from 'zod';

export const CHAT_MODEL = process.env.CHAT_MODEL ?? 'anthropic/claude-haiku-4.5';
export const ROUTER_MODEL = 'typesafe-ai/jev';

// Tool descriptions: shared by the router (jev) and the chat model.
const desc = {
  list_products:
    "Lista o catálogo da loja: product_id, nome, tipo, preço, atributos e nota de cada produto, mais entrega e horário. Use antes de sugerir ou adicionar produtos; ofereça apenas o que ela devolver.",
  find_customer:
    "Procura o cadastro do cliente pelo telefone e devolve os pets já cadastrados. No WhatsApp o número de quem está falando já é conhecido — chame sem argumento algum e NÃO peça o telefone.",
  add_to_cart:
    "Adiciona um produto ao carrinho do cliente (soma à quantidade já existente). Use o product_id EXATO do catálogo. Devolve o carrinho completo com preços e total — use esse retorno, nunca a memória, para dizer o que está no carrinho.",
  remove_from_cart:
    "Remove um produto do carrinho. Sem quantity, tira o item inteiro; com quantity, reduz essa quantidade. Devolve o carrinho atualizado.",
  view_cart:
    "Devolve o carrinho atual: itens, quantidades, preço unitário, subtotal e total. O bloco \"Carrinho atual\" do contexto já traz esse estado — use esta ferramenta só se precisar reler o carrinho depois de alterá-lo nesta mensagem.",
  place_order:
    "Fecha o pedido com os itens do carrinho. Exige cliente identificado, data de entrega, cidade e endereço (se omitido, usa o endereço do cadastro). Se o cliente vai RETIRAR na loja, passe pickup=true e não informe endereço. Chame SOMENTE depois de o cliente confirmar explicitamente o resumo completo (itens, total, data e endereço ou retirada). Em sucesso o carrinho é esvaziado. Se o cliente não tem cadastro, passe name (e o endereço): a ferramenta cadastra ao fechar.",
  list_my_orders:
    "Lista os pedidos em aberto (pendentes ou confirmados, ainda não entregues) do cliente identificado, com os ids usados para cancelar. Não recebe argumento algum — nunca peça nem aceite um id do cliente.",
  cancel_order:
    "Cancela um pedido em aberto do próprio cliente. O id vem de list_my_orders. Confirme com o cliente antes — o cancelamento é imediato. Pedidos já entregues não podem ser cancelados.",
  update_order:
    "Altera um pedido em aberto do próprio cliente (id vem de list_my_orders): itens, data de entrega, endereço ou retirada na loja. Passe só o que muda. Em items, passe a lista COMPLETA final (o que ficar de fora é removido). Confirme com o cliente o resumo do que muda antes de chamar. Pedidos entregues ou cancelados não podem ser alterados.",
  escalate_to_human:
    "Flag a human attendant for something you cannot handle. This does NOT turn you off — keep helping if the customer later asks something you CAN do. Call it when: the request is outside your tools (professional/health advice, complaints, billing/refunds, talking to a person), a tool keeps failing, the request stays ambiguous after you clarified, or the customer is upset. Also when the customer keeps going off-topic — give ONE redirect, then escalate on the second. After calling, send ONE short message that a human will continue shortly, then stop.",
};

// ponytail: stub backend with a fake catalog/cart — swap execute() bodies for the real API.
const catalog = [
  { product_id: 'barril-pilsen-30l', nome: 'Barril Chopp Pilsen 30L', tipo: 'barril', preco: 450 },
  { product_id: 'barril-ipa-30l', nome: 'Barril Chopp IPA 30L', tipo: 'barril', preco: 590 },
  { product_id: 'chopeira-eletrica', nome: 'Aluguel chopeira elétrica', tipo: 'equipamento', preco: 80 },
];
const cart = new Map();
const cartView = () => {
  const items = [...cart].map(([id, qty]) => {
    const p = catalog.find((x) => x.product_id === id);
    return { ...p, quantity: qty, subtotal: p.preco * qty };
  });
  return { items, total: items.reduce((s, i) => s + i.subtotal, 0) };
};
const orderFields = {
  delivery_date: z.string().optional(),
  delivery_weekday: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_city: z.string().optional(),
  pickup: z.boolean().optional(),
};

const tools = {
  list_products: tool({
    description: desc.list_products,
    inputSchema: z.object({}),
    execute: async () => ({ products: catalog, entrega: 'Grátis na cidade', horario: 'Seg–Sáb 9h–19h' }),
  }),
  find_customer: tool({
    description: desc.find_customer,
    inputSchema: z.object({}),
    execute: async () => ({ found: false }),
  }),
  add_to_cart: tool({
    description: desc.add_to_cart,
    inputSchema: z.object({ product_id: z.string(), quantity: z.number().int().positive() }),
    execute: async ({ product_id, quantity }) => {
      if (!catalog.some((p) => p.product_id === product_id)) return { error: 'product_id inválido' };
      cart.set(product_id, (cart.get(product_id) ?? 0) + quantity);
      return cartView();
    },
  }),
  remove_from_cart: tool({
    description: desc.remove_from_cart,
    inputSchema: z.object({ product_id: z.string(), quantity: z.number().int().positive().optional() }),
    execute: async ({ product_id, quantity }) => {
      const left = quantity ? (cart.get(product_id) ?? 0) - quantity : 0;
      left > 0 ? cart.set(product_id, left) : cart.delete(product_id);
      return cartView();
    },
  }),
  view_cart: tool({ description: desc.view_cart, inputSchema: z.object({}), execute: async () => cartView() }),
  place_order: tool({
    description: desc.place_order,
    inputSchema: z.object({ ...orderFields, delivery_date: z.string(), notes: z.string().optional(), name: z.string().optional() }),
    execute: async (input) => {
      const order = { order_id: 'PED-1', ...input, ...cartView() };
      cart.clear();
      return order;
    },
  }),
  list_my_orders: tool({ description: desc.list_my_orders, inputSchema: z.object({}), execute: async () => ({ orders: [] }) }),
  cancel_order: tool({
    description: desc.cancel_order,
    inputSchema: z.object({ order_id: z.string() }),
    execute: async () => ({ error: 'pedido não encontrado' }),
  }),
  update_order: tool({
    description: desc.update_order,
    inputSchema: z.object({
      order_id: z.string(),
      items: z.array(z.object({ product_id: z.string(), quantity: z.number().int().positive() })).optional(),
      ...orderFields,
    }),
    execute: async () => ({ error: 'pedido não encontrado' }),
  }),
  escalate_to_human: tool({
    description: desc.escalate_to_human,
    inputSchema: z.object({ reason: z.string() }),
    execute: async () => ({ ok: true }),
  }),
};

const transcript = (messages) =>
  messages
    .map((m) => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`)
    .join('\n');

// jev picks the next action; the chat model is then forced to take exactly that action.
async function route(messages) {
  const { answers } = await evaluate({
    model: ROUTER_MODEL,
    state: `## Tools\n${Object.entries(desc).map(([n, d]) => `- ${n}: ${d}`).join('\n')}\n\n## Conversa\n${transcript(messages)}`,
    questions: {
      next_action: {
        type: 'choice',
        instructions:
          'Given the available tools and the conversation (including tool results already returned), what should the agent do next to answer the last customer message?',
        criteria: {
          ...desc,
          no_tool: 'No tool call needed — reply to the customer now (greet, clarify, ask for missing info, or answer using tool results already in the conversation).',
        },
      },
    },
  });
  return answers.next_action.choice;
}

export const resetCart = () => cart.clear();

// One customer turn: returns the reply, the new messages to append, and the jev decision per step.
export async function reply(messages) {
  const routes = [];
  const result = await generateText({
    model: CHAT_MODEL,
    instructions:
      'Você é o atendente da Cervejaria Terra Boa no WhatsApp. Responda em português, curto e simpático. Use só dados devolvidos pelas ferramentas.',
    messages,
    tools,
    stopWhen: stepCountIs(6), // ponytail: hard cap on router→tool loops; raise if real flows need more hops
    prepareStep: async ({ messages: stepMessages }) => {
      const choice = await route(stepMessages);
      routes.push(choice);
      return choice === 'no_tool' ? { toolChoice: 'none' } : { toolChoice: { type: 'tool', toolName: choice } };
    },
  });
  const trace = result.steps.map((step, i) => ({
    route: routes[i],
    calls: step.toolCalls.map((c) => ({ tool: c.toolName, input: c.input })),
    results: step.toolResults.map((r) => ({ tool: r.toolName, output: r.output })),
  }));
  return { text: result.text, messages: result.response.messages, trace };
}

if (import.meta.main) {
  const messages = [];
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(`chat: ${CHAT_MODEL} | router: ${ROUTER_MODEL} — Ctrl+C para sair\n`);
  while (true) {
    messages.push({ role: 'user', content: await rl.question('Cliente: ') });
    const r = await reply(messages);
    messages.push(...r.messages);
    for (const t of r.trace) console.log(`  [jev → ${t.route}]`);
    console.log(`Agente: ${r.text}\n`);
  }
}
