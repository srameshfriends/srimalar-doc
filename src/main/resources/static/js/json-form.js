function JsonForm() {
    const self = this;
    self.pvtSetText = function (cfg, value) {
        if(typeof value === "undefined") {
            value = '';
        }
        let elements = self.controlMap.get(cfg);
        if('checkbox' === cfg.type || 'radio' === cfg.type) {
            elements[0].val('true' === value.toLowerCase());
        } else {
            elements[0].val(value);
        }
    };
    self.setData = function (obj) {
        if(typeof obj !== "object") {
            obj = {};
        }
        self.data = obj;
        for (let cfg of self.controlMap.keys()) {
            let name = cfg.name, value = obj[name];
            self.pvtSetText(cfg, value);
        }
    };
    self.getData = function () {
        return self.data;
    };
    self.addControl = function (parent, cfg) {
        let control, colDiv1 =  $('<div class="col mb-3" /></div>');
        let label = $('<label>' + cfg.title + '</label>');
        label.attr('class', 'form-label');
        parent.append(colDiv1);
        colDiv1.append(label);
        if('checkbox' === cfg.type || 'radio' === cfg.type) {
            control = [];
            colDiv1.append(self.pvtAddCheckBoxRadio(cfg, control));
            colDiv1.append(self.pvtGetInfoNode(cfg));
            self.controlMap.set(cfg, [control, parent]);
        } else {
            control = $('<input id="' + cfg.name +  '" />');
            control.attr('type', cfg.type);
            control.attr('class', 'form-control text-primary');
            colDiv1.append(control);
            colDiv1.append(self.pvtGetInfoNode(cfg));
            self.controlMap.set(cfg, [control, parent]);
        }
    };
    self.pvtAddCheckBoxRadio = function (cfg, control) {
        let div = $('<div class="d-inline" /></div>');
        for(let ix = 0; ix < cfg.groups.length; ix++) {
            let groupDiv = $('<div class="form-check"></div>');
            let grp = cfg.groups[ix];
            let lbl = $('<label>' + grp.title + '</label>');
            lbl.attr('class', 'form-check-label me-2');
            let ctl = $('<input name="' + cfg.name + '" />');
            ctl.attr('type', cfg.type);
            ctl.attr('value', grp.value);
            ctl.attr('class', 'form-check-input');
            groupDiv.append(lbl);
            groupDiv.append(ctl);
            div.append(groupDiv);
            control.push(ctl);
        }
        return div;
    };
    self.pvtGetInfoNode = function (cfg) {
        let div = $('<div class="form-label" style="font-size: 0.8rem"/></div>');
        if(cfg.required) {
            div.append($('<span class="text-muted bg-warning"/> * </span>'));
        }
        div.append($('<span class="text-muted"/>Type : </span>'));
        div.append($('<span class="text-muted"/>' + cfg.type +  '</span>'));
        if(typeof  cfg.length === 'number') {
            div.append($('<span class="text-muted"/>, Length : </span>'));
            div.append($('<span class="text-muted"/>' + cfg.length +  '</span>'));
        }
        return div;
    };
    self.build = function (args) {
        self.controlMap = new Map();
        if(typeof args.id === "undefined") {
            throw "Form id should not be null.";
        }
        if(!Array.isArray(args.fields)) {
            throw "Form fields should be array.";
        }
        self.form = $('#' + args.id);
        for(let idx = 0; idx < args.fields.length; idx++) {
            let cfg = args.fields[idx];
            let row = $('<div class="row" /></div>');
            self.addControl(row, cfg);
            self.form.append(row);
        }
        self.config = args;
        return self;
    }
}

/*var value = $("input[name=RadioGroup1]:checked").val();

alert("The user selected; " + value);*/