fx_version 'adamant'

game 'gta5'

description ''
lua54 'yes'

version '1.1' 
legacyversion '1.9.1'

shared_scripts {
	'@es_extended/imports.lua',
	'@es_extended/locale.lua',
}

client_scripts {
    'client/main.lua'
}

ui_page { 'html/ui.html' }

files { 'html/ui.html', 'html/css/app.css', 'html/js/handlebars.min.js', 'html/js/app.js' }

dependencies { 'es_extended' }

