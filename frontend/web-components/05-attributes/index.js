class MyAlert extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .alert { padding: 1rem; border-radius: 5px; color: white; }
        .error { background: red; }
        .success { background: green; }
      </style>
      <div class="alert"><slot></slot></div>
    `;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'type') {
      const div = this.shadowRoot.querySelector('.alert');
      div.className = `alert ${newVal}`;
    }
  }

  connectedCallback() {
    this.attributeChangedCallback('type', null, this.getAttribute('type'));
  }
}

customElements.define('my-alert', MyAlert);
