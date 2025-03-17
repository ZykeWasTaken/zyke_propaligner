---@type vector3 | nil
local orgPos = nil

---@type EditingPropData[]
local props = {}

---@type boolean
InAlignmentMode = false

---@type number
local playerRaise, propRaise = 1000.0, 1002.0

local function reset()
    for i = 1, #props do
        if (props[i]?.entity and DoesEntityExist(props[i].entity)) then DeleteEntity(props[i].entity) end
    end

    if (orgPos) then
        SetEntityCoords(PlayerPedId(), orgPos.x, orgPos.y, orgPos.z - 0.985, false, false, false, false)
        FreezeEntityPosition(PlayerPedId(), false)
    end

    InAlignmentMode = false
    orgPos = nil

    ClearPedTasks(PlayerPedId())
end

function CloseMenu()
    SetNuiFocus(false, false)
    SendNUIMessage({event = "SetOpen", data = false})
end

---@param dict string
---@param clip string
---@return boolean
local function isPlayingAnim(dict, clip)
    return IsEntityPlayingAnim(PlayerPedId(), dict, clip, 3)
end

local function restrictMovementLoop()
    local ply = PlayerPedId()

    -- Disable looking around with mouse
    DisableControlAction(0, 1, true) -- LookLeftRight
    DisableControlAction(0, 2, true) -- LookUpDown
    DisableControlAction(0, 25, true) -- Input Aim
    DisableControlAction(0, 106, true) -- Vehicle Mouse Control Override
    DisableControlAction(0, 142, true) -- MeleeAttackAlternate
    DisablePlayerFiring(ply, true) -- Disable weapon firing
    DisableControlAction(0, 24, true) -- Attack
    DisableControlAction(0, 257, true) -- Attack 2
    DisableControlAction(0, 263, true) -- Melee Attack 1
    DisableControlAction(0, 264, true) -- Melee Attack 2
    DisableControlAction(0, 140, true) -- Melee Attack Alternate
    DisableControlAction(0, 141, true) -- Melee Attack Alternate 2
    DisableControlAction(0, 143, true) -- Melee Block
    DisableControlAction(0, 47, true) -- Disable weapon
    DisableControlAction(0, 58, true) -- Disable weapon

    DisableControlAction(0, 99, true) -- Disable scrolling in vehicle
    DisableControlAction(0, 100, true) -- Disable scrolling in vehicle
    DisableControlAction(0, 14, true) -- Disable scrolling in vehicle
    DisableControlAction(0, 16, true) -- Disable scrolling in vehicle
    DisableControlAction(0, 81, true) -- Disable scrolling in vehicle
    DisableControlAction(0, 82, true) -- Disable scrolling in vehicle

    DisableControlAction(0, 199, true) -- Pausing (P)
    DisableControlAction(0, 200, true) -- Pausing (ESC)

    DisableControlAction(0, 24, true)
    DisableControlAction(0, 69, true)
    DisableControlAction(0, 70, true)
    DisableControlAction(0, 92, true)
    DisableControlAction(0, 114, true)
    DisableControlAction(0, 140, true)
    DisableControlAction(0, 141, true)
    DisableControlAction(0, 142, true)
    DisableControlAction(0, 257, true)
    DisableControlAction(0, 263, true)
    DisableControlAction(0, 264, true)
    DisableControlAction(0, 331, true)
end

-- Validates if dict and clip are valid
---@param dict string
---@param clip string
---@return {dict: boolean, clip: boolean}
function IsAnimValid(dict, clip)
    -- If the dict is not valid, we can't check if clip is valid
    if (not Z.loadDict(dict, true)) then return {
        dict = false,
        clip = false
    } end

    return {
        dict = true,
        clip = GetAnimDuration(dict, clip) ~= 0.0 -- Will return 0.0 if clip is not valid, no native check to validate clips
    }
end

---@class ButtonProps
---@field label string
---@field getLabel? fun(): string
---@field key string | string[]
---@field activate? string @Key to enable this option
---@field disable? string @Key to disable this option
---@field forceRender? boolean @If pressed, forcefully re-register the buttons
---@field func fun(keyCode: integer, key: string, active: string?, disable: string?)

---@param data AlignmentData
---@return {offset: Vector3Table, rotation: Vector3Table}[] | nil, FailReason?
function StartEditing(data)
    -- Validate & load prop models
    for i = 1, #data.props do
        if (not Z.loadModel(data.props[i].prop)) then
            return nil, "invalidModel"
        end
    end

    -- Validate animation dict & clip
    local validAnims = IsAnimValid(data.dict, data.clip)
    if (not validAnims.dict) then return nil, "invalidDict" end
    if (not validAnims.clip) then return nil, "invalidClip" end

    orgPos = GetEntityCoords(PlayerPedId())

    ---@type integer
    local currPropIdx = 1

    -- Add all of the props & make sure offsetsa & rotations are numbers
    for i = 1, #data.props do
        ---@diagnostic disable-next-line: assign-type-mismatch
        props[i] = data.props[i]

        for axis, val in pairs(props[i].offset) do
            props[i].offset[axis] = val + 0.0
        end

        for axis, val in pairs(props[i].rotation) do
            props[i].rotation[axis] = val + 0.0
        end
    end

    ---@type table
    local scaleform = Z.instructionalButtons.create()

    local loopingAnimation = true
    local animSpeedIdx, speedMultiplier = 10, 0.05
    local propHighlight = false

    local waitBetween = 1500
    local stoppedAnim = GetGameTimer() - waitBetween

    ---@type ButtonProps[]
    local buttons = {}

    ---@param skipCheck? boolean
    local function ensureAnim(skipCheck)
        if (not loopingAnimation) then return end

        local ply = PlayerPedId()

        -- Some delay to allow it to fully stop playing animation before running it again
        if (not skipCheck) then
            if (not isPlayingAnim(data.dict, data.clip) and stoppedAnim == 0) then stoppedAnim = GetGameTimer() end
            if (stoppedAnim ~= 0 and (GetGameTimer() - stoppedAnim < waitBetween)) then return end
        end

        if (not isPlayingAnim(data.dict, data.clip)) then
            stoppedAnim = 0

            local animDur = GetAnimDuration(data.dict, data.clip) * (1.0 / (animSpeedIdx * speedMultiplier))

            TaskPlayAnim(ply, data.dict, data.clip, 1.0, 1.0, math.floor(animDur * 1000), 49, 0.0, false, false, false)

            -- Wait for the animation to start playing
            while (not isPlayingAnim(data.dict, data.clip)) do Wait(1) end

            SetEntityAnimSpeed(ply, data.dict, data.clip, animSpeedIdx * speedMultiplier)
        end
    end

    local function ensureProps()
        local ply = PlayerPedId()
        local plyPos = GetEntityCoords(ply)

        for i = 1, #data.props do
            if (not props[i]?.entity or not DoesEntityExist(props[i].entity)) then
                props[i].entity = CreateObject(props[i].prop, plyPos.x, plyPos.y, plyPos.z, false, false, false)
            end

            local boneIdx = GetPedBoneIndex(PlayerPedId(), data.props[i].bone)

            AttachEntityToEntity(props[i].entity, ply, boneIdx, props[i].offset.x, props[i].offset.y, props[i].offset.z, props[i].rotation.x, props[i].rotation.y, props[i].rotation.z, true, true, false, true, 1, true)
        end
    end

    FreezeEntityPosition(PlayerPedId(), true)
    SetEntityCoords(PlayerPedId(), 0.0, 0.0, playerRaise, false, false, false, false)

    local function getLabels()
        for i = 1, #buttons do
            if (buttons[i].getLabel) then
                buttons[i].label = buttons[i].getLabel()
            end
        end

        scaleform:registerButtons(buttons)
    end

    local function exit()
        reset()
        SetNuiFocus(false, false)
        SendNUIMessage({
            event = "setGizmoEntity",
            data = {handle = nil}
        })
    end

    local function setGizmoEntity()
        SendNUIMessage({
            event = "setGizmoEntity",
            data = {
                handle = props[currPropIdx].entity,
                -- X = z
                -- Y = y
                -- Z = -x
                position = vector3(props[currPropIdx].offset.z, props[currPropIdx].offset.y, -props[currPropIdx].offset.x + propRaise),

                -- X = -x
                -- Y = z
                -- Z = y
                rotation = vector3(-props[currPropIdx].rotation.x, props[currPropIdx].rotation.z, props[currPropIdx].rotation.y)
            }
        })
    end

    local function highlightCurrent()
        propHighlight = true
        SetEntityDrawOutlineColor(255, 255, 255, 255)

        for i = 1, #props do
            if (props[i]?.entity and DoesEntityExist(props[i].entity)) then
                SetEntityDrawOutline(props[i].entity, currPropIdx == i and true or false)
            end
        end
    end

    buttons = {
        {label = T("instruct:save"), key = "ENTER", func = function()
            exit()
        end},
        {label = T("instruct:exit"), key = "BACKSPACE", func = function()
            exit()
        end},
        {label = T("instruct:toggleFocus"), key = "LEFTSHIFT", func = function(keyCode)
            SetNuiFocus(true, true)
            SetNuiFocusKeepInput(true)
            SetCursorLocation(0.5, 0.5)

            CreateThread(function()
                Wait(25)

                while (IsDisabledControlPressed(0, keyCode)) do
                    restrictMovementLoop()
                    Wait(1)
                end

                SetNuiFocus(false, false)
                SetNuiFocusKeepInput(false)
            end)
        end},
        {label = T("instruct:toggleRot"), key = "R", func = function() end},
        {label = T("instruct:toggleAnim"), key = "X", func = function()
            loopingAnimation = not loopingAnimation

            if (not loopingAnimation) then
                ClearPedTasks(PlayerPedId())
            else
                ensureAnim(true)
            end
        end},
        {label = "Speed", key = {"SCROLLDOWN", "SCROLLUP"},
            getLabel = function()
                return T("instruct:speed"):format(tostring(animSpeedIdx * speedMultiplier))
            end,
            func = function(keyCode, key)
                if (key== "SCROLLDOWN") then
                    animSpeedIdx = math.floor(animSpeedIdx - 1)
                else
                    animSpeedIdx = math.floor(animSpeedIdx + 1)
                end

                local maxSpeed = 2.0
                if ((animSpeedIdx * speedMultiplier) < speedMultiplier) then animSpeedIdx = 1 end
                if ((animSpeedIdx * speedMultiplier) > 2.0) then animSpeedIdx = math.floor(maxSpeed / speedMultiplier) end

                SetEntityAnimSpeed(PlayerPedId(), data.dict, data.clip, animSpeedIdx * speedMultiplier)
                getLabels()
                ClearPedTasks(PlayerPedId())
            end
        },
        {label = "Prop", key = {"UP", "DOWN"},
            getLabel = function()
                return T("instruct:currProp"):format(currPropIdx, #props)
            end,
            func = function(_, key)
                local propsLen = #props
                if (propsLen == 1) then return end

                if (key == "UP") then
                    if (currPropIdx == 1) then
                        currPropIdx = propsLen
                    else
                        currPropIdx -= 1
                    end
                else
                    if (currPropIdx == propsLen) then
                        currPropIdx = 1
                    else
                        currPropIdx = propsLen
                    end
                end

                if (propHighlight) then
                    highlightCurrent()
                end

                getLabels()
                setGizmoEntity()
            end
        },
        {label = "Highlight Current", key = "H", func = function()
            if (propHighlight) then
                SetEntityDrawOutline(props[currPropIdx].entity, false)
                propHighlight = false
            else
                highlightCurrent()
            end
        end}
    }

    ensureProps()
    getLabels()
    setGizmoEntity()

    RegisterNUICallback("Eventhandler:moveEntity", function(data, cb)
        data = data.data
        if (not props[currPropIdx]?.entity or not DoesEntityExist(props[currPropIdx].entity)) then
            ensureProps()
            return
        end

        -- Some conversions to get the correct values
        props[currPropIdx].offset = vector3(propRaise - data.position.z, data.position.y, data.position.x)
        props[currPropIdx].rotation = vector3(data.rotation.x, data.rotation.y, data.rotation.z)

        local boneIdx = GetPedBoneIndex(PlayerPedId(), props[currPropIdx].bone)

        AttachEntityToEntity(props[currPropIdx].entity, PlayerPedId(), boneIdx, props[currPropIdx].offset.x, props[currPropIdx].offset.y, props[currPropIdx].offset.z, props[currPropIdx].rotation.x, props[currPropIdx].rotation.y, props[currPropIdx].rotation.z, true, true, false, true, 1, true)
        cb("ok")
    end)

    local animDur = math.floor(GetAnimDuration(data.dict, data.clip) * 100) / 100

    InAlignmentMode = true
    while (InAlignmentMode) do
        local ply = PlayerPedId()

        scaleform:render()
        scaleform:handleButtons()

        ensureAnim()

        Z.drawText(("Anim. Progress: %s/%ss"):format(math.floor(GetEntityAnimCurrentTime(ply, data.dict, data.clip) * animDur * 100) / 100, animDur), 0.9, 0.9, nil, nil, "right")

        SendNUIMessage({
            event = "setCameraPosition",
            data = {
                position = GetFinalRenderedCamCoord(),
                rotation = GetFinalRenderedCamRot(0)
            }
        })

        DisableIdleCamera(true)

        Wait(0)
    end

    local retVal = {
        dict = data.dict,
        clip = data.clip,
        props = props
    }

    AddToHistory(retVal)
    TriggerEvent("zyke_propaligner:StoppedEditing", retVal)

    return retVal
end

exports("StartEditing", StartEditing)

---@param data AlignmentData
function AddToHistory(data)
    local history = GetResourceKvpString("zyke_propaligner:History") or "[]"
    history = json.decode(history)

    table.insert(history, 1, data)
    history[1].created = GlobalState.OsTime

    -- Trim history length
    local historyLen = #history
    if (historyLen > Config.Settings.maxHistory) then
        -- Perform a loop to wipe excessive length if the config is changed at some point
        for i = historyLen, Config.Settings.maxHistory + 1, -1 do
            history[i] = nil
        end
    end

    SetResourceKvp("zyke_propaligner:History", json.encode(history))
end

---@param index integer
---@return HistoryData | nil
function GetHistoryByIndex(index)
    local history = GetResourceKvpString("zyke_propaligner:History") or "[]"

    return json.decode(history[index])
end

AddEventHandler("onResourceStop", function(resourceName)
    if GetCurrentResourceName() == resourceName then
        reset()
    end
end)

---@return HistoryData[]
function GetHistory()
    return json.decode(GetResourceKvpString("zyke_propaligner:History") or "[]")
end

function OpenMenu()
    SetNuiFocus(true, true)
    SendNUIMessage({event = "SetOpen", data = true})
end

-- Used when the menu is open, insert alignment data, such as from our consumables/smoking script
-- This is not used when loading history/preset within our resource
---@param data AlignmentData
function SetAlignmentData(data)
    SendNUIMessage({
        event = "SetAlignmentData",
        data = data
    })
end

exports("SetAlignmentData", SetAlignmentData)

-- Opens the menu & inserts all alignments, will then return the results when menu is exited
---@param data AlignmentData
function ConfigureAlignments(data)
    OpenMenu()
    Wait(1)
    SetAlignmentData(data)

    local p = promise:new()

    -- This event is also sent when the alignment menu is unmounted
    -- So no need to do actual editing, you can just open the menu, change some value and close it and get the latest
    local event = AddEventHandler("zyke_propaligner:StoppedEditing", function(editedData)
        p:resolve(editedData)
    end)

    local val = Citizen.Await(p)
    RemoveEventHandler(event)

    return val
end

exports("ConfigureAlignments", ConfigureAlignments)

-- RegisterCommand("test_export", function()
--     ---@type AlignmentData
--     local data = {
--         dict = "mp_player_intdrink",
--         clip = "loop_bottle",
--         props = {
--             {
--                 prop = "prop_beer_pissh",
--                 offset = {x = 0.08123698830604, y = -0.20820142328739, z = 0.06948586553335},
--                 rotation = {x = -106.48714447021484, y = -73.45453643798828, z = 6.62326574325561},
--                 bone = 18905
--             }
--         }
--     }

--     local result, failReason = exports["zyke_propaligner"]:StartEditing(data)
--     print(json.encode(result), failReason)
-- end, false)