import { Component } from '@angular/core';

@Component({
  selector: 'app-tresor',
  templateUrl: 'tresor.page.html',
  styleUrls: ['tresor.page.scss']
})
export class tresorPage {
  public titre;
  public url;
  constructor() {}

  async ionViewWillEnter(){
      this.titre="Trésorerie";
      this.url="../assets/tresor.PNG";
  }

  changePage(){
    if(this.url=="../assets/vente.PNG"){
      this.url="../assets/stock.PNG";
      this.titre = "Stock";
    }else if(this.url=="../assets/tresor.PNG"){
      this.url="../assets/vente.PNG";
      this.titre = "Vente";

    }else if(this.url=="../assets/stock.PNG"){
      this.url="../assets/tresor.PNG";
      this.titre = "Trésor";

    }
  }
}
