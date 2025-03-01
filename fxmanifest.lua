fx_version "cerulean"
game "gta5"
lua54 "yes"
version "1.1.0"

ui_page "nui/index.html"
-- ui_page "nui_source/hot_reload.html"

shared_scripts {
    "@zyke_lib/imports.lua",
    "shared/config.lua",
}

server_scripts {
    "@oxmysql/lib/MySQL.lua",
    "server/database.lua",
    "server/events.lua",
}

client_scripts {
	"client/functions.lua",
	"client/commands.lua",
	"client/events.lua",
}

files {
    "nui/**/*",
    "locales/*.lua",
    -- "nui_source/hot_reload.html",
}