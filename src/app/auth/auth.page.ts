import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';


@Component({
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss']
})
export class authPage {

  constructor(public nav: NavController) {
  } 
  

  connexion(){
    this.nav.navigateRoot("tabs/compte");
  }
}
