import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export const defaultHeight = 50;

export default class ColumnChart {

    element;
    subElements = {};

    constructor ({
        url = '',
        range = {},
        label = '',
        link,
        value = 0,
        formatHeading = (value) => value,
        chartHeight = defaultHeight } = {}) {

        this.url = url;
        this.range = range;
        this.chartHeight = chartHeight;
        this.formatHeading = formatHeading;
        this.label = label;
        this.link = link;
        this.value = value;

        this.render();
    }

    render() {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = this.template

        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        if (!this.link) {
            this.subElements.link.remove()
            delete this.subElements.link;
        }
    }

    getSubElements(element) {
        const children = element.querySelectorAll('[data-element]')
        return [...children].reduce( (target, subElement) => {
          target[subElement.dataset.element] = subElement;
          return target;
        }, {});
    }

    get template() {
        return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.height}">
          <div class="column-chart__title">
            ${this.label}
            <a href="${this.link}" class="column-chart__link" data-element="link">View all</a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
            <div data-element="body" class="column-chart__chart"></div>
          </div>
        </div>
        `
    }

    update(dateFrom = this.range.from, dateTo = this.range.to) {
        this.element.classList.add('column-chart_loading');

        const { body } = this.subElements;

        body.innerHTML = '';

        const url = new URL(this.url, BACKEND_URL);
        url.searchParams.append('from', dateFrom.toISOString());
        url.searchParams.append('to', dateTo.toISOString());

        return fetch(url.toString())
            .then(response => response.json())
            .then(data => {
                this.updateContent(data);
                return data;
            });
    }

    updateContent(data) {
        const { header, body } = this.subElements;

        const values = [...Object.values(data)]
        const max = Math.max(...values);
        const total = values.reduce((sum, x) => sum += x, 0)
        header.textContent = this.formatHeading(total);
        [...Object.entries(data)].forEach(entry => {
            const columnElement = document.createElement('div');
            columnElement.setAttribute('style', '--value: ' + Math.trunc((entry[1] / max) * this.chartHeight));
            columnElement.dataset.tooltip = this.formatHeading(entry[0]);
            body.append(columnElement); 
        });

        if (values.length > 0) {
            this.element.classList.remove('column-chart_loading');
        }
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }
}

