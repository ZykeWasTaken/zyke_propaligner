Z.registerCommand({"palign", "propalign", "alignprop"}, function()
    if (not Z.hasPermission(Config.Settings.permissions.useMenu)) then return end

    SetNuiFocus(true, true)
    SendNUIMessage({event = "SetOpen", data = true})
end, "Open tools to get prop alignments")