//player inventory
const tmdb = require('../themodern-db');
let itemInfo = require('./itemInfo');

class playerInventory{
    constructor(){
        this.playerInventory = [];
    }

    /**
     * get all items in inventory
     */
    getAllItems(){
        if(this.playerInventory.length === 0) {
            return "invEmpty";
        } else {
            return this.playerInventory;
        }
    }

    /**
     * insert item to inventory
     * @param item_id
     * @param amount
     */
    addItemToInv(item_id, amount){
        for (let i = 0; i <= this.playerInventory.length; i++) {
            if(this.playerInventory[i].item_id === item_id){
                this.playerInventory[i].amount += amount;
            } else {
                this.playerInventory[this.playerInventory.length+1].push({item_id: item_id, amount: amount});
            }
        }
    }
}

playerInventory = {
    itemInfo
}

module.exports = playerInventory;