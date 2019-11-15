import { Component } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';

@Component({
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss']
})
export class authPage {

  constructor(public nav: NavController, public menu: MenuController) {
    this.menu.close();
  } 
  

  connexion(){
    this.nav.navigateRoot("tabs/compte");
  }
}
