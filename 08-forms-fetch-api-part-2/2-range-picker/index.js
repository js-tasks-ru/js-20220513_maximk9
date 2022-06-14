const SUNDAY = 7;

export default class RangePicker {

    element;
    subElement = {};
    selectorClickRouting = {
        'rangepicker__selector-control-left': () => this.shiftMonths(-1),
        'rangepicker__selector-control-right': () => this.shiftMonths(1),
        'rangepicker__cell': this.selectionHandler
    }

    constructor({
        from = new Date(),
        to = new Date()
    }) {
        this.locale = 'ru-RU';
        this.from = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        this.to = new Date(to.getFullYear(), to.getMonth(), to.getDate());

        this.leftMonth = new Date(this.to);
        this.leftMonth.setMonth(this.leftMonth.getMonth() - 1, 1);
        this.rightMonth = new Date(this.to);

        this.render();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;
    
        this.subElements = this.getSubElements(this.element);

        this.updateInput();

        this.subElements.input.addEventListener('click', this.toggleHandler);
    }

    renderMonth() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.calendarTemplate;
        return wrapper.firstElementChild;
    }

    closeHandler = (event) => {
        if (!this.element.contains(event.target)) {
            this.close();
        }
    };

    selectorClickHandler = (event) => {
        Object.keys(this.selectorClickRouting).forEach(className => {
            if (event.target.classList.contains(className)) {
                this.selectorClickRouting[className].apply(this, [event]);
            }
        })
    }

    toggleHandler = (event) => {
        if (this.element.classList.contains('rangepicker_open')) {
            this.close();
        } else {
            this.open();
        }
    }

    selectionHandler(event) {
        const selectedDate = new Date(event.target.dataset.value);
        if (this.to) {
            // first click
            this.from = selectedDate;
            this.to = null;
            this.updateMonths(false);
        } else {
            this.to = selectedDate;
            if (this.from > this.to) {
                this.to = this.from;
                this.from = selectedDate;
            }

            this.updateInput();
            this.updateMonths(false);

            this.element.dispatchEvent(new CustomEvent('date-select', {
                detail: { from: this.from, to: this.to }
            }));

            this.close();
        }
    }

    close() {
        window.removeEventListener('click', this.closeHandler);
        this.element.classList.remove('rangepicker_open');
    }

    open() {
      const { selector } = this.subElements;

      // first time open - lazy rendering
      if (!selector.hasChildNodes()) {
        let wrapper = document.createElement('div');
        wrapper.innerHTML = this.controlsTemplate;

        selector.append(...wrapper.children);
        selector.append(this.renderMonth(), this.renderMonth());
        
        selector.addEventListener('click', this.selectorClickHandler);
      }

      this.updateInput();
      this.updateMonths(true);       

      window.addEventListener('click', this.closeHandler);
      this.element.classList.add('rangepicker_open');
    }

    shiftMonths(delta) {
        this.leftMonth.setMonth(this.leftMonth.getMonth() + delta);
        this.rightMonth.setMonth(this.rightMonth.getMonth() + delta);
        this.updateMonths(true);
    }

    updateInput() {
        const { from, to } = this.subElements;
        from.textContent = this.from.toLocaleDateString(this.locale);
        to.textContent = this.to.toLocaleDateString(this.locale);
    }

    updateMonths(redraw = false) {
      const [ leftMonth, rightMonth ] = this.element.querySelectorAll('.rangepicker__calendar');
      this.updateMonth(leftMonth, this.leftMonth, redraw);
      this.updateMonth(rightMonth, this.rightMonth, redraw);
    }

    updateMonth(calendarElement, date, redraw) {
        const current = new Date(date);
        current.setDate(1);

        const indicator = calendarElement.querySelector('.rangepicker__month-indicator');
        const monthName = current.toLocaleDateString(this.locale, { month: 'long' });
        const timeElement = indicator.querySelector('time');
        timeElement.textContent = monthName;
        timeElement.datatime = monthName;

        const grid = calendarElement.querySelector('.rangepicker__date-grid');
        let buttons = [];
        if (redraw) {
            grid.innerHTML = '';
        } else {
            buttons = [...grid.children];
        }

        while (current.getMonth() == date.getMonth()) {
            if (buttons.length < current.getDate()) {
                const button = document.createElement('button');
                buttons.push(button);
                grid.append(button);
            }
            const button = buttons[current.getDate() - 1];
            button.className = 'rangepicker__cell';
            button.dataset.value = current.toISOString();
            if (current.getTime() === this.from.getTime()) {
                button.classList.add('rangepicker__selected-from');
            }
            if (current.getTime() > this.from.getTime() && this.to && current.getTime() < this.to.getTime()) {
                button.classList.add('rangepicker__selected-between');
            }
            if (this.to && current.getTime() === this.to.getTime()) {
                button.classList.add('rangepicker__selected-to');
            }
            // first day of the month
            if (current.getDate() === 1) {
                button.style['--start-from'] = current.getDay() || SUNDAY; 
            }
            button.textContent = current.getDate();

            current.setDate(current.getDate() + 1);
        }
    }

    getSubElements(element) {
        const children = element.querySelectorAll('[data-element]')
        return [...children].reduce( (target, subElement) => {
          target[subElement.dataset.element] = subElement;
          return target;
        }, {});
    }

    remove() {
        window.removeEventListener('click', this.closeHandler);
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = null;
    }

    get calendarTemplate() {
      return `
        <div class="rangepicker__calendar">
          <div class="rangepicker__month-indicator">
            <time datetime="November">November</time>
          </div>
          <div class="rangepicker__day-of-week">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
          </div>
          <div class="rangepicker__date-grid"></div>
        </div>
      `
    }

    get controlsTemplate() {
      return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      `
    }

    get template() {
      return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from"></span> -
          <span data-element="to"></span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
        `
    }
}
