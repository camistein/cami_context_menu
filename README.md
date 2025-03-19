## Functions

exports.scriptstorm_contextmenu:openMenu

Open new menu

**Parameters**

- namespace : namespace caller
- name : name of menu
- options : table with selectItem's types, for example of item see selectItem section.
- x : x position on screen (percentage, 0.5 for 50%)
- y : y position on screen (percentage, 0.5 for 50%)

```
    exports.scriptstorm_contextmenu:openMenu("vehicle_menu", "action_menu", {
        {
            text = "Engine " .. (engineStatus and "OFF" or "ON"),
            color = (engineStatus and "#ff0000" or "#00b816"),
            onSubmit = function(data)
                Citizen.Trace("Trigger onsubmit root 1")
                TriggerEvent("vehicle_menu:engine")
            end
        },
        {
            text = "Action 2",
            event = "vehicle_menu:seatbealt"
        },
        {
            text = "Action 3",
            options = {
                {
                    color = "#fcba03",
                    text = "Action 8.1",
                },
                {
                    text = "Engine " .. (engineStatus and "ON" or "OFF"),
                    onSubmit = function(data)
                        Citizen.Trace("Trigger onsubmit 8.1")
                        TriggerEvent("vehicle_menu:engine")
                    end
                },
                {
                    text = "Action 8.3"
                },
                {
                    text = "Action 8.4",
                    options = {
                        {
                            text = "Action 8.4.1"
                        },
                        {
                            text = "Action 8.4.2"
                        }
                    }
                },
            }
        },
    }, 0.52, 0.52)
```

exports.scriptstorm_contextmenu:closeMenu

Used to close menu outside of pressing ESC

**Parameters**

- namespace : namespace caller
- name : name of menu

## Example selectItem

Example with submit funtion

```
 {
            text = "Engine " .. (engineStatus and "OFF" or "ON"),
            color = (engineStatus and "#ff0000" or "#00b816"),
            event = "vehicle_menu:engine"
            onSubmit = function(data)
                Citizen.Trace("Trigger onsubmit root 1")
                TriggerEvent("vehicle_menu:engine")
            end
        },
```

Example with options

```
{
    text = "Action 8.4",
    options = {
      {
          text = "Action 8.4.1"
      },
      {
          text = "Action 8.4.2"
      }
    }
},
```

### Optional properties:

- **event | onSubmit**: An option item can either have an event name or connected onSubmit function to trigger when selecting an item, you do not need both.
- **color**: An item can have an optional color property as well if
- **options**: if item is expandable then a selectItem can have child options, this item is then considered non selectable and cannot be combined with onSubmit and even it will only expand more options that are selectable.

## Demo

https://www.youtube.com/watch?v=JbYPaesHJHg

## Todo

- Add tab select functionality
- Add configurable colors
- Add additional configurable close keys
- Add click outside trigger close menu
