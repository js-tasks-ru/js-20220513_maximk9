import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const DEFAULT_ITEMS_PER_PAGE = 30;

export default class SortableTable {
  element;
  subElements = {};

  constructor(
    headerConfig = [],{
      url,
      data = [],
      sorted = {},
      isSortLocally = false } = {}) {

    this.headerConfig = headerConfig;
    this.url = url;
    this.data = data;
    this.sorted = {
      id: sorted.id || this.headerConfig.filter(header => header.sortable).shift().id,
      order: sorted.order || 'asc'
    };
    this.end = DEFAULT_ITEMS_PER_PAGE;
    this.fullyLoaded = false;
    this.isSortLocally = isSortLocally;

    this.headerConfig
      .filter(header => !header.template)
      .forEach(header => (header.template = (value => this.defaultCellTemplate(value))))

    this.pageLoader = singleThrottler(this.pageLoader);
    this.render()
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.template
    this.element = wrapper.firstElementChild

    this.subElements = this.getSubElements(this.element);

    this.subElements.header.addEventListener('pointerdown', this.clickSortHandler)
    window.addEventListener('scroll', this.scrollHandler);

    return this.refresh()
  }

  getSubElements(element) {
    const children = element.querySelectorAll('[data-element]')
    return [...children].reduce( (target, subElement) => {
      target[subElement.dataset.element] = subElement;
      return target;
    }, {});
  }

  async refresh() {
    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
      this.subElements.body.innerHTML = this.getBody(this.data.slice(0, this.end));
    } else {
      const serverData = await this.sortOnServer(this.sorted.id, this.sorted.order);

      this.toggleClassWhen(serverData.length === 0, this.element, 'sortable-table_empty')

      this.data = serverData;
      this.subElements.body.innerHTML = this.getBody();
    }
  }

  clickSortHandler = (event) => {
    const header = event.target.closest('[data-id]');
    if (!header || header.dataset.sortable !== 'true') {
      return;
    }

    if (this.sorted.id != header.dataset.id) {
      header.append(this.subElements.arrow);

      if (!this.isSortLocally) {
        this.fullyLoaded = false;
        this.end = DEFAULT_ITEMS_PER_PAGE;
      }
    }

    this.sorted.id = header.dataset.id
    this.sorted.order = header.dataset.order === 'desc' ? 'asc' : 'desc';
    header.dataset.order = this.sorted.order;

    this.refresh();
  }

  scrollHandler = (event) => {
    if (this.fullyLoaded) return;
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (windowRelativeBottom > document.documentElement.clientHeight + 100) return;

    this.pageLoader()
  }

  pageLoader = async () => {
    let pageData = []
    if (!this.isSortLocally) {
      pageData = await this.loadData(this.sorted.id, this.sorted.order, this.end, this.end + DEFAULT_ITEMS_PER_PAGE)
      this.data = [...this.data, ...pageData]
    } else {
      pageData = this.data.slice(this.end, this.end + DEFAULT_ITEMS_PER_PAGE)
    }

    if (pageData.length > 0) {
      this.end = this.end + pageData.length;
      this.subElements.body.insertAdjacentHTML('beforeend', this.getBody(pageData));
    } else {
      this.fullyLoaded = true;
    }
  }

  loadData(id = this.sorted.id, order = this.sorted.order, start = 0, end = this.end) {
    const url = new URL(this.url, BACKEND_URL)
    url.searchParams.append('_sort', id);
    url.searchParams.append('_order', order);
    url.searchParams.append('_start', start);
    url.searchParams.append('_end', end);

    this.element.classList.add('sortable-table_loading');

    try {
      return fetchJson(url);
    } finally {
      this.element.classList.remove('sortable-table_loading');
    }
  }

  // artificial function only to satisfy bundled test 
  sortOnServer(id, order) {
    return this.loadData(id, order);
  }

  sortOnClient(id, order) {
    const direction = { asc: 1, desc: -1 }[order];
  
    const columnConfig = this.headerConfig.filter(header => (header.id == id)).shift();
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

    this.data.sort((row1, row2) => comparator(row1[id], row2[id]) * direction);
  }

  getBody(data = this.data) {
    return data.map(item => this.rowTemplate(item)).join('')
  }

  toggleClassWhen(condition, element, className) {
    if (condition) {
      element.classList.add(className)
    } else {
      element.classList.remove(className)
    }
  }

  get template() {
    return `
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(column => this.headerTemplate(column)).join('')}
      </div>

      <div data-element="body" class="sortable-table__body">
      </div>

      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    </div>
    `
  }

  headerTemplate(column) {
    return `
    <div class="sortable-table__cell" 
      data-id="${column.id}" 
      data-order="${this.sorted.id === column.id ? this.sorted.order : ''}" 
      data-sortable="${column.sortable}">
        <span>${column.title}</span>
        ${this.sorted.id === column.id ? this.arrowTemplate() : ''}
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

  arrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `
  }

  defaultCellTemplate(value) {
    return `<div class="sortable-table__cell">${value}</div>`
  }

  destroy() {
    window.removeEventListener('scroll', this.scrollHandler);
    this.element.remove();
  }
}

function singleThrottler(func) {
  let running = false;
  return async function() {
    if (running) return;
    running = true;
    try {
      await func.apply(arguments);
    } finally {
      running = false;
    }
  }
}