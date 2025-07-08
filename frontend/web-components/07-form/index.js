class MyMessage extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this.shadowRoot.innerHTML = '<p></p>';
  }

  connectedCallback(){
    window.addEventListener('form-sent', (e) => {
      this.shadowRoot.querySelector('p').textContent = `Message received: ${e.detail}`;
    })
  }
}

class MyForm extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <form>
        <input type="text" name="message" placeholder="Type your message here">
        <button type="submit">Send</button>
      </form>
    `;

    this.shadowRoot.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const message = this.shadowRoot.querySelector('input').value;
      this.dispatchEvent(new CustomEvent('form-sent', {
        detail: message,
        bubbles: true,
        composed: true
      }));
    })
  }
}

customElements.define('my-message', MyMessage);
customElements.define('my-form', MyForm);