import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BDDProvider } from '../../services/BDD.service'

@Component({
  templateUrl: 'idbanque.page.html',
  styleUrls: ['idbanque.page.scss']
})
export class idbanquePage {

  public banque: any = {};

  constructor(public nav: NavController, public bdd: BDDProvider) {

    console.log("test");
  }

  async addCompteEnBanque(){
    this.banque.CODE = sessionStorage.getItem("Code");
    this.banque.TYPE= "B";
    await this.bdd.insertCompte(this.banque);
    this.nav.navigateRoot("tabs/compte");
  }



  

}
