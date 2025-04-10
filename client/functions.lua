function CloseMenu()
    SetNuiFocus(false, false)
    SendNUIMessage({event = "SetOpen", data = false})
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

---@param dict string
---@param clip string
---@return boolean
function IsPlayingAnim(dict, clip)
    return IsEntityPlayingAnim(PlayerPedId(), dict, clip, 3)
end

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

---@return HistoryData[]
function GetHistory()
    return json.decode(GetResourceKvpString("zyke_propaligner:History") or "[]")
end

function OpenMenu()
    SetNuiFocus(true, true)
    SendNUIMessage({event = "SetOpen", data = true})
end

---@param bones {name: string, id: integer, idx: integer, [string]: any}[] | "default" -- @default will use the default bones from shared/bones.lua
function SetBones(bones)
    if (bones == "default") then bones = Config.Bones end

    local boneList = {}

    for i = 1, #bones do
        boneList[i] = {
            name = bones[i].name,
            id = bones[i].id,
            idx = bones[i].idx
        }
    end

    SendNUIMessage({
        event = "SetBones",
        data = boneList
    })
end

exports("SetBones", SetBones)

-- Used when the menu is open, insert alignment data, such as from our consumables/smoking script
-- This is not used when loading history/preset within our resource, only when inserting after finished editing
---@param data AlignmentData
---@param backButton? boolean | "prev" @If "prev", use the previous setting
function SetAlignmentData(data, backButton)
    SendNUIMessage({
        event = "SetAlignmentData",
        data = {
            data = data,
            backButton = backButton or false
        }
    })
end

exports("SetAlignmentData", SetAlignmentData)

-- Opens the menu & inserts all alignments, will then return the results when menu is exited
---@param data AlignmentData
---@param backButton? boolean
function ConfigureAlignments(data, backButton)
    OpenMenu()
    Wait(1)
    SetAlignmentData(data, backButton)

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