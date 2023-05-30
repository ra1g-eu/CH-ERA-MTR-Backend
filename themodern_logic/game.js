class Game{
    constructor() {
        this.allGameItems = [];
        this.allGameItemSets = [];
    }

    /**
     * get all items from the game
     */
    getAllGameItems(){
        return this.allGameItems;
    }

    /**
     * get all item sets from the game
     */
    getAllGameItemSets(){
        return this.allGameItemSets;
    }

    /**
     * add all items from the game
     * @param items
     */
    addAllGameItems(items){
        this.allGameItems = [];
        return this.allGameItems = items;
    }

    /**
     * add all item sets from the game
     * @param item_sets
     */
    addAllGameItemSets(item_sets){
        this.allGameItemSets = [];
        return this.allGameItemSets = item_sets;
    }
}
module.exports = Game;