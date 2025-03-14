Z.registerCommand(Config.Settings.openCommand, function()
    if (not Z.hasPermission(Config.Settings.permissions.useMenu)) then return end

    SetNuiFocus(true, true)
    SendNUIMessage({event = "SetOpen", data = true})
end, "Open tools to get prop alignments")

-- Temp command in case you want to clear due to the changes to the core structure
RegisterCommand("wipe_history", function()
    SetResourceKvp("zyke_propaligner:History", "[]")
end, false)