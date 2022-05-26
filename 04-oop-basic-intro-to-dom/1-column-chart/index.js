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
        let e = document.createElement('div');
        e.className = 'column-chart';
        e.setAttribute('style', '--chart-height: ' + this.chartHeight);

        const titleElement = document.createElement('div');
        titleElement.append(document.createTextNode('Total ' + (this.label ?? '')));
        titleElement.className = 'column-chart__title';
        e.append(titleElement);

        if (this.link) {
            const linkElement = document.createElement('a');
            linkElement.className = 'column-chart__link';
            linkElement.append(document.createTextNode('View all'));
            linkElement.setAttribute('href', this.link);
            titleElement.append(linkElement);
        }

        const containerElement = document.createElement('div');
        containerElement.className = 'chart__container';

        if (this.value !== undefined) {
            const valueElement = document.createElement('div');
            valueElement.dataset.element = 'header';
            valueElement.className = 'column-chart__header';
            valueElement.append(document.createTextNode(this.formatHeading(this.value)));
            containerElement.append(valueElement);
        }

        const bodyElement = document.createElement('div');
        bodyElement.dataset.element = 'body';
        bodyElement.className = 'column-chart__chart';
        containerElement.append(bodyElement);
        e.append(containerElement);

        this.element = e;
        this.update(this.data);
    }

    update(data) {
        this.element.classList.add('column-chart_loading');

        const bodyElement = this.element.querySelector('.column-chart__chart');
        bodyElement.innerHTML = '';

        if (this.data) {  
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
