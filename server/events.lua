---@return integer
local function getTotalPresets()
    return MySQL.scalar.await("SELECT COUNT(*) FROM zyke_propaligner_presets")
end

Z.callback.register("zyke_propaligner:GetPresets", function(plyId, offset)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.useMenu)) then return {} end

    local pagePresets = MySQL.query.await("SELECT * FROM zyke_propaligner_presets ORDER BY last_used DESC LIMIT ? OFFSET ?", {Config.Settings.presetsPerPage, Config.Settings.presetsPerPage * (offset - 1)})
    if (not pagePresets) then return {} end

    for i = 1, #pagePresets do
        pagePresets[i].data = json.decode(pagePresets[i].data)
    end

    return {presets = pagePresets, totalPresets = getTotalPresets()}
end)

---@param id string
---@return boolean, integer?
local function doesIdExist(id)
    return MySQL.scalar.await("SELECT id FROM zyke_propaligner_presets WHERE id = ?", {id}) ~= nil
end

-- Lowkey goofy to check an array for id to create a unique one, but due to the small size it won't matter
-- The fake simulated loading time to avoid "flickering" in the JS is > 95% of the loading time
---@return string
local function createId()
    local id

    repeat
        id = Z.createUniqueId(10)
    until (not doesIdExist(id))

    return id
end

-- Does not verify id, just inserts
---@param data Preset
local function addPreset(data)
    return MySQL.insert.await("INSERT INTO zyke_propaligner_presets (id, label, data) VALUES (?, ?, ?)", {data.id, data.label, json.encode(data.data)}) ~= nil
end

---@param data Preset
local function overwritePreset(data)
    return MySQL.single.await("UPDATE zyke_propaligner_presets SET data = ? WHERE id = ?", {json.encode(data), data.id}) ~= nil
end

Z.callback.register("zyke_propaligner:CreatePreset", function(plyId, data)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.createPreset)) then return false, "noPermission" end

    data.id = createId()
    addPreset(data)

    return data
end)

Z.callback.register("zyke_propaligner:OverwritePreset", function(plyId, data)
    if (not Z.hasPermission(plyId, Config.Settings.permissions.overwritePreset)) then return false, "noPermission" end

    local doesExist = doesIdExist(data.id)
    if (not doesExist) then return false, "noPresetDataFound" end

    data.label = MySQL.scalar.await("SELECT label FROM zyke_propaligner_presets WHERE id = ?", {data.id})

    overwritePreset(data)

    return data
end)

---@param id string
---@return Success
local function deletePreset(id)
    return MySQL.query.await("DELETE FROM zyke_propaligner_presets WHERE id = ?", {id}).affectedRows > 0
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

    ---@type Export
    local decoded = json.decode(data)
    if (not decoded) then return false, "invalidJsonImport" end

    -- Make sure it has all the values it should have
    if (decoded.label == nil or #decoded.label <= 0 or #decoded.label >= 50) then return false, "invalidJsonImport" end
    if (type(decoded.data.prop) ~= "string") then return false, "invalidJsonImport" end
    if (type(decoded.data.bone) ~= "number") then return false, "invalidJsonImport" end
    if (type(decoded.data.dict) ~= "string") then return false, "invalidJsonImport" end
    if (type(decoded.data.clip) ~= "string") then return false, "invalidJsonImport" end
    if (type(decoded.data.offset) ~= "table") then return false, "invalidJsonImport" end
    if (decoded.data.offset[1] == nil or decoded.data.offset[2] == nil or decoded.data.offset[3] == nil) then return false, "invalidJsonImport" end
    if (type(decoded.data.rotation) ~= "table") then return false, "invalidJsonImport" end
    if (decoded.data.rotation[1] == nil or decoded.data.rotation[2] == nil or decoded.data.rotation[3] == nil) then return false, "invalidJsonImport" end

    ---@type Preset
    local preset = decoded
    preset.id = createId()

    addPreset(preset)

    return preset
end)

-- Simply updates the last_used column
RegisterNetEvent("zyke_propaligner:OnPresetLoad", function(id)
    if (not Z.hasPermission(source, Config.Settings.permissions.useMenu)) then return end
    if (not doesIdExist(id)) then return end

    MySQL.single.await("UPDATE zyke_propaligner_presets SET last_used = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1", {id})
end)