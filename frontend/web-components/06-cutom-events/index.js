class MyButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <button><slot></slot></button>
    `;
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('clicked', {
        bubbles: true,
        composed: true,
      }));
    });
  }
}

customElements.define('my-button', MyButton);
