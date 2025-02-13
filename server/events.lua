---@type PresetData[]
local presets = {}

Z.callback.register("zyke_propaligner:GetPresets", function(plyId, offset)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.useMenu)) then return {} end

    local pagePresets = {}
    local maxPresets = Config.Settings.presetsPerPage
    for i = 1, maxPresets do
        local idx = maxPresets * (offset - 1) + i
        if (presets[idx] == nil) then break end

        pagePresets[i] = presets[idx]
    end

    return {presets = pagePresets, totalPresets = #presets}
end)

---@param id string
---@return boolean, integer?
local function doesIdExist(id)
    for i = 1, #presets do
        if (presets[i].id == id) then return true, i end
    end

    return false, nil
end

-- Lowkey goofy to check an array for id to create a unique one, but due to the small size it won't matter
-- The fake simulated loading time to avoid "flickering" in the JS is > 95% of the loading time
---@return string
local function createId()
    while (1) do
        local id = Z.createUniqueId(10)

        if (not doesIdExist(id)) then return id end
    end
end

local function savePresets()
    SetResourceKvp("zyke_propaligner:Presets", json.encode(presets))
end

-- Does not verify id, just inserts
---@param data PresetData
local function addPreset(data)
    table.insert(presets, 1, data)

    savePresets()

    return true
end

-- Will remove the preset at the given idx, and insert the new preset data at the very top
-- Acts as an overwrite, retains label and id, the rest is modified
---@param data PresetData
---@param idx integer
local function setPreset(data, idx)
    table.remove(presets, idx) -- Remove old
    table.insert(presets, 1, data) -- Insert modified data

    savePresets()
end

Z.callback.register("zyke_propaligner:CreatePreset", function(plyId, data)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.createPreset)) then return false, "noPermission" end

    data.id = createId()
    data.created = os.time()
    addPreset(data)

    return data
end)

Z.callback.register("zyke_propaligner:OverwritePreset", function(plyId, data)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.overwritePreset)) then return false, "noPermission" end

    local doesExist, idx = doesIdExist(data.id)
    if (not doesExist or not idx) then return false, "noPresetDataFound" end

    local prevLabel = presets[idx].label
    data.label = prevLabel
    data.created = os.time()

    setPreset(data, idx)

    return data
end)

---@param id string
---@return Success
local function deletePreset(id)
    for i = 1, #presets do
        if (presets[i].id == id) then
            table.remove(presets, i)
            savePresets()

            return true
        end
    end

    return false
end

Z.callback.register("zyke_propaligner:DeletePreset", function(plyId, id)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.deletePreset)) then return false, "noPermission" end

    local success = deletePreset(id)
    if (not success) then return false, "noPresetDataFound" end

    return true
end)

---@param plyId PlayerId
---@param data JSON
Z.callback.register("zyke_propaligner:ImportPreset", function(plyId, data)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.importPreset)) then return false, "noPermission" end

    ---@type ExportData
    local decoded = json.decode(data)
    if (not decoded) then return false, "invalidJsonImport" end

    -- Make sure it has all the values it should have
    if (decoded.label == nil or #decoded.label <= 0 or #decoded.label >= 50) then return false, "invalidJsonImport" end
    if (type(decoded.prop) ~= "string") then return false, "invalidJsonImport" end
    if (type(decoded.bone) ~= "number") then return false, "invalidJsonImport" end
    if (type(decoded.dict) ~= "string") then return false, "invalidJsonImport" end
    if (type(decoded.clip) ~= "string") then return false, "invalidJsonImport" end
    if (type(decoded.offset) ~= "table") then return false, "invalidJsonImport" end
    if (decoded.offset[1] == nil or decoded.offset[2] == nil or decoded.offset[3] == nil) then return false, "invalidJsonImport" end
    if (type(decoded.rotation) ~= "table") then return false, "invalidJsonImport" end
    if (decoded.rotation[1] == nil or decoded.rotation[2] == nil or decoded.rotation[3] == nil) then return false, "invalidJsonImport" end

    ---@type PresetData
    local preset = decoded
    preset.id = createId()
    preset.created = os.time()

    addPreset(preset)

    return preset
end)

local function loadPresets()
    local data = GetResourceKvpString("zyke_propaligner:Presets") or "[]"
    data = json.decode(data)

    presets = data
end

loadPresets()