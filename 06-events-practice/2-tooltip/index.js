const tooltipPositionOffset = 10;

class Tooltip {
  static instance;
  element;
  currentTarget;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }

    return Tooltip.instance;
  }
  
  initialize () {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    
    document.addEventListener('pointerover', this.handleEnter);
    document.addEventListener('pointerout', this.handleExit);
  }

  render(text) {
    this.element.textContent = text;
    document.body.append(this.element)
  }

  handleExit = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      this.currentTarget = event.target;
      this.element.remove()
      this.currentTarget.removeEventListener('pointermove', this.updatePositionFromEvent)
    }
  }

  handleEnter = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      this.currentTarget = event.target;
      this.render(this.currentTarget.dataset.tooltip);
      this.currentTarget.addEventListener('pointermove', this.updatePositionFromEvent);
    }
  }

  updatePositionFromEvent(event) {
    Tooltip.instance.element.style.left = event.offsetX + tooltipPositionOffset + 'px';
    Tooltip.instance.element.style.top = event.offsetY + tooltipPositionOffset + 'px';
  }

  destroy() {
    document.removeEventListener('pointerover', this.handleEnter);
    document.removeEventListener('pointerout', this.handleExit);
    if (this.currentTarget) {
      this.currentTarget.removeEventListener('pointermove', this.updatePositionFromEvent)
    }
    this.element.remove()
  }
}

export default Tooltip;
