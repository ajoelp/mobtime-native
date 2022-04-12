"use strict";
exports.__esModule = true;
exports.WebsocketConnection = void 0;
var websocket_1 = require("websocket");
var URL_REGEX = /https?:\/\/.*\/(.*)/;
var WebsocketConnection = /** @class */ (function () {
    function WebsocketConnection(changed) {
        this.mobOrder = [];
        this.changed = changed;
    }
    WebsocketConnection.prototype.connectToUrl = function (url) {
        this.currentPath = new URL(url);
        if (this.currentPath.pathname === '/') {
            this.disconnect();
            return;
        }
        this.connect();
    };
    WebsocketConnection.prototype.connect = function () {
        var _this = this;
        if (!this.currentPath)
            return;
        console.log('Connecting to sockets');
        this.websocket = new websocket_1.client();
        this.websocket.on('connectFailed', function (error) {
            console.log('Connect Error: ' + error.toString());
        });
        this.websocket.on('connect', function (connection) {
            _this.connection = connection;
            _this.connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    var event_1 = JSON.parse(message.utf8Data);
                    _this.processEvent(event_1);
                }
            });
            _this.connection.on('error', function (error) {
                console.log("Connection Error: " + error.toString());
            });
            _this.connection.on('close', function () {
                console.log('echo-protocol Connection Closed');
            });
        });
        this.websocket.connect("wss://".concat(this.currentPath.host).concat(this.currentPath.pathname));
        if (!this.currentPath) {
            this.disconnect();
        }
    };
    WebsocketConnection.prototype.processEvent = function (event) {
        var _a, _b;
        if (event.type === 'settings:update') {
            this.mobOrder = (_a = event.settings.mobOrder.split(',')) !== null && _a !== void 0 ? _a : [];
        }
        if (event.type === 'mob:update') {
            this.currentRotation = (_b = event.mob) !== null && _b !== void 0 ? _b : [];
        }
        this.changed(this);
    };
    WebsocketConnection.prototype.disconnect = function () {
        var _a;
        console.log('Disconnecting from socket');
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.close();
        this.websocket = undefined;
        this.currentPath = undefined;
        this.mobOrder = [];
        this.currentRotation = [];
    };
    return WebsocketConnection;
}());
exports.WebsocketConnection = WebsocketConnection;
//# sourceMappingURL=WebsocketConnection.js.map