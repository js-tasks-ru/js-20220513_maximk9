export const defaultHeight = 50;

export default class ColumnChart {

    constructor ({
        label = '',
        value = 0, 
        link = '',
        formatHeading = (value) => value,
        data = []
    } = {}) {
        this.chartHeight = defaultHeight;
        this.formatHeading = formatHeading;
        this.label = label;
        this.link = link;
        this.value = value;
        this.data = data;

        this.render();
    }

    template() {
        return `
        <div class="column-chart__title">
        Total ${this.label}
        <a href="${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
            <div data-element="body" class="column-chart__chart">
        </div>
        `;
    }

    render() {
        const chartElement = document.createElement('div');
        chartElement.className='column-chart';
        chartElement.setAttribute('style', '--chart-height: ' + this.chartHeight);
        chartElement.innerHTML = this.template();

        if (this.link === undefined) {
            chartElement.querySelector('.column-chart__link').remove();
        }

        if (this.value === undefined) {
            chartElement.querySelector('.column-chart__header').remove();
        }

        this.element = chartElement;
        this.update(this.data);
    }

    update(data) {
        this.element.classList.add('column-chart_loading');

        const bodyElement = this.element.querySelector('.column-chart__chart');
        bodyElement.innerHTML = '';

        if (this.data && this.data.length > 0) {  
            const max = Math.max(...this.data);
            this.data.forEach(v => {
                const columnElement = document.createElement('div');
                columnElement.setAttribute('style', '--value: ' + Math.trunc((v / max) * this.chartHeight));
                columnElement.dataset.tooltip = ((v / max) * 100).toFixed(0) + "%";
                bodyElement.append(columnElement); 
            });

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
