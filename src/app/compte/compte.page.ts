import { Component } from '@angular/core';
import { BDDProvider } from '../../services/BDD.service'
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-compte',
  templateUrl: 'compte.page.html',
  styleUrls: ['compte.page.scss']
})
export class comptePage {
  public listeComptes: Array<any> = [];
  constructor(public bdd: BDDProvider, public nav: NavController) {
    
    console.log("test");
    
  }

  async ionViewWillEnter(){
    this.listeComptes =  await this.bdd.getComptes();

  }

   redirectOperations(id:any){
      console.log(id);
      sessionStorage.setItem("idCompte", id);
      this.nav.navigateRoot("tabs/operations");
  }


}
