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
    this.element = wrapper.firstElementChild

    this.subElements = this.getSubElements(this.element);
    this.subElements.arrow = arrow.firstElementChild;

    document.addEventListener('pointerdown', this.clickSortHandler)

    this.refreshSortHeaders(this.sorted.id, this.sorted.order)
  }

  clickSortHandler = (event) => {
    if (event.target.dataset.sortable === 'true') {
      const field = event.target.dataset.id
      const order = event.target.dataset.order === 'desc' ? 'asc' : 'desc';
  
      this.sortData(field, order)
      this.refreshSortHeaders(field, order)
      this.subElements.body.innerHTML = this.getBody()
    }
  }

  getSubElements(element) {
    const children = element.querySelectorAll('[data-element]')
    return [...children].reduce( (target, subElement) => {
      target[subElement.dataset.element] = subElement;
      return target;
    }, {});
  }

  refreshSortHeaders(field, order) {
    this.subElements.arrow.remove();

    [...this.subElements.header.children].forEach(column => {
      if (column.dataset.id === field) {
        column.dataset.order = order;
        column.append(this.subElements.arrow)
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
    document.removeEventListener('pointerdown', this.clickSortHandler)
    this.element.remove()
  }
}