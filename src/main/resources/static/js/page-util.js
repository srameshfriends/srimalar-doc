function PageUtil() {

}

PageUtil.asDataTableObject = function (array, args) {
    let result = {data: []};
    for (let idx = 0; idx < array.length; idx++) {
        let obj = array[idx], values = [];
        for (let jv = 0; jv < args.length; jv++) {
            let name = args[jv];
            result.data[idx] = obj[name];
        }
        result.data[idx] = values;
    }
    return result;
};


PageUtil.toProperties = function (propObj, isCache) {
    if (typeof PageUtil.messageBundle === "undefined") {
        PageUtil.messageBundle = {};
    }
    let keys = Object.keys(propObj), result = {};
    for (let ix = 0; ix < keys.length; ix++) {
        let name = keys[ix], text = propObj[name];
        name = name.trim();
        text = text.trim();
        if (0 === name.length || 0 === text.length) {
            continue;
        }
        result[name] = text;
        if (isCache) {
            PageUtil.messageBundle[name] = text;
        }
    }
    return result;
};

PageUtil.propertiesToObject = function (lineAsText, isCache) {
    const array = lineAsText.split(/\r?\n/), result = {};
    if (typeof PageUtil.messageBundle === "undefined") {
        PageUtil.messageBundle = {};
    }
    for (let ix = 0; ix < array.length; ix++) {
        let text = array[ix];
        if (text.trim().startsWith('#')) {
            continue;
        }
        let index = text.indexOf('=');
        if (1 > index) {
            continue;
        }
        let name = text.substring(0, index), value = text.substring(index + 1);
        if (0 === name.trim().length || 0 === value.trim().length) {
            continue;
        }
        result[name] = value;
        if (isCache) {
            PageUtil.messageBundle[name] = value;
        }
    }
    return result;
};

PageUtil.getMessage = function (name) {
    if (typeof PageUtil.messageBundle === "undefined") {
        PageUtil.messageBundle = {};
    }
    let text = PageUtil.messageBundle[name];
    return typeof text === "undefined" ? name : text;
};


PageUtil.loadProperties = function (url, isCache, callback) {
    $.ajax(url).done(function (result) {
        if (typeof PageUtil.messageBundle === "undefined") {
            PageUtil.messageBundle = {};
        }
        let array = result.split(/\r?\n/);
        for (let ix = 0; ix < array.length; ix++) {
            let text = array[ix];
            if (text.trim().startsWith('#')) {
                continue;
            }
            let index = text.indexOf('=');
            if (1 > index) {
                continue;
            }
            const name = text.substring(0, index).trim(), value = text.substring(index + 1).trim();
            if (0 === name.length || 0 === value.length) {
                continue;
            }
            result[name] = value;
            if (isCache) {
                PageUtil.messageBundle[name] = value;
            }
        }
        if(typeof callback === "function") {
            callback();
        }
    }).fail(function (err) {
            PageMessage.show(err.responseText);
        });
};

function PageMessage() {
}

PageMessage.show = function (msg) {
    if (typeof PageMessage.dialog === "undefined") {
        PageMessage.dialog = new bootstrap.Modal(document.getElementById('page-message-modal'));
        PageMessage.message = document.getElementById("page-message-box");
    }
    if (typeof msg === "undefined") {
        msg = "";
    } else if (typeof msg === "object") {
        msg = JSON.stringify(msg);
    } else {
        msg = msg.toString();
    }
    PageMessage.message.innerHTML = msg;
    PageMessage.timer = setTimeout(function () {
        if (typeof PageMessage.timer !== "undefined") {
            clearTimeout(PageMessage.timer);
        }
        PageMessage.dialog.hide();
    }, 18000);
    PageMessage.dialog.show();
};

function RemoteRequest() {

}

RemoteRequest.getDBName = function () {
    if (typeof RemoteRequest.dbSelect === "undefined") {
        RemoteRequest.dbSelect = document.getElementById("db-param-select-fld");
    }
    let node = RemoteRequest.dbSelect;
    return node.options[node.selectedIndex].value;
}

RemoteRequest.addParameter = function (args) {
    const param = args.url.indexOf('?');
    if (1 < param) {
        args.url = args.url + '&db=' + RemoteRequest.getDBName();
    } else {
        args.url = args.url + '?db=' + RemoteRequest.getDBName();
    }
}

RemoteRequest.pvtError = function (url, err, status, xhr) {
    if (typeof err['responseJSON'] === "object") {
        let msg = err['responseJSON'];
        PageMessage.show('<table class="table table-borderless" style="text-align: left"><tr><td style="color: #0c4128">'
            + 'URL : ' + url + ' \n '
            + msg.status + ' : ' + msg.error +
            '</td></tr><tr><td>' + msg.message +
            '</td></tr><tr><td style="color:blue;">' + msg['path'] + '</td></tr></table>');
    } else {
        PageMessage.show(err.responseText);
    }
    console.log('ERROR : POST Remote Request : ' + url + ", Status : " + status + ", " + err);
    console.log(JSON.stringify(xhr));
};

RemoteRequest.post = function (args) {
    if (typeof args.url !== "string") {
        throw 'POST : Remote request ajax url should not be null.';
    }
    RemoteRequest.addParameter(args);
    args.type = 'POST';
    if (typeof args.error !== "function") {
        args.error = function (err, status, xhr) {
            RemoteRequest.pvtError(args.url, err, status, xhr);
        }
    }
    $.ajax(args);
};

RemoteRequest.get = function (args) {
    if (typeof args.url !== "string") {
        throw 'GET : Remote request ajax url should not be null.';
    }
    RemoteRequest.addParameter(args);
    args.type = 'GET';
    if (typeof args.error !== "function") {
        args.error = function (err, status, xhr) {
            RemoteRequest.pvtError(args.url, status, xhr);
        }
    }
    $.ajax(args);
};