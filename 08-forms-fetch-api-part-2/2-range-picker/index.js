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
        this.selectedDate = null;

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
        // first click
        if (!this.selectedDate) {
            this.selectedDate = selectedDate;
            this.updateMonths(true);
        } else {
            this.from = this.selectedDate;
            this.to = selectedDate;
            if (this.from > this.to) {
                this.to = this.from;
                this.from = selectedDate;
            }
            this.selectedDate = null;

            this.updateInput();
            this.updateMonths(true);

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

        const [leftMonth, rightMonth] = [this.renderCalendar(), this.renderCalendar()];

        selector.append(...wrapper.children);
        selector.append(leftMonth, rightMonth);

        const previousMonth = new Date(this.to);
        previousMonth.setMonth(previousMonth.getMonth() - 1, 1);
        leftMonth.dataset.value = previousMonth;

        rightMonth.dataset.value = this.to;
        
        selector.addEventListener('click', this.selectorClickHandler);

        this.updateInput();
        this.updateMonths();
      }     

      window.addEventListener('click', this.closeHandler);
      this.element.classList.add('rangepicker_open');
    }

    shiftMonths(delta) {
        this.element.querySelectorAll('.rangepicker__calendar').forEach(month => {
            const date = new Date(month.dataset.value);
            date.setMonth(date.getMonth() + delta);
            month.dataset.value = date;
        });

        this.updateMonths();
    }

    updateInput() {
        const { from, to } = this.subElements;
        from.textContent = this.from.toLocaleDateString(this.locale);
        to.textContent = this.to.toLocaleDateString(this.locale);
    }

    updateMonths(onlySelection = false) {
      const [ leftMonth, rightMonth ] = this.element.querySelectorAll('.rangepicker__calendar');
      if (!onlySelection) {
        this.updateMonth(leftMonth);
        this.updateMonth(rightMonth);
      }

      const from = this.selectedDate || this.from;
      const to = this.selectedDate || this.to;

      this.updateMonthSelection(leftMonth, from, to);
      this.updateMonthSelection(rightMonth, from, to);
    }

    updateMonth(calendarElement) {
        const date = new Date(calendarElement.dataset.value);
        const current = new Date(date);
        current.setDate(1);

        const indicator = calendarElement.querySelector('.rangepicker__month-indicator');
        const monthName = current.toLocaleDateString(this.locale, { month: 'long' });
        const timeElement = indicator.querySelector('time');
        timeElement.textContent = monthName;
        timeElement.datatime = monthName;

        const grid = calendarElement.querySelector('.rangepicker__date-grid');
        grid.innerHTML = '';

        while (current.getMonth() == date.getMonth()) {
            const cell = document.createElement('button');
            cell.dataset.value = current.toISOString();
            cell.textContent = current.getDate();

            // first day of the month
            if (current.getDate() === 1) {
                cell.style['--start-from'] = current.getDay() || SUNDAY; 
            }

            grid.append(cell);

            current.setDate(current.getDate() + 1);
        }
    }

    updateMonthSelection(calendarElement, from, to) {
        const grid = calendarElement.querySelector('.rangepicker__date-grid');
        for (const cell of grid.children) {
            const date = new Date(cell.dataset.value);
            cell.className = 'rangepicker__cell';
            if (date.getTime() === from.getTime()) {
                cell.classList.add('rangepicker__selected-from');
            } else if (date.getTime() > from && date < to) {
                cell.classList.add('rangepicker__selected-between');
            } else if (date.getTime() === to.getTime()) {
                cell.classList.add('rangepicker__selected-to');
            }
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

    renderCalendar() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
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
            </div>`;

        return wrapper.firstElementChild;
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
