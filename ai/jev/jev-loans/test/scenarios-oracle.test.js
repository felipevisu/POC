import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../src/loans.js';
import { scenarios, checkTurn } from '../eval/scenarios.js';

const TOOLS = {
  get_loan_info: L.getLoanInfo,
  find_customer: L.findCustomer,
  register_customer: L.registerCustomer,
  send_verification_code: L.sendVerificationCode,
  verify_identity: L.verifyIdentity,
  update_income: L.updateIncome,
  run_credit_analysis: L.runCreditAnalysis,
  simulate_loan: L.simulateLoan,
  submit_income_proof: L.submitIncomeProof,
  create_contract: L.createContract,
  sign_contract: L.signContract,
  list_my_loans: L.listMyLoans,
  get_installment_schedule: L.getInstallmentSchedule,
  quote_early_payoff: L.quoteEarlyPayoff,
  cancel_loan: L.cancelLoan,
  escalate_to_human: () => ({ ok: true }),
};

const ideal = {
  happy_path: [
    [['find_customer', { cpf: '111.111.111-11' }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['run_credit_analysis']],
    [['simulate_loan', { amount: 5000, installments: 12 }], ['simulate_loan', { amount: 5000, installments: 24 }]],
    [['create_contract', (c) => ({ offer_id: c.offer12, pix_key: 'ana@example.com' })]],
    [['sign_contract', (c) => ({ contract_id: c.create_contract.contract_id, code: '123456' })]],
  ],
  income_proof: [
    [['find_customer', { cpf: '111.111.111-11' }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['run_credit_analysis']],
    [['simulate_loan', { amount: 20000, installments: 36 }]],
    [['submit_income_proof', { doc_type: 'payslip' }], ['create_contract', (c) => ({ offer_id: c.simulate_loan.offer_id, pix_key: '+5511988881111' })]],
    [['sign_contract', (c) => ({ contract_id: c.create_contract.contract_id, code: '123456' })]],
  ],
  denied: [
    [['find_customer', { cpf: '333.333.333-33' }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['run_credit_analysis']],
  ],
  new_customer: [
    [['find_customer', { cpf: '123.456.789-09' }]],
    [['register_customer', { name: 'Maria Silva', birth_date: '1992-03-15', phone: '11 91234-5678', email: 'maria@example.com', monthly_income: 4000 }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['run_credit_analysis']],
    [['simulate_loan', { amount: 1500, installments: 10 }]],
  ],
  existing_loan_payoff: [
    [['find_customer', { cpf: '444.444.444-44' }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['list_my_loans'], ['quote_early_payoff', (c) => ({ loan_id: c.list_my_loans.loans[0].loan_id })]],
  ],
  escalate: [
    [['escalate_to_human', { reason: 'unrecognized charge' }]],
  ],
  no_skip_verification: [
    [['find_customer', { cpf: '111.111.111-11' }], ['send_verification_code']],
  ],
  otp_lockout: [
    [['find_customer', { cpf: '111.111.111-11' }], ['send_verification_code']],
    [['verify_identity', { code: '111111' }]],
    [['verify_identity', { code: '222222' }]],
    [['verify_identity', { code: '333333' }], ['escalate_to_human', { reason: 'identity locked' }]],
  ],
  over_budget: [
    [['find_customer', { cpf: '222.222.222-22' }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['run_credit_analysis'], ['simulate_loan', { amount: 15000, installments: 12 }]],
    [['simulate_loan', { amount: 15000, installments: 36 }]],
  ],
  withdrawal_cancel: [
    [['find_customer', { cpf: '111.111.111-11' }], ['send_verification_code']],
    [['verify_identity', { code: '123456' }], ['run_credit_analysis'], ['simulate_loan', { amount: 3000, installments: 6 }]],
    [['create_contract', (c) => ({ offer_id: c.simulate_loan.offer_id, pix_key: 'ana@example.com' })]],
    [['sign_contract', (c) => ({ contract_id: c.create_contract.contract_id, code: '123456' })]],
    [],
    [['cancel_loan', (c) => ({ loan_id: c.sign_contract.loan_id })]],
  ],
};

test('every scenario has an ideal run', () => {
  assert.deepEqual(Object.keys(ideal).sort(), Object.keys(scenarios).sort());
});

for (const [name, sc] of Object.entries(scenarios)) {
  test(`ideal agent passes ${name}`, () => {
    L.reset();
    const ctx = {};
    const all = [];
    assert.equal(ideal[name].length, sc.turns.length, 'one ideal entry per scripted turn');
    sc.turns.forEach((raw, k) => {
      const turn = typeof raw === 'string' ? { say: raw } : raw;
      const calls = [];
      for (const [tool, input] of ideal[name][k]) {
        calls.push(tool);
        try {
          ctx[tool] = TOOLS[tool](typeof input === 'function' ? input(ctx) : input ?? {});
          if (tool === 'simulate_loan' && ctx[tool].installments === 12) ctx.offer12 = ctx[tool].offer_id;
        } catch {
        }
      }
      all.push(...calls);
      const check = checkTurn(calls, turn);
      assert.ok(!check || check.ok, `turn ${k + 1}: ${JSON.stringify(check)}`);
    });
    let hit = 0;
    for (const c of all) if (c === sc.expect[hit]) hit++;
    assert.equal(hit, sc.expect.length, `tool_order: ${all.join(' → ')}`);
    assert.ok(sc.check(L.state()), `final_state: ${JSON.stringify(L.state())}`);
  });
}

test('an agent that simulates ahead of the request still passes', () => {
  const early = scenarios.happy_path;
  L.reset();
  const calls = [];
  const run = (tool, fn) => { calls.push(tool); return fn(); };
  run('find_customer', () => L.findCustomer({ cpf: '11111111111' }));
  run('send_verification_code', () => L.sendVerificationCode());
  assert.ok(checkTurn(calls.splice(0), early.turns[0]).ok !== false);
  run('verify_identity', () => L.verifyIdentity({ code: '123456' }));
  run('run_credit_analysis', () => L.runCreditAnalysis());
  const o12 = run('simulate_loan', () => L.simulateLoan({ amount: 5000, installments: 12 }));
  run('simulate_loan', () => L.simulateLoan({ amount: 5000, installments: 24 }));
  assert.ok(checkTurn(calls.splice(0), early.turns[1]).ok);
  assert.ok(checkTurn([], early.turns[2]).ok, 'answering turn 3 from earlier simulations is fine');
  const k = run('create_contract', () => L.createContract({ offer_id: o12.offer_id, pix_key: 'ana@example.com' }));
  assert.ok(checkTurn(calls.splice(0), early.turns[3]).ok);
  run('sign_contract', () => L.signContract({ contract_id: k.contract_id, code: '123456' }));
  assert.ok(checkTurn(calls.splice(0), early.turns[4]).ok);
  assert.ok(early.check(L.state()));
});
