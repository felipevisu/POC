import { createInterface } from 'node:readline/promises';
import { experimental_evaluate as evaluate, generateText, stepCountIs, tool } from 'ai';
import { z } from 'zod';
import * as loans from './loans.js';

export const CHAT_MODEL = process.env.CHAT_MODEL ?? 'anthropic/claude-haiku-4.5';
export const ROUTER_MODEL = 'typesafe-ai/jev';
export const USE_JEV = process.env.ROUTER !== 'off';
export const USE_CACHE = process.env.CACHE === 'on';

const desc = {
  get_loan_info:
    'Returns the loan product rules: amount and installment ranges, rates by risk tier, taxes (IOF/CET), eligibility rules, withdrawal right and the step-by-step hiring process. Use for general questions ("how does it work?", "what are the rates?") before the customer is identified.',
  find_customer:
    'Looks up the customer by CPF (11 digits, with or without punctuation). Starts the session for that customer. Returns found=false if the CPF is not registered — then offer registration.',
  register_customer:
    'Registers a new customer whose CPF was not found. Needs full name, birth_date (YYYY-MM-DD), mobile phone with area code, e-mail and monthly_income (BRL). Ask for all fields before calling; never invent them.',
  send_verification_code:
    'Sends a 6-digit SMS code to the phone on file to verify identity. Call right after the customer is found/registered and before anything that shows personal or credit data.',
  verify_identity:
    'Checks the SMS code the customer typed. Only call with a code the customer sent in the chat. 3 wrong attempts lock the identity.',
  update_income:
    "Updates the verified customer's monthly income (e.g. they got a raise). Invalidates the current credit analysis.",
  run_credit_analysis:
    'Queries the credit bureau and the internal policy for the verified customer. Returns approved (risk tier, monthly rate, max amount, max installments, max monthly payment) or denied with the reason. Required before any simulation.',
  simulate_loan:
    'Simulates a loan for the verified, approved customer: amount (BRL) and installments (integer). Returns an offer_id with monthly payment, rate, IOF, CET, total payable and first due date. Call once per option the customer wants to compare. Use only numbers returned here when talking about the loan.',
  submit_income_proof:
    "Registers the customer's proof of income (doc_type: payslip, bank_statement or tax_return). Required when the chosen offer has requires_income_proof=true. Call when the customer says they sent/uploaded the document.",
  create_contract:
    'Creates the contract from an offer_id and the PIX key where the money will be paid. Call ONLY after the customer explicitly confirms the chosen offer (amount, installments, monthly payment, CET) and gives a PIX key. Sends an SMS signing code.',
  sign_contract:
    'Signs the contract with the SMS code the customer typed, activates the loan and pays out via PIX immediately. Only with a code the customer sent in the chat.',
  list_my_loans:
    "Lists the verified customer's loans (active, cancelled) with ids, amounts, installments paid and next due date. Takes no arguments.",
  get_installment_schedule: 'Returns the full installment schedule (due dates, interest, principal, balance, status) of one loan_id from list_my_loans.',
  quote_early_payoff: 'Quotes the amount to pay off an active loan today and the interest saved. loan_id from list_my_loans.',
  cancel_loan:
    'Cancels a loan under the 7-day right of withdrawal (customer returns the money, no interest). Confirm with the customer first — it is immediate. After 7 days it fails: offer quote_early_payoff instead.',
  escalate_to_human:
    'Flags a human agent. Call when: the customer asks for a person, complains, disputes a charge, the identity got locked, a tool keeps failing, or the request is outside these tools (e.g. renegotiating overdue debt, mortgage, investments). After calling, send ONE short message that a human will continue shortly.',
};

export const TOOL_NAMES = Object.keys(desc);

const run = (fn) => async (input) => {
  try {
    return fn(input);
  } catch (err) {
    return { error: err.message };
  }
};
const none = z.object({});
const loanId = z.object({ loan_id: z.string() });

const tools = {
  get_loan_info: tool({ description: desc.get_loan_info, inputSchema: none, execute: run(loans.getLoanInfo) }),
  find_customer: tool({ description: desc.find_customer, inputSchema: z.object({ cpf: z.string() }), execute: run(loans.findCustomer) }),
  register_customer: tool({
    description: desc.register_customer,
    inputSchema: z.object({
      name: z.string(),
      birth_date: z.string().describe('YYYY-MM-DD'),
      phone: z.string(),
      email: z.string(),
      monthly_income: z.number(),
      cpf: z.string().optional().describe('Defaults to the CPF just searched'),
    }),
    execute: run(loans.registerCustomer),
  }),
  send_verification_code: tool({ description: desc.send_verification_code, inputSchema: none, execute: run(loans.sendVerificationCode) }),
  verify_identity: tool({ description: desc.verify_identity, inputSchema: z.object({ code: z.string() }), execute: run(loans.verifyIdentity) }),
  update_income: tool({ description: desc.update_income, inputSchema: z.object({ monthly_income: z.number() }), execute: run(loans.updateIncome) }),
  run_credit_analysis: tool({ description: desc.run_credit_analysis, inputSchema: none, execute: run(loans.runCreditAnalysis) }),
  simulate_loan: tool({
    description: desc.simulate_loan,
    inputSchema: z.object({ amount: z.number(), installments: z.number().int(), purpose: z.string().optional() }),
    execute: run(loans.simulateLoan),
  }),
  submit_income_proof: tool({
    description: desc.submit_income_proof,
    inputSchema: z.object({ doc_type: z.enum(['payslip', 'bank_statement', 'tax_return']) }),
    execute: run(loans.submitIncomeProof),
  }),
  create_contract: tool({
    description: desc.create_contract,
    inputSchema: z.object({ offer_id: z.string(), pix_key: z.string() }),
    execute: run(loans.createContract),
  }),
  sign_contract: tool({
    description: desc.sign_contract,
    inputSchema: z.object({ contract_id: z.string(), code: z.string() }),
    execute: run(loans.signContract),
  }),
  list_my_loans: tool({ description: desc.list_my_loans, inputSchema: none, execute: run(loans.listMyLoans) }),
  get_installment_schedule: tool({ description: desc.get_installment_schedule, inputSchema: loanId, execute: run(loans.getInstallmentSchedule) }),
  quote_early_payoff: tool({ description: desc.quote_early_payoff, inputSchema: loanId, execute: run(loans.quoteEarlyPayoff) }),
  cancel_loan: tool({ description: desc.cancel_loan, inputSchema: loanId, execute: run(loans.cancelLoan) }),
  escalate_to_human: tool({ description: desc.escalate_to_human, inputSchema: z.object({ reason: z.string() }), execute: async () => ({ ok: true, ticket: 'HUM-' + Date.now() }) }),
};

const INSTRUCTIONS = `You are the loan assistant of Lumen Crédito (a fictional bank — this is a demo with mock data).
Always reply in English (the bank and data are Brazilian, but this assistant speaks English), short and friendly, like a chat message.
Hiring flow, in order: CPF → find_customer (or register_customer) → send_verification_code → verify_identity → run_credit_analysis → simulate_loan (as many options as the customer wants) → submit_income_proof if the offer requires it → confirm the chosen offer and ask for the PIX key → create_contract → sign_contract with the SMS code.
Rules:
- Never skip steps and never invent numbers, ids or codes: use only what tools return.
- Always show amount, installments, monthly payment, CET and total payable before asking for confirmation.
- Ask for missing information instead of guessing. When a tool returns an error, explain it in plain words and propose the next step.
- Do not reveal full CPF, phone or internal scores.`;

const gatewayCost = (meta) => Number(meta?.gateway?.cost ?? 0);

const transcript = (messages) =>
  messages
    .map((m) => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`)
    .join('\n');

async function route(messages) {
  const { answers, usage, providerMetadata } = await evaluate({
    model: ROUTER_MODEL,
    state: `## Tools\n${Object.entries(desc).map(([n, d]) => `- ${n}: ${d}`).join('\n')}\n\n## Conversation\n${transcript(messages)}`,
    questions: {
      next_action: {
        type: 'choice',
        instructions:
          'Given the available tools and the conversation (including tool results already returned), what should the loan agent do next to answer the last customer message?',
        criteria: {
          ...desc,
          no_tool: 'No tool call needed — reply to the customer now (greet, clarify, ask for missing info such as CPF, codes, PIX key or confirmation, or answer using tool results already in the conversation).',
        },
      },
    },
  });
  return { choice: answers.next_action.choice, usage, cost: gatewayCost(providerMetadata) };
}

const SOFT_ROUTING_MODELS = new Set(['anthropic/claude-opus-5.5', 'anthropic/claude-sonnet-5.5']);
export const jevRouting = (model) => (SOFT_ROUTING_MODELS.has(model) ? 'soft' : 'forced');

export const reset = () => loans.reset();
export const state = () => loans.state();

export async function reply(messages, { useJev = USE_JEV, model = CHAT_MODEL, cache = USE_CACHE } = {}) {
  const started = performance.now();
  const routing = jevRouting(model);
  const routes = [];
  let routerMs = 0;
  let routerTokens = 0;
  let routerCost = 0;
  const result = await generateText({
    model,
    providerOptions: cache ? { gateway: { caching: 'auto' } } : undefined,
    instructions: INSTRUCTIONS,
    messages,
    tools,
    stopWhen: stepCountIs(8),
    prepareStep: useJev
      ? async ({ messages: stepMessages }) => {
          const t = performance.now();
          const { choice, usage, cost } = await route(stepMessages);
          routerMs += performance.now() - t;
          routerCost += cost;
          routerTokens += (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);
          routes.push(choice);
          if (choice === 'no_tool') return { toolChoice: 'none' };
          return routing === 'forced'
            ? { toolChoice: { type: 'tool', toolName: choice } }
            : { activeTools: [choice], toolChoice: 'auto' };
        }
      : undefined,
  });
  const trace = result.steps.map((step, i) => ({
    route: useJev ? routes[i] : null,
    calls: step.toolCalls.map((c) => ({ tool: c.toolName, input: c.input })),
    results: step.toolResults.map((r) => ({ tool: r.toolName, output: r.output })),
  }));
  const metrics = {
    mode: useJev ? 'jev' : 'direct',
    jev_routing: useJev ? routing : null,
    model,
    ms: Math.round(performance.now() - started),
    router_ms: Math.round(routerMs),
    steps: result.steps.length,
    tool_calls: trace.flatMap((t) => t.calls.map((c) => c.tool)),
    tool_errors: trace.flatMap((t) => t.results).filter((r) => r.output?.error).length,
    route_ignored: useJev ? trace.filter((t) => t.route !== 'no_tool' && !t.calls.some((c) => c.tool === t.route)).length : 0,
    cache,
    input_tokens: result.totalUsage?.inputTokens ?? 0,
    cache_read_tokens: result.totalUsage?.inputTokenDetails?.cacheReadTokens ?? 0,
    cache_write_tokens: result.totalUsage?.inputTokenDetails?.cacheWriteTokens ?? 0,
    output_tokens: result.totalUsage?.outputTokens ?? 0,
    router_tokens: routerTokens,
    chat_cost_usd: result.steps.reduce((sum, step) => sum + gatewayCost(step.providerMetadata), 0),
    router_cost_usd: routerCost,
  };
  return { text: result.text, messages: result.responseMessages, trace, metrics, state: loans.state() };
}

if (import.meta.main) {
  const messages = [];
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(`chat: ${CHAT_MODEL} | router: ${USE_JEV ? ROUTER_MODEL : 'off'} — Ctrl+C to quit\n`);
  while (true) {
    messages.push({ role: 'user', content: await rl.question('Customer: ') });
    const r = await reply(messages);
    messages.push(...r.messages);
    for (const t of r.trace) console.log(`  [${t.route ? `jev → ${t.route}` : 'direct'}] ${t.calls.map((c) => c.tool).join(', ')}`);
    console.log(`Agent: ${r.text}\n  (${r.metrics.ms}ms, ${r.metrics.input_tokens}+${r.metrics.output_tokens} tok)\n`);
  }
}
