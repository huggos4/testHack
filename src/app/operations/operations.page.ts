import { Component } from '@angular/core';
import { BDDProvider } from '../../services/BDD.service'
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-compte',
  templateUrl: 'operations.page.html',
  styleUrls: ['operations.page.scss']
})
export class operationsPage {
  public listeOperations: Array<any> = [];
  constructor(public bdd: BDDProvider,public nav: NavController,) {
    
    console.log("test");
    
  }

  async ionViewWillEnter(){
      this.listeOperations = await this.bdd.getOperations(sessionStorage.getItem("idCompte"));
      sessionStorage.clear();
  }

 redirectDetailOperation(idOperation:any) {
   console.log(idOperation);
   sessionStorage.setItem("idOperation", idOperation);
    this.nav.navigateRoot("tabs/detailoperation");

  }



}
