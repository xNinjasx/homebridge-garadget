**Garadget device plugin for Homebridge**
-------------------------------------
Homekit Integration for Garadget using Homebridge.

#Updates:

* Improved get status - now reports 5 difference statuses

* Added new function: Bypass getStatus - now reporting if on or off

* IMPORTANT! If you update from ```0.0.1``` to ```0.0.3+``` make sure to edit your ```config.json``` file to reflect the new config.

* Added new feature: Bypass Homekit Trigger warning

* Cleaned up code

* Added Comments


#Features:

* Bypass: This allows you to bypass the trigger warning in Homekit app. You can add another accessory but change the 0 in the bypass to 1. You may hide this switch and use it for scenes/triggers.

#ToDo:

* ~~Get it on NPM~~

* ~~Get it on platforms~~ Removed as a feature due to no request for it.

* ~~Bypass Homekit's "Do you want {Homekit} to run "EnterTrigger" now?"~~

* Instructions/Wiki

#Thanks

http://community.garadget.com/

https://github.com/nfarina/homebridge

https://github.com/EricConnerApps/homebridge-httpdoor

https://github.com/krvarma/homebridge-particle

#A sample configuration file:
```JSON
{
  "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E3:CE:39",
    "port": 51826,
    "pin": "031-45-154"
  },

  "description": "Garadget as an accessory.",
  "accessories": [{
    "accessory": "Garadget",
    "name": "Garage Door",
    "cloudURL": "https://api.particle.io/v1/devices/",
    "deviceID": "<<Device ID>>",
    "access_token": "<<Access Token>>",
	"bypass": "0",
	"args": "{STATE}"
  }],
  "platforms": [

  ]
}
```
