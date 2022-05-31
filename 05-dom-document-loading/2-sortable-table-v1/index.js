export default class SortableTable {
  element;
  subElements;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render()
  }

  render() {
    const table = document.createElement('div')
    table.innerHTML = this.template
    this.subElements = { 
      header : table.querySelector('[data-element="header"]'),
      body : table.querySelector('[data-element="body"]')
    }
    this.element = table.firstElementChild
  }

  sort(field, direction = 'asc') {
    Array.from(this.subElements.header.children).forEach(column => {
      column.removeAttribute('data-order');
      if (column.dataset.id === field) {
        column.dataset.order = direction;
      }
    });

    const sortType = this.headerConfig.filter(header => (header.id == field))[0].sortType;
    let comparator = sortType === 'number' ? this.numbersComparator : this.stringsComparator;

    this.data.sort((row1, row2) => {
      const value1 = row1[field]
      const value2 = row2[field]
      return comparator(value1, value2) * (direction === 'desc' ? - 1 : 1);
    })
    this.subElements.body.innerHTML = this.getBody()
  }

  stringsComparator(x, y) {
    return x.localeCompare(y, 'ru', { caseFirst: 'upper' });
  }

  numbersComparator(x, y) {
    return Number.parseFloat(x) - Number.parseFloat(y);
  }

  getHeaders() {
    return this.headerConfig.map(column => this.headerTemplate(column)).join('')
  }

  getBody() {
    return this.data.map(item => this.rowTemplate(item)).join('')
  }

  getCells(item) {
    return this.headerConfig.map(header => {
      if (header.template) {
        return header.template(item[header.id])
      } else {
        return this.cellTemplate(item[header.id])
      }
    }).join('')
  }

  get template() {
    return `
    <div class="sortable-table">

    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.getHeaders()}
    </div>

    <div data-element="body" class="sortable-table__body">
      ${this.getBody()}
    </div>

    </div>
    `
  }

  headerTemplate(column) {
    return `
    <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
        <span>${column.title}</span>
    </div>
    `
  }

  rowTemplate(item) {
    return `
    <a href="/products/${item.id}" class="sortable-table__row">
      ${this.getCells(item)}
    </a>
    `
  }

  cellTemplate(value) {
    return `<div class="sortable-table__cell">${value}</div>`
  }

  destroy() {
    this.element.remove()
  }
}

