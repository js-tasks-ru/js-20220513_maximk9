import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import productData from './__mocks__/product-data.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const IMGUR_URL = "https://api.imgur.com/3/image";
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  product = {};
  productUrl = new URL('/api/rest/products', BACKEND_URL);
  categoriesUrl = new URL('/api/rest/categories', BACKEND_URL);

  fields = [
    {name: 'title', type: 'string'},
    {name: 'description', type: 'string'},
    {name: 'price', type: 'number'},
    {name: 'discount', type: 'number'},
    {name: 'quantity', type: 'number'},
    {name: 'subcategory', type: 'string'},
    {name: 'status', type: 'number'}
  ];

  constructor (productId) {
    this.productId = productId;

    this.categoriesUrl.searchParams.append('_sort', 'weight');
    this.categoriesUrl.searchParams.append('_refs', 'subcategory');
  }

  async render() {
    [ this.categories, this.product ] = await Promise.all(
      [this.getCategories(), this.getProduct(this.productId)]);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.copyModelToForm(this.product, this.subElements.productForm);

    this.subElements.saveButton.addEventListener('click', (event) => { event.preventDefault(); this.save() });
    this.subElements.imageListContainer.addEventListener('click', this.deleteImageHandler);
    this.subElements.uploadButton.addEventListener('click', () => this.subElements.uploadFile.click());
    this.subElements.uploadFile.addEventListener('change', this.uploadHandler);

    return this.element;
  }

  getSubElements(element) {
    const children = element.querySelectorAll('[data-element]')
    return [...children].reduce( (target, subElement) => {
      target[subElement.dataset.element] = subElement;
      return target;
    }, {});
  }

  async getProduct(productId) {
    if (this.productId) {
      return await this.fetchProduct(this.productId)
    } else {
      return {
        title: '',
        description: '',
        discount: 1,
        quantity: 1, 
        price: 100, 
        status: 1, 
        images: []
      }
    }
  }

  copyModelToForm(product, form) {
    this.fields.forEach(field => {
      form.querySelector(`#${field.name}`).value = product[field.name] || '';
    })
  }

  createModelFromForm(form) {
    const product = {}
    if (this.productId) {
      product.id = this.productId;
    }

    this.fields.forEach(field => {
      let value = form.querySelector(`#${field.name}`).value;
      if (field.type === 'number') {
        value = Number.parseFloat(value);
      }
      product[field.name] = value;
    });

    product.images = [...this.subElements.imageListContainer.querySelectorAll('li')].map(imageRow => (
      {
        url: imageRow.querySelector('input[name="url"]').value,
        source: imageRow.querySelector('input[name="source"]').value
      }
    ));

    return product;
  }

  deleteImageHandler = async (event) => {
    if (event.target.dataset.deleteHandle !== undefined) {
      event.preventDefault();
      event.target.closest('li').remove();
    }
  }

  uploadHandler = async (event) => {
    let formData = new FormData();
    formData.append("image", this.subElements.uploadFile.files[0]);

    const response = await fetchJson(IMGUR_URL, {
      method: "POST", 
      body: formData,
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      }
    });
    if (response && response.success) {
      const newImage = {
        url: response.data.link,
        source: this.subElements.uploadFile.value.split('\\').pop()
      };

      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.imageItemTemplate(newImage);

      this.subElements.imageListContainer.append(wrapper.firstElementChild);
    }
  }

  async save() {
    this.productUrl.searchParams.delete('id');
    const product = this.createModelFromForm(this.subElements.productForm);
    const newProduct = product.id === undefined;
    const updatedProduct = await fetchJson(this.productUrl, {
      method: newProduct ? 'PUT' : 'PATCH',
      body: JSON.stringify(product),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const eventType = newProduct ? 'product-saved' : 'product-updated';
    this.element.dispatchEvent(new CustomEvent(eventType, { detail: { id: updatedProduct.id }}))
  }

  async getCategories() {
    const categoriesTree = await fetchJson(this.categoriesUrl);
    return categoriesTree.flatMap(category => {
      if (!category.subcategories) {
        return [ category ];
      } else {
        return category.subcategories.map(subcategory => {
          subcategory.title = `${category.title} > ${subcategory.title}`;
          return subcategory;
        });
      }
    });
  }

  async fetchProduct(productId) {
    this.productUrl.searchParams.set('id', productId);

    return (await fetchJson(this.productUrl))[0];
  }

  categoriesOptions() {
    return this.categories
      .map(category => `<option value=${category.id}>${escapeHtml(category.title)}</option>`)
      .join('');    
  }

  imagesList() {
    return this.product.images.map(image => this.imageItemTemplate(image)).join('');
  }

  imageItemTemplate(image) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${image.url}">
      <input type="hidden" name="source" value="${image.source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
        <span>${image.source}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>
    `
  }

  get template() {
    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">

      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>

      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>

      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
          ${this.imagesList()}
          </ul>
        </div>
        <input type="file" accept="image/*" data-element="uploadFile" style="display: none"/>
        <button type="button" name="uploadImage" data-element="uploadButton" class="button-primary-outline"><span>Загрузить</span></button>
      </div>

      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" class="form-control" name="subcategory">
          ${this.categoriesOptions()}
        </select>
      </div>

      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>

      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>

      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>

      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline" data-element="saveButton">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>
    `
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
