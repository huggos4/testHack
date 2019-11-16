import { Component } from '@angular/core';
import { BDDProvider } from '../../services/BDD.service'
import { NavController } from '@ionic/angular';

@Component({
  templateUrl: 'detailoperation.page.html',
  styleUrls: ['detailoperation.page.scss']
})
export class detailoperationPage {
  public operation:any;
  public ateliers:any;
  public postes:any;
  public elemSelecAtelier:any;
  public elemSelecPoste:any;
  constructor(public bdd: BDDProvider,public nav: NavController) {
    
    console.log("test");
    
  }

  async ionViewWillEnter(){
      this.operation = await this.bdd.getOperation(sessionStorage.getItem("idOperation"));
      this.ateliers = await this.bdd.getAteliers();
      this.postes = await this.bdd.getPostes();
      this.elemSelecAtelier = this.operation.idAtelier;
      this.elemSelecPoste = this.operation.idPoste;
      sessionStorage.clear();
  }

  async insertAffectation(){
    this.bdd.insertAffectation(this.elemSelecAtelier, this.elemSelecPoste, this.operation.idTransaction)
    this.nav.navigateRoot("tabs/compte");
  }



 
}
