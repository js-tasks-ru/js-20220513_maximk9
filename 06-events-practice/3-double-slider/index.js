export default class DoubleSlider {
    subElements = {};
    width;
    
    constructor({
        min = 0,
        max = 100,
        formatValue = value => '$' + value,
        selected = {} } = {}) {

      this.min = min;
      this.max = max;
      this.formatValue = formatValue;
      this.selected = {
          from: selected.from ?? min,
          to: selected.to ?? max
      }
      this.width = this.max - this.min;

      this.render()
    }

    get leftPercents() {
        return ((this.selected.from - this.min) / this.width * 100).toFixed(1);
    }

    get rightPercents() {
        return ((this.max - this.selected.to) / this.width * 100).toFixed(1);
    }

    render() {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = this.template

        this.element = wrapper.firstElementChild

        this.subElements = {
            left: this.element.querySelector('.range-slider__thumb-left'),
            right: this.element.querySelector('.range-slider__thumb-right'),
            progress: this.element.querySelector('.range-slider__progress'),
            slider: this.element.querySelector('.range-slider__inner'),
            lowValue: this.element.querySelector('[data-element="from"]'),
            highValue: this.element.querySelector('[data-element="to"]')
        }

        this.updateView()

        this.subElements.left.addEventListener('pointerdown', event => this.onPointerDown(event, 'left'));
        this.subElements.right.addEventListener('pointerdown', event => this.onPointerDown(event, 'right'));
    }

    updateView() {
        this.subElements.left.style.left = this.leftPercents + "%";
        this.subElements.right.style.right = this.rightPercents + "%";
        this.subElements.progress.style.left = this.leftPercents + "%";
        this.subElements.progress.style.right = this.rightPercents + "%";
        this.subElements.lowValue.textContent = this.formatValue(this.selected.from);
        this.subElements.highValue.textContent = this.formatValue(this.selected.to);
    }

    onPointerDown(event, thumb) {
        this.currentThumb = thumb;
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerUp = event => {
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerup', this.onPointerUp);
        delete this.currentThumb;

        this.element.dispatchEvent(new CustomEvent("range-select", {
            detail: { from: this.selected.from, to: this.selected.to }
        }));
    }

    onPointerMove = event => {
        event.preventDefault();
        const clientRect = this.subElements.slider.getBoundingClientRect();

        let offsetX = event.clientX - clientRect.left;
        if (offsetX < 0) {
            offsetX = 0;
        }

        const newValue = Math.round((offsetX / clientRect.width) * this.width + this.min);
        if (this.currentThumb === 'left') {
            this.selected.from = Math.min(newValue, this.selected.to);
        } else {
            this.selected.to = Math.min(Math.max(newValue, this.selected.from), this.max);
        }

        this.updateView();
    }

    get template() {
        return `
        <div class="range-slider">
          <span data-element="from"></span>
          <div class="range-slider__inner">
            <span class="range-slider__progress"></span>
            <span class="range-slider__thumb-left"></span>
            <span class="range-slider__thumb-right"></span>
          </div>
          <span data-element="to"></span>
        </div>`
    }

    destroy() {
        this.element.remove()
    }
}
