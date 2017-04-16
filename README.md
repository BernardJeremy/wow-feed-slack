wow-feed-slack
===========
Node.JS script allowing to send WoW feed info to Slack.

## Features
- Retrieves new activities for any character whatched in config file
- Send new activities data to Slack
- Replace any HTML link by a Slack compliant version

## Installation
- Simply clone this depot anywhere on your server.
- Copy [config.json.example](https://github.com/BernardJeremy/wow-feed-slack/blob/master/config.json.example) file into a `config.json` file.
- Add every wanted character in the config file.
- Install a [incoming-webhooks](https://api.slack.com/incoming-webhooks) on your Slack.
- Add your link of the Slack incoming-webhooks in the `config.json` file.
- Optional (but recommended) : Install a task scheduler (like `CRON`) to run the script regularly.

## Configuration
- `watch` : Can be an object or an array of objects. Check [config.json.example](https://github.com/BernardJeremy/wow-feed-slack/blob/master/config.json.example).
- `lang` : Language code (en, fr, de, ...).
- `hostname` : Hostname of battle.net armory to retrieve activities (You shouldn't have to change this).
- `path` : Path of the battle.net armory to retrieve activities (You shouldn't have to change this).
- `slackHookUrl` :  Link to your Slack incoming-webhooks.
