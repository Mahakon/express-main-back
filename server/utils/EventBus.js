function EventBusConstructor() {
    this.listeners = {};
}

EventBusConstructorPrototype = EventBusConstructor.prototype;

EventBusConstructorPrototype.on = function (event, callback) {
    this.listeners[event] = [];
    this.listeners[event].push(callback)
};

EventBusConstructorPrototype.off = function (event, callback) {
    this.listeners[event] = this.listeners[event].filter(function (listener) {
        return listener !== callback;
    })
};

EventBusConstructorPrototype.emit = function (eventName, eventData) {
    this.listeners[eventName].forEach(function (listener) {
        listener(eventData);
    })
};



module.exports = new EventBusConstructor();