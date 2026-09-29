const OTP = '123456';
const DAY = 86400000;
const MIN_AMOUNT = 500;
const MIN_INSTALLMENTS = 3;
const INCOME_PROOF_ABOVE = 10000;
const MAX_COMMITMENT = 0.3;
const WITHDRAWAL_DAYS = 7;
const MAX_OTP_ATTEMPTS = 3;

export const TIERS = [
  { tier: 'A', min_score: 750, monthly_rate: 0.0149, max_amount: 50000, max_installments: 48 },
  { tier: 'B', min_score: 600, monthly_rate: 0.0249, max_amount: 20000, max_installments: 36 },
  { tier: 'C', min_score: 500, monthly_rate: 0.0399, max_amount: 5000, max_installments: 24 },
];

const round2 = (x) => Math.round(x * 100) / 100;
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const addMonths = (ms, n) => {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
};
const onlyDigits = (x) => String(x ?? '').replace(/\D/g, '');
const maskCpf = (cpf) => `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
const maskPhone = (p) => p.replace(/\d(?=\d{4})/g, '*');

export const pmt = (principal, rate, n) => round2((principal * rate) / (1 - (1 + rate) ** -n));
const pv = (payment, rate, n) => (payment * (1 - (1 + rate) ** -n)) / rate;

export const iof = (amount, n) => round2(amount * (0.0038 + 0.000082 * Math.min(n * 30, 365)));

export function cetMonthly(received, payment, n) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const r = (lo + hi) / 2;
    pv(payment, r, n) > received ? (lo = r) : (hi = r);
  }
  return lo;
}

export function schedule(financed, rate, n, startMs) {
  const payment = pmt(financed, rate, n);
  let balance = financed;
  return Array.from({ length: n }, (_, i) => {
    const interest = round2(balance * rate);
    const principal = i === n - 1 ? round2(balance) : round2(payment - interest);
    balance = round2(balance - principal);
    return {
      number: i + 1,
      due_date: isoDate(addMonths(startMs, i + 1)),
      payment: round2(principal + interest),
      interest,
      principal,
      balance_after: balance,
      status: 'pending',
    };
  });
}

const person = (cpf, name, birth_date, phone, email, monthly_income, score, restrictions = []) => ({
  cpf, name, birth_date, phone, email, monthly_income, score, restrictions,
});

function seed() {
  const customers = new Map(
    [
      person('11111111111', 'Ana Souza', '1988-04-12', '+5511988881111', 'ana@example.com', 9000, 820),
      person('22222222222', 'Bruno Lima', '1995-09-30', '+5521977772222', 'bruno@example.com', 3500, 640),
      person('33333333333', 'Carla Dias', '1979-01-05', '+5531966663333', 'carla@example.com', 2800, 410, [
        { creditor: 'Loja Exemplo S.A.', amount: 1830.5, since: '2025-11-02' },
      ]),
      person('44444444444', 'Diego Rocha', '1990-06-18', '+5541955554444', 'diego@example.com', 6000, 710),
    ].map((c) => [c.cpf, c]),
  );
  const signed = addMonths(Date.now(), -4);
  const sched = schedule(8000, 0.0249, 24, signed);
  sched.slice(0, 4).forEach((row) => (row.status = 'paid'));
  const loans = new Map([
    ['EMP-1001', {
      loan_id: 'EMP-1001', cpf: '44444444444', status: 'active', amount: 8000, financed: 8000, installments: 24,
      monthly_rate: 0.0249, monthly_payment: sched[0].payment, pix_key: 'diego@example.com',
      signed_at: isoDate(signed), signed_ms: signed, schedule: sched,
    }],
  ]);
  return { customers, loans, seq: 1 };
}

let db;
let s;
export function reset() {
  db = seed();
  s = { cpf: null, verified: false, otp_sent: false, otp_attempts: 0, analysis: null, offers: new Map(), last_offer: null, income_proof: null, contract: null, signed_loan: null };
}
reset();

const next = (prefix) => `${prefix}-${2000 + db.seq++}`;
const me = () => db.customers.get(s.cpf);
function needCustomer() {
  if (!s.cpf) throw new Error('No customer identified yet. Call find_customer with the CPF first.');
  return me();
}
function needVerified() {
  const c = needCustomer();
  if (!s.verified) {
    throw new Error(s.otp_sent
      ? 'Identity not verified yet. A code was already sent to the customer: call verify_identity with the code they typed. Do not send a new code.'
      : 'Identity not verified yet. Call send_verification_code, then ask the customer for the code.');
  }
  return c;
}
const monthlyCommitment = (cpf) =>
  [...db.loans.values()].filter((l) => l.cpf === cpf && l.status === 'active').reduce((sum, l) => sum + l.monthly_payment, 0);
const ownLoan = (loan_id) => {
  const c = needVerified();
  const loan = db.loans.get(loan_id);
  if (!loan || loan.cpf !== c.cpf) throw new Error(`Loan ${loan_id} not found for this customer.`);
  return loan;
};

function parseCpf(cpf) {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) throw new Error('A CPF must have exactly 11 digits.');
  return digits;
}

function startSession(cpf) {
  if (s.cpf !== cpf) {
    Object.assign(s, { cpf, verified: false, otp_sent: false, otp_attempts: 0, analysis: null, offers: new Map(), last_offer: null, income_proof: null, contract: null, signed_loan: null });
  }
}

export const getLoanInfo = () => ({
  product: 'Personal loan (unsecured), fixed installments (Price table), paid out by PIX right after signing.',
  amount_range: { min: MIN_AMOUNT, max: TIERS[0].max_amount, currency: 'BRL' },
  installments_range: { min: MIN_INSTALLMENTS, max: TIERS[0].max_installments },
  monthly_rates_by_risk_tier: TIERS.map((t) => ({ tier: t.tier, monthly_rate_pct: t.monthly_rate * 100, max_amount: t.max_amount, max_installments: t.max_installments })),
  taxes: 'IOF (government credit tax) is financed into the loan; the CET (total effective cost) is shown on every simulation.',
  rules: [
    'Customer must be 18+ and have a CPF.',
    'Installments can use at most 30% of monthly income (including other active loans with us).',
    `Amounts above R$ ${INCOME_PROOF_ABOVE} require proof of income.`,
    'Customers with active credit restrictions (negative records) are not approved.',
    `Right of withdrawal: the contract can be cancelled within ${WITHDRAWAL_DAYS} days of signing by returning the amount received, with no interest.`,
    'Late payment: 2% fine + 1% per month interest.',
  ],
  steps: ['identify (CPF)', 'verify identity (SMS code)', 'credit analysis', 'simulate offers', 'proof of income if needed', 'contract', 'sign with SMS code', 'PIX payout'],
});

export function findCustomer({ cpf }) {
  cpf = parseCpf(cpf);
  const c = db.customers.get(cpf);
  if (!c) {
    startSession(null);
    s.pending_cpf = cpf;
    return { found: false, cpf: maskCpf(cpf), next: 'Offer to register: ask for full name, birth date, mobile phone, e-mail and monthly income.' };
  }
  startSession(cpf);
  return { found: true, name: c.name.split(' ')[0], cpf: maskCpf(cpf), phone_on_file: maskPhone(c.phone), identity_verified: s.verified };
}

export function registerCustomer({ cpf, name, birth_date, phone, email, monthly_income }) {
  cpf = parseCpf(cpf ?? s.pending_cpf);
  if (db.customers.has(cpf)) throw new Error('This CPF is already registered. Use find_customer.');
  const birth = Date.parse(birth_date);
  if (Number.isNaN(birth)) throw new Error('birth_date must be YYYY-MM-DD.');
  if (Date.now() - birth < 18 * 365.25 * DAY) throw new Error('Customer must be at least 18 years old.');
  const digits = onlyDigits(phone);
  if (digits.length < 10) throw new Error('Phone must include area code.');
  if (!(monthly_income > 0)) throw new Error('monthly_income must be positive.');
  const score = 450 + ((Number(cpf.slice(0, 9)) * 37) % 400);
  db.customers.set(cpf, person(cpf, name, birth_date, `+${digits.startsWith('55') ? '' : '55'}${digits}`, email, monthly_income, score));
  startSession(cpf);
  delete s.pending_cpf;
  return { registered: true, name, cpf: maskCpf(cpf), phone_on_file: maskPhone(me().phone) };
}

export function sendVerificationCode() {
  const c = needCustomer();
  if (s.otp_attempts >= MAX_OTP_ATTEMPTS) throw new Error('Identity locked after too many wrong codes. Escalate to a human.');
  s.otp_sent = true;
  return { sent: true, channel: 'SMS', to: maskPhone(c.phone), expires_in_minutes: 10 };
}

export function verifyIdentity({ code }) {
  needCustomer();
  if (!s.otp_sent) throw new Error('No code sent yet. Call send_verification_code first.');
  if (s.otp_attempts >= MAX_OTP_ATTEMPTS) throw new Error('Too many wrong codes. Identity locked — escalate to a human.');
  if (onlyDigits(code) !== OTP) {
    s.otp_attempts++;
    const attempts_left = MAX_OTP_ATTEMPTS - s.otp_attempts;
    return attempts_left
      ? { verified: false, attempts_left }
      : { verified: false, attempts_left, locked: true, next: 'Identity locked. Escalate to a human; do not ask for another code.' };
  }
  s.verified = true;
  return { verified: true };
}

export function updateIncome({ monthly_income }) {
  const c = needVerified();
  if (!(monthly_income > 0)) throw new Error('monthly_income must be positive.');
  c.monthly_income = monthly_income;
  s.analysis = null;
  s.offers.clear();
  return { monthly_income, next: 'Run the credit analysis again.' };
}

export function runCreditAnalysis() {
  const c = needVerified();
  const base = { analysis_id: next('ANL'), score: c.score, monthly_income: c.monthly_income };
  const deny = (reason) => (s.analysis = { ...base, status: 'denied', reason });
  if (c.restrictions.length) {
    return deny(`Active credit restriction(s) in the bureau: ${c.restrictions.map((r) => `${r.creditor} R$ ${r.amount} since ${r.since}`).join('; ')}. Customer may reapply 30 days after settling them.`);
  }
  const tier = TIERS.find((t) => c.score >= t.min_score);
  if (!tier) return deny('Credit score below the minimum policy (500).');
  const commitment = monthlyCommitment(c.cpf);
  const budget = round2(c.monthly_income * MAX_COMMITMENT - commitment);
  const n = tier.max_installments;
  const byBudget = pv(budget, tier.monthly_rate, n) / (1 + 0.0038 + 0.000082 * 365);
  const max_amount = Math.floor(Math.min(tier.max_amount, byBudget) / 100) * 100;
  if (max_amount < MIN_AMOUNT) return deny(`Monthly budget too low: 30% of income minus R$ ${commitment} already committed leaves R$ ${Math.max(budget, 0)}.`);
  s.analysis = {
    ...base, status: 'approved', tier: tier.tier, monthly_rate: tier.monthly_rate,
    max_amount, min_amount: MIN_AMOUNT, max_installments: n, min_installments: MIN_INSTALLMENTS,
    max_monthly_payment: budget, existing_monthly_commitment: commitment,
    income_proof_required_above: INCOME_PROOF_ABOVE, valid_until: isoDate(Date.now() + 7 * DAY),
  };
  return s.analysis;
}

export function simulateLoan({ amount, installments, purpose }) {
  needVerified();
  const a = s.analysis;
  if (!a) throw new Error('Run the credit analysis first.');
  if (a.status !== 'approved') throw new Error(`Credit analysis was denied: ${a.reason}`);
  if (amount < a.min_amount || amount > a.max_amount) throw new Error(`Amount must be between R$ ${a.min_amount} and R$ ${a.max_amount}.`);
  if (!Number.isInteger(installments) || installments < a.min_installments || installments > a.max_installments) {
    throw new Error(`Installments must be between ${a.min_installments} and ${a.max_installments}.`);
  }
  const tax = iof(amount, installments);
  const financed = round2(amount + tax);
  const payment = pmt(financed, a.monthly_rate, installments);
  if (payment > a.max_monthly_payment) {
    const fits = Math.floor(pv(a.max_monthly_payment, a.monthly_rate, installments) / (1 + tax / amount) / 100) * 100;
    throw new Error(`Installment R$ ${payment} exceeds the monthly limit of R$ ${a.max_monthly_payment}. With ${installments} installments the max amount is R$ ${fits}; or choose more installments.`);
  }
  const cet = cetMonthly(amount, payment, installments);
  const offer = {
    offer_id: next('OF'), amount, installments, purpose: purpose ?? null,
    monthly_rate_pct: round2(a.monthly_rate * 10000) / 100,
    annual_rate_pct: round2(((1 + a.monthly_rate) ** 12 - 1) * 10000) / 100,
    iof: tax, financed, monthly_payment: payment,
    total_payable: round2(payment * installments),
    total_interest: round2(payment * installments - financed),
    cet_monthly_pct: round2(cet * 10000) / 100,
    cet_annual_pct: round2(((1 + cet) ** 12 - 1) * 10000) / 100,
    first_due_date: isoDate(addMonths(Date.now(), 1)),
    requires_income_proof: amount > INCOME_PROOF_ABOVE && !s.income_proof,
    expires_at: isoDate(Date.now() + DAY),
  };
  s.offers.set(offer.offer_id, offer);
  s.last_offer = { offer_id: offer.offer_id, amount, installments, monthly_payment: payment };
  return offer;
}

const DOC_TYPES = ['payslip', 'bank_statement', 'tax_return'];
export function submitIncomeProof({ doc_type }) {
  const c = needVerified();
  if (!DOC_TYPES.includes(doc_type)) throw new Error(`doc_type must be one of ${DOC_TYPES.join(', ')}.`);
  s.income_proof = { doc_type, status: 'approved', confirmed_monthly_income: c.monthly_income, received_at: isoDate(Date.now()) };
  for (const o of s.offers.values()) o.requires_income_proof = false;
  return s.income_proof;
}

export function createContract({ offer_id, pix_key }) {
  const c = needVerified();
  const offer = s.offers.get(offer_id);
  if (!offer) throw new Error(`Offer ${offer_id} not found. Simulate again.`);
  if (offer.requires_income_proof) throw new Error(`Amounts above R$ ${INCOME_PROOF_ABOVE} need proof of income. Ask the customer for a document and call submit_income_proof.`);
  if (!pix_key?.trim()) throw new Error('A PIX key is required for the payout.');
  s.contract = {
    contract_id: next('CTR'), customer: c.name, cpf: maskCpf(c.cpf), ...offer, pix_key: pix_key.trim(),
    status: 'awaiting_signature',
    clauses: [
      'Fixed installments, due monthly from the first due date.',
      'Late payment: 2% fine + 1% per month interest, pro rata.',
      'Early payoff allowed at any time with proportional interest discount.',
      `Right of withdrawal within ${WITHDRAWAL_DAYS} days of signing.`,
    ],
  };
  s.otp_sent = true;
  s.otp_attempts = 0;
  return { ...s.contract, signature_code_sent_to: maskPhone(c.phone) };
}

export function signContract({ contract_id, code }) {
  const c = needVerified();
  const k = s.contract;
  if (!k || k.contract_id !== contract_id) throw new Error(`Contract ${contract_id} is not awaiting signature.`);
  if (s.otp_attempts >= MAX_OTP_ATTEMPTS) throw new Error('Too many wrong codes. Escalate to a human.');
  if (onlyDigits(code) !== OTP) {
    s.otp_attempts++;
    return { signed: false, attempts_left: MAX_OTP_ATTEMPTS - s.otp_attempts };
  }
  const now = Date.now();
  const loan = {
    loan_id: next('EMP'), cpf: c.cpf, contract_id, status: 'active', amount: k.amount, financed: k.financed,
    installments: k.installments, monthly_rate: k.monthly_rate_pct / 100, monthly_payment: k.monthly_payment,
    pix_key: k.pix_key, signed_at: isoDate(now), signed_ms: now,
    schedule: schedule(k.financed, k.monthly_rate_pct / 100, k.installments, now),
    payout: { method: 'PIX', transaction_id: `E${now}${db.seq}`, amount: k.amount, to: k.pix_key, status: 'completed' },
  };
  db.loans.set(loan.loan_id, loan);
  s.contract = null;
  s.signed_loan = loan.loan_id;
  s.offers.clear();
  s.analysis = null;
  const { schedule: sch, signed_ms, cpf, ...rest } = loan;
  return { signed: true, ...rest, first_due_date: sch[0].due_date, withdrawal_deadline: isoDate(now + WITHDRAWAL_DAYS * DAY) };
}

export function listMyLoans() {
  const c = needVerified();
  const loans = [...db.loans.values()].filter((l) => l.cpf === c.cpf).map((l) => ({
    loan_id: l.loan_id, status: l.status, amount: l.amount, installments: l.installments, monthly_payment: l.monthly_payment,
    signed_at: l.signed_at,
    paid_installments: l.schedule.filter((r) => r.status === 'paid').length,
    next_due: l.schedule.find((r) => r.status === 'pending')?.due_date ?? null,
  }));
  return { loans };
}

export function getInstallmentSchedule({ loan_id }) {
  const l = ownLoan(loan_id);
  return { loan_id, status: l.status, schedule: l.schedule };
}

export function quoteEarlyPayoff({ loan_id }) {
  const l = ownLoan(loan_id);
  if (l.status !== 'active') throw new Error(`Loan is ${l.status}.`);
  const paid = l.schedule.filter((r) => r.status === 'paid');
  const balance = paid.length ? paid.at(-1).balance_after : l.financed;
  const remaining = l.schedule.length - paid.length;
  return {
    loan_id, outstanding_principal: balance, remaining_installments: remaining,
    payoff_amount_today: balance, interest_saved: round2(l.monthly_payment * remaining - balance),
    note: 'Mock: payoff is the outstanding principal (future interest fully discounted). Payment via PIX bill, valid today.',
  };
}

export function cancelLoan({ loan_id }) {
  const l = ownLoan(loan_id);
  if (l.status !== 'active') throw new Error(`Loan is ${l.status}.`);
  const days = Math.floor((Date.now() - l.signed_ms) / DAY);
  if (days > WITHDRAWAL_DAYS) throw new Error(`The ${WITHDRAWAL_DAYS}-day withdrawal period ended (signed ${days} days ago). Offer an early payoff quote instead.`);
  l.status = 'cancelled';
  l.schedule.forEach((r) => (r.status = 'cancelled'));
  return {
    loan_id, status: 'cancelled',
    amount_to_return: l.amount, return_by: isoDate(Date.now() + 2 * DAY),
    how: 'PIX to the key informed in the customer notification (mock). No interest; IOF refunded.',
  };
}

export function state() {
  const c = s.cpf && me();
  return {
    customer: c ? { name: c.name, cpf: maskCpf(c.cpf), monthly_income: c.monthly_income } : null,
    verified: s.verified,
    analysis: s.analysis && { status: s.analysis.status, tier: s.analysis.tier, max_amount: s.analysis.max_amount },
    offers: s.offers.size,
    last_offer: s.last_offer,
    income_proof: !!s.income_proof,
    contract: s.contract && { contract_id: s.contract.contract_id, status: s.contract.status },
    signed_loan: s.signed_loan ?? null,
    loans: c ? listLoansRaw(c.cpf) : [],
  };
}
const listLoansRaw = (cpf) =>
  [...db.loans.values()].filter((l) => l.cpf === cpf).map((l) => ({ loan_id: l.loan_id, status: l.status, amount: l.amount, installments: l.installments, monthly_payment: l.monthly_payment, pix_key: l.pix_key }));
