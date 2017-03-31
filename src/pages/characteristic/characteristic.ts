import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {BLE} from 'ionic-native';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    templateUrl: 'characteristic.html'
})

export class CharacteristicPage {
    device: any;
    characteristic: any;
    scanning: boolean = false;
    on_read: boolean = false;
    on_write: boolean = false;
    on_notify: boolean = false;
    datastring: String = "";

    public inputForm: FormGroup;

    constructor(public navParams: NavParams, public nav: NavController, public fb: FormBuilder) {
        this.device = this.navParams.get('device');
        this.characteristic = this.navParams.get('characteristic');
        this.initializeForm();
    }

    initializeForm() {
        this.inputForm = this.fb.group({'dataInput': [null, String]});
    }

    stringToArray(str: String): Uint8Array {
	    var hexRegex = /[0-9 a-f A-F]/;  
        var res = str.trim().split(" ");
        var arr = new Uint8Array(res.length);
	    res.forEach(el => {
            return el.replace("0x","");
        });

        for(var i=0; i<arr.length; i++) {
            arr[i] = parseInt(res[i],16);
        }
        
        return arr;
    }

    u8_to_hexstring(u8a: Uint8Array): String {
        var hstring = "";
        for(var i=0; i<u8a.length; i++) {
            hstring = hstring + "0x" + u8a[i].toString(16).toUpperCase() + " ";
        }
        return hstring;
    }

    onWriteInput(value: string): void {
        this.datastring = this.inputForm.controls['dataInput'].value;
        console.log('inputData entered: ', this.datastring);
        this.ble_write();
    }
    
    ble_read() {
        console.log("ble_read from: " + JSON.stringify(this.characteristic));

        BLE.isConnected(this.device.id).then(
            () => {
                console.log('connected: ' + JSON.stringify(this.device));
                this.onConnectRead(this.characteristic);
            },
            () => {
                this.onScanRead(this.device);
            }
        );
    }

    ble_notify() {
        console.log("ble_notif for: " + JSON.stringify(this.characteristic));

        BLE.isConnected(this.device.id).then(
            () => {
                console.log('connected: ' + JSON.stringify(this.device));
                this.onConnectNotify(this.characteristic);
            },
            () => {
                this.onScanNotify(this.device);
            }
        );
    }

    ble_write() {
        console.log("ble_write to: " + JSON.stringify(this.characteristic));

        BLE.isConnected(this.device.id).then(
            () => {
                console.log('connected: ' + JSON.stringify(this.device));
                this.onConnectWrite(this.characteristic);
            },
            () => {
                this.onScanWrite(this.device);
            }
        );
    }

    set_write() {
        this.on_read = false;
        this.on_write = true;
        this.datastring = "";
    }

    onScanRead(peripheral) {
        console.log("connecting..." + JSON.stringify(peripheral));
        this.scanning = true;

        BLE.connect(peripheral.id).subscribe(device => {
                console.log("connected to: " + device.id);
                this.scanning = false;
                this.characteristic = device.characteristic;
                this.onConnectRead(this.characteristic);
            }, error => {
                console.log(error);
                this.onDisconnect(error);
            }
        );
    }

    onScanNotify(peripheral) {
        console.log("connecting..." + JSON.stringify(peripheral));
        this.scanning = true;

        BLE.connect(peripheral.id).subscribe(device => {
                console.log("connected to: " + device.id);
                this.scanning = false;
                this.characteristic = device.characteristic;
                this.onConnectNotify(this.characteristic);
            }, error => {
                console.log(error);
                this.onDisconnect(error);
            }
        );
    }

    onScanWrite(peripheral) {
        console.log("connecting..." + JSON.stringify(peripheral));
        this.scanning = true;

        BLE.connect(peripheral.id).subscribe(device => {
                console.log("connected to: " + device.id);
                this.scanning = false;
                this.characteristic = device.characteristic;
                this.onConnectWrite(this.characteristic);
            }, error => {
                console.log(error);
                this.onDisconnect(error);
            }
        );           
    }

    onConnectRead(characteristic) {
        console.info("reading data with (" + characteristic.service + "," + characteristic.characteristic + ")");

        BLE.read(this.device.id, characteristic.service, characteristic.characteristic).then(
            (data) => {
                console.log('read characteristic: ' + JSON.stringify(characteristic));
                this.onData(data);
            })
        .catch(
            (error) => {
            console.log("read error with cause:" + error);
            }
        );
    }

    onConnectNotify(characteristic) {
        console.info("register for notification (" + characteristic.service + "," + characteristic.characteristic + ")");
        this.on_notify = true;           
        alert("started notification (" + characteristic.service + "," + characteristic.characteristic + ")");

        BLE.startNotification(this.device.id, characteristic.service, characteristic.characteristic).subscribe(
            data => {
                console.log('notif for characteristic: ' + JSON.stringify(characteristic));
                this.onData(data);
        });

    }

    onConnectWrite(characteristic) {
        var data = this.stringToArray(this.datastring);
        console.info("writing data " + JSON.stringify(data));
        BLE.write(this.device.id, characteristic.service, characteristic.characteristic, data.buffer).then(
            () => {
                this.onPass();
            },
            (error) => {
                console.log('write error: ' + JSON.stringify(data));
                this.onError(error);
            })         
        .catch(
            (error) => {
            console.log("write error with cause:" + error);
            }
        );
    }

    onDisconnect(cause) {
        console.info("CharacteristicPage: Disconnected " + cause);
        this.on_write = false;
        this.on_read = false;   
        this.scanning = false;
    }

    onData(dataBuffer) {
        var data = new Uint8Array(dataBuffer);
        var hstring = this.u8_to_hexstring(data);
        
        this.on_read = true;
        this.datastring = hstring;
        alert("charateristic data:" + this.datastring);
    }

    onPass() {
        console.info("operation successful!");
        this.on_write = false;
        this.on_read = true; // so that updated value shows
    }

    onError(cause) {
        console.info("An error occurred with cause: " + cause);
        alert("An error occurred with cause: " + cause);
       
        this.on_write = false;
        this.on_read = false;    
        this.on_notify = false;           
    }

    checkEnabled(propertyStr: String): boolean {
        for(var i=0; i<this.characteristic.properties.length; i++) {
           if(this.characteristic.properties[i]==propertyStr) {
                return true;
            }
        }
        return false;
    }

}