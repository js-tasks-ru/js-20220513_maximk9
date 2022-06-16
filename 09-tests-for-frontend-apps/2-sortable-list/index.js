export default class SortableList {

    element;
    placeholder;

    constructor({ items = [] } = {}) {
        this.items = items;
        this.render();
    }

    render() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'sortable-list__placeholder';

        this.element = document.createElement('ul');
        this.items.forEach(item => item.classList.add('sortable-list__item'));
        this.element.append(...this.items);
        this.element.addEventListener('pointerdown', this.onPointerDown);
    }

    onPointerDown = (event) => {
        const item = event.target.closest('.sortable-list__item');

        if ('deleteHandle' in event.target.dataset) {
            item.remove();
            return;
        }
        if (!('grabHandle' in event.target.dataset)) {
            return;
        }

        const { width, height, left, top } = item.getBoundingClientRect();

        this.placeholder.style.width = `${width}px`;
        this.placeholder.style.height = `${height}px`;

        this.offsetX = Math.max(event.clientX - left, 0);
        this.offsetY = Math.max(event.clientY - top, 0);
        
        item.style.width = `${width}px`;
        item.style.height = `${height}px`;
        item.style.left = `${(event.clientX - this.offsetX).toFixed(0)}px`;
        item.style.top = `${(event.clientY - this.offsetY).toFixed(0)}px`;

        item.classList.add('sortable-list__item_dragging');

        item.replaceWith(this.placeholder);
        this.element.append(item);

        this.dragItem = item;

        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerMove = (event) => {
        event.preventDefault();
        this.dragItem.style.left = `${(event.clientX - this.offsetX).toFixed(0)}px`;
        this.dragItem.style.top = `${(event.clientY - this.offsetY).toFixed(0)}px`;

        const { top, height } = this.dragItem.getBoundingClientRect();
        const halfHeight = height / 2;
        for (const item of this.items) {
            if (item == this.dragItem) {
                continue;
            }
            const { top: itemTop } = item.getBoundingClientRect();
            if (Math.abs(itemTop - top) < halfHeight) {
                this.element.insertBefore(this.placeholder, itemTop < top ? item : item.nextSibling);
                break;
            }
        }
        
    }

    onPointerUp = (event) => {
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);

        this.dragItem.classList.remove('sortable-list__item_dragging');
        this.dragItem.style.width = '';
        this.dragItem.style.height = '';
        this.dragItem.style.left = '';
        this.dragItem.style.top = '';

        this.placeholder.replaceWith(this.dragItem);
    }

    remove() {
        this.element.remove();
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
    }

    destroy() {
        this.remove();
    }
}
