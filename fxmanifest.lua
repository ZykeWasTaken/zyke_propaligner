fx_version "cerulean"
game "gta5"
lua54 "yes"
version "1.4.0"

shared_scripts {
    "@zyke_lib/imports.lua",
    "shared/config.lua",
    "shared/bones.lua",
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
	"client/alignment.lua",
}

ui_page "nui/index.html"
-- ui_page "nui_source/hot_reload.html"

files {
    "nui/**/*",
    -- "nui_source/hot_reload.html",

    "locales/*.lua",
    "shared/animations.lua",
}

dependencies {
    "zyke_lib",
}