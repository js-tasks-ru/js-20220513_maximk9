export const defaultHeight = 50;

export default class ColumnChart {

    constructor (props) {
        // default settings could be overriden from constructor args
        this.chartHeight = defaultHeight;
        this.formatHeading = (value) => value;

        Object.assign(this, props);

        this.render();
    }

    render() {
        const e = this.createElement('div', 'column-chart', {style: '--chart-height: ' + this.chartHeight})

        const titleElement = this.createElement('div', 'column-chart__title');
        titleElement.append(document.createTextNode('Total ' + (this.label ?? '')));
        e.append(titleElement);

        if (this.link) {
            const linkElement = this.createElement('div', 'column-chart__link', {href: this.linke})
            linkElement.append(document.createTextNode('View all'));
            titleElement.append(linkElement);
        }

        const containerElement = this.createElement('div', 'column-chart__container');

        if (this.value !== undefined) {
            const valueElement = this.createElement('div', 'column-chart__header');
            valueElement.dataset.element = 'header';
            valueElement.append(document.createTextNode(this.formatHeading(this.value)));
            containerElement.append(valueElement);
        }

        const bodyElement = this.createElement('div', 'column-chart__chart');
        bodyElement.dataset.element = 'body';
        containerElement.append(bodyElement);
        e.append(containerElement);

        this.element = e;
        this.update(this.data);
    }

    createElement(tag, className, attributes = {}) {
        const e = document.createElement(tag)
        e.className = className;
        Object.entries(attributes).forEach(([attr, value]) => e.setAttribute(attr, value));
        return e;
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
