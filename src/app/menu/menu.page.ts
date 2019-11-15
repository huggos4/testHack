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

  redirectAddTechnique(){
    this.nav.navigateRoot("tabs/addtechnique");
  }

  redirectAddAtelier(){
    this.nav.navigateRoot("tabs/addatelier");
  }

  redirectOperations(){
    this.nav.navigateRoot("tabs/operations");
  }
}
