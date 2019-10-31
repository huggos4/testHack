import { Injectable,isDevMode } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';



@Injectable()
export class BDDProvider {
    protected db: any;
    private listeTables: Array<String> = [];
    protected readonly versionBDD = "20190924";
    protected lastSync = "19500101";
    public premiereCo = false;

    constructor(private sqlite: SQLite) {
        this.listeTables = ['airbnb'];
        this.getBDD().then((data) => { this.db = data; });
    }


    public isBDDMAJ(): boolean {
        let booMAJ: boolean=false;
        //version actuelle
        let vBDD = localStorage.getItem("versionBDD");
        if (vBDD && vBDD < this.versionBDD){
            booMAJ = true;
        }
        return booMAJ;
    }

    public async getBDD(): Promise<any> {
        if (this.db || this.db != null || this.db != undefined) {
            return this.db;
        }
        else {
            if (isDevMode()) {
                return new Promise((resolve, reject) => {
                    (<any>window).sqlitePlugin = {};
                    (<any>window).sqlitePlugin.openDatabase = function () {
                        return (<any>window).openDatabase('hackatontest.db', '1.0', 'hackatontest', 10000000);
                    };
                    this.db = (<any>window).sqlitePlugin.openDatabase();
                    //Ajout d'une fonction pour la compatibilité avec WebSQL
                    this.db.executeSql = (sql, params, callback): Promise<any> => {
                        return new Promise((resolve2, reject2) => {
                            this.db.transaction((tx) => {
                                tx.executeSql(sql, params, (tx, result) => {
                                    if (callback) { callback(result); }
                                    resolve2(result);
                                }, (tx, e) => { reject2(e); });
                            });
                        });
                    };
                    resolve(this.db);
                });
            } else {
                this.db = await this.sqlite.create({
                    name: 'hackatontest.db',
                    location: 'default'
                });
                return this.db;
            }
        }        
    }

    async initBDD(booForce: boolean = false) {
        let vBDD = localStorage.getItem("versionBDD");

        if (!vBDD || booForce) {
            await this.getBDD();
            await this.deleteBDD();
            await this.createBDD();
            localStorage.setItem("versionBDD", this.versionBDD);
            localStorage.removeItem("lastSync");

        } else if (vBDD && vBDD < this.versionBDD) {
            //MAJ de la BDD
            await this.majBDD(vBDD, this.versionBDD);
        }
    }

    private async createBDD() {
        await new Promise((resolve, reject) => {
            this.db.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    //creation des tables
                    //table elevage 
                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS airbnb(IDAIRBNB integer PRIMARY KEY, NOM text, VILLE text, X text, Y text,)', []));
                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS elevage(IDAIRBNB integer PRIMARY KEY, NOM text, VILLE text, X text, Y text,)', []));
                    
                    //*/
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });        
    }

    private async deleteBDD() {
        await new Promise((resolve, reject) => {
           this.db.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    if (!isDevMode()) {
                        lProm.push(tx.executeSql('PRAGMA writable_schema = 1', []));
                        lProm.push(tx.executeSql("delete from sqlite_master where type in ('table', 'index', 'trigger')", []));
                        lProm.push(tx.executeSql("PRAGMA writable_schema = 0", []));
                    } else {
                        this.listeTables.forEach((sTable) => {
                            lProm.push(tx.executeSql("DROP TABLE " + sTable, []));
                        });
                    }
                    await Promise.all(lProm);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
        if (!isDevMode()) {
            await this.db.executeSql("VACUUM", []);
            await this.db.executeSql("PRAGMA INTEGRITY_CHECK", []);
        }    
    }

    private async majBDD(versionAncien: string, versionMAJ: string) {
        console.log("detection localBDD < vBDD");
        //exemple de MAJ : Si la version précédent la MAJ de l'application est antérieure ou égale à "20180404"
        //on passe les scripts ci-dessous (ALTER, etc...)
        if (versionAncien <= versionMAJ) {
            //MAJ ICI
            let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    if(versionAncien <= "20190723") {
                            lProm.push(tx.executeSql('ALTER TABLE elevage ADD COLUMN LONGITUDE character varying(10)', []));
                            lProm.push(tx.executeSql('ALTER TABLE elevage ADD COLUMN LATITUDE character varying(10)', []));
                            lProm.push(tx.executeSql('ALTER TABLE installation ADD COLUMN LAC2 integer', []));
                    }
                    if (versionAncien <= "20190924") {
                        lProm.push(tx.executeSql('ALTER TABLE verification ADD COLUMN INSTALLATEUR character varying(100)', []));
                    }
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            });
        }

        //TODO SUPPRIMER !!
        if (versionMAJ == "20190723") {
            await this.initBDD(true);
        }
        

    }
   


    public async getTypeAppareil() {
        let sRequete = 'SELECT IDTYPEAPP, COTYPEAPP, LIBELLE FROM type_appareil_controle';
        let res = await this.db.executeSql(sRequete, []);
        let listeRes: Array<any> = [];
        let elem: any = {};
        for (var i = 0; i < res.rows.length; i++) {
            elem = {};
            let ligne = res.rows.item(i);
            elem.IDTYPEAPP = ligne.IDTYPEAPP;
            elem.COTYPEAPP = ligne.COTYPEAPP;
            elem.LIBELLE   = ligne.LIBELLE;
            listeRes.push(elem);
        }
        //console.log(listeRes);
        return listeRes;
    }
} 