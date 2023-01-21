function GridElement() {
    const self = this;

    self.getColumnCount = function (row) {
        if(typeof row === "undefined" && typeof self.activeRow === "object") {
            row = self.activeRow;
        }
        if(typeof row === "object") {
            return row.children().length;
        }
        return 0;
    };

    self.addRow = function () {
        if(typeof self.parent === "undefined") {
            throw 'Grid Element not created with parent element. Not allowed to add row.';
        }
        let row = $('<div class="row"></div>');
        self.parent.append(row);
        self.activeRow = row;
        return row;
    };

    self.addCell = function (child) {
        if(typeof self.parent === "undefined") {
            throw 'Grid Element not created with parent element. Not allowed to add cell.';
        }
        let cell = $('<div class="col"></div>');
        if(typeof self.activeRow === "undefined") {
            self.addRow();
        }
        if(typeof child === "object") {
            cell.append(child);
        }
        self.activeRow.append(cell);
        return cell;
    };

    self.getElement = function () {
        return self.parent;
    };

    self.create = function (parent) {
        if(typeof parent === "object") {
            self.parent = parent;
        }
        return self;
    }
}


function NameValueElement() {
    const self = this;

    self.set = function (name, value) {
        self.name = name;
        self.value = value;
        let chd = self.element.children();
        chd[0].innerText = name;
        chd[1].innerText = value;
    };

    self.setWidth = function (widthClass1, widthClass2) {
        let chd = self.element.children();
        if(typeof widthClass1 === "string") {
            $(chd[0]).addClass(widthClass1);
        }
        if(typeof widthClass2 === "string") {
            $(chd[1]).addClass(widthClass2);
        }
    };

    self.getElement = function () {
        return self.element;
    };

    self.create = function (parent) {
        self.element = $('<div class="d-flex flex-row"><div class="p-1 w-8 text-black-50"></div>' +
            '<div class="p-1"></div></div>');
        if(typeof parent === "object") {
            parent.append(self.element);
        }
        return self;
    }
}