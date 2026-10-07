import { runScenario } from './scenarios.js';

let queue = Promise.resolve();
const exclusive = (fn) => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
};

export default class LoanAgentProvider {
  constructor(options) {
    this.useJev = !!options.config?.useJev;
    this.model = options.config?.model;
    this.cache = process.env.EVAL_CACHE === 'on';
  }

  id() {
    return `loan-agent:${this.model ?? 'default'}:${this.useJev ? 'jev' : 'direct'}${this.cache ? ':cache' : ''}`;
  }

  async callApi(_prompt, context) {
    try {
      const r = await exclusive(() => runScenario(context.vars.scenario, this.useJev, this.model, this.cache));
      return {
        output: r,
        cost: r.cost_usd,
        latencyMs: r.ms,
        tokenUsage: {
          prompt: r.input_tokens,
          completion: r.output_tokens + r.router_tokens,
          total: r.input_tokens + r.output_tokens + r.router_tokens,
        },
      };
    } catch (err) {
      return { error: err.message };
    }
  }
}
