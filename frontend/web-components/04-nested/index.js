class MyCard extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        .card {
          border: 1px solid #999;
          padding: 1rem;
          margin: 0.5rem 0;
          border-radius: 6px;
        }
        .title { font-weight: bold; }
      </style>
      <div class="card">
        <div class="title"><slot name="title">Sem título</slot></div>
        <div><slot></slot></div>
      </div>
    `;
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }
}
customElements.define('my-card', MyCard);

class MyLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <style>
        .layout {
          width: 100%;
          gap: 8px;
          display: flex;
        }
      </style>
      <div class="layout">
        <slot></slot>
      </div>
    `;
    shadow.appendChild(wrapper);
  }
}
customElements.define('my-layout', MyLayout);