//item info



/*
    itemsInInventory:
    {
        1: {
          item_id: 20012000,
          item_name: "El Gringo Sombrero",
          item_type: "head",
          item_image: "https://westzz.innogamescdn.com/images/items/head/wear/gold_rush_head.png?1",
          item_bonuses: {
            1: {
              bonusName: "strength",
              bonusValue: Math.ceil(this.playerInfo.playerLevel * 0.1),
            },
            2: {
              bonusName: "construction",
              bonusValue: Math.ceil(this.playerInfo.playerLevel * 0.60),
            },
            3: {
              bonusName: "swimming",
              bonusValue: Math.ceil(this.playerInfo.playerLevel * 0.60),
            },
          },
        },
    }
 */
/**
 * @param item_id
 * @param item_name
 * @param item_type
 * @param item_bonuses
 * @param item_image
 * @param item_isupgradeable
 * @param item_issellable
 * @param item_min_level
 * @param item_set_id
 * @param item_isweapon
 * @param item_isfirearm
 * @param item_ismelee
 * @param item_isgun
 * @param item_mindmg
 * @param item_maxdmg
 * @param item_sellprice
 * @param item_buyprice
 * @param item_findatjob
 */
itemInfo = {
    item_id: "",
    item_name: "",
    item_type: "",
    item_bonuses: {},
    item_image: "",
    item_isupgradeable: null,
    item_issellable: null,
    item_min_level: null,
    item_set_id: null,
    item_isweapon: null,
    item_isfirearm: null,
    item_ismelee: null,
    item_isgun: null,
    item_mindmg: null,
    item_maxdmg: null,
    item_sellprice: null,
    item_buyprice: null,
    item_findatjob: null
}

module.exports = itemInfo;