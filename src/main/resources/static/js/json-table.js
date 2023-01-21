function Pagination() {
    const self = this;
    self.refreshDisplay = function () {
        if(self.isPrevious()) {
            self.previousBtn.removeClass('disabled');
        } else {
            self.previousBtn.addClass('disabled');
        }
        if(self.isNext()) {
            self.nextBtn.removeClass('disabled');
        } else {
            self.nextBtn.addClass('disabled');
        }
        if(0 === self.size) {
            self.infoLink.text('No Records');
        } else {
            let start = self.offset + 1, end = self.offset + self.size;
            self.infoLink.text(start + ' - ' + end + ' Of ' + self.totalRecords);
        }
    };
    self.isNext = function () {
        let offset = self.offset + self.limit;
        return offset < self.totalRecords;
    };
    self.getNext = function () {
        let offset = self.offset + self.limit;
        if(self.isNext()) {
            return {offset: offset, limit: self.limit, size: self.size, totalRecords: self.totalRecords};
        }
        return {offset: self.offset, limit: self.limit, size: self.size, totalRecords: self.totalRecords};
    };
    self.isPrevious = function () {
        let offset = self.offset - self.limit;
        return -1 < offset;
    };
    self.getPrevious = function () {
        let offset = self.offset - self.limit;
        if(self.isPrevious()) {
            return {offset: offset, limit: self.limit, size: self.size, totalRecords: self.totalRecords};
        }
        return {offset: self.offset, limit: self.limit, size: self.size, totalRecords: self.totalRecords};
    };
    self.get = function (reset) {
        if(true === reset) {
            return {offset:0, limit: 20, size: 0, totalRecords: 0};
        }
        return {offset: self.offset, limit: self.limit, size: self.size, totalRecords: self.totalRecords};
    };
    self.set = function (args) {
        if(typeof args !== "object" || args === null) {
            args = {};
        }
        if(typeof args.offset !== "number") {
            console.log('argument is  nit number : ' + args.offset);
            args.offset = 0;
        }
        if(typeof args.limit !== "number") {
            args.limit = 20;
        }
        if(typeof args.size !== "number") {
            args.size = 0;
        }
        if(typeof args.totalRecords !== "number") {
            args.totalRecords = 0;
        }
        self.limit = args.limit;
        self.offset = args.offset;
        self.totalRecords = args.totalRecords;
        self.size = args.size;
        self.refreshDisplay();
    };
    self.pvtListener = function (nodeArray) {
        for(let idx = 0; idx < nodeArray.length; idx++) {
            if(0 === idx) {
                self.previousBtn =  $(nodeArray[idx]);
            } else if(1 === idx) {
                self.infoLink =  $(nodeArray[idx]);
            } else if(2 === idx) {
                self.nextBtn =  $(nodeArray[idx]);
            }
        }
        self.previousBtn.click(function () {
            if(self.isPrevious() && typeof self.config.onPaginationEvent === "function") {
                self.config.onPaginationEvent(self.getPrevious());
            }
        });
        self.nextBtn.click(function () {
            if(self.isNext() && typeof self.config.onPaginationEvent === "function") {
                let next = self.getNext();
                self.config.onPaginationEvent(next);
            }
        });
    };
    self.build = function (args) {
        if(typeof args.id !== "string") {
            console.log('Pagination id should not be null.');
        }
        if(typeof args.limit === "number") {
            self.limit = args.limit;
        } else {
            self.limit = 20;
        }
        self.offset = 0;
        self.totalRecords = 0;
        self.size = 0;
        self.config = args;
        self.element = $('<div class="btn-group" role="group" aria-label="Pagination">' +
            '<button type="button" class="btn btn-outline-primary"><i class="bi bi-arrow-left-short"></i></button>' +
            '<button type="button" class="btn btn-outline-primary"></button>' +
            '<button type="button" class="btn btn-outline-primary"><i class="bi bi-arrow-right-short"></i></button>' +
            '</div>');
        self.parent = $("#" + args.id);
        self.parent.append(self.element);
        self.pvtListener(self.element.children());
        return self;
    };
}

function JsonTable() {
    let self = this;
    self.clearAll = function () {
        self.data = [];
        self.tableBody.children().detach();
    };
    self.pvtActionEvent = function (rowId, name, obj) {
        if(typeof self.config.onActionEvent === "function") {
            self.config.onActionEvent(obj, name, rowId);
        }
    };
    self.pvtAddCell = function (rowNode, name, obj) {
        let value = obj[name], text = '';
        if(typeof value !== "undefined" && value !== null) {
            if(typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
                text = value;
            } else {
                text = value.toString();
            }
        }
        let colElement = $('<td></td>'), spanNode = $('<span></span>');
        spanNode.text(text);
        colElement.append(spanNode);
        colElement.appendTo(rowNode);
        if(typeof self.config.onActionEvent === "function") {
            spanNode.css('cursor', 'pointer');
            spanNode.click(function (evt) {
                evt.preventDefault();
                self.pvtActionEvent(rowNode.data('rowId'), name, obj);
            });
        }
    };
    self.addRow = function (rowId, obj) {
        if(typeof obj === "undefined" || obj === null || typeof obj !== "object") {
            obj = {};
        }
        const columns = self.config.columns;
        const rowElement = $('<tr></tr>').appendTo(self.tableBody);
        rowElement.data('rowId', rowId);
        for(let colIdx = 0; colIdx < columns.length; colIdx++) {
            let name = columns[colIdx];
            self.pvtAddCell(rowElement, name, obj);
        }
    };
    self.setData = function (array) {
        if(!Array.isArray(array)) {
            array = [];
        }
        self.clearAll();
        self.data = array;
        for(let rowIdx = 0; rowIdx < array.length; rowIdx++) {
            self.addRow(rowIdx, array[rowIdx]);
        }
    };
    self.build = function (args) {
        if(typeof args.id !== "string") {
            console.log('Table body id should not be null.');
        }
        if(!Array.isArray(args.columns) || args.columns.length === 0) {
            console.log('Columns should not be null.');
        }
        self.config = args;
        self.tableBody = $("#" + args.id);
        return self;
    };
}

function JsonOptionList() {
    let self = this;
    self.pvtGetText = function (value) {
        if(typeof value !== "undefined" && value !== null) {
            if(typeof value === "string") {
                return value;
            } else if(typeof value === "number" || typeof value === "boolean") {
                return value + '';
            } else {
                return  value.toString();
            }
        }
        return '';
    };
    self.pvtGetDisplay = function (obj) {
        const columns = self.config.columns;
        let text = '';
        if(1 === columns.length) {
            let name = columns[0];
            return self.pvtGetText(obj[name]);
        }
        for(let colIdx = 0; colIdx < columns.length; colIdx++) {
            let name = columns[colIdx], itm = self.pvtGetText(obj[name]);
            if(0 < itm.length) {
                text = text + itm + ' - ';
            }
        }
        let idx = text.lastIndexOf(" - ");
        if((text.length) - 3 === idx) {
            text = text.substring(0, idx);
        }
        return text;
    };
    self.pvtUpdateDisplay = function (isUpdateDisplay) {
        if(!isUpdateDisplay || !self.selected) {
            return;
        }
        let index = -2, col = self.config.column, value = self.selected[col];
        for(let idx =0; idx < self.data.length; idx++) {
            let obj = self.data[idx], text = obj[col];
            if(value === text) {
                index = idx;
                break;
            }
        }
        index += 1;
        if(0 <= index ) {
            let nodes = self.selectElement.children();
            if(nodes.length > index) {
              $(nodes[index]).attr('selected', 'selected');
            }
        }
    };
    self.clearSelection = function () {
        self.selected = false;
        let node = self.selectElement.first();
        if(node) {
            $(node).attr('selected', 'selected');
        }
    };
    self.setSelected = function (value, isUpdateDisplay) {
        self.clearSelection();
        let selectedObj = false;
        if(typeof value === "object") {
            let col = self.config.column, colValue = value[col];
            for(let idx =0; idx < self.data; idx++) {
                let obj = self.data[idx];
                if(colValue === obj[col]) {
                    selectedObj = obj;
                    break;
                }
            }
        } else {
            let item = self.pvtGetText(value);
            self.selectElement.children().each(function () {
                let ele = $(this), rowId = ele.data('rowId'), col = self.config.column;
                rowId = parseInt(rowId);
                let obj = -1 === rowId ? false : rowId;
                if(typeof obj === "object") {
                       let text = self.pvtGetText(obj[col]);
                       if(item === text) {
                           selectedObj = obj;
                       }
                }
            });
        }
        self.selected = selectedObj;
        self.pvtUpdateDisplay(isUpdateDisplay);
    };
    self.setSelectedIndex = function (idx, isUpdateDisplay) {
        if(-1 === idx) {
            self.clearSelection();
        } else if(idx < self.data.length) {
            self.selected = self.data[idx];
        }
        self.pvtUpdateDisplay(isUpdateDisplay);
    };
    self.getSelected = function () {
        return self.selected;
    };
    self.clearAll = function () {
        self.data = [];
        self.selectElement.children().detach();
        self.addOption(self.config.defaultOption, -1);
    };
    self.addOption = function (obj, rowId) {
        if(typeof obj === "undefined" || obj === null || typeof obj !== "object") {
            obj = {};
        }
        let value = obj[self.config.column];
        value = self.pvtGetText(value);
        const option = $('<option value="' + value + '">' + self.pvtGetDisplay(obj) + '</option>');
        option.data('rowId', rowId + '');
        self.selectElement.append(option);
    };
    self.setData = function (array) {
        if(typeof array === "string") {
            array = eval(array);
        }
        if(!Array.isArray(array)) {
            array = [];
        }
        self.clearAll();
        self.data = array;
        for(let rowIdx = 0; rowIdx < array.length; rowIdx++) {
            self.addOption(array[rowIdx], rowIdx);
        }
    };
    self.build = function (args) {
        if(typeof args.id !== "string") {
            console.log('OptionList id should not be null.');
        }
        if(!Array.isArray(args.columns) || args.columns.length === 0) {
            console.log('OptionList columns should not be null.');
        }
        if(typeof args.column === "undefined" || args.column === null) {
            args.column = args.columns[0];
        }
        if(typeof args.defaultOption === "undefined") {
            args.defaultOption = {};
            args.defaultOption[args.column] = '\t - \t';
        }
        self.config = args;
        self.selectElement = $("#" + args.id);
        if(typeof args.change === "function") {
            self.selectElement.change(function (evt) {
                evt.preventDefault();
                self.setSelectedIndex(this.options.selectedIndex - 1);
                self.config.change(self.getSelected());
            });
        }
        self.addOption(args.defaultOption, -1);
        self.clearSelection();
        return self;
    };
}