class MyCircle extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.render(shadow);
  }

  render(shadow) {
    const circle = document.createElement('div');
    circle.classList.add('red-circle');
    circle.style.width = '100px';
    circle.style.height = '100px';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = 'blue';
    shadow.appendChild(circle);
  }
}

customElements.define('my-circle', MyCircle);