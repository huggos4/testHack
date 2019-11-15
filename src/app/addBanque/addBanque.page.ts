import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  templateUrl: 'addBanque.page.html',
  styleUrls: ['addBanque.page.scss']
})
export class addBanquePage {

  constructor(public nav: NavController) {

    console.log("test");
  }
  openBanque(code:string){
    sessionStorage.setItem("Code", code);
    this.nav.navigateForward("/idbanque");
    
  }

}
