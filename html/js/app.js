 (function() {
    window.SCRIPTSTORM_CONTEXTMENU = {};

SCRIPTSTORM_CONTEXTMENU.translations = {}    
SCRIPTSTORM_CONTEXTMENU.ResourceName = "scriptstorm_contextmenu";
SCRIPTSTORM_CONTEXTMENU.options = []
SCRIPTSTORM_CONTEXTMENU.name = ""
SCRIPTSTORM_CONTEXTMENU.currentOptions = []
SCRIPTSTORM_CONTEXTMENU.maxItemsPer = 8
SCRIPTSTORM_CONTEXTMENU.positionX = 50
SCRIPTSTORM_CONTEXTMENU.positionY = 50;
SCRIPTSTORM_CONTEXTMENU.pageStartIndex = 0;
SCRIPTSTORM_CONTEXTMENU.currentBackIndex = ""
SCRIPTSTORM_CONTEXTMENU.currentBackItem = undefined

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

SCRIPTSTORM_CONTEXTMENU.open = function(options, x, y) {
    SCRIPTSTORM_CONTEXTMENU.options = options; 
    SCRIPTSTORM_CONTEXTMENU.positionX = x;
    SCRIPTSTORM_CONTEXTMENU.positionY = y;

    SCRIPTSTORM_CONTEXTMENU.setupBackIndexes(SCRIPTSTORM_CONTEXTMENU.options)
    SCRIPTSTORM_CONTEXTMENU.initMenu();
    document.onkeydown = function(event) {
        if(event.key == 'Escape') {
            SCRIPTSTORM_CONTEXTMENU.close()
        }
    }
}

SCRIPTSTORM_CONTEXTMENU.close = function () {
    delete SCRIPTSTORM_CONTEXTMENU.options;
    delete SCRIPTSTORM_CONTEXTMENU.currentOptions;
    try {
        fetch(`http://${SCRIPTSTORM_CONTEXTMENU.ResourceName}/menu_close`, {
            method: 'POST',
        }).catch((err) => console.warn(err))
    }
    catch(err) {
        console.warn(err)
    }

    SCRIPTSTORM_CONTEXTMENU.initMenu();
}

SCRIPTSTORM_CONTEXTMENU.setupBackIndexes = function(items, backIndex) {
    if(items) {
        items.forEach((item, index) => {
            if(item.options) {
                item.backIndex = backIndex ? backIndex : "[root]" ;
                SCRIPTSTORM_CONTEXTMENU.setupBackIndexes(item.options, `${backIndex ? `${backIndex}.` : "[root]." }${index}`)
            }
            else {
                item.backIndex = backIndex;
            }
        })
    }
}

SCRIPTSTORM_CONTEXTMENU.initMenu = function () {

    SCRIPTSTORM_CONTEXTMENU.setupBackIndexes(SCRIPTSTORM_CONTEXTMENU.options)
    SCRIPTSTORM_CONTEXTMENU.currentOptions = SCRIPTSTORM_CONTEXTMENU.options;

    if(SCRIPTSTORM_CONTEXTMENU.currentOptions && SCRIPTSTORM_CONTEXTMENU.currentOptions.length > SCRIPTSTORM_CONTEXTMENU.maxItemsPer) {
        let items = SCRIPTSTORM_CONTEXTMENU.currentOptions.slice(0, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1)
        SCRIPTSTORM_CONTEXTMENU.renderMenuItems(items, 0 , true, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1)
    }
    else {
        SCRIPTSTORM_CONTEXTMENU.renderMenuItems(SCRIPTSTORM_CONTEXTMENU.options, 0)
    }

    let menuContainer = document.querySelectorAll("#menu")[0];
    menuContainer.style.left = SCRIPTSTORM_CONTEXTMENU.positionX * 100 + "%";
    menuContainer.style.top = SCRIPTSTORM_CONTEXTMENU.positionX * 100 + "%";
    menuContainer.style.marginLeft = "-" + (menuContainer.clientWidth / 2) + "px";
    menuContainer.style.marginTop = "-" + (menuContainer.clientHeight / 2) + "px";
}

SCRIPTSTORM_CONTEXTMENU.selectItem = function (item, index) {
    delete SCRIPTSTORM_CONTEXTMENU.options;
    delete SCRIPTSTORM_CONTEXTMENU.currentOptions;

    try {
        fetch(`http://${SCRIPTSTORM_CONTEXTMENU.ResourceName}/menu_select`, {
            method: 'POST',
            body: JSON.stringify({
                name: SCRIPTSTORM_CONTEXTMENU.name,
                item: {
                    index,
                    event: item.event,
                    position: item.backIndex
                }
            })
        }).catch((err) => console.warn(err))
    }
    catch(err) {
        console.warn(err)
    }

    SCRIPTSTORM_CONTEXTMENU.initMenu();
}

SCRIPTSTORM_CONTEXTMENU.onBack = function(backIndexes) {
    let options = SCRIPTSTORM_CONTEXTMENU.options;
    let item = options[0];

    if(backIndexes && backIndexes.length > 0) {
        if(backIndexes.indexOf('.') > -1) {
            let indexes = backIndexes.split('.')
            if(indexes) {
                options = SCRIPTSTORM_CONTEXTMENU.options
                indexes.forEach((currentIndex) => {
                    if(currentIndex.indexOf('root') > -1) {
                        options = SCRIPTSTORM_CONTEXTMENU.options
                    }
                    else {
                        let index = parseInt(currentIndex.replace('.'))
                        if(!!options[index]) {
                            item = options[index];
                            if(options[index].options) {
                                options = options[index].options;
                            }
                        }
                    }
                })
            }
        }
        else {
            if(backIndexes === "[root]") {
                options = SCRIPTSTORM_CONTEXTMENU.options
            }
            else {
                let index = parseInt(backIndexes)
                if(SCRIPTSTORM_CONTEXTMENU.options[index] && SCRIPTSTORM_CONTEXTMENU.options[index].options) {
                    item = SCRIPTSTORM_CONTEXTMENU.options[index];
                    options = SCRIPTSTORM_CONTEXTMENU.options[index].options;
                }
            }
        }
    }
    else {
        options = SCRIPTSTORM_CONTEXTMENU.options
    }

    SCRIPTSTORM_CONTEXTMENU.currentOptions = options;

    if(!!item) {
        SCRIPTSTORM_CONTEXTMENU.currentBackIndex = item.backIndex;
        SCRIPTSTORM_CONTEXTMENU.currentBackItem = item;

        if(options.length > SCRIPTSTORM_CONTEXTMENU.maxItemsPer) {
            let chunk = options.slice(0, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1)
            SCRIPTSTORM_CONTEXTMENU.renderMenuItems(chunk,0, true, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1, item.backIndex)
        }
        else {
            SCRIPTSTORM_CONTEXTMENU.renderMenuItems(options,0, false, 0,item.backIndex)
        }
    }
    else {
        if(options.length > SCRIPTSTORM_CONTEXTMENU.maxItemsPer) {
            let chunk = options.slice(0, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1)
            SCRIPTSTORM_CONTEXTMENU.renderMenuItems(chunk,0, true, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1)
        }
        else {
            SCRIPTSTORM_CONTEXTMENU.renderMenuItems(options,0, false, 0)
        }
    }
}

SCRIPTSTORM_CONTEXTMENU.onClick = function(index, isLoadmore) {
    if(SCRIPTSTORM_CONTEXTMENU.currentOptions) {
        if(isLoadmore) {
            let start = parseInt(index);
            let end = start + (SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1);
            let options = SCRIPTSTORM_CONTEXTMENU.currentOptions.slice(start, end)

            if(end > SCRIPTSTORM_CONTEXTMENU.currentOptions.length) {
                SCRIPTSTORM_CONTEXTMENU.renderMenuItems(options, start ,true, 0, SCRIPTSTORM_CONTEXTMENU.currentBackIndex)
            }
            else {
                SCRIPTSTORM_CONTEXTMENU.renderMenuItems(options, start ,true, end, SCRIPTSTORM_CONTEXTMENU.currentBackIndex)
            }
           
        }
        else {
            let itemIndex = parseInt(index)
            if(SCRIPTSTORM_CONTEXTMENU.currentOptions[itemIndex]) {
                let item = SCRIPTSTORM_CONTEXTMENU.currentOptions[itemIndex];
                if(item.options && item.options.length) {
                    SCRIPTSTORM_CONTEXTMENU.currentOptions = item.options;

                    if(item.options.length > SCRIPTSTORM_CONTEXTMENU.maxItemsPer) {
                        let options = SCRIPTSTORM_CONTEXTMENU.currentOptions.slice(0, SCRIPTSTORM_CONTEXTMENU.maxItemsPer - 1)
                        SCRIPTSTORM_CONTEXTMENU.renderMenuItems(options, 0 ,true, SCRIPTSTORM_CONTEXTMENU.maxItemsPer, item.backIndex)
                    }
                    else {
                        SCRIPTSTORM_CONTEXTMENU.renderMenuItems(item.options, 0, false, 0, item.backIndex)
                    }

                    SCRIPTSTORM_CONTEXTMENU.currentBackIndex = item.backIndex
                    SCRIPTSTORM_CONTEXTMENU.currentBackItem = item
                }
                else {
                    SCRIPTSTORM_CONTEXTMENU.selectItem(item, index)
                }
            }
        }
    }
}

SCRIPTSTORM_CONTEXTMENU.renderMenuItems = function (items, startIndex = 0, hasLoadMore = false, loadMoreIndex = 0, backIndex) {
    let menuContainer = document.querySelectorAll("#menu")[0];
    menuContainer.innerHTML = "";

    if(!items || (!!items && items.length <= 0)) {
        return;
    }

    let menuTemplateContent = document.querySelectorAll("#menu-template")[0].innerHTML;
    var menuTemplate = Handlebars.compile(menuTemplateContent);

    let menuItemTemplateContent = document.querySelectorAll("#menu-item-template")[0].innerHTML;
    var menuItemTemplate = Handlebars.compile(menuItemTemplateContent);

    let menuBackTemplateContent = document.querySelectorAll("#menu-back-template")[0].innerHTML;
    var menuBackTemplate = Handlebars.compile(menuBackTemplateContent);

    var menucontent = ''
    if(hasLoadMore) {
        menucontent += menuItemTemplate({
            text: ` ${SCRIPTSTORM_CONTEXTMENU.translations?.more ?? 'More'}..`, 
            loadMore: true,
            index: loadMoreIndex
        })
        items.forEach((item, i) =>
            {
                menucontent += menuItemTemplate({...item, index: startIndex + i})
            })
    }
    else {
        items.forEach((item, i) =>
        {
            menucontent += menuItemTemplate({...item, index: startIndex + i})
        })
    }

    if(backIndex && backIndex.length) {
        menucontent += menuBackTemplate({index: backIndex, text: SCRIPTSTORM_CONTEXTMENU.translations?.back ?? 'Back'})
    }

    var menu = menuTemplate({ content: menucontent });
    menuContainer.innerHTML = menu; 
}
    window.onData = (data) => {
        if(data.translations) {
            SCRIPTSTORM_CONTEXTMENU.translations = data.translations
        }

        switch(data.action) {
            case "openMenu": {
                SCRIPTSTORM_CONTEXTMENU.name = data.name;
                SCRIPTSTORM_CONTEXTMENU.open(data.options, data.x, data.y);
                break;
            }
            case "closeMenu": {
                SCRIPTSTORM_CONTEXTMENU.close();
                break;
            }
        }
    }

    window.onload = function (e) {
        window.addEventListener("message", (event) => {
            onData(event.data);
        });
    };
})()