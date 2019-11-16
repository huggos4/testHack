import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BDDProvider } from '../../services/BDD.service'

@Component({
  templateUrl: 'idtechnique.page.html',
  styleUrls: ['idtechnique.page.scss']
})
export class idtechniquePage {

  public compteTech: any = {};

  constructor(public nav: NavController, public bdd: BDDProvider) {

    console.log("test");
  }

  async addCompteTechnique(){
    this.compteTech.CODE = sessionStorage.getItem("Code");
    this.compteTech.TYPE= "T";
    await this.bdd.insertCompte(this.compteTech);
    this.nav.navigateRoot("tabs/compte");
  }



  

}
