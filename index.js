/**
 * Homebridge-Garadget
 * @ Index.js Version 0.0.4
 * @ By xNinjasx
 */
//sets get json dependent
var request = require("request");

//sets homebridge
var Service, Characteristic;
module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garadget", "Garadget", DoorAccessory);
  }
/**
 * Creates DoorAccessory
 * Sets config
 */
function DoorAccessory(log, config) {
  this.log = log; // Debug log
  this.name = config["name"]; // Name that shows up in homekit app
  this.cloudURL = config["cloudURL"]; // Grabs the Particle cloud url
  this.access_token = config["access_token"]; // Grabs your token for deviceID
  this.deviceID = config["deviceID"]; // Grabs your deviceID
  this.bypass = config["bypass"]; // Bypass trigger
  this.args = config["args"]; // For the bypass onoff state
  this.services = [];
  //Suppose to set information about Accessory
  this.informationService = new Service.AccessoryInformation()
    .setCharacteristic(Characteristic.Manufacturer, "Garadget")
    .setCharacteristic(Characteristic.Model, "Photon")
    .setCharacteristic(Characteristic.SerialNumber, "AABBCCDD1");
  //Checking for bypass
  if (this.bypass === "1") {
    this.garageservice = new Service.Switch(this.name); // Makes Switch Service - you can change "Switch" to "Lightbulb"
    this.garageservice
      .getCharacteristic(Characteristic.On)
      .on('set', this.setStatebypass.bind(this))
	  .on('get', this.getStatebypass.bind(this));
  } else {
    this.garageservice = new Service.GarageDoorOpener(this.name);
    this.garageservice
      .getCharacteristic(Characteristic.CurrentDoorState)
      .on('get', this.getState.bind(this));
    this.garageservice
      .getCharacteristic(Characteristic.TargetDoorState)
      .on('get', this.getState.bind(this))
      .on('set', this.setState.bind(this));
    this.garageservice
      .getCharacteristic(Characteristic.ObstructionDetected)
      .on('get', this.getOD.bind(this));
  }
}
/**
 * Gets Status of the Garadget
 */
DoorAccessory.prototype.getState = function(callback) {
    this.log("Getting current state...");

    request.get({
      url: this.cloudURL + this.deviceID + '/doorStatus?access_token=' + this.access_token
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var json = JSON.parse(body);
        var currentState = DoorAccessory.prototype.parseStatus(json.result);
        this.log("Door state is %s", currentState);
        switch (currentState) {
		case 'open':
        var currentState = 0;
        break;
		case 'closed':
        var currentState = 1;
        break;
		case 'opening':
        var currentState = 2;
        break;
		case 'closing':
        var currentState = 3;
        break;
		case 'stopped':
        var currentState = 4;
        break;
		};
		callback(null, currentState); // success
      } else {
        this.log("Error getting state: %s", err);
        callback(err);
      }
    }.bind(this));
  }
/**
 * Gets Status of the Garadget for bypass trigger
 */
DoorAccessory.prototype.getStatebypass = function(callback) {
    this.log("Getting current state...");

    request.get({
      url: this.cloudURL + this.deviceID + '/doorStatus?access_token=' + this.access_token
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var json = JSON.parse(body);
        var state = DoorAccessory.prototype.parseStatus(json.result);
        this.log("Bypass state is %s", state);
        switch (state) {
		case 'open':
        var bypassState = 1;
        break;
		case 'closed':
        var bypassState = 0;
        break;
		};
		this.log("bypassState = %s", bypassState);
        callback(null, bypassState); // success
      } else {
        this.log("Error getting bypass state: %s", err);
        callback(err);
      }
    }.bind(this));
  }
/**
 * Sets Status of the Garadget
 */
DoorAccessory.prototype.setState = function(state, callback) {
    this.log("state = ", state);
    switch (state) {
      case 0:
        var doorState = 'open';
        break;
      case 1:
        var doorState = 'closed';
        break;
      case 2:
        var doorState = 'stop';
        break;
      case 3:
        var doorState = 'stop';
        break;
      case 4:
        var doorState = 'open';
        break;
    };
    this.log("Set state to %s", doorState);
    request.post({
      url: this.cloudURL + this.deviceID + '/setState',
      form: {
        access_token: this.access_token,
        args: doorState
      }
    }, function(err, response, body) {

      if (!err && response.statusCode == 200) {

        this.log("State change complete.");

        var currentState = (state == Characteristic.TargetDoorState.CLOSED) ? Characteristic.CurrentDoorState.CLOSED : Characteristic.CurrentDoorState.OPEN;

        this.garageservice
          .setCharacteristic(Characteristic.CurrentDoorState, currentState);
        callback(null); // success

      } else {

        this.log("Error '%s' setting door state. Response: %s", err, body);
        callback(err || new Error("Error setting door state."));
      }
    }.bind(this));
  }
/**
 * Sets Status of the Garadget for bypass trigger
 */
DoorAccessory.prototype.setStatebypass = function(state, callback) {
    this.log("state = ", state);
    var doorState = this.args.replace("{STATE}", (state ? "open" : "closed")); //flips on/off
    this.log("Set bypass state to %s", doorState);
    request.post({
      url: this.cloudURL + this.deviceID + '/setState',
      form: {
        access_token: this.access_token,
        args: doorState
      }
    }, function(err, response, body) {

      if (!err && response.statusCode == 200) {

        this.log("State bypass change complete.");
        callback(null); // success

      } else {

        this.log("Error '%s' setting bypass state. Response: %s", err, body);
        callback(err || new Error("Error setting bypass state."));
      }
    }.bind(this));
  }
/**
 * Gets Status of the Garadget
 * If this fails than update your token
 * On the homekit app, you will see the Obstruction Detected = YES
 * This indicates you to update your token
 */
DoorAccessory.prototype.getOD = function(callback) {
    this.log("Get ObstructionDetected...");
    request.get({
      url: this.cloudURL + this.deviceID + '/doorStatus?access_token=' + this.access_token
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
		this.log("Access Key good...");
        callback(null, 0); // success
      } else {
        this.log("Error getting state: %s", err);
        this.log("This means your access token expired. Replace in config.json");
		callback(null, 1); // failed
      }
    }.bind(this));
  }
/**
 * Gets services
 */
DoorAccessory.prototype.getServices = function() {
    return [this.garageservice];
  }
/**
 * Parse the status out of the json file
 */
DoorAccessory.prototype.parseStatus = function(p_status) {
  var split1 = p_status.split("|")
  var split2 = split1[0].split("=")
  var a_result = split2[1]
  return a_result;
}
