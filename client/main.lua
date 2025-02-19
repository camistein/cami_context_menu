
local OpenedMenus = {}

---@param namespace string
---@param name string
---@param menuItems object
---@param x number
---@param y number
---@param onclose function
function OpenMenu(namespace, name, menuItems, x, y, onclose)
    local openData = {
        name = namespace .. "_" .. name,
        action = "openMenu",
        options = menuItems,
        x = x, 
        y = y,
        translations = Config.translations
    }

    OpenedMenus[namespace .. "_" .. name] = {
        options = menuItems,
        onClose = onclose,
        namespace = namespace,
        name = name,
        opened = true,
        x = x, 
        y = y,
    }

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
    SetCursorLocation(x, y - 0.05)
    SendNUIMessage(openData)
end

RegisterNUICallback('menu_close', function(data, cb)
    local menu = nil
    if data then
        if data.name and OpenedMenus[data.name] then 
            menu = OpenedMenus[data.name]
            OpenedMenus[data.name] = nil
            if menu.onClose then 
                menu.onClose(data)
            end
        end
    end

    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('menu_select', function(data, cb)
    local menu = nil
    if data then
        if data.name ~= nil and OpenedMenus[data.name] ~= nil then 
            menu = OpenedMenus[data.name]
        end
        if data.item ~= nil then 
            local selectedItem = nil
            if data.item.event then
                TriggerEvent(data,null)
            end

            if OpenedMenus[data.name] ~= nil and data.item.index  then
                local itemIndex = data.item.index + 1 -- Lua table index starts at 1 and Js array index starts at 0
                if data.item.position ~= nil and data.item.position ~= "[root]" then 
                    local currentOptions = OpenedMenus[data.name].options
                    for word in string.gmatch(data.item.position, '([^.]+)') do
                        Citizen.Trace(word .. " \n")
                        if word ~= "[root]" then
                            local index = tonumber(word)
                            if index ~= nil then
                                index = index + 1
                                if currentOptions[index] ~= nil and currentOptions[index].options ~= nil then
                                    currentOptions = currentOptions[index].options
                                end
                            end
                        end
                        
                    end
    
                    if currentOptions ~= nil and currentOptions[itemIndex] ~= nil  then
                        local item = currentOptions[itemIndex]
                        if item and item.onSubmit then
                            Citizen.Trace(item.text .. " found by index root \n")
                            item.onSubmit(data)
                        end
                    end
                elseif data.item.index ~= nil and OpenedMenus[data.name].options ~= nil then
                    local item =  OpenedMenus[data.name].options[itemIndex]
                    if item ~= nil then
                        if item.onSubmit ~= nil then
                            Citizen.Trace(item.text .. " found by index only \n")
                            item.onSubmit(data)
                        end
                    end
                end
            end
        end
    end
    SetNuiFocus(false, false)
    cb('ok')
end)


---@param namespace string
---@param name string
function CloseMenu(namespace,name)
    SendNUIMessage({
        action = "closeMenu",
        namespace = namespace,
        id = menuName
    })

    if OpenedMenus[namespace .. "_" .. name] then 
        OpenedMenus[namespace .. "_" .. name] = nil
    end

    SetNuiFocus(false, false)
end

exports("closeMenu", CloseMenu)
exports("openMenu", OpenMenu)
