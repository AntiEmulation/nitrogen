const Discord = require('discord.js');
const axios = require('axios').default;

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
const regex = new RegExp(/(discord\.gift\/|discord\.com\/gifts\/|discordapp\.com\/gifts\/)[^\s]+/gim);
const used_codes = [];

let msg_count = 0;
let valid_codes = 0;
let total_codes = 0;

const {
    token
} = require("./config.json");

const client = new Discord.Client({
      messageCacheLifetime: 1,
      messageCacheMaxSize: 10,
      messageSweepInterval: 5,
      messageEditHistoryMaxSize: 1,
      restTimeOffset: 0,
      disabledEvents: [
         'TYPING_START', 'VOICE_SERVER_UPDATE', 'RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE',
         'GUILD_ROLE_DELETE', 'GUILD_ROLE_UPDATE', 'GUILD_BAN_ADD', 'GUILD_BAN_REMOVE',
         'CHANNEL_UPDATE', 'CHANNEL_PINS_UPDATE', 'MESSAGE_DELETE', 'MESSAGE_UPDATE',
         'MESSAGE_DELETE_BULK', 'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE',
         'GUILD_MEMBER_UPDATE', 'GUILD_MEMBERS_CHUNK', 'GUILD_ROLE_CREATE',
         'MESSAGE_REACTION_REMOVE_ALL', 'USER_UPDATE', 'USER_NOTE_UPDATE',
         'USER_SETTINGS_UPDATE', 'PRESENCE_UPDATE', 'VOICE_STATE_UPDATE',
         'GUILD_UPDATE', 'GUILD_MEMBER_ADD', 'GUILD_MEMBER_REMOVE'
      ]
   });

   client.on('message', async (msg) => {
   	let invalid_codes = total_codes-valid_codes;
   	process.stdout.write("Messages scanned: " + msg_count + "\tValid codes: " + valid_codes + "\tInvalid codes: " + invalid_codes + "\r");
   	msg_count++;
      let codes = msg.content.match(regex);
      if (!codes || codes.length == 0) return;
      for (let code of codes) {
         code = code.replace(/(discord\.gift\/|discord\.com\/gifts\/|discordapp\.com\/gifts\/)/gim, '').replace(/\W/g, '');

         if (used_codes.includes(code)) {
            console.log("[Nitrogen] Duplicate Code Found: " + code);
            continue;
         }

         if (code.length < 16 || code.length > 24) {
            console.log("[Nitrogen] Invalid length code: " + code);
            continue;
         }
         total_codes++;
         used_codes.push(code);

         axios({
            method: 'POST',
            url: `https://discordapp.com/api/v6/entitlements/gift-codes/${code}/redeem`,
            headers:
            {
                'Authorization': token,
                'User-Agent': userAgent
            }
        }).then(
            () => {
            	console.log("[Nitrogen] Successfully sniped a nitro: " + code);
            	valid_codes++;
            }

        ).catch(ex => console.log("[Nitrogen] Failed to claim nitro."))
      }
   });

   client.on('ready', () => {
      console.log("[Nitrogen] Logged in as " + client.user.tag);
   });

   client.on('error', (err) => {
   console.log(err.message)
});

   client.login(token);
