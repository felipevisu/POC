class BoxComponent extends HTMLElement{
  constructor() {
    super();
    const template = document.getElementById('box-template');
    const content = template.content.cloneNode(true);

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(content);
  }
}

customElements.define('box-component', BoxComponent);