import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../src/loans.js';

test('Price table math', () => {
  assert.equal(L.pmt(10000, 0.02, 12), 945.6);
  const sch = L.schedule(10000, 0.02, 12, Date.now());
  assert.equal(sch.at(-1).balance_after, 0);
  assert.ok(Math.abs(sch.reduce((s, r) => s + r.principal, 0) - 10000) < 0.01);
  assert.ok(Math.abs(L.cetMonthly(10000, 945.6, 12) - 0.02) < 1e-4);
});

test('full hiring flow: Ana borrows 5000 and is paid out', () => {
  L.reset();
  assert.throws(() => L.runCreditAnalysis(), /No customer/);
  assert.equal(L.findCustomer({ cpf: '111.111.111-11' }).found, true);
  assert.throws(() => L.runCreditAnalysis(), /not verified/);
  L.sendVerificationCode();
  assert.equal(L.verifyIdentity({ code: '000000' }).verified, false);
  assert.equal(L.verifyIdentity({ code: '123456' }).verified, true);
  const a = L.runCreditAnalysis();
  assert.equal(a.status, 'approved');
  assert.equal(a.tier, 'A');
  assert.throws(() => L.simulateLoan({ amount: a.max_amount + 100, installments: 12 }), /between/);
  const offer = L.simulateLoan({ amount: 5000, installments: 12 });
  assert.ok(offer.cet_monthly_pct > offer.monthly_rate_pct, 'IOF must push CET above the nominal rate');
  const k = L.createContract({ offer_id: offer.offer_id, pix_key: 'ana@example.com' });
  const loan = L.signContract({ contract_id: k.contract_id, code: '123456' });
  assert.equal(loan.signed, true);
  assert.equal(loan.payout.amount, 5000);
  assert.equal(L.state().signed_loan, loan.loan_id);
  assert.equal(L.cancelLoan({ loan_id: loan.loan_id }).status, 'cancelled');
});

test('big amounts need income proof; restrictions are denied; budget counts existing loans', () => {
  L.reset();
  L.findCustomer({ cpf: '11111111111' });
  L.sendVerificationCode();
  L.verifyIdentity({ code: '123456' });
  L.runCreditAnalysis();
  const big = L.simulateLoan({ amount: 20000, installments: 36 });
  assert.throws(() => L.createContract({ offer_id: big.offer_id, pix_key: 'x' }), /proof of income/);
  L.submitIncomeProof({ doc_type: 'payslip' });
  assert.ok(L.createContract({ offer_id: big.offer_id, pix_key: 'x' }).contract_id);

  L.findCustomer({ cpf: '33333333333' });
  L.sendVerificationCode();
  L.verifyIdentity({ code: '123456' });
  assert.equal(L.runCreditAnalysis().status, 'denied');

  L.findCustomer({ cpf: '44444444444' });
  L.sendVerificationCode();
  L.verifyIdentity({ code: '123456' });
  const d = L.runCreditAnalysis();
  assert.ok(d.existing_monthly_commitment > 0);
  assert.equal(d.max_monthly_payment, Math.round((6000 * 0.3 - d.existing_monthly_commitment) * 100) / 100);
  assert.throws(() => L.cancelLoan({ loan_id: 'EMP-1001' }), /withdrawal period ended/);
  assert.ok(L.quoteEarlyPayoff({ loan_id: 'EMP-1001' }).payoff_amount_today < 8000);
});

test('reset() leaves no trace of a previous scenario', () => {
  L.reset();
  const fresh = JSON.stringify(L.state());
  const firstOffer = (() => {
    L.findCustomer({ cpf: '11111111111' });
    L.sendVerificationCode();
    L.verifyIdentity({ code: '123456' });
    L.runCreditAnalysis();
    return L.simulateLoan({ amount: 5000, installments: 12 }).offer_id;
  })();

  const k = L.createContract({ offer_id: firstOffer, pix_key: 'x' });
  L.signContract({ contract_id: k.contract_id, code: '123456' });
  L.findCustomer({ cpf: '12345678909' });
  L.registerCustomer({ name: 'Temp', birth_date: '1990-01-01', phone: '11912345678', email: 't@x', monthly_income: 5000 });

  L.reset();
  assert.equal(JSON.stringify(L.state()), fresh);
  assert.equal(L.findCustomer({ cpf: '12345678909' }).found, false, 'registered customer must be gone');
  L.findCustomer({ cpf: '11111111111' });
  L.sendVerificationCode();
  L.verifyIdentity({ code: '123456' });
  assert.deepEqual(L.listMyLoans().loans, [], 'signed loan must be gone');
  L.runCreditAnalysis();
  assert.equal(L.simulateLoan({ amount: 5000, installments: 12 }).offer_id, firstOffer, 'ids restart, so runs are comparable');
});

test('not-verified error points to the next step, not to a new code', () => {
  L.reset();
  L.findCustomer({ cpf: '11111111111' });
  assert.throws(() => L.runCreditAnalysis(), /Call send_verification_code/);
  L.sendVerificationCode();
  assert.throws(() => L.runCreditAnalysis(), /call verify_identity with the code they typed. Do not send a new code/);
});

test('3 wrong codes lock the identity, and resending does not reset the count', () => {
  L.reset();
  L.findCustomer({ cpf: '11111111111' });
  L.sendVerificationCode();
  assert.equal(L.verifyIdentity({ code: '111111' }).attempts_left, 2);
  L.sendVerificationCode();
  assert.equal(L.verifyIdentity({ code: '222222' }).attempts_left, 1, 'resend must not reset attempts');
  const third = L.verifyIdentity({ code: '333333' });
  assert.equal(third.locked, true);
  assert.throws(() => L.sendVerificationCode(), /locked/);
  assert.throws(() => L.verifyIdentity({ code: '123456' }), /locked/i);
  assert.equal(L.state().verified, false);
});

test('state exposes what scenario checks need: last offer, PIX key, income', () => {
  L.reset();
  L.findCustomer({ cpf: '11111111111' });
  L.sendVerificationCode();
  L.verifyIdentity({ code: '123456' });
  L.runCreditAnalysis();
  const o = L.simulateLoan({ amount: 5000, installments: 12 });
  assert.deepEqual(L.state().last_offer, { offer_id: o.offer_id, amount: 5000, installments: 12, monthly_payment: o.monthly_payment });
  const k = L.createContract({ offer_id: o.offer_id, pix_key: 'ana@example.com' });
  L.signContract({ contract_id: k.contract_id, code: '123456' });
  const st = L.state();
  assert.equal(st.loans.find((l) => l.loan_id === st.signed_loan).pix_key, 'ana@example.com');
  assert.equal(st.customer.monthly_income, 9000);
});
