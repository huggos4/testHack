import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'auth', 
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../auth/auth.module').then(m => m.authPageModule)
          }
        ]
      },
      {
        path: 'compte',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../compte/compte.module').then(m => m.ComptePageModule)
          }
        ]
      },
      {
        path: 'analyse',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../analyse/analyse.module').then(m => m.analysePageModule)
          }
        ]
      },
      {
        path: 'tresor',
        children: [
          {
            path: '', 
            loadChildren: () =>
              import('../tresor/tresor.module').then(m => m.tresorPageModule)
          }
        ]
      },
      {
        path: 'menu',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../menu/menu.module').then(m => m.MenuPageModule)
          }
        ]
      },
      {
        path: 'addbanque',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../addBanque/addBanque.module').then(m => m.addBanquePageModule)
          }
        ]
      },
      {
        path: 'idbanque',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../idbanque/idbanque.module').then(m => m.idbanquePageModule)
          }
        ]
      },
      {
        path: 'operations',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../operations/operations.module').then(m => m.OperationsPageModule)
          }
        ]
      },
      {
        path: 'addtechnique',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../addtechnique/addtechnique.module').then(m => m.addTechniquePageModule)
          }
        ]
      },
      {
        path: 'idtechnique',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../idtechnique/idtechnique.module').then(m => m.idtechniquePageModule)
          }
        ]
      },
      {
        path: 'addatelier',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../addAtelier/addAtelier.module').then(m => m.addAtelierPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'tabs/auth',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/auth',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
