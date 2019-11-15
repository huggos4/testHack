import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  templateUrl: 'addTechnique.page.html',
  styleUrls: ['addTechnique.page.scss']
})
export class addTechniquePage {

  constructor(public nav: NavController) {

    console.log("test");
  }
  openTechnique(code:string){
    sessionStorage.setItem("Code", code);
    this.nav.navigateRoot("tabs/idtechnique");
    
  }

}
