RegisterNUICallback("Eventhandler", function(passed, cb)
    local event <const> = passed.event
    local data <const> = passed.data

    if (event == "CloseMenu") then
        CloseMenu()

        cb("ok")
    elseif (event == "GetConfig") then
        return cb({
            Settings = {
                maxHistory = Config.Settings.maxHistory,
                presetsPerPage = Config.Settings.presetsPerPage,
            }
        })
    elseif (event == "GetStrings") then
        return cb(Translations)
    elseif (event == "StartEditing") then
        Wait(300)

        local isValid, reason = IsValidEditingProps(data.prop, data.dict)
        if (not isValid) then
            Z.notify(reason)
            return cb("ok")
        end

        local propOffset = vector3(data.offset[1] or 0.0, data.offset[2] or 0.0, data.offset[3] or 0.0)
        local propRot = vector3(data.rotation[1] or 0.0, data.rotation[2] or 0.0, data.rotation[3] or 0.0)

        data.offset = propOffset
        data.rotation = propRot

        CloseMenu()

        CreateThread(function()
            StartEditing(data)
        end)

        return cb("ok")
    elseif (event == "GetHistory") then
        local history = GetHistory()

        return cb(history)
    elseif (event == "GetPresets") then
        local presets, reason = Z.callback.await("zyke_propaligner:GetPresets", data)
        if (reason) then Z.notify(reason) end

        return cb(presets)
    elseif (event == "CreatePreset") then
        local presetData, reason = Z.callback.await("zyke_propaligner:CreatePreset", data)
        if (reason) then Z.notify(reason) end

        return cb(presetData)
    elseif (event == "OverwritePreset") then
        local presetData, reason = Z.callback.await("zyke_propaligner:OverwritePreset", data)
        if (reason) then Z.notify(reason) end

        return cb(presetData)
    elseif (event == "DeletePreset") then
        local success, reason = Z.callback.await("zyke_propaligner:DeletePreset", data)
        if (reason) then Z.notify(reason) end

        return cb(success)
    elseif (event == "ExportPresetJson") then
        ---@type Export
        local preset = {
            label = data.label,
            data = {
                prop = data.data.prop,
                bone = data.data.bone,
                dict = data.data.dict,
                clip = data.data.clip,
                offset = {data.data.offset[1] or 0.0, data.data.offset[2] or 0.0, data.data.offset[3] or 0.0},
                rotation = {data.data.rotation[1] or 0.0, data.data.rotation[2] or 0.0, data.data.rotation[3] or 0.0}
            },
        }

        Z.copy(json.encode(preset))
        Z.notify("presetExportedJson")
    elseif (event == "ImportPreset") then
        local preset, reason = Z.callback.await("zyke_propaligner:ImportPreset", data)
        if (reason) then Z.notify(reason) end

        return cb(preset)
    elseif (event == "OnPresetLoad") then
        TriggerServerEvent("zyke_propaligner:OnPresetLoad", data)
    end

    cb("ok")
end)

-- After creating a preset, we will be waiting for this event to be sent
---@param data Preset
RegisterNetEvent("zyke_propaligner:PresetAdded", function(data)
    SendNUIMessage({
        event = "PresetAdded",
        data = data
    })
end)