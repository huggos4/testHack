import { Component } from '@angular/core';
import { BDDProvider } from '../../services/BDD.service'
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-compte',
  templateUrl: 'operations.page.html',
  styleUrls: ['operations.page.scss']
})
export class operationsPage {
  constructor(public bdd: BDDProvider) {
    
    console.log("test");
    
  }

  async ionViewWillEnter(){

  }



}
