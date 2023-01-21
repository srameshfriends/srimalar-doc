function PageRouter() {

}

PageRouter.routeFileUrls = [
    'config/route/shared.json', 'config/route/cashbook.json', 'config/route/materials.json',
    'config/route/inventory.json', 'config/route/purchase.json', 'config/route/sales.json', 'config/route/reports.json'
];

PageRouter.add = function (array) {
    if(typeof PageRouter.route === "undefined" || !(PageRouter.route instanceof Map)) {
        PageRouter.route = new Map();
    }
    for(let idx = 0; idx < array.length; idx++) {
        let viewObj = array[idx];
        PageRouter.route.set(viewObj['id'], viewObj);
    }
};

PageRouter.loadAll = function (callback) {
    const count = PageRouter.routeFileUrls.length;
    let loadedFilesCount = 0;
    for(let idx = 0; idx < count; idx++) {
        const fileUrl = PageRouter.routeFileUrls[idx];
        $.ajax({url:fileUrl,
            success: function (array) {
                loadedFilesCount += 1;
                PageRouter.add(array);
                if(count === loadedFilesCount && typeof callback === "function") {
                    callback();
                }
            },
            error: function (err) {
                loadedFilesCount += 1;
                console.log("ERROR : To loading route file " +  fileUrl)
                console.log(err.responseText);
                if(count === loadedFilesCount && typeof callback === "function") {
                    callback();
                }
            }
        });
    }
};

PageRouter.pvtLoadSinglePage = function (htmlUrl, scriptId) {
    PageRouter.pageDynamicContent.load(htmlUrl, function(responseTxt, statusTxt, xhr) {
        if("error" === statusTxt) {
            PageMessage.show("ERROR : " + xhr.status + ": " + xhr.statusText);
        } else if(typeof scriptId === 'string') {
            PageRouter.activeScript = eval('new ' + scriptId + '()');
            if(typeof PageRouter.activeScript.init === "function") {
                PageRouter.activeScript.init();
            }
        }
    });
};

PageRouter.pvtLoadMultiPage = function (url, callback) {
    $.get(url, function(responseTxt, statusTxt, xhr) {
        if("error" === statusTxt) {
            alert("ERROR : To loading multi page url in page router "+ url + ", " + xhr.status + ": " + xhr.statusText);
        } else {
            callback(url, responseTxt);
        }
    });
};

PageRouter.show = function (name, param) {
    if(typeof name !== "string") {
        name = '';
    }
    let pageObj = PageRouter.route.get(name);
    if(typeof pageObj !== "object") {
        alert('Page router configuration not found for (' + name + ")");
        return;
    }
    let htmlUrl = pageObj['html'], scriptId = pageObj['js'];
    if(!(typeof htmlUrl === "string" || (Array.isArray(htmlUrl) && 0 < htmlUrl.length))) {
        alert('Page router html not found!');
        return;
    }
    if(typeof PageRouter.activeScript === "object") {
        delete PageRouter.activeScript;
    }
    if(typeof htmlUrl === "string") {
        PageRouter.pvtLoadSinglePage(htmlUrl, scriptId);
    } else {
        let loadedCount = htmlUrl.length, builder = '';
        const callback = function htmlLoadedCallback(url, content) {
            loadedCount -= 1;
            builder = builder + content;
            if (0 === loadedCount) {
                PageRouter.pageDynamicContent.children().detach();
                PageRouter.pageDynamicContent.append(builder);
                if (typeof scriptId === 'string') {
                    PageRouter.activeScript = eval('new ' + scriptId + '()');
                    if (typeof PageRouter.activeScript.init === "function") {
                        PageRouter.activeScript.init(param);
                    }
                }
            }
        }
        for (let idx = 0; idx < htmlUrl.length; idx++) {
            PageRouter.pvtLoadMultiPage(htmlUrl[idx], callback);
        }
    }
};

PageRouter.init = function (args) {
    PageRouter.pageDynamicContent = $("#" + args.mainId);
    const pageNavHeader = $("#" + args.headerId);
    pageNavHeader.addClass('bg-uat');
    pageNavHeader.load('header.html');
    $('[data-href]').click(function (evt) {
        evt.preventDefault();
        let ele = $(evt.currentTarget), href = ele.attr("data-href");
        if(typeof href === "string" && 0 < href.trim().length) {
            PageRouter.show(href.trim());
        } else {
            PageMessage.show("ERROR : Element data-href not defined.");
        }
    });
    $('#page-title').text(typeof args.title === "string" ? args.title : '');
};

PageRouter.notify = function (callback) {
    if(typeof PageRouter.eventBus === "undefined") {
        PageRouter.eventBus = [];
    }
    if(typeof callback === "function") {
        PageRouter.eventBus.push(callback);
    }
};

PageRouter.publish = function (name, args) {
    if(typeof PageRouter.eventBus === "undefined") {
        PageRouter.eventBus = [];
    }
    if(typeof args === "object" && args !== null) {
        for(let idx =0; idx < PageRouter.eventBus.length; idx++) {
            let notify = PageRouter.eventBus[idx];
            notify(name, args);
        }
    }
};