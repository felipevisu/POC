class MyCard extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('card-template');
    const content = template.content.cloneNode(true);

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(content);
  }
}

customElements.define('my-card', MyCard);