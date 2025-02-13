local orgPos = nil
local prop = nil
local editing = false
local raise = 1002.0

local function reset()
    if (prop and DoesEntityExist(prop)) then DeleteEntity(prop) end
    if (orgPos) then
        SetEntityCoords(PlayerPedId(), orgPos.x, orgPos.y, orgPos.z - 0.985, false, false, false, false)
        FreezeEntityPosition(PlayerPedId(), false)
    end

    editing = false

    ClearPedTasks(PlayerPedId())
end

function CloseMenu()
    SetNuiFocus(false, false)
    SendNUIMessage({event = "SetOpen", data = false})
end

---@param data {prop: string, bone: number, dict: string, clip: string}
---@return boolean, string?
function IsValidEditingProps(data)
    if (not Z.loadModel(data.prop, true)) then return false, "invalidModel" end
    if (not Z.loadDict(data.dict, true)) then return false, "invalidDict" end

    return true
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

---@param data AlignmentData
function StartEditing(data)
    local isValid, reason = IsValidEditingProps(data)
    if (not isValid) then return Z.notify(reason) end

    if (not Z.loadModel(data.prop, true)) then return Z.notify("invalidModel") end
    if (not Z.loadDict(data.dict, true)) then return Z.notify("invalidDict") end

    orgPos = GetEntityCoords(PlayerPedId())

    local scaleform = nil
    local keys = Z.keys.getAll()
    local loopingAnimation = true
    local animSpeedIdx, speedMultiplier = 10, 0.05
    local stoppedAnim = 0
    local buttons = {}

    local boneIdx = GetPedBoneIndex(PlayerPedId(), data.bone)

    -- Because of some weird conversions, we have to change some of these values
    -- I will eventually get around to converting all of it properly, but we'll run it like this for now
    -- LATEST CONVERSIONS
    -- data.offset.x = data.offset.z
    -- data.offset.y = data.offset.y
    -- data.offset.z = -data.offset.x

    local propOffset = vector3(data.offset.x, data.offset.y, data.offset.z)
    local propRot = vector3(data.rotation.x, data.rotation.y, data.rotation.z)

    local function isPlayingAnim()
        return IsEntityPlayingAnim(PlayerPedId(), data.dict, data.clip, 3)
    end

    ---@param skipCheck? boolean
    local function ensureAnim(skipCheck)
        if (not loopingAnimation) then return end

        local ply = PlayerPedId()

        -- Some delay to allow it to fully stop playing animation before running it again
        if (not skipCheck) then
            if (not isPlayingAnim() and stoppedAnim == nil) then stoppedAnim = GetGameTimer() end
            if (stoppedAnim and (GetGameTimer() - stoppedAnim < 1500)) then return end
        end

        if (not isPlayingAnim()) then
            stoppedAnim = nil

            local animDur = GetAnimDuration(data.dict, data.clip) * (1.0 / (animSpeedIdx * speedMultiplier))

            TaskPlayAnim(ply, data.dict, data.clip, 1.0, 1.0, math.floor(animDur * 1000), 49, nil, nil, nil, nil)

            -- Wait for the animation to start playing
            while (not isPlayingAnim()) do Wait(1) end

            SetEntityAnimSpeed(ply, data.dict, data.clip, animSpeedIdx * speedMultiplier)
        end
    end

    local function ensureProp()
        if (prop and DoesEntityExist(prop)) then DeleteEntity(prop) end

        local ply = PlayerPedId()
        local plyPos = GetEntityCoords(ply)
        prop = CreateObject(data.prop, plyPos.x, plyPos.y, plyPos.z, false, false, false)

        -- Because of some weird conversions, we have to change some of these values
        AttachEntityToEntity(prop, ply, boneIdx, -propOffset.z, propOffset.y, propOffset.x, -propRot.x, propRot.z, propRot.y, true, true, false, true, 1, true)
    end

    FreezeEntityPosition(PlayerPedId(), true)
    SetEntityCoords(PlayerPedId(), 0.0, 0.0, 1000.0, false, false, false, false)

    local function registerButtons()
        scaleform = Z.instructionalButtons.register(buttons)
    end

    local function setSpeedLabel()
        local speedLabel = ("Speed - %s"):format(tostring(animSpeedIdx * speedMultiplier))

        for idx, button in pairs(buttons) do
            if (button.speedLabel == true) then
                button.label = speedLabel
                break
            end
        end

        registerButtons()
    end

    local function exit()
        reset()
        SetNuiFocus(false, false)
        SendNUIMessage({
            event = "setGizmoEntity",
            data = {handle = nil}
        })
    end

    buttons = {
        {label = "Save", key = "ENTER", func = function(keyCode, key, active, disable)
            print("Saving")
            print("Offset:", vector3(propOffset.x, propOffset.y, propOffset.z))
            print("Rotation:", vector3(propRot.x, propRot.y, propRot.z))

            AddToHistory({
                prop = data.prop,
                bone = data.bone,
                dict = data.dict,
                clip = data.clip,
                offset = {propOffset.x, propOffset.y, propOffset.z},
                rotation = {propRot.x, propRot.y, propRot.z}
            })

            exit()
        end},
        {label = "Exit", key = "BACKSPACE", func = function()
            exit()
        end},
        {label = "Toggle Focus (Hold)", key = "LEFTSHIFT", func = function(keyCode, key, active, disable)
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
        {label = "Toggle Off/Rot (When Focus Toggled)", key = "R", func = function() end},
        {label = "Toggle Animation", key = "X", func = function()
            loopingAnimation = not loopingAnimation

            if (not loopingAnimation) then
                ClearPedTasks(PlayerPedId())
            else
                ensureAnim(true)
            end
        end},
        {speedLabel = true, label = "Speed", key = {"SCROLLDOWN", "SCROLLUP"}, func = function(keyCode, key, active, disable)
            if (keyCode == 14) then -- Down
                animSpeedIdx = math.floor(animSpeedIdx - 1)
            else -- Up
                animSpeedIdx = math.floor(animSpeedIdx + 1)
            end

            local maxSpeed = 2.0
            if ((animSpeedIdx * speedMultiplier) < speedMultiplier) then animSpeedIdx = 1 end
            if ((animSpeedIdx * speedMultiplier) > 2.0) then animSpeedIdx = math.floor(maxSpeed / speedMultiplier) end

            -- animSpeedIdx = math.floor(animSpeedIdx * 100) / 100

            SetEntityAnimSpeed(PlayerPedId(), data.dict, data.clip, animSpeedIdx * speedMultiplier)
            setSpeedLabel()
            ClearPedTasks(PlayerPedId())
        end},
    }

    ensureProp()
    setSpeedLabel()

    SendNUIMessage({
        event = "setGizmoEntity",
        data = {
            handle = prop,
            position = vector3(propOffset.x, propOffset.y, propOffset.z + raise),
            rotation = vector3(propRot.x, propRot.y, propRot.z),
        }
    })

    -- Due to the weird conversions and fuckery, set the propOffset here in the correct order
    -- This ensures that if we are saving something without moving it, it will still be saved properly, previously it had an incorrect order
    propOffset = vector3(-propOffset.z, propOffset.y, propOffset.x)
    propRot = vector3(-propRot.x, propRot.z, propRot.y)

    RegisterNUICallback("Eventhandler:moveEntity", function(data, cb)
        data = data.data
        if (not prop or not DoesEntityExist(prop)) then return end

        propOffset = vector3(raise - data.position.z, data.position.y, data.position.x)
        propRot = vector3(data.rotation.x, data.rotation.y, data.rotation.z)

        AttachEntityToEntity(prop, PlayerPedId(), boneIdx, propOffset.x, propOffset.y, propOffset.z, propRot.x, propRot.y, propRot.z, true, true, false, true, 1, true)
        cb("ok")
    end)

    editing = true
    CreateThread(function()
        while (editing) do
            Z.instructionalButtons.draw(scaleform, 0, 0, 0, 0, 0)

            for _, button in pairs(buttons) do
                if (type(button.key) == "table") then
                    ---@diagnostic disable-next-line: param-type-mismatch
                    for _, key in pairs(button.key) do
                        local keyCode = keys[key].keyCode
                        DisableControlAction(0, keyCode, true)

                        if (IsDisabledControlJustPressed(0, keyCode)) then
                            button.func(keyCode, key, button.activate, button.disable)
                        end
                    end

                    goto continue
                end

                local keyCode = keys[button.key].keyCode
                DisableControlAction(0, keyCode, true)

                if (IsDisabledControlJustPressed(0, keyCode)) then
                    button.func(keyCode, button.key, button.active, button.disable)
                end

                ::continue::
            end

            ensureAnim()

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
    end)
end

---@param data {prop: string, bone: number, dict: string, clip: string, offset: Vector3Array, rotation: Vector3Array}
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