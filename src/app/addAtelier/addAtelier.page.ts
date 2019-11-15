import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BDDProvider } from '../../services/BDD.service'

@Component({
  templateUrl: 'addAtelier.page.html',
  styleUrls: ['addAtelier.page.scss']
})
export class addAtelierPage {
  public atelier: any = {};
  constructor(public bdd: BDDProvider,) {

    console.log("test");
  }
 
  async addAtelier(){
   
    await this.bdd.insertAtelier(this.atelier);
    console.log(this.atelier);
  }
}
