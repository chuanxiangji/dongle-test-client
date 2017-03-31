import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { DevicePage } from '../pages/device/device';
import { CharacteristicPage } from '../pages/characteristic/characteristic';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = HomePage;
  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, 
              public menu: MenuController,
              public statusBar: StatusBar, 
              public splashScreen: SplashScreen) 
  {
    this.initializeApp();
    this.pages = [
      { title: 'HomePage', component: HomePage},
      { title: 'DevicePage', component: DevicePage},
      { title: 'CharacteristicPage', component: CharacteristicPage}   
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.menu.close();
    this.nav.setRoot(page.component);
  }

}
