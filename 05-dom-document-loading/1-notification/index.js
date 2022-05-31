export default class NotificationMessage {

    static instance;
    element;
    timer;

    constructor (message = '', { duration = 1000, type = 'success'} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.render()
    }

    render() {
        const notifier = document.createElement('div')
        notifier.innerHTML = this.template
        this.element = notifier.firstElementChild
    }

    get template() {
        return `
        <div class="notification ${this.type}" style="--value:${(this.duration / 1000).toFixed(0)}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>
        `
    }

    show(target = document.body) {
        if (NotificationMessage.instance) {
            NotificationMessage.instance.destroy()
        }

        NotificationMessage.instance = this;
        this.timer = setTimeout(() => this.remove(), this.duration)
        target.append(this.element)
    }

    remove() {
        clearTimeout(this.timer)
        this.element.remove()
        NotificationMessage.instance = null
    }

    destroy() {
        this.remove()
    }
}
