


---@param menuItems object
---@param x number
---@param y number
function OpenMenu(menuItems, x,y)
    local openData = {
        action = "openMenu",
        options = menuItems,
        x = x, 
        y = y
    }

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
    SetCursorLocation(x, y)
    SendNUIMessage(openData)
end

RegisterNUICallback('menu_close', function(args, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('menu_select', function(args, cb)
    if args then
        Citizen.Trace('trigger menu select \n')
        Citizen.Trace(args)
        Citizen.Trace('\n')
        TriggerEvent(args,null)
    end
    SetNuiFocus(false, false)
    cb('ok')
end)


---@param menuName string
---@param namespace string
function CloseMenu(menuName,namespace)
    SendNUIMessage({
        action = "closeMenu",
        namespace = namespace,
        id = menuName
    })
    SetNuiFocus(false, false)
end

exports("closeMenu", CloseMenu)
exports("openMenu", OpenMenu)
