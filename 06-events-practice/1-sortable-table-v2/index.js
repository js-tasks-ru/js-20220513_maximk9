export default class SortableTable {
  element;
  subElements;

  constructor(
    headerConfig = [],{
      data = [],
      sorted = {},
      isSortLocally = true } = {}) {

    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.headerConfig
      .filter(header => !header.template)
      .forEach(header => (header.template = (value => this.defaultCellTemplate(value))))

    this.sortData(sorted.id, sorted.order);
    this.render()
  }

  render() {
    const arrow = document.createElement('div')
    arrow.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `

    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.template

    this.subElements = { 
      header : wrapper.querySelector('[data-element="header"]'),
      body : wrapper.querySelector('[data-element="body"]'),
      sortArrow: arrow.firstElementChild
    }

    Array.from(this.subElements.header.children)
      .filter(header => header.dataset.sortable === 'true')
      .forEach(header => header.addEventListener('pointerdown', (event) => this.sortEventHandler(event)));

    this.refreshSortHeaders(this.sorted.id, this.sorted.order)

    this.element = wrapper.firstElementChild
  }

  sortEventHandler(event) {
    const field = event.currentTarget.dataset.id
    let order = 'desc'
    if (event.currentTarget.dataset.order === 'desc') {
      order = 'asc'
    }

    this.sortData(field, order)
    this.refreshSortHeaders(field, order)
    this.subElements.body.innerHTML = this.getBody()
  }

  refreshSortHeaders(field, order) {
    this.subElements.sortArrow.remove();

    [...this.subElements.header.children].forEach(column => {
      if (column.dataset.id === field) {
        column.dataset.order = order;
        column.append(this.subElements.sortArrow)
      } else {
        column.removeAttribute('data-order');
      }
    });
  }

  sortData(field = this.headerConfig.filter(h => h.sortable).shift(), order = 'asc') {
    const direction = { asc: 1, desc: -1 }[order];
  
    const columnConfig = this.headerConfig.filter(header => (header.id == field)).shift();
    let comparator;
    switch (columnConfig.sortType) {
      case 'string':
        comparator = (x, y) => x.localeCompare(y, 'ru', { caseFirst: 'upper' });
        break;
      case 'number':
        comparator = (x, y) => x - y;
        break;
      case 'custom':
        comparator = columnConfig.sortFunction;
        break;
      default:
        console.error('sort type ' + sortType + ' is not supported');
        return;
    }

    this.data.sort((row1, row2) => comparator(row1[field], row2[field]) * direction);
  }

  getBody() {
    return this.data.map(item => this.rowTemplate(item)).join('')
  }

  get template() {
    return `
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(column => this.headerTemplate(column)).join('')}
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
      ${this.headerConfig.map(header => header.template(item[header.id])).join('')}
    </a>
    `
  }

  defaultCellTemplate(value) {
    return `<div class="sortable-table__cell">${value}</div>`
  }

  destroy() {
    this.element.remove()
  }
}