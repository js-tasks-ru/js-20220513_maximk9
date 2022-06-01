class Tooltip {
  static instance;
  element;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }

    return Tooltip.instance;
  }
  
  initialize () {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    
    document.querySelectorAll('[data-tooltip]').forEach(target => {
      target.addEventListener('pointerover', event => this.handleEnter(event));
      target.addEventListener('pointerout', event => this.handleExit(event));
    })
  }

  render(text) {
    this.element.textContent = text;
    document.body.append(this.element)
  }

  handleExit(event) {
    this.element.remove()
    event.target.removeEventListener('mousemove', this.updatePositionFromEvent)
  }

  handleEnter(event) {
    this.render(event.target.dataset.tooltip)
    event.target.addEventListener('mousemove', this.updatePositionFromEvent)
  }

  updatePositionFromEvent(event) {
    Tooltip.instance.element.style.left = event.offsetX + 10 + 'px';
    Tooltip.instance.element.style.top = event.offsetY + 10 + 'px';
  }

  destroy() {
    this.element.remove()
  }
}

export default Tooltip;
