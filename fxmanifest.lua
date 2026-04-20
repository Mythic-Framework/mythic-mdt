fx_version "cerulean"
game "gta5"
lua54 'yes'

version '1.0.1'
repository 'https://github.com/Mythic-Framework/mythic-mdt'

client_script "@mythic-base/components/cl_error.lua"
client_script "@mythic-pwnzor/client/check.lua"
client_scripts {'shared/*.lua', 'client/**/*.lua'}

server_scripts {'shared/*.lua', 'server/**/*.lua'}

ui_page 'ui/dist/index.html'

files {"ui/dist/index.html", 'ui/dist/*.js'}
