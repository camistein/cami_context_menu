 (function() {
    window.CAMI_MENU = {};
CAMI_MENU.ResourceName = "cami_menu";
CAMI_MENU.options = []
CAMI_MENU.current = {}
CAMI_MENU.maxItemsPer = 8
CAMI_MENU.positionX = 50
CAMI_MENU.positionY = 50;
CAMI_MENU.pageStartIndex = 0;
CAMI_MENU.current = []
CAMI_MENU.back = []
CAMI_MENU.pageEndIndex = CAMI_MENU.maxItemsPer - 1;

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

CAMI_MENU.open = function(options, x, y) {
    CAMI_MENU.options = options; 
    CAMI_MENU.positionX = x;
    CAMI_MENU.positionY = y;

    CAMI_MENU.setupBackIndexes(CAMI_MENU.options)
    CAMI_MENU.initMenu();
    document.onkeydown = function(event) {
        if(event.key == 'Escape' || event.key == 'Alt') {
            CAMI_MENU.close()
        }
    }
}

CAMI_MENU.close = function () {
    delete CAMI_MENU.options;
    delete CAMI_MENU.current;
    fetch(`http://${CAMI_MENU.ResourceName}/menu_close`, {
        method: 'POST',
    })
    CAMI_MENU.initMenu();
}

CAMI_MENU.setupBackIndexes = function(items, back) {
    if(items) {
        items.forEach((item, index) => {
            if(item.options) {
                item.back = back ? back : "[root]" ;
                CAMI_MENU.setupBackIndexes(item.options, `${back ? `${back}.` : "[root]." }${index}`)
            }
            else {
                item.back = back;
            }
        })
    }
}

CAMI_MENU.initMenu = function () {
    CAMI_MENU.setupBackIndexes(CAMI_MENU.options)
    CAMI_MENU.current = CAMI_MENU.options;
    if(CAMI_MENU.current && CAMI_MENU.current.length > CAMI_MENU.maxItemsPer) {
        let items = CAMI_MENU.current.slice(0, CAMI_MENU.maxItemsPer - 1)
        CAMI_MENU.renderMenuItems(items, 0 , true, CAMI_MENU.maxItemsPer - 1)
    }
    else {
        CAMI_MENU.renderMenuItems(CAMI_MENU.options, 0)
    }
    let menuContainer = document.querySelectorAll("#menu")[0];
    menuContainer.style.left = CAMI_MENU.positionX * 100 + "%";
    menuContainer.style.top = CAMI_MENU.positionX * 100 + "%";
    menuContainer.style.marginLeft = "-" + (menuContainer.clientWidth / 2) + "px";
    menuContainer.style.marginTop = "-" + (menuContainer.clientHeight / 2) + "px";
}

CAMI_MENU.selectItem = function (item) {
    delete CAMI_MENU.options;
    delete CAMI_MENU.current;

    fetch(`http://${CAMI_MENU.ResourceName}/menu_select`, {
        method: 'POST',
        body: JSON.stringify(
            item.event)
    })
    CAMI_MENU.initMenu();
}

CAMI_MENU.onBack = function(backIndexes) {
    let options = CAMI_MENU.options;
    let item = options[0];

    if(backIndexes && backIndexes.length > 0) {
        if(backIndexes.indexOf('.') > -1) {
            let indexes = backIndexes.split('.')
            if(indexes) {
                options = CAMI_MENU.options
                indexes.forEach((currentIndex) => {
                    if(currentIndex.indexOf('root') > -1) {
                        options = CAMI_MENU.options
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
                options = CAMI_MENU.options
            }
            else {
                let index = parseInt(backIndexes)
                if(CAMI_MENU.options[index] && CAMI_MENU.options[index].options) {
                    item = CAMI_MENU.options[index];
                    options = CAMI_MENU.options[index].options;
                }
            }
        }
    }
    else {
        options = CAMI_MENU.options
    }

    CAMI_MENU.current = options;

    if(!!item) {
        if(options.length > CAMI_MENU.maxItemsPer) {
            let chunk = options.slice(0, CAMI_MENU.maxItemsPer - 1)
            CAMI_MENU.renderMenuItems(chunk,0, true, CAMI_MENU.maxItemsPer - 1, item.back)
        }
        else {
            CAMI_MENU.renderMenuItems(options,0, false, 0,item.back)
        }
    }
    else {
        if(options.length > CAMI_MENU.maxItemsPer) {
            let chunk = options.slice(0, CAMI_MENU.maxItemsPer - 1)
            CAMI_MENU.renderMenuItems(chunk,0, true, CAMI_MENU.maxItemsPer - 1)
        }
        else {
            CAMI_MENU.renderMenuItems(options,0, false, 0)
        }
    }
}

CAMI_MENU.onClick = function(index, isLoadmore) {
    if(CAMI_MENU.current) {
        if(isLoadmore) {
            let start = parseInt(index);
            let end = start + (CAMI_MENU.maxItemsPer - 1);
            let options = CAMI_MENU.current.slice(start, end)

            if(end > CAMI_MENU.current.length) {
                CAMI_MENU.renderMenuItems(options, start ,true, 0)
            }
            else {
                CAMI_MENU.renderMenuItems(options, start ,true, end)
            }
           
        }
        else {
            let itemIndex = parseInt(index)
            if(CAMI_MENU.current[itemIndex]) {
                let item = CAMI_MENU.current[itemIndex];
                if(item.options && item.options.length) {
                    CAMI_MENU.current = item.options;

                    if(item.options.length > CAMI_MENU.maxItemsPer) {
                        let options = CAMI_MENU.current.slice(0, CAMI_MENU.maxItemsPer - 1)
                        CAMI_MENU.renderMenuItems(options, 0 ,true, CAMI_MENU.maxItemsPer, item.back)
                    }
                    else {
                        CAMI_MENU.renderMenuItems(item.options, 0, false, 0, item.back)
                    }
                }
                else {
                    CAMI_MENU.selectItem(item)
                }
            }
        }
    }
}

CAMI_MENU.renderMenuItems = function (items, startIndex = 0, hasLoadMore = false, loadMoreIndex = 0, back) {
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
            text: 'More..', 
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

    if(back && back.length) {
        menucontent += menuBackTemplate(back)
    }

    var menu = menuTemplate({ content: menucontent, back: back });
    menuContainer.innerHTML = menu; 
}
    window.onData = (data) => {
        switch(data.action) {
            case "openMenu": {
                CAMI_MENU.open(data.options, data.x, data.y);
                break;
            }
            case "closeMenu": {
                CAMI_MENU.close();
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