import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss']
})
export class MenuPage {

  constructor(public nav: NavController) {}

  redirectAddBanque(){
    this.nav.navigateRoot("tabs/addbanque");
  }
}
