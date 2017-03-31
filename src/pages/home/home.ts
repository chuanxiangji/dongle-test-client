import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {DevicePage} from '../device/device';
import {BLE} from 'ionic-native';

@Component({
  templateUrl: 'home.html'
})

export class HomePage {
  devices: Array<any> = [];
  isScanning: boolean = false;

  constructor(public nav: NavController) {
    BLE.enable();
  }

  startScanning() {
    if(!this.isScanning) {
    console.log('Scanning Started');
    this.devices = [];
    this.isScanning = true;
    BLE.startScan([]).subscribe(device => {
      this.devices.push(device);
    });

    setTimeout(() => {
      BLE.stopScan().then(() => {
      console.log('Scanning has stopped');
      console.log(JSON.stringify(this.devices))
      this.isScanning = false;
      });
    }, 3000);
    }
  }

  connectToDevice(device) {
    console.log('Connect To Device');
    console.log(JSON.stringify(device))
    this.nav.push(DevicePage, {
      device: device
    });
  }

  disconnectDevice(device) {
    BLE.disconnect(device.id).then(
      () => {
        console.log('disconnected: ' + JSON.stringify(device.id));
      },
      () => {
        console.log("disconnect unsuccessful");
      })
    .catch(
      (error) => {
       console.log("disconnect error with cause:" + error);
      }     
    );
  }
}