import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {CharacteristicPage} from '../characteristic/characteristic';
import {BLE} from 'ionic-native';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    templateUrl: 'device.html'
})

export class DevicePage {
    device: any;
    connecting: boolean = false;
    characteristics: any = [];
    filteredCharacteristics: any = [];
    on_filter: boolean = false;
    servicestring: String = "";
    public inputForm: FormGroup;

    constructor(public navParams: NavParams, public nav: NavController, public fb: FormBuilder) {
        this.device = this.navParams.get('device');
        this.initializeForm();
        this.connecting = false;
        this.connect(this.device.id);
    }

    initializeForm() {
        this.inputForm = this.fb.group({'service_uuid': [null, String]});
    }

    set_filter() {
        this.on_filter = true;
        this.servicestring = "";
    }

    onFilterInput(value: string): void {
        this.servicestring = this.inputForm.controls['service_uuid'].value;
        console.log('service_uuid entered: ', this.servicestring);
        this.filterByService();
    }
    
    connect(deviceID) {
        console.log("connecting device: " + deviceID);

        this.connecting = true;
        BLE.connect(deviceID).subscribe(peripheralData => {
                console.log(peripheralData.characteristics);
                this.characteristics = peripheralData.characteristics;
                this.filteredCharacteristics = peripheralData.characteristics;                
                this.connecting = false;
            }, peripheralData => {
                this.connecting = false;
                console.log('device disconnected: ' + JSON.stringify(peripheralData));
            }
        );
    }

    connectToCharacteristic(device, characteristic) {
        console.log('Connecting to characteristic: ' + JSON.stringify(characteristic));
        this.nav.push(CharacteristicPage, {
            device: device, characteristic: characteristic
        });
    }

    filterByService() {
        this.on_filter = false;
        this.filteredCharacteristics = this.characteristics.filter(el => {
            return (el.service == this.servicestring);
        });
    }

}