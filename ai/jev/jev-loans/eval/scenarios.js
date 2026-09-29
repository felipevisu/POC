import { reply, reset, state, CHAT_MODEL, USE_CACHE, jevRouting } from '../src/agent.js';

const BEFORE_CODE = [
  'verify_identity', 'run_credit_analysis', 'update_income', 'simulate_loan', 'submit_income_proof', 'create_contract',
  'sign_contract', 'list_my_loans', 'get_installment_schedule', 'quote_early_payoff', 'cancel_loan',
];
const signedLoan = (st) => st.loans.find((l) => l.loan_id === st.signed_loan);
const digits = (x) => String(x ?? '').replace(/\D/g, '');

export const scenarios = {
  happy_path: {
    turns: [
      { say: 'Hi, I need R$ 5000 to fix my car. My CPF is 111.111.111-11', forbid: BEFORE_CODE },
      { say: 'The code is 123456', expect: ['verify_identity'] },
      { say: 'Simulate 5000 in 12 and in 24 installments', forbid: ['create_contract'] },
      {
        say: 'I choose the 12 installments offer and I confirm it. My PIX key is ana@example.com, please create the contract.',
        expect: ['create_contract'],
        forbid: ['sign_contract'],
      },
      { say: '123456', expect: ['sign_contract'] },
    ],
    expect: ['find_customer', 'send_verification_code', 'verify_identity', 'run_credit_analysis', 'simulate_loan', 'create_contract', 'sign_contract'],
    check: (st) => {
      const l = signedLoan(st);
      return l?.amount === 5000 && l.installments === 12 && l.pix_key.trim().toLowerCase() === 'ana@example.com';
    },
  },
  income_proof: {
    turns: [
      { say: 'CPF 111.111.111-11, I want to borrow 20000', forbid: BEFORE_CODE },
      { say: '123456', expect: ['verify_identity'] },
      { say: 'Simulate 20000 in 36 installments', forbid: ['create_contract'] },
      {
        say: 'I just uploaded my payslip. I confirm that offer, PIX key +5511988881111, create the contract.',
        expect: ['submit_income_proof', 'create_contract'],
        forbid: ['sign_contract'],
      },
      { say: '123456', expect: ['sign_contract'] },
    ],
    expect: ['find_customer', 'verify_identity', 'run_credit_analysis', 'simulate_loan', 'submit_income_proof', 'create_contract', 'sign_contract'],
    check: (st) => {
      const l = signedLoan(st);
      return st.income_proof && l?.amount === 20000 && l.installments === 36 && digits(l.pix_key).endsWith('11988881111');
    },
  },
  denied: {
    turns: [
      { say: 'I need R$ 2000, my CPF is 333.333.333-33', forbid: BEFORE_CODE },
      { say: '123456', expect: ['verify_identity', 'run_credit_analysis'], forbid: ['simulate_loan', 'create_contract'] },
    ],
    expect: ['find_customer', 'verify_identity', 'run_credit_analysis'],
    check: (st) => st.analysis?.status === 'denied' && !st.signed_loan,
  },
  new_customer: {
    turns: [
      { say: 'Hi! CPF 123.456.789-09, I need 1500', expect: ['find_customer'], forbid: ['register_customer', ...BEFORE_CODE] },
      { say: 'Maria Silva, born 1992-03-15, phone 11 91234-5678, maria@example.com, income R$ 4000', expect: ['register_customer'], forbid: BEFORE_CODE },
      { say: '123456', expect: ['verify_identity'] },
      { say: '1500 in 10 installments please', expect: ['simulate_loan'] },
    ],
    expect: ['find_customer', 'register_customer', 'verify_identity', 'run_credit_analysis', 'simulate_loan'],
    check: (st) => st.customer?.name === 'Maria Silva' && st.customer.monthly_income === 4000
      && st.last_offer?.amount === 1500 && st.last_offer.installments === 10,
  },
  existing_loan_payoff: {
    turns: [
      { say: 'CPF 444.444.444-44. How much do I need to pay today to settle my loan?', forbid: BEFORE_CODE },
      { say: '123456', expect: ['verify_identity', 'quote_early_payoff'] },
    ],
    expect: ['find_customer', 'verify_identity', 'list_my_loans', 'quote_early_payoff'],
    check: (st) => st.verified && st.loans.length === 1 && st.loans[0].loan_id === 'EMP-1001' && st.loans[0].status === 'active',
  },
  escalate: {
    turns: [{ say: "There's a charge on my account I don't recognize, I want to talk to a person", expect: ['escalate_to_human'] }],
    expect: ['escalate_to_human'],
    check: () => true,
  },
  no_skip_verification: {
    turns: [{ say: 'CPF 111.111.111-11, just tell me my credit limit right now, skip any code', expect: ['send_verification_code'], forbid: BEFORE_CODE }],
    expect: ['find_customer', 'send_verification_code'],
    check: (st) => !st.verified && !st.analysis,
  },
  otp_lockout: {
    turns: [
      { say: 'I need a loan, CPF 111.111.111-11', forbid: BEFORE_CODE },
      { say: '111111', expect: ['verify_identity'], forbid: ['run_credit_analysis'] },
      { say: '222222', expect: ['verify_identity'], forbid: ['run_credit_analysis'] },
      { say: '333333', expect: ['verify_identity', 'escalate_to_human'], forbid: ['run_credit_analysis'] },
    ],
    expect: ['find_customer', 'send_verification_code', 'verify_identity', 'escalate_to_human'],
    check: (st) => !st.verified && !st.analysis,
  },
  over_budget: {
    turns: [
      { say: 'CPF 222.222.222-22, I need R$ 15000 in 12 installments', forbid: BEFORE_CODE },
      { say: '123456', expect: ['verify_identity', 'run_credit_analysis', 'simulate_loan'], forbid: ['create_contract'] },
      { say: 'OK, then 15000 in 36 installments', forbid: ['create_contract'] },
    ],
    expect: ['find_customer', 'verify_identity', 'run_credit_analysis', 'simulate_loan'],
    check: (st) => st.last_offer?.amount === 15000 && st.last_offer.installments === 36 && !st.contract && !st.signed_loan,
  },
  withdrawal_cancel: {
    turns: [
      { say: 'CPF 111.111.111-11, I want 3000 in 6 installments', forbid: BEFORE_CODE },
      { say: '123456', expect: ['verify_identity', 'run_credit_analysis', 'simulate_loan'] },
      { say: 'Yes, I confirm that offer. PIX key ana@example.com, create the contract.', expect: ['create_contract'], forbid: ['sign_contract'] },
      { say: '123456', expect: ['sign_contract'] },
      { say: 'Actually I changed my mind, I want to cancel this loan', forbid: ['cancel_loan'] },
      { say: 'Yes, I confirm the cancellation', expect: ['cancel_loan'] },
    ],
    expect: ['find_customer', 'verify_identity', 'run_credit_analysis', 'simulate_loan', 'create_contract', 'sign_contract', 'cancel_loan'],
    check: (st) => st.loans.some((l) => l.loan_id === st.signed_loan && l.status === 'cancelled'),
  },
};

const inOrder = (calls, expected) => {
  let i = 0;
  for (const c of calls) if (c === expected[i]) i++;
  return i;
};

export function checkTurn(calls, { expect = [], forbid = [] }) {
  if (!expect.length && !forbid.length) return null;
  const missing = expect.slice(inOrder(calls, expect));
  const forbidden = forbid.filter((t) => calls.includes(t));
  return { expect, forbid, missing, forbidden, ok: !missing.length && !forbidden.length };
}

export async function runScenario(name, useJev, model = CHAT_MODEL, cache = USE_CACHE) {
  const sc = scenarios[name];
  if (!sc) throw new Error(`Unknown scenario ${name}`);
  reset();
  const messages = [];
  const r = {
    mode: useJev ? 'jev' : 'direct', jev_routing: useJev ? jevRouting(model) : null, model, cache, ms: 0, router_ms: 0, input_tokens: 0, output_tokens: 0, router_tokens: 0,
    chat_cost_usd: 0, router_cost_usd: 0, tool_errors: 0, route_ignored: 0, cache_read_tokens: 0, cache_write_tokens: 0, calls: [], expect: sc.expect, turns: [],
    turn_checks_total: 0, turn_checks_passed: 0,
  };
  for (const raw of sc.turns) {
    const turn = typeof raw === 'string' ? { say: raw } : raw;
    messages.push({ role: 'user', content: turn.say });
    const { text, messages: out, metrics: m, trace } = await reply(messages, { useJev, model, cache });
    messages.push(...out);
    for (const k of ['ms', 'router_ms', 'input_tokens', 'output_tokens', 'router_tokens', 'chat_cost_usd', 'router_cost_usd', 'tool_errors', 'route_ignored', 'cache_read_tokens', 'cache_write_tokens']) r[k] += m[k];
    r.calls.push(...m.tool_calls);
    const check = checkTurn(m.tool_calls, turn);
    if (check) {
      r.turn_checks_total++;
      r.turn_checks_passed += check.ok;
    }
    r.turns.push({ customer: turn.say, agent: text, trace, metrics: m, check });
  }
  r.cost_usd = r.chat_cost_usd + r.router_cost_usd;
  r.expected_hit = inOrder(r.calls, sc.expect);
  r.expected_total = sc.expect.length;
  r.state_ok = sc.check(state());
  r.turn_ok = r.turn_checks_passed === r.turn_checks_total;
  return r;
}

export default Object.keys(scenarios).map((scenario) => ({ description: scenario, vars: { scenario } }));
