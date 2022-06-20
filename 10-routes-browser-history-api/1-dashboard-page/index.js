import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element;
    components = {};
    subElements = {};

    constructor() {
        this.to = new Date();
        this.from = new Date();
        this.from.setMonth(this.from.getMonth() - 1);
        this.currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    }

    async render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;

        const range = { from: this.from, to: this.to };

        this.components = {
            'rangePicker': new RangePicker(range),
            'ordersChart': new ColumnChart({
                'label': 'Заказы',
                'url': '/api/dashboard/orders',
                'range': range
            }),
            'salesChart': new ColumnChart({
                'label': 'Продажи',
                'url': '/api/dashboard/sales',
                'range': range,
                'formatHeading': value => this.currencyFormat.format(value)
            }),
            'customersChart': new ColumnChart({
                'label': 'Клиенты',
                'url': '/api/dashboard/customers',
                'range': range
            }),
            'sortableTable': new SortableTable(
                header, {
                    url: '/api/dashboard/bestsellers',
                    sorted: { id: 'title', order: 'asc' },
                    isSortLocally: true
                }
            )
        };
        
        // render all components
        await Promise.all(Object.values(this.components).map(component => component.render()));

        // replace stub with the real element from component
        this.element.querySelectorAll('[data-element]').forEach(stub => {
            const element = this.components[stub.dataset.element].element;
            stub.replaceWith(element);
            this.subElements[stub.dataset.element] = element;
        });

        const { rangePicker, ordersChart, salesChart, customersChart } = this.subElements;
        rangePicker.addEventListener('date-select', this.rangeUpdate);
        ordersChart.classList.add('dashboard__chart_orders');
        salesChart.classList.add('dashboard__chart_sales');
        customersChart.classList.add('dashboard__chart_customers');

        return this.element;
    }

    rangeUpdate = async (event) => {
        const { salesChart, ordersChart, customersChart, sortableTable } = this.components;
        const { from, to } = event.detail;
        salesChart.update(from, to);
        ordersChart.update(from, to);
        customersChart.update(from, to);
        const data = await sortableTable.loadData('title', 'asc', from, to);
        sortableTable.addRows(data);
    }

    get template() {
        return `
            <div class="dashboard full-height flex-column">
              <div class="content__top-panel">  
                <h2 class="page-title">Панель управления</h2>
                <div data-element="rangePicker"></div>
              </div>
              <div class="dashboard__charts">
                <div data-element="ordersChart"></div>
                <div data-element="salesChart"></div>
                <div data-element="customersChart"></div>
              </div>
              <h3 class="block-title">Лидеры продаж</h3>
              <div data-element="sortableTable"></div>
            </div>
        `
    }

    remove() {
        Object.values(this.components).forEach(component => {
            if (component.remove) component.remove();
        });
        this.element.remove();
    }

    destroy() {
        this.remove();
        Object.values(this.components).forEach(component => {
            if (component.destroy) component.destroy();
        });
        this.element = null;
        this.subElements = null;
    }
}
